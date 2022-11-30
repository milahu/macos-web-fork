import sveltePreprocess from 'svelte-preprocess';

export default {
  preprocess: sveltePreprocess({
    replace: [['__DATE__', new Date().toISOString()]],
/* default true?
    sourceMap: true,
    sourcemap: true,
*/
  }),
};
