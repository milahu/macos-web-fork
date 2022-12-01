import { S as SvelteComponent, i as init, s as safe_not_equal, e as empty, a as insert, g as group_outros, t as transition_out, c as check_outros, b as transition_in, d as detach, h as handle_promise, _ as __vitePreload, u as update_await_block_branch, n as noop, f as create_component, m as mount_component, j as destroy_component, k as svg_element, l as attr, o as append, p as appsConfig, q as element, r as space, v as toggle_class, w as listen, x as run_all, y as component_subscribe, z as activeApp, A as createEventDispatcher, B as set_style, C as action_destroyer, D as elevation, E as is_function, F as create_out_transition, G as isAppBeingDragged, H as appsInFullscreen, I as openApps, J as prefersReducedMotion, K as activeAppZIndex, L as appZIndices, M as theme, N as onMount, O as set_store_value, P as sineInOut, Q as waitFor, R as binding_callbacks } from './index.js';

function e(e,t,n,o){var r,i=null==(r=o)||"number"==typeof r||"boolean"==typeof r?o:n(o),a=t.get(i);return void 0===a&&(a=e.call(this,o),t.set(i,a)),a}function t(e,t,n){var o=Array.prototype.slice.call(arguments,3),r=n(o),i=t.get(r);return void 0===i&&(i=e.apply(this,o),t.set(r,i)),i}function n(n,o){return function(e,t,n,o,r){return n.bind(t,e,o,r)}(n,this,1===n.length?e:t,o.cache.create(),o.serializer)}const o=JSON.stringify;function r(){this.cache=Object.create(null);}r.prototype.has=function(e){return e in this.cache},r.prototype.get=function(e){return this.cache[e]},r.prototype.set=function(e,t){this.cache[e]=t;};var i={create:function(){return new r}};const a=(e,t={})=>{let{bounds:n,axis:o="both",gpuAcceleration:r=!0,applyUserSelectHack:i=!0,disabled:a=!1,ignoreMultitouch:d=!1,grid:h,position:f,cancel:g,handle:y,defaultClass:b="neodrag",defaultClassDragging:w="neodrag-dragging",defaultClassDragged:v="neodrag-dragged",defaultPosition:E={x:0,y:0},onDragStart:A,onDrag:x,onDragEnd:C}=t;const M=new Promise(requestAnimationFrame);let S,H,L=!1,D=0,N=0,R=0,T=0,B=0,q=0,{x:$,y:z}=f?{x:f?.x??0,y:f?.y??0}:E;m($,z,e,r);let X,Y,j,k,O="",P=!!f;const U=document.body.style,W=e.classList,F=(t,n)=>{const o={offsetX:D,offsetY:N,domRect:e.getBoundingClientRect()};e.dispatchEvent(new CustomEvent(t,{detail:o})),n?.(o);};const J=addEventListener;J("touchstart",I,!1),J("touchend",K,!1),J("touchmove",Q,!1),J("mousedown",I,!1),J("mouseup",K,!1),J("mousemove",Q,!1),e.style.touchAction="none";const G=()=>{let t=e.offsetWidth/Y.width;return isNaN(t)&&(t=1),t};function I(t){if(a)return;if(d&&"touchstart"===t.type&&t.touches.length>1)return;if(W.add(b),j=function(e,t){if(!e)return t;if(e instanceof HTMLElement||Array.isArray(e))return e;const n=t.querySelectorAll(e);if(null===n)throw new Error("Selector passed for `handle` option should be child of the element on which the action is applied");return Array.from(n.values())}(y,e),k=function(e,t){if(!e)return;if(e instanceof HTMLElement||Array.isArray(e))return e;const n=t.querySelectorAll(e);if(null===n)throw new Error("Selector passed for `cancel` option should be child of the element on which the action is applied");return Array.from(n.values())}(g,e),S=/(both|x)/.test(o),H=/(both|y)/.test(o),void 0!==n&&(X=function(e,t){if(e instanceof HTMLElement)return e.getBoundingClientRect();if("object"==typeof e){const{top:t=0,left:n=0,right:o=0,bottom:r=0}=e;return {top:t,right:window.innerWidth-o,bottom:window.innerHeight-r,left:n}}if("parent"===e)return t.parentNode.getBoundingClientRect();const n=document.querySelector(e);if(null===n)throw new Error("The selector provided for bound doesn't exists in the document.");return n.getBoundingClientRect()}(n,e)),Y=e.getBoundingClientRect(),l(y)&&l(g)&&y===g)throw new Error("`handle` selector can't be same as `cancel` selector");if(p(k,j))throw new Error("Element being dragged can't be a child of the element on which `cancel` is applied");if((j instanceof HTMLElement?j.contains(t.target):j.some((e=>e.contains(t.target))))&&!p(k,t.target)&&(L=!0),!L)return;i&&(O=U.userSelect,U.userSelect="none"),F("neodrag:start",A);const{clientX:r,clientY:c}=s(t)?t.touches[0]:t,u=G();S&&(R=r-$/u),H&&(T=c-z/u),X&&(B=r-Y.left,q=c-Y.top);}function K(){L&&(W.remove(w),W.add(v),i&&(U.userSelect=O),F("neodrag:end",C),S&&(R=D),S&&(T=N),L=!1);}function Q(t){if(!L)return;W.add(w),t.preventDefault(),Y=e.getBoundingClientRect();const{clientX:n,clientY:o}=s(t)?t.touches[0]:t;let i=n,a=o;const l=G();if(X){const e={left:X.left+B,top:X.top+q,right:X.right+B-Y.width,bottom:X.bottom+q-Y.height};i=c(i,e.left,e.right),a=c(a,e.top,e.bottom);}if(Array.isArray(h)){let[e,t]=h;if(isNaN(+e)||e<0)throw new Error("1st argument of `grid` must be a valid positive number");if(isNaN(+t)||t<0)throw new Error("2nd argument of `grid` must be a valid positive number");let n=i-R,o=a-T;[n,o]=u([e/l,t/l],n,o),i=R+n,a=T+o;}S&&(D=Math.round((i-R)*l)),H&&(N=Math.round((a-T)*l)),$=D,z=N,F("neodrag",x),M.then((()=>m(D,N,e,r)));}return {destroy:()=>{const e=removeEventListener;e("touchstart",I,!1),e("touchend",K,!1),e("touchmove",Q,!1),e("mousedown",I,!1),e("mouseup",K,!1),e("mousemove",Q,!1);},update:t=>{o=t.axis||"both",a=t.disabled??!1,d=t.ignoreMultitouch??!1,y=t.handle,n=t.bounds,g=t.cancel,i=t.applyUserSelectHack??!0,h=t.grid,r=t.gpuAcceleration??!0;const s=W.contains(v);W.remove(b,v),b=t.defaultClass??"neodrag",w=t.defaultClassDragging??"neodrag-dragging",v=t.defaultClassDragged??"neodrag-dragged",W.add(b),s&&W.add(v),P&&($=D=t.position?.x??D,z=N=t.position?.y??N,M.then((()=>m(D,N,e,r))));}}},s=e=>!!e.touches?.length,c=(e,t,n)=>Math.min(Math.max(e,t),n),l=e=>"string"==typeof e,u=(d=([e,t],n,o)=>{const r=(e,t)=>Math.ceil(e/t)*t;return [r(n,e),r(o,t)]},f=h?.cache??i,g=h?.serializer??o,(h?.strategy??n)(d,{cache:f,serializer:g}));var d,h,f,g;function p(e,t){const n=t instanceof HTMLElement?[t]:t;return e instanceof HTMLElement?n.some((t=>e.contains(t))):!!Array.isArray(e)&&e.some((e=>n.some((t=>e.contains(t)))))}function m(e,t,n,o){n.style.transform=o?`translate3d(${+e}px, ${+t}px, 0)`:`translate(${+e}px, ${+t}px)`;}

