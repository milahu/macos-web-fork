import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, a as space, b as attr, f as src_url_equal, d as set_style, h as insert, j as append, n as noop, m as detach, o as component_subscribe, p as spring, a0 as onMount, x as set_store_value } from './node_modules/svelte@3.53.1.js';
import { p as prefersReducedMotion, w as waitFor } from './index.js';
import './node_modules/svelte-local-storage-store@0.3.1_svelte@3.53.1.js';
import './node_modules/feathericon@1.0.2.js';
import './node_modules/popmotion@11.0.5.js';
import './node_modules/style-value-types@5.1.2.js';
import './node_modules/hey-listen@1.0.8.js';
import './node_modules/date-fns@2.29.3.js';

const AppStore_svelte_svelte_type_style_lang = '';

/* src/svelte/components/apps/AppStore/AppStore.svelte generated by Svelte v3.53.1 */

function create_fragment(ctx) {
	let section1;
	let header;
	let t0;
	let section0;
	let img0;
	let img0_src_value;
	let t1;
	let br;
	let t2;
	let h1;

	return {
		c() {
			section1 = element("section");
			header = element("header");
			t0 = space();
			section0 = element("section");
			img0 = element("img");
			t1 = space();
			br = element("br");
			t2 = space();
			h1 = element("h1");
			h1.innerHTML = `Nothing here yet <img style="height: 1em; width: auto; transform: translateY(0.1em);" src="/emojis/wink.png" alt="Wink Emoji" class="svelte-otd61t"/>`;
			attr(header, "class", "titlebar app-window-drag-handle svelte-otd61t");
			if (!src_url_equal(img0.src, img0_src_value = "/app-icons/" + /*appID*/ ctx[0] + "/256.webp")) attr(img0, "src", img0_src_value);
			attr(img0, "alt", "Placeholder App");
			attr(img0, "class", "svelte-otd61t");
			set_style(img0, "transform", /*imageTransform*/ ctx[1]);
			set_style(h1, "display", `flex`);
			set_style(h1, "align-items", `center`);
			set_style(h1, "gap", `0.5rem`);
			attr(section0, "class", "main-area svelte-otd61t");
			attr(section1, "class", "container svelte-otd61t");
		},
		m(target, anchor) {
			insert(target, section1, anchor);
			append(section1, header);
			append(section1, t0);
			append(section1, section0);
			append(section0, img0);
			append(section0, t1);
			append(section0, br);
			append(section0, t2);
			append(section0, h1);
		},
		p(ctx, [dirty]) {
			if (dirty & /*appID*/ 1 && !src_url_equal(img0.src, img0_src_value = "/app-icons/" + /*appID*/ ctx[0] + "/256.webp")) {
				attr(img0, "src", img0_src_value);
			}

			if (dirty & /*imageTransform*/ 2) {
				set_style(img0, "transform", /*imageTransform*/ ctx[1]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(section1);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let imageTransform;
	let $motionVal;
	let $prefersReducedMotion;
	component_subscribe($$self, prefersReducedMotion, $$value => $$invalidate(4, $prefersReducedMotion = $$value));
	let { appID } = $$props;
	const motionVal = spring(0, { damping: 0.28, stiffness: 0.1 });
	component_subscribe($$self, motionVal, value => $$invalidate(3, $motionVal = value));

	onMount(async () => {
		await waitFor(100);
		set_store_value(motionVal, $motionVal = 1, $motionVal);
	});

	$$self.$$set = $$props => {
		if ('appID' in $$props) $$invalidate(0, appID = $$props.appID);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$prefersReducedMotion, $motionVal*/ 24) {
			$$invalidate(1, imageTransform = !$prefersReducedMotion
			? `rotate(${180 * ($motionVal + 1)}deg) scale(${$motionVal}) translateZ(0px)`
			: 'initial');
		}
	};

	return [appID, imageTransform, motionVal, $motionVal, $prefersReducedMotion];
}

class AppStore extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { appID: 0 });
	}
}

export { AppStore as default };
