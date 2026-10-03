export function $(selector: string) {
  const elements = document.querySelectorAll<HTMLElement>(selector);

  return {
    html(content?: string) {
      if (!content) {
        return elements[0]?.innerHTML;
      }
      elements.forEach((element) => {
        element.innerHTML = content;
      });

      return this;
    },

    on(event: keyof HTMLElementEventMap, callback: (event: Event) => void) {
      elements.forEach((element) => {
        element.addEventListener(event, callback);
      });

      return this;
    },

    css(property: string, value: string) {
      elements.forEach((element) => {
        // element.style[property] = value;
        element.style.setProperty(property, value);
      });

      return this;
    },
  };
}