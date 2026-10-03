import { test, expect, vi, beforeEach } from "vitest";

class FakeElement {
  innerHTML = "";
  listeners: Record<string, Array<(event: unknown) => void>> = {};
  styleProps: Record<string, string> = {};
  style = {
    setProperty: (prop: string, value: string) => {
      this.styleProps[prop] = value;
    },
  };

  addEventListener(event: string, callback: (event: unknown) => void) {
    (this.listeners[event] ??= []).push(callback);
  }

  dispatch(event: string, payload?: unknown) {
    (this.listeners[event] ?? []).forEach((callback) => callback(payload));
  }
}

function makeDoc() {
  const els = [new FakeElement(), new FakeElement()];
  return {
    els,
    querySelectorAll: (selector: string): any =>
      selector === ".item" ? els : ([] as FakeElement[]),
  };
}

let doc: ReturnType<typeof makeDoc>;
beforeEach(() => {
  doc = makeDoc();
  (globalThis as any).document = doc;
});

const { $ } = await import("../solution");

test("$ возвращает обёртку с методами on, html и css", () => {
  const api = $(".item");
  expect(typeof api.on).toBe("function");
  expect(typeof api.html).toBe("function");
  expect(typeof api.css).toBe("function");
});

test("html(content) устанавливает содержимое всем найденным элементам", () => {
  $(".item").html("<b>hello</b>");
  expect(doc.els[0].innerHTML).toBe("<b>hello</b>");
  expect(doc.els[1].innerHTML).toBe("<b>hello</b>");
});

test("html() без аргументов возвращает содержимое первого элемента", () => {
  $(".item").html("<p>text</p>");
  expect($(".item").html()).toBe("<p>text</p>");
});

test("on регистрирует обработчик на каждом элементе", () => {
  const handler = vi.fn();
  $(".item").on("click", handler);

  doc.els[0].dispatch("click", { type: "click" });
  expect(handler).toHaveBeenCalledTimes(1);

  doc.els[1].dispatch("click", { type: "click" });
  expect(handler).toHaveBeenCalledTimes(2);
});

test("css устанавливает свойство через element.style", () => {
  $(".item").css("color", "red");
  expect(doc.els[0].styleProps["color"]).toBe("red");
  expect(doc.els[1].styleProps["color"]).toBe("red");
});

test("методы возвращают this — работает цепочка вызовов", () => {
  const api = $(".item");
  expect(api.on("click", () => {})).toBe(api);
  expect(api.html("<i>x</i>")).toBe(api);
  expect(api.css("display", "none")).toBe(api);
});

test("для пустого селектора методы не выбрасывают исключение", () => {
  expect(() => $(".nothing").html("x")).not.toThrow();
  expect(() => $(".nothing").on("click", () => {})).not.toThrow();
  expect(() => $(".nothing").css("color", "red")).not.toThrow();
});
