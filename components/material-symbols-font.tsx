import { MaterialSymbolsReveal } from "@/components/material-symbols-reveal";

const MATERIAL_SYMBOLS_CSS =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block";

/**
 * Loads the Material Symbols icon font. Rendered ONLY by the dashboard and
 * auth layouts (moved out of the root layout 2026-10-22) so public marketing
 * pages, which use lucide-react, don't pay for it.
 *
 * React 19 hoists the <link>s into <head>; `precedence` makes the stylesheet
 * a managed resource, inserted after Next's own CSS (same order as before)
 * and awaited on client-side navigation.
 *
 * Reveal: `.material-symbols-outlined` is hidden until the font is loaded
 * (globals.css). The inline script reveals on a full page load; the client
 * component covers client-side navigation from a page without the font
 * (React does not execute inline scripts it inserts on the client).
 */
export function MaterialSymbolsFont() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={MATERIAL_SYMBOLS_CSS} precedence="default" />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var F='24px "Material Symbols Outlined"';function show(){document.documentElement.classList.add('ms-loaded')}if(document.fonts&&document.fonts.load){document.fonts.load(F).then(function(){if(document.fonts.check(F))show()}).catch(function(){});document.fonts.ready.then(function(){if(document.fonts.check(F))show()})}})();`,
        }}
      />
      <MaterialSymbolsReveal />
    </>
  );
}
