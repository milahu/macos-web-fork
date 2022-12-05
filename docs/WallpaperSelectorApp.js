import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, a as space, a1 as text, b as attr, d as set_style, h as insert, j as append, a2 as set_data, n as noop, m as detach, E as destroy_each, o as component_subscribe, l as listen, f as src_url_equal, x as set_store_value } from './node_modules/svelte@3.53.1.js';
import { g as wallpapersConfig, h as wallpaper } from './index.js';
import './node_modules/svelte-local-storage-store@0.3.1_svelte@3.53.1.js';
import './node_modules/feathericon@1.0.2.js';
import './node_modules/popmotion@11.0.5.js';
import './node_modules/style-value-types@5.1.2.js';
import './node_modules/hey-listen@1.0.8.js';
import './node_modules/date-fns@2.29.3.js';

const WallpaperSelectorApp_svelte_svelte_type_style_lang = '';

/* src/svelte/components/apps/WallpaperApp/WallpaperSelectorApp.svelte generated by Svelte v3.53.1 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[8] = list[i][0];
	child_ctx[9] = list[i][1].thumbnail;
	child_ctx[10] = list[i][1].name;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[8] = list[i][0];
	child_ctx[9] = list[i][1].thumbnail;
	child_ctx[10] = list[i][1].name;
	return child_ctx;
}

// (26:8) {#if wallpapersConfig[$wallpaper.id].type !== 'standalone'}
function create_if_block(ctx) {
	let label;
	let input;
	let t;
	let mounted;
	let dispose;

	return {
		c() {
			label = element("label");
			input = element("input");
			t = text("\n            Change dark/light mode as wallpapers change");
			attr(input, "type", "checkbox");
			attr(input, "class", "svelte-h9zue2");
			attr(label, "class", "svelte-h9zue2");
		},
		m(target, anchor) {
			insert(target, label, anchor);
			append(label, input);
			input.checked = /*$wallpaper*/ ctx[0].canControlTheme;
			append(label, t);

			if (!mounted) {
				dispose = listen(input, "change", /*input_change_handler*/ ctx[5]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*$wallpaper*/ 1) {
				input.checked = /*$wallpaper*/ ctx[0].canControlTheme;
			}
		},
		d(detaching) {
			if (detaching) detach(label);
			mounted = false;
			dispose();
		}
	};
}

