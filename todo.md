# todo

## vite: disable cache busting

- actual: dist/workbox-ec3cfdf1.js
- expected: dist/workbox.js

workaround in fix-build.sh

## fix shadows in darkmode

expected: shadows become white in darkmode

```css
    &.dark {
      box-shadow: inset 0 0 0 0.9px hsla(var(--system-color-dark-hsl), 0.2),
        0 0 0 1.5px hsla(var(--system-color-light-hsl), 0.5);
    }
```

## rename syle class

rename "container" to "window" or "webtop-window"

## bundler

### browser-vite

https://github.com/divriots/browser-vite

fork of vite which aims at being used in a browser (served by service worker)

### sandpack

webpack for codesandbox

https://github.com/codesandbox/sandpack

## git client

https://github.com/isomorphic-git/isomorphic-git

## vite: keep import export names

actual:

docs/FileManager.js

```js
import { t as theme } from './index.js';
```

docs/index.js

```js
export { theme as t }
```
