
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
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

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
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
    function tick() {
        schedule_update();
        return resolved_promise;
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
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

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const MATCH_PARAM = RegExp(/\:([^/()]+)/g);

    function handleScroll (element) {
      if (navigator.userAgent.includes('jsdom')) return false
      scrollAncestorsToTop(element);
      handleHash();
    }

    function handleHash () {
      if (navigator.userAgent.includes('jsdom')) return false
      const { hash } = window.location;
      if (hash) {
        const validElementIdRegex = /^[A-Za-z]+[\w\-\:\.]*$/;
        if (validElementIdRegex.test(hash.substring(1))) {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView();
        }
      }
    }

    function scrollAncestorsToTop (element) {
      if (
        element &&
        element.scrollTo &&
        element.dataset.routify !== 'scroll-lock' &&
        element.dataset['routify-scroll'] !== 'lock'
      ) {
        element.style['scroll-behavior'] = 'auto';
        element.scrollTo({ top: 0, behavior: 'auto' });
        element.style['scroll-behavior'] = '';
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParamKeys = string => {
      const paramsKeys = [];
      let matches;
      while ((matches = MATCH_PARAM.exec(string))) paramsKeys.push(matches[1]);
      return paramsKeys
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/')
        .filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    let warningSuppressed = false;

    /* eslint no-console: 0 */
    function suppressWarnings () {
      if (warningSuppressed) return
      const consoleWarn = console.warn;
      console.warn = function (msg, ...msgs) {
        const ignores = [
          "was created with unknown prop 'scoped'",
          "was created with unknown prop 'scopedSync'",
        ];
        if (!ignores.find(iMsg => msg.includes(iMsg)))
          return consoleWarn(msg, ...msgs)
      };
      warningSuppressed = true;
    }

    function currentLocation () {
      const pathMatch = window.location.search.match(/__routify_path=([^&]+)/);
      const prefetchMatch = window.location.search.match(/__routify_prefetch=\d+/);
      window.routify = window.routify || {};
      window.routify.prefetched = prefetchMatch ? true : false;
      const path = pathMatch && pathMatch[1].replace(/[#?].+/, ''); // strip any thing after ? and #
      return path || window.location.pathname
    }

    window.routify = window.routify || {};

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const route = writable(null); // the actual route being rendered

    /** @type {import('svelte/store').Writable<RouteNode[]>} */
    const routes = writable([]); // all routes
    routes.subscribe(routes => (window.routify.routes = routes));

    let rootContext = writable({ component: { params: {} } });

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const urlRoute = writable(null);  // the route matching the url

    /** @type {import('svelte/store').Writable<String>} */
    const basepath = (() => {
        const { set, subscribe } = writable("");

        return {
            subscribe,
            set(value) {
                if (value.match(/^[/(]/))
                    set(value);
                else console.warn('Basepaths must start with / or (');
            },
            update() { console.warn('Use assignment or set to update basepaths.'); }
        }
    })();

    const location$1 = derived( // the part of the url matching the basepath
        [basepath, urlRoute],
        ([$basepath, $route]) => {
            const [, base, path] = currentLocation().match(`^(${$basepath})(${$route.regex})`) || [];
            return { base, path }
        }
    );

    const prefetchPath = writable("");

    function onAppLoaded({ path, metatags }) {
        metatags.update();
        const prefetchMatch = window.location.search.match(/__routify_prefetch=(\d+)/);
        const prefetchId = prefetchMatch && prefetchMatch[1];

        dispatchEvent(new CustomEvent('app-loaded'));
        parent.postMessage({
            msg: 'app-loaded',
            prefetched: window.routify.prefetched,
            path,
            prefetchId
        }, "*");
        window['routify'].appLoaded = true;
    }

    var defaultConfig = {
        queryHandler: {
            parse: search => fromEntries(new URLSearchParams(search)),
            stringify: params => '?' + (new URLSearchParams(params)).toString()
        }
    };


    function fromEntries(iterable) {
        return [...iterable].reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj
        }, {})
    }

    /**
     * @param {string} url 
     * @return {ClientNode}
     */
    function urlToRoute(url) {
        /** @type {RouteNode[]} */
        const routes$1 = get_store_value(routes);
        const basepath$1 = get_store_value(basepath);
        const route = routes$1.find(route => url.match(`^${basepath$1}${route.regex}`));
        if (!route)
            throw new Error(
                `Route could not be found for "${url}".`
            )

        const [, base] = url.match(`^(${basepath$1})${route.regex}`);
        const path = url.slice(base.length);

        if (defaultConfig.queryHandler)
            route.params = defaultConfig.queryHandler.parse(window.location.search);

        if (route.paramKeys) {
            const layouts = layoutByPos(route.layouts);
            const fragments = path.split('/').filter(Boolean);
            const routeProps = getRouteProps(route.path);

            routeProps.forEach((prop, i) => {
                if (prop) {
                    route.params[prop] = fragments[i];
                    if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
                    else route.param = { [prop]: fragments[i] };
                }
            });
        }

        route.leftover = url.replace(new RegExp(base + route.regex), '');

        return route
    }


    /**
     * @param {array} layouts
     */
    function layoutByPos(layouts) {
        const arr = [];
        layouts.forEach(layout => {
            arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
        });
        return arr
    }


    /**
     * @param {string} url
     */
    function getRouteProps(url) {
        return url
            .split('/')
            .filter(Boolean)
            .map(f => f.match(/\:(.+)/))
            .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Prefetcher.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1 } = globals;
    const file = "node_modules/@sveltech/routify/runtime/Prefetcher.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (93:2) {#each $actives as prefetch (prefetch.options.prefetch)}
    function create_each_block(key_1, ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			iframe = element("iframe");
    			if (iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "title", "routify prefetcher");
    			add_location(iframe, file, 93, 4, 2549);
    			this.first = iframe;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$actives*/ 1 && iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(93:2) {#each $actives as prefetch (prefetch.options.prefetch)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*$actives*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*prefetch*/ ctx[1].options.prefetch;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "__routify_iframes");
    			set_style(div, "display", "none");
    			add_location(div, file, 91, 0, 2435);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$actives*/ 1) {
    				const each_value = /*$actives*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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

    const iframeNum = 2;

    const defaults = {
    	validFor: 60,
    	timeout: 5000,
    	gracePeriod: 1000
    };

    /** stores and subscriptions */
    const queue = writable([]);

    const actives = derived(queue, q => q.slice(0, iframeNum));

    actives.subscribe(actives => actives.forEach(({ options }) => {
    	setTimeout(() => removeFromQueue(options.prefetch), options.timeout);
    }));

    function prefetch(path, options = {}) {
    	prefetch.id = prefetch.id || 1;

    	path = !path.href
    	? path
    	: path.href.replace(/^(?:\/\/|[^/]+)*\//, "/");

    	//replace first ? since were mixing user queries with routify queries
    	path = path.replace("?", "&");

    	options = { ...defaults, ...options, path };
    	options.prefetch = prefetch.id++;

    	//don't prefetch within prefetch or SSR
    	if (window.routify.prefetched || navigator.userAgent.match("jsdom")) return false;

    	// add to queue
    	queue.update(q => {
    		if (!q.some(e => e.options.path === path)) q.push({
    			url: `/__app.html?${optionsToQuery(options)}`,
    			options
    		});

    		return q;
    	});
    }

    /**
     * convert options to query string
     * {a:1,b:2} becomes __routify_a=1&routify_b=2
     * @param {defaults & {path: string, prefetch: number}} options
     */
    function optionsToQuery(options) {
    	return Object.entries(options).map(([key, val]) => `__routify_${key}=${val}`).join("&");
    }

    /**
     * @param {number|MessageEvent} idOrEvent
     */
    function removeFromQueue(idOrEvent) {
    	const id = idOrEvent.data ? idOrEvent.data.prefetchId : idOrEvent;
    	if (!id) return null;
    	const entry = get_store_value(queue).find(entry => entry && entry.options.prefetch == id);

    	// removeFromQueue is called by both eventListener and timeout,
    	// but we can only remove the item once
    	if (entry) {
    		const { gracePeriod } = entry.options;
    		const gracePromise = new Promise(resolve => setTimeout(resolve, gracePeriod));

    		const idlePromise = new Promise(resolve => {
    				window.requestIdleCallback
    				? window.requestIdleCallback(resolve)
    				: setTimeout(resolve, gracePeriod + 1000);
    			});

    		Promise.all([gracePromise, idlePromise]).then(() => {
    			queue.update(q => q.filter(q => q.options.prefetch != id));
    		});
    	}
    }

    // Listen to message from child window
    addEventListener("message", removeFromQueue, false);

    function instance($$self, $$props, $$invalidate) {
    	let $actives;
    	validate_store(actives, "actives");
    	component_subscribe($$self, actives, $$value => $$invalidate(0, $actives = $$value));
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prefetcher> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Prefetcher", $$slots, []);

    	$$self.$capture_state = () => ({
    		writable,
    		derived,
    		get: get_store_value,
    		iframeNum,
    		defaults,
    		queue,
    		actives,
    		prefetch,
    		optionsToQuery,
    		removeFromQueue,
    		$actives
    	});

    	return [$actives];
    }

    class Prefetcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prefetcher",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /// <reference path="../typedef.js" />

    /** @ts-check */
    /**
     * @typedef {Object} RoutifyContext
     * @prop {ClientNode} component
     * @prop {ClientNode} layout
     * @prop {any} componentFile 
     * 
     *  @returns {import('svelte/store').Readable<RoutifyContext>} */
    function getRoutifyContext() {
      return getContext('routify') || rootContext
    }

    /**
     * @callback AfterPageLoadHelper
     * @param {function} callback
     * 
     * @typedef {import('svelte/store').Readable<AfterPageLoadHelper> & {_hooks:Array<function>}} AfterPageLoadHelperStore
     * @type {AfterPageLoadHelperStore}
     */
    const afterPageLoad = {
      _hooks: [],
      subscribe: hookHandler
    };

    /** 
     * @callback BeforeUrlChangeHelper
     * @param {function} callback
     *
     * @typedef {import('svelte/store').Readable<BeforeUrlChangeHelper> & {_hooks:Array<function>}} BeforeUrlChangeHelperStore
     * @type {BeforeUrlChangeHelperStore}
     **/
    const beforeUrlChange = {
      _hooks: [],
      subscribe: hookHandler
    };

    function hookHandler(listener) {
      const hooks = this._hooks;
      const index = hooks.length;
      listener(callback => { hooks[index] = callback; });
      return () => delete hooks[index]
    }

    /**
     * We have to grab params and leftover from the context and not directly from the store.
     * Otherwise the context is updated before the component is destroyed. * 
     * @typedef {Object.<string, *>} ParamsHelper
     * @typedef {import('svelte/store').Readable<ParamsHelper>} ParamsHelperStore
     * @type {ParamsHelperStore}
     **/
    const params = {
      subscribe(run) {
        const ctx = getRoutifyContext();
        return derived(ctx, ctx => ctx.route.params).subscribe(run)
      }
    };

    /**
     * @callback UrlHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @return {String}
     *
     * @typedef {import('svelte/store').Readable<UrlHelper>} UrlHelperStore
     * @type {UrlHelperStore} 
     * */
    const url = {
      subscribe(listener) {
        const ctx = getRoutifyContext();
        return derived(
          [ctx, route, routes, location$1],
          args => makeUrlHelper(...args)
        ).subscribe(
          listener
        )
      }
    };

    /** 
     * @param {{component: ClientNode}} $ctx 
     * @param {RouteNode} $oldRoute 
     * @param {RouteNode[]} $routes 
     * @param {{base: string, path: string}} $location
     * @returns {UrlHelper}
     */
    function makeUrlHelper($ctx, $oldRoute, $routes, $location) {
      return function url(path, params, options) {
        const { component } = $ctx;
        path = path || './';

        const strict = options && options.strict !== false;
        if (!strict) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          let [, breadcrumbs, relativePath] = path.match(/^([\.\/]+)(.*)/);
          let dir = component.path.replace(/\/$/, '');
          const traverse = breadcrumbs.match(/\.\.\//g) || [];
          traverse.forEach(() => dir = dir.replace(/\/[^\/]+\/?$/, ''));
          path = `${dir}/${relativePath}`.replace(/\/$/, '');

        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = $routes.find(route => route.meta.name === path);
          if (matchingRoute) path = matchingRoute.shortPath;
        }

        /** @type {Object<string, *>} Parameters */
        const allParams = Object.assign({}, $oldRoute.params, component.params, params);
        let pathWithParams = path;
        for (const [key, value] of Object.entries(allParams)) {
          pathWithParams = pathWithParams.replace(`:${key}`, value);
        }

        const fullPath = $location.base + pathWithParams + _getQueryString(path, params);
        return fullPath.replace(/\?$/, '')
      }
    }

    /**
     * 
     * @param {string} path 
     * @param {object} params 
     */
    function _getQueryString(path, params) {
      if (!defaultConfig.queryHandler) return ""
      const pathParamKeys = pathToParamKeys(path);
      const queryParams = {};
      if (params) Object.entries(params).forEach(([key, value]) => {
        if (!pathParamKeys.includes(key))
          queryParams[key] = value;
      });
      return defaultConfig.queryHandler.stringify(queryParams)
    }

    /**
    * @callback GotoHelper
    * @param {String=} path
    * @param {UrlParams=} params
    * @param {GotoOptions=} options
    *
    * @typedef {import('svelte/store').Readable<GotoHelper>}  GotoHelperStore
    * @type {GotoHelperStore} 
    * */
    const goto = {
      subscribe(listener) {
        return derived(url,
          url => function goto(path, params, _static, shallow) {
            const href = url(path, params);
            if (!_static) history.pushState({}, null, href);
            else getContext('routifyupdatepage')(href, shallow);
          }
        ).subscribe(
          listener
        )
      },
    };

    /**
     * @callback IsActiveHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @returns {Boolean}
     * 
     * @typedef {import('svelte/store').Readable<IsActiveHelper>} IsActiveHelperStore
     * @type {IsActiveHelperStore} 
     * */
    const isActive = {
      subscribe(run) {
        return derived(
          [url, route],
          ([url, route]) => function isActive(path = "", params = {}, { strict } = { strict: true }) {
            path = url(path, null, { strict });
            const currentPath = url(route.path, null, { strict });
            const re = new RegExp('^' + path + '($|/)');
            return !!currentPath.match(re)
          }
        ).subscribe(run)
      },
    };



    const _metatags = {
      props: {},
      templates: {},
      services: {
        plain: { propField: 'name', valueField: 'content' },
        twitter: { propField: 'name', valueField: 'content' },
        og: { propField: 'property', valueField: 'content' },
      },
      plugins: [
        {
          name: 'applyTemplate',
          condition: () => true,
          action: (prop, value) => {
            const template = _metatags.getLongest(_metatags.templates, prop) || (x => x);
            return [prop, template(value)]
          }
        },
        {
          name: 'createMeta',
          condition: () => true,
          action(prop, value) {
            _metatags.writeMeta(prop, value);
          }
        },
        {
          name: 'createOG',
          condition: prop => !prop.match(':'),
          action(prop, value) {
            _metatags.writeMeta(`og:${prop}`, value);
          }
        },
        {
          name: 'createTitle',
          condition: prop => prop === 'title',
          action(prop, value) {
            document.title = value;
          }
        }
      ],
      getLongest(repo, name) {
        const providers = repo[name];
        if (providers) {
          const currentPath = get_store_value(route).path;
          const allPaths = Object.keys(repo[name]);
          const matchingPaths = allPaths.filter(path => currentPath.includes(path));

          const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

          return providers[longestKey]
        }
      },
      writeMeta(prop, value) {
        const head = document.getElementsByTagName('head')[0];
        const match = prop.match(/(.+)\:/);
        const serviceName = match && match[1] || 'plain';
        const { propField, valueField } = metatags.services[serviceName] || metatags.services.plain;
        const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
        if (oldElement) oldElement.remove();

        const newElement = document.createElement('meta');
        newElement.setAttribute(propField, prop);
        newElement.setAttribute(valueField, value);
        newElement.setAttribute('data-origin', 'routify');
        head.appendChild(newElement);
      },
      set(prop, value) {
        _metatags.plugins.forEach(plugin => {
          if (plugin.condition(prop, value))
            [prop, value] = plugin.action(prop, value) || [prop, value];
        });
      },
      clear() {
        const oldElement = document.querySelector(`meta`);
        if (oldElement) oldElement.remove();
      },
      template(name, fn) {
        const origin = _metatags.getOrigin();
        _metatags.templates[name] = _metatags.templates[name] || {};
        _metatags.templates[name][origin] = fn;
      },
      update() {
        Object.keys(_metatags.props).forEach((prop) => {
          let value = (_metatags.getLongest(_metatags.props, prop));
          _metatags.plugins.forEach(plugin => {
            if (plugin.condition(prop, value)) {
              [prop, value] = plugin.action(prop, value) || [prop, value];

            }
          });
        });
      },
      batchedUpdate() {
        if (!_metatags._pendingUpdate) {
          _metatags._pendingUpdate = true;
          setTimeout(() => {
            _metatags._pendingUpdate = false;
            this.update();
          });
        }
      },
      _updateQueued: false,
      getOrigin() {
        const routifyCtx = getRoutifyContext();
        return routifyCtx && get_store_value(routifyCtx).path || '/'
      },
      _pendingUpdate: false
    };


    /**
     * metatags
     * @prop {Object.<string, string>}
     */
    const metatags = new Proxy(_metatags, {
      set(target, name, value, receiver) {
        const { props, getOrigin } = target;

        if (Reflect.has(target, name))
          Reflect.set(target, name, value, receiver);
        else {
          props[name] = props[name] || {};
          props[name][getOrigin()] = value;
        }

        if (window['routify'].appLoaded)
          target.batchedUpdate();
        return true
      }
    });

    const isChangingPage = (function () {
      const store = writable(false);
      beforeUrlChange.subscribe(fn => fn(event => {
        store.set(true);
        return true
      }));
      
      afterPageLoad.subscribe(fn => fn(event => store.set(false)));

      return store
    })();

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.24.0 */
    const file$1 = "node_modules/@sveltech/routify/runtime/Route.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    // (120:0) {#if $context}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$context*/ ctx[6].component.isLayout === false) return 0;
    		if (/*remainingLayouts*/ ctx[5].length) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(120:0) {#if $context}",
    		ctx
    	});

    	return block;
    }

    // (132:36) 
    function create_if_block_3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout, remainingLayouts, decorator, Decorator, scopeToChild*/ 100663415) {
    				const each_value_1 = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(132:36) ",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if $context.component.isLayout === false}
    function create_if_block_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout*/ 85) {
    				const each_value = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(121:2) {#if $context.component.isLayout === false}",
    		ctx
    	});

    	return block;
    }

    // (134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>
    function create_default_slot(ctx) {
    	let route_1;
    	let t;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[5]],
    				Decorator: typeof /*decorator*/ ctx[26] !== "undefined"
    				? /*decorator*/ ctx[26]
    				: /*Decorator*/ ctx[1],
    				childOfDecorator: /*layout*/ ctx[4].isDecorator,
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[25]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 32) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[5]];

    			if (dirty & /*decorator, Decorator*/ 67108866) route_1_changes.Decorator = typeof /*decorator*/ ctx[26] !== "undefined"
    			? /*decorator*/ ctx[26]
    			: /*Decorator*/ ctx[1];

    			if (dirty & /*layout*/ 16) route_1_changes.childOfDecorator = /*layout*/ ctx[4].isDecorator;

    			if (dirty & /*scoped, scopeToChild*/ 33554433) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[25]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>",
    		ctx
    	});

    	return block;
    }

    // (133:4) {#each [$context] as { component, componentFile }
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 25: scopeToChild, 26: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 33554432 : 0) | (decorator ? 67108864 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, layout, scoped, scopeToChild*/ 234881075) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(133:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#each [$context] as { component, componentFile }
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(122:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (152:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$1, 152, 2, 4256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(setParent_action = /*setParent*/ ctx[8].call(null, span));
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(152:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*$context*/ ctx[6] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$context*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$context*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[3]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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
    	let $route;
    	let $context;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(14, $route = $$value));
    	let { layouts = [] } = $$props;
    	let { scoped = {} } = $$props;
    	let { Decorator = null } = $$props;
    	let { childOfDecorator = false } = $$props;
    	let { isRoot = false } = $$props;
    	let scopedSync = {};
    	let isDecorator = false;

    	/** @type {HTMLElement} */
    	let parentElement;

    	/** @type {LayoutOrDecorator} */
    	let layout = null;

    	/** @type {LayoutOrDecorator} */
    	let lastLayout = null;

    	/** @type {LayoutOrDecorator[]} */
    	let remainingLayouts = [];

    	const context = writable(null);
    	validate_store(context, "context");
    	component_subscribe($$self, context, value => $$invalidate(6, $context = value));

    	/** @type {import("svelte/store").Writable<Context>} */
    	const parentContextStore = getContext("routify");

    	isDecorator = Decorator && !childOfDecorator;
    	setContext("routify", context);

    	/** @param {HTMLElement} el */
    	function setParent(el) {
    		$$invalidate(3, parentElement = el.parentElement);
    	}

    	/** @param {SvelteComponent} componentFile */
    	function onComponentLoaded(componentFile) {
    		/** @type {Context} */
    		const parentContext = get_store_value(parentContextStore);

    		$$invalidate(2, scopedSync = { ...scoped });
    		lastLayout = layout;
    		if (remainingLayouts.length === 0) onLastComponentLoaded();

    		const ctx = {
    			layout: isDecorator ? parentContext.layout : layout,
    			component: layout,
    			route: $route,
    			componentFile,
    			child: isDecorator
    			? parentContext.child
    			: get_store_value(context) && get_store_value(context).child
    		};

    		context.set(ctx);
    		if (isRoot) rootContext.set(ctx);

    		if (parentContext && !isDecorator) parentContextStore.update(store => {
    			store.child = layout || store.child;
    			return store;
    		});
    	}

    	/**  @param {LayoutOrDecorator} layout */
    	function setComponent(layout) {
    		let PendingComponent = layout.component();
    		if (PendingComponent instanceof Promise) PendingComponent.then(onComponentLoaded); else onComponentLoaded(PendingComponent);
    	}

    	async function onLastComponentLoaded() {
    		afterPageLoad._hooks.forEach(hook => hook(layout.api));
    		await tick();
    		handleScroll(parentElement);

    		if (!window["routify"].appLoaded) {
    			const pagePath = $context.component.path;
    			const routePath = $route.path;
    			const isOnCurrentRoute = pagePath === routePath; //maybe we're getting redirected

    			// Let everyone know the last child has rendered
    			if (!window["routify"].stopAutoReady && isOnCurrentRoute) {
    				onAppLoaded({ path: pagePath, metatags });
    			}
    		}
    	}

    	const writable_props = ["layouts", "scoped", "Decorator", "childOfDecorator", "isRoot"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, []);

    	$$self.$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		get: get_store_value,
    		metatags,
    		afterPageLoad,
    		route,
    		routes,
    		rootContext,
    		handleScroll,
    		onAppLoaded,
    		layouts,
    		scoped,
    		Decorator,
    		childOfDecorator,
    		isRoot,
    		scopedSync,
    		isDecorator,
    		parentElement,
    		layout,
    		lastLayout,
    		remainingLayouts,
    		context,
    		parentContextStore,
    		setParent,
    		onComponentLoaded,
    		setComponent,
    		onLastComponentLoaded,
    		$route,
    		$context
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    		if ("scopedSync" in $$props) $$invalidate(2, scopedSync = $$props.scopedSync);
    		if ("isDecorator" in $$props) $$invalidate(12, isDecorator = $$props.isDecorator);
    		if ("parentElement" in $$props) $$invalidate(3, parentElement = $$props.parentElement);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    		if ("lastLayout" in $$props) lastLayout = $$props.lastLayout;
    		if ("remainingLayouts" in $$props) $$invalidate(5, remainingLayouts = $$props.remainingLayouts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isDecorator, Decorator, layouts*/ 4610) {
    			 if (isDecorator) {
    				const decoratorLayout = {
    					component: () => Decorator,
    					path: `${layouts[0].path}__decorator`,
    					isDecorator: true
    				};

    				$$invalidate(9, layouts = [decoratorLayout, ...layouts]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 512) {
    			 $$invalidate(4, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(5, remainingLayouts), $$invalidate(9, layouts)), $$invalidate(12, isDecorator)), $$invalidate(1, Decorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 16) {
    			 setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		scopedSync,
    		parentElement,
    		layout,
    		remainingLayouts,
    		$context,
    		context,
    		setParent,
    		layouts,
    		childOfDecorator,
    		isRoot
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			layouts: 9,
    			scoped: 0,
    			Decorator: 1,
    			childOfDecorator: 10,
    			isRoot: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childOfDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childOfDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRoot() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRoot(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function init$1(routes, callback) {
      /** @type { ClientNode | false } */
      let lastRoute = false;

      function updatePage(proxyToUrl, shallow) {
        const url = proxyToUrl || currentLocation();
        const route$1 = urlToRoute(url);
        const currentRoute = shallow && urlToRoute(currentLocation());
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        if (lastRoute) delete lastRoute.last; //todo is a page component the right place for the previous route?
        route$1.last = lastRoute;
        lastRoute = route$1;

        //set the route in the store
        if (!proxyToUrl)
          urlRoute.set(route$1);
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      const destroy = createEventListeners(updatePage);

      return { updatePage, destroy }
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state = {}, title, url) {
          const { id, path, params } = get_store_value(route);
          state = { id, path, params, ...state };
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      let _ignoreNextPop = false;

      const listeners = {
        click: handleClick,
        pushstate: () => updatePage(),
        replacestate: () => updatePage(),
        popstate: async event => {
          if (_ignoreNextPop)
            _ignoreNextPop = false;
          else {
            if (await runHooksBeforeUrlChange(event)) {
              updatePage();
            } else {
              _ignoreNextPop = true;
              event.preventDefault();
              history.go(1);
            }
          }
        },
      };

      Object.entries(listeners).forEach(args => addEventListener(...args));

      const unregister = () => {
        Object.entries(listeners).forEach(args => removeEventListener(...args));
      };

      return unregister
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of beforeUrlChange._hooks.filter(Boolean)) {
        // return false if the hook returns false
        const result = await hook(event, route$1); //todo remove route from hook. Its API Can be accessed as $page
        if (!result) return false
      }
      return true
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1$1 } = globals;

    // (64:0) {#if layouts && $route !== null}
    function create_if_block$1(ctx) {
    	let route_1;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: /*layouts*/ ctx[0],
    				isRoot: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*layouts*/ 1) route_1_changes.layouts = /*layouts*/ ctx[0];
    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(64:0) {#if layouts && $route !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let prefetcher;
    	let current;
    	let if_block = /*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null && create_if_block$1(ctx);
    	prefetcher = new Prefetcher({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(prefetcher.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(prefetcher, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*layouts, $route*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
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
    			transition_in(prefetcher.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(prefetcher.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(prefetcher, detaching);
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
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
    	let { routes: routes$1 } = $$props;
    	let { config = {} } = $$props;
    	let layouts;
    	let navigator;
    	window.routify = window.routify || {};
    	window.routify.inBrowser = !window.navigator.userAgent.match("jsdom");

    	Object.entries(config).forEach(([key, value]) => {
    		defaultConfig[key] = value;
    	});

    	suppressWarnings();
    	const updatePage = (...args) => navigator && navigator.updatePage(...args);
    	setContext("routifyupdatepage", updatePage);
    	const callback = res => $$invalidate(0, layouts = res);

    	const cleanup = () => {
    		if (!navigator) return;
    		navigator.destroy();
    		navigator = null;
    	};

    	let initTimeout = null;

    	// init is async to prevent a horrible bug that completely disable reactivity
    	// in the host component -- something like the component's update function is
    	// called before its fragment is created, and since the component is then seen
    	// as already dirty, it is never scheduled for update again, and remains dirty
    	// forever... I failed to isolate the precise conditions for the bug, but the
    	// faulty update is triggered by a change in the route store, and so offseting
    	// store initialization by one tick gives the host component some time to
    	// create its fragment. The root cause it probably a bug in Svelte with deeply
    	// intertwinned store and reactivity.
    	const doInit = () => {
    		clearTimeout(initTimeout);

    		initTimeout = setTimeout(() => {
    			cleanup();
    			navigator = init$1(routes$1, callback);
    			routes.set(routes$1);
    			navigator.updatePage();
    		});
    	};

    	onDestroy(cleanup);
    	const writable_props = ["routes", "config"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onDestroy,
    		Route,
    		Prefetcher,
    		init: init$1,
    		route,
    		routesStore: routes,
    		prefetchPath,
    		suppressWarnings,
    		defaultConfig,
    		routes: routes$1,
    		config,
    		layouts,
    		navigator,
    		updatePage,
    		callback,
    		cleanup,
    		initTimeout,
    		doInit,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ("navigator" in $$props) navigator = $$props.navigator;
    		if ("initTimeout" in $$props) initTimeout = $$props.initTimeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes*/ 4) {
    			 if (routes$1) doInit();
    		}
    	};

    	return [layouts, $route, routes$1, config];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { routes: 2, config: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[2] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /** 
     * Node payload
     * @typedef {Object} NodePayload
     * @property {RouteNode=} file current node
     * @property {RouteNode=} parent parent of the current node
     * @property {StateObject=} state state shared by every node in the walker
     * @property {Object=} scope scope inherited by descendants in the scope
     *
     * State Object
     * @typedef {Object} StateObject
     * @prop {TreePayload=} treePayload payload from the tree
     * 
     * Node walker proxy
     * @callback NodeWalkerProxy
     * @param {NodePayload} NodePayload
     */


    /**
     * Node middleware
     * @description Walks through the nodes of a tree
     * @example middleware = createNodeMiddleware(payload => {payload.file.name = 'hello'})(treePayload))
     * @param {NodeWalkerProxy} fn 
     */
    function createNodeMiddleware(fn) {

        /**    
         * NodeMiddleware payload receiver
         * @param {TreePayload} payload
         */
        const inner = async function execute(payload) {
            return await nodeMiddleware(payload.tree, fn, { state: { treePayload: payload } })
        };

        /**    
         * NodeMiddleware sync payload receiver
         * @param {TreePayload} payload
         */
        inner.sync = function executeSync(payload) {
            return nodeMiddlewareSync(payload.tree, fn, { state: { treePayload: payload } })
        };

        return inner
    }

    /**
     * Node walker
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    async function nodeMiddleware(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        await fn(payload);

        if (file.children) {
            payload.parent = file;
            await Promise.all(file.children.map(_file => nodeMiddleware(_file, fn, payload)));
        }
        return payload
    }

    /**
     * Node walker (sync version)
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    function nodeMiddlewareSync(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        fn(payload);

        if (file.children) {
            payload.parent = file;
            file.children.map(_file => nodeMiddlewareSync(_file, fn, payload));
        }
        return payload
    }


    /**
     * Clone with JSON
     * @param {T} obj 
     * @returns {T} JSON cloned object
     * @template T
     */
    function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

    const setRegex = createNodeMiddleware(({ file }) => {
        if (file.isPage || file.isFallback)
            file.regex = pathToRegex(file.path, file.isFallback);
    });
    const setParamKeys = createNodeMiddleware(({ file }) => {
        file.paramKeys = pathToParamKeys(file.path);
    });

    const setShortPath = createNodeMiddleware(({ file }) => {
        if (file.isFallback || file.isIndex)
            file.shortPath = file.path.replace(/\/[^/]+$/, '');
        else file.shortPath = file.path;
    });
    const setRank = createNodeMiddleware(({ file }) => {
        file.ranking = pathToRank(file);
    });


    // todo delete?
    const addMetaChildren = createNodeMiddleware(({ file }) => {
        const node = file;
        const metaChildren = file.meta && file.meta.children || [];
        if (metaChildren.length) {
            node.children = node.children || [];
            node.children.push(...metaChildren.map(meta => ({ isMeta: true, ...meta, meta })));
        }
    });

    const setIsIndexable = createNodeMiddleware(payload => {
        const { file } = payload;
        const { isLayout, isFallback, meta } = file;
        file.isIndexable = !isLayout && !isFallback && meta.index !== false;
        file.isNonIndexable = !file.isIndexable;
    });


    const assignRelations = createNodeMiddleware(({ file, parent }) => {
        Object.defineProperty(file, 'parent', { get: () => parent });
        Object.defineProperty(file, 'nextSibling', { get: () => _getSibling(file, 1) });
        Object.defineProperty(file, 'prevSibling', { get: () => _getSibling(file, -1) });
        Object.defineProperty(file, 'lineage', { get: () => _getLineage(parent) });
    });

    function _getLineage(node, lineage = []){
        if(node){
            lineage.unshift(node);
            _getLineage(node.parent, lineage);
        }
        return lineage
    }

    /**
     * 
     * @param {RouteNode} file 
     * @param {Number} direction 
     */
    function _getSibling(file, direction) {
        if (!file.root) {
            const siblings = file.parent.children.filter(c => c.isIndexable);
            const index = siblings.indexOf(file);
            return siblings[index + direction]
        }
    }

    const assignIndex = createNodeMiddleware(({ file, parent }) => {
        if (file.isIndex) Object.defineProperty(parent, 'index', { get: () => file });
        if (file.isLayout)
            Object.defineProperty(parent, 'layout', { get: () => file });
    });

    const assignLayout = createNodeMiddleware(({ file, scope }) => {
        Object.defineProperty(file, 'layouts', { get: () => getLayouts(file) });
        function getLayouts(file) {
            const { parent } = file;
            const layout = parent && parent.layout;
            const isReset = layout && layout.isReset;
            const layouts = (parent && !isReset && getLayouts(parent)) || [];
            if (layout) layouts.push(layout);
            return layouts
        }
    });


    const createFlatList = treePayload => {
        createNodeMiddleware(payload => {
            if (payload.file.isPage || payload.file.isFallback)
            payload.state.treePayload.routes.push(payload.file);
        }).sync(treePayload);    
        treePayload.routes.sort((c, p) => (c.ranking >= p.ranking ? -1 : 1));
    };

    const setPrototype = createNodeMiddleware(({ file }) => {
        const Prototype = file.root
            ? Root
            : file.children
                ? file.isFile ? PageDir : Dir
                : file.isReset
                    ? Reset
                    : file.isLayout
                        ? Layout
                        : file.isFallback
                            ? Fallback
                            : Page;
        Object.setPrototypeOf(file, Prototype.prototype);

        function Layout() { }
        function Dir() { }
        function Fallback() { }
        function Page() { }
        function PageDir() { }
        function Reset() { }
        function Root() { }
    });

    var miscPlugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setRegex: setRegex,
        setParamKeys: setParamKeys,
        setShortPath: setShortPath,
        setRank: setRank,
        addMetaChildren: addMetaChildren,
        setIsIndexable: setIsIndexable,
        assignRelations: assignRelations,
        assignIndex: assignIndex,
        assignLayout: assignLayout,
        createFlatList: createFlatList,
        setPrototype: setPrototype
    });

    const assignAPI = createNodeMiddleware(({ file }) => {
        file.api = new ClientApi(file);
    });

    class ClientApi {
        constructor(file) {
            this.__file = file;
            Object.defineProperty(this, '__file', { enumerable: false });
            this.isMeta = !!file.isMeta;
            this.path = file.path;
            this.title = _prettyName(file);
            this.meta = file.meta;
        }

        get parent() { return !this.__file.root && this.__file.parent.api }
        get children() {
            return (this.__file.children || this.__file.isLayout && this.__file.parent.children || [])
                .filter(c => !c.isNonIndexable)
                .sort((a, b) => {
                    if(a.isMeta && b.isMeta) return 0
                    a = (a.meta.index || a.meta.title || a.path).toString();
                    b = (b.meta.index || b.meta.title || b.path).toString();
                    return a.localeCompare((b), undefined, { numeric: true, sensitivity: 'base' })
                })
                .map(({ api }) => api)
        }
        get next() { return _navigate(this, +1) }
        get prev() { return _navigate(this, -1) }
        preload() {
            this.__file.layouts.forEach(file => file.component());
            this.__file.component(); 
        }
    }

    function _navigate(node, direction) {
        if (!node.__file.root) {
            const siblings = node.parent.children;
            const index = siblings.indexOf(node);
            return node.parent.children[index + direction]
        }
    }


    function _prettyName(file) {
        if (typeof file.meta.title !== 'undefined') return file.meta.title
        else return (file.shortPath || file.path)
            .split('/')
            .pop()
            .replace(/-/g, ' ')
    }

    const plugins = {...miscPlugins, assignAPI};

    function buildClientTree(tree) {
      const order = [
        // pages
        "setParamKeys", //pages only
        "setRegex", //pages only
        "setShortPath", //pages only
        "setRank", //pages only
        "assignLayout", //pages only,
        // all
        "setPrototype",
        "addMetaChildren",
        "assignRelations", //all (except meta components?)
        "setIsIndexable", //all
        "assignIndex", //all
        "assignAPI", //all
        // routes
        "createFlatList"
      ];

      const payload = { tree, routes: [] };
      for (let name of order) {
        const syncFn = plugins[name].sync || plugins[name];
        syncFn(payload);
      }
      return payload
    }

    /* src/pages/_fallback.svelte generated by Svelte v3.24.0 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", $$slots, []);
    	return [];
    }

    class Fallback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/comp/ui/btn.svelte generated by Svelte v3.24.0 */

    const file$2 = "src/comp/ui/btn.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "type", /*type*/ ctx[1]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*btn*/ ctx[2]) + " svelte-lbymv1"));
    			attr_dev(button, "label", /*label*/ ctx[0]);
    			add_location(button, file$2, 118, 0, 2422);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 2) {
    				attr_dev(button, "type", /*type*/ ctx[1]);
    			}

    			if (!current || dirty & /*btn*/ 4 && button_class_value !== (button_class_value = "" + (null_to_empty(/*btn*/ ctx[2]) + " svelte-lbymv1"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*label*/ 1) {
    				attr_dev(button, "label", /*label*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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
    	let { label = "" } = $$props;
    	let { type = "" } = $$props;
    	let { btn = "outline" } = $$props;
    	const writable_props = ["label", "type", "btn"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Btn> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Btn", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("btn" in $$props) $$invalidate(2, btn = $$props.btn);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ label, type, btn });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("btn" in $$props) $$invalidate(2, btn = $$props.btn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, type, btn, $$scope, $$slots, click_handler];
    }

    class Btn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { label: 0, type: 1, btn: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Btn",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get label() {
    		throw new Error("<Btn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Btn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Btn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Btn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get btn() {
    		throw new Error("<Btn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set btn(value) {
    		throw new Error("<Btn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-icons/components/IconBase.svelte generated by Svelte v3.24.0 */

    const file$3 = "node_modules/svelte-icons/components/IconBase.svelte";

    // (18:2) {#if title}
    function create_if_block$2(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[0]);
    			add_location(title_1, file$3, 18, 4, 278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(18:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let svg;
    	let if_block_anchor;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block$2(ctx);
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "class", "svelte-1aulu9l");
    			add_location(svg, file$3, 16, 0, 209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
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
    	let { title = null } = $$props;
    	let { viewBox } = $$props;
    	const writable_props = ["title", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("IconBase", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, viewBox, $$scope, $$slots];
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { title: 0, viewBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconBase",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewBox*/ ctx[1] === undefined && !("viewBox" in props)) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-icons/fa/FaChevronCircleUp.svelte generated by Svelte v3.24.0 */
    const file$4 = "node_modules/svelte-icons/fa/FaChevronCircleUp.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M8 256C8 119 119 8 256 8s248 111 248 248-111 248-248 248S8 393 8 256zm231-113.9L103.5 277.6c-9.4 9.4-9.4 24.6 0 33.9l17 17c9.4 9.4 24.6 9.4 33.9 0L256 226.9l101.6 101.6c9.4 9.4 24.6 9.4 33.9 0l17-17c9.4-9.4 9.4-24.6 0-33.9L273 142.1c-9.4-9.4-24.6-9.4-34 0z");
    			add_location(path, file$4, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
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
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaChevronCircleUp", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaChevronCircleUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChevronCircleUp",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaHome.svelte generated by Svelte v3.24.0 */
    const file$5 = "node_modules/svelte-icons/fa/FaHome.svelte";

    // (4:8) <IconBase viewBox="0 0 576 512" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z");
    			add_location(path, file$5, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 576 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 576 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
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
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaHome", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaHome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaHome",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaSearch.svelte generated by Svelte v3.24.0 */
    const file$6 = "node_modules/svelte-icons/fa/FaSearch.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z");
    			add_location(path, file$6, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaSearch", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaSearch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaSearch",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaChalkboard.svelte generated by Svelte v3.24.0 */
    const file$7 = "node_modules/svelte-icons/fa/FaChalkboard.svelte";

    // (4:8) <IconBase viewBox="0 0 640 512" {...$$props}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M96 64h448v352h64V40c0-22.06-17.94-40-40-40H72C49.94 0 32 17.94 32 40v376h64V64zm528 384H480v-64H288v64H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h608c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z");
    			add_location(path, file$7, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 640 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 640 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaChalkboard", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaChalkboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaChalkboard",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaUserCog.svelte generated by Svelte v3.24.0 */
    const file$8 = "node_modules/svelte-icons/fa/FaUserCog.svelte";

    // (4:8) <IconBase viewBox="0 0 640 512" {...$$props}>
    function create_default_slot$5(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M610.5 373.3c2.6-14.1 2.6-28.5 0-42.6l25.8-14.9c3-1.7 4.3-5.2 3.3-8.5-6.7-21.6-18.2-41.2-33.2-57.4-2.3-2.5-6-3.1-9-1.4l-25.8 14.9c-10.9-9.3-23.4-16.5-36.9-21.3v-29.8c0-3.4-2.4-6.4-5.7-7.1-22.3-5-45-4.8-66.2 0-3.3.7-5.7 3.7-5.7 7.1v29.8c-13.5 4.8-26 12-36.9 21.3l-25.8-14.9c-2.9-1.7-6.7-1.1-9 1.4-15 16.2-26.5 35.8-33.2 57.4-1 3.3.4 6.8 3.3 8.5l25.8 14.9c-2.6 14.1-2.6 28.5 0 42.6l-25.8 14.9c-3 1.7-4.3 5.2-3.3 8.5 6.7 21.6 18.2 41.1 33.2 57.4 2.3 2.5 6 3.1 9 1.4l25.8-14.9c10.9 9.3 23.4 16.5 36.9 21.3v29.8c0 3.4 2.4 6.4 5.7 7.1 22.3 5 45 4.8 66.2 0 3.3-.7 5.7-3.7 5.7-7.1v-29.8c13.5-4.8 26-12 36.9-21.3l25.8 14.9c2.9 1.7 6.7 1.1 9-1.4 15-16.2 26.5-35.8 33.2-57.4 1-3.3-.4-6.8-3.3-8.5l-25.8-14.9zM496 400.5c-26.8 0-48.5-21.8-48.5-48.5s21.8-48.5 48.5-48.5 48.5 21.8 48.5 48.5-21.7 48.5-48.5 48.5zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm201.2 226.5c-2.3-1.2-4.6-2.6-6.8-3.9l-7.9 4.6c-6 3.4-12.8 5.3-19.6 5.3-10.9 0-21.4-4.6-28.9-12.6-18.3-19.8-32.3-43.9-40.2-69.6-5.5-17.7 1.9-36.4 17.9-45.7l7.9-4.6c-.1-2.6-.1-5.2 0-7.8l-7.9-4.6c-16-9.2-23.4-28-17.9-45.7.9-2.9 2.2-5.8 3.2-8.7-3.8-.3-7.5-1.2-11.4-1.2h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c10.1 0 19.5-3.2 27.2-8.5-1.2-3.8-2-7.7-2-11.8v-9.2z");
    			add_location(path, file$8, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 640 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 640 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaUserCog", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaUserCog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaUserCog",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaPlus.svelte generated by Svelte v3.24.0 */
    const file$9 = "node_modules/svelte-icons/fa/FaPlus.svelte";

    // (4:8) <IconBase viewBox="0 0 448 512" {...$$props}>
    function create_default_slot$6(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z");
    			add_location(path, file$9, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 448 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 448 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaPlus", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaPlus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaPlus",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaFileImport.svelte generated by Svelte v3.24.0 */
    const file$a = "node_modules/svelte-icons/fa/FaFileImport.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$7(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M16 288c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h112v-64zm489-183L407.1 7c-4.5-4.5-10.6-7-17-7H384v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-153 31V0H152c-13.3 0-24 10.7-24 24v264h128v-65.2c0-14.3 17.3-21.4 27.4-11.3L379 308c6.6 6.7 6.6 17.4 0 24l-95.7 96.4c-10.1 10.1-27.4 3-27.4-11.3V352H128v136c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H376c-13.2 0-24-10.8-24-24z");
    			add_location(path, file$a, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$7] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaFileImport", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaFileImport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaFileImport",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaFileExport.svelte generated by Svelte v3.24.0 */
    const file$b = "node_modules/svelte-icons/fa/FaFileExport.svelte";

    // (4:8) <IconBase viewBox="0 0 576 512" {...$$props}>
    function create_default_slot$8(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128zM571 308l-95.7-96.4c-10.1-10.1-27.4-3-27.4 11.3V288h-64v64h64v65.2c0 14.3 17.3 21.4 27.4 11.3L571 332c6.6-6.6 6.6-17.4 0-24zm-379 28v-32c0-8.8 7.2-16 16-16h176V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V352H208c-8.8 0-16-7.2-16-16z");
    			add_location(path, file$b, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 576 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 576 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$8] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaFileExport", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaFileExport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaFileExport",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaTools.svelte generated by Svelte v3.24.0 */
    const file$c = "node_modules/svelte-icons/fa/FaTools.svelte";

    // (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
    function create_default_slot$9(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M501.1 395.7L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7zM331.7 225c28.3 0 54.9 11 74.9 31l19.4 19.4c15.8-6.9 30.8-16.5 43.8-29.5 37.1-37.1 49.7-89.3 37.9-136.7-2.2-9-13.5-12.1-20.1-5.5l-74.4 74.4-67.9-11.3L334 98.9l74.4-74.4c6.6-6.6 3.4-17.9-5.7-20.2-47.4-11.7-99.6.9-136.6 37.9-28.5 28.5-41.9 66.1-41.2 103.6l82.1 82.1c8.1-1.9 16.5-2.9 24.7-2.9zm-103.9 82l-56.7-56.7L18.7 402.8c-25 25-25 65.5 0 90.5s65.5 25 90.5 0l123.6-123.6c-7.6-19.9-9.9-41.6-5-62.7zM64 472c-13.2 0-24-10.8-24-24 0-13.3 10.7-24 24-24s24 10.7 24 24c0 13.2-10.7 24-24 24z");
    			add_location(path, file$c, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 512 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 512 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$9] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaTools", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaTools extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaTools",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* node_modules/svelte-icons/fa/FaCaretUp.svelte generated by Svelte v3.24.0 */
    const file$d = "node_modules/svelte-icons/fa/FaCaretUp.svelte";

    // (4:8) <IconBase viewBox="0 0 320 512" {...$$props}>
    function create_default_slot$a(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M288.662 352H31.338c-17.818 0-26.741-21.543-14.142-34.142l128.662-128.662c7.81-7.81 20.474-7.81 28.284 0l128.662 128.662c12.6 12.599 3.676 34.142-14.142 34.142z");
    			add_location(path, file$d, 4, 10, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 320 512\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 320 512" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$a] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FaCaretUp", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class FaCaretUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FaCaretUp",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    let isLoggedIn = writable(false);
    let user = writable({
      id: -1, username: "", email: "", token: "", exp: -1
    });

    var n=function(){return (n=Object.assign||function(n){for(var e,t=1,r=arguments.length;t<r;t++)for(var o in e=arguments[t])Object.prototype.hasOwnProperty.call(e,o)&&(n[o]=e[o]);return n}).apply(this,arguments)};function e(n,e,t,r){return new(t||(t=Promise))((function(o,i){function a(n){try{c(r.next(n));}catch(n){i(n);}}function u(n){try{c(r.throw(n));}catch(n){i(n);}}function c(n){var e;n.done?o(n.value):(e=n.value,e instanceof t?e:new t((function(n){n(e);}))).then(a,u);}c((r=r.apply(n,e||[])).next());}))}function t(n,e){var t,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(t)throw new TypeError("Generator is already executing.");for(;a;)try{if(t=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=e.call(n,a);}catch(n){i=[6,n],r=0;}finally{t=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,u])}}}function r(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}function o(n){window.__TAURI_INVOKE_HANDLER__(n);}function i(n,e){void 0===e&&(e=!1);var t=r()+r()+"-"+r()+"-"+r()+"-"+r()+"-"+r()+r()+r();return Object.defineProperty(window,t,{value:function(r){return e&&Reflect.deleteProperty(window,t),null==n?void 0:n(r)},writable:!1}),t}function a(r){return e(this,void 0,void 0,(function(){return t(this,(function(e){switch(e.label){case 0:return [4,new Promise((function(e,t){var a=i((function(n){e(n),Reflect.deleteProperty(window,u);}),!0),u=i((function(n){t(n),Reflect.deleteProperty(window,a);}),!0);o(n({callback:a,error:u},r));}))];case 1:return [2,e.sent()]}}))}))}var u=Object.freeze({__proto__:null,invoke:o,transformCallback:i,promisified:a});

    function n$1(n){return void 0===n&&(n={}),e(this,void 0,void 0,(function(){return t(this,(function(e){switch(e.label){case 0:return "object"==typeof n&&Object.freeze(n),[4,a({cmd:"openDialog",options:n})];case 1:return [2,e.sent()]}}))}))}function r$1(n){return void 0===n&&(n={}),e(this,void 0,void 0,(function(){return t(this,(function(e){switch(e.label){case 0:return "object"==typeof n&&Object.freeze(n),[4,a({cmd:"saveDialog",options:n})];case 1:return [2,e.sent()]}}))}))}var i$1=Object.freeze({__proto__:null,open:n$1,save:r$1});

    var dialog = /*#__PURE__*/Object.freeze({
        __proto__: null,
        open: n$1,
        save: r$1
    });

    /* src/comp/ui/nav.svelte generated by Svelte v3.24.0 */
    const file$e = "src/comp/ui/nav.svelte";

    function create_fragment$g(ctx) {
    	let div9;
    	let ul;
    	let div3;
    	let li0;
    	let a0;
    	let div0;
    	let fahome;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let li1;
    	let a1;
    	let t2;
    	let div1;
    	let fachalkboard;
    	let a1_href_value;
    	let t3;
    	let li2;
    	let a2;
    	let t4;
    	let div2;
    	let fasearch;
    	let a2_href_value;
    	let t5;
    	let div4;
    	let t6;
    	let div8;
    	let li3;
    	let a3;
    	let t7_value = /*$user*/ ctx[2].username + "";
    	let t7;
    	let t8;
    	let div5;
    	let chevroncircleup;
    	let a3_href_value;
    	let t9;
    	let li4;
    	let a4;
    	let t10;
    	let div6;
    	let fafileimport;
    	let a4_href_value;
    	let t11;
    	let li5;
    	let a5;
    	let t12;
    	let div7;
    	let fafileexport;
    	let a5_href_value;
    	let current;
    	let mounted;
    	let dispose;
    	fahome = new FaHome({ $$inline: true });
    	fachalkboard = new FaChalkboard({ $$inline: true });
    	fasearch = new FaSearch({ $$inline: true });
    	chevroncircleup = new FaChevronCircleUp({ $$inline: true });
    	fafileimport = new FaFileImport({ $$inline: true });
    	fafileexport = new FaFileExport({ $$inline: true });

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			ul = element("ul");
    			div3 = element("div");
    			li0 = element("li");
    			a0 = element("a");
    			div0 = element("div");
    			create_component(fahome.$$.fragment);
    			t0 = text("\n      Home");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t2 = text("Dash\n      ");
    			div1 = element("div");
    			create_component(fachalkboard.$$.fragment);
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t4 = text("Search\n      ");
    			div2 = element("div");
    			create_component(fasearch.$$.fragment);
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div8 = element("div");
    			li3 = element("li");
    			a3 = element("a");
    			t7 = text(t7_value);
    			t8 = space();
    			div5 = element("div");
    			create_component(chevroncircleup.$$.fragment);
    			t9 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t10 = text("Open\n      ");
    			div6 = element("div");
    			create_component(fafileimport.$$.fragment);
    			t11 = space();
    			li5 = element("li");
    			a5 = element("a");
    			t12 = text("Save\n      ");
    			div7 = element("div");
    			create_component(fafileexport.$$.fragment);
    			attr_dev(div0, "class", "icn svelte-4itig3");
    			add_location(div0, file$e, 133, 6, 2928);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[1]("/home"));
    			attr_dev(a0, "class", "svelte-4itig3");
    			add_location(a0, file$e, 132, 4, 2897);
    			attr_dev(li0, "class", "svelte-4itig3");
    			toggle_class(li0, "active", /*$isActive*/ ctx[0]("/home"));
    			add_location(li0, file$e, 131, 2, 2854);
    			attr_dev(div1, "class", "icn svelte-4itig3");
    			add_location(div1, file$e, 142, 6, 3115);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[1]("/dash"));
    			attr_dev(a1, "class", "svelte-4itig3");
    			add_location(a1, file$e, 140, 4, 3073);
    			attr_dev(li1, "class", "link left-link svelte-4itig3");
    			toggle_class(li1, "active", /*$isActive*/ ctx[0]("/dash"));
    			add_location(li1, file$e, 139, 2, 3007);
    			attr_dev(div2, "class", "icn svelte-4itig3");
    			add_location(div2, file$e, 150, 6, 3311);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[1]("/search"));
    			attr_dev(a2, "class", "svelte-4itig3");
    			add_location(a2, file$e, 148, 4, 3265);
    			attr_dev(li2, "class", "link left-link nav-btn svelte-4itig3");
    			toggle_class(li2, "active", /*$isActive*/ ctx[0]("/search"));
    			add_location(li2, file$e, 147, 2, 3189);
    			attr_dev(div3, "class", "left svelte-4itig3");
    			add_location(div3, file$e, 130, 2, 2833);
    			attr_dev(div4, "class", "middle svelte-4itig3");
    			add_location(div4, file$e, 157, 2, 3393);
    			attr_dev(div5, "class", "icn svelte-4itig3");
    			add_location(div5, file$e, 170, 6, 3685);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[1]("/profile"));
    			attr_dev(a3, "class", "svelte-4itig3");
    			add_location(a3, file$e, 168, 4, 3628);
    			attr_dev(li3, "class", "link right-link prof svelte-4itig3");
    			toggle_class(li3, "active", /*$isActive*/ ctx[0]("/profile"));
    			add_location(li3, file$e, 167, 2, 3553);
    			attr_dev(div6, "class", "icn svelte-4itig3");
    			add_location(div6, file$e, 178, 6, 3870);
    			attr_dev(a4, "href", a4_href_value = /*$url*/ ctx[1]("/profile"));
    			attr_dev(a4, "class", "svelte-4itig3");
    			add_location(a4, file$e, 176, 4, 3825);
    			attr_dev(li4, "class", "link right-link nav-btn svelte-4itig3");
    			add_location(li4, file$e, 175, 2, 3762);
    			attr_dev(div7, "class", "icn svelte-4itig3");
    			add_location(div7, file$e, 186, 6, 4052);
    			attr_dev(a5, "href", a5_href_value = /*$url*/ ctx[1]("/profile"));
    			attr_dev(a5, "class", "svelte-4itig3");
    			add_location(a5, file$e, 184, 4, 4007);
    			attr_dev(li5, "class", "link right-link nav-btn svelte-4itig3");
    			add_location(li5, file$e, 183, 2, 3944);
    			attr_dev(div8, "class", "right svelte-4itig3");
    			add_location(div8, file$e, 166, 2, 3531);
    			attr_dev(ul, "class", "svelte-4itig3");
    			add_location(ul, file$e, 129, 0, 2826);
    			attr_dev(div9, "class", "nav svelte-4itig3");
    			add_location(div9, file$e, 128, 0, 2808);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, ul);
    			append_dev(ul, div3);
    			append_dev(div3, li0);
    			append_dev(li0, a0);
    			append_dev(a0, div0);
    			mount_component(fahome, div0, null);
    			append_dev(a0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t2);
    			append_dev(a1, div1);
    			mount_component(fachalkboard, div1, null);
    			append_dev(div3, t3);
    			append_dev(div3, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t4);
    			append_dev(a2, div2);
    			mount_component(fasearch, div2, null);
    			append_dev(ul, t5);
    			append_dev(ul, div4);
    			append_dev(ul, t6);
    			append_dev(ul, div8);
    			append_dev(div8, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t7);
    			append_dev(a3, t8);
    			append_dev(a3, div5);
    			mount_component(chevroncircleup, div5, null);
    			append_dev(div8, t9);
    			append_dev(div8, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t10);
    			append_dev(a4, div6);
    			mount_component(fafileimport, div6, null);
    			append_dev(div8, t11);
    			append_dev(div8, li5);
    			append_dev(li5, a5);
    			append_dev(a5, t12);
    			append_dev(a5, div7);
    			mount_component(fafileexport, div7, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li4, "click", /*open_space*/ ctx[3], false, false, false),
    					listen_dev(li5, "click", /*save_space*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 2 && a0_href_value !== (a0_href_value = /*$url*/ ctx[1]("/home"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*$isActive*/ 1) {
    				toggle_class(li0, "active", /*$isActive*/ ctx[0]("/home"));
    			}

    			if (!current || dirty & /*$url*/ 2 && a1_href_value !== (a1_href_value = /*$url*/ ctx[1]("/dash"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*$isActive*/ 1) {
    				toggle_class(li1, "active", /*$isActive*/ ctx[0]("/dash"));
    			}

    			if (!current || dirty & /*$url*/ 2 && a2_href_value !== (a2_href_value = /*$url*/ ctx[1]("/search"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (dirty & /*$isActive*/ 1) {
    				toggle_class(li2, "active", /*$isActive*/ ctx[0]("/search"));
    			}

    			if ((!current || dirty & /*$user*/ 4) && t7_value !== (t7_value = /*$user*/ ctx[2].username + "")) set_data_dev(t7, t7_value);

    			if (!current || dirty & /*$url*/ 2 && a3_href_value !== (a3_href_value = /*$url*/ ctx[1]("/profile"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			if (dirty & /*$isActive*/ 1) {
    				toggle_class(li3, "active", /*$isActive*/ ctx[0]("/profile"));
    			}

    			if (!current || dirty & /*$url*/ 2 && a4_href_value !== (a4_href_value = /*$url*/ ctx[1]("/profile"))) {
    				attr_dev(a4, "href", a4_href_value);
    			}

    			if (!current || dirty & /*$url*/ 2 && a5_href_value !== (a5_href_value = /*$url*/ ctx[1]("/profile"))) {
    				attr_dev(a5, "href", a5_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fahome.$$.fragment, local);
    			transition_in(fachalkboard.$$.fragment, local);
    			transition_in(fasearch.$$.fragment, local);
    			transition_in(chevroncircleup.$$.fragment, local);
    			transition_in(fafileimport.$$.fragment, local);
    			transition_in(fafileexport.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fahome.$$.fragment, local);
    			transition_out(fachalkboard.$$.fragment, local);
    			transition_out(fasearch.$$.fragment, local);
    			transition_out(chevroncircleup.$$.fragment, local);
    			transition_out(fafileimport.$$.fragment, local);
    			transition_out(fafileexport.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_component(fahome);
    			destroy_component(fachalkboard);
    			destroy_component(fasearch);
    			destroy_component(chevroncircleup);
    			destroy_component(fafileimport);
    			destroy_component(fafileexport);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $isActive;
    	let $url;
    	let $user;
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(0, $isActive = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(2, $user = $$value));

    	const open_space = () => {
    		n$1();
    	};

    	const save_space = () => {
    		r$1();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, []);

    	$$self.$capture_state = () => ({
    		isActive,
    		url,
    		Btn,
    		ChevronCircleUp: FaChevronCircleUp,
    		FaHome,
    		FaSearch,
    		FaChalkboard,
    		FaUserCog,
    		FaPlus,
    		FaFileImport,
    		FaFileExport,
    		FaTools,
    		FaCaretUp,
    		user,
    		isLoggedIn,
    		open: n$1,
    		save: r$1,
    		open_space,
    		save_space,
    		$isActive,
    		$url,
    		$user
    	});

    	return [$isActive, $url, $user, open_space, save_space];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/comp/ui/statusbar.svelte generated by Svelte v3.24.0 */
    const file$f = "src/comp/ui/statusbar.svelte";

    // (71:4) {:else}
    function create_else_block_1(ctx) {
    	let span0;
    	let span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "⏺";
    			span1 = element("span");
    			span1.textContent = "  Disconnected";
    			attr_dev(span0, "class", "uncon svelte-6dfn6a");
    			add_location(span0, file$f, 71, 6, 1242);
    			attr_dev(span1, "class", "svelte-6dfn6a");
    			add_location(span1, file$f, 71, 34, 1270);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, span1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(71:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {#if $isLoggedIn}
    function create_if_block_1$1(ctx) {
    	let span0;
    	let span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "⏺";
    			span1 = element("span");
    			span1.textContent = "  Connected";
    			attr_dev(span0, "class", "con svelte-6dfn6a");
    			add_location(span0, file$f, 69, 6, 1163);
    			attr_dev(span1, "class", "svelte-6dfn6a");
    			add_location(span1, file$f, 69, 32, 1189);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, span1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(69:4) {#if $isLoggedIn}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Not logged in";
    			attr_dev(p, "class", "svelte-6dfn6a");
    			add_location(p, file$f, 80, 6, 1499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(80:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (78:4) {#if $isLoggedIn}
    function create_if_block$3(ctx) {
    	let p;
    	let span;
    	let t0_value = /*$user*/ ctx[1].username + "";
    	let t0;
    	let t1;
    	let t2_value = /*$user*/ ctx[1].uid + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" (id: ");
    			t2 = text(t2_value);
    			t3 = text(")");
    			attr_dev(span, "class", "info svelte-6dfn6a");
    			add_location(span, file$f, 78, 9, 1414);
    			attr_dev(p, "class", "svelte-6dfn6a");
    			add_location(p, file$f, 78, 6, 1411);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 2 && t0_value !== (t0_value = /*$user*/ ctx[1].username + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$user*/ 2 && t2_value !== (t2_value = /*$user*/ ctx[1].uid + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(78:4) {#if $isLoggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	function select_block_type(ctx, dirty) {
    		if (/*$isLoggedIn*/ ctx[0]) return create_if_block_1$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*$isLoggedIn*/ ctx[0]) return create_if_block$3;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			if_block1.c();
    			attr_dev(div0, "class", "left svelte-6dfn6a");
    			add_location(div0, file$f, 67, 2, 1115);
    			attr_dev(div1, "class", "middle svelte-6dfn6a");
    			add_location(div1, file$f, 74, 2, 1329);
    			attr_dev(div2, "class", "right svelte-6dfn6a");
    			add_location(div2, file$f, 76, 2, 1362);
    			attr_dev(div3, "class", "status svelte-6dfn6a");
    			add_location(div3, file$f, 66, 0, 1092);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			if_block0.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			if_block1.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $isLoggedIn;
    	let $user;
    	validate_store(isLoggedIn, "isLoggedIn");
    	component_subscribe($$self, isLoggedIn, $$value => $$invalidate(0, $isLoggedIn = $$value));
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Statusbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Statusbar", $$slots, []);
    	$$self.$capture_state = () => ({ user, isLoggedIn, $isLoggedIn, $user });
    	return [$isLoggedIn, $user];
    }

    class Statusbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Statusbar",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }

    function a$1(a,n,i$1){void 0===i$1&&(i$1=!1),o({cmd:"listen",event:a,handler:i(n,i$1),once:i$1});}function n$2(t,a){o({cmd:"emit",event:t,payload:a});}var i$2=Object.freeze({__proto__:null,listen:a$1,emit:n$2});

    /* src/pages/_layout.svelte generated by Svelte v3.24.0 */

    const { console: console_1 } = globals;
    const file$g = "src/pages/_layout.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let div_intro;
    	let t;
    	let statusbar;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
    	statusbar = new Statusbar({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			create_component(statusbar.$$.fragment);
    			attr_dev(div, "class", "layout svelte-1aukfdb");
    			add_location(div, file$g, 38, 0, 1540);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(statusbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, blur, {});
    					div_intro.start();
    				});
    			}

    			transition_in(statusbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(statusbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(statusbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $beforeUrlChange;
    	let $user;
    	validate_store(beforeUrlChange, "beforeUrlChange");
    	component_subscribe($$self, beforeUrlChange, $$value => $$invalidate(2, $beforeUrlChange = $$value));
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(3, $user = $$value));

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	a$1("request", data => {
    		console.log(data);
    	});

    	$beforeUrlChange(() => __awaiter(void 0, void 0, void 0, function* () {
    		n$2("pageChange", "changed");
    		a({ cmd: "pageChanged", uid: $user.id });

    		return true;
    	}));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Layout", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		Nav,
    		StatusBar: Statusbar,
    		blur,
    		beforeUrlChange,
    		afterPageLoad,
    		params,
    		emit: n$2,
    		listen: a$1,
    		invoke: o,
    		promisified: a,
    		user,
    		isLoggedIn,
    		$beforeUrlChange,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$$scope, $$slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/pages/dash/request.svelte generated by Svelte v3.24.0 */

    function create_fragment$j(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Request> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Request", $$slots, []);
    	return [];
    }

    class Request extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Request",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/pages/dash.svelte generated by Svelte v3.24.0 */

    const { console: console_1$1 } = globals;
    const file$h = "src/pages/dash.svelte";

    // (87:4) <Btn btn="raised" on:click={parse}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Parse");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(87:4) <Btn btn=\\\"raised\\\" on:click={parse}>",
    		ctx
    	});

    	return block;
    }

    // (90:2) <Btn btn="raised" on:click={openfile}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Open");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(90:2) <Btn btn=\\\"raised\\\" on:click={openfile}>",
    		ctx
    	});

    	return block;
    }

    // (91:2) <Btn btn="raised" on:click={savefile}>
    function create_default_slot$b(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Save");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(91:2) <Btn btn=\\\"raised\\\" on:click={savefile}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let nav;
    	let t0;
    	let h3;
    	let t2;
    	let div0;
    	let textarea;
    	let t3;
    	let div1;
    	let btn0;
    	let t4;
    	let br;
    	let t5;
    	let btn1;
    	let t6;
    	let btn2;
    	let current;
    	let mounted;
    	let dispose;
    	nav = new Nav({ $$inline: true });

    	btn0 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn0.$on("click", /*parse*/ ctx[1]);

    	btn1 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn1.$on("click", /*openfile*/ ctx[2]);

    	btn2 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn2.$on("click", /*savefile*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Dash";
    			t2 = space();
    			div0 = element("div");
    			textarea = element("textarea");
    			t3 = space();
    			div1 = element("div");
    			create_component(btn0.$$.fragment);
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			create_component(btn1.$$.fragment);
    			t6 = space();
    			create_component(btn2.$$.fragment);
    			add_location(h3, file$h, 78, 2, 2723);
    			attr_dev(textarea, "class", "input svelte-1y13iep");
    			add_location(textarea, file$h, 80, 4, 2760);
    			attr_dev(div0, "class", "in svelte-1y13iep");
    			add_location(div0, file$h, 79, 2, 2739);
    			attr_dev(div1, "class", "parse svelte-1y13iep");
    			add_location(div1, file$h, 85, 2, 2864);
    			add_location(br, file$h, 88, 2, 2946);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*text*/ ctx[0]);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(btn0, div1, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(btn1, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(btn2, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[5]),
    					listen_dev(textarea, "change", /*update*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) {
    				set_input_value(textarea, /*text*/ ctx[0]);
    			}

    			const btn0_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn0_changes.$$scope = { dirty, ctx };
    			}

    			btn0.$set(btn0_changes);
    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);
    			const btn2_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn2_changes.$$scope = { dirty, ctx };
    			}

    			btn2.$set(btn2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			transition_in(btn2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			transition_out(btn2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_component(btn0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t5);
    			destroy_component(btn1, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(btn2, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let text = "";
    	let dataFrom = Promise.resolve([]);

    	const parse = () => __awaiter(void 0, void 0, void 0, function* () {
    		let data = a({ cmd: "parseText", text }).then(response => {
    			console.log("From js: " + response);
    			console.log("DataFrom: " + dataFrom);
    		}).catch(err => {
    			console.error(err);
    		});

    		console.log("DataFrom: " + dataFrom);
    	});

    	const openfile = () => __awaiter(void 0, void 0, void 0, function* () {
    		let path = yield n$1().then(path => path.toString()).catch(err => console.error(err));
    		let opn = yield a({ cmd: "openFile", path });
    		console.log(opn.toString());
    	});

    	let savefile = () => __awaiter(void 0, void 0, void 0, function* () {
    		let path = yield r$1().then(res => res.toString()).catch(err => console.error(err));
    		let sve = yield a({ cmd: "saveFile", path, data: text });
    		console.log(sve.toString());
    	});

    	let update = () => __awaiter(void 0, void 0, void 0, function* () {
    		let change = yield a({ cmd: "inputChanged", input: text }).then(res => res).catch(err => console.error(err));
    		console.log(change);
    	});

    	window.addEventListener("open", data => {
    		console.log("Hello, opened" + data);
    	});

    	window.addEventListener("save", data => {
    		console.log("Hello, opened" + data);
    	});

    	document.addEventListener("open", data => {
    		console.log("Hello, opened" + data);
    	});

    	document.addEventListener("save", () => {
    		console.log("Hello, saved");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Dash> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dash", $$slots, []);

    	function textarea_input_handler() {
    		text = this.value;
    		$$invalidate(0, text);
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		Nav,
    		Btn,
    		invoke: o,
    		promisified: a,
    		open: n$1,
    		save: r$1,
    		text,
    		dataFrom,
    		parse,
    		openfile,
    		savefile,
    		update
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("dataFrom" in $$props) dataFrom = $$props.dataFrom;
    		if ("savefile" in $$props) $$invalidate(3, savefile = $$props.savefile);
    		if ("update" in $$props) $$invalidate(4, update = $$props.update);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, parse, openfile, savefile, update, textarea_input_handler];
    }

    class Dash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dash",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/comp/ui/topbar.svelte generated by Svelte v3.24.0 */
    const file$i = "src/comp/ui/topbar.svelte";

    // (118:6) <Btn btn="raised square">
    function create_default_slot_3(ctx) {
    	let div;
    	let fahome;
    	let t;
    	let current;
    	fahome = new FaHome({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fahome.$$.fragment);
    			t = text("\n        Home");
    			attr_dev(div, "class", "icn svelte-dwfz12");
    			add_location(div, file$i, 118, 8, 2514);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fahome, div, null);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fahome.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fahome.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fahome);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(118:6) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    // (128:6) <Btn btn="raised square">
    function create_default_slot_2$1(ctx) {
    	let t;
    	let div;
    	let fachalkboard;
    	let current;
    	fachalkboard = new FaChalkboard({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Dash\n      ");
    			div = element("div");
    			create_component(fachalkboard.$$.fragment);
    			attr_dev(div, "class", "icn svelte-dwfz12");
    			add_location(div, file$i, 129, 6, 2752);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(fachalkboard, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fachalkboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fachalkboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(fachalkboard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(128:6) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    // (164:6) <Btn btn="raised square">
    function create_default_slot_1$1(ctx) {
    	let t;
    	let div;
    	let fafileimport;
    	let current;
    	fafileimport = new FaFileImport({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Open\n      ");
    			div = element("div");
    			create_component(fafileimport.$$.fragment);
    			attr_dev(div, "class", "icn svelte-dwfz12");
    			add_location(div, file$i, 165, 6, 3453);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(fafileimport, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fafileimport.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fafileimport.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(fafileimport);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(164:6) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    // (174:6) <Btn btn="raised square">
    function create_default_slot$c(ctx) {
    	let t;
    	let div;
    	let fafileexport;
    	let current;
    	fafileexport = new FaFileExport({ $$inline: true });

    	const block = {
    		c: function create() {
    			t = text("Save\n      ");
    			div = element("div");
    			create_component(fafileexport.$$.fragment);
    			attr_dev(div, "class", "icn svelte-dwfz12");
    			add_location(div, file$i, 175, 6, 3680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(fafileexport, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fafileexport.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fafileexport.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(fafileexport);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(174:6) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div3;
    	let ul;
    	let div0;
    	let li0;
    	let a0;
    	let btn0;
    	let a0_href_value;
    	let t0;
    	let li1;
    	let a1;
    	let btn1;
    	let a1_href_value;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let li2;
    	let a2;
    	let btn2;
    	let a2_href_value;
    	let t3;
    	let li3;
    	let a3;
    	let btn3;
    	let a3_href_value;
    	let current;
    	let mounted;
    	let dispose;

    	btn0 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn1 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn2 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn3 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			ul = element("ul");
    			div0 = element("div");
    			li0 = element("li");
    			a0 = element("a");
    			create_component(btn0.$$.fragment);
    			t0 = space();
    			li1 = element("li");
    			a1 = element("a");
    			create_component(btn1.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			div2 = element("div");
    			li2 = element("li");
    			a2 = element("a");
    			create_component(btn2.$$.fragment);
    			t3 = space();
    			li3 = element("li");
    			a3 = element("a");
    			create_component(btn3.$$.fragment);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[1]("/home"));
    			attr_dev(a0, "class", "svelte-dwfz12");
    			add_location(a0, file$i, 116, 4, 2449);
    			attr_dev(li0, "class", "svelte-dwfz12");
    			toggle_class(li0, "active", /*$isActive*/ ctx[0]("/home"));
    			add_location(li0, file$i, 115, 2, 2406);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[1]("/dash"));
    			attr_dev(a1, "class", "svelte-dwfz12");
    			add_location(a1, file$i, 126, 4, 2678);
    			attr_dev(li1, "class", "link left-link svelte-dwfz12");
    			toggle_class(li1, "active", /*$isActive*/ ctx[0]("/dash"));
    			add_location(li1, file$i, 125, 2, 2612);
    			attr_dev(div0, "class", "left svelte-dwfz12");
    			add_location(div0, file$i, 114, 2, 2385);
    			attr_dev(div1, "class", "middle svelte-dwfz12");
    			add_location(div1, file$i, 137, 2, 2851);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[1]("/profile"));
    			attr_dev(a2, "class", "svelte-dwfz12");
    			add_location(a2, file$i, 162, 4, 3376);
    			attr_dev(li2, "class", "link right-link nav-btn svelte-dwfz12");
    			add_location(li2, file$i, 161, 2, 3313);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[1]("/profile"));
    			attr_dev(a3, "class", "svelte-dwfz12");
    			add_location(a3, file$i, 172, 4, 3603);
    			attr_dev(li3, "class", "link right-link nav-btn svelte-dwfz12");
    			add_location(li3, file$i, 171, 2, 3540);
    			attr_dev(div2, "class", "right svelte-dwfz12");
    			add_location(div2, file$i, 160, 2, 3291);
    			attr_dev(ul, "class", "svelte-dwfz12");
    			add_location(ul, file$i, 113, 0, 2378);
    			attr_dev(div3, "class", "nav svelte-dwfz12");
    			add_location(div3, file$i, 112, 0, 2360);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, ul);
    			append_dev(ul, div0);
    			append_dev(div0, li0);
    			append_dev(li0, a0);
    			mount_component(btn0, a0, null);
    			append_dev(div0, t0);
    			append_dev(div0, li1);
    			append_dev(li1, a1);
    			mount_component(btn1, a1, null);
    			append_dev(ul, t1);
    			append_dev(ul, div1);
    			append_dev(ul, t2);
    			append_dev(ul, div2);
    			append_dev(div2, li2);
    			append_dev(li2, a2);
    			mount_component(btn2, a2, null);
    			append_dev(div2, t3);
    			append_dev(div2, li3);
    			append_dev(li3, a3);
    			mount_component(btn3, a3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li2, "click", /*open_space*/ ctx[2], false, false, false),
    					listen_dev(li3, "click", /*save_space*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const btn0_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				btn0_changes.$$scope = { dirty, ctx };
    			}

    			btn0.$set(btn0_changes);

    			if (!current || dirty & /*$url*/ 2 && a0_href_value !== (a0_href_value = /*$url*/ ctx[1]("/home"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*$isActive*/ 1) {
    				toggle_class(li0, "active", /*$isActive*/ ctx[0]("/home"));
    			}

    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);

    			if (!current || dirty & /*$url*/ 2 && a1_href_value !== (a1_href_value = /*$url*/ ctx[1]("/dash"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*$isActive*/ 1) {
    				toggle_class(li1, "active", /*$isActive*/ ctx[0]("/dash"));
    			}

    			const btn2_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				btn2_changes.$$scope = { dirty, ctx };
    			}

    			btn2.$set(btn2_changes);

    			if (!current || dirty & /*$url*/ 2 && a2_href_value !== (a2_href_value = /*$url*/ ctx[1]("/profile"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			const btn3_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				btn3_changes.$$scope = { dirty, ctx };
    			}

    			btn3.$set(btn3_changes);

    			if (!current || dirty & /*$url*/ 2 && a3_href_value !== (a3_href_value = /*$url*/ ctx[1]("/profile"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			transition_in(btn2.$$.fragment, local);
    			transition_in(btn3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			transition_out(btn2.$$.fragment, local);
    			transition_out(btn3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(btn0);
    			destroy_component(btn1);
    			destroy_component(btn2);
    			destroy_component(btn3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $isActive;
    	let $url;
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(0, $isActive = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));

    	const open_space = () => {
    		n$1();
    	};

    	const save_space = () => {
    		r$1();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Topbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Topbar", $$slots, []);

    	$$self.$capture_state = () => ({
    		isActive,
    		url,
    		Btn,
    		ChevronCircleUp: FaChevronCircleUp,
    		FaHome,
    		FaSearch,
    		FaChalkboard,
    		FaUserCog,
    		FaPlus,
    		FaFileImport,
    		FaFileExport,
    		FaTools,
    		FaCaretUp,
    		user,
    		isLoggedIn,
    		open: n$1,
    		save: r$1,
    		open_space,
    		save_space,
    		$isActive,
    		$url
    	});

    	return [$isActive, $url, open_space, save_space];
    }

    class Topbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Topbar",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    function t$1(t){o({cmd:"setTitle",title:t});}function o$1(t){o({cmd:"open",uri:t});}var i$3=Object.freeze({__proto__:null,setTitle:t$1,open:o$1});

    /* src/comp/ui/menubar.svelte generated by Svelte v3.24.0 */
    const file$j = "src/comp/ui/menubar.svelte";

    // (114:8) <Btn btn="raised grad">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(114:8) <Btn btn=\\\"raised grad\\\">",
    		ctx
    	});

    	return block;
    }

    // (124:8) <Btn btn="raised grad">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Edit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(124:8) <Btn btn=\\\"raised grad\\\">",
    		ctx
    	});

    	return block;
    }

    // (129:8) <Btn btn="raised grad">
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Recs");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(129:8) <Btn btn=\\\"raised grad\\\">",
    		ctx
    	});

    	return block;
    }

    // (139:8) <Btn btn="raised grad">
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Items");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(139:8) <Btn btn=\\\"raised grad\\\">",
    		ctx
    	});

    	return block;
    }

    // (148:8) <Btn btn="raised">
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Stats");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(148:8) <Btn btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    // (153:8) <Btn btn="raised">
    function create_default_slot$d(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Profile");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(153:8) <Btn btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div3;
    	let ul;
    	let div0;
    	let li0;
    	let btn0;
    	let t0;
    	let li1;
    	let btn1;
    	let t1;
    	let li2;
    	let btn2;
    	let t2;
    	let li3;
    	let btn3;
    	let t3;
    	let div1;
    	let t4;
    	let div2;
    	let li4;
    	let btn4;
    	let t5;
    	let li5;
    	let btn5;
    	let current;

    	btn0 = new Btn({
    			props: {
    				btn: "raised grad",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn1 = new Btn({
    			props: {
    				btn: "raised grad",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn2 = new Btn({
    			props: {
    				btn: "raised grad",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn3 = new Btn({
    			props: {
    				btn: "raised grad",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn4 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn5 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			ul = element("ul");
    			div0 = element("div");
    			li0 = element("li");
    			create_component(btn0.$$.fragment);
    			t0 = space();
    			li1 = element("li");
    			create_component(btn1.$$.fragment);
    			t1 = space();
    			li2 = element("li");
    			create_component(btn2.$$.fragment);
    			t2 = space();
    			li3 = element("li");
    			create_component(btn3.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			t4 = space();
    			div2 = element("div");
    			li4 = element("li");
    			create_component(btn4.$$.fragment);
    			t5 = space();
    			li5 = element("li");
    			create_component(btn5.$$.fragment);
    			attr_dev(li0, "class", "svelte-sednoi");
    			add_location(li0, file$j, 112, 6, 2056);
    			attr_dev(li1, "class", "svelte-sednoi");
    			add_location(li1, file$j, 122, 6, 2236);
    			attr_dev(li2, "class", "svelte-sednoi");
    			add_location(li2, file$j, 127, 6, 2321);
    			attr_dev(li3, "class", "svelte-sednoi");
    			add_location(li3, file$j, 137, 6, 2503);
    			attr_dev(div0, "class", "left svelte-sednoi");
    			add_location(div0, file$j, 111, 4, 2031);
    			attr_dev(div1, "class", "middle svelte-sednoi");
    			add_location(div1, file$j, 143, 4, 2598);
    			attr_dev(li4, "class", "svelte-sednoi");
    			add_location(li4, file$j, 146, 6, 2660);
    			attr_dev(li5, "class", "svelte-sednoi");
    			add_location(li5, file$j, 151, 6, 2741);
    			attr_dev(div2, "class", "right svelte-sednoi");
    			add_location(div2, file$j, 145, 4, 2634);
    			attr_dev(ul, "class", "svelte-sednoi");
    			add_location(ul, file$j, 110, 2, 2022);
    			attr_dev(div3, "class", "menu svelte-sednoi");
    			add_location(div3, file$j, 109, 0, 2001);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, ul);
    			append_dev(ul, div0);
    			append_dev(div0, li0);
    			mount_component(btn0, li0, null);
    			append_dev(div0, t0);
    			append_dev(div0, li1);
    			mount_component(btn1, li1, null);
    			append_dev(div0, t1);
    			append_dev(div0, li2);
    			mount_component(btn2, li2, null);
    			append_dev(div0, t2);
    			append_dev(div0, li3);
    			mount_component(btn3, li3, null);
    			append_dev(ul, t3);
    			append_dev(ul, div1);
    			append_dev(ul, t4);
    			append_dev(ul, div2);
    			append_dev(div2, li4);
    			mount_component(btn4, li4, null);
    			append_dev(div2, t5);
    			append_dev(div2, li5);
    			mount_component(btn5, li5, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const btn0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				btn0_changes.$$scope = { dirty, ctx };
    			}

    			btn0.$set(btn0_changes);
    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);
    			const btn2_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				btn2_changes.$$scope = { dirty, ctx };
    			}

    			btn2.$set(btn2_changes);
    			const btn3_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				btn3_changes.$$scope = { dirty, ctx };
    			}

    			btn3.$set(btn3_changes);
    			const btn4_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				btn4_changes.$$scope = { dirty, ctx };
    			}

    			btn4.$set(btn4_changes);
    			const btn5_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				btn5_changes.$$scope = { dirty, ctx };
    			}

    			btn5.$set(btn5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			transition_in(btn2.$$.fragment, local);
    			transition_in(btn3.$$.fragment, local);
    			transition_in(btn4.$$.fragment, local);
    			transition_in(btn5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			transition_out(btn2.$$.fragment, local);
    			transition_out(btn3.$$.fragment, local);
    			transition_out(btn4.$$.fragment, local);
    			transition_out(btn5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(btn0);
    			destroy_component(btn1);
    			destroy_component(btn2);
    			destroy_component(btn3);
    			destroy_component(btn4);
    			destroy_component(btn5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	const open_space = () => {
    		n$1();
    	};

    	const save_space = () => {
    		r$1();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menubar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Menubar", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		beforeUrlChange,
    		isActive,
    		url,
    		Btn,
    		open: n$1,
    		save: r$1,
    		user,
    		isLoggedIn,
    		open_space,
    		save_space
    	});

    	return [];
    }

    class Menubar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menubar",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/comp/ui/switch.svelte generated by Svelte v3.24.0 */
    const file$k = "src/comp/ui/switch.svelte";

    function create_fragment$n(ctx) {
    	let label;
    	let input;
    	let t;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = space();
    			span = element("span");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-3f4h7x");
    			add_location(input, file$k, 68, 3, 1152);
    			attr_dev(span, "class", "slider svelte-3f4h7x");
    			add_location(span, file$k, 69, 2, 1201);
    			attr_dev(label, "class", "switch svelte-3f4h7x");
    			add_location(label, file$k, 67, 1, 1126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = /*toggled*/ ctx[0];
    			append_dev(label, t);
    			append_dev(label, span);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toggled*/ 1) {
    				input.checked = /*toggled*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let toggled = false;
    	const dispatch = createEventDispatcher();

    	const toggle = () => {
    		dispatch("toggled", { toggled: !toggled });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Switch", $$slots, []);

    	function input_change_handler() {
    		toggled = this.checked;
    		$$invalidate(0, toggled);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		toggled,
    		dispatch,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggled" in $$props) $$invalidate(0, toggled = $$props.toggled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toggled, input_change_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/pages/home/index.svelte generated by Svelte v3.24.0 */
    const file$l = "src/pages/home/index.svelte";

    // (66:0) {#if showNav}
    function create_if_block$4(ctx) {
    	let nav;
    	let current;
    	nav = new Nav({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(66:0) {#if showNav}",
    		ctx
    	});

    	return block;
    }

    // (75:31) <Btn btn="raised">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(75:31) <Btn btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    // (76:27) <Btn btn="raised">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Open");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(76:27) <Btn btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    // (82:4) <Btn btn="raised" on:click={() => {$goto('/item/new')}}>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(82:4) <Btn btn=\\\"raised\\\" on:click={() => {$goto('/item/new')}}>",
    		ctx
    	});

    	return block;
    }

    // (83:4) <Btn btn="raised" on:click={() => {$goto('/item')}}>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Open");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(83:4) <Btn btn=\\\"raised\\\" on:click={() => {$goto('/item')}}>",
    		ctx
    	});

    	return block;
    }

    // (84:4) <Btn btn="raised" on:click={() => {$goto('/item')}}>
    function create_default_slot_3$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Stats");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(84:4) <Btn btn=\\\"raised\\\" on:click={() => {$goto('/item')}}>",
    		ctx
    	});

    	return block;
    }

    // (90:4) <Btn btn="raised square">
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(90:4) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    // (91:4) <Btn btn="raised square">
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Open");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(91:4) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    // (92:4) <Btn btn="raised square" on:click={() => {$goto('/item')}}>
    function create_default_slot$e(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Edit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$e.name,
    		type: "slot",
    		source: "(92:4) <Btn btn=\\\"raised square\\\" on:click={() => {$goto('/item')}}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let t0;
    	let menu;
    	let t1;
    	let nav;
    	let t2;
    	let div3;
    	let br0;
    	let br1;
    	let t3;
    	let div0;
    	let a0;
    	let h30;
    	let a0_href_value;
    	let t5;
    	let a1;
    	let btn0;
    	let a1_href_value;
    	let t6;
    	let a2;
    	let btn1;
    	let a2_href_value;
    	let t7;
    	let br2;
    	let br3;
    	let t8;
    	let p0;
    	let em0;
    	let t10;
    	let div1;
    	let a3;
    	let h31;
    	let a3_href_value;
    	let t12;
    	let btn2;
    	let t13;
    	let btn3;
    	let t14;
    	let btn4;
    	let t15;
    	let br4;
    	let br5;
    	let t16;
    	let p1;
    	let em1;
    	let t18;
    	let div2;
    	let a4;
    	let h32;
    	let a4_href_value;
    	let t20;
    	let btn5;
    	let t21;
    	let btn6;
    	let t22;
    	let btn7;
    	let t23;
    	let br6;
    	let br7;
    	let t24;
    	let p2;
    	let em2;
    	let t26;
    	let p3;
    	let a5;
    	let t27;
    	let a5_href_value;
    	let t28;
    	let br8;
    	let br9;
    	let t29;
    	let switch_1;
    	let current;
    	let if_block = /*showNav*/ ctx[0] && create_if_block$4(ctx);
    	menu = new Menubar({ $$inline: true });
    	nav = new Nav({ $$inline: true });

    	btn0 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn1 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn2 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn2.$on("click", /*click_handler*/ ctx[4]);

    	btn3 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn3.$on("click", /*click_handler_1*/ ctx[5]);

    	btn4 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn4.$on("click", /*click_handler_2*/ ctx[6]);

    	btn5 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn6 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn7 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot$e] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn7.$on("click", /*click_handler_3*/ ctx[7]);
    	switch_1 = new Switch({ $$inline: true });
    	switch_1.$on("toggle", /*toggleNav*/ ctx[3]);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(menu.$$.fragment);
    			t1 = space();
    			create_component(nav.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t3 = space();
    			div0 = element("div");
    			a0 = element("a");
    			h30 = element("h3");
    			h30.textContent = "Your Records";
    			t5 = space();
    			a1 = element("a");
    			create_component(btn0.$$.fragment);
    			t6 = space();
    			a2 = element("a");
    			create_component(btn1.$$.fragment);
    			t7 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t8 = space();
    			p0 = element("p");
    			em0 = element("em");
    			em0.textContent = "Records here...";
    			t10 = space();
    			div1 = element("div");
    			a3 = element("a");
    			h31 = element("h3");
    			h31.textContent = "Your Items";
    			t12 = space();
    			create_component(btn2.$$.fragment);
    			t13 = space();
    			create_component(btn3.$$.fragment);
    			t14 = space();
    			create_component(btn4.$$.fragment);
    			t15 = space();
    			br4 = element("br");
    			br5 = element("br");
    			t16 = space();
    			p1 = element("p");
    			em1 = element("em");
    			em1.textContent = "Items here...";
    			t18 = space();
    			div2 = element("div");
    			a4 = element("a");
    			h32 = element("h3");
    			h32.textContent = "Your Rules";
    			t20 = space();
    			create_component(btn5.$$.fragment);
    			t21 = space();
    			create_component(btn6.$$.fragment);
    			t22 = space();
    			create_component(btn7.$$.fragment);
    			t23 = space();
    			br6 = element("br");
    			br7 = element("br");
    			t24 = space();
    			p2 = element("p");
    			em2 = element("em");
    			em2.textContent = "Rules here...";
    			t26 = space();
    			p3 = element("p");
    			a5 = element("a");
    			t27 = text("Back to index");
    			t28 = space();
    			br8 = element("br");
    			br9 = element("br");
    			t29 = space();
    			create_component(switch_1.$$.fragment);
    			add_location(br0, file$l, 71, 2, 1780);
    			add_location(br1, file$l, 71, 7, 1785);
    			attr_dev(h30, "class", "svelte-dwh2jy");
    			add_location(h30, file$l, 73, 28, 1847);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[1]("./rec"));
    			add_location(a0, file$l, 73, 4, 1823);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[1]("/rec/new"));
    			add_location(a1, file$l, 74, 4, 1877);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[1]("/rec"));
    			add_location(a2, file$l, 75, 4, 1940);
    			add_location(br2, file$l, 76, 6, 2002);
    			add_location(br3, file$l, 76, 11, 2007);
    			add_location(em0, file$l, 77, 7, 2020);
    			add_location(p0, file$l, 77, 4, 2017);
    			attr_dev(div0, "class", "rec wrapper svelte-dwh2jy");
    			add_location(div0, file$l, 72, 2, 1793);
    			attr_dev(h31, "class", "svelte-dwh2jy");
    			add_location(h31, file$l, 80, 29, 2116);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[1]("./item"));
    			add_location(a3, file$l, 80, 4, 2091);
    			add_location(br4, file$l, 84, 6, 2351);
    			add_location(br5, file$l, 84, 11, 2356);
    			add_location(em1, file$l, 85, 7, 2369);
    			add_location(p1, file$l, 85, 4, 2366);
    			attr_dev(div1, "class", "item wrapper svelte-dwh2jy");
    			add_location(div1, file$l, 79, 2, 2060);
    			attr_dev(h32, "class", "svelte-dwh2jy");
    			add_location(h32, file$l, 88, 29, 2463);
    			attr_dev(a4, "href", a4_href_value = /*$url*/ ctx[1]("./rule"));
    			add_location(a4, file$l, 88, 4, 2438);
    			add_location(br6, file$l, 92, 6, 2646);
    			add_location(br7, file$l, 92, 11, 2651);
    			add_location(em2, file$l, 93, 7, 2664);
    			add_location(p2, file$l, 93, 4, 2661);
    			attr_dev(div2, "class", "rule wrapper svelte-dwh2jy");
    			add_location(div2, file$l, 87, 2, 2407);
    			attr_dev(a5, "href", a5_href_value = /*$url*/ ctx[1]("/index"));
    			add_location(a5, file$l, 95, 5, 2705);
    			add_location(p3, file$l, 95, 2, 2702);
    			add_location(br8, file$l, 96, 2, 2754);
    			add_location(br9, file$l, 96, 7, 2759);
    			attr_dev(div3, "class", "home svelte-dwh2jy");
    			add_location(div3, file$l, 70, 0, 1759);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(menu, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(nav, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, br0);
    			append_dev(div3, br1);
    			append_dev(div3, t3);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(a0, h30);
    			append_dev(div0, t5);
    			append_dev(div0, a1);
    			mount_component(btn0, a1, null);
    			append_dev(div0, t6);
    			append_dev(div0, a2);
    			mount_component(btn1, a2, null);
    			append_dev(div0, t7);
    			append_dev(div0, br2);
    			append_dev(div0, br3);
    			append_dev(div0, t8);
    			append_dev(div0, p0);
    			append_dev(p0, em0);
    			append_dev(div3, t10);
    			append_dev(div3, div1);
    			append_dev(div1, a3);
    			append_dev(a3, h31);
    			append_dev(div1, t12);
    			mount_component(btn2, div1, null);
    			append_dev(div1, t13);
    			mount_component(btn3, div1, null);
    			append_dev(div1, t14);
    			mount_component(btn4, div1, null);
    			append_dev(div1, t15);
    			append_dev(div1, br4);
    			append_dev(div1, br5);
    			append_dev(div1, t16);
    			append_dev(div1, p1);
    			append_dev(p1, em1);
    			append_dev(div3, t18);
    			append_dev(div3, div2);
    			append_dev(div2, a4);
    			append_dev(a4, h32);
    			append_dev(div2, t20);
    			mount_component(btn5, div2, null);
    			append_dev(div2, t21);
    			mount_component(btn6, div2, null);
    			append_dev(div2, t22);
    			mount_component(btn7, div2, null);
    			append_dev(div2, t23);
    			append_dev(div2, br6);
    			append_dev(div2, br7);
    			append_dev(div2, t24);
    			append_dev(div2, p2);
    			append_dev(p2, em2);
    			append_dev(div3, t26);
    			append_dev(div3, p3);
    			append_dev(p3, a5);
    			append_dev(a5, t27);
    			append_dev(div3, t28);
    			append_dev(div3, br8);
    			append_dev(div3, br9);
    			append_dev(div3, t29);
    			mount_component(switch_1, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showNav*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*showNav*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$url*/ 2 && a0_href_value !== (a0_href_value = /*$url*/ ctx[1]("./rec"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			const btn0_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn0_changes.$$scope = { dirty, ctx };
    			}

    			btn0.$set(btn0_changes);

    			if (!current || dirty & /*$url*/ 2 && a1_href_value !== (a1_href_value = /*$url*/ ctx[1]("/rec/new"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);

    			if (!current || dirty & /*$url*/ 2 && a2_href_value !== (a2_href_value = /*$url*/ ctx[1]("/rec"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (!current || dirty & /*$url*/ 2 && a3_href_value !== (a3_href_value = /*$url*/ ctx[1]("./item"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			const btn2_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn2_changes.$$scope = { dirty, ctx };
    			}

    			btn2.$set(btn2_changes);
    			const btn3_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn3_changes.$$scope = { dirty, ctx };
    			}

    			btn3.$set(btn3_changes);
    			const btn4_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn4_changes.$$scope = { dirty, ctx };
    			}

    			btn4.$set(btn4_changes);

    			if (!current || dirty & /*$url*/ 2 && a4_href_value !== (a4_href_value = /*$url*/ ctx[1]("./rule"))) {
    				attr_dev(a4, "href", a4_href_value);
    			}

    			const btn5_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn5_changes.$$scope = { dirty, ctx };
    			}

    			btn5.$set(btn5_changes);
    			const btn6_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn6_changes.$$scope = { dirty, ctx };
    			}

    			btn6.$set(btn6_changes);
    			const btn7_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				btn7_changes.$$scope = { dirty, ctx };
    			}

    			btn7.$set(btn7_changes);

    			if (!current || dirty & /*$url*/ 2 && a5_href_value !== (a5_href_value = /*$url*/ ctx[1]("/index"))) {
    				attr_dev(a5, "href", a5_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(menu.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			transition_in(btn2.$$.fragment, local);
    			transition_in(btn3.$$.fragment, local);
    			transition_in(btn4.$$.fragment, local);
    			transition_in(btn5.$$.fragment, local);
    			transition_in(btn6.$$.fragment, local);
    			transition_in(btn7.$$.fragment, local);
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(menu.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			transition_out(btn2.$$.fragment, local);
    			transition_out(btn3.$$.fragment, local);
    			transition_out(btn4.$$.fragment, local);
    			transition_out(btn5.$$.fragment, local);
    			transition_out(btn6.$$.fragment, local);
    			transition_out(btn7.$$.fragment, local);
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(menu, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			destroy_component(btn0);
    			destroy_component(btn1);
    			destroy_component(btn2);
    			destroy_component(btn3);
    			destroy_component(btn4);
    			destroy_component(btn5);
    			destroy_component(btn6);
    			destroy_component(btn7);
    			destroy_component(switch_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $url;
    	let $goto;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(2, $goto = $$value));
    	let showNav = false;

    	const toggleNav = () => {
    		$$invalidate(0, showNav = !showNav);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	const click_handler = () => {
    		$goto("/item/new");
    	};

    	const click_handler_1 = () => {
    		$goto("/item");
    	};

    	const click_handler_2 = () => {
    		$goto("/item");
    	};

    	const click_handler_3 = () => {
    		$goto("/item");
    	};

    	$$self.$capture_state = () => ({
    		dialog,
    		Topbar,
    		Nav,
    		user,
    		isLoggedIn,
    		emit: n$2,
    		listen: a$1,
    		setTitle: t$1,
    		Btn,
    		Menu: Menubar,
    		beforeUrlChange,
    		goto,
    		isActive,
    		url,
    		Switch,
    		onMount,
    		showNav,
    		toggleNav,
    		$url,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("showNav" in $$props) $$invalidate(0, showNav = $$props.showNav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showNav,
    		$url,
    		$goto,
    		toggleNav,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/comp/ui/input.svelte generated by Svelte v3.24.0 */

    const file$m = "src/comp/ui/input.svelte";

    function create_fragment$p(ctx) {
    	let input;
    	let input_class_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", /*type*/ ctx[0]);
    			attr_dev(input, "name", /*name*/ ctx[1]);
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "class", input_class_value = "" + (null_to_empty(/*cls*/ ctx[3]) + " svelte-8qn7q7"));
    			add_location(input, file$m, 25, 0, 457);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*type*/ 1) {
    				attr_dev(input, "type", /*type*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 2) {
    				attr_dev(input, "name", /*name*/ ctx[1]);
    			}

    			if (dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*cls*/ 8 && input_class_value !== (input_class_value = "" + (null_to_empty(/*cls*/ ctx[3]) + " svelte-8qn7q7"))) {
    				attr_dev(input, "class", input_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { type } = $$props;
    	let { name } = $$props;
    	let { id } = $$props;
    	let { cls } = $$props;
    	let { value = "" } = $$props;
    	const writable_props = ["type", "name", "id", "cls", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Input", $$slots, []);

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("cls" in $$props) $$invalidate(3, cls = $$props.cls);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ type, name, id, cls, value });

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("cls" in $$props) $$invalidate(3, cls = $$props.cls);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, name, id, cls, value];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {
    			type: 0,
    			name: 1,
    			id: 2,
    			cls: 3,
    			value: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<Input> was created without expected prop 'type'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<Input> was created without expected prop 'name'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console.warn("<Input> was created without expected prop 'id'");
    		}

    		if (/*cls*/ ctx[3] === undefined && !("cls" in props)) {
    			console.warn("<Input> was created without expected prop 'cls'");
    		}
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cls() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cls(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.24.0 */

    const { Error: Error_1 } = globals;
    const file$n = "src/pages/index.svelte";

    // (136:2) {:else}
    function create_else_block$1(ctx) {
    	let h3;
    	let t0;
    	let t1_value = /*$user*/ ctx[5].username + "";
    	let t1;
    	let t2;
    	let t3;
    	let p;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text("Welcome, ");
    			t1 = text(t1_value);
    			t2 = text("!");
    			t3 = space();
    			p = element("p");
    			p.textContent = "You have logged in.";
    			add_location(h3, file$n, 136, 4, 3353);
    			attr_dev(p, "class", "svelte-suso25");
    			add_location(p, file$n, 137, 4, 3393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 32 && t1_value !== (t1_value = /*$user*/ ctx[5].username + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(136:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (90:2) {#if !$isLoggedIn}
    function create_if_block$5(ctx) {
    	let br0;
    	let br1;
    	let br2;
    	let br3;
    	let t0;
    	let h3;
    	let t2;
    	let br4;
    	let t3;
    	let div1;
    	let div0;
    	let h2;
    	let t5;
    	let br5;
    	let t6;
    	let label0;
    	let t8;
    	let input0;
    	let t9;
    	let br6;
    	let t10;
    	let label1;
    	let t12;
    	let input1;
    	let t13;
    	let br7;
    	let t14;
    	let btn0;
    	let t15;
    	let btn1;
    	let t16;
    	let br8;
    	let t17;
    	let br9;
    	let t18;
    	let p0;
    	let t19;
    	let a0;
    	let t20;
    	let a0_href_value;
    	let t21;
    	let t22;
    	let br10;
    	let t23;
    	let p1;
    	let a1;
    	let t24;
    	let a1_href_value;
    	let t25;
    	let t26;
    	let br11;
    	let t27;
    	let current;
    	let mounted;
    	let dispose;

    	btn0 = new Btn({
    			props: {
    				btn: "outline",
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn1 = new Btn({
    			props: {
    				btn: "filled",
    				$$slots: { default: [create_default_slot$f] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn1.$on("click", /*handleSubmit*/ ctx[6]);
    	let if_block = /*loginSubmitted*/ ctx[2] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			br1 = element("br");
    			br2 = element("br");
    			br3 = element("br");
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Welcome to div.is";
    			t2 = space();
    			br4 = element("br");
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Login";
    			t5 = space();
    			br5 = element("br");
    			t6 = space();
    			label0 = element("label");
    			label0.textContent = "username";
    			t8 = space();
    			input0 = element("input");
    			t9 = space();
    			br6 = element("br");
    			t10 = space();
    			label1 = element("label");
    			label1.textContent = "password";
    			t12 = space();
    			input1 = element("input");
    			t13 = space();
    			br7 = element("br");
    			t14 = space();
    			create_component(btn0.$$.fragment);
    			t15 = text("  \n        ");
    			create_component(btn1.$$.fragment);
    			t16 = space();
    			br8 = element("br");
    			t17 = space();
    			br9 = element("br");
    			t18 = space();
    			p0 = element("p");
    			t19 = text("Not logged in? ");
    			a0 = element("a");
    			t20 = text("Sign up");
    			t21 = text(".");
    			t22 = space();
    			br10 = element("br");
    			t23 = space();
    			p1 = element("p");
    			a1 = element("a");
    			t24 = text("Forgot password?");
    			t25 = text(".");
    			t26 = space();
    			br11 = element("br");
    			t27 = space();
    			if (if_block) if_block.c();
    			add_location(br0, file$n, 90, 4, 2224);
    			add_location(br1, file$n, 90, 9, 2229);
    			add_location(br2, file$n, 90, 14, 2234);
    			add_location(br3, file$n, 90, 19, 2239);
    			attr_dev(h3, "class", "welcome svelte-suso25");
    			add_location(h3, file$n, 91, 2, 2247);
    			add_location(br4, file$n, 92, 2, 2292);
    			add_location(h2, file$n, 95, 6, 2354);
    			add_location(br5, file$n, 96, 6, 2375);
    			attr_dev(label0, "for", "username");
    			add_location(label0, file$n, 97, 8, 2389);
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "name", "username");
    			attr_dev(input0, "class", "svelte-suso25");
    			add_location(input0, file$n, 98, 8, 2436);
    			add_location(br6, file$n, 103, 8, 2551);
    			attr_dev(label1, "for", "password");
    			add_location(label1, file$n, 104, 8, 2565);
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "svelte-suso25");
    			add_location(input1, file$n, 105, 8, 2612);
    			add_location(br7, file$n, 111, 8, 2753);
    			attr_dev(div0, "class", "loginform svelte-suso25");
    			add_location(div0, file$n, 94, 4, 2324);
    			add_location(br8, file$n, 116, 4, 2891);
    			add_location(br9, file$n, 117, 4, 2901);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[4]("/signup"));
    			add_location(a0, file$n, 118, 22, 2929);
    			attr_dev(p0, "class", "svelte-suso25");
    			add_location(p0, file$n, 118, 4, 2911);
    			add_location(br10, file$n, 119, 4, 2977);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[4]("/home"));
    			add_location(a1, file$n, 120, 7, 2990);
    			attr_dev(p1, "class", "svelte-suso25");
    			add_location(p1, file$n, 120, 4, 2987);
    			add_location(br11, file$n, 121, 4, 3045);
    			attr_dev(div1, "class", "login svelte-suso25");
    			add_location(div1, file$n, 93, 2, 2300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t5);
    			append_dev(div0, br5);
    			append_dev(div0, t6);
    			append_dev(div0, label0);
    			append_dev(div0, t8);
    			append_dev(div0, input0);
    			set_input_value(input0, /*userIn*/ ctx[0].username);
    			append_dev(div0, t9);
    			append_dev(div0, br6);
    			append_dev(div0, t10);
    			append_dev(div0, label1);
    			append_dev(div0, t12);
    			append_dev(div0, input1);
    			set_input_value(input1, /*userIn*/ ctx[0].password);
    			append_dev(div0, t13);
    			append_dev(div0, br7);
    			append_dev(div0, t14);
    			mount_component(btn0, div0, null);
    			append_dev(div0, t15);
    			mount_component(btn1, div0, null);
    			append_dev(div1, t16);
    			append_dev(div1, br8);
    			append_dev(div1, t17);
    			append_dev(div1, br9);
    			append_dev(div1, t18);
    			append_dev(div1, p0);
    			append_dev(p0, t19);
    			append_dev(p0, a0);
    			append_dev(a0, t20);
    			append_dev(p0, t21);
    			append_dev(div1, t22);
    			append_dev(div1, br10);
    			append_dev(div1, t23);
    			append_dev(div1, p1);
    			append_dev(p1, a1);
    			append_dev(a1, t24);
    			append_dev(p1, t25);
    			append_dev(div1, t26);
    			append_dev(div1, br11);
    			append_dev(div1, t27);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userIn*/ 1 && input0.value !== /*userIn*/ ctx[0].username) {
    				set_input_value(input0, /*userIn*/ ctx[0].username);
    			}

    			if (dirty & /*userIn*/ 1 && input1.value !== /*userIn*/ ctx[0].password) {
    				set_input_value(input1, /*userIn*/ ctx[0].password);
    			}

    			const btn0_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				btn0_changes.$$scope = { dirty, ctx };
    			}

    			btn0.$set(btn0_changes);
    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);

    			if (!current || dirty & /*$url*/ 16 && a0_href_value !== (a0_href_value = /*$url*/ ctx[4]("/signup"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 16 && a1_href_value !== (a1_href_value = /*$url*/ ctx[4]("/home"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (/*loginSubmitted*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_component(btn0);
    			destroy_component(btn1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(90:2) {#if !$isLoggedIn}",
    		ctx
    	});

    	return block;
    }

    // (113:8) <Btn btn="outline" >
    function create_default_slot_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reset");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(113:8) <Btn btn=\\\"outline\\\" >",
    		ctx
    	});

    	return block;
    }

    // (114:8) <Btn btn="filled" on:click={handleSubmit}>
    function create_default_slot$f(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$f.name,
    		type: "slot",
    		source: "(114:8) <Btn btn=\\\"filled\\\" on:click={handleSubmit}>",
    		ctx
    	});

    	return block;
    }

    // (123:4) {#if loginSubmitted}
    function create_if_block_1$2(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block
    	};

    	handle_promise(promise = /*loginPromise*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*loginPromise*/ 2 && promise !== (promise = /*loginPromise*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(123:4) {#if loginSubmitted}",
    		ctx
    	});

    	return block;
    }

    // (129:6) {:catch}
    function create_catch_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Couldn't log in user.";
    			attr_dev(p, "class", "svelte-suso25");
    			add_location(p, file$n, 129, 8, 3266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(129:6) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (126:6) {:then}
    function create_then_block(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*$user*/ ctx[5].username + "";
    	let t1;
    	let t2;
    	let a;
    	let t4;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("You're logged in ");
    			t1 = text(t1_value);
    			t2 = text("! Takine you back ");
    			a = element("a");
    			a.textContent = "home";
    			t4 = text("...");
    			attr_dev(a, "href", "/home");
    			add_location(a, file$n, 126, 62, 3210);
    			attr_dev(p, "class", "svelte-suso25");
    			add_location(p, file$n, 126, 8, 3156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, a);
    			append_dev(p, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 32 && t1_value !== (t1_value = /*$user*/ ctx[5].username + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(126:6) {:then}",
    		ctx
    	});

    	return block;
    }

    // (124:27)          <h1>LOGGING IN</h1>         {:then}
    function create_pending_block(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "LOGGING IN";
    			add_location(h1, file$n, 124, 8, 3112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(124:27)          <h1>LOGGING IN</h1>         {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*$isLoggedIn*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "index svelte-suso25");
    			add_location(div, file$n, 88, 0, 2179);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
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
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let $goto;
    	let $isLoggedIn;
    	let $url;
    	let $user;
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(9, $goto = $$value));
    	validate_store(isLoggedIn, "isLoggedIn");
    	component_subscribe($$self, isLoggedIn, $$value => $$invalidate(3, $isLoggedIn = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(4, $url = $$value));
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(5, $user = $$value));
    	let loginPromise = Promise.resolve([]);
    	let backLoginPromise = Promise.resolve([]);
    	let loginSubmitted = false;
    	let { userIn = { username: "", password: "" } } = $$props;

    	const handleSubmit = async () => {
    		n$2("login", "login-payload");
    		let res = await loginUser();
    		user.set(res);
    		isLoggedIn.set(true);
    		$$invalidate(2, loginSubmitted = true);

    		/*backLoginPromise = await promisified({ cmd: 'login', user: userIn });*/
    		/*console.log(backLoginPromise);*/
    		$$invalidate(1, loginPromise = res);

    		$goto("/home");
    	};

    	/*function loginUser () {  }*/
    	async function loginUser() {
    		const loginPost = await fetch("http://localhost:3001/api/auth/login", {
    			method: "POST",
    			credentials: "include",
    			headers: { "content-type": "application/json" }, /*authorization: <authorization>*/
    			body: JSON.stringify(userIn)
    		});

    		if (loginPost.ok) {
    			return loginPost.json();
    		} else {
    			throw new Error(users);
    		}
    	}

    	const writable_props = ["userIn"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pages", $$slots, []);

    	function input0_input_handler() {
    		userIn.username = this.value;
    		$$invalidate(0, userIn);
    	}

    	function input1_input_handler() {
    		userIn.password = this.value;
    		$$invalidate(0, userIn);
    	}

    	$$self.$set = $$props => {
    		if ("userIn" in $$props) $$invalidate(0, userIn = $$props.userIn);
    	};

    	$$self.$capture_state = () => ({
    		dialog,
    		goto,
    		isActive,
    		url,
    		emit: n$2,
    		listen: a$1,
    		setTitle: t$1,
    		Btn,
    		Input,
    		invoke: o,
    		promisified: a,
    		user,
    		isLoggedIn,
    		loginPromise,
    		backLoginPromise,
    		loginSubmitted,
    		userIn,
    		handleSubmit,
    		loginUser,
    		$goto,
    		$isLoggedIn,
    		$url,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("loginPromise" in $$props) $$invalidate(1, loginPromise = $$props.loginPromise);
    		if ("backLoginPromise" in $$props) backLoginPromise = $$props.backLoginPromise;
    		if ("loginSubmitted" in $$props) $$invalidate(2, loginSubmitted = $$props.loginSubmitted);
    		if ("userIn" in $$props) $$invalidate(0, userIn = $$props.userIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		userIn,
    		loginPromise,
    		loginSubmitted,
    		$isLoggedIn,
    		$url,
    		$user,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { userIn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get userIn() {
    		throw new Error_1("<Pages>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userIn(value) {
    		throw new Error_1("<Pages>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/item/index.svelte generated by Svelte v3.24.0 */

    function create_fragment$r(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Item", $$slots, []);
    	return [];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* node_modules/svelte-select/src/Item.svelte generated by Svelte v3.24.0 */

    const file$o = "node_modules/svelte-select/src/Item.svelte";

    function create_fragment$s(ctx) {
    	let div;
    	let raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "";
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-u114qp");
    			add_location(div, file$o, 61, 0, 1263);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getOptionLabel, item, filterText*/ 7 && raw_value !== (raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "")) div.innerHTML = raw_value;
    			if (dirty & /*itemClasses*/ 8 && div_class_value !== (div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-u114qp")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { isActive = false } = $$props;
    	let { isFirst = false } = $$props;
    	let { isHover = false } = $$props;
    	let { getOptionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let itemClasses = "";
    	const writable_props = ["isActive", "isFirst", "isHover", "getOptionLabel", "item", "filterText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Item", $$slots, []);

    	$$self.$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		isActive,
    		isFirst,
    		isHover,
    		getOptionLabel,
    		item,
    		filterText,
    		itemClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    		if ("itemClasses" in $$props) $$invalidate(3, itemClasses = $$props.itemClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isActive, isFirst, isHover, item*/ 114) {
    			 {
    				const classes = [];

    				if (isActive) {
    					classes.push("active");
    				}

    				if (isFirst) {
    					classes.push("first");
    				}

    				if (isHover) {
    					classes.push("hover");
    				}

    				if (item.isGroupHeader) {
    					classes.push("groupHeader");
    				}

    				if (item.isGroupItem) {
    					classes.push("groupItem");
    				}

    				$$invalidate(3, itemClasses = classes.join(" "));
    			}
    		}
    	};

    	return [getOptionLabel, item, filterText, itemClasses, isActive, isFirst, isHover];
    }

    class Item$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
    			isActive: 4,
    			isFirst: 5,
    			isHover: 6,
    			getOptionLabel: 0,
    			item: 1,
    			filterText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get isActive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFirst() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFirst(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isHover() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isHover(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/VirtualList.svelte generated by Svelte v3.24.0 */
    const file$p = "node_modules/svelte-select/src/VirtualList.svelte";

    const get_default_slot_changes = dirty => ({
    	item: dirty & /*visible*/ 32,
    	i: dirty & /*visible*/ 32,
    	hoverItemIndex: dirty & /*hoverItemIndex*/ 2
    });

    const get_default_slot_context = ctx => ({
    	item: /*row*/ ctx[23].data,
    	i: /*row*/ ctx[23].index,
    	hoverItemIndex: /*hoverItemIndex*/ ctx[1]
    });

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (160:57) Missing template
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Missing template");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(160:57) Missing template",
    		ctx
    	});

    	return block;
    }

    // (158:2) {#each visible as row (row.index)}
    function create_each_block$2(key_1, ctx) {
    	let svelte_virtual_list_row;
    	let t;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			svelte_virtual_list_row = element("svelte-virtual-list-row");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-8nn5yg");
    			add_location(svelte_virtual_list_row, file$p, 158, 3, 3402);
    			this.first = svelte_virtual_list_row;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_row, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svelte_virtual_list_row, null);
    			}

    			append_dev(svelte_virtual_list_row, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, visible, hoverItemIndex*/ 8226) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_row);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(158:2) {#each visible as row (row.index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let svelte_virtual_list_viewport;
    	let svelte_virtual_list_contents;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let svelte_virtual_list_viewport_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*visible*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*row*/ ctx[23].index;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
    			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-8nn5yg");
    			add_location(svelte_virtual_list_contents, file$p, 156, 1, 3252);
    			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-8nn5yg");
    			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[17].call(svelte_virtual_list_viewport));
    			add_location(svelte_virtual_list_viewport, file$p, 154, 0, 3110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_viewport, anchor);
    			append_dev(svelte_virtual_list_viewport, svelte_virtual_list_contents);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svelte_virtual_list_contents, null);
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[15](svelte_virtual_list_contents);
    			/*svelte_virtual_list_viewport_binding*/ ctx[16](svelte_virtual_list_viewport);
    			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[17].bind(svelte_virtual_list_viewport));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$scope, visible, hoverItemIndex*/ 8226) {
    				const each_value = /*visible*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}

    			if (!current || dirty & /*top*/ 64) {
    				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*bottom*/ 128) {
    				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*height*/ 1) {
    				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
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
    			if (detaching) detach_dev(svelte_virtual_list_viewport);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[15](null);
    			/*svelte_virtual_list_viewport_binding*/ ctx[16](null);
    			svelte_virtual_list_viewport_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { items = undefined } = $$props;
    	let { height = "100%" } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { start = 0 } = $$props;
    	let { end = 0 } = $$props;

    	// local state
    	let height_map = [];

    	let rows;
    	let viewport;
    	let contents;
    	let viewport_height = 0;
    	let visible;
    	let mounted;
    	let top = 0;
    	let bottom = 0;
    	let average_height;

    	async function refresh(items, viewport_height, itemHeight) {
    		const { scrollTop } = viewport;
    		await tick(); // wait until the DOM is up to date
    		let content_height = top - scrollTop;
    		let i = start;

    		while (content_height < viewport_height && i < items.length) {
    			let row = rows[i - start];

    			if (!row) {
    				$$invalidate(10, end = i + 1);
    				await tick(); // render the newly visible row
    				row = rows[i - start];
    			}

    			const row_height = height_map[i] = itemHeight || row.offsetHeight;
    			content_height += row_height;
    			i += 1;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = (top + content_height) / end;
    		$$invalidate(7, bottom = remaining * average_height);
    		height_map.length = items.length;
    		$$invalidate(2, viewport.scrollTop = 0, viewport);
    	}

    	async function handle_scroll() {
    		const { scrollTop } = viewport;
    		const old_start = start;

    		for (let v = 0; v < rows.length; v += 1) {
    			height_map[start + v] = itemHeight || rows[v].offsetHeight;
    		}

    		let i = 0;
    		let y = 0;

    		while (i < items.length) {
    			const row_height = height_map[i] || average_height;

    			if (y + row_height > scrollTop) {
    				$$invalidate(9, start = i);
    				$$invalidate(6, top = y);
    				break;
    			}

    			y += row_height;
    			i += 1;
    		}

    		while (i < items.length) {
    			y += height_map[i] || average_height;
    			i += 1;
    			if (y > scrollTop + viewport_height) break;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = y / end;
    		while (i < items.length) height_map[i++] = average_height;
    		$$invalidate(7, bottom = remaining * average_height);

    		// prevent jumping if we scrolled up into unknown territory
    		if (start < old_start) {
    			await tick();
    			let expected_height = 0;
    			let actual_height = 0;

    			for (let i = start; i < old_start; i += 1) {
    				if (rows[i - start]) {
    					expected_height += height_map[i];
    					actual_height += itemHeight || rows[i - start].offsetHeight;
    				}
    			}

    			const d = actual_height - expected_height;
    			viewport.scrollTo(0, scrollTop + d);
    		}
    	} // TODO if we overestimated the space these
    	// rows would occupy we may need to add some

    	// more. maybe we can just call handle_scroll again?
    	// trigger initial refresh
    	onMount(() => {
    		rows = contents.getElementsByTagName("svelte-virtual-list-row");
    		$$invalidate(20, mounted = true);
    	});

    	const writable_props = ["items", "height", "itemHeight", "hoverItemIndex", "start", "end"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("VirtualList", $$slots, ['default']);

    	function svelte_virtual_list_contents_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contents = $$value;
    			$$invalidate(3, contents);
    		});
    	}

    	function svelte_virtual_list_viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			viewport = $$value;
    			$$invalidate(2, viewport);
    		});
    	}

    	function svelte_virtual_list_viewport_elementresize_handler() {
    		viewport_height = this.offsetHeight;
    		$$invalidate(4, viewport_height);
    	}

    	$$self.$set = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		items,
    		height,
    		itemHeight,
    		hoverItemIndex,
    		start,
    		end,
    		height_map,
    		rows,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		mounted,
    		top,
    		bottom,
    		average_height,
    		refresh,
    		handle_scroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("height_map" in $$props) height_map = $$props.height_map;
    		if ("rows" in $$props) rows = $$props.rows;
    		if ("viewport" in $$props) $$invalidate(2, viewport = $$props.viewport);
    		if ("contents" in $$props) $$invalidate(3, contents = $$props.contents);
    		if ("viewport_height" in $$props) $$invalidate(4, viewport_height = $$props.viewport_height);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    		if ("mounted" in $$props) $$invalidate(20, mounted = $$props.mounted);
    		if ("top" in $$props) $$invalidate(6, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(7, bottom = $$props.bottom);
    		if ("average_height" in $$props) average_height = $$props.average_height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, start, end*/ 3584) {
    			 $$invalidate(5, visible = items.slice(start, end).map((data, i) => {
    				return { index: i + start, data };
    			}));
    		}

    		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 1054736) {
    			// whenever `items` changes, invalidate the current heightmap
    			 if (mounted) refresh(items, viewport_height, itemHeight);
    		}
    	};

    	return [
    		height,
    		hoverItemIndex,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		top,
    		bottom,
    		handle_scroll,
    		start,
    		end,
    		items,
    		itemHeight,
    		$$scope,
    		$$slots,
    		svelte_virtual_list_contents_binding,
    		svelte_virtual_list_viewport_binding,
    		svelte_virtual_list_viewport_elementresize_handler
    	];
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {
    			items: 11,
    			height: 0,
    			itemHeight: 12,
    			hoverItemIndex: 1,
    			start: 9,
    			end: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirtualList",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get items() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/List.svelte generated by Svelte v3.24.0 */
    const file$q = "node_modules/svelte-select/src/List.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (210:0) {#if isVirtualList}
    function create_if_block_3$1(ctx) {
    	let div;
    	let virtuallist;
    	let current;

    	virtuallist = new VirtualList({
    			props: {
    				items: /*items*/ ctx[4],
    				itemHeight: /*itemHeight*/ ctx[7],
    				$$slots: {
    					default: [
    						create_default_slot$g,
    						({ item, i }) => ({ 34: item, 36: i }),
    						({ item, i }) => [0, (item ? 8 : 0) | (i ? 32 : 0)]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(virtuallist.$$.fragment);
    			attr_dev(div, "class", "listContainer virtualList svelte-1rmpqnb");
    			add_location(div, file$q, 210, 0, 5528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(virtuallist, div, null);
    			/*div_binding*/ ctx[20](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const virtuallist_changes = {};
    			if (dirty[0] & /*items*/ 16) virtuallist_changes.items = /*items*/ ctx[4];
    			if (dirty[0] & /*itemHeight*/ 128) virtuallist_changes.itemHeight = /*itemHeight*/ ctx[7];

    			if (dirty[0] & /*Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, items*/ 4918 | dirty[1] & /*$$scope, item, i*/ 104) {
    				virtuallist_changes.$$scope = { dirty, ctx };
    			}

    			virtuallist.$set(virtuallist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(virtuallist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(virtuallist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(virtuallist);
    			/*div_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(210:0) {#if isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (213:2) <VirtualList {items} {itemHeight} let:item let:i>
    function create_default_slot$g(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[18](/*i*/ ctx[36], ...args);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[19](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$q, 214, 4, 5650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[1] & /*item*/ 8) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[1] & /*i*/ 32) switch_instance_changes.isFirst = isItemFirst(/*i*/ ctx[36]);
    			if (dirty[0] & /*selectedValue, optionIdentifier*/ 768 | dirty[1] & /*item*/ 8) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18 | dirty[1] & /*item, i*/ 40) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$g.name,
    		type: "slot",
    		source: "(213:2) <VirtualList {items} {itemHeight} let:item let:i>",
    		ctx
    	});

    	return block;
    }

    // (232:0) {#if !isVirtualList}
    function create_if_block$6(ctx) {
    	let div;
    	let current;
    	let each_value = /*items*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "class", "listContainer svelte-1rmpqnb");
    			add_location(div, file$q, 232, 0, 6160);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			/*div_binding_1*/ ctx[23](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items, handleHover, handleClick, Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, noOptionsMessage, hideEmptyState*/ 32630) {
    				each_value = /*items*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block_1$1(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
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
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			/*div_binding_1*/ ctx[23](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(232:0) {#if !isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (254:2) {:else}
    function create_else_block_1$1(ctx) {
    	let if_block_anchor;
    	let if_block = !/*hideEmptyState*/ ctx[10] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*hideEmptyState*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(254:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (255:4) {#if !hideEmptyState}
    function create_if_block_2$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*noOptionsMessage*/ ctx[11]);
    			attr_dev(div, "class", "empty svelte-1rmpqnb");
    			add_location(div, file$q, 255, 6, 6864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noOptionsMessage*/ 2048) set_data_dev(t, /*noOptionsMessage*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(255:4) {#if !hideEmptyState}",
    		ctx
    	});

    	return block;
    }

    // (237:4) { :else }
    function create_else_block$2(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler_1(...args) {
    		return /*mouseover_handler_1*/ ctx[21](/*i*/ ctx[36], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[22](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$q, 237, 4, 6374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler_1, false, false, false),
    					listen_dev(div, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[0] & /*items*/ 16) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[0] & /*items, selectedValue, optionIdentifier*/ 784) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(237:4) { :else }",
    		ctx
    	});

    	return block;
    }

    // (235:4) {#if item.isGroupHeader && !item.isSelectable}
    function create_if_block_1$3(ctx) {
    	let div;
    	let t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "listGroupTitle svelte-1rmpqnb");
    			add_location(div, file$q, 235, 6, 6294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items*/ 80 && t_value !== (t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(235:4) {#if item.isGroupHeader && !item.isSelectable}",
    		ctx
    	});

    	return block;
    }

    // (234:2) {#each items as item, i}
    function create_each_block$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[34].isGroupHeader && !/*item*/ ctx[34].isSelectable) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(234:2) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isVirtualList*/ ctx[3] && create_if_block_3$1(ctx);
    	let if_block1 = !/*isVirtualList*/ ctx[3] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*isVirtualList*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*isVirtualList*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function itemClasses(hoverItemIndex, item, itemIndex, items, selectedValue, optionIdentifier, isMulti) {
    	return `${selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]
	? "active "
	: ""}${hoverItemIndex === itemIndex || items.length === 1
	? "hover"
	: ""}`;
    }

    function isItemActive(item, selectedValue, optionIdentifier) {
    	return selectedValue && selectedValue[optionIdentifier] === item[optionIdentifier];
    }

    function isItemFirst(itemIndex) {
    	return itemIndex === 0;
    }

    function isItemHover(hoverItemIndex, item, itemIndex, items) {
    	return hoverItemIndex === itemIndex || items.length === 1;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { Item = Item$1 } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { items = [] } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		if (option) return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { optionIdentifier = "value" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { isMulti = false } = $$props;
    	let { activeItemIndex = 0 } = $$props;
    	let { filterText = "" } = $$props;
    	let isScrollingTimer = 0;
    	let isScrolling = false;
    	let prev_items;
    	let prev_activeItemIndex;
    	let prev_selectedValue;

    	onMount(() => {
    		if (items.length > 0 && !isMulti && selectedValue) {
    			const _hoverItemIndex = items.findIndex(item => item[optionIdentifier] === selectedValue[optionIdentifier]);

    			if (_hoverItemIndex) {
    				$$invalidate(1, hoverItemIndex = _hoverItemIndex);
    			}
    		}

    		scrollToActiveItem("active");

    		container.addEventListener(
    			"scroll",
    			() => {
    				clearTimeout(isScrollingTimer);

    				isScrollingTimer = setTimeout(
    					() => {
    						isScrolling = false;
    					},
    					100
    				);
    			},
    			false
    		);
    	});

    	onDestroy(() => {
    		
    	}); // clearTimeout(isScrollingTimer);

    	beforeUpdate(() => {
    		if (items !== prev_items && items.length > 0) {
    			$$invalidate(1, hoverItemIndex = 0);
    		}

    		// if (prev_activeItemIndex && activeItemIndex > -1) {
    		//   hoverItemIndex = activeItemIndex;
    		//   scrollToActiveItem('active');
    		// }
    		// if (prev_selectedValue && selectedValue) {
    		//   scrollToActiveItem('active');
    		//   if (items && !isMulti) {
    		//     const hoverItemIndex = items.findIndex((item) => item[optionIdentifier] === selectedValue[optionIdentifier]);
    		//     if (hoverItemIndex) {
    		//       hoverItemIndex = hoverItemIndex;
    		//     }
    		//   }
    		// }
    		prev_items = items;

    		prev_activeItemIndex = activeItemIndex;
    		prev_selectedValue = selectedValue;
    	});

    	function handleSelect(item) {
    		if (item.isCreator) return;
    		dispatch("itemSelected", item);
    	}

    	function handleHover(i) {
    		if (isScrolling) return;
    		$$invalidate(1, hoverItemIndex = i);
    	}

    	function handleClick(args) {
    		const { item, i, event } = args;
    		event.stopPropagation();
    		if (selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]) return closeList();

    		if (item.isCreator) {
    			dispatch("itemCreated", filterText);
    		} else {
    			$$invalidate(16, activeItemIndex = i);
    			$$invalidate(1, hoverItemIndex = i);
    			handleSelect(item);
    		}
    	}

    	function closeList() {
    		dispatch("closeList");
    	}

    	async function updateHoverItem(increment) {
    		if (isVirtualList) return;
    		let isNonSelectableItem = true;

    		while (isNonSelectableItem) {
    			if (increment > 0 && hoverItemIndex === items.length - 1) {
    				$$invalidate(1, hoverItemIndex = 0);
    			} else if (increment < 0 && hoverItemIndex === 0) {
    				$$invalidate(1, hoverItemIndex = items.length - 1);
    			} else {
    				$$invalidate(1, hoverItemIndex = hoverItemIndex + increment);
    			}

    			isNonSelectableItem = items[hoverItemIndex].isGroupHeader && !items[hoverItemIndex].isSelectable;
    		}

    		await tick();
    		scrollToActiveItem("hover");
    	}

    	function handleKeyDown(e) {
    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				items.length && updateHoverItem(1);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				items.length && updateHoverItem(-1);
    				break;
    			case "Enter":
    				e.preventDefault();
    				if (items.length === 0) break;
    				const hoverItem = items[hoverItemIndex];
    				if (selectedValue && !isMulti && selectedValue[optionIdentifier] === hoverItem[optionIdentifier]) {
    					closeList();
    					break;
    				}
    				if (hoverItem.isCreator) {
    					dispatch("itemCreated", filterText);
    				} else {
    					$$invalidate(16, activeItemIndex = hoverItemIndex);
    					handleSelect(items[hoverItemIndex]);
    				}
    				break;
    			case "Tab":
    				e.preventDefault();
    				if (items.length === 0) break;
    				if (selectedValue && selectedValue[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return closeList();
    				$$invalidate(16, activeItemIndex = hoverItemIndex);
    				handleSelect(items[hoverItemIndex]);
    				break;
    		}
    	}

    	function scrollToActiveItem(className) {
    		if (isVirtualList || !container) return;
    		let offsetBounding;
    		const focusedElemBounding = container.querySelector(`.listItem .${className}`);

    		if (focusedElemBounding) {
    			offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
    		}

    		$$invalidate(0, container.scrollTop -= offsetBounding, container);
    	}

    	
    	

    	const writable_props = [
    		"container",
    		"Item",
    		"isVirtualList",
    		"items",
    		"getOptionLabel",
    		"getGroupHeaderLabel",
    		"itemHeight",
    		"hoverItemIndex",
    		"selectedValue",
    		"optionIdentifier",
    		"hideEmptyState",
    		"noOptionsMessage",
    		"isMulti",
    		"activeItemIndex",
    		"filterText"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("List", $$slots, []);
    	const mouseover_handler = i => handleHover(i);
    	const click_handler = (item, i, event) => handleClick({ item, i, event });

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	const mouseover_handler_1 = i => handleHover(i);
    	const click_handler_1 = (item, i, event) => handleClick({ item, i, event });

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		dispatch,
    		container,
    		ItemComponent: Item$1,
    		VirtualList,
    		Item,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		hoverItemIndex,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		isMulti,
    		activeItemIndex,
    		filterText,
    		isScrollingTimer,
    		isScrolling,
    		prev_items,
    		prev_activeItemIndex,
    		prev_selectedValue,
    		itemClasses,
    		handleSelect,
    		handleHover,
    		handleClick,
    		closeList,
    		updateHoverItem,
    		handleKeyDown,
    		scrollToActiveItem,
    		isItemActive,
    		isItemFirst,
    		isItemHover
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    		if ("isScrollingTimer" in $$props) isScrollingTimer = $$props.isScrollingTimer;
    		if ("isScrolling" in $$props) isScrolling = $$props.isScrolling;
    		if ("prev_items" in $$props) prev_items = $$props.prev_items;
    		if ("prev_activeItemIndex" in $$props) prev_activeItemIndex = $$props.prev_activeItemIndex;
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		container,
    		hoverItemIndex,
    		Item,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		filterText,
    		handleHover,
    		handleClick,
    		handleKeyDown,
    		activeItemIndex,
    		isMulti,
    		mouseover_handler,
    		click_handler,
    		div_binding,
    		mouseover_handler_1,
    		click_handler_1,
    		div_binding_1
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$u,
    			create_fragment$u,
    			safe_not_equal,
    			{
    				container: 0,
    				Item: 2,
    				isVirtualList: 3,
    				items: 4,
    				getOptionLabel: 5,
    				getGroupHeaderLabel: 6,
    				itemHeight: 7,
    				hoverItemIndex: 1,
    				selectedValue: 8,
    				optionIdentifier: 9,
    				hideEmptyState: 10,
    				noOptionsMessage: 11,
    				isMulti: 17,
    				activeItemIndex: 16,
    				filterText: 12
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$u.name
    		});
    	}

    	get container() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Selection.svelte generated by Svelte v3.24.0 */

    const file$r = "node_modules/svelte-select/src/Selection.svelte";

    function create_fragment$v(ctx) {
    	let div;
    	let raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "selection svelte-17yna57");
    			add_location(div, file$r, 13, 0, 196);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getSelectionLabel, item*/ 3 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "")) div.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { getSelectionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	const writable_props = ["getSelectionLabel", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Selection", $$slots, []);

    	$$self.$set = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ getSelectionLabel, item });

    	$$self.$inject_state = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getSelectionLabel, item];
    }

    class Selection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { getSelectionLabel: 0, item: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selection",
    			options,
    			id: create_fragment$v.name
    		});
    	}

    	get getSelectionLabel() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/MultiSelection.svelte generated by Svelte v3.24.0 */
    const file$s = "node_modules/svelte-select/src/MultiSelection.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (22:2) {#if !isDisabled}
    function create_if_block$7(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*i*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$s, 24, 6, 786);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-1hywj5b");
    			add_location(svg, file$s, 23, 4, 687);
    			attr_dev(div, "class", "multiSelectItem_clear svelte-1hywj5b");
    			add_location(div, file$s, 22, 2, 603);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(22:2) {#if !isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#each selectedValue as value, i}
    function create_each_block$4(ctx) {
    	let div1;
    	let div0;
    	let raw_value = /*getSelectionLabel*/ ctx[3](/*value*/ ctx[7]) + "";
    	let t0;
    	let t1;
    	let div1_class_value;
    	let if_block = !/*isDisabled*/ ctx[2] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div0, "class", "multiSelectItem_label svelte-1hywj5b");
    			add_location(div0, file$s, 18, 2, 499);

    			attr_dev(div1, "class", div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[9]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-1hywj5b");

    			add_location(div1, file$s, 17, 0, 392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getSelectionLabel, selectedValue*/ 9 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[3](/*value*/ ctx[7]) + "")) div0.innerHTML = raw_value;
    			if (!/*isDisabled*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*activeSelectedValue, isDisabled*/ 6 && div1_class_value !== (div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[9]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-1hywj5b")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(17:0) {#each selectedValue as value, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let each_1_anchor;
    	let each_value = /*selectedValue*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeSelectedValue, isDisabled, handleClear, getSelectionLabel, selectedValue*/ 31) {
    				each_value = /*selectedValue*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { selectedValue = [] } = $$props;
    	let { activeSelectedValue = undefined } = $$props;
    	let { isDisabled = false } = $$props;
    	let { getSelectionLabel = undefined } = $$props;

    	function handleClear(i, event) {
    		event.stopPropagation();
    		dispatch("multiItemClear", { i });
    	}

    	const writable_props = ["selectedValue", "activeSelectedValue", "isDisabled", "getSelectionLabel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiSelection> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MultiSelection", $$slots, []);
    	const click_handler = (i, event) => handleClear(i, event);

    	$$self.$set = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("getSelectionLabel" in $$props) $$invalidate(3, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		getSelectionLabel,
    		handleClear
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("getSelectionLabel" in $$props) $$invalidate(3, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		getSelectionLabel,
    		handleClear,
    		click_handler
    	];
    }

    class MultiSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {
    			selectedValue: 0,
    			activeSelectedValue: 1,
    			isDisabled: 2,
    			getSelectionLabel: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelection",
    			options,
    			id: create_fragment$w.name
    		});
    	}

    	get selectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSelectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSelectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isOutOfViewport(elem) {
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = bounding.top < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;

      return out;
    }

    function debounce(func, wait, immediate) {
      let timeout;

      return function executedFunction() {
        let context = this;
        let args = arguments;
    	    
        let later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;
    	
        clearTimeout(timeout);

        timeout = setTimeout(later, wait);
    	
        if (callNow) func.apply(context, args);
      };
    }

    /* node_modules/svelte-select/src/Select.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1$2 } = globals;
    const file$t = "node_modules/svelte-select/src/Select.svelte";

    // (781:2) {#if Icon}
    function create_if_block_7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*Icon*/ ctx[16];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*Icon*/ ctx[16])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(781:2) {#if Icon}",
    		ctx
    	});

    	return block;
    }

    // (785:2) {#if isMulti && selectedValue && selectedValue.length > 0}
    function create_if_block_6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*MultiSelection*/ ctx[7];

    	function switch_props(ctx) {
    		return {
    			props: {
    				selectedValue: /*selectedValue*/ ctx[3],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[12],
    				activeSelectedValue: /*activeSelectedValue*/ ctx[22],
    				isDisabled: /*isDisabled*/ ctx[9]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[26]);
    		switch_instance.$on("focus", /*handleFocus*/ ctx[29]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 8) switch_instance_changes.selectedValue = /*selectedValue*/ ctx[3];
    			if (dirty[0] & /*getSelectionLabel*/ 4096) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[12];
    			if (dirty[0] & /*activeSelectedValue*/ 4194304) switch_instance_changes.activeSelectedValue = /*activeSelectedValue*/ ctx[22];
    			if (dirty[0] & /*isDisabled*/ 512) switch_instance_changes.isDisabled = /*isDisabled*/ ctx[9];

    			if (switch_value !== (switch_value = /*MultiSelection*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[26]);
    					switch_instance.$on("focus", /*handleFocus*/ ctx[29]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(785:2) {#if isMulti && selectedValue && selectedValue.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (805:2) {:else}
    function create_else_block_1$2(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[23],
    		{ placeholder: /*placeholderText*/ ctx[25] },
    		{ style: /*inputStyles*/ ctx[14] }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-yc5m1m", true);
    			add_location(input_1, file$t, 805, 4, 18569);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding_1*/ ctx[59](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[4]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[29], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler_1*/ ctx[60])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 8388608 && /*_inputAttributes*/ ctx[23],
    				dirty[0] & /*placeholderText*/ 33554432 && { placeholder: /*placeholderText*/ ctx[25] },
    				dirty[0] & /*inputStyles*/ 16384 && { style: /*inputStyles*/ ctx[14] }
    			]));

    			if (dirty[0] & /*filterText*/ 16 && input_1.value !== /*filterText*/ ctx[4]) {
    				set_input_value(input_1, /*filterText*/ ctx[4]);
    			}

    			toggle_class(input_1, "svelte-yc5m1m", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding_1*/ ctx[59](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(805:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (796:2) {#if isDisabled}
    function create_if_block_5(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[23],
    		{ placeholder: /*placeholderText*/ ctx[25] },
    		{ style: /*inputStyles*/ ctx[14] },
    		{ disabled: true }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-yc5m1m", true);
    			add_location(input_1, file$t, 796, 4, 18357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding*/ ctx[57](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[4]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[29], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[58])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 8388608 && /*_inputAttributes*/ ctx[23],
    				dirty[0] & /*placeholderText*/ 33554432 && { placeholder: /*placeholderText*/ ctx[25] },
    				dirty[0] & /*inputStyles*/ 16384 && { style: /*inputStyles*/ ctx[14] },
    				{ disabled: true }
    			]));

    			if (dirty[0] & /*filterText*/ 16 && input_1.value !== /*filterText*/ ctx[4]) {
    				set_input_value(input_1, /*filterText*/ ctx[4]);
    			}

    			toggle_class(input_1, "svelte-yc5m1m", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding*/ ctx[57](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(796:2) {#if isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (815:2) {#if !isMulti && showSelectedItem}
    function create_if_block_4(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Selection*/ ctx[6];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*selectedValue*/ ctx[3],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[12]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "selectedItem svelte-yc5m1m");
    			add_location(div, file$t, 815, 4, 18802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "focus", /*handleFocus*/ ctx[29], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 8) switch_instance_changes.item = /*selectedValue*/ ctx[3];
    			if (dirty[0] & /*getSelectionLabel*/ 4096) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[12];

    			if (switch_value !== (switch_value = /*Selection*/ ctx[6])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(815:2) {#if !isMulti && showSelectedItem}",
    		ctx
    	});

    	return block;
    }

    // (824:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}
    function create_if_block_3$2(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124\n          l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$t, 831, 8, 19265);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-yc5m1m");
    			add_location(svg, file$t, 825, 6, 19124);
    			attr_dev(div, "class", "clearSelect svelte-yc5m1m");
    			add_location(div, file$t, 824, 4, 19054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", prevent_default(/*handleClear*/ ctx[21]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(824:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}",
    		ctx
    	});

    	return block;
    }

    // (840:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}
    function create_if_block_1$4(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*indicatorSvg*/ ctx[20]) return create_if_block_2$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "indicator svelte-yc5m1m");
    			add_location(div, file$t, 840, 4, 19699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(840:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}",
    		ctx
    	});

    	return block;
    }

    // (844:6) {:else}
    function create_else_block$3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747\n            3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0\n            1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502\n            0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0\n            0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
    			add_location(path, file$t, 849, 10, 19920);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "class", "svelte-yc5m1m");
    			add_location(svg, file$t, 844, 8, 19799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(844:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (842:6) {#if indicatorSvg}
    function create_if_block_2$2(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*indicatorSvg*/ ctx[20], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*indicatorSvg*/ 1048576) html_tag.p(/*indicatorSvg*/ ctx[20]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(842:6) {#if indicatorSvg}",
    		ctx
    	});

    	return block;
    }

    // (861:2) {#if isWaiting}
    function create_if_block$8(ctx) {
    	let div;
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "spinner_path svelte-yc5m1m");
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "currentColor");
    			attr_dev(circle, "stroke-width", "5");
    			attr_dev(circle, "stroke-miterlimit", "10");
    			add_location(circle, file$t, 863, 8, 20425);
    			attr_dev(svg, "class", "spinner_icon svelte-yc5m1m");
    			attr_dev(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$t, 862, 6, 20368);
    			attr_dev(div, "class", "spinner svelte-yc5m1m");
    			add_location(div, file$t, 861, 4, 20340);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(861:2) {#if isWaiting}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*Icon*/ ctx[16] && create_if_block_7(ctx);
    	let if_block1 = /*isMulti*/ ctx[8] && /*selectedValue*/ ctx[3] && /*selectedValue*/ ctx[3].length > 0 && create_if_block_6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*isDisabled*/ ctx[9]) return create_if_block_5;
    		return create_else_block_1$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = !/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[24] && create_if_block_4(ctx);
    	let if_block4 = /*showSelectedItem*/ ctx[24] && /*isClearable*/ ctx[15] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && create_if_block_3$2(ctx);
    	let if_block5 = (/*showIndicator*/ ctx[18] || (/*showChevron*/ ctx[17] && !/*selectedValue*/ ctx[3] || !/*isSearchable*/ ctx[13] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[24] && !/*isClearable*/ ctx[15] || !/*showSelectedItem*/ ctx[24]))) && create_if_block_1$4(ctx);
    	let if_block6 = /*isWaiting*/ ctx[5] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			attr_dev(div, "class", div_class_value = "selectContainer " + /*containerClasses*/ ctx[19] + " svelte-yc5m1m");
    			attr_dev(div, "style", /*containerStyles*/ ctx[11]);
    			toggle_class(div, "hasError", /*hasError*/ ctx[10]);
    			toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			toggle_class(div, "disabled", /*isDisabled*/ ctx[9]);
    			toggle_class(div, "focused", /*isFocused*/ ctx[2]);
    			add_location(div, file$t, 770, 0, 17749);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			if (if_block4) if_block4.m(div, null);
    			append_dev(div, t4);
    			if (if_block5) if_block5.m(div, null);
    			append_dev(div, t5);
    			if (if_block6) if_block6.m(div, null);
    			/*div_binding*/ ctx[61](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*handleWindowClick*/ ctx[30], false, false, false),
    					listen_dev(window, "keydown", /*handleKeyDown*/ ctx[28], false, false, false),
    					listen_dev(window, "resize", /*getPosition*/ ctx[27], false, false, false),
    					listen_dev(div, "click", /*handleClick*/ ctx[31], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Icon*/ ctx[16]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*Icon*/ 65536) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*isMulti*/ ctx[8] && /*selectedValue*/ ctx[3] && /*selectedValue*/ ctx[3].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, selectedValue*/ 264) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div, t2);
    				}
    			}

    			if (!/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[24]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, showSelectedItem*/ 16777472) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_4(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*showSelectedItem*/ ctx[24] && /*isClearable*/ ctx[15] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_3$2(ctx);
    					if_block4.c();
    					if_block4.m(div, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*showIndicator*/ ctx[18] || (/*showChevron*/ ctx[17] && !/*selectedValue*/ ctx[3] || !/*isSearchable*/ ctx[13] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[24] && !/*isClearable*/ ctx[15] || !/*showSelectedItem*/ ctx[24]))) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_1$4(ctx);
    					if_block5.c();
    					if_block5.m(div, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*isWaiting*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$8(ctx);
    					if_block6.c();
    					if_block6.m(div, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (!current || dirty[0] & /*containerClasses*/ 524288 && div_class_value !== (div_class_value = "selectContainer " + /*containerClasses*/ ctx[19] + " svelte-yc5m1m")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*containerStyles*/ 2048) {
    				attr_dev(div, "style", /*containerStyles*/ ctx[11]);
    			}

    			if (dirty[0] & /*containerClasses, hasError*/ 525312) {
    				toggle_class(div, "hasError", /*hasError*/ ctx[10]);
    			}

    			if (dirty[0] & /*containerClasses, isMulti*/ 524544) {
    				toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			}

    			if (dirty[0] & /*containerClasses, isDisabled*/ 524800) {
    				toggle_class(div, "disabled", /*isDisabled*/ ctx[9]);
    			}

    			if (dirty[0] & /*containerClasses, isFocused*/ 524292) {
    				toggle_class(div, "focused", /*isFocused*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			/*div_binding*/ ctx[61](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { input = undefined } = $$props;
    	let { Item = Item$1 } = $$props;
    	let { Selection: Selection$1 = Selection } = $$props;
    	let { MultiSelection: MultiSelection$1 = MultiSelection } = $$props;
    	let { isMulti = false } = $$props;
    	let { isDisabled = false } = $$props;
    	let { isCreatable = false } = $$props;
    	let { isFocused = false } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let { placeholder = "Select..." } = $$props;
    	let { items = [] } = $$props;
    	let { itemFilter = (label, filterText, option) => label.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
    	let { groupBy = undefined } = $$props;
    	let { groupFilter = groups => groups } = $$props;
    	let { isGroupHeaderSelectable = false } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { optionIdentifier = "value" } = $$props;
    	let { loadOptions = undefined } = $$props;
    	let { hasError = false } = $$props;
    	let { containerStyles = "" } = $$props;

    	let { getSelectionLabel = option => {
    		if (option) return option.label;
    	} } = $$props;

    	let { createGroupHeaderItem = groupValue => {
    		return { value: groupValue, label: groupValue };
    	} } = $$props;

    	let { createItem = filterText => {
    		return { value: filterText, label: filterText };
    	} } = $$props;

    	let { isSearchable = true } = $$props;
    	let { inputStyles = "" } = $$props;
    	let { isClearable = true } = $$props;
    	let { isWaiting = false } = $$props;
    	let { listPlacement = "auto" } = $$props;
    	let { listOpen = false } = $$props;
    	let { list = undefined } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { loadOptionsInterval = 300 } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { filteredItems = [] } = $$props;
    	let { inputAttributes = {} } = $$props;
    	let { listAutoWidth = true } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { Icon = undefined } = $$props;
    	let { showChevron = false } = $$props;
    	let { showIndicator = false } = $$props;
    	let { containerClasses = "" } = $$props;
    	let { indicatorSvg = undefined } = $$props;
    	let target;
    	let activeSelectedValue;
    	let _items = [];
    	let originalItemsClone;
    	let prev_selectedValue;
    	let prev_listOpen;
    	let prev_filterText;
    	let prev_isFocused;
    	let prev_filteredItems;

    	async function resetFilter() {
    		await tick();
    		$$invalidate(4, filterText = "");
    	}

    	let getItemsHasInvoked = false;

    	const getItems = debounce(
    		async () => {
    			getItemsHasInvoked = true;
    			$$invalidate(5, isWaiting = true);
    			$$invalidate(32, items = await loadOptions(filterText));
    			$$invalidate(5, isWaiting = false);
    			$$invalidate(2, isFocused = true);
    			$$invalidate(33, listOpen = true);
    		},
    		loadOptionsInterval
    	);

    	let _inputAttributes = {};

    	beforeUpdate(() => {
    		if (isMulti && selectedValue && selectedValue.length > 1) {
    			checkSelectedValueForDuplicates();
    		}

    		if (!isMulti && selectedValue && prev_selectedValue !== selectedValue) {
    			if (!prev_selectedValue || JSON.stringify(selectedValue[optionIdentifier]) !== JSON.stringify(prev_selectedValue[optionIdentifier])) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (isMulti && JSON.stringify(selectedValue) !== JSON.stringify(prev_selectedValue)) {
    			if (checkSelectedValueForDuplicates()) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (container && listOpen !== prev_listOpen) {
    			if (listOpen) {
    				loadList();
    			} else {
    				removeList();
    			}
    		}

    		if (filterText !== prev_filterText) {
    			if (filterText.length > 0) {
    				$$invalidate(2, isFocused = true);
    				$$invalidate(33, listOpen = true);

    				if (loadOptions) {
    					getItems();
    				} else {
    					loadList();
    					$$invalidate(33, listOpen = true);

    					if (isMulti) {
    						$$invalidate(22, activeSelectedValue = undefined);
    					}
    				}
    			} else {
    				setList([]);
    			}

    			if (list) {
    				list.$set({ filterText });
    			}
    		}

    		if (isFocused !== prev_isFocused) {
    			if (isFocused || listOpen) {
    				handleFocus();
    			} else {
    				resetFilter();
    				if (input) input.blur();
    			}
    		}

    		if (prev_filteredItems !== filteredItems) {
    			let _filteredItems = [...filteredItems];

    			if (isCreatable && filterText) {
    				const itemToCreate = createItem(filterText);
    				itemToCreate.isCreator = true;

    				const existingItemWithFilterValue = _filteredItems.find(item => {
    					return item[optionIdentifier] === itemToCreate[optionIdentifier];
    				});

    				let existingSelectionWithFilterValue;

    				if (selectedValue) {
    					if (isMulti) {
    						existingSelectionWithFilterValue = selectedValue.find(selection => {
    							return selection[optionIdentifier] === itemToCreate[optionIdentifier];
    						});
    					} else if (selectedValue[optionIdentifier] === itemToCreate[optionIdentifier]) {
    						existingSelectionWithFilterValue = selectedValue;
    					}
    				}

    				if (!existingItemWithFilterValue && !existingSelectionWithFilterValue) {
    					_filteredItems = [..._filteredItems, itemToCreate];
    				}
    			}

    			setList(_filteredItems);
    		}

    		prev_selectedValue = selectedValue;
    		prev_listOpen = listOpen;
    		prev_filterText = filterText;
    		prev_isFocused = isFocused;
    		prev_filteredItems = filteredItems;
    	});

    	function checkSelectedValueForDuplicates() {
    		let noDuplicates = true;

    		if (selectedValue) {
    			const ids = [];
    			const uniqueValues = [];

    			selectedValue.forEach(val => {
    				if (!ids.includes(val[optionIdentifier])) {
    					ids.push(val[optionIdentifier]);
    					uniqueValues.push(val);
    				} else {
    					noDuplicates = false;
    				}
    			});

    			$$invalidate(3, selectedValue = uniqueValues);
    		}

    		return noDuplicates;
    	}

    	async function setList(items) {
    		await tick();
    		if (list) return list.$set({ items });
    		if (loadOptions && getItemsHasInvoked && items.length > 0) loadList();
    	}

    	function handleMultiItemClear(event) {
    		const { detail } = event;
    		const itemToRemove = selectedValue[detail ? detail.i : selectedValue.length - 1];

    		if (selectedValue.length === 1) {
    			$$invalidate(3, selectedValue = undefined);
    		} else {
    			$$invalidate(3, selectedValue = selectedValue.filter(item => {
    				return item !== itemToRemove;
    			}));
    		}

    		dispatch("clear", itemToRemove);
    		getPosition();
    	}

    	async function getPosition() {
    		await tick();
    		if (!target || !container) return;
    		const { top, height, width } = container.getBoundingClientRect();
    		target.style["min-width"] = `${width}px`;
    		target.style.width = `${listAutoWidth ? "auto" : "100%"}`;
    		target.style.left = "0";

    		if (listPlacement === "top") {
    			target.style.bottom = `${height + 5}px`;
    		} else {
    			target.style.top = `${height + 5}px`;
    		}

    		target = target;

    		if (listPlacement === "auto" && isOutOfViewport(target).bottom) {
    			target.style.top = ``;
    			target.style.bottom = `${height + 5}px`;
    		}

    		target.style.visibility = "";
    	}

    	function handleKeyDown(e) {
    		if (!isFocused) return;

    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				$$invalidate(33, listOpen = true);
    				$$invalidate(22, activeSelectedValue = undefined);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				$$invalidate(33, listOpen = true);
    				$$invalidate(22, activeSelectedValue = undefined);
    				break;
    			case "Tab":
    				if (!listOpen) $$invalidate(2, isFocused = false);
    				break;
    			case "Backspace":
    				if (!isMulti || filterText.length > 0) return;
    				if (isMulti && selectedValue && selectedValue.length > 0) {
    					handleMultiItemClear(activeSelectedValue !== undefined
    					? activeSelectedValue
    					: selectedValue.length - 1);

    					if (activeSelectedValue === 0 || activeSelectedValue === undefined) break;

    					$$invalidate(22, activeSelectedValue = selectedValue.length > activeSelectedValue
    					? activeSelectedValue - 1
    					: undefined);
    				}
    				break;
    			case "ArrowLeft":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0) return;
    				if (activeSelectedValue === undefined) {
    					$$invalidate(22, activeSelectedValue = selectedValue.length - 1);
    				} else if (selectedValue.length > activeSelectedValue && activeSelectedValue !== 0) {
    					$$invalidate(22, activeSelectedValue -= 1);
    				}
    				break;
    			case "ArrowRight":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0 || activeSelectedValue === undefined) return;
    				if (activeSelectedValue === selectedValue.length - 1) {
    					$$invalidate(22, activeSelectedValue = undefined);
    				} else if (activeSelectedValue < selectedValue.length - 1) {
    					$$invalidate(22, activeSelectedValue += 1);
    				}
    				break;
    		}
    	}

    	function handleFocus() {
    		$$invalidate(2, isFocused = true);
    		if (input) input.focus();
    	}

    	function removeList() {
    		resetFilter();
    		$$invalidate(22, activeSelectedValue = undefined);
    		if (!list) return;
    		list.$destroy();
    		$$invalidate(34, list = undefined);
    		if (!target) return;
    		if (target.parentNode) target.parentNode.removeChild(target);
    		target = undefined;
    		$$invalidate(34, list);
    		target = target;
    	}

    	function handleWindowClick(event) {
    		if (!container) return;

    		const eventTarget = event.path && event.path.length > 0
    		? event.path[0]
    		: event.target;

    		if (container.contains(eventTarget)) return;
    		$$invalidate(2, isFocused = false);
    		$$invalidate(33, listOpen = false);
    		$$invalidate(22, activeSelectedValue = undefined);
    		if (input) input.blur();
    	}

    	function handleClick() {
    		if (isDisabled) return;
    		$$invalidate(2, isFocused = true);
    		$$invalidate(33, listOpen = !listOpen);
    	}

    	function handleClear() {
    		$$invalidate(3, selectedValue = undefined);
    		$$invalidate(33, listOpen = false);
    		dispatch("clear", selectedValue);
    		handleFocus();
    	}

    	async function loadList() {
    		await tick();
    		if (target && list) return;

    		const data = {
    			Item,
    			filterText,
    			optionIdentifier,
    			noOptionsMessage,
    			hideEmptyState,
    			isVirtualList,
    			selectedValue,
    			isMulti,
    			getGroupHeaderLabel,
    			items: filteredItems,
    			itemHeight
    		};

    		if (getOptionLabel) {
    			data.getOptionLabel = getOptionLabel;
    		}

    		target = document.createElement("div");

    		Object.assign(target.style, {
    			position: "absolute",
    			"z-index": 2,
    			visibility: "hidden"
    		});

    		$$invalidate(34, list);
    		target = target;
    		if (container) container.appendChild(target);
    		$$invalidate(34, list = new List({ target, props: data }));

    		list.$on("itemSelected", event => {
    			const { detail } = event;

    			if (detail) {
    				const item = Object.assign({}, detail);

    				if (!item.isGroupHeader || item.isSelectable) {
    					if (isMulti) {
    						$$invalidate(3, selectedValue = selectedValue ? selectedValue.concat([item]) : [item]);
    					} else {
    						$$invalidate(3, selectedValue = item);
    					}

    					resetFilter();
    					(($$invalidate(3, selectedValue), $$invalidate(45, optionIdentifier)), $$invalidate(8, isMulti));

    					setTimeout(() => {
    						$$invalidate(33, listOpen = false);
    						$$invalidate(22, activeSelectedValue = undefined);
    					});
    				}
    			}
    		});

    		list.$on("itemCreated", event => {
    			const { detail } = event;

    			if (isMulti) {
    				$$invalidate(3, selectedValue = selectedValue || []);
    				$$invalidate(3, selectedValue = [...selectedValue, createItem(detail)]);
    			} else {
    				$$invalidate(3, selectedValue = createItem(detail));
    			}

    			$$invalidate(4, filterText = "");
    			$$invalidate(33, listOpen = false);
    			$$invalidate(22, activeSelectedValue = undefined);
    			resetFilter();
    		});

    		list.$on("closeList", () => {
    			$$invalidate(33, listOpen = false);
    		});

    		($$invalidate(34, list), target = target);
    		getPosition();
    	}

    	onMount(() => {
    		if (isFocused) input.focus();
    		if (listOpen) loadList();

    		if (items && items.length > 0) {
    			$$invalidate(63, originalItemsClone = JSON.stringify(items));
    		}
    	});

    	onDestroy(() => {
    		removeList();
    	});

    	const writable_props = [
    		"container",
    		"input",
    		"Item",
    		"Selection",
    		"MultiSelection",
    		"isMulti",
    		"isDisabled",
    		"isCreatable",
    		"isFocused",
    		"selectedValue",
    		"filterText",
    		"placeholder",
    		"items",
    		"itemFilter",
    		"groupBy",
    		"groupFilter",
    		"isGroupHeaderSelectable",
    		"getGroupHeaderLabel",
    		"getOptionLabel",
    		"optionIdentifier",
    		"loadOptions",
    		"hasError",
    		"containerStyles",
    		"getSelectionLabel",
    		"createGroupHeaderItem",
    		"createItem",
    		"isSearchable",
    		"inputStyles",
    		"isClearable",
    		"isWaiting",
    		"listPlacement",
    		"listOpen",
    		"list",
    		"isVirtualList",
    		"loadOptionsInterval",
    		"noOptionsMessage",
    		"hideEmptyState",
    		"filteredItems",
    		"inputAttributes",
    		"listAutoWidth",
    		"itemHeight",
    		"Icon",
    		"showChevron",
    		"showIndicator",
    		"containerClasses",
    		"indicatorSvg"
    	];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Select", $$slots, []);

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(1, input);
    		});
    	}

    	function input_1_input_handler() {
    		filterText = this.value;
    		$$invalidate(4, filterText);
    	}

    	function input_1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(1, input);
    		});
    	}

    	function input_1_input_handler_1() {
    		filterText = this.value;
    		$$invalidate(4, filterText);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(36, Item = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("isDisabled" in $$props) $$invalidate(9, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(37, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(2, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(3, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(4, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(38, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(32, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(39, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(40, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(41, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(42, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(43, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(44, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(45, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(46, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(10, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(11, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(12, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(47, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(48, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(13, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(14, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(15, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(49, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(33, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(34, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(50, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(51, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(52, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(53, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(35, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(54, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(55, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(56, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(16, Icon = $$props.Icon);
    		if ("showChevron" in $$props) $$invalidate(17, showChevron = $$props.showChevron);
    		if ("showIndicator" in $$props) $$invalidate(18, showIndicator = $$props.showIndicator);
    		if ("containerClasses" in $$props) $$invalidate(19, containerClasses = $$props.containerClasses);
    		if ("indicatorSvg" in $$props) $$invalidate(20, indicatorSvg = $$props.indicatorSvg);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		List,
    		ItemComponent: Item$1,
    		SelectionComponent: Selection,
    		MultiSelectionComponent: MultiSelection,
    		isOutOfViewport,
    		debounce,
    		dispatch,
    		container,
    		input,
    		Item,
    		Selection: Selection$1,
    		MultiSelection: MultiSelection$1,
    		isMulti,
    		isDisabled,
    		isCreatable,
    		isFocused,
    		selectedValue,
    		filterText,
    		placeholder,
    		items,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		createGroupHeaderItem,
    		createItem,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		isWaiting,
    		listPlacement,
    		listOpen,
    		list,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		filteredItems,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		Icon,
    		showChevron,
    		showIndicator,
    		containerClasses,
    		indicatorSvg,
    		target,
    		activeSelectedValue,
    		_items,
    		originalItemsClone,
    		prev_selectedValue,
    		prev_listOpen,
    		prev_filterText,
    		prev_isFocused,
    		prev_filteredItems,
    		resetFilter,
    		getItemsHasInvoked,
    		getItems,
    		_inputAttributes,
    		checkSelectedValueForDuplicates,
    		setList,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		removeList,
    		handleWindowClick,
    		handleClick,
    		handleClear,
    		loadList,
    		disabled,
    		showSelectedItem,
    		placeholderText
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(36, Item = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("isDisabled" in $$props) $$invalidate(9, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(37, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(2, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(3, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(4, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(38, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(32, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(39, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(40, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(41, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(42, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(43, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(44, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(45, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(46, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(10, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(11, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(12, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(47, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(48, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(13, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(14, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(15, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(49, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(33, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(34, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(50, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(51, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(52, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(53, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(35, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(54, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(55, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(56, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(16, Icon = $$props.Icon);
    		if ("showChevron" in $$props) $$invalidate(17, showChevron = $$props.showChevron);
    		if ("showIndicator" in $$props) $$invalidate(18, showIndicator = $$props.showIndicator);
    		if ("containerClasses" in $$props) $$invalidate(19, containerClasses = $$props.containerClasses);
    		if ("indicatorSvg" in $$props) $$invalidate(20, indicatorSvg = $$props.indicatorSvg);
    		if ("target" in $$props) target = $$props.target;
    		if ("activeSelectedValue" in $$props) $$invalidate(22, activeSelectedValue = $$props.activeSelectedValue);
    		if ("_items" in $$props) $$invalidate(72, _items = $$props._items);
    		if ("originalItemsClone" in $$props) $$invalidate(63, originalItemsClone = $$props.originalItemsClone);
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    		if ("prev_listOpen" in $$props) prev_listOpen = $$props.prev_listOpen;
    		if ("prev_filterText" in $$props) prev_filterText = $$props.prev_filterText;
    		if ("prev_isFocused" in $$props) prev_isFocused = $$props.prev_isFocused;
    		if ("prev_filteredItems" in $$props) prev_filteredItems = $$props.prev_filteredItems;
    		if ("getItemsHasInvoked" in $$props) getItemsHasInvoked = $$props.getItemsHasInvoked;
    		if ("_inputAttributes" in $$props) $$invalidate(23, _inputAttributes = $$props._inputAttributes);
    		if ("disabled" in $$props) disabled = $$props.disabled;
    		if ("showSelectedItem" in $$props) $$invalidate(24, showSelectedItem = $$props.showSelectedItem);
    		if ("placeholderText" in $$props) $$invalidate(25, placeholderText = $$props.placeholderText);
    	};

    	let disabled;
    	let showSelectedItem;
    	let placeholderText;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*isDisabled*/ 512) {
    			 disabled = isDisabled;
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, isMulti*/ 264 | $$self.$$.dirty[1] & /*optionIdentifier*/ 16384) {
    			 {
    				if (typeof selectedValue === "string") {
    					$$invalidate(3, selectedValue = {
    						[optionIdentifier]: selectedValue,
    						label: selectedValue
    					});
    				} else if (isMulti && Array.isArray(selectedValue) && selectedValue.length > 0) {
    					$$invalidate(3, selectedValue = selectedValue.map(item => typeof item === "string"
    					? { value: item, label: item }
    					: item));
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, filterText*/ 24) {
    			 $$invalidate(24, showSelectedItem = selectedValue && filterText.length === 0);
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue*/ 8 | $$self.$$.dirty[1] & /*placeholder*/ 128) {
    			 $$invalidate(25, placeholderText = selectedValue ? "" : placeholder);
    		}

    		if ($$self.$$.dirty[0] & /*isSearchable*/ 8192 | $$self.$$.dirty[1] & /*inputAttributes*/ 8388608) {
    			 {
    				$$invalidate(23, _inputAttributes = Object.assign(inputAttributes, {
    					autocomplete: "off",
    					autocorrect: "off",
    					spellcheck: false
    				}));

    				if (!isSearchable) {
    					$$invalidate(23, _inputAttributes.readonly = true, _inputAttributes);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*filterText, isMulti, selectedValue*/ 280 | $$self.$$.dirty[1] & /*items, loadOptions, optionIdentifier, itemFilter, getOptionLabel, groupBy, createGroupHeaderItem, isGroupHeaderSelectable, groupFilter*/ 126722 | $$self.$$.dirty[2] & /*originalItemsClone*/ 2) {
    			 {
    				let _filteredItems;
    				let _items = items;

    				if (items && items.length > 0 && typeof items[0] !== "object") {
    					_items = items.map((item, index) => {
    						return { index, value: item, label: item };
    					});
    				}

    				if (loadOptions && filterText.length === 0 && originalItemsClone) {
    					_filteredItems = JSON.parse(originalItemsClone);
    					_items = JSON.parse(originalItemsClone);
    				} else {
    					_filteredItems = loadOptions
    					? filterText.length === 0 ? [] : _items
    					: _items.filter(item => {
    							let keepItem = true;

    							if (isMulti && selectedValue) {
    								keepItem = !selectedValue.some(value => {
    									return value[optionIdentifier] === item[optionIdentifier];
    								});
    							}

    							if (!keepItem) return false;
    							if (filterText.length < 1) return true;
    							return itemFilter(getOptionLabel(item, filterText), filterText, item);
    						});
    				}

    				if (groupBy) {
    					const groupValues = [];
    					const groups = {};

    					_filteredItems.forEach(item => {
    						const groupValue = groupBy(item);

    						if (!groupValues.includes(groupValue)) {
    							groupValues.push(groupValue);
    							groups[groupValue] = [];

    							if (groupValue) {
    								groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
    									id: groupValue,
    									isGroupHeader: true,
    									isSelectable: isGroupHeaderSelectable
    								}));
    							}
    						}

    						groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
    					});

    					const sortedGroupedItems = [];

    					groupFilter(groupValues).forEach(groupValue => {
    						sortedGroupedItems.push(...groups[groupValue]);
    					});

    					$$invalidate(35, filteredItems = sortedGroupedItems);
    				} else {
    					$$invalidate(35, filteredItems = _filteredItems);
    				}
    			}
    		}
    	};

    	return [
    		container,
    		input,
    		isFocused,
    		selectedValue,
    		filterText,
    		isWaiting,
    		Selection$1,
    		MultiSelection$1,
    		isMulti,
    		isDisabled,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		Icon,
    		showChevron,
    		showIndicator,
    		containerClasses,
    		indicatorSvg,
    		handleClear,
    		activeSelectedValue,
    		_inputAttributes,
    		showSelectedItem,
    		placeholderText,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		handleWindowClick,
    		handleClick,
    		items,
    		listOpen,
    		list,
    		filteredItems,
    		Item,
    		isCreatable,
    		placeholder,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		createGroupHeaderItem,
    		createItem,
    		listPlacement,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		input_1_binding,
    		input_1_input_handler,
    		input_1_binding_1,
    		input_1_input_handler_1,
    		div_binding
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$x,
    			create_fragment$x,
    			safe_not_equal,
    			{
    				container: 0,
    				input: 1,
    				Item: 36,
    				Selection: 6,
    				MultiSelection: 7,
    				isMulti: 8,
    				isDisabled: 9,
    				isCreatable: 37,
    				isFocused: 2,
    				selectedValue: 3,
    				filterText: 4,
    				placeholder: 38,
    				items: 32,
    				itemFilter: 39,
    				groupBy: 40,
    				groupFilter: 41,
    				isGroupHeaderSelectable: 42,
    				getGroupHeaderLabel: 43,
    				getOptionLabel: 44,
    				optionIdentifier: 45,
    				loadOptions: 46,
    				hasError: 10,
    				containerStyles: 11,
    				getSelectionLabel: 12,
    				createGroupHeaderItem: 47,
    				createItem: 48,
    				isSearchable: 13,
    				inputStyles: 14,
    				isClearable: 15,
    				isWaiting: 5,
    				listPlacement: 49,
    				listOpen: 33,
    				list: 34,
    				isVirtualList: 50,
    				loadOptionsInterval: 51,
    				noOptionsMessage: 52,
    				hideEmptyState: 53,
    				filteredItems: 35,
    				inputAttributes: 54,
    				listAutoWidth: 55,
    				itemHeight: 56,
    				Icon: 16,
    				showChevron: 17,
    				showIndicator: 18,
    				containerClasses: 19,
    				indicatorSvg: 20,
    				handleClear: 21
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$x.name
    		});
    	}

    	get container() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Selection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Selection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get MultiSelection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set MultiSelection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isCreatable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isCreatable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupBy() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupBy(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isGroupHeaderSelectable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGroupHeaderSelectable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptions() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptions(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasError() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasError(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createGroupHeaderItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createGroupHeaderItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSearchable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSearchable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isClearable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isClearable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isWaiting() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isWaiting(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listPlacement() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listPlacement(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listOpen() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listOpen(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptionsInterval() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptionsInterval(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filteredItems() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filteredItems(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputAttributes() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputAttributes(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listAutoWidth() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listAutoWidth(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Icon() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Icon(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showChevron() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showChevron(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showIndicator() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showIndicator(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indicatorSvg() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indicatorSvg(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClear() {
    		return this.$$.ctx[21];
    	}

    	set handleClear(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/item/new.svelte generated by Svelte v3.24.0 */
    const file$u = "src/pages/item/new.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (84:2) <Btn btn="raised square" on:click={() => {$goto('/home')}}>
    function create_default_slot_4$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(84:2) <Btn btn=\\\"raised square\\\" on:click={() => {$goto('/home')}}>",
    		ctx
    	});

    	return block;
    }

    // (85:3) <Btn btn="raised fill square">
    function create_default_slot_3$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Index");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(85:3) <Btn btn=\\\"raised fill square\\\">",
    		ctx
    	});

    	return block;
    }

    // (86:5) <Btn btn="raised square">
    function create_default_slot_2$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Fore");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(86:5) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    // (98:2) {#each permis as perm}
    function create_each_block$5(ctx) {
    	let option;
    	let t0_value = /*perm*/ ctx[8].label + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*perm*/ ctx[8].value;
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-lavrer");
    			add_location(option, file$u, 98, 3, 2772);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(98:2) {#each permis as perm}",
    		ctx
    	});

    	return block;
    }

    // (106:2) <Btn btn="raised">
    function create_default_slot_1$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Clear");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(106:2) <Btn btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    // (107:2) <Btn type="submit" btn="raised">
    function create_default_slot$h(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$h.name,
    		type: "slot",
    		source: "(107:2) <Btn type=\\\"submit\\\" btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let nav;
    	let t0;
    	let div0;
    	let btn0;
    	let btn1;
    	let btn2;
    	let t1;
    	let br0;
    	let br1;
    	let t2;
    	let h1;
    	let t4;
    	let br2;
    	let br3;
    	let t5;
    	let form;
    	let p0;
    	let t6;
    	let t7_value = /*itmIn*/ ctx[0].name + "";
    	let t7;
    	let t8;
    	let input;
    	let t9;
    	let br4;
    	let t10;
    	let p1;
    	let t12;
    	let select0;
    	let select0_value_value;
    	let t13;
    	let div1;
    	let select1;
    	let t14;
    	let br5;
    	let br6;
    	let t15;
    	let btn3;
    	let t16;
    	let btn4;
    	let current;
    	let mounted;
    	let dispose;
    	nav = new Nav({ $$inline: true });

    	btn0 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn0.$on("click", /*click_handler*/ ctx[4]);

    	btn1 = new Btn({
    			props: {
    				btn: "raised fill square",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn2 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*permis*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	select1 = new Select({
    			props: {
    				permis: /*permis*/ ctx[2],
    				bind: /*itmIn*/ ctx[0].permission
    			},
    			$$inline: true
    		});

    	btn3 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn4 = new Btn({
    			props: {
    				type: "submit",
    				btn: "raised",
    				$$slots: { default: [create_default_slot$h] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(btn0.$$.fragment);
    			create_component(btn1.$$.fragment);
    			create_component(btn2.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t2 = space();
    			h1 = element("h1");
    			h1.textContent = "Add itmord";
    			t4 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t5 = space();
    			form = element("form");
    			p0 = element("p");
    			t6 = text("Item name: ");
    			t7 = text(t7_value);
    			t8 = space();
    			input = element("input");
    			t9 = space();
    			br4 = element("br");
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "Permissions:";
    			t12 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div1 = element("div");
    			create_component(select1.$$.fragment);
    			t14 = space();
    			br5 = element("br");
    			br6 = element("br");
    			t15 = space();
    			create_component(btn3.$$.fragment);
    			t16 = space();
    			create_component(btn4.$$.fragment);
    			attr_dev(div0, "class", "btns svelte-lavrer");
    			add_location(div0, file$u, 82, 0, 2339);
    			add_location(br0, file$u, 87, 0, 2521);
    			add_location(br1, file$u, 87, 5, 2526);
    			add_location(h1, file$u, 88, 0, 2532);
    			add_location(br2, file$u, 89, 0, 2552);
    			add_location(br3, file$u, 89, 5, 2557);
    			add_location(p0, file$u, 92, 2, 2613);
    			attr_dev(input, "class", "svelte-lavrer");
    			add_location(input, file$u, 93, 2, 2646);
    			add_location(br4, file$u, 94, 2, 2681);
    			add_location(p1, file$u, 95, 2, 2689);
    			attr_dev(select0, "class", "svelte-lavrer");
    			add_location(select0, file$u, 96, 1, 2710);
    			attr_dev(div1, "class", "sel svelte-lavrer");
    			add_location(div1, file$u, 103, 2, 2853);
    			add_location(br5, file$u, 104, 2, 2929);
    			add_location(br6, file$u, 104, 7, 2934);
    			add_location(form, file$u, 90, 0, 2563);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			mount_component(btn0, div0, null);
    			mount_component(btn1, div0, null);
    			mount_component(btn2, div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, p0);
    			append_dev(p0, t6);
    			append_dev(p0, t7);
    			append_dev(form, t8);
    			append_dev(form, input);
    			set_input_value(input, /*itmIn*/ ctx[0].name);
    			append_dev(form, t9);
    			append_dev(form, br4);
    			append_dev(form, t10);
    			append_dev(form, p1);
    			append_dev(form, t12);
    			append_dev(form, select0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select0, null);
    			}

    			select_option(select0, /*itmIn*/ ctx[0].permission);
    			append_dev(form, t13);
    			append_dev(form, div1);
    			mount_component(select1, div1, null);
    			append_dev(form, t14);
    			append_dev(form, br5);
    			append_dev(form, br6);
    			append_dev(form, t15);
    			mount_component(btn3, form, null);
    			append_dev(form, t16);
    			mount_component(btn4, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const btn0_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				btn0_changes.$$scope = { dirty, ctx };
    			}

    			btn0.$set(btn0_changes);
    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);
    			const btn2_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				btn2_changes.$$scope = { dirty, ctx };
    			}

    			btn2.$set(btn2_changes);
    			if ((!current || dirty & /*itmIn*/ 1) && t7_value !== (t7_value = /*itmIn*/ ctx[0].name + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*itmIn, permis*/ 5 && input.value !== /*itmIn*/ ctx[0].name) {
    				set_input_value(input, /*itmIn*/ ctx[0].name);
    			}

    			if (dirty & /*permis*/ 4) {
    				each_value = /*permis*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*itmIn, permis*/ 5 && select0_value_value !== (select0_value_value = /*itmIn*/ ctx[0].permission)) {
    				select_option(select0, /*itmIn*/ ctx[0].permission);
    			}

    			const select1_changes = {};
    			if (dirty & /*itmIn*/ 1) select1_changes.bind = /*itmIn*/ ctx[0].permission;
    			select1.$set(select1_changes);
    			const btn3_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				btn3_changes.$$scope = { dirty, ctx };
    			}

    			btn3.$set(btn3_changes);
    			const btn4_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				btn4_changes.$$scope = { dirty, ctx };
    			}

    			btn4.$set(btn4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			transition_in(btn2.$$.fragment, local);
    			transition_in(select1.$$.fragment, local);
    			transition_in(btn3.$$.fragment, local);
    			transition_in(btn4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			transition_out(btn2.$$.fragment, local);
    			transition_out(select1.$$.fragment, local);
    			transition_out(btn3.$$.fragment, local);
    			transition_out(btn4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			destroy_component(btn0);
    			destroy_component(btn1);
    			destroy_component(btn2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			destroy_component(select1);
    			destroy_component(btn3);
    			destroy_component(btn4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let $goto;
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(1, $goto = $$value));

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let itmIn = { name: "", permission: "" };
    	const p = ["private", "mutual", "invite", "public"];

    	let permis = [
    		{ value: "private", label: `Private` },
    		{ value: "mutual", label: `Mutuals only` },
    		{ value: "invite", label: `Invite only` },
    		{ value: "public", label: `Public` }
    	];

    	const handleSubmit = () => __awaiter(void 0, void 0, void 0, function* () {
    		
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<New> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("New", $$slots, []);

    	const click_handler = () => {
    		$goto("/home");
    	};

    	function input_input_handler() {
    		itmIn.name = this.value;
    		$$invalidate(0, itmIn);
    		$$invalidate(2, permis);
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		Select,
    		user,
    		isLoggedIn,
    		goto,
    		Nav,
    		Btn,
    		itmIn,
    		p,
    		permis,
    		handleSubmit,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("itmIn" in $$props) $$invalidate(0, itmIn = $$props.itmIn);
    		if ("permis" in $$props) $$invalidate(2, permis = $$props.permis);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [itmIn, $goto, permis, handleSubmit, click_handler, input_input_handler];
    }

    class New extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "New",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src/pages/prefs/index.svelte generated by Svelte v3.24.0 */
    const file$v = "src/pages/prefs/index.svelte";

    function create_fragment$z(ctx) {
    	let nav;
    	let t0;
    	let h3;
    	let current;
    	nav = new Nav({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Preferences";
    			add_location(h3, file$v, 3, 2, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h3, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prefs> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Prefs", $$slots, []);
    	$$self.$capture_state = () => ({ Nav });
    	return [];
    }

    class Prefs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prefs",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    /* src/pages/profile/index.svelte generated by Svelte v3.24.0 */
    const file$w = "src/pages/profile/index.svelte";

    function create_fragment$A(ctx) {
    	let nav;
    	let t0;
    	let h3;
    	let current;
    	nav = new Nav({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Profile";
    			add_location(h3, file$w, 3, 2, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h3, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Profile", $$slots, []);
    	$$self.$capture_state = () => ({ Nav });
    	return [];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    /* src/pages/rec/index.svelte generated by Svelte v3.24.0 */
    const file$x = "src/pages/rec/index.svelte";

    function create_fragment$B(ctx) {
    	let nav;
    	let t0;
    	let topbar;
    	let t1;
    	let h1;
    	let current;
    	nav = new Nav({ $$inline: true });
    	topbar = new Topbar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(topbar.$$.fragment);
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "records";
    			add_location(h1, file$x, 6, 0, 192);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(topbar, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h1, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(topbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(topbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(topbar, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Rec> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Rec", $$slots, []);
    	$$self.$capture_state = () => ({ Nav, Topbar });
    	return [];
    }

    class Rec extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rec",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src/pages/rec/new.svelte generated by Svelte v3.24.0 */
    const file$y = "src/pages/rec/new.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (72:2) <Btn btn="raised square" on:click={() => {$goto('/home')}}>
    function create_default_slot_4$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(72:2) <Btn btn=\\\"raised square\\\" on:click={() => {$goto('/home')}}>",
    		ctx
    	});

    	return block;
    }

    // (73:2) <Btn btn="raised square">
    function create_default_slot_3$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Index");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(73:2) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    // (74:2) <Btn btn="raised square">
    function create_default_slot_2$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Fore");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(74:2) <Btn btn=\\\"raised square\\\">",
    		ctx
    	});

    	return block;
    }

    // (86:2) {#each permis as perm}
    function create_each_block$6(ctx) {
    	let option;
    	let t0_value = /*perm*/ ctx[7].text + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*perm*/ ctx[7].val;
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-v5ftn");
    			add_location(option, file$y, 86, 3, 2459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(86:2) {#each permis as perm}",
    		ctx
    	});

    	return block;
    }

    // (93:2) <Btn btn="raised">
    function create_default_slot_1$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Clear");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(93:2) <Btn btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    // (94:2) <Btn type="submit" btn="raised">
    function create_default_slot$i(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$i.name,
    		type: "slot",
    		source: "(94:2) <Btn type=\\\"submit\\\" btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$C(ctx) {
    	let nav;
    	let t0;
    	let div;
    	let btn0;
    	let t1;
    	let btn1;
    	let t2;
    	let btn2;
    	let t3;
    	let br0;
    	let br1;
    	let t4;
    	let h1;
    	let t6;
    	let br2;
    	let br3;
    	let t7;
    	let form;
    	let p0;
    	let t8;
    	let t9_value = /*recIn*/ ctx[0].name + "";
    	let t9;
    	let t10;
    	let input;
    	let t11;
    	let br4;
    	let t12;
    	let p1;
    	let t14;
    	let select;
    	let select_value_value;
    	let t15;
    	let br5;
    	let br6;
    	let t16;
    	let btn3;
    	let t17;
    	let btn4;
    	let current;
    	let mounted;
    	let dispose;
    	nav = new Nav({ $$inline: true });

    	btn0 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_4$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn0.$on("click", /*click_handler*/ ctx[4]);

    	btn1 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn2 = new Btn({
    			props: {
    				btn: "raised square",
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*permis*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	btn3 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn4 = new Btn({
    			props: {
    				type: "submit",
    				btn: "raised",
    				$$slots: { default: [create_default_slot$i] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(btn0.$$.fragment);
    			t1 = space();
    			create_component(btn1.$$.fragment);
    			t2 = space();
    			create_component(btn2.$$.fragment);
    			t3 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t4 = space();
    			h1 = element("h1");
    			h1.textContent = "Add Record";
    			t6 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t7 = space();
    			form = element("form");
    			p0 = element("p");
    			t8 = text("Record name: ");
    			t9 = text(t9_value);
    			t10 = space();
    			input = element("input");
    			t11 = space();
    			br4 = element("br");
    			t12 = space();
    			p1 = element("p");
    			p1.textContent = "Permissions:";
    			t14 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			br5 = element("br");
    			br6 = element("br");
    			t16 = space();
    			create_component(btn3.$$.fragment);
    			t17 = space();
    			create_component(btn4.$$.fragment);
    			attr_dev(div, "class", "btns svelte-v5ftn");
    			add_location(div, file$y, 70, 0, 2031);
    			add_location(br0, file$y, 75, 0, 2206);
    			add_location(br1, file$y, 75, 5, 2211);
    			add_location(h1, file$y, 76, 0, 2217);
    			add_location(br2, file$y, 77, 0, 2237);
    			add_location(br3, file$y, 77, 5, 2242);
    			add_location(p0, file$y, 80, 2, 2298);
    			attr_dev(input, "class", "svelte-v5ftn");
    			add_location(input, file$y, 81, 2, 2333);
    			add_location(br4, file$y, 82, 2, 2368);
    			add_location(p1, file$y, 83, 2, 2376);
    			attr_dev(select, "class", "svelte-v5ftn");
    			add_location(select, file$y, 84, 1, 2397);
    			add_location(br5, file$y, 91, 2, 2537);
    			add_location(br6, file$y, 91, 7, 2542);
    			add_location(form, file$y, 78, 0, 2248);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(btn0, div, null);
    			append_dev(div, t1);
    			mount_component(btn1, div, null);
    			append_dev(div, t2);
    			mount_component(btn2, div, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, p0);
    			append_dev(p0, t8);
    			append_dev(p0, t9);
    			append_dev(form, t10);
    			append_dev(form, input);
    			set_input_value(input, /*recIn*/ ctx[0].name);
    			append_dev(form, t11);
    			append_dev(form, br4);
    			append_dev(form, t12);
    			append_dev(form, p1);
    			append_dev(form, t14);
    			append_dev(form, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*recIn*/ ctx[0].permission);
    			append_dev(form, t15);
    			append_dev(form, br5);
    			append_dev(form, br6);
    			append_dev(form, t16);
    			mount_component(btn3, form, null);
    			append_dev(form, t17);
    			mount_component(btn4, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const btn0_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				btn0_changes.$$scope = { dirty, ctx };
    			}

    			btn0.$set(btn0_changes);
    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);
    			const btn2_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				btn2_changes.$$scope = { dirty, ctx };
    			}

    			btn2.$set(btn2_changes);
    			if ((!current || dirty & /*recIn*/ 1) && t9_value !== (t9_value = /*recIn*/ ctx[0].name + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*recIn, permis*/ 5 && input.value !== /*recIn*/ ctx[0].name) {
    				set_input_value(input, /*recIn*/ ctx[0].name);
    			}

    			if (dirty & /*permis*/ 4) {
    				each_value = /*permis*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*recIn, permis*/ 5 && select_value_value !== (select_value_value = /*recIn*/ ctx[0].permission)) {
    				select_option(select, /*recIn*/ ctx[0].permission);
    			}

    			const btn3_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				btn3_changes.$$scope = { dirty, ctx };
    			}

    			btn3.$set(btn3_changes);
    			const btn4_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				btn4_changes.$$scope = { dirty, ctx };
    			}

    			btn4.$set(btn4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			transition_in(btn2.$$.fragment, local);
    			transition_in(btn3.$$.fragment, local);
    			transition_in(btn4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			transition_out(btn2.$$.fragment, local);
    			transition_out(btn3.$$.fragment, local);
    			transition_out(btn4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(btn0);
    			destroy_component(btn1);
    			destroy_component(btn2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			destroy_component(btn3);
    			destroy_component(btn4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
    	let $goto;
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(1, $goto = $$value));

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let recIn = { name: "", permission: "" };

    	let permis = [
    		{ val: "private", text: `Private` },
    		{ val: "mutual", text: `Mutuals only` },
    		{ val: "invite", text: `Invite only` },
    		{ val: "public", text: `Public` }
    	];

    	const handleSubmit = () => __awaiter(void 0, void 0, void 0, function* () {
    		
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<New> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("New", $$slots, []);

    	const click_handler = () => {
    		$goto("/home");
    	};

    	function input_input_handler() {
    		recIn.name = this.value;
    		$$invalidate(0, recIn);
    		$$invalidate(2, permis);
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		user,
    		isLoggedIn,
    		goto,
    		Nav,
    		Btn,
    		recIn,
    		permis,
    		handleSubmit,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("recIn" in $$props) $$invalidate(0, recIn = $$props.recIn);
    		if ("permis" in $$props) $$invalidate(2, permis = $$props.permis);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [recIn, $goto, permis, handleSubmit, click_handler, input_input_handler];
    }

    class New$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "New",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    const API_URL = 'http://localhost:3001/api';

    const GET_PARAMS = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    };

    async function getAllUsers() {
      const usrs = await fetch(API_URL+'/all', GET_PARAMS)
        .catch(err=>{
          console.log(err);
      });
      if (usrs.ok) {
        return usrs.json();
      } else {
        throw new Error(users);
      }
    }
    async function getUserById(id) {
        const usr = await fetch(API_URL+'/user/id/'+id, {
            method: 'GET',
            headers: {
              'content-type': 'application/json',
            },
        })
            .catch(err=>{
                console.log(err);
            });
      if (usr.ok) { 
        return usr.json();
      } else {
        throw new Error("No user with id " + id + " found.");
      }
    }

    async function signupUser(loginInfo) {
      const signupPost = await fetch(API_URL+'/auth/register', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
            /*authorization: <authorization>*/
        },
        body: JSON.stringify(loginInfo)
      });
      if (signupPost.ok) {
        return signupPost.json();
      } else {
        throw new Error(users);
      }
    }

    function a$2(a$1,c){return e(this,void 0,void 0,(function(){return t(this,(function(e){switch(e.label){case 0:return "object"==typeof c&&Object.freeze(c),[4,a({cmd:"execute",command:a$1,args:"string"==typeof c?[c]:c})];case 1:return [2,e.sent()]}}))}))}var c=Object.freeze({__proto__:null,execute:a$2});

    /* src/pages/search.svelte generated by Svelte v3.24.0 */

    const { console: console_1$2 } = globals;
    const file$z = "src/pages/search.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (75:0) <Btn btn="filled" on:click={getUsers}>
    function create_default_slot$j(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Fetch");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$j.name,
    		type: "slot",
    		source: "(75:0) <Btn btn=\\\"filled\\\" on:click={getUsers}>",
    		ctx
    	});

    	return block;
    }

    // (95:2) {:catch err}
    function create_catch_block$1(ctx) {
    	let p;
    	let t0_value = /*err*/ ctx[12] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" - Something happened. Couldn't get users");
    			add_location(p, file$z, 95, 4, 2862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userPromise*/ 1 && t0_value !== (t0_value = /*err*/ ctx[12] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(95:2) {:catch err}",
    		ctx
    	});

    	return block;
    }

    // (79:2) {:then users}
    function create_then_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*submittedUsers*/ ctx[1] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*submittedUsers*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(79:2) {:then users}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {#if submittedUsers}
    function create_if_block$9(ctx) {
    	let each_1_anchor;
    	let each_value = /*users*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
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
    			if (dirty & /*userPromise*/ 1) {
    				each_value = /*users*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(80:4) {#if submittedUsers}",
    		ctx
    	});

    	return block;
    }

    // (81:6) {#each users as user}
    function create_each_block$7(ctx) {
    	let div;
    	let ul;
    	let h3;
    	let t0_value = /*user*/ ctx[9].username + "";
    	let t0;
    	let t1;
    	let li0;
    	let p0;
    	let t2_value = /*user*/ ctx[9].id + "";
    	let t2;
    	let t3;
    	let li1;
    	let p1;
    	let t4_value = /*user*/ ctx[9].username + "";
    	let t4;
    	let t5;
    	let li2;
    	let p2;
    	let t6_value = /*user*/ ctx[9].email + "";
    	let t6;
    	let t7;
    	let li3;
    	let p3;
    	let t8_value = /*user*/ ctx[9].createdAt + "";
    	let t8;
    	let t9;

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			li0 = element("li");
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			li1 = element("li");
    			p1 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			li2 = element("li");
    			p2 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			li3 = element("li");
    			p3 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			attr_dev(h3, "class", "svelte-1dp8po9");
    			add_location(h3, file$z, 83, 10, 2605);
    			add_location(p0, file$z, 84, 14, 2644);
    			attr_dev(li0, "class", "svelte-1dp8po9");
    			add_location(li0, file$z, 84, 10, 2640);
    			add_location(p1, file$z, 85, 14, 2680);
    			attr_dev(li1, "class", "svelte-1dp8po9");
    			add_location(li1, file$z, 85, 10, 2676);
    			add_location(p2, file$z, 86, 14, 2722);
    			attr_dev(li2, "class", "svelte-1dp8po9");
    			add_location(li2, file$z, 86, 10, 2718);
    			add_location(p3, file$z, 87, 14, 2761);
    			attr_dev(li3, "class", "svelte-1dp8po9");
    			add_location(li3, file$z, 87, 10, 2757);
    			add_location(ul, file$z, 82, 8, 2590);
    			attr_dev(div, "class", "user-card svelte-1dp8po9");
    			add_location(div, file$z, 81, 6, 2558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    			append_dev(ul, h3);
    			append_dev(h3, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li0);
    			append_dev(li0, p0);
    			append_dev(p0, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, p1);
    			append_dev(p1, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, p2);
    			append_dev(p2, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li3);
    			append_dev(li3, p3);
    			append_dev(p3, t8);
    			append_dev(div, t9);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userPromise*/ 1 && t0_value !== (t0_value = /*user*/ ctx[9].username + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*userPromise*/ 1 && t2_value !== (t2_value = /*user*/ ctx[9].id + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*userPromise*/ 1 && t4_value !== (t4_value = /*user*/ ctx[9].username + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*userPromise*/ 1 && t6_value !== (t6_value = /*user*/ ctx[9].email + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*userPromise*/ 1 && t8_value !== (t8_value = /*user*/ ctx[9].createdAt + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(81:6) {#each users as user}",
    		ctx
    	});

    	return block;
    }

    // (77:22)      <p>Getting users...</p>   {:then users}
    function create_pending_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Getting users...";
    			add_location(p, file$z, 77, 4, 2459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(77:22)      <p>Getting users...</p>   {:then users}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$D(ctx) {
    	let nav;
    	let t0;
    	let btn;
    	let t1;
    	let await_block_anchor;
    	let promise;
    	let current;
    	nav = new Nav({ $$inline: true });

    	btn = new Btn({
    			props: {
    				btn: "filled",
    				$$slots: { default: [create_default_slot$j] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn.$on("click", /*getUsers*/ ctx[2]);

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 8,
    		error: 12
    	};

    	handle_promise(promise = /*userPromise*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(btn.$$.fragment);
    			t1 = space();
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(btn, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const btn_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				btn_changes.$$scope = { dirty, ctx };
    			}

    			btn.$set(btn_changes);
    			info.ctx = ctx;

    			if (dirty & /*userPromise*/ 1 && promise !== (promise = /*userPromise*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[8] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(btn.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(btn.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(btn, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let userPromise = Promise.resolve([]);
    	let submittedUsers = false;
    	let success = Promise.resolve([]);
    	let n = Promise.resolve([]);

    	/*let promis = window.__TAURI_INVOKE_HANDLER__.tauri.promisified;*/
    	function fail() {
    		return __awaiter(this, void 0, void 0, function* () {
    			return Promise.resolve(JSON);
    		});
    	}

    	function test() {
    		o({ cmd: "chooseFolder" });
    	}

    	/*async function success(): Promise<JSON> { return Promise.resolve(JSON) }*/
    	function getUsers() {
    		return __awaiter(this, void 0, void 0, function* () {
    			a$2("getAllUsers", []);

    			a({
    				cmd: "getAllUsers",
    				callback: "userPromise",
    				error: "fail"
    			}).then(response => {
    				console.log(response);
    				return response;
    			}).catch(err => {
    				console.error(err);
    			});

    			$$invalidate(1, submittedUsers = true);

    			const res = yield getAllUsers().catch(err => {
    				console.log(err);
    				return [];
    			});

    			$$invalidate(0, userPromise = res);
    			return res;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Search", $$slots, []);

    	$$self.$capture_state = () => ({
    		__awaiter,
    		getAllUsers,
    		Btn,
    		Nav,
    		invoke: o,
    		promisified: a,
    		listen: a$1,
    		emit: n$2,
    		execute: a$2,
    		userPromise,
    		submittedUsers,
    		success,
    		n,
    		fail,
    		test,
    		getUsers
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("userPromise" in $$props) $$invalidate(0, userPromise = $$props.userPromise);
    		if ("submittedUsers" in $$props) $$invalidate(1, submittedUsers = $$props.submittedUsers);
    		if ("success" in $$props) success = $$props.success;
    		if ("n" in $$props) n = $$props.n;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [userPromise, submittedUsers, getUsers];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src/pages/signup.svelte generated by Svelte v3.24.0 */
    const file$A = "src/pages/signup.svelte";

    // (94:2) <Btn btn="raised">
    function create_default_slot_1$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reset");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(94:2) <Btn btn=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    // (95:2) <Btn btn="raised" on:click={handleSubmit}>
    function create_default_slot$k(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$k.name,
    		type: "slot",
    		source: "(95:2) <Btn btn=\\\"raised\\\" on:click={handleSubmit}>",
    		ctx
    	});

    	return block;
    }

    // (100:4) {#if signupSubmitted}
    function create_if_block$a(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2
    	};

    	handle_promise(promise = /*signupPromise*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*signupPromise*/ 1 && promise !== (promise = /*signupPromise*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(100:4) {#if signupSubmitted}",
    		ctx
    	});

    	return block;
    }

    // (105:6) {:catch}
    function create_catch_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Couldn't signup user.";
    			add_location(p, file$A, 105, 8, 3007);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(105:6) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (103:6) {:then}
    function create_then_block$2(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*$user*/ ctx[4].username + "";
    	let t1;
    	let t2;
    	let a;
    	let t4;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("You're signed up in ");
    			t1 = text(t1_value);
    			t2 = text("! Taking you back ");
    			a = element("a");
    			a.textContent = "home";
    			t4 = text("...");
    			attr_dev(a, "href", "/home");
    			add_location(a, file$A, 103, 65, 2952);
    			add_location(p, file$A, 103, 8, 2895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, a);
    			append_dev(p, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 16 && t1_value !== (t1_value = /*$user*/ ctx[4].username + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(103:6) {:then}",
    		ctx
    	});

    	return block;
    }

    // (101:28)          <h1>LOGGING IN</h1>         {:then}
    function create_pending_block$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "LOGGING IN";
    			add_location(h1, file$A, 101, 8, 2851);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(101:28)          <h1>LOGGING IN</h1>         {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$E(ctx) {
    	let div;
    	let br0;
    	let br1;
    	let t0;
    	let br2;
    	let br3;
    	let t1;
    	let h2;
    	let t3;
    	let br4;
    	let br5;
    	let t4;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let label1;
    	let t9;
    	let input1;
    	let t10;
    	let label2;
    	let t12;
    	let input2;
    	let t13;
    	let btn0;
    	let t14;
    	let btn1;
    	let t15;
    	let br6;
    	let br7;
    	let t16;
    	let br8;
    	let br9;
    	let t17;
    	let a;
    	let t18;
    	let a_href_value;
    	let t19;
    	let current;
    	let mounted;
    	let dispose;

    	btn0 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn1 = new Btn({
    			props: {
    				btn: "raised",
    				$$slots: { default: [create_default_slot$k] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	btn1.$on("click", /*handleSubmit*/ ctx[5]);
    	let if_block = /*signupSubmitted*/ ctx[1] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			br1 = element("br");
    			t0 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Register";
    			t3 = space();
    			br4 = element("br");
    			br5 = element("br");
    			t4 = space();
    			label0 = element("label");
    			label0.textContent = "email";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "username";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			label2 = element("label");
    			label2.textContent = "password";
    			t12 = space();
    			input2 = element("input");
    			t13 = space();
    			create_component(btn0.$$.fragment);
    			t14 = space();
    			create_component(btn1.$$.fragment);
    			t15 = space();
    			br6 = element("br");
    			br7 = element("br");
    			t16 = space();
    			br8 = element("br");
    			br9 = element("br");
    			t17 = space();
    			a = element("a");
    			t18 = text("Back to login");
    			t19 = space();
    			if (if_block) if_block.c();
    			add_location(br0, file$A, 67, 2, 2095);
    			add_location(br1, file$A, 67, 7, 2100);
    			add_location(br2, file$A, 68, 2, 2108);
    			add_location(br3, file$A, 68, 7, 2113);
    			add_location(h2, file$A, 69, 2, 2121);
    			add_location(br4, file$A, 70, 2, 2141);
    			add_location(br5, file$A, 70, 7, 2146);
    			attr_dev(label0, "for", "email");
    			add_location(label0, file$A, 71, 4, 2156);
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "class", "svelte-t32nvl");
    			add_location(input0, file$A, 72, 4, 2193);
    			attr_dev(label1, "for", "username");
    			add_location(label1, file$A, 78, 4, 2302);
    			attr_dev(input1, "id", "username");
    			attr_dev(input1, "name", "username");
    			attr_dev(input1, "class", "svelte-t32nvl");
    			add_location(input1, file$A, 79, 4, 2345);
    			attr_dev(label2, "for", "password");
    			add_location(label2, file$A, 86, 4, 2471);
    			attr_dev(input2, "id", "password");
    			attr_dev(input2, "name", "password");
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "class", "svelte-t32nvl");
    			add_location(input2, file$A, 87, 4, 2514);
    			add_location(br6, file$A, 96, 2, 2719);
    			add_location(br7, file$A, 96, 7, 2724);
    			add_location(br8, file$A, 97, 2, 2732);
    			add_location(br9, file$A, 97, 7, 2737);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[3]("/index"));
    			add_location(a, file$A, 98, 2, 2745);
    			attr_dev(div, "class", "signupform svelte-t32nvl");
    			add_location(div, file$A, 66, 0, 2068);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t0);
    			append_dev(div, br2);
    			append_dev(div, br3);
    			append_dev(div, t1);
    			append_dev(div, h2);
    			append_dev(div, t3);
    			append_dev(div, br4);
    			append_dev(div, br5);
    			append_dev(div, t4);
    			append_dev(div, label0);
    			append_dev(div, t6);
    			append_dev(div, input0);
    			set_input_value(input0, /*userIn*/ ctx[2].email);
    			append_dev(div, t7);
    			append_dev(div, label1);
    			append_dev(div, t9);
    			append_dev(div, input1);
    			set_input_value(input1, /*userIn*/ ctx[2].username);
    			append_dev(div, t10);
    			append_dev(div, label2);
    			append_dev(div, t12);
    			append_dev(div, input2);
    			set_input_value(input2, /*userIn*/ ctx[2].password);
    			append_dev(div, t13);
    			mount_component(btn0, div, null);
    			append_dev(div, t14);
    			mount_component(btn1, div, null);
    			append_dev(div, t15);
    			append_dev(div, br6);
    			append_dev(div, br7);
    			append_dev(div, t16);
    			append_dev(div, br8);
    			append_dev(div, br9);
    			append_dev(div, t17);
    			append_dev(div, a);
    			append_dev(a, t18);
    			append_dev(div, t19);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*valEmail*/ ctx[7], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "change", /*valUsername*/ ctx[6], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*userIn*/ 4 && input0.value !== /*userIn*/ ctx[2].email) {
    				set_input_value(input0, /*userIn*/ ctx[2].email);
    			}

    			if (dirty & /*userIn*/ 4 && input1.value !== /*userIn*/ ctx[2].username) {
    				set_input_value(input1, /*userIn*/ ctx[2].username);
    			}

    			if (dirty & /*userIn*/ 4 && input2.value !== /*userIn*/ ctx[2].password) {
    				set_input_value(input2, /*userIn*/ ctx[2].password);
    			}

    			const btn0_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				btn0_changes.$$scope = { dirty, ctx };
    			}

    			btn0.$set(btn0_changes);
    			const btn1_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				btn1_changes.$$scope = { dirty, ctx };
    			}

    			btn1.$set(btn1_changes);

    			if (!current || dirty & /*$url*/ 8 && a_href_value !== (a_href_value = /*$url*/ ctx[3]("/index"))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (/*signupSubmitted*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(btn0.$$.fragment, local);
    			transition_in(btn1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(btn0.$$.fragment, local);
    			transition_out(btn1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(btn0);
    			destroy_component(btn1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props, $$invalidate) {
    	let $goto;
    	let $url;
    	let $user;
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(11, $goto = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(3, $url = $$value));
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(4, $user = $$value));

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let signupPromise = Promise.resolve([]);
    	let signupSubmitted = false;
    	let userIn = { username: "", password: "", email: "" };

    	const handleSubmit = () => __awaiter(void 0, void 0, void 0, function* () {
    		let res = yield signupUser(userIn);
    		isLoggedIn.set(true);
    		$$invalidate(1, signupSubmitted = true);
    		$$invalidate(0, signupPromise = res);
    		alert("Signed up " + userIn.username + " successfully!");
    		$goto("/home");
    	});

    	const valUsername = () => {
    		
    	};

    	const valEmail = () => {
    		
    	};

    	const valPassword = () => {
    		
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Signup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Signup", $$slots, []);

    	function input0_input_handler() {
    		userIn.email = this.value;
    		$$invalidate(2, userIn);
    	}

    	function input1_input_handler() {
    		userIn.username = this.value;
    		$$invalidate(2, userIn);
    	}

    	function input2_input_handler() {
    		userIn.password = this.value;
    		$$invalidate(2, userIn);
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		Nav,
    		signupUser,
    		getUserById,
    		invoke: o,
    		promisified: a,
    		goto,
    		isActive,
    		url,
    		Btn,
    		user,
    		isLoggedIn,
    		signupPromise,
    		signupSubmitted,
    		userIn,
    		handleSubmit,
    		valUsername,
    		valEmail,
    		valPassword,
    		$goto,
    		$url,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("signupPromise" in $$props) $$invalidate(0, signupPromise = $$props.signupPromise);
    		if ("signupSubmitted" in $$props) $$invalidate(1, signupSubmitted = $$props.signupSubmitted);
    		if ("userIn" in $$props) $$invalidate(2, userIn = $$props.userIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		signupPromise,
    		signupSubmitted,
    		userIn,
    		$url,
    		$user,
    		handleSubmit,
    		valUsername,
    		valEmail,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Signup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Signup",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }

    /* src/pages/stats/index.svelte generated by Svelte v3.24.0 */
    const file$B = "src/pages/stats/index.svelte";

    function create_fragment$F(ctx) {
    	let nav;
    	let t0;
    	let h3;
    	let current;
    	nav = new Nav({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Stats";
    			add_location(h3, file$B, 3, 2, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h3, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stats> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stats", $$slots, []);
    	$$self.$capture_state = () => ({ Nav });
    	return [];
    }

    class Stats extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stats",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }

    //tree
    const _tree = {
      "name": "root",
      "filepath": "/",
      "root": true,
      "ownMeta": {},
      "absolutePath": "src/pages",
      "children": [
        {
          "isFile": true,
          "isDir": false,
          "file": "_fallback.svelte",
          "filepath": "/_fallback.svelte",
          "name": "_fallback",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/_fallback.svelte",
          "importPath": "../../../../src/pages/_fallback.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": true,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/_fallback",
          "id": "__fallback",
          "component": () => Fallback
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "_layout.svelte",
          "filepath": "/_layout.svelte",
          "name": "_layout",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/_layout.svelte",
          "importPath": "../../../../src/pages/_layout.svelte",
          "isLayout": true,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/",
          "id": "__layout",
          "component": () => Layout
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "dash",
          "filepath": "/dash",
          "name": "dash",
          "ext": "",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/dash",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "request.svelte",
              "filepath": "/dash/request.svelte",
              "name": "request",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/dash/request.svelte",
              "importPath": "../../../../src/pages/dash/request.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/dash/request",
              "id": "_dash_request",
              "component": () => Request
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/dash"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "dash.svelte",
          "filepath": "/dash.svelte",
          "name": "dash",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/dash.svelte",
          "importPath": "../../../../src/pages/dash.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/dash",
          "id": "_dash",
          "component": () => Dash
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "home",
          "filepath": "/home",
          "name": "home",
          "ext": "",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/home",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/home/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/home/index.svelte",
              "importPath": "../../../../src/pages/home/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/home/index",
              "id": "_home_index",
              "component": () => Home
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/home"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "index.svelte",
          "filepath": "/index.svelte",
          "name": "index",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/index.svelte",
          "importPath": "../../../../src/pages/index.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/index",
          "id": "_index",
          "component": () => Pages
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "item",
          "filepath": "/item",
          "name": "item",
          "ext": "",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/item",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/item/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/item/index.svelte",
              "importPath": "../../../../src/pages/item/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/item/index",
              "id": "_item_index",
              "component": () => Item
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "new.svelte",
              "filepath": "/item/new.svelte",
              "name": "new",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/item/new.svelte",
              "importPath": "../../../../src/pages/item/new.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/item/new",
              "id": "_item_new",
              "component": () => New
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/item"
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "prefs",
          "filepath": "/prefs",
          "name": "prefs",
          "ext": "",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/prefs",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/prefs/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/prefs/index.svelte",
              "importPath": "../../../../src/pages/prefs/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/prefs/index",
              "id": "_prefs_index",
              "component": () => Prefs
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/prefs"
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "profile",
          "filepath": "/profile",
          "name": "profile",
          "ext": "",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/profile",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/profile/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/profile/index.svelte",
              "importPath": "../../../../src/pages/profile/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/profile/index",
              "id": "_profile_index",
              "component": () => Profile
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/profile"
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "rec",
          "filepath": "/rec",
          "name": "rec",
          "ext": "",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/rec",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/rec/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/rec/index.svelte",
              "importPath": "../../../../src/pages/rec/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/rec/index",
              "id": "_rec_index",
              "component": () => Rec
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "new.svelte",
              "filepath": "/rec/new.svelte",
              "name": "new",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/rec/new.svelte",
              "importPath": "../../../../src/pages/rec/new.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/rec/new",
              "id": "_rec_new",
              "component": () => New$1
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/rec"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "search.svelte",
          "filepath": "/search.svelte",
          "name": "search",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/search.svelte",
          "importPath": "../../../../src/pages/search.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/search",
          "id": "_search",
          "component": () => Search
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "signup.svelte",
          "filepath": "/signup.svelte",
          "name": "signup",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/signup.svelte",
          "importPath": "../../../../src/pages/signup.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/signup",
          "id": "_signup",
          "component": () => Signup
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "stats",
          "filepath": "/stats",
          "name": "stats",
          "ext": "",
          "badExt": false,
          "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/stats",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/stats/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/home/chrisp/lab/dv/ui/src/pages/stats/index.svelte",
              "importPath": "../../../../src/pages/stats/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/stats/index",
              "id": "_stats_index",
              "component": () => Stats
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/stats"
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/"
    };


    const {tree, routes: routes$1} = buildClientTree(_tree);

    /* src/App.svelte generated by Svelte v3.24.0 */

    function create_fragment$G(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes: routes$1 }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
    	n$2("store-js", "js-payload");

    	a$1("store-rs", () => {
    		return "js-payload";
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Router, routes: routes$1, emit: n$2, listen: a$1 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$G.name
    		});
    	}
    }

    //import { greet } from '../wasm/pkg/wasm.js';
    //TODO install wasm rollup plugin
    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