// (41:8) {#each dynamicWallpapers as [id, { thumbnail, name }
function create_each_block_1(ctx) {
	let div;
	let button;
	let img;
	let img_src_value;
	let t0;
	let p;
	let t1_value = /*name*/ ctx[10] + "";
	let t1;
	let t2;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[6](/*id*/ ctx[8]);
	}

	return {
		c() {
			div = element("div");
			button = element("button");
			img = element("img");
			t0 = space();
			p = element("p");
			t1 = text(t1_value);
			t2 = space();
			if (!src_url_equal(img.src, img_src_value = /*thumbnail*/ ctx[9])) attr(img, "src", img_src_value);
			attr(img, "alt", "MacOS " + /*name*/ ctx[10] + " Wallpapers, dynamic");
			attr(img, "class", "svelte-h9zue2");
			attr(button, "class", "svelte-h9zue2");
			attr(p, "class", "svelte-h9zue2");
			attr(div, "class", "wallpaper-button svelte-h9zue2");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button);
			append(button, img);
			append(div, t0);
			append(div, p);
			append(p, t1);
			append(div, t2);

			if (!mounted) {
				dispose = listen(button, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

// (58:8) {#each standaloneWallpapers as [id, { thumbnail, name }
function create_each_block(ctx) {
	let div;
	let button;
	let img;
	let img_src_value;
	let t0;
	let p;
	let t1_value = /*name*/ ctx[10] + "";
	let t1;
	let t2;
	let mounted;
	let dispose;

	function click_handler_1() {
		return /*click_handler_1*/ ctx[7](/*id*/ ctx[8]);
	}

	return {
		c() {
			div = element("div");
			button = element("button");
			img = element("img");
			t0 = space();
			p = element("p");
			t1 = text(t1_value);
			t2 = space();
			if (!src_url_equal(img.src, img_src_value = /*thumbnail*/ ctx[9])) attr(img, "src", img_src_value);
			attr(img, "alt", "MacOS " + /*name*/ ctx[10] + " Wallpapers, dynamic");
			attr(img, "class", "svelte-h9zue2");
			attr(button, "class", "svelte-h9zue2");
			attr(p, "class", "svelte-h9zue2");
			attr(div, "class", "wallpaper-button svelte-h9zue2");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button);
			append(button, img);
			append(div, t0);
			append(div, p);
			append(p, t1);
			append(div, t2);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_1);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment(ctx) {
	let section4;
	let header;
	let t1;
	let section3;
	let section0;
	let div0;
	let t2;
	let div1;
	let h20;
	let t3_value = wallpapersConfig[/*$wallpaper*/ ctx[0].id].name + "";
	let t3;
	let t4;
	let p;
	let t5_value = wallpapersConfig[/*$wallpaper*/ ctx[0].id].type + "";
	let t5;
	let t6;
	let t7;
	let br0;
	let t8;
	let br1;
	let t9;
	let t10;
	let br2;
	let br3;
	let br4;
	let br5;
	let t11;
	let section1;
	let h21;
	let t13;
	let div2;
	let t14;
	let br6;
	let br7;
	let br8;
	let t15;
	let section2;
	let h22;
	let t17;
	let div3;
	let if_block = wallpapersConfig[/*$wallpaper*/ ctx[0].id].type !== 'standalone' && create_if_block(ctx);
	let each_value_1 = /*dynamicWallpapers*/ ctx[2];
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	let each_value = /*standaloneWallpapers*/ ctx[3];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			section4 = element("section");
			header = element("header");
			header.innerHTML = `<span class="svelte-h9zue2">Wallpapers</span>`;
			t1 = space();
			section3 = element("section");
			section0 = element("section");
			div0 = element("div");
			t2 = space();
			div1 = element("div");
			h20 = element("h2");
			t3 = text(t3_value);
			t4 = space();
			p = element("p");
			t5 = text(t5_value);
			t6 = text(" wallpaper");
			t7 = space();
			br0 = element("br");
			t8 = space();
			br1 = element("br");
			t9 = space();
			if (if_block) if_block.c();
			t10 = space();
			br2 = element("br");
			br3 = element("br");
			br4 = element("br");
			br5 = element("br");
			t11 = space();
			section1 = element("section");
			h21 = element("h2");
			h21.textContent = "Dynamic Wallpapers";
			t13 = space();
			div2 = element("div");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t14 = space();
			br6 = element("br");
			br7 = element("br");
			br8 = element("br");
			t15 = space();
			section2 = element("section");
			h22 = element("h2");
			h22.textContent = "Standalone Wallpapers";
			t17 = space();
			div3 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(header, "class", "titlebar app-window-drag-handle svelte-h9zue2");
			attr(div0, "class", "image svelte-h9zue2");
			set_style(div0, "background-image", /*currentWallpaperThumb*/ ctx[1]);
			attr(h20, "class", "svelte-h9zue2");
			attr(p, "class", "wallpaper-type svelte-h9zue2");
			attr(div1, "class", "info svelte-h9zue2");
			attr(section0, "class", "selected-wallpaper-section svelte-h9zue2");
			attr(h21, "class", "svelte-h9zue2");
			attr(div2, "class", "wallpapers svelte-h9zue2");
			attr(section1, "class", "dynamic-wallpapers svelte-h9zue2");
			attr(h22, "class", "svelte-h9zue2");
			attr(div3, "class", "wallpapers svelte-h9zue2");
			attr(section2, "class", "standalone-wallpapers svelte-h9zue2");
			attr(section3, "class", "main-area svelte-h9zue2");
			attr(section4, "class", "container svelte-h9zue2");
		},
		m(target, anchor) {
			insert(target, section4, anchor);
			append(section4, header);
			append(section4, t1);
			append(section4, section3);
			append(section3, section0);
			append(section0, div0);
			append(section0, t2);
			append(section0, div1);
			append(div1, h20);
			append(h20, t3);
			append(div1, t4);
			append(div1, p);
			append(p, t5);
			append(p, t6);
			append(div1, t7);
			append(div1, br0);
			append(div1, t8);
			append(div1, br1);
			append(div1, t9);
			if (if_block) if_block.m(div1, null);
			append(section3, t10);
			append(section3, br2);
			append(section3, br3);
			append(section3, br4);
			append(section3, br5);
			append(section3, t11);
			append(section3, section1);
			append(section1, h21);
			append(section1, t13);
			append(section1, div2);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div2, null);
			}

			append(section3, t14);
			append(section3, br6);
			append(section3, br7);
			append(section3, br8);
			append(section3, t15);
			append(section3, section2);
			append(section2, h22);
			append(section2, t17);
			append(section2, div3);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div3, null);
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*currentWallpaperThumb*/ 2) {
				set_style(div0, "background-image", /*currentWallpaperThumb*/ ctx[1]);
			}

			if (dirty & /*$wallpaper*/ 1 && t3_value !== (t3_value = wallpapersConfig[/*$wallpaper*/ ctx[0].id].name + "")) set_data(t3, t3_value);
			if (dirty & /*$wallpaper*/ 1 && t5_value !== (t5_value = wallpapersConfig[/*$wallpaper*/ ctx[0].id].type + "")) set_data(t5, t5_value);

			if (wallpapersConfig[/*$wallpaper*/ ctx[0].id].type !== 'standalone') {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(div1, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*dynamicWallpapers, changeWallpaper*/ 20) {
				each_value_1 = /*dynamicWallpapers*/ ctx[2];
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_1(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div2, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_1.length;
			}

			if (dirty & /*standaloneWallpapers, changeWallpaper*/ 24) {
				each_value = /*standaloneWallpapers*/ ctx[3];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div3, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(section4);
			if (if_block) if_block.d();
			destroy_each(each_blocks_1, detaching);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let currentWallpaperThumb;
	let $wallpaper;
	component_subscribe($$self, wallpaper, $$value => $$invalidate(0, $wallpaper = $$value));
	const dynamicWallpapers = Object.entries(wallpapersConfig).filter(([,{ type }]) => type === 'dynamic');
	const standaloneWallpapers = Object.entries(wallpapersConfig).filter(([,{ type }]) => type === 'standalone');

	function changeWallpaper(wallpaperName) {
		set_store_value(wallpaper, $wallpaper.id = wallpaperName, $wallpaper);
	}

	function input_change_handler() {
		$wallpaper.canControlTheme = this.checked;
		wallpaper.set($wallpaper);
	}

	const click_handler = id => changeWallpaper(id);
	const click_handler_1 = id => changeWallpaper(id);

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$wallpaper*/ 1) {
			$$invalidate(1, currentWallpaperThumb = `url(${wallpapersConfig[$wallpaper.id].thumbnail})`);
		}
	};

	return [
		$wallpaper,
		currentWallpaperThumb,
		dynamicWallpapers,
		standaloneWallpapers,
		changeWallpaper,
		input_change_handler,
		click_handler,
		click_handler_1
	];
}

class WallpaperSelectorApp extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

export { WallpaperSelectorApp as default };
