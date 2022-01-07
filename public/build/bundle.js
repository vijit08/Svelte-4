
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\UI\Nav.svelte generated by Svelte v3.44.2 */

    const file$7 = "src\\UI\\Nav.svelte";

    function create_fragment$7(ctx) {
    	let link;
    	let t0;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div1;
    	let h1;
    	let t2;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t2 = text(/*Heading*/ ctx[0]);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file$7, 4, 0, 48);
    			if (!src_url_equal(img.src, img_src_value = "/images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "height", "38rem");
    			attr_dev(img, "width", "90vw");
    			add_location(img, file$7, 7, 4, 148);
    			attr_dev(div0, "class", "img");
    			add_location(div0, file$7, 6, 2, 125);
    			add_location(h1, file$7, 10, 4, 303);
    			attr_dev(div1, "class", "main-heading pos-fixed");
    			attr_dev(div1, "tabindex", "0");
    			attr_dev(div1, "aria-label", /*Heading*/ ctx[0]);
    			add_location(div1, file$7, 9, 2, 227);
    			attr_dev(div2, "class", "nav-bar pos-fixed");
    			add_location(div2, file$7, 5, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Heading*/ 1) set_data_dev(t2, /*Heading*/ ctx[0]);

    			if (dirty & /*Heading*/ 1) {
    				attr_dev(div1, "aria-label", /*Heading*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	let { Heading } = $$props;
    	const writable_props = ['Heading'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('Heading' in $$props) $$invalidate(0, Heading = $$props.Heading);
    	};

    	$$self.$capture_state = () => ({ Heading });

    	$$self.$inject_state = $$props => {
    		if ('Heading' in $$props) $$invalidate(0, Heading = $$props.Heading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Heading];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { Heading: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*Heading*/ ctx[0] === undefined && !('Heading' in props)) {
    			console.warn("<Nav> was created without expected prop 'Heading'");
    		}
    	}

    	get Heading() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Heading(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\UI\Button.svelte generated by Svelte v3.44.2 */

    const file$6 = "src\\UI\\Button.svelte";

    // (17:0) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*caption*/ ctx[1]);
    			attr_dev(button, "class", button_class_value = "" + (/*mode*/ ctx[3] + " " + /*color*/ ctx[4] + " " + /*style*/ ctx[5] + " " + /*margin*/ ctx[9]));
    			attr_dev(button, "type", /*type*/ ctx[0]);
    			attr_dev(button, "id", /*id*/ ctx[7]);
    			attr_dev(button, "name", /*name*/ ctx[8]);
    			button.disabled = /*disabled*/ ctx[6];
    			attr_dev(button, "aria-label", /*caption*/ ctx[1]);
    			attr_dev(button, "tabindex", "0");
    			add_location(button, file$6, 17, 2, 399);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*caption*/ 2) set_data_dev(t, /*caption*/ ctx[1]);

    			if (dirty & /*mode, color, style, margin*/ 568 && button_class_value !== (button_class_value = "" + (/*mode*/ ctx[3] + " " + /*color*/ ctx[4] + " " + /*style*/ ctx[5] + " " + /*margin*/ ctx[9]))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*type*/ 1) {
    				attr_dev(button, "type", /*type*/ ctx[0]);
    			}

    			if (dirty & /*id*/ 128) {
    				attr_dev(button, "id", /*id*/ ctx[7]);
    			}

    			if (dirty & /*name*/ 256) {
    				attr_dev(button, "name", /*name*/ ctx[8]);
    			}

    			if (dirty & /*disabled*/ 64) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (dirty & /*caption*/ 2) {
    				attr_dev(button, "aria-label", /*caption*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(17:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {#if href}
    function create_if_block$5(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*caption*/ ctx[1]);
    			attr_dev(a, "class", "link");
    			attr_dev(a, "href", /*href*/ ctx[2]);
    			add_location(a, file$6, 15, 2, 350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*caption*/ 2) set_data_dev(t, /*caption*/ ctx[1]);

    			if (dirty & /*href*/ 4) {
    				attr_dev(a, "href", /*href*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(15:0) {#if href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let link;
    	let t;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[2]) return create_if_block$5;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file$6, 13, 0, 294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	let { type = "button" } = $$props;
    	let { caption } = $$props;
    	let { href = null } = $$props;
    	let { mode = null } = $$props;
    	let { color = null } = $$props;
    	let { style = null } = $$props;
    	let { disabled = false } = $$props;
    	let { id = null } = $$props;
    	let { name = null } = $$props;
    	let { margin = null } = $$props;

    	const writable_props = [
    		'type',
    		'caption',
    		'href',
    		'mode',
    		'color',
    		'style',
    		'disabled',
    		'id',
    		'name',
    		'margin'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('caption' in $$props) $$invalidate(1, caption = $$props.caption);
    		if ('href' in $$props) $$invalidate(2, href = $$props.href);
    		if ('mode' in $$props) $$invalidate(3, mode = $$props.mode);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('style' in $$props) $$invalidate(5, style = $$props.style);
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ('id' in $$props) $$invalidate(7, id = $$props.id);
    		if ('name' in $$props) $$invalidate(8, name = $$props.name);
    		if ('margin' in $$props) $$invalidate(9, margin = $$props.margin);
    	};

    	$$self.$capture_state = () => ({
    		type,
    		caption,
    		href,
    		mode,
    		color,
    		style,
    		disabled,
    		id,
    		name,
    		margin
    	});

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('caption' in $$props) $$invalidate(1, caption = $$props.caption);
    		if ('href' in $$props) $$invalidate(2, href = $$props.href);
    		if ('mode' in $$props) $$invalidate(3, mode = $$props.mode);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('style' in $$props) $$invalidate(5, style = $$props.style);
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ('id' in $$props) $$invalidate(7, id = $$props.id);
    		if ('name' in $$props) $$invalidate(8, name = $$props.name);
    		if ('margin' in $$props) $$invalidate(9, margin = $$props.margin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		type,
    		caption,
    		href,
    		mode,
    		color,
    		style,
    		disabled,
    		id,
    		name,
    		margin,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			type: 0,
    			caption: 1,
    			href: 2,
    			mode: 3,
    			color: 4,
    			style: 5,
    			disabled: 6,
    			id: 7,
    			name: 8,
    			margin: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*caption*/ ctx[1] === undefined && !('caption' in props)) {
    			console.warn("<Button> was created without expected prop 'caption'");
    		}
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get caption() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set caption(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mode() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const allques = writable([]);
    const attempted = writable([]);
    const unattempted = writable([]);
    const correctans = writable([]);
    const current = writable(0);
    const counter = writable(0);
    const currentcorrect = writable([]);
    const allincorrect = writable([]);
    const currentitem = writable(0);
    const selectedanswer = writable([0]);
    const disable1 = writable(false);
    const disable2 = writable(true);
    const rev = writable(false);
    const startpage = writable(true);
    const isconfirm = writable(false);
    const list = writable(false);
    const correctques = writable([]);
    const timetaken = writable(0);
    const isopen = writable(false);
    const question = writable([]);

    async function fetchUserData(data, set) {
      fetch("main.json")
        .then((response) => response.json())
        .then((data) => {
          question.set(data);
          //console.log(question);
        });
    }

    fetchUserData();

    /* src\UI\EndTestModal.svelte generated by Svelte v3.44.2 */
    const file$5 = "src\\UI\\EndTestModal.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});

    // (76:24)         
    function fallback_block(ctx) {
    	let div0;
    	let button0;
    	let t;
    	let div1;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				type: "button",
    				style: "button",
    				id: "close",
    				name: "Close",
    				caption: "Close"
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*closeModal*/ ctx[2]);

    	button1 = new Button({
    			props: {
    				type: "button",
    				style: "button",
    				id: "confirm",
    				name: "Confirm",
    				caption: "Confirm"
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*confirmModal*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(button1.$$.fragment);
    			attr_dev(div0, "class", "btn-primary");
    			add_location(div0, file$5, 76, 6, 2058);
    			attr_dev(div1, "class", "btn-primary");
    			add_location(div1, file$5, 79, 6, 2215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(button0, div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(button1, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(button0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(76:24)         ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let link;
    	let t0;
    	let div0;
    	let t1;
    	let div2;
    	let h20;
    	let t2;
    	let t3;
    	let t4;
    	let h21;
    	let t5;
    	let t6;
    	let t7;
    	let h22;
    	let t9;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	const footer_slot_template = /*#slots*/ ctx[6].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[5], get_footer_slot_context);
    	const footer_slot_or_fallback = footer_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			t2 = text("Attempted:");
    			t3 = text(/*final_attempt*/ ctx[1]);
    			t4 = space();
    			h21 = element("h2");
    			t5 = text("UnAttempted:");
    			t6 = text(/*final_unattempt*/ ctx[0]);
    			t7 = space();
    			h22 = element("h2");
    			h22.textContent = "Do You Want To End Test?";
    			t9 = space();
    			div1 = element("div");
    			if (footer_slot_or_fallback) footer_slot_or_fallback.c();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file$5, 68, 0, 1649);
    			attr_dev(div0, "class", "modal-backdrop pos-fixed");
    			add_location(div0, file$5, 69, 0, 1693);
    			attr_dev(h20, "class", "heading");
    			attr_dev(h20, "tabindex", "0");
    			add_location(h20, file$5, 71, 2, 1790);
    			attr_dev(h21, "class", "heading");
    			attr_dev(h21, "tabindex", "0");
    			add_location(h21, file$5, 72, 2, 1857);
    			attr_dev(h22, "class", "heading");
    			attr_dev(h22, "tabindex", "0");
    			add_location(h22, file$5, 73, 2, 1928);
    			attr_dev(div1, "class", "footer pos-fixed");
    			add_location(div1, file$5, 74, 2, 1994);
    			attr_dev(div2, "class", "modal pos-fixed");
    			add_location(div2, file$5, 70, 0, 1757);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h20);
    			append_dev(h20, t2);
    			append_dev(h20, t3);
    			append_dev(div2, t4);
    			append_dev(div2, h21);
    			append_dev(h21, t5);
    			append_dev(h21, t6);
    			append_dev(div2, t7);
    			append_dev(div2, h22);
    			append_dev(div2, t9);
    			append_dev(div2, div1);

    			if (footer_slot_or_fallback) {
    				footer_slot_or_fallback.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*closeModal*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*final_attempt*/ 2) set_data_dev(t3, /*final_attempt*/ ctx[1]);
    			if (!current || dirty & /*final_unattempt*/ 1) set_data_dev(t6, /*final_unattempt*/ ctx[0]);

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						footer_slot,
    						footer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[5], dirty, get_footer_slot_changes),
    						get_footer_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (footer_slot_or_fallback) footer_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let final_attempt;
    	let final_unattempt;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EndTestModal', slots, ['footer']);
    	let Raw_Arr = [];
    	let count = 0;
    	var Raw_Attempt = [];
    	var Ques_Str = [];
    	var Raw_Unattempted = [];
    	var Current_Correct = [];
    	const dispatch = createEventDispatcher();

    	allques.subscribe(its => {
    		Ques_Str = [...Ques_Str, ...its];
    	});

    	question.subscribe(items => {
    		Raw_Arr = items;
    	});

    	attempted.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		Raw_Attempt = [...Raw_Attempt, ...t];
    		$$invalidate(4, count = t.length);
    	});

    	for (let i of Raw_Attempt) {
    		let p = Ques_Str.indexOf(i);
    		delete Ques_Str[p];
    	}

    	for (let b of Ques_Str) {
    		if (b != undefined) {
    			Raw_Unattempted.push(b);
    		}
    	}

    	unattempted.update(its => {
    		return [...its, ...Raw_Unattempted];
    	});

    	currentcorrect.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		Current_Correct = [...Current_Correct, ...t];
    	});

    	function closeModal() {
    		dispatch("cancel");
    	}

    	function confirmModal() {
    		dispatch("confirm");
    		current.set(0);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EndTestModal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		attempted,
    		unattempted,
    		Button,
    		question,
    		allques,
    		currentcorrect,
    		current,
    		Raw_Arr,
    		count,
    		Raw_Attempt,
    		Ques_Str,
    		Raw_Unattempted,
    		Current_Correct,
    		dispatch,
    		closeModal,
    		confirmModal,
    		final_unattempt,
    		final_attempt
    	});

    	$$self.$inject_state = $$props => {
    		if ('Raw_Arr' in $$props) Raw_Arr = $$props.Raw_Arr;
    		if ('count' in $$props) $$invalidate(4, count = $$props.count);
    		if ('Raw_Attempt' in $$props) Raw_Attempt = $$props.Raw_Attempt;
    		if ('Ques_Str' in $$props) Ques_Str = $$props.Ques_Str;
    		if ('Raw_Unattempted' in $$props) $$invalidate(11, Raw_Unattempted = $$props.Raw_Unattempted);
    		if ('Current_Correct' in $$props) Current_Correct = $$props.Current_Correct;
    		if ('final_unattempt' in $$props) $$invalidate(0, final_unattempt = $$props.final_unattempt);
    		if ('final_attempt' in $$props) $$invalidate(1, final_attempt = $$props.final_attempt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*count*/ 16) {
    			$$invalidate(1, final_attempt = count);
    		}
    	};

    	$$invalidate(0, final_unattempt = Raw_Unattempted.length);

    	return [
    		final_unattempt,
    		final_attempt,
    		closeModal,
    		confirmModal,
    		count,
    		$$scope,
    		slots
    	];
    }

    class EndTestModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EndTestModal",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\UI\Footer.svelte generated by Svelte v3.44.2 */
    const file$4 = "src\\UI\\Footer.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[34] = i;
    	return child_ctx;
    }

    // (186:4) {#if i == $currentitem}
    function create_if_block$4(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*i*/ ctx[31] + 1 + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = JSON.parse(/*dataItem*/ ctx[29].content_text).question + "";
    	let t3;
    	let t4;
    	let div3;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t5;
    	let footer;
    	let span;
    	let div4;
    	let t6;
    	let t7;
    	let t8_value = /*seconds*/ ctx[0].toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "";
    	let t8;
    	let t9;
    	let button0;
    	let t10;
    	let button1;
    	let t11;
    	let div5;
    	let b;
    	let t12_value = /*i*/ ctx[31] + 1 + "";
    	let t12;
    	let t13;
    	let t14;
    	let button2;
    	let t15;
    	let button3;
    	let t16;
    	let t17;
    	let current;
    	let each_value_1 = JSON.parse(/*dataItem*/ ctx[29].content_text).answers;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*ans*/ ctx[32];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$3, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$3(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$3(key, child_ctx));
    	}

    	button0 = new Button({
    			props: {
    				style: "button",
    				margin: "btn-bottom",
    				type: "button",
    				id: "list",
    				name: "List-btn",
    				caption: "List"
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*lis*/ ctx[13]);

    	button1 = new Button({
    			props: {
    				style: "button",
    				margin: "btn-bottom",
    				type: "button",
    				id: "prev",
    				name: "Prev-btn",
    				caption: "Previous",
    				disabled: /*$disable2*/ ctx[6]
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*prev*/ ctx[11]);

    	button2 = new Button({
    			props: {
    				style: "button",
    				margin: "btn-bottom",
    				type: "button",
    				id: "next",
    				name: "Next-btn",
    				caption: "Next",
    				disabled: /*$disable1*/ ctx[7]
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*next*/ ctx[10]);

    	button3 = new Button({
    			props: {
    				style: "button",
    				margin: "btn-bottom",
    				type: "button",
    				id: "end",
    				name: "End-btn",
    				caption: "End Test"
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*click_handler*/ ctx[14]);
    	button3.$on("click", /*end*/ ctx[12]);
    	let if_block = /*$isopen*/ ctx[8] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			footer = element("footer");
    			span = element("span");
    			div4 = element("div");
    			t6 = text(/*minutes*/ ctx[1]);
    			t7 = text(":");
    			t8 = text(t8_value);
    			t9 = space();
    			create_component(button0.$$.fragment);
    			t10 = space();
    			create_component(button1.$$.fragment);
    			t11 = space();
    			div5 = element("div");
    			b = element("b");
    			t12 = text(t12_value);
    			t13 = text(" of 11");
    			t14 = space();
    			create_component(button2.$$.fragment);
    			t15 = space();
    			create_component(button3.$$.fragment);
    			t16 = space();
    			if (if_block) if_block.c();
    			t17 = space();
    			attr_dev(div0, "class", "number");
    			add_location(div0, file$4, 187, 8, 5686);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$4, 188, 8, 5730);
    			attr_dev(div2, "class", "main-question");
    			attr_dev(div2, "tabindex", "0");
    			add_location(div2, file$4, 186, 6, 5636);
    			attr_dev(div3, "class", "question-section");
    			toggle_class(div3, "top-shift", /*$list*/ ctx[3] && /*i*/ ctx[31] == 2 || /*i*/ ctx[31] == 2);
    			add_location(div3, file$4, 190, 6, 5819);
    			attr_dev(div4, "class", "timer");
    			add_location(div4, file$4, 202, 10, 6597);
    			add_location(b, file$4, 207, 12, 7050);
    			attr_dev(div5, "class", "numbering");
    			attr_dev(div5, "tabindex", "0");
    			add_location(div5, file$4, 206, 10, 7000);
    			attr_dev(span, "class", "buttons");
    			add_location(span, file$4, 201, 8, 6563);
    			attr_dev(footer, "class", "bottom-nav");
    			add_location(footer, file$4, 200, 6, 6526);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, span);
    			append_dev(span, div4);
    			append_dev(div4, t6);
    			append_dev(div4, t7);
    			append_dev(div4, t8);
    			append_dev(span, t9);
    			mount_component(button0, span, null);
    			append_dev(span, t10);
    			mount_component(button1, span, null);
    			append_dev(span, t11);
    			append_dev(span, div5);
    			append_dev(div5, b);
    			append_dev(b, t12);
    			append_dev(b, t13);
    			append_dev(span, t14);
    			mount_component(button2, span, null);
    			append_dev(span, t15);
    			mount_component(button3, span, null);
    			append_dev(footer, t16);
    			if (if_block) if_block.m(footer, null);
    			append_dev(footer, t17);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*$question*/ 16) && t0_value !== (t0_value = /*i*/ ctx[31] + 1 + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty[0] & /*$question*/ 16) && t3_value !== (t3_value = JSON.parse(/*dataItem*/ ctx[29].content_text).question + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*$question, currentselect, toggleattempt*/ 532) {
    				each_value_1 = JSON.parse(/*dataItem*/ ctx[29].content_text).answers;
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div3, destroy_block, create_each_block_1$3, null, get_each_context_1$3);
    			}

    			if (dirty[0] & /*$list, $question*/ 24) {
    				toggle_class(div3, "top-shift", /*$list*/ ctx[3] && /*i*/ ctx[31] == 2 || /*i*/ ctx[31] == 2);
    			}

    			if (!current || dirty[0] & /*minutes*/ 2) set_data_dev(t6, /*minutes*/ ctx[1]);
    			if ((!current || dirty[0] & /*seconds*/ 1) && t8_value !== (t8_value = /*seconds*/ ctx[0].toLocaleString(undefined, { minimumIntegerDigits: 2 }) + "")) set_data_dev(t8, t8_value);
    			const button1_changes = {};
    			if (dirty[0] & /*$disable2*/ 64) button1_changes.disabled = /*$disable2*/ ctx[6];
    			button1.$set(button1_changes);
    			if ((!current || dirty[0] & /*$question*/ 16) && t12_value !== (t12_value = /*i*/ ctx[31] + 1 + "")) set_data_dev(t12, t12_value);
    			const button2_changes = {};
    			if (dirty[0] & /*$disable1*/ 128) button2_changes.disabled = /*$disable1*/ ctx[7];
    			button2.$set(button2_changes);

    			if (/*$isopen*/ ctx[8]) {
    				if (if_block) {
    					if (dirty[0] & /*$isopen*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(footer, t17);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(footer);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(button3);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(186:4) {#if i == $currentitem}",
    		ctx
    	});

    	return block;
    }

    // (192:8) {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}
    function create_each_block_1$3(key_1, ctx) {
    	let label;
    	let span;
    	let t0_value = String.fromCharCode(65 + /*index*/ ctx[34]) + "";
    	let t0;
    	let t1;
    	let input;
    	let input_id_value;
    	let input_is_correct_value;
    	let input_value_value;
    	let input_checked_value;
    	let html_tag;
    	let raw_value = /*ans*/ ctx[32].answer + "";
    	let t2;
    	let label_for_value;
    	let label_id_value;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			label = element("label");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			html_tag = new HtmlTag();
    			t2 = space();
    			attr_dev(span, "class", "option-no");
    			add_location(span, file$4, 193, 12, 6070);
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", "ans");
    			attr_dev(input, "id", input_id_value = "ans" + /*index*/ ctx[34]);
    			attr_dev(input, "is_correct", input_is_correct_value = /*ans*/ ctx[32].is_correct);
    			input.value = input_value_value = /*ans*/ ctx[32].answer;
    			attr_dev(input, "class", "input-items");

    			input.checked = input_checked_value = /*currentselect*/ ctx[2].includes(/*ans*/ ctx[32].answer)
    			? true
    			: false;

    			attr_dev(input, "tabindex", "-1");
    			add_location(input, file$4, 194, 12, 6148);
    			html_tag.a = t2;
    			attr_dev(label, "for", label_for_value = "ans" + /*index*/ ctx[34]);
    			attr_dev(label, "id", label_id_value = "option" + /*index*/ ctx[34]);
    			attr_dev(label, "class", "items");
    			attr_dev(label, "tabindex", "0");
    			add_location(label, file$4, 192, 10, 5986);
    			this.first = label;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span);
    			append_dev(span, t0);
    			append_dev(label, t1);
    			append_dev(label, input);
    			html_tag.m(raw_value, label);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(
    					input,
    					"click",
    					function () {
    						if (is_function(/*toggleattempt*/ ctx[9](/*i*/ ctx[31], JSON.parse(/*dataItem*/ ctx[29].content_text).question, /*ans*/ ctx[32].answer))) /*toggleattempt*/ ctx[9](/*i*/ ctx[31], JSON.parse(/*dataItem*/ ctx[29].content_text).question, /*ans*/ ctx[32].answer).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$question*/ 16 && t0_value !== (t0_value = String.fromCharCode(65 + /*index*/ ctx[34]) + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*$question*/ 16 && input_id_value !== (input_id_value = "ans" + /*index*/ ctx[34])) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty[0] & /*$question*/ 16 && input_is_correct_value !== (input_is_correct_value = /*ans*/ ctx[32].is_correct)) {
    				attr_dev(input, "is_correct", input_is_correct_value);
    			}

    			if (dirty[0] & /*$question*/ 16 && input_value_value !== (input_value_value = /*ans*/ ctx[32].answer)) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty[0] & /*currentselect, $question*/ 20 && input_checked_value !== (input_checked_value = /*currentselect*/ ctx[2].includes(/*ans*/ ctx[32].answer)
    			? true
    			: false)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (dirty[0] & /*$question*/ 16 && raw_value !== (raw_value = /*ans*/ ctx[32].answer + "")) html_tag.p(raw_value);

    			if (dirty[0] & /*$question*/ 16 && label_for_value !== (label_for_value = "ans" + /*index*/ ctx[34])) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty[0] & /*$question*/ 16 && label_id_value !== (label_id_value = "option" + /*index*/ ctx[34])) {
    				attr_dev(label, "id", label_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(192:8) {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}",
    		ctx
    	});

    	return block;
    }

    // (215:8) {#if $isopen}
    function create_if_block_1$4(ctx) {
    	let endtestmodal;
    	let current;
    	endtestmodal = new EndTestModal({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(endtestmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(endtestmodal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(endtestmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(endtestmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(endtestmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(215:8) {#if $isopen}",
    		ctx
    	});

    	return block;
    }

    // (185:2) {#each $question as dataItem, i (dataItem)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*i*/ ctx[31] == /*$currentitem*/ ctx[5] && create_if_block$4(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*i*/ ctx[31] == /*$currentitem*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*$question, $currentitem*/ 48) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(185:2) {#each $question as dataItem, i (dataItem)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let link;
    	let t;
    	let section;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$question*/ ctx[4];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*dataItem*/ ctx[29];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file$4, 182, 0, 5463);
    			attr_dev(section, "class", "section");
    			toggle_class(section, "shift", /*$list*/ ctx[3]);
    			add_location(section, file$4, 183, 0, 5507);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$isopen, end, $disable1, next, $question, $disable2, prev, lis, seconds, minutes, $list, currentselect, toggleattempt, $currentitem*/ 16383) {
    				each_value = /*$question*/ ctx[4];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}

    			if (dirty[0] & /*$list*/ 8) {
    				toggle_class(section, "shift", /*$list*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $counter;
    	let $correctans;
    	let $list;
    	let $question;
    	let $currentitem;
    	let $disable2;
    	let $disable1;
    	let $isopen;
    	validate_store(counter, 'counter');
    	component_subscribe($$self, counter, $$value => $$invalidate(18, $counter = $$value));
    	validate_store(correctans, 'correctans');
    	component_subscribe($$self, correctans, $$value => $$invalidate(19, $correctans = $$value));
    	validate_store(list, 'list');
    	component_subscribe($$self, list, $$value => $$invalidate(3, $list = $$value));
    	validate_store(question, 'question');
    	component_subscribe($$self, question, $$value => $$invalidate(4, $question = $$value));
    	validate_store(currentitem, 'currentitem');
    	component_subscribe($$self, currentitem, $$value => $$invalidate(5, $currentitem = $$value));
    	validate_store(disable2, 'disable2');
    	component_subscribe($$self, disable2, $$value => $$invalidate(6, $disable2 = $$value));
    	validate_store(disable1, 'disable1');
    	component_subscribe($$self, disable1, $$value => $$invalidate(7, $disable1 = $$value));
    	validate_store(isopen, 'isopen');
    	component_subscribe($$self, isopen, $$value => $$invalidate(8, $isopen = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	let dispatch = createEventDispatcher();
    	var count = 0;
    	let seconds = 12;
    	var secs = 0;
    	let minutes = 60;
    	var timer;
    	let correct = [];
    	let questions = [];
    	let correctall = [];
    	let Main_Array = [];
    	var questioncorrect = [];
    	var iscorrect = [];
    	var Selected = [];
    	var currentselect = [];

    	//=========================================MAIN LOGIC FUNCTION================================================
    	function toggleattempt(l, z, event) {
    		Selected.push(event);

    		for (let i = 0; i < correct.length; i++) {
    			JSON.parse(correct[i].content_text).question;
    		}

    		selectedanswer.update(its => {
    			return [...Selected];
    		});

    		selectedanswer.subscribe(items => {
    			let t = items.filter((c, index) => {
    				return items.indexOf(c) === index;
    			});

    			$$invalidate(2, currentselect = [...t]);
    		});

    		//==========================================TO CHECK CURRENT ANSWER IS RIGHT OR NOT==========================
    		if ($correctans.includes(event)) {
    			iscorrect.push(event);
    			questioncorrect.push(z);

    			correctques.update(items => {
    				return [...questioncorrect];
    			});

    			currentcorrect.update(its => {
    				return [...iscorrect];
    			});

    			currentcorrect.subscribe(item => {
    				
    			});
    		}

    		Main_Array.push(z);

    		//==================ATTEMPTED LOGIC==================================
    		attempted.update(its => {
    			return [...Main_Array];
    		});
    	}

    	attempted.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		count = t.length;
    	});

    	//===========================CORRECT ANSWERS OF ALL QUESTIONS LOGIC=============================================
    	question.subscribe(items => {
    		correct = items;
    	});

    	for (let i = 0; i < correct.length; i++) {
    		let x = JSON.parse(correct[i].content_text).question;
    		questions.push(x);

    		if (JSON.parse(correct[i].content_text).answers[0].is_correct == 1) {
    			correctall.push(JSON.parse(correct[i].content_text).answers[0].answer);
    		} else if (JSON.parse(correct[i].content_text).answers[1].is_correct == 1) {
    			correctall.push(JSON.parse(correct[i].content_text).answers[1].answer);
    		} else if (JSON.parse(correct[i].content_text).answers[2].is_correct == 1) {
    			correctall.push(JSON.parse(correct[i].content_text).answers[2].answer);
    		} else if (JSON.parse(correct[i].content_text).answers[3].is_correct == 1) {
    			correctall.push(JSON.parse(correct[i].content_text).answers[3].answer);
    		}
    	}

    	correctans.update(items => {
    		return [...correctall];
    	});

    	//=====================================================================================================================
    	//========================================ALL QUESTIONS LOGIC========================================================
    	allques.update(items => {
    		return [...questions];
    	});

    	for (let k = 0; k < questions.length; k++) {
    		localStorage.setItem(questions[k], k + 1);
    	}

    	//===================================================================================================================
    	//=====================================TIMER LOGIC========================================================
    	function stop() {
    		clearInterval(timer);
    	}

    	var timer = setInterval(
    		() => {
    			$$invalidate(0, seconds--, seconds);
    			secs += 1;
    			timetaken.set(secs);

    			if (minutes > 0 && seconds == 0) {
    				$$invalidate(1, minutes--, minutes);
    				$$invalidate(0, seconds = 59);
    			} else if (minutes == 0) {
    				$$invalidate(1, minutes = 0);
    			} else if (minutes == 0 && seconds == 0) {
    				stop();
    				window.alert("TIME IS UP");
    			}
    		},
    		1000
    	);

    	//=============================================================================================================
    	//==========================================NEXT AND PREVIOUS BUTTON LOGIC====================================
    	function next() {
    		disable1.set(false);
    		disable2.set(false);

    		if ($counter == 9) {
    			disable1.set(true);
    		}

    		dispatch("n");
    	}

    	function prev() {
    		disable1.set(false);

    		if ($counter == 1) {
    			disable1.set(false);
    			disable2.set(true);
    		}

    		dispatch("p");
    	}

    	//===============================================================================================================
    	function end() {
    		//END TEST EVENT
    		dispatch("e");

    		stop();
    	}

    	function lis() {
    		//OPEN LIST EVENT
    		dispatch("l");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({
    		Button,
    		EndTestModal,
    		question,
    		correctans,
    		allques,
    		attempted,
    		currentcorrect,
    		selectedanswer,
    		createEventDispatcher,
    		currentitem,
    		counter,
    		disable1,
    		disable2,
    		list,
    		correctques,
    		isopen,
    		timetaken,
    		dispatch,
    		count,
    		seconds,
    		secs,
    		minutes,
    		timer,
    		correct,
    		questions,
    		correctall,
    		Main_Array,
    		questioncorrect,
    		iscorrect,
    		Selected,
    		currentselect,
    		toggleattempt,
    		stop,
    		next,
    		prev,
    		end,
    		lis,
    		$counter,
    		$correctans,
    		$list,
    		$question,
    		$currentitem,
    		$disable2,
    		$disable1,
    		$isopen
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    		if ('count' in $$props) count = $$props.count;
    		if ('seconds' in $$props) $$invalidate(0, seconds = $$props.seconds);
    		if ('secs' in $$props) secs = $$props.secs;
    		if ('minutes' in $$props) $$invalidate(1, minutes = $$props.minutes);
    		if ('timer' in $$props) timer = $$props.timer;
    		if ('correct' in $$props) correct = $$props.correct;
    		if ('questions' in $$props) questions = $$props.questions;
    		if ('correctall' in $$props) correctall = $$props.correctall;
    		if ('Main_Array' in $$props) Main_Array = $$props.Main_Array;
    		if ('questioncorrect' in $$props) questioncorrect = $$props.questioncorrect;
    		if ('iscorrect' in $$props) iscorrect = $$props.iscorrect;
    		if ('Selected' in $$props) Selected = $$props.Selected;
    		if ('currentselect' in $$props) $$invalidate(2, currentselect = $$props.currentselect);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		seconds,
    		minutes,
    		currentselect,
    		$list,
    		$question,
    		$currentitem,
    		$disable2,
    		$disable1,
    		$isopen,
    		toggleattempt,
    		next,
    		prev,
    		end,
    		lis,
    		click_handler
    	];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\UI\Review.svelte generated by Svelte v3.44.2 */
    const file$3 = "src\\UI\\Review.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (91:6) {#if i == $current}
    function create_if_block_1$3(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*i*/ ctx[15] + 1 + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = JSON.parse(/*dataItem*/ ctx[13].content_text).question + "";
    	let t3;
    	let t4;
    	let div3;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t5;
    	let div4;
    	let t6;
    	let div6;
    	let button0;
    	let t7;
    	let div5;
    	let b;
    	let t8_value = /*i*/ ctx[15] + 1 + "";
    	let t8;
    	let t9;
    	let t10;
    	let button1;
    	let t11;
    	let button2;
    	let t12;
    	let current;
    	let each_value_2 = JSON.parse(/*dataItem*/ ctx[13].content_text).answers;
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*ans*/ ctx[19];
    	validate_each_keys(ctx, each_value_2, get_each_context_2$1, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2$1(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2$1(key, child_ctx));
    	}

    	let if_block = /*explain*/ ctx[7] && create_if_block_2$3(ctx);

    	button0 = new Button({
    			props: {
    				style: "button",
    				margin: "btn-bottom",
    				type: "button",
    				id: "prev",
    				name: "Prev-btn",
    				caption: "Previous",
    				disabled: /*$disable2*/ ctx[5]
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*prev*/ ctx[9]);

    	button1 = new Button({
    			props: {
    				style: "button",
    				margin: "btn-bottom",
    				type: "button",
    				id: "next",
    				name: "Next-btn",
    				caption: "Next",
    				disabled: /*$disable1*/ ctx[6]
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*next*/ ctx[8]);

    	button2 = new Button({
    			props: {
    				style: "button",
    				margin: "btn-bottom",
    				type: "button",
    				id: "dash",
    				name: "DashBoard-btn",
    				caption: "DashBoard"
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*dash*/ ctx[10]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div4 = element("div");
    			if (if_block) if_block.c();
    			t6 = space();
    			div6 = element("div");
    			create_component(button0.$$.fragment);
    			t7 = space();
    			div5 = element("div");
    			b = element("b");
    			t8 = text(t8_value);
    			t9 = text(" of 11");
    			t10 = space();
    			create_component(button1.$$.fragment);
    			t11 = space();
    			create_component(button2.$$.fragment);
    			t12 = space();
    			attr_dev(div0, "class", "number");
    			add_location(div0, file$3, 92, 10, 2161);
    			attr_dev(div1, "class", "box");
    			attr_dev(div1, "tabindex", "0");
    			add_location(div1, file$3, 93, 10, 2207);
    			attr_dev(div2, "class", "review-question");
    			add_location(div2, file$3, 91, 8, 2120);
    			attr_dev(div3, "class", "review-question-section");
    			toggle_class(div3, "top-shift", /*i*/ ctx[15] == 2);
    			add_location(div3, file$3, 95, 8, 2313);
    			attr_dev(div4, "class", "explanation");
    			attr_dev(div4, "tabindex", "0");
    			add_location(div4, file$3, 106, 8, 3177);
    			add_location(b, file$3, 119, 12, 3741);
    			attr_dev(div5, "class", "numbering");
    			attr_dev(div5, "tabindex", "0");
    			add_location(div5, file$3, 118, 10, 3691);
    			attr_dev(div6, "class", "bottom-nav");
    			add_location(div6, file$3, 115, 8, 3490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			if (if_block) if_block.m(div4, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div6, anchor);
    			mount_component(button0, div6, null);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, b);
    			append_dev(b, t8);
    			append_dev(b, t9);
    			append_dev(div6, t10);
    			mount_component(button1, div6, null);
    			append_dev(div6, t11);
    			mount_component(button2, div6, null);
    			append_dev(div6, t12);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$question*/ 4) && t0_value !== (t0_value = /*i*/ ctx[15] + 1 + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*$question*/ 4) && t3_value !== (t3_value = JSON.parse(/*dataItem*/ ctx[13].content_text).question + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*JSON, $question, currentselect, String*/ 12) {
    				each_value_2 = JSON.parse(/*dataItem*/ ctx[13].content_text).answers;
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div3, destroy_block, create_each_block_2$1, null, get_each_context_2$1);
    			}

    			if (dirty & /*$question*/ 4) {
    				toggle_class(div3, "top-shift", /*i*/ ctx[15] == 2);
    			}

    			if (/*explain*/ ctx[7]) if_block.p(ctx, dirty);
    			const button0_changes = {};
    			if (dirty & /*$disable2*/ 32) button0_changes.disabled = /*$disable2*/ ctx[5];
    			button0.$set(button0_changes);
    			if ((!current || dirty & /*$question*/ 4) && t8_value !== (t8_value = /*i*/ ctx[15] + 1 + "")) set_data_dev(t8, t8_value);
    			const button1_changes = {};
    			if (dirty & /*$disable1*/ 64) button1_changes.disabled = /*$disable1*/ ctx[6];
    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div6);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(91:6) {#if i == $current}",
    		ctx
    	});

    	return block;
    }

    // (97:10) {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}
    function create_each_block_2$1(key_1, ctx) {
    	let label;
    	let t0_value = String.fromCharCode(65 + /*index*/ ctx[18]) + "";
    	let t0;
    	let t1;
    	let input;
    	let input_id_value;
    	let input_is_correct_value;
    	let input_value_value;
    	let input_checked_value;
    	let t2;
    	let div;
    	let html_tag;
    	let raw_value = /*ans*/ ctx[19].answer + "";
    	let t3;
    	let label_for_value;
    	let label_id_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div = element("div");
    			html_tag = new HtmlTag();
    			t3 = space();
    			attr_dev(input, "class", "radio_input");
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", "ans");
    			attr_dev(input, "id", input_id_value = "ans" + /*index*/ ctx[18]);
    			attr_dev(input, "is_correct", input_is_correct_value = /*ans*/ ctx[19].is_correct);
    			input.value = input_value_value = /*ans*/ ctx[19].answer;

    			input.checked = input_checked_value = /*ans*/ ctx[19].answer && /*ans*/ ctx[19].is_correct == 1
    			? true
    			: false;

    			input.disabled = "disabled";
    			add_location(input, file$3, 99, 14, 2712);
    			toggle_class(div, "radio_radio", /*ans*/ ctx[19].is_correct == 1 || /*ans*/ ctx[19].answer);
    			toggle_class(div, "wrong", /*currentselect*/ ctx[3].includes(/*ans*/ ctx[19].answer) && /*ans*/ ctx[19].is_correct == 0);
    			add_location(div, file$3, 101, 16, 2941);
    			html_tag.a = t3;
    			attr_dev(label, "tabindex", "0");
    			attr_dev(label, "for", label_for_value = "ans" + /*index*/ ctx[18]);
    			attr_dev(label, "id", label_id_value = "option" + /*index*/ ctx[18]);
    			attr_dev(label, "class", "radio");
    			toggle_class(label, "bold", /*ans*/ ctx[19].is_correct == 1);
    			toggle_class(label, "not-bold", /*currentselect*/ ctx[3].includes(/*ans*/ ctx[19].answer) && /*ans*/ ctx[19].is_correct == 0);
    			add_location(label, file$3, 97, 12, 2470);
    			this.first = label;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, input);
    			append_dev(label, t2);
    			append_dev(label, div);
    			html_tag.m(raw_value, label);
    			append_dev(label, t3);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$question*/ 4 && t0_value !== (t0_value = String.fromCharCode(65 + /*index*/ ctx[18]) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$question*/ 4 && input_id_value !== (input_id_value = "ans" + /*index*/ ctx[18])) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*$question*/ 4 && input_is_correct_value !== (input_is_correct_value = /*ans*/ ctx[19].is_correct)) {
    				attr_dev(input, "is_correct", input_is_correct_value);
    			}

    			if (dirty & /*$question*/ 4 && input_value_value !== (input_value_value = /*ans*/ ctx[19].answer)) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*$question*/ 4 && input_checked_value !== (input_checked_value = /*ans*/ ctx[19].answer && /*ans*/ ctx[19].is_correct == 1
    			? true
    			: false)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (dirty & /*JSON, $question*/ 4) {
    				toggle_class(div, "radio_radio", /*ans*/ ctx[19].is_correct == 1 || /*ans*/ ctx[19].answer);
    			}

    			if (dirty & /*currentselect, JSON, $question*/ 12) {
    				toggle_class(div, "wrong", /*currentselect*/ ctx[3].includes(/*ans*/ ctx[19].answer) && /*ans*/ ctx[19].is_correct == 0);
    			}

    			if (dirty & /*$question*/ 4 && raw_value !== (raw_value = /*ans*/ ctx[19].answer + "")) html_tag.p(raw_value);

    			if (dirty & /*$question*/ 4 && label_for_value !== (label_for_value = "ans" + /*index*/ ctx[18])) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*$question*/ 4 && label_id_value !== (label_id_value = "option" + /*index*/ ctx[18])) {
    				attr_dev(label, "id", label_id_value);
    			}

    			if (dirty & /*JSON, $question*/ 4) {
    				toggle_class(label, "bold", /*ans*/ ctx[19].is_correct == 1);
    			}

    			if (dirty & /*currentselect, JSON, $question*/ 12) {
    				toggle_class(label, "not-bold", /*currentselect*/ ctx[3].includes(/*ans*/ ctx[19].answer) && /*ans*/ ctx[19].is_correct == 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(97:10) {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}",
    		ctx
    	});

    	return block;
    }

    // (108:10) {#if explain}
    function create_if_block_2$3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value_1 = JSON.parse(/*dataItem*/ ctx[13].content_text).answers;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*answers*/ ctx[16];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rel, JSON, $question*/ 5) {
    				each_value_1 = JSON.parse(/*dataItem*/ ctx[13].content_text).answers;
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_1$2, each_1_anchor, get_each_context_1$2);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(108:10) {#if explain}",
    		ctx
    	});

    	return block;
    }

    // (110:14) {#if answers.is_correct == 1}
    function create_if_block_3$3(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*rel*/ ctx[0], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rel*/ 1) html_tag.p(/*rel*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(110:14) {#if answers.is_correct == 1}",
    		ctx
    	});

    	return block;
    }

    // (109:12) {#each JSON.parse(dataItem.content_text).answers as answers, index (answers)}
    function create_each_block_1$2(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*answers*/ ctx[16].is_correct == 1 && create_if_block_3$3(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*answers*/ ctx[16].is_correct == 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(109:12) {#each JSON.parse(dataItem.content_text).answers as answers, index (answers)}",
    		ctx
    	});

    	return block;
    }

    // (90:4) {#each $question as dataItem, i (dataItem)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*i*/ ctx[15] == /*$current*/ ctx[1] && create_if_block_1$3(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*i*/ ctx[15] == /*$current*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$question, $current*/ 6) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(90:4) {#each $question as dataItem, i (dataItem)}",
    		ctx
    	});

    	return block;
    }

    // (129:2) {#if home}
    function create_if_block$3(ctx) {
    	let app;
    	let current;
    	app = new App({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(app.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(app, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(app.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(app.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(app, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(129:2) {#if home}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let link;
    	let t0;
    	let header;
    	let nav;
    	let t1;
    	let div;
    	let section;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let current;

    	nav = new Nav({
    			props: { Heading: "uCertify Test Review" },
    			$$inline: true
    		});

    	let each_value = /*$question*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*dataItem*/ ctx[13];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	let if_block = /*home*/ ctx[4] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			header = element("header");
    			create_component(nav.$$.fragment);
    			t1 = space();
    			div = element("div");
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file$3, 83, 0, 1869);
    			add_location(header, file$3, 84, 0, 1913);
    			attr_dev(section, "class", "review-section");
    			add_location(section, file$3, 88, 2, 2002);
    			attr_dev(div, "class", "review");
    			add_location(div, file$3, 87, 0, 1978);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			mount_component(nav, header, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			append_dev(div, t2);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dash, $disable1, next, $question, $disable2, prev, JSON, rel, explain, currentselect, String, $current*/ 2031) {
    				each_value = /*$question*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}

    			if (/*home*/ ctx[4]) {
    				if (if_block) {
    					if (dirty & /*home*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			destroy_component(nav);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $current;
    	let $question;
    	let $disable2;
    	let $disable1;
    	validate_store(current, 'current');
    	component_subscribe($$self, current, $$value => $$invalidate(1, $current = $$value));
    	validate_store(question, 'question');
    	component_subscribe($$self, question, $$value => $$invalidate(2, $question = $$value));
    	validate_store(disable2, 'disable2');
    	component_subscribe($$self, disable2, $$value => $$invalidate(5, $disable2 = $$value));
    	validate_store(disable1, 'disable1');
    	component_subscribe($$self, disable1, $$value => $$invalidate(6, $disable1 = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Review', slots, []);
    	var explain = true;
    	var currentselect = [];
    	var home = false;
    	let Heading;
    	var correct = [];
    	var rel;

    	question.subscribe(items => {
    		correct = items;
    	});

    	selectedanswer.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		$$invalidate(3, currentselect = [...t]);
    	});

    	if ($current > 0) {
    		disable2.set(false);
    	} else if ($current == 0) {
    		disable1.set(false);
    	} else if ($current >= 10) {
    		disable1.set(true);
    	}

    	function next() {
    		set_store_value(current, $current += 1, $current);
    		disable1.set(false);
    		disable2.set(false);

    		if ($current == 10) {
    			disable1.set(true);
    		}
    	}

    	function prev() {
    		set_store_value(current, $current -= 1, $current);
    		disable2.set(false);
    		disable1.set(false);

    		if ($current == 0) {
    			disable1.set(false);
    			disable2.set(true);
    		}
    	}

    	function dash() {
    		$$invalidate(4, home = true);
    		rev.set(false);
    		startpage.set(true);
    		isconfirm.set(false);
    		location.reload();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Review> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		question,
    		current,
    		disable1,
    		disable2,
    		Button,
    		Nav,
    		selectedanswer,
    		App,
    		rev,
    		startpage,
    		isconfirm,
    		explain,
    		currentselect,
    		home,
    		Heading,
    		correct,
    		rel,
    		next,
    		prev,
    		dash,
    		$current,
    		$question,
    		$disable2,
    		$disable1
    	});

    	$$self.$inject_state = $$props => {
    		if ('explain' in $$props) $$invalidate(7, explain = $$props.explain);
    		if ('currentselect' in $$props) $$invalidate(3, currentselect = $$props.currentselect);
    		if ('home' in $$props) $$invalidate(4, home = $$props.home);
    		if ('Heading' in $$props) Heading = $$props.Heading;
    		if ('correct' in $$props) correct = $$props.correct;
    		if ('rel' in $$props) $$invalidate(0, rel = $$props.rel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$current, $question, rel*/ 7) {
    			if ($current + 1) {
    				$$invalidate(0, rel = JSON.parse($question[$current].content_text).explanation);
    				let start_ind = rel.indexOf("<seq");

    				while (start_ind > -1) {
    					let str1 = rel.substr(start_ind, 14);
    					let find = rel.charAt(start_ind + 9);
    					$$invalidate(0, rel = rel.replace(str1, find));
    					start_ind = rel.indexOf("<seq");
    				}
    			}
    		}
    	};

    	return [
    		rel,
    		$current,
    		$question,
    		currentselect,
    		home,
    		$disable2,
    		$disable1,
    		explain,
    		next,
    		prev,
    		dash
    	];
    }

    class Review extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Review",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\UI\Result.svelte generated by Svelte v3.44.2 */
    const file$2 = "src\\UI\\Result.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[34] = i;
    	return child_ctx;
    }

    // (163:12) {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}
    function create_each_block_1$1(key_1, ctx) {
    	let span;
    	let i;
    	let t_value = /*index*/ ctx[34] + 1 + "";
    	let t;
    	let span_is_correct_value;
    	let span_id_value;
    	let span_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			t = text(t_value);
    			add_location(i, file$2, 166, 16, 5902);
    			attr_dev(span, "is_correct", span_is_correct_value = /*ans*/ ctx[32].is_correct);
    			attr_dev(span, "class", "dot");
    			attr_dev(span, "id", span_id_value = "ans" + /*index*/ ctx[34]);
    			attr_dev(span, "value", span_value_value = /*ans*/ ctx[32].answer);
    			toggle_class(span, "success", /*currentselect*/ ctx[9].includes(/*ans*/ ctx[32].answer) && /*ans*/ ctx[32].is_correct == 1 || /*ans*/ ctx[32].is_correct == 1);
    			toggle_class(span, "unsuccess", /*currentselect*/ ctx[9].includes(/*ans*/ ctx[32].answer) && /*ans*/ ctx[32].is_correct == 0);
    			add_location(span, file$2, 163, 14, 5593);
    			this.first = span;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			append_dev(i, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$question*/ 16384 && t_value !== (t_value = /*index*/ ctx[34] + 1 + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*$question*/ 16384 && span_is_correct_value !== (span_is_correct_value = /*ans*/ ctx[32].is_correct)) {
    				attr_dev(span, "is_correct", span_is_correct_value);
    			}

    			if (dirty[0] & /*$question*/ 16384 && span_id_value !== (span_id_value = "ans" + /*index*/ ctx[34])) {
    				attr_dev(span, "id", span_id_value);
    			}

    			if (dirty[0] & /*$question*/ 16384 && span_value_value !== (span_value_value = /*ans*/ ctx[32].answer)) {
    				attr_dev(span, "value", span_value_value);
    			}

    			if (dirty[0] & /*currentselect, $question*/ 16896) {
    				toggle_class(span, "success", /*currentselect*/ ctx[9].includes(/*ans*/ ctx[32].answer) && /*ans*/ ctx[32].is_correct == 1 || /*ans*/ ctx[32].is_correct == 1);
    			}

    			if (dirty[0] & /*currentselect, $question*/ 16896) {
    				toggle_class(span, "unsuccess", /*currentselect*/ ctx[9].includes(/*ans*/ ctx[32].answer) && /*ans*/ ctx[32].is_correct == 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(163:12) {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}",
    		ctx
    	});

    	return block;
    }

    // (170:12) {#if !dummyarray.includes(JSON.parse(dataItem.content_text).question)}
    function create_if_block_3$2(ctx) {
    	let div;
    	let i;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Unattempted";
    			attr_dev(i, "class", "fa fa-eye-slash top");
    			add_location(i, file$2, 171, 16, 6103);
    			attr_dev(span, "class", "tooltiptext");
    			add_location(span, file$2, 172, 16, 6154);
    			attr_dev(div, "class", "tooltip");
    			add_location(div, file$2, 170, 14, 6064);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(170:12) {#if !dummyarray.includes(JSON.parse(dataItem.content_text).question)}",
    		ctx
    	});

    	return block;
    }

    // (181:159) 
    function create_if_block_2$2(ctx) {
    	let div;
    	let i;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Incorrect";
    			attr_dev(i, "class", "fa fa-close");
    			add_location(i, file$2, 182, 16, 6770);
    			attr_dev(span, "class", "tooltiptext");
    			add_location(span, file$2, 183, 16, 6813);
    			attr_dev(div, "class", "tooltip");
    			add_location(div, file$2, 181, 14, 6731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(181:159) ",
    		ctx
    	});

    	return block;
    }

    // (176:12) {#if dummyarray.includes(JSON.parse(dataItem.content_text).question) && questioncorrect.includes(JSON.parse(dataItem.content_text).question)}
    function create_if_block_1$2(ctx) {
    	let div;
    	let i;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Correct";
    			attr_dev(i, "class", "fa fa-check");
    			add_location(i, file$2, 177, 16, 6449);
    			attr_dev(span, "class", "tooltiptext");
    			add_location(span, file$2, 178, 16, 6492);
    			attr_dev(div, "class", "tooltip");
    			add_location(div, file$2, 176, 14, 6410);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(176:12) {#if dummyarray.includes(JSON.parse(dataItem.content_text).question) && questioncorrect.includes(JSON.parse(dataItem.content_text).question)}",
    		ctx
    	});

    	return block;
    }

    // (152:4) {#each $question as dataItem, i (dataItem)}
    function create_each_block$1(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*i*/ ctx[31] + 1 + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = JSON.parse(/*dataItem*/ ctx[29].content_text).question + "";
    	let t2;
    	let t3;
    	let td2;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t4;
    	let show_if_2 = !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question);
    	let t5;
    	let show_if;
    	let show_if_1;
    	let t6;
    	let mounted;
    	let dispose;
    	let each_value_1 = JSON.parse(/*dataItem*/ ctx[29].content_text).answers;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*ans*/ ctx[32];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	let if_block0 = show_if_2 && create_if_block_3$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*dummyarray, $question, questioncorrect*/ 18560) show_if = !!(/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) && /*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question));
    		if (show_if) return create_if_block_1$2;
    		if (show_if_1 == null || dirty[0] & /*dummyarray, $question, questioncorrect*/ 18560) show_if_1 = !!(/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) && !/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question));
    		if (show_if_1) return create_if_block_2$2;
    	}

    	let current_block_type = select_block_type(ctx, [-1, -1]);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			attr_dev(td0, "class", "center");
    			attr_dev(td0, "tabindex", "0");
    			add_location(td0, file$2, 158, 8, 5297);
    			attr_dev(td1, "id", "questions");
    			attr_dev(td1, "tabindex", "0");
    			add_location(td1, file$2, 159, 8, 5351);
    			attr_dev(div, "class", "center");
    			add_location(div, file$2, 161, 10, 5474);
    			add_location(td2, file$2, 160, 8, 5458);
    			toggle_class(tr, "hidecorrect", /*showcorrect*/ ctx[4] && (!/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question)));
    			toggle_class(tr, "hideincorrect", /*showincorrect*/ ctx[5] && (/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question)));
    			toggle_class(tr, "show", /*showall*/ ctx[3] && (/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question)));
    			toggle_class(tr, "un", /*showunattempt*/ ctx[10] && /*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question));
    			add_location(tr, file$2, 152, 6, 4489);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t4);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t5);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(tr, t6);

    			if (!mounted) {
    				dispose = listen_dev(
    					td1,
    					"click",
    					function () {
    						if (is_function(/*r*/ ctx[15](/*i*/ ctx[31]))) /*r*/ ctx[15](/*i*/ ctx[31]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$question*/ 16384 && t0_value !== (t0_value = /*i*/ ctx[31] + 1 + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*$question*/ 16384 && t2_value !== (t2_value = JSON.parse(/*dataItem*/ ctx[29].content_text).question + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*$question, currentselect*/ 16896) {
    				each_value_1 = JSON.parse(/*dataItem*/ ctx[29].content_text).answers;
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1$1, t4, get_each_context_1$1);
    			}

    			if (dirty[0] & /*dummyarray, $question*/ 16512) show_if_2 = !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question);

    			if (show_if_2) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					if_block0.m(div, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx, dirty))) {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			}

    			if (dirty[0] & /*showcorrect, questioncorrect, $question, dummyarray*/ 18576) {
    				toggle_class(tr, "hidecorrect", /*showcorrect*/ ctx[4] && (!/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question)));
    			}

    			if (dirty[0] & /*showincorrect, questioncorrect, $question, dummyarray*/ 18592) {
    				toggle_class(tr, "hideincorrect", /*showincorrect*/ ctx[5] && (/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question)));
    			}

    			if (dirty[0] & /*showall, questioncorrect, $question, dummyarray*/ 18568) {
    				toggle_class(tr, "show", /*showall*/ ctx[3] && (/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*questioncorrect*/ ctx[11].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question) || !/*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question)));
    			}

    			if (dirty[0] & /*showunattempt, dummyarray, $question*/ 17536) {
    				toggle_class(tr, "un", /*showunattempt*/ ctx[10] && /*dummyarray*/ ctx[7].includes(JSON.parse(/*dataItem*/ ctx[29].content_text).question));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(152:4) {#each $question as dataItem, i (dataItem)}",
    		ctx
    	});

    	return block;
    }

    // (193:0) {#if review}
    function create_if_block$2(ctx) {
    	let review_1;
    	let current;
    	review_1 = new Review({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(review_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(review_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(review_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(review_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(review_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(193:0) {#if review}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let header;
    	let nav;
    	let t2;
    	let div5;
    	let div0;
    	let b0;
    	let i0;
    	let t3;
    	let t4;
    	let br0;
    	let t5;
    	let t6;
    	let div1;
    	let b1;
    	let i1;
    	let t7_value = /*$allques*/ ctx[13].length + "";
    	let t7;
    	let t8;
    	let br1;
    	let t9;
    	let t10;
    	let div2;
    	let b2;
    	let i2;
    	let t11;
    	let t12;
    	let br2;
    	let t13;
    	let t14;
    	let div3;
    	let b3;
    	let i3;
    	let t15_value = /*count*/ ctx[6] - /*correctlength*/ ctx[0] + "";
    	let t15;
    	let t16;
    	let br3;
    	let t17;
    	let t18;
    	let div4;
    	let b4;
    	let i4;
    	let t19_value = 11 - /*count*/ ctx[6] + "";
    	let t19;
    	let t20;
    	let br4;
    	let t21;
    	let br5;
    	let t22;
    	let p;
    	let t23;
    	let t24;
    	let t25;
    	let t26;
    	let t27;
    	let t28;
    	let div6;
    	let table;
    	let tr;
    	let th0;
    	let t30;
    	let th1;
    	let t32;
    	let th2;
    	let t34;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t35;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	nav = new Nav({
    			props: { Heading: "uCertify Test Result" },
    			$$inline: true
    		});

    	let each_value = /*$question*/ ctx[14];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*dataItem*/ ctx[29];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	let if_block = /*review*/ ctx[8] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			header = element("header");
    			create_component(nav.$$.fragment);
    			t2 = space();
    			div5 = element("div");
    			div0 = element("div");
    			b0 = element("b");
    			i0 = element("i");
    			t3 = text(/*result*/ ctx[2]);
    			t4 = text("%\r\n    ");
    			br0 = element("br");
    			t5 = text("Result");
    			t6 = space();
    			div1 = element("div");
    			b1 = element("b");
    			i1 = element("i");
    			t7 = text(t7_value);
    			t8 = space();
    			br1 = element("br");
    			t9 = text("All Items");
    			t10 = space();
    			div2 = element("div");
    			b2 = element("b");
    			i2 = element("i");
    			t11 = text(/*correctlength*/ ctx[0]);
    			t12 = space();
    			br2 = element("br");
    			t13 = text("Correct");
    			t14 = space();
    			div3 = element("div");
    			b3 = element("b");
    			i3 = element("i");
    			t15 = text(t15_value);
    			t16 = space();
    			br3 = element("br");
    			t17 = text("Incorrect");
    			t18 = space();
    			div4 = element("div");
    			b4 = element("b");
    			i4 = element("i");
    			t19 = text(t19_value);
    			t20 = space();
    			br4 = element("br");
    			t21 = text("Unattempted\r\n  ");
    			br5 = element("br");
    			t22 = space();
    			p = element("p");
    			t23 = text("Time Taken: ");
    			t24 = text(/*minutes*/ ctx[1]);
    			t25 = text("min :");
    			t26 = text(/*secs*/ ctx[12]);
    			t27 = text("sec");
    			t28 = space();
    			div6 = element("div");
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Index No";
    			t30 = space();
    			th1 = element("th");
    			th1.textContent = "Questions";
    			t32 = space();
    			th2 = element("th");
    			th2.textContent = "Answers";
    			t34 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t35 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			add_location(link0, file$2, 111, 0, 2594);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "style.css");
    			add_location(link1, file$2, 112, 0, 2710);
    			add_location(header, file$2, 113, 0, 2754);
    			attr_dev(i0, "class", "fa fa-bar-chart result");
    			add_location(i0, file$2, 119, 6, 3014);
    			attr_dev(b0, "class", "result");
    			add_location(b0, file$2, 118, 4, 2988);
    			add_location(br0, file$2, 120, 8, 3069);
    			attr_dev(div0, "class", "result-item");
    			attr_dev(div0, "tabindex", "0");
    			add_location(div0, file$2, 117, 2, 2846);
    			attr_dev(i1, "class", "fa fa-bars all");
    			add_location(i1, file$2, 124, 6, 3260);
    			attr_dev(b1, "class", "all");
    			add_location(b1, file$2, 123, 4, 3237);
    			add_location(br1, file$2, 125, 8, 3317);
    			attr_dev(div1, "class", "result-item");
    			attr_dev(div1, "tabindex", "0");
    			add_location(div1, file$2, 122, 2, 3094);
    			attr_dev(i2, "class", "fa fa-check correct");
    			add_location(i2, file$2, 129, 6, 3515);
    			attr_dev(b2, "class", "correct");
    			add_location(b2, file$2, 128, 4, 3488);
    			add_location(br2, file$2, 130, 8, 3573);
    			attr_dev(div2, "class", "result-item");
    			attr_dev(div2, "tabindex", "0");
    			add_location(div2, file$2, 127, 2, 3345);
    			attr_dev(i3, "class", "fa fa-close incorrect");
    			add_location(i3, file$2, 134, 6, 3772);
    			attr_dev(b3, "class", "incorrect");
    			add_location(b3, file$2, 133, 4, 3743);
    			add_location(br3, file$2, 135, 8, 3840);
    			attr_dev(div3, "class", "result-item");
    			attr_dev(div3, "tabindex", "0");
    			add_location(div3, file$2, 132, 2, 3600);
    			attr_dev(i4, "class", "fa fa-eye-slash unattempt");
    			add_location(i4, file$2, 139, 6, 4041);
    			attr_dev(b4, "class", "unattempt");
    			add_location(b4, file$2, 138, 4, 4012);
    			add_location(br4, file$2, 140, 8, 4102);
    			attr_dev(div4, "class", "result-item");
    			attr_dev(div4, "tabindex", "0");
    			add_location(div4, file$2, 137, 2, 3869);
    			add_location(br5, file$2, 141, 8, 4129);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$2, 116, 0, 2819);
    			attr_dev(p, "class", "time font-700");
    			attr_dev(p, "tabindex", "0");
    			add_location(p, file$2, 143, 0, 4145);
    			attr_dev(th0, "class", "first");
    			attr_dev(th0, "tabindex", "0");
    			add_location(th0, file$2, 147, 6, 4272);
    			attr_dev(th1, "class", "second");
    			attr_dev(th1, "tabindex", "0");
    			add_location(th1, file$2, 148, 6, 4324);
    			attr_dev(th2, "class", "third");
    			attr_dev(th2, "tabindex", "0");
    			add_location(th2, file$2, 149, 6, 4378);
    			add_location(tr, file$2, 146, 4, 4260);
    			add_location(table, file$2, 145, 2, 4247);
    			attr_dev(div6, "class", "table");
    			add_location(div6, file$2, 144, 0, 4224);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, header, anchor);
    			mount_component(nav, header, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, b0);
    			append_dev(b0, i0);
    			append_dev(b0, t3);
    			append_dev(b0, t4);
    			append_dev(div0, br0);
    			append_dev(div0, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div1);
    			append_dev(div1, b1);
    			append_dev(b1, i1);
    			append_dev(i1, t7);
    			append_dev(b1, t8);
    			append_dev(div1, br1);
    			append_dev(div1, t9);
    			append_dev(div5, t10);
    			append_dev(div5, div2);
    			append_dev(div2, b2);
    			append_dev(b2, i2);
    			append_dev(b2, t11);
    			append_dev(b2, t12);
    			append_dev(div2, br2);
    			append_dev(div2, t13);
    			append_dev(div5, t14);
    			append_dev(div5, div3);
    			append_dev(div3, b3);
    			append_dev(b3, i3);
    			append_dev(b3, t15);
    			append_dev(b3, t16);
    			append_dev(div3, br3);
    			append_dev(div3, t17);
    			append_dev(div5, t18);
    			append_dev(div5, div4);
    			append_dev(div4, b4);
    			append_dev(b4, i4);
    			append_dev(b4, t19);
    			append_dev(b4, t20);
    			append_dev(div4, br4);
    			append_dev(div4, t21);
    			append_dev(div5, br5);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t23);
    			append_dev(p, t24);
    			append_dev(p, t25);
    			append_dev(p, t26);
    			append_dev(p, t27);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, table);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t30);
    			append_dev(tr, th1);
    			append_dev(tr, t32);
    			append_dev(tr, th2);
    			append_dev(table, t34);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t35, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[16], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[17], false, false, false),
    					listen_dev(div2, "click", /*click_handler_2*/ ctx[18], false, false, false),
    					listen_dev(div3, "click", /*click_handler_3*/ ctx[19], false, false, false),
    					listen_dev(div4, "click", /*click_handler_4*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*result*/ 4) set_data_dev(t3, /*result*/ ctx[2]);
    			if ((!current || dirty[0] & /*$allques*/ 8192) && t7_value !== (t7_value = /*$allques*/ ctx[13].length + "")) set_data_dev(t7, t7_value);
    			if (!current || dirty[0] & /*correctlength*/ 1) set_data_dev(t11, /*correctlength*/ ctx[0]);
    			if ((!current || dirty[0] & /*count, correctlength*/ 65) && t15_value !== (t15_value = /*count*/ ctx[6] - /*correctlength*/ ctx[0] + "")) set_data_dev(t15, t15_value);
    			if ((!current || dirty[0] & /*count*/ 64) && t19_value !== (t19_value = 11 - /*count*/ ctx[6] + "")) set_data_dev(t19, t19_value);
    			if (!current || dirty[0] & /*minutes*/ 2) set_data_dev(t24, /*minutes*/ ctx[1]);
    			if (!current || dirty[0] & /*secs*/ 4096) set_data_dev(t26, /*secs*/ ctx[12]);

    			if (dirty[0] & /*showcorrect, questioncorrect, $question, dummyarray, showincorrect, showall, showunattempt, currentselect, r*/ 52920) {
    				each_value = /*$question*/ ctx[14];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, table, destroy_block, create_each_block$1, null, get_each_context$1);
    			}

    			if (/*review*/ ctx[8]) {
    				if (if_block) {
    					if (dirty[0] & /*review*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(header);
    			destroy_component(nav);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(div6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t35);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $disable1;
    	let $disable2;
    	let $timetaken;
    	let $allques;
    	let $question;
    	validate_store(disable1, 'disable1');
    	component_subscribe($$self, disable1, $$value => $$invalidate(25, $disable1 = $$value));
    	validate_store(disable2, 'disable2');
    	component_subscribe($$self, disable2, $$value => $$invalidate(26, $disable2 = $$value));
    	validate_store(timetaken, 'timetaken');
    	component_subscribe($$self, timetaken, $$value => $$invalidate(27, $timetaken = $$value));
    	validate_store(allques, 'allques');
    	component_subscribe($$self, allques, $$value => $$invalidate(13, $allques = $$value));
    	validate_store(question, 'question');
    	component_subscribe($$self, question, $$value => $$invalidate(14, $question = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Result', slots, []);
    	let Heading;
    	var minutes = 0;
    	var Raw_Unattempted;
    	var result = 0.0;
    	var showall = false;
    	var showcorrect = false;
    	var showincorrect = false;
    	var count = 0;
    	var dummyarray = [];
    	var correctlength;
    	var review = false;
    	var currentselect = [];
    	var incorrect = [];
    	var Current_Correct = [];
    	var showunattempt = false;
    	var questioncorrect = [];
    	var secs;
    	var min;

    	if ($timetaken) {
    		min = $timetaken / 60;
    		minutes = Math.trunc(min);
    		secs = $timetaken % 60;
    	} else if ($timetaken == 0) {
    		secs = 0;
    	}

    	attempted.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		$$invalidate(7, dummyarray = [...t]);
    		$$invalidate(6, count = t.length);
    	});

    	unattempted.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		Raw_Unattempted = t.length;
    	});

    	currentcorrect.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		Current_Correct = [...t];
    		$$invalidate(0, correctlength = t.length);
    	});

    	function r(x) {
    		$$invalidate(8, review = true);

    		current.update(its => {
    			return x;
    		});

    		if (x == 0) {
    			set_store_value(disable2, $disable2 = true, $disable2);
    		}

    		if (x > 0) {
    			$disable1.set(false);
    		}
    	}

    	selectedanswer.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		$$invalidate(9, currentselect = [...t]);
    	});

    	allincorrect.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		incorrect = [...t];
    	});

    	correctques.subscribe(items => {
    		let t = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		$$invalidate(11, questioncorrect = [...t]);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Result> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(3, showall = true);
    		$$invalidate(4, showcorrect = true);
    		$$invalidate(5, showincorrect = false);
    		$$invalidate(10, showunattempt = false);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(3, showall = true);
    		$$invalidate(4, showcorrect = false);
    		$$invalidate(5, showincorrect = false);
    		$$invalidate(10, showunattempt = false);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(4, showcorrect = true);
    		$$invalidate(5, showincorrect = false);
    		$$invalidate(3, showall = false);
    		$$invalidate(10, showunattempt = false);
    	};

    	const click_handler_3 = () => {
    		$$invalidate(5, showincorrect = true);
    		$$invalidate(4, showcorrect = false);
    		$$invalidate(3, showall = false);
    		$$invalidate(10, showunattempt = false);
    	};

    	const click_handler_4 = () => {
    		$$invalidate(10, showunattempt = true);
    		$$invalidate(4, showcorrect = false);
    		$$invalidate(5, showincorrect = false);
    		$$invalidate(3, showall = false);
    	};

    	$$self.$capture_state = () => ({
    		question,
    		unattempted,
    		attempted,
    		allques,
    		currentcorrect,
    		allincorrect,
    		current,
    		selectedanswer,
    		disable1,
    		disable2,
    		correctques,
    		Nav,
    		timetaken,
    		Review,
    		Heading,
    		minutes,
    		Raw_Unattempted,
    		result,
    		showall,
    		showcorrect,
    		showincorrect,
    		count,
    		dummyarray,
    		correctlength,
    		review,
    		currentselect,
    		incorrect,
    		Current_Correct,
    		showunattempt,
    		questioncorrect,
    		secs,
    		min,
    		r,
    		$disable1,
    		$disable2,
    		$timetaken,
    		$allques,
    		$question
    	});

    	$$self.$inject_state = $$props => {
    		if ('Heading' in $$props) Heading = $$props.Heading;
    		if ('minutes' in $$props) $$invalidate(1, minutes = $$props.minutes);
    		if ('Raw_Unattempted' in $$props) Raw_Unattempted = $$props.Raw_Unattempted;
    		if ('result' in $$props) $$invalidate(2, result = $$props.result);
    		if ('showall' in $$props) $$invalidate(3, showall = $$props.showall);
    		if ('showcorrect' in $$props) $$invalidate(4, showcorrect = $$props.showcorrect);
    		if ('showincorrect' in $$props) $$invalidate(5, showincorrect = $$props.showincorrect);
    		if ('count' in $$props) $$invalidate(6, count = $$props.count);
    		if ('dummyarray' in $$props) $$invalidate(7, dummyarray = $$props.dummyarray);
    		if ('correctlength' in $$props) $$invalidate(0, correctlength = $$props.correctlength);
    		if ('review' in $$props) $$invalidate(8, review = $$props.review);
    		if ('currentselect' in $$props) $$invalidate(9, currentselect = $$props.currentselect);
    		if ('incorrect' in $$props) incorrect = $$props.incorrect;
    		if ('Current_Correct' in $$props) Current_Correct = $$props.Current_Correct;
    		if ('showunattempt' in $$props) $$invalidate(10, showunattempt = $$props.showunattempt);
    		if ('questioncorrect' in $$props) $$invalidate(11, questioncorrect = $$props.questioncorrect);
    		if ('secs' in $$props) $$invalidate(12, secs = $$props.secs);
    		if ('min' in $$props) min = $$props.min;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*correctlength*/ 1) {
    			$$invalidate(0, correctlength);
    		}

    		if ($$self.$$.dirty[0] & /*correctlength*/ 1) {
    			$$invalidate(2, result = Math.round(correctlength / 11 * 100));
    		}
    	};

    	return [
    		correctlength,
    		minutes,
    		result,
    		showall,
    		showcorrect,
    		showincorrect,
    		count,
    		dummyarray,
    		review,
    		currentselect,
    		showunattempt,
    		questioncorrect,
    		secs,
    		$allques,
    		$question,
    		r,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Result extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Result",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\UI\List.svelte generated by Svelte v3.44.2 */
    const file$1 = "src\\UI\\List.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[29] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	child_ctx[32] = i;
    	return child_ctx;
    }

    // (151:2) {#if allitems}
    function create_if_block_4$1(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value_2 = /*$question*/ ctx[6];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*items*/ ctx[30];
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$1, 151, 4, 3725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*goto, $question*/ 8256) {
    				each_value_2 = /*$question*/ ctx[6];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div, destroy_block, create_each_block_2, null, get_each_context_2);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(151:2) {#if allitems}",
    		ctx
    	});

    	return block;
    }

    // (153:6) {#each $question as items, v (items)}
    function create_each_block_2(key_1, ctx) {
    	let div;
    	let t0_value = /*v*/ ctx[32] + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = JSON.parse(/*items*/ ctx[30].content_text).question + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(div, "class", "all-items");
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$1, 153, 8, 3785);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*goto*/ ctx[13](/*v*/ ctx[32], /*items*/ ctx[30]))) /*goto*/ ctx[13](/*v*/ ctx[32], /*items*/ ctx[30]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$question*/ 64 && t0_value !== (t0_value = /*v*/ ctx[32] + 1 + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*$question*/ 64 && t2_value !== (t2_value = JSON.parse(/*items*/ ctx[30].content_text).question + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(153:6) {#each $question as items, v (items)}",
    		ctx
    	});

    	return block;
    }

    // (160:2) {#if showatt}
    function create_if_block_2$1(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value_1 = /*$question*/ ctx[6];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*dataItem*/ ctx[27];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "No Questions Attempted";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "all-items");
    			attr_dev(div0, "tabindex", "0");
    			toggle_class(div0, "hide", /*Raw_Attempt*/ ctx[3].length > 0);
    			add_location(div0, file$1, 161, 6, 4016);
    			attr_dev(div1, "class", "container-1");
    			add_location(div1, file$1, 160, 4, 3983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*Raw_Attempt*/ 8) {
    				toggle_class(div0, "hide", /*Raw_Attempt*/ ctx[3].length > 0);
    			}

    			if (dirty[0] & /*Raw_Attempt, $question, goto*/ 8264) {
    				each_value_1 = /*$question*/ ctx[6];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div1, destroy_block, create_each_block_1, null, get_each_context_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(160:2) {#if showatt}",
    		ctx
    	});

    	return block;
    }

    // (165:8) {#if Raw_Attempt.length >= 0}
    function create_if_block_3$1(ctx) {
    	let div;
    	let t0_value = /*i*/ ctx[29] + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = JSON.parse(/*dataItem*/ ctx[27].content_text).question + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(div, "class", "all-items hid");
    			toggle_class(div, "s", /*Raw_Attempt*/ ctx[3].includes(JSON.parse(/*dataItem*/ ctx[27].content_text).question));
    			add_location(div, file$1, 165, 10, 4226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*goto*/ ctx[13](/*i*/ ctx[29], /*dataItem*/ ctx[27]))) /*goto*/ ctx[13](/*i*/ ctx[29], /*dataItem*/ ctx[27]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$question*/ 64 && t0_value !== (t0_value = /*i*/ ctx[29] + 1 + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*$question*/ 64 && t2_value !== (t2_value = JSON.parse(/*dataItem*/ ctx[27].content_text).question + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*Raw_Attempt, $question*/ 72) {
    				toggle_class(div, "s", /*Raw_Attempt*/ ctx[3].includes(JSON.parse(/*dataItem*/ ctx[27].content_text).question));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(165:8) {#if Raw_Attempt.length >= 0}",
    		ctx
    	});

    	return block;
    }

    // (164:6) {#each $question as dataItem, i (dataItem)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = /*Raw_Attempt*/ ctx[3].length >= 0 && create_if_block_3$1(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*Raw_Attempt*/ ctx[3].length >= 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(164:6) {#each $question as dataItem, i (dataItem)}",
    		ctx
    	});

    	return block;
    }

    // (173:2) {#if showunatt}
    function create_if_block$1(ctx) {
    	let div;
    	let t;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let if_block = /*Raw_Unattempted*/ ctx[0] == 0 && create_if_block_1$1(ctx);
    	let each_value = /*$unattempted*/ ctx[7];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*dos*/ ctx[24];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$1, 173, 4, 4515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Raw_Unattempted*/ ctx[0] == 0) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*gotoa, $unattempted*/ 16512) {
    				each_value = /*$unattempted*/ ctx[7];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(173:2) {#if showunatt}",
    		ctx
    	});

    	return block;
    }

    // (175:6) {#if Raw_Unattempted == 0}
    function create_if_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "ALL ATTEMPTED";
    			attr_dev(div, "class", "all-items");
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$1, 175, 8, 4564);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(175:6) {#if Raw_Unattempted == 0}",
    		ctx
    	});

    	return block;
    }

    // (177:6) {#each $unattempted as dos, j (dos)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let t0_value = localStorage.getItem(/*dos*/ ctx[24]) + "";
    	let t0;
    	let t1;
    	let t2_value = /*dos*/ ctx[24] + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = text(t2_value);
    			attr_dev(div, "class", "all-items");
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$1, 177, 8, 4678);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*gotoa*/ ctx[14](/*j*/ ctx[26], /*dos*/ ctx[24]))) /*gotoa*/ ctx[14](/*j*/ ctx[26], /*dos*/ ctx[24]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$unattempted*/ 128 && t0_value !== (t0_value = localStorage.getItem(/*dos*/ ctx[24]) + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*$unattempted*/ 128 && t2_value !== (t2_value = /*dos*/ ctx[24] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(177:6) {#each $unattempted as dos, j (dos)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let link;
    	let t0;
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let h20;
    	let t4;
    	let h21;
    	let t5;
    	let t6;
    	let t7;
    	let h22;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let mounted;
    	let dispose;
    	let if_block0 = /*allitems*/ ctx[1] && create_if_block_4$1(ctx);
    	let if_block1 = /*showatt*/ ctx[4] && create_if_block_2$1(ctx);
    	let if_block2 = /*showunatt*/ ctx[5] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = `All Items:${/*dummy*/ ctx[8].length}`;
    			t4 = space();
    			h21 = element("h2");
    			t5 = text("Attempted:");
    			t6 = text(/*Remove_Duplicate*/ ctx[2]);
    			t7 = space();
    			h22 = element("h2");
    			t8 = text("UnAttempted:");
    			t9 = text(/*Raw_Unattempted*/ ctx[0]);
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			if (if_block1) if_block1.c();
    			t12 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file$1, 136, 0, 3080);
    			attr_dev(div0, "class", "list-backdrop");
    			add_location(div0, file$1, 137, 0, 3124);
    			attr_dev(h20, "class", "sub-heading");
    			attr_dev(h20, "tabindex", "0");
    			toggle_class(h20, "change", /*allitems*/ ctx[1] && !/*showatt*/ ctx[4] && !/*showunatt*/ ctx[5]);
    			add_location(h20, file$1, 140, 4, 3224);
    			attr_dev(h21, "class", "sub-heading");
    			attr_dev(h21, "tabindex", "0");
    			toggle_class(h21, "change", !/*allitems*/ ctx[1] && /*showatt*/ ctx[4] && !/*showunatt*/ ctx[5]);
    			add_location(h21, file$1, 143, 4, 3381);
    			attr_dev(h22, "class", "sub-heading");
    			toggle_class(h22, "change", !/*allitems*/ ctx[1] && !/*showatt*/ ctx[4] && /*showunatt*/ ctx[5]);
    			add_location(h22, file$1, 146, 4, 3544);
    			attr_dev(div1, "class", "heads");
    			add_location(div1, file$1, 139, 2, 3199);
    			attr_dev(div2, "class", "list");
    			add_location(div2, file$1, 138, 0, 3177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t4);
    			append_dev(div1, h21);
    			append_dev(h21, t5);
    			append_dev(h21, t6);
    			append_dev(div1, t7);
    			append_dev(div1, h22);
    			append_dev(h22, t8);
    			append_dev(h22, t9);
    			append_dev(div2, t10);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t11);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t12);
    			if (if_block2) if_block2.m(div2, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*closeModal*/ ctx[9], false, false, false),
    					listen_dev(h20, "click", /*showitems*/ ctx[12], false, false, false),
    					listen_dev(h21, "click", /*showattempt*/ ctx[10], false, false, false),
    					listen_dev(h22, "click", /*showunattempt*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*allitems, showatt, showunatt*/ 50) {
    				toggle_class(h20, "change", /*allitems*/ ctx[1] && !/*showatt*/ ctx[4] && !/*showunatt*/ ctx[5]);
    			}

    			if (dirty[0] & /*Remove_Duplicate*/ 4) set_data_dev(t6, /*Remove_Duplicate*/ ctx[2]);

    			if (dirty[0] & /*allitems, showatt, showunatt*/ 50) {
    				toggle_class(h21, "change", !/*allitems*/ ctx[1] && /*showatt*/ ctx[4] && !/*showunatt*/ ctx[5]);
    			}

    			if (dirty[0] & /*Raw_Unattempted*/ 1) set_data_dev(t9, /*Raw_Unattempted*/ ctx[0]);

    			if (dirty[0] & /*allitems, showatt, showunatt*/ 50) {
    				toggle_class(h22, "change", !/*allitems*/ ctx[1] && !/*showatt*/ ctx[4] && /*showunatt*/ ctx[5]);
    			}

    			if (/*allitems*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(div2, t11);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showatt*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(div2, t12);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*showunatt*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $currentitem;
    	let $allques;
    	let $counter;
    	let $question;
    	let $unattempted;
    	validate_store(currentitem, 'currentitem');
    	component_subscribe($$self, currentitem, $$value => $$invalidate(19, $currentitem = $$value));
    	validate_store(allques, 'allques');
    	component_subscribe($$self, allques, $$value => $$invalidate(20, $allques = $$value));
    	validate_store(counter, 'counter');
    	component_subscribe($$self, counter, $$value => $$invalidate(21, $counter = $$value));
    	validate_store(question, 'question');
    	component_subscribe($$self, question, $$value => $$invalidate(6, $question = $$value));
    	validate_store(unattempted, 'unattempted');
    	component_subscribe($$self, unattempted, $$value => $$invalidate(7, $unattempted = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, []);
    	var chr = String.fromCharCode(65 + 1);
    	let allitems = true;
    	let Remove_Duplicate;
    	var count;
    	var Raw_Attempt = [];
    	var Raw_Unattempted = [];
    	var Raw_Ques = [];
    	var final = [];
    	var dummy = [];
    	var showatt = false;
    	var showunatt = false;
    	var clicked = false;
    	const dispatch = createEventDispatcher();

    	function closeModal() {
    		dispatch("cancel");

    		counter.update(its => {
    			return $currentitem;
    		});

    		if ($counter == 10) {
    			disable1.set(true);
    		}
    	}

    	allques.subscribe(its => {
    		let Remove_Duplicate = its.filter((c, index) => {
    			return its.indexOf(c) === index;
    		});

    		Raw_Ques = [...Remove_Duplicate];
    	});

    	attempted.subscribe(items => {
    		let Remove_Duplicate = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		$$invalidate(3, Raw_Attempt = [...Raw_Attempt, ...Remove_Duplicate]);
    		$$invalidate(15, count = Remove_Duplicate.length);
    	});

    	for (let i of Raw_Attempt) {
    		let p = $allques.indexOf(i);
    		delete $allques[p];
    	}

    	for (let b of $allques) {
    		if (b != undefined) {
    			Raw_Unattempted.push(b);
    		}
    	}

    	unattempted.update(its => {
    		return [...Raw_Unattempted];
    	});

    	unattempted.subscribe(items => {
    		let e = items.filter((c, index) => {
    			return items.indexOf(c) === index;
    		});

    		final = [...final, ...e];
    	});

    	function showattempt() {
    		$$invalidate(4, showatt = true);
    		$$invalidate(5, showunatt = !showatt);
    		$$invalidate(1, allitems = false);
    	}

    	function showunattempt() {
    		$$invalidate(5, showunatt = !showunatt);
    		$$invalidate(4, showatt = false);
    		$$invalidate(1, allitems = false);
    	}

    	function showitems() {
    		$$invalidate(1, allitems = true);
    		$$invalidate(4, showatt = false);
    		$$invalidate(5, showunatt = false);
    	}

    	function goto(x, event) {
    		clicked = true;

    		question.subscribe(ies => {
    			var z = ies.indexOf(event);
    			currentitem.set(z);

    			if ($currentitem == 0) {
    				counter.set(0);
    				disable2.set(true);
    				disable1.set(false);
    			} else if ($currentitem > 0) {
    				disable2.set(false);
    				disable1.set(false);
    			}
    		});
    	}

    	question.subscribe(item => {
    		for (let y = 0; y < item.length; y++) {
    			let x = JSON.parse(item[y].content_text).question;
    			dummy.push(x);
    		}
    	});

    	function gotoa(y, event) {
    		let p = dummy.indexOf(event);

    		currentitem.update(its => {
    			return p;
    		});

    		if ($currentitem == 0 || $currentitem == 1) {
    			disable2.set(true);
    			disable1.set(false);
    		} else if ($currentitem > 0) {
    			disable2.set(false);
    			disable1.set(false);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		attempted,
    		counter,
    		disable1,
    		disable2,
    		unattempted,
    		currentitem,
    		question,
    		allques,
    		chr,
    		allitems,
    		Remove_Duplicate,
    		count,
    		Raw_Attempt,
    		Raw_Unattempted,
    		Raw_Ques,
    		final,
    		dummy,
    		showatt,
    		showunatt,
    		clicked,
    		dispatch,
    		closeModal,
    		showattempt,
    		showunattempt,
    		showitems,
    		goto,
    		gotoa,
    		$currentitem,
    		$allques,
    		$counter,
    		$question,
    		$unattempted
    	});

    	$$self.$inject_state = $$props => {
    		if ('chr' in $$props) chr = $$props.chr;
    		if ('allitems' in $$props) $$invalidate(1, allitems = $$props.allitems);
    		if ('Remove_Duplicate' in $$props) $$invalidate(2, Remove_Duplicate = $$props.Remove_Duplicate);
    		if ('count' in $$props) $$invalidate(15, count = $$props.count);
    		if ('Raw_Attempt' in $$props) $$invalidate(3, Raw_Attempt = $$props.Raw_Attempt);
    		if ('Raw_Unattempted' in $$props) $$invalidate(0, Raw_Unattempted = $$props.Raw_Unattempted);
    		if ('Raw_Ques' in $$props) Raw_Ques = $$props.Raw_Ques;
    		if ('final' in $$props) final = $$props.final;
    		if ('dummy' in $$props) $$invalidate(8, dummy = $$props.dummy);
    		if ('showatt' in $$props) $$invalidate(4, showatt = $$props.showatt);
    		if ('showunatt' in $$props) $$invalidate(5, showunatt = $$props.showunatt);
    		if ('clicked' in $$props) clicked = $$props.clicked;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*count*/ 32768) {
    			$$invalidate(2, Remove_Duplicate = count);
    		}

    		if ($$self.$$.dirty[0] & /*Raw_Unattempted*/ 1) {
    			$$invalidate(0, Raw_Unattempted = Raw_Unattempted.length);
    		}
    	};

    	return [
    		Raw_Unattempted,
    		allitems,
    		Remove_Duplicate,
    		Raw_Attempt,
    		showatt,
    		showunatt,
    		$question,
    		$unattempted,
    		dummy,
    		closeModal,
    		showattempt,
    		showunattempt,
    		showitems,
    		goto,
    		gotoa,
    		count
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.2 */
    const file = "src\\App.svelte";

    // (99:24) 
    function create_if_block_5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*firstpage*/ ctx[1] && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*firstpage*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*firstpage*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(99:24) ",
    		ctx
    	});

    	return block;
    }

    // (86:2) {#if $startpage}
    function create_if_block_2(ctx) {
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*startloading*/ ctx[0] && create_if_block_4(ctx);
    	const if_block_creators = [create_if_block_3, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$isconfirm*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*startloading*/ ctx[0]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(86:2) {#if $startpage}",
    		ctx
    	});

    	return block;
    }

    // (100:4) {#if firstpage}
    function create_if_block_6(ctx) {
    	let footer;
    	let current;
    	footer = new Footer({ $$inline: true });
    	footer.$on("l", /*listopen*/ ctx[11]);
    	footer.$on("click", /*open*/ ctx[7]);
    	footer.$on("n", /*next*/ ctx[12]);
    	footer.$on("p", /*prev*/ ctx[13]);
    	footer.$on("e", /*end*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(100:4) {#if firstpage}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {#if startloading}
    function create_if_block_4(ctx) {
    	let div;
    	let t;
    	let i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			i = element("i");
    			attr_dev(div, "class", "icon-backdrop");
    			add_location(div, file, 87, 6, 1776);
    			attr_dev(i, "class", "fa fa-spinner fa-spin icon");
    			add_location(i, file, 88, 6, 1812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(87:4) {#if startloading}",
    		ctx
    	});

    	return block;
    }

    // (95:4) {:else}
    function create_else_block(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				style: "button",
    				margin: "btn",
    				type: "button",
    				id: "Start",
    				name: "Start-btn",
    				caption: "Start Test"
    			},
    			$$inline: true
    		});

    	button.$on("click", /*tooglestartpage*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(95:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (92:4) {#if $isconfirm}
    function create_if_block_3(ctx) {
    	let button;
    	let t;
    	let result;
    	let current;

    	button = new Button({
    			props: {
    				class: "success",
    				type: "button",
    				id: "Start",
    				name: "Start-btn",
    				caption: "Start Test"
    			},
    			$$inline: true
    		});

    	button.$on("click", /*tooglestartpage*/ ctx[6]);
    	result = new Result({ $$inline: true });
    	result.$on("res", /*review*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    			t = space();
    			create_component(result.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(result, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(result.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(result.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(result, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(92:4) {#if $isconfirm}",
    		ctx
    	});

    	return block;
    }

    // (105:2) {#if $isopen}
    function create_if_block_1(ctx) {
    	let endtestmodal;
    	let current;
    	endtestmodal = new EndTestModal({ $$inline: true });
    	endtestmodal.$on("cancel", /*cancelit*/ ctx[8]);
    	endtestmodal.$on("confirm", /*confirm*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(endtestmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(endtestmodal, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(endtestmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(endtestmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(endtestmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(105:2) {#if $isopen}",
    		ctx
    	});

    	return block;
    }

    // (109:2) {#if $list}
    function create_if_block(ctx) {
    	let list_1;
    	let current;
    	list_1 = new List({ $$inline: true });
    	list_1.$on("cancel", /*closelist*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(list_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(list_1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(109:2) {#if $list}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link;
    	let t0;
    	let header;
    	let nav;
    	let t1;
    	let main;
    	let current_block_type_index;
    	let if_block0;
    	let t2;
    	let t3;
    	let current;

    	nav = new Nav({
    			props: { Heading: "uCertify Test Prep" },
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_2, create_if_block_5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$startpage*/ ctx[3]) return 0;
    		if (!/*$startpage*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*$isopen*/ ctx[2] && create_if_block_1(ctx);
    	let if_block2 = /*$list*/ ctx[5] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			header = element("header");
    			create_component(nav.$$.fragment);
    			t1 = space();
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "style.css");
    			add_location(link, file, 80, 0, 1618);
    			add_location(header, file, 81, 0, 1661);
    			add_location(main, file, 84, 0, 1721);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			mount_component(nav, header, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			append_dev(main, t2);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t3);
    			if (if_block2) if_block2.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(main, t2);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*$isopen*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$isopen*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$list*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$list*/ 32) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			destroy_component(nav);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $currentitem;
    	let $current;
    	let $counter;
    	let $isopen;
    	let $startpage;
    	let $isconfirm;
    	let $list;
    	validate_store(currentitem, 'currentitem');
    	component_subscribe($$self, currentitem, $$value => $$invalidate(18, $currentitem = $$value));
    	validate_store(current, 'current');
    	component_subscribe($$self, current, $$value => $$invalidate(19, $current = $$value));
    	validate_store(counter, 'counter');
    	component_subscribe($$self, counter, $$value => $$invalidate(20, $counter = $$value));
    	validate_store(isopen, 'isopen');
    	component_subscribe($$self, isopen, $$value => $$invalidate(2, $isopen = $$value));
    	validate_store(startpage, 'startpage');
    	component_subscribe($$self, startpage, $$value => $$invalidate(3, $startpage = $$value));
    	validate_store(isconfirm, 'isconfirm');
    	component_subscribe($$self, isconfirm, $$value => $$invalidate(4, $isconfirm = $$value));
    	validate_store(list, 'list');
    	component_subscribe($$self, list, $$value => $$invalidate(5, $list = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	var startloading = false;
    	var timer;
    	var isend = false;
    	var firstpage = false;

    	function tooglestartpage() {
    		$$invalidate(0, startloading = true);

    		timer = setInterval(
    			() => {
    				startpage.set(false);
    			},
    			1000
    		);

    		$$invalidate(1, firstpage = true);
    		counter.set(0);
    		current.set(0);
    		currentitem.set(0);
    	}

    	function open() {
    		set_store_value(isopen, $isopen = true, $isopen);
    	}

    	function cancelit() {
    		set_store_value(isopen, $isopen = !$isopen, $isopen);
    	}

    	function closelist() {
    		list.set(false);
    		$$invalidate(1, firstpage = true);
    	}

    	function confirm() {
    		isconfirm.set(true);
    		set_store_value(isopen, $isopen = false, $isopen);
    		startpage.set(true);
    		$$invalidate(1, firstpage = true);
    		currentitem.set(0);
    		$$invalidate(0, startloading = false);
    		clearInterval(timer);
    		localStorage.clear();
    	}

    	function listopen() {
    		list.set(true);
    	}

    	function next() {
    		set_store_value(current, $current += 1, $current);
    		set_store_value(counter, $counter += 1, $counter);
    		set_store_value(currentitem, $currentitem += 1, $currentitem);
    	}

    	function prev() {
    		set_store_value(counter, $counter -= 1, $counter);
    		set_store_value(current, $current -= 1, $current);
    		set_store_value(currentitem, $currentitem -= 1, $currentitem);
    	}

    	function end() {
    		isend = true;
    	}

    	function review() {
    		isconfirm.set(false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Nav,
    		Button,
    		Footer,
    		EndTestModal,
    		Result,
    		List,
    		current,
    		currentitem,
    		counter,
    		startpage,
    		isconfirm,
    		list,
    		isopen,
    		startloading,
    		timer,
    		isend,
    		firstpage,
    		tooglestartpage,
    		open,
    		cancelit,
    		closelist,
    		confirm,
    		listopen,
    		next,
    		prev,
    		end,
    		review,
    		$currentitem,
    		$current,
    		$counter,
    		$isopen,
    		$startpage,
    		$isconfirm,
    		$list
    	});

    	$$self.$inject_state = $$props => {
    		if ('startloading' in $$props) $$invalidate(0, startloading = $$props.startloading);
    		if ('timer' in $$props) timer = $$props.timer;
    		if ('isend' in $$props) isend = $$props.isend;
    		if ('firstpage' in $$props) $$invalidate(1, firstpage = $$props.firstpage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		startloading,
    		firstpage,
    		$isopen,
    		$startpage,
    		$isconfirm,
    		$list,
    		tooglestartpage,
    		open,
    		cancelit,
    		closelist,
    		confirm,
    		listopen,
    		next,
    		prev,
    		end,
    		review
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    	
    	
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
