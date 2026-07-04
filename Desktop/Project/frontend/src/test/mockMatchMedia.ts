/**
 * Simulates a viewport width for MUI's `useMediaQuery` in jsdom, which has
 * no real viewport and no CSS layout engine. Parses min-width/max-width out
 * of whatever query string MUI's breakpoint helpers generate and evaluates
 * it against `widthPx` — works for `.up()`, `.down()`, and `.between()`
 * without hardcoding their exact generated query text.
 *
 * The global `window.matchMedia` stub in test/setup.ts always returns
 * `matches: false`, which is correct as a safe default but can't express
 * "the viewport is currently narrow" — this override is for tests that
 * specifically need to simulate a breakpoint tier.
 */
export function mockMatchMedia(widthPx: number): () => void {
  const original = window.matchMedia;

  window.matchMedia = ((query: string) => {
    const min = query.match(/min-width:\s*([\d.]+)px/)?.[1];
    const max = query.match(/max-width:\s*([\d.]+)px/)?.[1];
    const matches =
      widthPx >= (min ? parseFloat(min) : -Infinity) && widthPx <= (max ? parseFloat(max) : Infinity);

    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  }) as typeof window.matchMedia;

  return () => {
    window.matchMedia = original;
  };
}
