
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Минимальные структурные типы Web Speech API ──────────────────────────

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/**
 * Распознавание речи (Web Speech API, ru-RU).
 *
 * Пока listening=true, слушает непрерывно: финальные куски транскрипта
 * передаются в onFinalChunk, промежуточный текст — в interim.
 * Chrome сам останавливает сессию по тишине — перезапускаем, пока
 * пользователь не нажал «стоп».
 */
export function useSpeechRecognition(onFinalChunk: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState("");

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);
  const onFinalRef = useRef(onFinalChunk);
  onFinalRef.current = onFinalChunk;

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (Ctor) setSupported(true);
  }, []);

  const ensureRecognition = useCallback((): SpeechRecognitionLike | null => {
    if (recRef.current) return recRef.current;

    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return null;

    const rec = new Ctor();
    rec.lang = "ru-RU";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: SpeechRecognitionEventLike) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          const trimmed = transcript.trim();
          if (trimmed) onFinalRef.current(trimmed);
        } else {
          interimText += transcript;
        }
      }
      setInterim(interimText);
    };

    rec.onend = () => {
      // Chrome останавливает по тишине — перезапускаем, пока идёт запись
      if (shouldListenRef.current) {
        try {
          rec.start();
        } catch {
          // start может бросить, если уже запущен — игнорируем
        }
      }
    };

    rec.onerror = (e: { error?: string }) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        shouldListenRef.current = false;
        setListening(false);
        setMicError("Нет доступа к микрофону. Разрешите доступ или ответьте текстом.");
      }
      // no-speech / aborted / network — обрабатывает onend/перезапуск
    };

    recRef.current = rec;
    return rec;
  }, []);

  const start = useCallback(() => {
    setMicError("");
    setInterim("");
    const rec = ensureRecognition();
    if (!rec) return;
    shouldListenRef.current = true;
    try {
      rec.start();
      setListening(true);
    } catch {
      // Уже запущено
      setListening(true);
    }
  }, [ensureRecognition]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    setListening(false);
    setInterim("");
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  // Останавливаем запись при размонтировании
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      try {
        recRef.current?.stop();
      } catch {}
    };
  }, []);

  return { supported, listening, interim, micError, start, stop };
}
