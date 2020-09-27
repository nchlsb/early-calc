
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function sumBy(array, getNumber) {
        let sum = 0;
        for (let a of array) {
            sum += getNumber(a);
        }
        return sum;
    }
    function productBy(array, getNumber) {
        let product = 1;
        for (let a of array) {
            product *= getNumber(a);
        }
        return product;
    }
    function orElse(maybe, alternative) {
        return (maybe.kind === 'Just') ? maybe.value : alternative;
    }
    function maxBy(array, getNumber) {
        if (array.length === 0) {
            return { kind: 'Nothing' };
        }
        let max = array[0];
        for (let a of array) {
            max = (getNumber(a) > getNumber(max)) ? a : max;
        }
        return { kind: 'Just', value: max };
    }
    function minBy(array, getNumber) {
        if (array.length === 0) {
            return { kind: 'Nothing' };
        }
        let max = array[0];
        for (let a of array) {
            max = (getNumber(a) < getNumber(max)) ? a : max;
        }
        return { kind: 'Just', value: max };
    }
    function range(n) {
        let retVal = [];
        for (let i = 0; i < n; i++) {
            retVal.push(i);
        }
        return retVal;
    }
    function endSwitch(x) {
        throw Error('Shouldn\'t get here.');
    }

    // Brett's favorite expression
    // x^2 + (2x + e^pi)
    const brettsFavorite = {
        kind: 'Add',
        expressions: [{
                kind: 'Power',
                base: { kind: 'X' },
                exponent: {
                    kind: 'Literal',
                    value: 2
                }
            }, {
                kind: 'Multiply',
                expressions: [{
                        kind: 'Literal',
                        value: 2
                    }, {
                        kind: 'X'
                    }]
            }, {
                kind: 'Power',
                base: {
                    kind: 'E'
                },
                exponent: {
                    kind: 'Pi'
                }
            }]
    };
    // f(x) = x^2 + (2x + e^pi)
    // f(10) = (10)^2 + ((2 * 10) + e^pi)
    // f(10) = 143.1407
    const result = evaluate(brettsFavorite, 10);
    function evaluate(expression, x) {
        switch (expression.kind) {
            case 'Pi':
                return Math.PI;
            case 'E':
                return Math.E;
            case 'Literal':
                return expression.value;
            case 'X':
                return x;
            case 'Sine':
                return Math.sin(evaluate(expression.argument, x));
            case 'Cosine':
                return Math.cos(evaluate(expression.argument, x));
            case 'Tangent':
                return Math.tan(evaluate(expression.argument, x));
            case 'Add':
                return sumBy(expression.expressions, expression => evaluate(expression, x));
            case 'Subtract':
                return evaluate(expression.left, x) - evaluate(expression.right, x);
            case 'Multiply':
                return productBy(expression.expressions, expression => evaluate(expression, x));
            case 'Divide':
                return evaluate(expression.numerator, x) / evaluate(expression.denominator, x);
            case 'Modular':
                return evaluate(expression.left, x) % evaluate(expression.right, x);
            case 'Negate':
                return -evaluate(expression.argument, x);
            case 'Power':
                return Math.pow(evaluate(expression.base, x), evaluate(expression.exponent, x));
            case 'Log':
                return Math.log(evaluate(expression.argument, x)) / Math.log(evaluate(expression.base, x));
            case 'Radical':
                return Math.pow(evaluate(expression.radicand, x), 1 / evaluate(expression.index, x));
            case 'AbsoulteValue':
                return Math.abs(evaluate(expression.argument, x));
        }
        endSwitch();
    }
    /*

    data Maybe = Nothing | Just Int

    sum :: [Int] -> Int
    sum [] = 0
    sum (x:xs) = x + sum xs

    switch (list.kind) {
        case NIL:
            return 0

        case CONS:
            return list.first + sum (list.rest)
    }

    */
    function toTeX(expression) {
        switch (expression.kind) {
            case "Add":
                return `\\left(${expression.expressions.map(toTeX).join(" + ")}\\right)`;
            case "Divide":
                return `\\frac{${toTeX(expression.numerator)}}{${toTeX(expression.denominator)}}`;
            case "Multiply":
                return `${expression.expressions.map(toTeX).join('')}`;
            case "Subtract":
                return `\\left(${toTeX(expression.left)} - ${toTeX(expression.right)}\\right)`;
            case "Sine":
                return `\\sin\\left(${toTeX(expression.argument)}\\right)`;
            case "Cosine":
                return `\\cos\\left(${toTeX(expression.argument)}\\right)`;
            case "Tangent":
                return `\\tan\\left(${toTeX(expression.argument)}\\right)`;
            case "E":
                return `e`;
            case "Pi":
                return `\\pi`;
            case "X":
                return `x`;
            case "Log":
                return `\\log_{${toTeX(expression.base)}}\\left(${toTeX(expression.argument)}\\right)`;
            case "Negate":
                return `\\left(${toTeX(expression.argument)}\\right)`;
            case "Modular":
                return `\\left(${toTeX(expression.left)} \\mod ${toTeX(expression.right)}\\right)`;
            case "Power":
                return `${toTeX(expression.base)}^{${toTeX(expression.exponent)}}`;
            case "Radical":
                return `\\sqrt[{${toTeX(expression.index)}}]{${toTeX(expression.radicand)}}`;
            case "Literal":
                return `${expression.value}`;
            case "AbsoulteValue":
                return `\\left|${expression.argument}\\right|`;
        }
        endSwitch();
    }
    const tex = toTeX(brettsFavorite);

    /* src\App.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (113:3) {#each riemannRectangles as rectangle}
    function create_each_block(ctx) {
    	let rect;
    	let rect_x_value;
    	let rect_y_value;
    	let rect_width_value;
    	let rect_height_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "class", "riemann-rectangle svelte-1sfxdlc");
    			attr_dev(rect, "x", rect_x_value = /*rectangle*/ ctx[24].lowerLeftCorner.x);
    			attr_dev(rect, "y", rect_y_value = /*rectangle*/ ctx[24].lowerLeftCorner.y);
    			attr_dev(rect, "width", rect_width_value = /*rectangle*/ ctx[24].width);
    			attr_dev(rect, "height", rect_height_value = /*rectangle*/ ctx[24].height);
    			add_location(rect, file, 113, 5, 4233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*riemannRectangles*/ 512 && rect_x_value !== (rect_x_value = /*rectangle*/ ctx[24].lowerLeftCorner.x)) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty & /*riemannRectangles*/ 512 && rect_y_value !== (rect_y_value = /*rectangle*/ ctx[24].lowerLeftCorner.y)) {
    				attr_dev(rect, "y", rect_y_value);
    			}

    			if (dirty & /*riemannRectangles*/ 512 && rect_width_value !== (rect_width_value = /*rectangle*/ ctx[24].width)) {
    				attr_dev(rect, "width", rect_width_value);
    			}

    			if (dirty & /*riemannRectangles*/ 512 && rect_height_value !== (rect_height_value = /*rectangle*/ ctx[24].height)) {
    				attr_dev(rect, "height", rect_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(113:3) {#each riemannRectangles as rectangle}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let p;
    	let code;
    	let t0_value = /*render*/ ctx[11](/*expression*/ ctx[10]) + "";
    	let t0;
    	let t1;
    	let button;
    	let t3;
    	let ul;
    	let li0;
    	let t7;
    	let li1;
    	let t10;
    	let li2;
    	let t11;
    	let t12;
    	let t13;
    	let input0;
    	let input0_max_value;
    	let t14;
    	let li3;
    	let t15;
    	let select;
    	let option0;
    	let t16;
    	let option0_value_value;
    	let option1;
    	let option1_value_value;
    	let t18;
    	let li4;
    	let t19;
    	let t20_value = Math.round(sumBy(/*riemannRectangles*/ ctx[9], func_2)) + "";
    	let t20;
    	let t21;
    	let li5;
    	let t22;
    	let t23;
    	let t24;
    	let t25;
    	let svg;
    	let g;
    	let line0;
    	let line1;
    	let line2;
    	let line3;
    	let polyline;
    	let polyline_points_value;
    	let svg_viewBox_value;
    	let t26;
    	let input1;
    	let t27;
    	let input2;
    	let t28;
    	let input3;
    	let input3_max_value;
    	let t29;
    	let input4;
    	let input4_min_value;
    	let mounted;
    	let dispose;
    	let each_value = /*riemannRectangles*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			code = element("code");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Add Plus";
    			t3 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = `Should be \\[ ${tex} \\]`;
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = `Should be 143.1407 : ..... ${result}`;
    			t10 = space();
    			li2 = element("li");
    			t11 = text("Rectangle Width ");
    			t12 = text(/*dx*/ ctx[6]);
    			t13 = space();
    			input0 = element("input");
    			t14 = space();
    			li3 = element("li");
    			t15 = text("Function\r\n\t\t\t");
    			select = element("select");
    			option0 = element("option");
    			t16 = text("Sine");
    			option1 = element("option");
    			option1.textContent = "Squared";
    			t18 = space();
    			li4 = element("li");
    			t19 = text("The sum of the rectangles rounded to 1's place is ");
    			t20 = text(t20_value);
    			t21 = space();
    			li5 = element("li");
    			t22 = text(/*yMinBound*/ ctx[3]);
    			t23 = space();
    			t24 = text(/*yMaxBound*/ ctx[2]);
    			t25 = space();
    			svg = svg_element("svg");
    			g = svg_element("g");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			line3 = svg_element("line");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			polyline = svg_element("polyline");
    			t26 = space();
    			input1 = element("input");
    			t27 = space();
    			input2 = element("input");
    			t28 = space();
    			input3 = element("input");
    			t29 = space();
    			input4 = element("input");
    			add_location(code, file, 72, 4, 2741);
    			add_location(p, file, 72, 1, 2738);
    			add_location(button, file, 73, 1, 2783);
    			add_location(li0, file, 76, 2, 2884);
    			add_location(li1, file, 80, 2, 2929);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "0.1");
    			attr_dev(input0, "step", ".1");
    			attr_dev(input0, "max", input0_max_value = /*integralUpperBound*/ ctx[4] - /*integralLowerBound*/ ctx[5]);
    			add_location(input0, file, 85, 3, 3020);
    			add_location(li2, file, 83, 2, 2986);
    			attr_dev(option0, "default", "");
    			option0.__value = option0_value_value = /*func*/ ctx[15];
    			option0.value = option0.__value;
    			add_location(option0, file, 90, 4, 3186);
    			option1.__value = option1_value_value = func_1;
    			option1.value = option1.__value;
    			add_location(option1, file, 91, 4, 3246);
    			if (/*f*/ ctx[7] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[16].call(select));
    			add_location(select, file, 89, 3, 3157);
    			add_location(li3, file, 87, 2, 3135);
    			add_location(li4, file, 94, 2, 3319);
    			add_location(li5, file, 98, 2, 3484);
    			add_location(ul, file, 75, 1, 2876);
    			attr_dev(line0, "stroke", "black");
    			attr_dev(line0, "fill", "none");
    			attr_dev(line0, "x1", /*xMinBound*/ ctx[1]);
    			attr_dev(line0, "y1", "0");
    			attr_dev(line0, "x2", /*xMaxBound*/ ctx[0]);
    			attr_dev(line0, "y2", "0");
    			attr_dev(line0, "class", "svelte-1sfxdlc");
    			add_location(line0, file, 104, 3, 3677);
    			attr_dev(line1, "stroke", "black");
    			attr_dev(line1, "fill", "none");
    			attr_dev(line1, "x1", "0");
    			attr_dev(line1, "y1", /*yMinBound*/ ctx[3]);
    			attr_dev(line1, "x2", "0");
    			attr_dev(line1, "y2", /*yMaxBound*/ ctx[2]);
    			attr_dev(line1, "class", "svelte-1sfxdlc");
    			add_location(line1, file, 105, 3, 3761);
    			attr_dev(line2, "stroke", "black");
    			attr_dev(line2, "stroke-dasharray", "2,2");
    			attr_dev(line2, "fill", "none");
    			attr_dev(line2, "x1", /*integralLowerBound*/ ctx[5]);
    			attr_dev(line2, "y1", /*yMinBound*/ ctx[3]);
    			attr_dev(line2, "x2", /*integralLowerBound*/ ctx[5]);
    			attr_dev(line2, "y2", /*yMaxBound*/ ctx[2]);
    			attr_dev(line2, "class", "svelte-1sfxdlc");
    			add_location(line2, file, 108, 3, 3880);
    			attr_dev(line3, "stroke", "black");
    			attr_dev(line3, "stroke-dasharray", "2,2");
    			attr_dev(line3, "fill", "none");
    			attr_dev(line3, "x1", /*integralUpperBound*/ ctx[4]);
    			attr_dev(line3, "y1", /*yMinBound*/ ctx[3]);
    			attr_dev(line3, "x2", /*integralUpperBound*/ ctx[4]);
    			attr_dev(line3, "y2", /*yMaxBound*/ ctx[2]);
    			attr_dev(line3, "class", "svelte-1sfxdlc");
    			add_location(line3, file, 109, 3, 4021);
    			attr_dev(polyline, "stroke", "black");
    			attr_dev(polyline, "fill", "none");
    			attr_dev(polyline, "points", polyline_points_value = /*points*/ ctx[8].map(func_3).join(" "));
    			attr_dev(polyline, "class", "svelte-1sfxdlc");
    			add_location(polyline, file, 123, 3, 4472);
    			attr_dev(g, "class", "svelte-1sfxdlc");
    			add_location(g, file, 102, 2, 3643);
    			attr_dev(svg, "class", "cartesian svelte-1sfxdlc");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "" + (/*xMinBound*/ ctx[1] + " " + /*yMinBound*/ ctx[3] + " " + (/*xMaxBound*/ ctx[0] - /*xMinBound*/ ctx[1]) + " " + (/*yMaxBound*/ ctx[2] - /*yMinBound*/ ctx[3])));
    			add_location(svg, file, 101, 1, 3529);
    			attr_dev(input1, "class", "bound-range svelte-1sfxdlc");
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "min", /*xMinBound*/ ctx[1]);
    			attr_dev(input1, "max", /*xMaxBound*/ ctx[0]);
    			attr_dev(input1, "step", ".01");
    			add_location(input1, file, 128, 1, 4599);
    			attr_dev(input2, "class", "bound-range svelte-1sfxdlc");
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "min", /*xMinBound*/ ctx[1]);
    			attr_dev(input2, "max", /*xMaxBound*/ ctx[0]);
    			attr_dev(input2, "step", ".01");
    			add_location(input2, file, 129, 1, 4717);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "max", input3_max_value = /*xMaxBound*/ ctx[0] - 1);
    			add_location(input3, file, 131, 1, 4837);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "min", input4_min_value = /*xMinBound*/ ctx[1] + 1);
    			add_location(input4, file, 132, 1, 4904);
    			attr_dev(main, "class", "svelte-1sfxdlc");
    			add_location(main, file, 71, 0, 2729);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(p, code);
    			append_dev(code, t0);
    			append_dev(main, t1);
    			append_dev(main, button);
    			append_dev(main, t3);
    			append_dev(main, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(ul, t10);
    			append_dev(ul, li2);
    			append_dev(li2, t11);
    			append_dev(li2, t12);
    			append_dev(li2, t13);
    			append_dev(li2, input0);
    			set_input_value(input0, /*dx*/ ctx[6]);
    			append_dev(ul, t14);
    			append_dev(ul, li3);
    			append_dev(li3, t15);
    			append_dev(li3, select);
    			append_dev(select, option0);
    			append_dev(option0, t16);
    			append_dev(select, option1);
    			select_option(select, /*f*/ ctx[7]);
    			append_dev(ul, t18);
    			append_dev(ul, li4);
    			append_dev(li4, t19);
    			append_dev(li4, t20);
    			append_dev(ul, t21);
    			append_dev(ul, li5);
    			append_dev(li5, t22);
    			append_dev(li5, t23);
    			append_dev(li5, t24);
    			append_dev(main, t25);
    			append_dev(main, svg);
    			append_dev(svg, g);
    			append_dev(g, line0);
    			append_dev(g, line1);
    			append_dev(g, line2);
    			append_dev(g, line3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			append_dev(g, polyline);
    			append_dev(main, t26);
    			append_dev(main, input1);
    			set_input_value(input1, /*integralLowerBound*/ ctx[5]);
    			append_dev(main, t27);
    			append_dev(main, input2);
    			set_input_value(input2, /*integralUpperBound*/ ctx[4]);
    			append_dev(main, t28);
    			append_dev(main, input3);
    			set_input_value(input3, /*xMinBound*/ ctx[1]);
    			append_dev(main, t29);
    			append_dev(main, input4);
    			set_input_value(input4, /*xMaxBound*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[13], false, false, false),
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[14]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[14]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[16]),
    					listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[17]),
    					listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[17]),
    					listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[18]),
    					listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[18]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[19]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[20])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*expression*/ 1024 && t0_value !== (t0_value = /*render*/ ctx[11](/*expression*/ ctx[10]) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*dx*/ 64) set_data_dev(t12, /*dx*/ ctx[6]);

    			if (dirty & /*integralUpperBound, integralLowerBound*/ 48 && input0_max_value !== (input0_max_value = /*integralUpperBound*/ ctx[4] - /*integralLowerBound*/ ctx[5])) {
    				attr_dev(input0, "max", input0_max_value);
    			}

    			if (dirty & /*dx*/ 64) {
    				set_input_value(input0, /*dx*/ ctx[6]);
    			}

    			if (dirty & /*f, Math*/ 128) {
    				select_option(select, /*f*/ ctx[7]);
    			}

    			if (dirty & /*riemannRectangles*/ 512 && t20_value !== (t20_value = Math.round(sumBy(/*riemannRectangles*/ ctx[9], func_2)) + "")) set_data_dev(t20, t20_value);
    			if (dirty & /*yMinBound*/ 8) set_data_dev(t22, /*yMinBound*/ ctx[3]);
    			if (dirty & /*yMaxBound*/ 4) set_data_dev(t24, /*yMaxBound*/ ctx[2]);

    			if (dirty & /*xMinBound*/ 2) {
    				attr_dev(line0, "x1", /*xMinBound*/ ctx[1]);
    			}

    			if (dirty & /*xMaxBound*/ 1) {
    				attr_dev(line0, "x2", /*xMaxBound*/ ctx[0]);
    			}

    			if (dirty & /*yMinBound*/ 8) {
    				attr_dev(line1, "y1", /*yMinBound*/ ctx[3]);
    			}

    			if (dirty & /*yMaxBound*/ 4) {
    				attr_dev(line1, "y2", /*yMaxBound*/ ctx[2]);
    			}

    			if (dirty & /*integralLowerBound*/ 32) {
    				attr_dev(line2, "x1", /*integralLowerBound*/ ctx[5]);
    			}

    			if (dirty & /*yMinBound*/ 8) {
    				attr_dev(line2, "y1", /*yMinBound*/ ctx[3]);
    			}

    			if (dirty & /*integralLowerBound*/ 32) {
    				attr_dev(line2, "x2", /*integralLowerBound*/ ctx[5]);
    			}

    			if (dirty & /*yMaxBound*/ 4) {
    				attr_dev(line2, "y2", /*yMaxBound*/ ctx[2]);
    			}

    			if (dirty & /*integralUpperBound*/ 16) {
    				attr_dev(line3, "x1", /*integralUpperBound*/ ctx[4]);
    			}

    			if (dirty & /*yMinBound*/ 8) {
    				attr_dev(line3, "y1", /*yMinBound*/ ctx[3]);
    			}

    			if (dirty & /*integralUpperBound*/ 16) {
    				attr_dev(line3, "x2", /*integralUpperBound*/ ctx[4]);
    			}

    			if (dirty & /*yMaxBound*/ 4) {
    				attr_dev(line3, "y2", /*yMaxBound*/ ctx[2]);
    			}

    			if (dirty & /*riemannRectangles*/ 512) {
    				each_value = /*riemannRectangles*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, polyline);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*points*/ 256 && polyline_points_value !== (polyline_points_value = /*points*/ ctx[8].map(func_3).join(" "))) {
    				attr_dev(polyline, "points", polyline_points_value);
    			}

    			if (dirty & /*xMinBound, yMinBound, xMaxBound, yMaxBound*/ 15 && svg_viewBox_value !== (svg_viewBox_value = "" + (/*xMinBound*/ ctx[1] + " " + /*yMinBound*/ ctx[3] + " " + (/*xMaxBound*/ ctx[0] - /*xMinBound*/ ctx[1]) + " " + (/*yMaxBound*/ ctx[2] - /*yMinBound*/ ctx[3])))) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*xMinBound*/ 2) {
    				attr_dev(input1, "min", /*xMinBound*/ ctx[1]);
    			}

    			if (dirty & /*xMaxBound*/ 1) {
    				attr_dev(input1, "max", /*xMaxBound*/ ctx[0]);
    			}

    			if (dirty & /*integralLowerBound*/ 32) {
    				set_input_value(input1, /*integralLowerBound*/ ctx[5]);
    			}

    			if (dirty & /*xMinBound*/ 2) {
    				attr_dev(input2, "min", /*xMinBound*/ ctx[1]);
    			}

    			if (dirty & /*xMaxBound*/ 1) {
    				attr_dev(input2, "max", /*xMaxBound*/ ctx[0]);
    			}

    			if (dirty & /*integralUpperBound*/ 16) {
    				set_input_value(input2, /*integralUpperBound*/ ctx[4]);
    			}

    			if (dirty & /*xMaxBound*/ 1 && input3_max_value !== (input3_max_value = /*xMaxBound*/ ctx[0] - 1)) {
    				attr_dev(input3, "max", input3_max_value);
    			}

    			if (dirty & /*xMinBound*/ 2 && to_number(input3.value) !== /*xMinBound*/ ctx[1]) {
    				set_input_value(input3, /*xMinBound*/ ctx[1]);
    			}

    			if (dirty & /*xMinBound*/ 2 && input4_min_value !== (input4_min_value = /*xMinBound*/ ctx[1] + 1)) {
    				attr_dev(input4, "min", input4_min_value);
    			}

    			if (dirty & /*xMaxBound*/ 1 && to_number(input4.value) !== /*xMaxBound*/ ctx[0]) {
    				set_input_value(input4, /*xMaxBound*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    const DEFAULT_BOUND_MAGNITUDE = 10;
    const func_1 = x => x * x;
    const func_2 = rectangle => rectangle.width * rectangle.height;
    const func_3 = point => `${point.x},${point.y}`;

    function instance($$self, $$props, $$invalidate) {
    	
    	let xMaxBound = DEFAULT_BOUND_MAGNITUDE;
    	let xMinBound = -DEFAULT_BOUND_MAGNITUDE;
    	let yMaxBound;
    	let yMinBound;
    	let integralUpperBound = DEFAULT_BOUND_MAGNITUDE;
    	let integralLowerBound = -DEFAULT_BOUND_MAGNITUDE;
    	let dx = 1;
    	let f;
    	let numberOfPoints = 100;

    	// -10 -> 5
    	// offset => 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
    	// lowerBound + offset
    	// -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5
    	let points;

    	let numberRectangles;
    	let riemannRectangles;

    	function render(expression) {
    		switch (expression.kind) {
    			case "Plus":
    				return `(${render(expression.left)} + ${render(expression.right)})`;
    			case "1":
    				return "1";
    			case "Active":
    				return "□";
    			case "Inactive":
    				return "■";
    		}

    		endSwitch();
    	}

    	function turnActiveIntoPlus(expression) {
    		console.log("Calling Jaffa");

    		switch (expression.kind) {
    			case "1":
    				return { kind: "1" };
    			case "Inactive":
    				return { kind: "Inactive" };
    			case "Active":
    				return {
    					kind: "Plus",
    					left: { kind: "Active" },
    					right: { kind: "Inactive" }
    				};
    			case "Plus":
    				return {
    					kind: "Plus",
    					left: turnActiveIntoPlus(expression.left),
    					right: turnActiveIntoPlus(expression.right)
    				};
    		}

    		endSwitch();
    	}

    	function hasActive(expression) {
    		switch (expression.kind) {
    			case "1":
    				return false;
    			case "Inactive":
    				return false;
    			case "Active":
    				return true;
    			case "Plus":
    				return hasActive(expression.left) || hasActive(expression.right);
    		}

    		endSwitch();
    	}

    	let expression = { kind: "Active" };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => $$invalidate(10, expression = turnActiveIntoPlus(expression));

    	function input0_change_input_handler() {
    		dx = to_number(this.value);
    		$$invalidate(6, dx);
    	}

    	const func = x => Math.sin(x);

    	function select_change_handler() {
    		f = select_value(this);
    		$$invalidate(7, f);
    	}

    	function input1_change_input_handler() {
    		integralLowerBound = to_number(this.value);
    		$$invalidate(5, integralLowerBound);
    	}

    	function input2_change_input_handler() {
    		integralUpperBound = to_number(this.value);
    		$$invalidate(4, integralUpperBound);
    	}

    	function input3_input_handler() {
    		xMinBound = to_number(this.value);
    		$$invalidate(1, xMinBound);
    	}

    	function input4_input_handler() {
    		xMaxBound = to_number(this.value);
    		$$invalidate(0, xMaxBound);
    	}

    	$$self.$capture_state = () => ({
    		result,
    		tex,
    		endSwitch,
    		maxBy,
    		minBy,
    		orElse,
    		range,
    		sumBy,
    		onMount,
    		DEFAULT_BOUND_MAGNITUDE,
    		xMaxBound,
    		xMinBound,
    		yMaxBound,
    		yMinBound,
    		integralUpperBound,
    		integralLowerBound,
    		dx,
    		f,
    		numberOfPoints,
    		points,
    		numberRectangles,
    		riemannRectangles,
    		render,
    		turnActiveIntoPlus,
    		hasActive,
    		expression
    	});

    	$$self.$inject_state = $$props => {
    		if ("xMaxBound" in $$props) $$invalidate(0, xMaxBound = $$props.xMaxBound);
    		if ("xMinBound" in $$props) $$invalidate(1, xMinBound = $$props.xMinBound);
    		if ("yMaxBound" in $$props) $$invalidate(2, yMaxBound = $$props.yMaxBound);
    		if ("yMinBound" in $$props) $$invalidate(3, yMinBound = $$props.yMinBound);
    		if ("integralUpperBound" in $$props) $$invalidate(4, integralUpperBound = $$props.integralUpperBound);
    		if ("integralLowerBound" in $$props) $$invalidate(5, integralLowerBound = $$props.integralLowerBound);
    		if ("dx" in $$props) $$invalidate(6, dx = $$props.dx);
    		if ("f" in $$props) $$invalidate(7, f = $$props.f);
    		if ("numberOfPoints" in $$props) $$invalidate(22, numberOfPoints = $$props.numberOfPoints);
    		if ("points" in $$props) $$invalidate(8, points = $$props.points);
    		if ("numberRectangles" in $$props) $$invalidate(21, numberRectangles = $$props.numberRectangles);
    		if ("riemannRectangles" in $$props) $$invalidate(9, riemannRectangles = $$props.riemannRectangles);
    		if ("expression" in $$props) $$invalidate(10, expression = $$props.expression);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*xMinBound, xMaxBound, f*/ 131) {
    			 $$invalidate(8, points = [
    				...range(numberOfPoints).map(n => {
    					const x = xMinBound + n * ((xMaxBound - xMinBound) / numberOfPoints);
    					return { x, y: f(x) };
    				}),
    				{ x: xMaxBound, y: f(xMaxBound) }
    			]);
    		}

    		if ($$self.$$.dirty & /*points*/ 256) {
    			 $$invalidate(2, yMaxBound = orElse(maxBy(points.map(point => point.y), y => y), DEFAULT_BOUND_MAGNITUDE) + 1);
    		}

    		if ($$self.$$.dirty & /*points*/ 256) {
    			 $$invalidate(3, yMinBound = orElse(minBy(points.map(point => point.y), y => y), -DEFAULT_BOUND_MAGNITUDE) - 1);
    		}

    		if ($$self.$$.dirty & /*integralUpperBound, integralLowerBound, dx*/ 112) {
    			 $$invalidate(21, numberRectangles = (integralUpperBound - integralLowerBound) / dx);
    		}

    		if ($$self.$$.dirty & /*numberRectangles, integralLowerBound, integralUpperBound, f, dx*/ 2097392) {
    			 $$invalidate(9, riemannRectangles = range(numberRectangles).map(n => {
    				const x = integralLowerBound + n * (integralUpperBound - integralLowerBound) / numberRectangles;
    				const y = f(x);

    				// SVG can't process negative height 
    				return {
    					height: Math.abs(y),
    					width: dx,
    					lowerLeftCorner: { x, y: y > 0 ? 0 : y }
    				};
    			}));
    		}
    	};

    	 $$invalidate(7, f = x => Math.sin(x));

    	return [
    		xMaxBound,
    		xMinBound,
    		yMaxBound,
    		yMinBound,
    		integralUpperBound,
    		integralLowerBound,
    		dx,
    		f,
    		points,
    		riemannRectangles,
    		expression,
    		render,
    		turnActiveIntoPlus,
    		click_handler,
    		input0_change_input_handler,
    		func,
    		select_change_handler,
    		input1_change_input_handler,
    		input2_change_input_handler,
    		input3_input_handler,
    		input4_input_handler
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
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
