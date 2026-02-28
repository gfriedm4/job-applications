import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  const storage = window.localStorage;
  if (!storage || typeof storage.clear !== "function") {
    const store = new Map<string, string>();
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      }
    };

    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      configurable: true
    });
  }

  if (typeof URL.createObjectURL !== "function") {
    URL.createObjectURL = () => "blob:mock-url";
  }

  if (typeof URL.revokeObjectURL !== "function") {
    URL.revokeObjectURL = () => undefined;
  }
}
