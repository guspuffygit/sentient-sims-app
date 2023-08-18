export function debounce(func: () => void, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func();
      timeoutId = null;
    }, delay);
  };
}
