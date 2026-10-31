// Минимальный OpenAI-compatible клиент.
// Нативный fetch (Node 22), без SDK.
// Поддержка: DeepSeek, OpenAI, OpenRouter, Groq и др.

const DEFAULTS = {
  baseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com/v1",
  model: process.env.LLM_MODEL || "deepseek-chat",
  apiKey:
    process.env.LLM_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "",
  maxRetries: Number(process.env.LLM_MAX_RETRIES || "2"),
  timeoutMs: Number(process.env.LLM_TIMEOUT_MS || "90000"),
};

export class LLMError extends Error {
  constructor(message, detail) {
    super(message);
    this.detail = detail;
  }
}

/**
 * Вызов LLM с массивом сообщений (поддержка retry с обратной связью).
 *
 * @param {object} opts
 * @param {Array<{role: string, content: string}>} opts.messages
 * @returns {Promise<Record<string, unknown>>} распарсенный JSON
 */
export async function callLLM({ messages }) {
  const { baseUrl, model, apiKey, maxRetries, timeoutMs } = DEFAULTS;
  if (!apiKey) {
    throw new Error(
      "LLM API key not задан. Определи LLM_API_KEY (или DEEPSEEK_API_KEY / OPENAI_API_KEY).",
    );
  }

  const body = {
    model,
    messages,
    temperature: 0.2,
    response_format: { type: "json_object" },
  };

  const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";

  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`LLM transient error: ${res.status} ${res.statusText}`);
        await sleep(1500 * (attempt + 1));
        continue;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new LLMError(
          `LLM API error: ${res.status} ${res.statusText}`,
          text.slice(0, 1000),
        );
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new LLMError("LLM вернул пустой контент", JSON.stringify(data).slice(0, 500));
      }
      return { task: parseJsonContent(content), rawContent: content };
    } catch (e) {
      if (e instanceof LLMError) throw e;
      lastErr = e;
      if (attempt < maxRetries) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastErr || new Error("LLM call failed after retries");
}

/**
 * Парсинг ответа модели в JSON.
 * Толерантен к fenced code blocks и prose вокруг JSON.
 *
 * Важно: внутри JSON-строк могут быть ```-блоки (код в ответах на вопросы),
 * поэтому regex-извлечение фенсов применяем только после неудачного
 * прямого парсинга — иначе вырежется содержимое JSON-строк.
 */
export function parseJsonContent(content) {
  let txt = content.trim();

  // Быстрый путь: контент уже валидный JSON (обычный случай с json_object)
  try {
    return JSON.parse(txt);
  } catch {}

  // Fenced: срезаем первую строку ```/```json и завершающий ```
  if (txt.startsWith("```")) {
    const firstNl = txt.indexOf("\n");
    if (firstNl !== -1) {
      let inner = txt.slice(firstNl + 1);
      const lastFence = inner.lastIndexOf("```");
      if (lastFence !== -1) inner = inner.slice(0, lastFence);
      inner = inner.trim();
      try {
        return JSON.parse(inner);
      } catch {}
    }
  }

  // Prose вокруг JSON: вырезаем внешние фигурные скобки
  const start = txt.indexOf("{");
  const end = txt.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(txt.slice(start, end + 1));
  }

  throw new LLMError("LLM вернул невалидный JSON: нет JSON-объекта в ответе", txt.slice(0, 2000));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
