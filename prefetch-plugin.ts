import type { HtmlTagDescriptor, Plugin } from 'vite';

export function prefetch(): Plugin {
  return {
    name: 'prefetch',

    enforce: 'post',
    apply: 'build',

    transformIndexHtml: (html, ctx) => {
      const tags = Object.keys(ctx.bundle).map(
        (chunkName) =>
          ({
            injectTo: 'head',
            tag: 'link',
            attrs: {
              rel: 'prefetch',
              // TODO use prefix from viteConfig.base
              href: `./${chunkName}`,
            },
          } as HtmlTagDescriptor),
      );

      return {
        html,
        tags,
      };
    },
  };
}
