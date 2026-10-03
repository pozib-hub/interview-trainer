export function $(selector: string) {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const api = {
    on(event: string, handler: (e: Event) => void) {
      elements.forEach((el) => el.addEventListener(event, handler));
      return api;
    },
    html(content?: string) {
      if (content === undefined) {
        return elements[0]?.innerHTML;
      }
      elements.forEach((el) => (el.innerHTML = content));
      return api;
    },
    css(prop: string, value: string) {
      elements.forEach((el) => el.style.setProperty(prop, value));
      return api;
    },
  };
  return api;
}