function randint(lower, upper) {
  if (lower > upper)
    [lower, upper] = [upper, lower];
  return lower + Math.floor((upper - lower) * Math.random());
}

function get_then_context_5(ctx) {
	ctx[8] = ctx[3].default;
}

function get_then_context_4(ctx) {
	ctx[7] = ctx[3].default;
}

function get_then_context_3(ctx) {
	ctx[6] = ctx[3].default;
}

function get_then_context_2(ctx) {
	ctx[5] = ctx[3].default;
}

function get_then_context_1(ctx) {
	ctx[4] = ctx[3].default;
}

function get_then_context(ctx) {
	ctx[2] = ctx[3].default;
}

// (25:0) {:else}
function create_else_block$1(ctx) {
	let await_block_anchor;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block_5,
		then: create_then_block_5,
		catch: create_catch_block_5,
		value: 3,
		blocks: [,,,]
	};

	handle_promise(__vitePreload(() => import('./AppStore.js'),true?["AppStore.js","AppStore.css","index.js","index.css"]:void 0,import.meta.url), info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			update_await_block_branch(info, ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (21:36) 
function create_if_block_4(ctx) {
	let await_block_anchor;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block_4,
		then: create_then_block_4,
		catch: create_catch_block_4,
		value: 3,
		blocks: [,,,]
	};

	handle_promise(__vitePreload(() => import('./PurusProfile.js'),true?["PurusProfile.js","PurusProfile.css","index.js","index.css"]:void 0,import.meta.url), info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		i(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (17:33) 
function create_if_block_3(ctx) {
	let await_block_anchor;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block_3,
		then: create_then_block_3,
		catch: create_catch_block_3,
		value: 3,
		blocks: [,,,]
	};

	handle_promise(__vitePreload(() => import('./WallpaperSelectorApp.js'),true?["WallpaperSelectorApp.js","WallpaperSelectorApp.css","index.js","index.css"]:void 0,import.meta.url), info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		i(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (13:33) 
function create_if_block_2(ctx) {
	let await_block_anchor;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block_2,
		then: create_then_block_2,
		catch: create_catch_block_2,
		value: 3,
		blocks: [,,,]
	};

	handle_promise(__vitePreload(() => import('./Calculator.js'),true?["Calculator.js","Calculator.css","index.js","index.css"]:void 0,import.meta.url), info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		i(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (9:29) 
function create_if_block_1(ctx) {
	let await_block_anchor;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block_1,
		then: create_then_block_1,
		catch: create_catch_block_1,
		value: 3,
		blocks: [,,,]
	};

	handle_promise(__vitePreload(() => import('./VSCode.js'),true?["VSCode.js","VSCode.css","index.js","index.css"]:void 0,import.meta.url), info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			update_await_block_branch(info, ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (5:0) {#if appID === 'calendar'}
function create_if_block$1(ctx) {
	let await_block_anchor;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 3,
		blocks: [,,,]
	};

	handle_promise(__vitePreload(() => import('./Calendar.js'),true?["Calendar.js","Calendar.css","index.js","index.css"]:void 0,import.meta.url), info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		i(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_catch_block_5(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (26:74)      <AppStore {appID}
function create_then_block_5(ctx) {
	get_then_context_5(ctx);
	let appstore;
	let current;
	appstore = new /*AppStore*/ ctx[8]({ props: { appID: /*appID*/ ctx[0] } });

	return {
		c() {
			create_component(appstore.$$.fragment);
		},
		m(target, anchor) {
			mount_component(appstore, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			get_then_context_5(ctx);
			const appstore_changes = {};
			if (dirty & /*appID*/ 1) appstore_changes.appID = /*appID*/ ctx[0];
			appstore.$set(appstore_changes);
		},
		i(local) {
			if (current) return;
			transition_in(appstore.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(appstore.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(appstore, detaching);
		}
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_pending_block_5(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_catch_block_4(ctx) {
	return {
		c: noop,
		m: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (22:86)      <PurusProfile />   {/await}
function create_then_block_4(ctx) {
	get_then_context_4(ctx);
	let purusprofile;
	let current;
	purusprofile = new /*PurusProfile*/ ctx[7]({});

	return {
		c() {
			create_component(purusprofile.$$.fragment);
		},
		m(target, anchor) {
			mount_component(purusprofile, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(purusprofile.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(purusprofile.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(purusprofile, detaching);
		}
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_pending_block_4(ctx) {
	return {
		c: noop,
		m: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_catch_block_3(ctx) {
	return {
		c: noop,
		m: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (18:99)      <WallpaperSelector />   {/await}
function create_then_block_3(ctx) {
	get_then_context_3(ctx);
	let wallpaperselector;
	let current;
	wallpaperselector = new /*WallpaperSelector*/ ctx[6]({});

	return {
		c() {
			create_component(wallpaperselector.$$.fragment);
		},
		m(target, anchor) {
			mount_component(wallpaperselector, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(wallpaperselector.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(wallpaperselector.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(wallpaperselector, detaching);
		}
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_pending_block_3(ctx) {
	return {
		c: noop,
		m: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_catch_block_2(ctx) {
	return {
		c: noop,
		m: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (14:80)      <Calculator />   {/await}
function create_then_block_2(ctx) {
	get_then_context_2(ctx);
	let calculator;
	let current;
	calculator = new /*Calculator*/ ctx[5]({});

	return {
		c() {
			create_component(calculator.$$.fragment);
		},
		m(target, anchor) {
			mount_component(calculator, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(calculator.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(calculator.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(calculator, detaching);
		}
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_pending_block_2(ctx) {
	return {
		c: noop,
		m: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_catch_block_1(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (10:68)      <VSCode {isBeingDragged}
function create_then_block_1(ctx) {
	get_then_context_1(ctx);
	let vscode;
	let current;

	vscode = new /*VSCode*/ ctx[4]({
			props: {
				isBeingDragged: /*isBeingDragged*/ ctx[1]
			}
		});

	return {
		c() {
			create_component(vscode.$$.fragment);
		},
		m(target, anchor) {
			mount_component(vscode, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			get_then_context_1(ctx);
			const vscode_changes = {};
			if (dirty & /*isBeingDragged*/ 2) vscode_changes.isBeingDragged = /*isBeingDragged*/ ctx[1];
			vscode.$set(vscode_changes);
		},
		i(local) {
			if (current) return;
			transition_in(vscode.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(vscode.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(vscode, detaching);
		}
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_pending_block_1(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_catch_block(ctx) {
	return {
		c: noop,
		m: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (6:74)      <Calendar />   {/await}
function create_then_block(ctx) {
	get_then_context(ctx);
	let calendar;
	let current;
	calendar = new /*Calendar*/ ctx[2]({});

	return {
		c() {
			create_component(calendar.$$.fragment);
		},
		m(target, anchor) {
			mount_component(calendar, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(calendar.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(calendar.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(calendar, detaching);
		}
	};
}

// (1:0) <script lang="ts">export let appID; export let isBeingDragged; </script>  {#if appID === 'calendar'}
function create_pending_block(ctx) {
	return {
		c: noop,
		m: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

function create_fragment$7(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;

	const if_block_creators = [
		create_if_block$1,
		create_if_block_1,
		create_if_block_2,
		create_if_block_3,
		create_if_block_4,
		create_else_block$1
	];

	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*appID*/ ctx[0] === 'calendar') return 0;
		if (/*appID*/ ctx[0] === 'vscode') return 1;
		if (/*appID*/ ctx[0] === 'calculator') return 2;
		if (/*appID*/ ctx[0] === 'wallpapers') return 3;
		if (/*appID*/ ctx[0] === 'purus-twitter') return 4;
		return 5;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { appID } = $$props;
	let { isBeingDragged } = $$props;

	$$self.$$set = $$props => {
		if ('appID' in $$props) $$invalidate(0, appID = $$props.appID);
		if ('isBeingDragged' in $$props) $$invalidate(1, isBeingDragged = $$props.isBeingDragged);
	};

	return [appID, isBeingDragged];
}

class AppNexus extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$7, safe_not_equal, { appID: 0, isBeingDragged: 1 });
	}
}

/* src/svelte/components/SVG/traffic-lights/CloseSVG.svelte generated by Svelte v3.53.1 */

function create_fragment$6(ctx) {
	let svg;
	let path;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr(path, "stroke", "#000");
			attr(path, "stroke-width", "1.2");
			attr(path, "stroke-linecap", "round");
			attr(path, "d", "M1.182 5.99L5.99 1.182m0 4.95L1.182 1.323");
			attr(svg, "width", "7");
			attr(svg, "height", "7");
			attr(svg, "fill", "none");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

class CloseSVG extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, null, create_fragment$6, safe_not_equal, {});
	}
}

/* src/svelte/components/SVG/traffic-lights/ExpandSVG.svelte generated by Svelte v3.53.1 */

function create_fragment$5(ctx) {
	let svg;
	let circle;
	let path;

	return {
		c() {
			svg = svg_element("svg");
			circle = svg_element("circle");
			path = svg_element("path");
			attr(circle, "cx", "6.44");
			attr(circle, "cy", "6.44");
			attr(circle, "r", "6.44");
			attr(circle, "fill", "none");
			attr(path, "d", "M6.5,3.34V9.66M9.66,6.5H3.34");
			attr(path, "fill", "none");
			attr(path, "stroke", "black");
			attr(path, "stroke-linecap", "round");
			attr(path, "strok-linejoin", "round");
			attr(path, "stroke-width", "1.5");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "viewBox", "0 0 12.88 12.88");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, circle);
			append(svg, path);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

class ExpandSVG extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, null, create_fragment$5, safe_not_equal, {});
	}
}

/* src/svelte/components/SVG/traffic-lights/StretchSVG.svelte generated by Svelte v3.53.1 */

function create_fragment$4(ctx) {
	let svg;
	let path;
	let circle;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			circle = svg_element("circle");
			attr(path, "d", "M4.871 3.553L9.37 8.098V3.553H4.871zm3.134 5.769L3.506 4.777v4.545h4.499z");
			attr(circle, "cx", 6.438);
			attr(circle, "cy", 6.438);
			attr(circle, "r", 6.438);
			attr(circle, "fill", "none");
			attr(svg, "viewBox", "0 0 13 13");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "fill-rule", "evenodd");
			attr(svg, "clip-rule", "evenodd");
			attr(svg, "stroke-linejoin", "round");
			attr(svg, "stroke-miterlimit", "2");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
			append(svg, circle);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

class StretchSVG extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, null, create_fragment$4, safe_not_equal, {});
	}
}

/* src/svelte/components/SVG/traffic-lights/GreenLight.svelte generated by Svelte v3.53.1 */

function create_else_block(ctx) {
	let stretchsvg;
	let current;
	stretchsvg = new StretchSVG({});

	return {
		c() {
			create_component(stretchsvg.$$.fragment);
		},
		m(target, anchor) {
			mount_component(stretchsvg, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(stretchsvg.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(stretchsvg.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(stretchsvg, detaching);
		}
	};
}

// (6:0) {#if expandable}
function create_if_block(ctx) {
	let expandsvg;
	let current;
	expandsvg = new ExpandSVG({});

	return {
		c() {
			create_component(expandsvg.$$.fragment);
		},
		m(target, anchor) {
			mount_component(expandsvg, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(expandsvg.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(expandsvg.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(expandsvg, detaching);
		}
	};
}

function create_fragment$3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*expandable*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index !== previous_block_index) {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { expandable } = $$props;

	$$self.$$set = $$props => {
		if ('expandable' in $$props) $$invalidate(0, expandable = $$props.expandable);
	};

	return [expandable];
}

class GreenLight extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$3, safe_not_equal, { expandable: 0 });
	}
}

/* src/svelte/components/SVG/traffic-lights/MinimizeSVG.svelte generated by Svelte v3.53.1 */

function create_fragment$2(ctx) {
	let svg;
	let path;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr(path, "stroke", "#000");
			attr(path, "stroke-width", 2);
			attr(path, "stroke-linecap", "round");
			attr(path, "d", "M.61.703h5.8");
			attr(svg, "width", 6);
			attr(svg, "height", 1);
			attr(svg, "fill", "none");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

class MinimizeSVG extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, null, create_fragment$2, safe_not_equal, {});
	}
}

const TrafficLights_svelte_svelte_type_style_lang = '';

/* src/svelte/components/Desktop/Window/TrafficLights.svelte generated by Svelte v3.53.1 */

function create_fragment$1(ctx) {
	let div;
	let button0;
	let closeicon;
	let t0;
	let button1;
	let minimizesvg;
	let t1;
	let button2;
	let greenlight;
	let current;
	let mounted;
	let dispose;
	closeicon = new CloseSVG({});
	minimizesvg = new MinimizeSVG({});

	greenlight = new GreenLight({
			props: {
				expandable: appsConfig[/*appID*/ ctx[0]].expandable
			}
		});

	return {
		c() {
			div = element("div");
			button0 = element("button");
			create_component(closeicon.$$.fragment);
			t0 = space();
			button1 = element("button");
			create_component(minimizesvg.$$.fragment);
			t1 = space();
			button2 = element("button");
			create_component(greenlight.$$.fragment);
			attr(button0, "class", "close-light svelte-ds4wcb");
			attr(button1, "class", "minimize-light svelte-ds4wcb");
			attr(button2, "class", "stretch-light svelte-ds4wcb");
			attr(div, "class", "container svelte-ds4wcb");
			toggle_class(div, "unfocused", /*$activeApp*/ ctx[1] !== /*appID*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button0);
			mount_component(closeicon, button0, null);
			append(div, t0);
			append(div, button1);
			mount_component(minimizesvg, button1, null);
			append(div, t1);
			append(div, button2);
			mount_component(greenlight, button2, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*closeApp*/ ctx[2]),
					listen(button2, "click", /*greenLightAction*/ ctx[3])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			const greenlight_changes = {};
			if (dirty & /*appID*/ 1) greenlight_changes.expandable = appsConfig[/*appID*/ ctx[0]].expandable;
			greenlight.$set(greenlight_changes);

			if (!current || dirty & /*$activeApp, appID*/ 3) {
				toggle_class(div, "unfocused", /*$activeApp*/ ctx[1] !== /*appID*/ ctx[0]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(closeicon.$$.fragment, local);
			transition_in(minimizesvg.$$.fragment, local);
			transition_in(greenlight.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(closeicon.$$.fragment, local);
			transition_out(minimizesvg.$$.fragment, local);
			transition_out(greenlight.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(closeicon);
			destroy_component(minimizesvg);
			destroy_component(greenlight);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let $activeApp;
	component_subscribe($$self, activeApp, $$value => $$invalidate(1, $activeApp = $$value));
	let { appID } = $$props;
	const dispatch = createEventDispatcher();

	function closeApp() {
		dispatch('close-app');
	}

	function greenLightAction() {
		dispatch('maximize-click');
	}

	$$self.$$set = $$props => {
		if ('appID' in $$props) $$invalidate(0, appID = $$props.appID);
	};

	return [appID, $activeApp, closeApp, greenLightAction];
}

class TrafficLights extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { appID: 0 });
	}
}

const Window_svelte_svelte_type_style_lang = '';

/* src/svelte/components/Desktop/Window/Window.svelte generated by Svelte v3.53.1 */

function create_fragment(ctx) {
	let section;
	let div;
	let trafficlights;
	let div_class_value;
	let t;
	let appnexus;
	let draggable_action;
	let section_outro;
	let style_width = `${+/*width*/ ctx[8] / /*remModifier*/ ctx[9]}rem`;
	let style_height = `${+/*height*/ ctx[7] / /*remModifier*/ ctx[9]}rem`;
	let current;
	let mounted;
	let dispose;
	trafficlights = new TrafficLights({ props: { appID: /*appID*/ ctx[0] } });
	trafficlights.$on("maximize-click", /*maximizeApp*/ ctx[13]);
	trafficlights.$on("close-app", /*closeApp*/ ctx[14]);

	appnexus = new AppNexus({
			props: {
				appID: /*appID*/ ctx[0],
				isBeingDragged: /*$isAppBeingDragged*/ ctx[4]
			}
		});

	return {
		c() {
			section = element("section");
			div = element("div");
			create_component(trafficlights.$$.fragment);
			t = space();
			create_component(appnexus.$$.fragment);
			attr(div, "class", div_class_value = "tl-container " + /*appID*/ ctx[0] + " svelte-11ldxfw");
			attr(section, "class", "container svelte-11ldxfw");
			attr(section, "tabindex", "-1");
			toggle_class(section, "dark", /*$theme*/ ctx[6].scheme === 'dark');
			toggle_class(section, "active", /*$activeApp*/ ctx[1] === /*appID*/ ctx[0]);
			set_style(section, "width", style_width);
			set_style(section, "height", style_height);
			set_style(section, "z-index", /*$appZIndices*/ ctx[5][/*appID*/ ctx[0]]);
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, div);
			mount_component(trafficlights, div, null);
			append(section, t);
			mount_component(appnexus, section, null);
			/*section_binding*/ ctx[18](section);
			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(elevation.call(null, div, 'window-traffic-lights')),
					action_destroyer(draggable_action = a.call(null, section, {
						defaultPosition: /*defaultPosition*/ ctx[10],
						handle: '.app-window-drag-handle',
						bounds: {
							bottom: -6000,
							top: 27.2,
							left: -6000,
							right: -6000
						},
						disabled: !/*draggingEnabled*/ ctx[2],
						gpuAcceleration: false,
						onDragStart: /*onAppDragStart*/ ctx[15],
						onDragEnd: /*onAppDragEnd*/ ctx[16]
					})),
					listen(section, "click", /*focusApp*/ ctx[11]),
					listen(section, "keydown", keydown_handler)
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			const trafficlights_changes = {};
			if (dirty & /*appID*/ 1) trafficlights_changes.appID = /*appID*/ ctx[0];
			trafficlights.$set(trafficlights_changes);

			if (!current || dirty & /*appID*/ 1 && div_class_value !== (div_class_value = "tl-container " + /*appID*/ ctx[0] + " svelte-11ldxfw")) {
				attr(div, "class", div_class_value);
			}

			const appnexus_changes = {};
			if (dirty & /*appID*/ 1) appnexus_changes.appID = /*appID*/ ctx[0];
			if (dirty & /*$isAppBeingDragged*/ 16) appnexus_changes.isBeingDragged = /*$isAppBeingDragged*/ ctx[4];
			appnexus.$set(appnexus_changes);

			if (draggable_action && is_function(draggable_action.update) && dirty & /*draggingEnabled*/ 4) draggable_action.update.call(null, {
				defaultPosition: /*defaultPosition*/ ctx[10],
				handle: '.app-window-drag-handle',
				bounds: {
					bottom: -6000,
					top: 27.2,
					left: -6000,
					right: -6000
				},
				disabled: !/*draggingEnabled*/ ctx[2],
				gpuAcceleration: false,
				onDragStart: /*onAppDragStart*/ ctx[15],
				onDragEnd: /*onAppDragEnd*/ ctx[16]
			});

			if (!current || dirty & /*$theme*/ 64) {
				toggle_class(section, "dark", /*$theme*/ ctx[6].scheme === 'dark');
			}

			if (!current || dirty & /*$activeApp, appID*/ 3) {
				toggle_class(section, "active", /*$activeApp*/ ctx[1] === /*appID*/ ctx[0]);
			}

			if (dirty & /*$appZIndices, appID*/ 33) {
				set_style(section, "z-index", /*$appZIndices*/ ctx[5][/*appID*/ ctx[0]]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(trafficlights.$$.fragment, local);
			transition_in(appnexus.$$.fragment, local);
			if (section_outro) section_outro.end(1);
			current = true;
		},
		o(local) {
			transition_out(trafficlights.$$.fragment, local);
			transition_out(appnexus.$$.fragment, local);
			section_outro = create_out_transition(section, /*windowCloseTransition*/ ctx[12], {});
			current = false;
		},
		d(detaching) {
			if (detaching) detach(section);
			destroy_component(trafficlights);
			destroy_component(appnexus);
			/*section_binding*/ ctx[18](null);
			if (detaching && section_outro) section_outro.end();
			mounted = false;
			run_all(dispose);
		}
	};
}

const keydown_handler = () => {
	
};

function instance($$self, $$props, $$invalidate) {
	let $isAppBeingDragged;
	let $appsInFullscreen;
	let $openApps;
	let $prefersReducedMotion;
	let $activeApp;
	let $activeAppZIndex;
	let $appZIndices;
	let $theme;
	component_subscribe($$self, isAppBeingDragged, $$value => $$invalidate(4, $isAppBeingDragged = $$value));
	component_subscribe($$self, appsInFullscreen, $$value => $$invalidate(21, $appsInFullscreen = $$value));
	component_subscribe($$self, openApps, $$value => $$invalidate(22, $openApps = $$value));
	component_subscribe($$self, prefersReducedMotion, $$value => $$invalidate(23, $prefersReducedMotion = $$value));
	component_subscribe($$self, activeApp, $$value => $$invalidate(1, $activeApp = $$value));
	component_subscribe($$self, activeAppZIndex, $$value => $$invalidate(17, $activeAppZIndex = $$value));
	component_subscribe($$self, appZIndices, $$value => $$invalidate(5, $appZIndices = $$value));
	component_subscribe($$self, theme, $$value => $$invalidate(6, $theme = $$value));
	let { appID } = $$props;
	let draggingEnabled = true;
	let isMaximized = false;
	let minimizedTransform;
	let windowEl;
	const { height, width } = appsConfig[appID];
	const remModifier = +height * 1.2 >= window.innerHeight ? 24 : 16;
	const randX = randint(-600, 600);
	const randY = randint(-100, 100);

	let defaultPosition = {
		x: (document.body.clientWidth / 2 + randX) / 2,
		y: (100 + randY) / 2
	};

	function focusApp() {
		set_store_value(activeApp, $activeApp = appID, $activeApp);
	}

	function windowCloseTransition(el, { duration = $prefersReducedMotion ? 0 : 300 } = {}) {
		const existingTransform = getComputedStyle(el).transform;

		return {
			duration,
			easing: sineInOut,
			css: t => `opacity: ${t}; transform: ${existingTransform} scale(${t})`
		};
	}

	async function maximizeApp() {
		if (!$prefersReducedMotion) {
			$$invalidate(3, windowEl.style.transition = 'height 0.3s ease, width 0.3s ease, transform 0.3s ease', windowEl);
		}

		if (!isMaximized) {
			$$invalidate(2, draggingEnabled = false);
			minimizedTransform = windowEl.style.transform;
			$$invalidate(3, windowEl.style.transform = `translate(0px, 0px)`, windowEl);
			$$invalidate(3, windowEl.style.width = `100%`, windowEl);

			// windowEl.style.height = 'calc(100vh - 1.7rem - 5.25rem)';
			$$invalidate(3, windowEl.style.height = 'calc(100vh - 1.7rem)', windowEl);
		} else {
			$$invalidate(2, draggingEnabled = true);
			$$invalidate(3, windowEl.style.transform = minimizedTransform, windowEl);
			$$invalidate(3, windowEl.style.width = `${+width / remModifier}rem`, windowEl);
			$$invalidate(3, windowEl.style.height = `${+height / remModifier}rem`, windowEl);
		}

		isMaximized = !isMaximized;
		set_store_value(appsInFullscreen, $appsInFullscreen[appID] = isMaximized, $appsInFullscreen);
		await waitFor(300);
		if (!$prefersReducedMotion) $$invalidate(3, windowEl.style.transition = '', windowEl);
	}

	function closeApp() {
		set_store_value(openApps, $openApps[appID] = false, $openApps);
		set_store_value(appsInFullscreen, $appsInFullscreen[appID] = false, $appsInFullscreen);
	}

	function onAppDragStart() {
		focusApp();
		set_store_value(isAppBeingDragged, $isAppBeingDragged = true, $isAppBeingDragged);
	}

	function onAppDragEnd() {
		set_store_value(isAppBeingDragged, $isAppBeingDragged = false, $isAppBeingDragged);
	}

	onMount(() => windowEl?.focus());

	function section_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			windowEl = $$value;
			$$invalidate(3, windowEl);
		});
	}

	$$self.$$set = $$props => {
		if ('appID' in $$props) $$invalidate(0, appID = $$props.appID);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$activeApp, appID, $activeAppZIndex*/ 131075) {
			$activeApp === appID && set_store_value(appZIndices, $appZIndices[appID] = $activeAppZIndex, $appZIndices);
		}
	};

	return [
		appID,
		$activeApp,
		draggingEnabled,
		windowEl,
		$isAppBeingDragged,
		$appZIndices,
		$theme,
		height,
		width,
		remModifier,
		defaultPosition,
		focusApp,
		windowCloseTransition,
		maximizeApp,
		closeApp,
		onAppDragStart,
		onAppDragEnd,
		$activeAppZIndex,
		section_binding
	];
}

class Window extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { appID: 0 });
	}
}

export { Window as default };
