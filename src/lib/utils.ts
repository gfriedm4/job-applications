export const nowIso = (): string => new Date().toISOString();

export const todayDate = (): string => nowIso().slice(0, 10);

export const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const debounce = <TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs: number
): ((...args: TArgs) => void) => {
  let timeout: number | undefined;

  return (...args: TArgs) => {
    if (timeout) {
      window.clearTimeout(timeout);
    }

    timeout = window.setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
};

export const daysBetween = (fromIso: string, toIso: string): number => {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return Math.max(0, Math.floor((to - from) / 86_400_000));
};
