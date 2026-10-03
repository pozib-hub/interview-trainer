type Styles = Record<string, string>;

function classNames(...args: (string | undefined | null | boolean | Record<string, boolean>)[]): string {
  const classes: string[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === "string") {
      classes.push(arg);
    } else if (typeof arg === "object") {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.join(" ");
}

classNames.bind = function (styles: Styles) {
  return (...args: Parameters<typeof classNames>) => {
    const mapped: Parameters<typeof classNames> = [];
    for (const arg of args) {
      if (typeof arg === "string") {
        mapped.push(styles[arg] || arg);
      } else if (typeof arg === "object") {
        const mappedObj: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(arg as Record<string, boolean>)) {
          if (value) mappedObj[styles[key] || key] = true;
        }
        mapped.push(mappedObj);
      } else {
        mapped.push(arg);
      }
    }
    return classNames(...mapped);
  };
};

export default classNames;
