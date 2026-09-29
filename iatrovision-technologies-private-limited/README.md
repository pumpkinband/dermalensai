# IatroVision company page

This directory is self-contained and served by GitHub Pages at
`/iatrovision-technologies-private-limited/`. Requests without the trailing slash
redirect to the directory index. No other page imports its styles or scripts.

The provided React/Three.js dotted surface is adapted to the existing static HTML
site. There is no React, shadcn, Tailwind or theme-provider requirement. The page uses
the requested matte-black, charcoal, graphite, silver, platinum and steel palette
regardless of the visitor's system color scheme. Adding a React app or a shared components/ui
folder would change the site's architecture unnecessarily for this one page.

`index.html` contains the company content, scoped styles and English/Chinese
dictionary. `?lang=zh` opens Simplified Chinese; `?lang=en` forces English. The
selection is saved with a page-specific storage key when storage is available.

`dotted-surface.js` retains the supplied perspective point grid and sine waves.
One fixed canvas sits behind the entire page, including every section and the footer.
Translucent section surfaces keep the dots visible; the pause control stays available
at the bottom of the viewport while scrolling. The logo is displayed in monochrome
using CSS, preserving the original image files.
The adaptation adds container resizing, a capped pixel ratio, circular particles,
frame-independent timing, pause/resume, reduced motion, offscreen/hidden-page
suspension, WebGL fallback and resource cleanup. The compiled bundle is checked
in so GitHub Pages does not need a build step or a third-party CDN.

To rebuild after editing the animation, run in this directory:

```sh
npm install
npm run build
```

Publish this directory only. The homepage, pitch deck, existing policies, CNAME
and site-wide navigation are intentionally outside this change.
