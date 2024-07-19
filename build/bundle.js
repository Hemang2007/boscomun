
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function comment(content) {
        return document.createComment(content);
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
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
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
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
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
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
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
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
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
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
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
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
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
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
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
                if (!info.hasCatch) {
                    throw error;
                }
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
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
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
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
            ctx: [],
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
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
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
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

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;

    const canUseDOM = () =>
        typeof window !== "undefined" &&
        "document" in window &&
        "location" in window;

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (42:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
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
    				} else {
    					if_block.p(ctx, dirty);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(42:0) {#if $activeRoute && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(51:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if component}
    function create_if_block_1(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

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
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(43:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    // (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

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
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
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
    		id: create_then_block.name,
    		type: "then",
    		source: "(44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		canUseDOM,
    		path,
    		component,
    		routeParams,
    		routeProps,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		route,
    		$activeRoute
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($activeRoute && $activeRoute.route === route) {
    			$$invalidate(2, routeParams = $activeRoute.params);
    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}

    			canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { path: 6, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
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
                if (subscribers.size === 0 && stop) {
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
            let started = false;
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
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false, preserveScroll = false, blurActiveElement = true } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH", preserveScroll })
                );
                if(blurActiveElement) document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(
        canUseDOM() ? window : createMemorySource()
    );
    const { navigate } = globalHistory;

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$i = "node_modules\\svelte-routing\\src\\Router.svelte";

    const get_default_slot_changes_1 = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context_1 = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    const get_default_slot_changes = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    // (143:0) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(143:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:0) {#if viewtransition}
    function create_if_block$1(ctx) {
    	let previous_key = /*$location*/ ctx[1].pathname;
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$location*/ 2 && safe_not_equal(previous_key, previous_key = /*$location*/ ctx[1].pathname)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(134:0) {#if viewtransition}",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#key $location.pathname}
    function create_key_block(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$i, 135, 8, 4659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, /*viewtransitionFn*/ ctx[3], {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*viewtransitionFn*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(135:4) {#key $location.pathname}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*viewtransition*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
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
    				} else {
    					if_block.p(ctx, dirty);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { viewtransition = null } = $$props;
    	let { history = globalHistory } = $$props;

    	const viewtransitionFn = (node, _, direction) => {
    		const vt = viewtransition(direction);
    		if (typeof vt?.fn === "function") return vt.fn(node, vt); else return vt;
    	};

    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(12, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(2, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(1, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	let preserveScroll = false;

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				$$invalidate(11, preserveScroll = event.preserveScroll || false);
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url', 'viewtransition', 'history'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		setContext,
    		derived,
    		writable,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		combinePaths,
    		pick,
    		basepath,
    		url,
    		viewtransition,
    		history,
    		viewtransitionFn,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		preserveScroll,
    		$location,
    		$routes,
    		$base,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$props.preserveScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 8192) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;
    				routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location, preserveScroll*/ 6146) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch ? { ...bestMatch, preserveScroll } : bestMatch);
    			}
    		}
    	};

    	return [
    		viewtransition,
    		$location,
    		$activeRoute,
    		viewtransitionFn,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		preserveScroll,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			basepath: 8,
    			url: 9,
    			viewtransition: 0,
    			history: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewtransition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewtransition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Index.svelte generated by Svelte v3.59.2 */
    const file$h = "src\\Index.svelte";

    // (239:4) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Welcome to BoscoMUN";
    			attr_dev(div, "class", "end-message svelte-u91e1k");
    			add_location(div, file$h, 239, 8, 6652);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(239:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (220:4) {#if !timerEnded}
    function create_if_block(ctx) {
    	let div12;
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t3;
    	let div5;
    	let div3;
    	let t4;
    	let t5;
    	let div4;
    	let t7;
    	let div8;
    	let div6;
    	let t8;
    	let t9;
    	let div7;
    	let t11;
    	let div11;
    	let div9;
    	let t12;
    	let t13;
    	let div10;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*days*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Days";
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t4 = text(/*hours*/ ctx[1]);
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "Hours";
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			t8 = text(/*minutes*/ ctx[2]);
    			t9 = space();
    			div7 = element("div");
    			div7.textContent = "Minutes";
    			t11 = space();
    			div11 = element("div");
    			div9 = element("div");
    			t12 = text(/*seconds*/ ctx[3]);
    			t13 = space();
    			div10 = element("div");
    			div10.textContent = "Seconds";
    			attr_dev(div0, "class", "value svelte-u91e1k");
    			add_location(div0, file$h, 222, 16, 6033);
    			attr_dev(div1, "class", "label svelte-u91e1k");
    			add_location(div1, file$h, 223, 16, 6082);
    			attr_dev(div2, "class", "time-section svelte-u91e1k");
    			add_location(div2, file$h, 221, 12, 5989);
    			attr_dev(div3, "class", "value svelte-u91e1k");
    			add_location(div3, file$h, 226, 16, 6189);
    			attr_dev(div4, "class", "label svelte-u91e1k");
    			add_location(div4, file$h, 227, 16, 6239);
    			attr_dev(div5, "class", "time-section svelte-u91e1k");
    			add_location(div5, file$h, 225, 12, 6145);
    			attr_dev(div6, "class", "value svelte-u91e1k");
    			add_location(div6, file$h, 230, 16, 6347);
    			attr_dev(div7, "class", "label svelte-u91e1k");
    			add_location(div7, file$h, 231, 16, 6399);
    			attr_dev(div8, "class", "time-section svelte-u91e1k");
    			add_location(div8, file$h, 229, 12, 6303);
    			attr_dev(div9, "class", "value svelte-u91e1k");
    			add_location(div9, file$h, 234, 16, 6509);
    			attr_dev(div10, "class", "label svelte-u91e1k");
    			add_location(div10, file$h, 235, 16, 6561);
    			attr_dev(div11, "class", "time-section svelte-u91e1k");
    			add_location(div11, file$h, 233, 12, 6465);
    			attr_dev(div12, "class", "timer svelte-u91e1k");
    			add_location(div12, file$h, 220, 8, 5956);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div12, t3);
    			append_dev(div12, div5);
    			append_dev(div5, div3);
    			append_dev(div3, t4);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div12, t7);
    			append_dev(div12, div8);
    			append_dev(div8, div6);
    			append_dev(div6, t8);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div12, t11);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, t12);
    			append_dev(div11, t13);
    			append_dev(div11, div10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*days*/ 1) set_data_dev(t0, /*days*/ ctx[0]);
    			if (dirty & /*hours*/ 2) set_data_dev(t4, /*hours*/ ctx[1]);
    			if (dirty & /*minutes*/ 4) set_data_dev(t8, /*minutes*/ ctx[2]);
    			if (dirty & /*seconds*/ 8) set_data_dev(t12, /*seconds*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(220:4) {#if !timerEnded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t2;
    	let t3;
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*timerEnded*/ ctx[4]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "CHAOS TO COHESION";
    			t2 = space();
    			if_block.c();
    			t3 = space();
    			button = element("button");
    			button.textContent = "Individual Registration";
    			if (!src_url_equal(img.src, img_src_value = "/munlogo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo");
    			attr_dev(img, "class", "logo svelte-u91e1k");
    			add_location(img, file$h, 217, 4, 5821);
    			attr_dev(div0, "class", "event-title svelte-u91e1k");
    			add_location(div0, file$h, 218, 4, 5875);
    			attr_dev(button, "class", "register-button svelte-u91e1k");
    			add_location(button, file$h, 241, 4, 6719);
    			attr_dev(div1, "class", "logo-container svelte-u91e1k");
    			add_location(div1, file$h, 216, 0, 5787);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			if_block.m(div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*goToRegistration*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t3);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Index', slots, []);
    	const targetDate = new Date('2024-08-08T00:00:00').getTime();
    	let days, hours, minutes, seconds, timerEnded = false;

    	const calculateTimeLeft = () => {
    		const now = new Date().getTime();
    		const difference = targetDate - now;

    		if (difference <= 0) {
    			$$invalidate(4, timerEnded = true);
    			return;
    		}

    		$$invalidate(0, days = Math.floor(difference / (1000 * 60 * 60 * 24)));
    		$$invalidate(1, hours = Math.floor(difference % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)));
    		$$invalidate(2, minutes = Math.floor(difference % (1000 * 60 * 60) / (1000 * 60)));
    		$$invalidate(3, seconds = Math.floor(difference % (1000 * 60) / 1000));
    		$$invalidate(1, hours = hours.toString().padStart(2, '0'));
    		$$invalidate(2, minutes = minutes.toString().padStart(2, '0'));
    		$$invalidate(3, seconds = seconds.toString().padStart(2, '0'));
    	};

    	const startTimer = () => {
    		setInterval(
    			() => {
    				calculateTimeLeft();
    			},
    			1000
    		);
    	};

    	onMount(() => {
    		calculateTimeLeft();
    		startTimer();
    	});

    	const goToRegistration = () => {
    		navigate('/IndividualRegistration');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		navigate,
    		targetDate,
    		days,
    		hours,
    		minutes,
    		seconds,
    		timerEnded,
    		calculateTimeLeft,
    		startTimer,
    		goToRegistration
    	});

    	$$self.$inject_state = $$props => {
    		if ('days' in $$props) $$invalidate(0, days = $$props.days);
    		if ('hours' in $$props) $$invalidate(1, hours = $$props.hours);
    		if ('minutes' in $$props) $$invalidate(2, minutes = $$props.minutes);
    		if ('seconds' in $$props) $$invalidate(3, seconds = $$props.seconds);
    		if ('timerEnded' in $$props) $$invalidate(4, timerEnded = $$props.timerEnded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [days, hours, minutes, seconds, timerEnded, goToRegistration];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\AboutBoscoMUN.svelte generated by Svelte v3.59.2 */
    const file$g = "src\\AboutBoscoMUN.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (18:4) {#each textContent.split('\n') as paragraph}
    function create_each_block$4(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1ymtnlr");
    			add_location(p, file$g, 18, 6, 1903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(18:4) {#each textContent.split('\\n') as paragraph}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let h1;
    	let t1;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_intro;
    	let t2;
    	let div1;
    	let each_value = /*textContent*/ ctx[1].split('\n');
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Bosco Model United Nations";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "heading svelte-1ymtnlr");
    			add_location(h1, file$g, 11, 0, 1600);
    			if (!src_url_equal(img.src, img_src_value = /*imageUrl*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Bosco MUN");
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "class", "svelte-1ymtnlr");
    			add_location(img, file$g, 14, 4, 1715);
    			attr_dev(div0, "class", "image-container svelte-1ymtnlr");
    			add_location(div0, file$g, 13, 2, 1680);
    			attr_dev(div1, "class", "text-container svelte-1ymtnlr");
    			add_location(div1, file$g, 16, 2, 1817);
    			attr_dev(div2, "class", "container svelte-1ymtnlr");
    			add_location(div2, file$g, 12, 0, 1653);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textContent*/ 2) {
    				each_value = /*textContent*/ ctx[1].split('\n');
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, fly, { x: 200, duration: 3000 });
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AboutBoscoMUN', slots, []);
    	let imageUrl = '/DBPC.jpg';

    	let textContent = `From Joseph Stalin's Cabinet where the Kremlin find itself in the midst of the Winter War to the United Nations Security Council aiming to mediate the cataclysm in Georgia, every moment at Bosco MUN 2024 guarantees intense debates, manipulative negotiations, impeccable diplomacy, and the never-ending struggle for peace and power in this world. This time BOSCO MUN has it all and it's bigger than ever.

From the universe standing on the brink of another World War to a crisis that sends tremors across all southeast nations, it is that time when the fate of the world rests in the hands of the delegates at Bosco MUN 2024, where each committee will address crucial concerns that shall determine the fate of generations to come. There is no margin for error. There is no time to rest.  Delegates must collaborate, deliberate, and negotiate to tame the crises at hand. This symposium promises profound insights into international diplomacy, underscoring the pivotal role of collective action in navigating our world’s most pressing issues to provide the delegates with a real-time world experience of what it takes to actually delve and involve oneself in the world of international politics and diplomacy and to feel what it is to have an actual impact in the world. 

Join us at the 9th edition of Bosco MUN: From Chaos to Cohesion: A Global Pursuit of the 20th Century and Beyond,  where diplomacy meets innovation and young leaders forge solutions for a better world.
`;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AboutBoscoMUN> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, textContent });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('textContent' in $$props) $$invalidate(1, textContent = $$props.textContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, textContent];
    }

    class AboutBoscoMUN extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutBoscoMUN",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\SecGenMessage.svelte generated by Svelte v3.59.2 */
    const file$f = "src\\SecGenMessage.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (31:4) {#each textContent.split('\n') as paragraph}
    function create_each_block$3(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1ymtnlr");
    			add_location(p, file$f, 31, 6, 2438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(31:4) {#each textContent.split('\\n') as paragraph}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let h1;
    	let t1;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_intro;
    	let t2;
    	let div1;
    	let each_value = /*textContent*/ ctx[1].split('\n');
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Secretary General's Message";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "heading svelte-1ymtnlr");
    			add_location(h1, file$f, 24, 0, 2136);
    			if (!src_url_equal(img.src, img_src_value = /*imageUrl*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Devansh");
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "class", "svelte-1ymtnlr");
    			add_location(img, file$f, 27, 4, 2252);
    			attr_dev(div0, "class", "image-container svelte-1ymtnlr");
    			add_location(div0, file$f, 26, 2, 2217);
    			attr_dev(div1, "class", "text-container svelte-1ymtnlr");
    			add_location(div1, file$f, 29, 2, 2352);
    			attr_dev(div2, "class", "container svelte-1ymtnlr");
    			add_location(div2, file$f, 25, 0, 2190);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textContent*/ 2) {
    				each_value = /*textContent*/ ctx[1].split('\n');
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, fly, { x: 200, duration: 3000 });
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SecGenMessage', slots, []);
    	let imageUrl = '/devansh.jpg';

    	let textContent = `Greetings delegates and Faculty Advisors,

Welcome to the 9th edition of Bosco Model United Nations. Today, as we gather under the theme "From Chaos to Cohesion: A Global Pursuit of the 20th Century and Beyond," we celebrate the diverse participation of schools from both within and outside the city of Kolkata. This remarkable assembly underscores our shared commitment to understanding and addressing the complexities of our world.

From the depths of adversity, humanity has emerged stronger, continually adapting and transforming to meet an array of political, social, and economic challenges.

As the future leaders of our world, the best test of your abilities and ethics will be to step into the shoes of the great statesmen and diplomats of the past. In doing so, you will address the precarious situations they once faced and understand the complex tapestry of history. The committees you will participate in mirror significant historical and contemporary issues that demand thoughtful deliberation and decisive action.

The challenges we face today are indeed daunting. Economic disparities persist, political divisions breed hostility, and personal ambitions often undermine global cooperation. Yet, as President John F. Kennedy aptly said,“Great crises produce great men and great deeds of courage.” It is in the crucible of such crises that true leaders prevail, leaving their indelible marks on history, remembered as those who stood tall and believed in the face of Adversity.

At Bosco MUN, we aspire to inspire you to extend your engagement beyond the committee rooms. Let this conference be a catalyst for change, igniting your passion to make a tangible impact on the world. We have unwavering faith in your ability to rise above challenges and contribute to the reawakening of a world that thrives on cooperation, compassion, and justice.Together, let us transform chaos into cohesion.


Regards,
Devansh Agarwal,
Secretary General,
The Ninth Secretariat,
BOSCO MUN 2024.
`;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SecGenMessage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, textContent });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('textContent' in $$props) $$invalidate(1, textContent = $$props.textContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, textContent];
    }

    class SecGenMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SecGenMessage",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\DepSecGenMessage.svelte generated by Svelte v3.59.2 */
    const file$e = "src\\DepSecGenMessage.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (62:6) {#each textContent1.split('\n') as paragraph}
    function create_each_block_1$1(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-lmhc9x");
    			add_location(p, file$e, 62, 8, 4719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(62:6) {#each textContent1.split('\\n') as paragraph}",
    		ctx
    	});

    	return block;
    }

    // (70:6) {#each textContent2.split('\n') as paragraph}
    function create_each_block$2(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-lmhc9x");
    			add_location(p, file$e, 70, 8, 4900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(70:6) {#each textContent2.split('\\n') as paragraph}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let h1;
    	let t1;
    	let div7;
    	let div4;
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let img0_intro;
    	let t2;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let img1_intro;
    	let t3;
    	let div3;
    	let t4;
    	let div6;
    	let div5;
    	let each_value_1 = /*textContent1*/ ctx[1].split('\n');
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*textContent2*/ ctx[3].split('\n');
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Deputy Secretary General's Message";
    			t1 = space();
    			div7 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t2 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t3 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div6 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "heading svelte-lmhc9x");
    			add_location(h1, file$e, 49, 0, 4180);
    			if (!src_url_equal(img0.src, img0_src_value = /*imageUrl1*/ ctx[0])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Amay");
    			attr_dev(img0, "loading", "lazy");
    			attr_dev(img0, "class", "svelte-lmhc9x");
    			add_location(img0, file$e, 54, 8, 4365);
    			attr_dev(div0, "class", "image-container svelte-lmhc9x");
    			add_location(div0, file$e, 53, 6, 4326);
    			if (!src_url_equal(img1.src, img1_src_value = /*imageUrl2*/ ctx[2])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Rohaan");
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "class", "svelte-lmhc9x");
    			add_location(img1, file$e, 57, 8, 4510);
    			attr_dev(div1, "class", "image-container svelte-lmhc9x");
    			add_location(div1, file$e, 56, 6, 4471);
    			attr_dev(div2, "class", "image-row svelte-lmhc9x");
    			add_location(div2, file$e, 52, 4, 4295);
    			attr_dev(div3, "class", "text-container svelte-lmhc9x");
    			add_location(div3, file$e, 60, 4, 4628);
    			attr_dev(div4, "class", "section svelte-lmhc9x");
    			add_location(div4, file$e, 51, 2, 4268);
    			attr_dev(div5, "class", "text-container svelte-lmhc9x");
    			add_location(div5, file$e, 68, 4, 4809);
    			attr_dev(div6, "class", "section svelte-lmhc9x");
    			add_location(div6, file$e, 67, 2, 4782);
    			attr_dev(div7, "class", "container svelte-lmhc9x");
    			add_location(div7, file$e, 50, 0, 4241);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, img1);
    			append_dev(div4, t3);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div3, null);
    				}
    			}

    			append_dev(div7, t4);
    			append_dev(div7, div6);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div5, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textContent1*/ 2) {
    				each_value_1 = /*textContent1*/ ctx[1].split('\n');
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*textContent2*/ 8) {
    				each_value = /*textContent2*/ ctx[3].split('\n');
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (!img0_intro) {
    				add_render_callback(() => {
    					img0_intro = create_in_transition(img0, fly, { x: 200, duration: 3000 });
    					img0_intro.start();
    				});
    			}

    			if (!img1_intro) {
    				add_render_callback(() => {
    					img1_intro = create_in_transition(img1, fly, { x: 200, duration: 3000 });
    					img1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DepSecGenMessage', slots, []);
    	let imageUrl1 = '/amay.jpg';

    	let textContent1 = `Greetings Delegates and Faculty Advisors,

It is with utmost honour that I, your Co- Deputy Secretary General , welcome you all to the Bosco MUN 2024.

As the times are changing, the face of today’s world keeps warping into a new identity every time it flips. Like a pack of flash cards, the world order keeps reshuffling in a never ending loop. Changes in power, new administrative policies, revolutionary research and experiments leading to uncomprehended revelations, all contribute to the dynamic matrix of our world.

The theme for this year's conference is ‘From Chaos to Cohesion’ and rightfully so, as it highlights the need to resolve the various conflicts which plague our society - both recent ones as well as those which have stretched across decades and centuries.

In front of us there lies an opportunity – an opportunity to transform , division into unity, and despair into hope. The very essence of our collective endeavour, rooted in the principles of peace, justice,empathy and democracy, beckons us to rise above our differences and forge a path towards a future ,closer to the divine utopia we all dreamt of.

In Bosco MUN you all shall be given a variety of issues from across the timeline. Ranging from the UNSC agenda of Georgia to the AIPPM tackling the communal problems of India and the Stalin's Cabinet during the Cold War, each committee tests your logical quotient, knowledge, verbal prowess and ability to rise to the occasion.

Infinite possibilities slay before you and it’s up to you to choose the best one to navigate. We shall strive to create the best platform for ground breaking debates and intense competition and ensure that all take back lifelong learnings in the journey from chaos to confusion.

Regards,
Amay Rathore,
Co-Deputy Secretary General,
The Ninth Secretariat,
BOSCO MUN 2024.

`;

    	let imageUrl2 = '/rohaan.jpg';

    	let textContent2 = `Greetings Delegates,

I would like to start off with one of my favourite quotations by Oskar Schindler “Power - is when we have every justification to kill, and we don't!”

As we embark on this journey together in BOSCO MUN 2024, it is an honour to be your Co. Deputy Secretary General. Moments of unity and progress are often preceded by periods of turmoil and confusion. ⁤⁤ New peace frameworks emerge from the ashes of conflict; in the depths of disorder we find the seeds of innovation and collaboration. Human development and social growth is driven by this continuous dance of chaos and coherence.

Consider the aftermath of World War II, a time when the world was consumed by an extraordinary destruction and despair. The United Nations, an institution founded on the principles of mutual security and transnational cooperation, was born out of that chaos. The devastation of war catalysed a global commitment to prevent such horrors from ever happening again, and thus the wheels of history turned toward a more unified and united world order. But the path between chaos and cohesion is seldom clear. It's about vision, flexibility and a firm conviction that there is an improved future ahead of us.

Your job is not just to discuss politics, but to build connections, build understanding and lay the foundation for a more united world. Remember that Incremental progress is frequently the catalyst for Massive change. Every resolution adopted, every compromise reached and every dialogue started is a step towards cohesion. 

Although the impact of your action may seem insignificant, it contributes to a more complete knowledge of history.  Let the lessons of the past and the possibilities of the future guide us as we contemplate the days ahead. We don't have to accept chaos as an obstacle, but as a catalyst for unity. We'll be able to turn disorder into order, division into unity, and conflict into peace together.

⁤ Finally, the main question remains. ⁤⁤ Can you bring coherence to this world of chaos? ⁤

Warm regards,
Rohaan Chakraborty,
Co-Deputy Secretary General,
The Ninth Secretariat
BOSCO MUN 2024

`;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DepSecGenMessage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fly,
    		imageUrl1,
    		textContent1,
    		imageUrl2,
    		textContent2
    	});

    	$$self.$inject_state = $$props => {
    		if ('imageUrl1' in $$props) $$invalidate(0, imageUrl1 = $$props.imageUrl1);
    		if ('textContent1' in $$props) $$invalidate(1, textContent1 = $$props.textContent1);
    		if ('imageUrl2' in $$props) $$invalidate(2, imageUrl2 = $$props.imageUrl2);
    		if ('textContent2' in $$props) $$invalidate(3, textContent2 = $$props.textContent2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl1, textContent1, imageUrl2, textContent2];
    }

    class DepSecGenMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DepSecGenMessage",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\PrincipalAddress.svelte generated by Svelte v3.59.2 */
    const file$d = "src\\PrincipalAddress.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (19:6) {#each textContent.split('\n') as paragraph}
    function create_each_block$1(ctx) {
    	let p;
    	let t_value = /*paragraph*/ ctx[2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1k1xkov");
    			add_location(p, file$d, 19, 8, 1406);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:6) {#each textContent.split('\\n') as paragraph}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let h1;
    	let t1;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_intro;
    	let t2;
    	let div1;
    	let each_value = /*textContent*/ ctx[1].split('\n');
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Rector Principal's Address";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "heading svelte-1k1xkov");
    			add_location(h1, file$d, 12, 2, 1089);
    			if (!src_url_equal(img.src, img_src_value = /*imageUrl*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Principal");
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "class", "svelte-1k1xkov");
    			add_location(img, file$d, 15, 6, 1210);
    			attr_dev(div0, "class", "image-container svelte-1k1xkov");
    			add_location(div0, file$d, 14, 4, 1173);
    			attr_dev(div1, "class", "text-container svelte-1k1xkov");
    			add_location(div1, file$d, 17, 4, 1316);
    			attr_dev(div2, "class", "container svelte-1k1xkov");
    			add_location(div2, file$d, 13, 2, 1144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textContent*/ 2) {
    				each_value = /*textContent*/ ctx[1].split('\n');
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, fly, { x: 200, duration: 3000 });
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PrincipalAddress', slots, []);
    	let imageUrl = '/principal.jpg';

    	let textContent = `The last century, precisely speaking from 1924 to 2024 was a highly transformative period in human history characterized by unprecedented technological, political, social and economic advancements. Just to name a few of the significant broad areas have been Wars and Conflicts, Political Movements, Technological Revolution, Social Progress, Economic Shifts and Medical Advancements. Covering these broad areas of human existence, the students & teachers of DBPC this year are organizing the 8th edition of BOSCO MUN 2024, on 8th and 9th of August.

So it's my privilege to welcome all of you to this year's Conference based on the theme "From Chaos to Cohesion: A global pursuit of the 20th century and beyond". I wish everyone involved in the Bosco Mun-2024 a very refreshing and enlightening experience of team work, diplomacy and a new found energy to forge ahead to face the new challenges of the present day world.
Jai Hind

Principal
  `;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PrincipalAddress> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, textContent });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('textContent' in $$props) $$invalidate(1, textContent = $$props.textContent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, textContent];
    }

    class PrincipalAddress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PrincipalAddress",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\UNSC.svelte generated by Svelte v3.59.2 */
    const file$c = "src\\UNSC.svelte";

    function create_fragment$c(ctx) {
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let img1_intro;
    	let t2;
    	let div1;
    	let p0;
    	let strong0;
    	let t4;
    	let t5;
    	let p1;
    	let strong1;
    	let t7;
    	let t8;
    	let p2;
    	let strong2;
    	let t10;
    	let t11;
    	let p3;
    	let strong3;
    	let t13;
    	let t14;
    	let br0;
    	let t15;
    	let p4;
    	let strong4;
    	let t17;
    	let p5;
    	let t19;
    	let p6;
    	let t21;
    	let p7;
    	let br1;
    	let t23;
    	let p8;
    	let strong5;
    	let t25;
    	let br2;
    	let t26;
    	let p9;
    	let strong6;
    	let t28;
    	let p10;
    	let t30;
    	let p11;
    	let t32;
    	let p12;
    	let t34;
    	let p13;
    	let t36;
    	let p14;
    	let t38;
    	let p15;
    	let t40;
    	let p16;
    	let t42;
    	let p17;
    	let t44;
    	let p18;
    	let t46;
    	let p19;
    	let t47;
    	let br3;
    	let t48;
    	let br4;
    	let t49;
    	let br5;
    	let t50;
    	let br6;
    	let t51;
    	let br7;
    	let t52;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = text("\r\n  United Nations Security Council");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Chairperson:";
    			t4 = text(" Devansh Agarwal");
    			t5 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Vice Chairperson:";
    			t7 = text(" Aryaman Saraogi");
    			t8 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Director:";
    			t10 = text(" Shubham Sethia");
    			t11 = space();
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Rapporteur:";
    			t13 = text(" Harshvardhan Saraf");
    			t14 = space();
    			br0 = element("br");
    			t15 = space();
    			p4 = element("p");
    			strong4 = element("strong");
    			strong4.textContent = "About the Committee-";
    			t17 = space();
    			p5 = element("p");
    			p5.textContent = "The revered halls of the Security Council see yet another crisis unfold inside their walls with the audacious intervention of Russia in the region of Georgia which has shaken the balance of the world. This pressing situation has compelled the United Nations Security Council to establish itself yet again as the epitome of political conferences and the front for geo-political negotiations.";
    			t19 = space();
    			p6 = element("p");
    			p6.textContent = "Delegates of the United Nations Security Council will have to carry on the legacy of their predecessors through tactful diplomatic actions, intense deliberation, debonair arguments, and discreet alliances to decide the fate of not only a singular nation but, the world. The delegates will be emulating diplomats of the past and with the eyes of the world upon them, they will have to find the route to resolution and global peace whilst navigating the multifaceted dynamism of geo-politics.";
    			t21 = space();
    			p7 = element("p");
    			p7.textContent = "Be a witness to surreptitious maneuvers, intricacies of politics, alliances, power struggles, heated arguments, and subtle persuasion between power blocs. Will the Security Council live up to its name or will the planet be thrown into chaos?\r\n    ";
    			br1 = element("br");
    			t23 = space();
    			p8 = element("p");
    			strong5 = element("strong");
    			strong5.textContent = "Agenda- Situation in Georgia, 2008";
    			t25 = space();
    			br2 = element("br");
    			t26 = space();
    			p9 = element("p");
    			strong6 = element("strong");
    			strong6.textContent = "Chairperson's Address-";
    			t28 = space();
    			p10 = element("p");
    			p10.textContent = "In the corridors of power where global peace and security are constantly negotiated, we gather today to delve into one of the most pivotal moments of recent history: the situation in Georgia, 2008. This committee calls upon you to step into the shoes of world leaders, navigating the intricate balance of power, sovereignty, and human rights.";
    			t30 = space();
    			p11 = element("p");
    			p11.textContent = "The conflict in Georgia serves as a stark reminder of the fragile nature of peace and the enduring complexities of territorial disputes. As delegates, you are tasked with unraveling the threads of diplomacy and conflict, understanding the diverse perspectives that fuel international tensions. Your decisions here will echo the sentiments of countless individuals whose lives are profoundly affected by these geopolitical struggles.";
    			t32 = space();
    			p12 = element("p");
    			p12.textContent = "The freeze date for this committee is 8th August, 2008. According to the freeze date, the time during which the committee will be meeting is at 1.15 a.m.";
    			t34 = space();
    			p13 = element("p");
    			p13.textContent = "The committee will be assisted by the Rapporteur, Harshvardhan Saraf. He is a 10th grader, with keen interest in MUNs, debates and global politics. He is the school asst. Prefect and the sheer resemblance between him and an ant is unreal.";
    			t36 = space();
    			p14 = element("p");
    			p14.textContent = "Shubham Sethia, an eleventh grader will be serving as the Director of the committee. He is one of the most approachable EB members. He might look calm on the outside, but can surely prove his worth when you hand him a mic and put him on a debate floor.";
    			t38 = space();
    			p15 = element("p");
    			p15.textContent = "The Vice Chairperson for the Committee shall be Aryaman Saraogi. This is a name which can be found everywhere; he surely represents the true meaning of “diversity”. He is the school Francis house Vice Captain, he also served as the ED for Bosco Empresarios, 2024. Aryaman although may look to be very friendly, be rest assured that he is sure to destroy a delegate with his rebuttals.";
    			t40 = space();
    			p16 = element("p");
    			p16.textContent = "I, Devansh Agarwal, the School Prefect shall be serving as the Secretary General for this edition of Bosco MUN and the Chairperson for this committee.";
    			t42 = space();
    			p17 = element("p");
    			p17.textContent = "The study guide aims to provide some background information on the issues at hand. It aims to introduce you to the historical background, main occurrences, and various standpoints on these issues. The study guide provides you with the foundation research and for one to excel in committee, your personal research becomes essential and imperative. The study guide is provided just to serve as the base for research and it should not be your final research. This committee is bound to be dynamic and fast paced, requiring you to take quick and accurate decisions. Your speeches, points, paperwork all shall hold key to your overall success.";
    			t44 = space();
    			p18 = element("p");
    			p18.textContent = "Remember, as you engage in these discussions, that the essence of the United Nations lies in fostering cooperation and ensuring peace. Let your deliberations be guided by the principles of justice, equity, and human dignity. May your debates be spirited, your resolutions just, and your efforts lead to a deeper understanding of the path to peace. Welcome to the United Nations Security Council at Bosco MUN 2024.";
    			t46 = space();
    			p19 = element("p");
    			t47 = text("Regards,");
    			br3 = element("br");
    			t48 = text("\r\n    Devansh Agarwal,");
    			br4 = element("br");
    			t49 = text("\r\n    Secretary General,");
    			br5 = element("br");
    			t50 = text("\r\n    Chairperson of United Nations Security Council,");
    			br6 = element("br");
    			t51 = text("\r\n    The Ninth Secretariat,");
    			br7 = element("br");
    			t52 = text("\r\n    Bosco MUN 2024");
    			if (!src_url_equal(img0.src, img0_src_value = /*logoUrl*/ ctx[1])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Logo");
    			attr_dev(img0, "class", "logo svelte-4i2gqz");
    			attr_dev(img0, "loading", "lazy");
    			add_location(img0, file$c, 7, 2, 158);
    			attr_dev(h1, "class", "heading svelte-4i2gqz");
    			add_location(h1, file$c, 6, 0, 134);
    			if (!src_url_equal(img1.src, img1_src_value = /*imageUrl*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "UNSC");
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "class", "svelte-4i2gqz");
    			add_location(img1, file$c, 11, 4, 321);
    			attr_dev(div0, "class", "image-container svelte-4i2gqz");
    			add_location(div0, file$c, 10, 2, 286);
    			attr_dev(strong0, "class", "highlight svelte-4i2gqz");
    			add_location(strong0, file$c, 14, 7, 455);
    			attr_dev(p0, "class", "svelte-4i2gqz");
    			add_location(p0, file$c, 14, 4, 452);
    			attr_dev(strong1, "class", "highlight svelte-4i2gqz");
    			add_location(strong1, file$c, 15, 7, 531);
    			attr_dev(p1, "class", "svelte-4i2gqz");
    			add_location(p1, file$c, 15, 4, 528);
    			attr_dev(strong2, "class", "highlight svelte-4i2gqz");
    			add_location(strong2, file$c, 16, 7, 612);
    			attr_dev(p2, "class", "svelte-4i2gqz");
    			add_location(p2, file$c, 16, 4, 609);
    			attr_dev(strong3, "class", "highlight svelte-4i2gqz");
    			add_location(strong3, file$c, 17, 7, 684);
    			attr_dev(p3, "class", "svelte-4i2gqz");
    			add_location(p3, file$c, 17, 4, 681);
    			add_location(br0, file$c, 18, 4, 759);
    			attr_dev(strong4, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong4, file$c, 19, 31, 796);
    			attr_dev(p4, "class", "address-section svelte-4i2gqz");
    			add_location(p4, file$c, 19, 4, 769);
    			attr_dev(p5, "class", "svelte-4i2gqz");
    			add_location(p5, file$c, 20, 4, 871);
    			attr_dev(p6, "class", "svelte-4i2gqz");
    			add_location(p6, file$c, 21, 4, 1278);
    			attr_dev(p7, "class", "svelte-4i2gqz");
    			add_location(p7, file$c, 23, 4, 1788);
    			add_location(br1, file$c, 24, 8, 2042);
    			attr_dev(strong5, "class", "highlight svelte-4i2gqz");
    			add_location(strong5, file$c, 25, 7, 2055);
    			attr_dev(p8, "class", "svelte-4i2gqz");
    			add_location(p8, file$c, 25, 4, 2052);
    			add_location(br2, file$c, 26, 4, 2135);
    			attr_dev(strong6, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong6, file$c, 27, 31, 2172);
    			attr_dev(p9, "class", "address-section svelte-4i2gqz");
    			add_location(p9, file$c, 27, 4, 2145);
    			attr_dev(p10, "class", "svelte-4i2gqz");
    			add_location(p10, file$c, 28, 4, 2249);
    			attr_dev(p11, "class", "svelte-4i2gqz");
    			add_location(p11, file$c, 29, 4, 2604);
    			attr_dev(p12, "class", "svelte-4i2gqz");
    			add_location(p12, file$c, 30, 4, 3049);
    			attr_dev(p13, "class", "svelte-4i2gqz");
    			add_location(p13, file$c, 31, 4, 3215);
    			attr_dev(p14, "class", "svelte-4i2gqz");
    			add_location(p14, file$c, 32, 4, 3466);
    			attr_dev(p15, "class", "svelte-4i2gqz");
    			add_location(p15, file$c, 33, 4, 3731);
    			attr_dev(p16, "class", "svelte-4i2gqz");
    			add_location(p16, file$c, 34, 4, 4128);
    			attr_dev(p17, "class", "svelte-4i2gqz");
    			add_location(p17, file$c, 35, 4, 4291);
    			attr_dev(p18, "class", "svelte-4i2gqz");
    			add_location(p18, file$c, 36, 4, 4942);
    			add_location(br3, file$c, 37, 15, 5379);
    			add_location(br4, file$c, 38, 20, 5405);
    			add_location(br5, file$c, 39, 22, 5433);
    			add_location(br6, file$c, 40, 51, 5490);
    			add_location(br7, file$c, 41, 26, 5522);
    			attr_dev(p19, "class", "svelte-4i2gqz");
    			add_location(p19, file$c, 37, 4, 5368);
    			attr_dev(div1, "class", "text-container svelte-4i2gqz");
    			add_location(div1, file$c, 13, 2, 418);
    			attr_dev(div2, "class", "container svelte-4i2gqz");
    			add_location(div2, file$c, 9, 0, 259);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, img0);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t10);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(p3, strong3);
    			append_dev(p3, t13);
    			append_dev(div1, t14);
    			append_dev(div1, br0);
    			append_dev(div1, t15);
    			append_dev(div1, p4);
    			append_dev(p4, strong4);
    			append_dev(div1, t17);
    			append_dev(div1, p5);
    			append_dev(div1, t19);
    			append_dev(div1, p6);
    			append_dev(div1, t21);
    			append_dev(div1, p7);
    			append_dev(div1, br1);
    			append_dev(div1, t23);
    			append_dev(div1, p8);
    			append_dev(p8, strong5);
    			append_dev(div1, t25);
    			append_dev(div1, br2);
    			append_dev(div1, t26);
    			append_dev(div1, p9);
    			append_dev(p9, strong6);
    			append_dev(div1, t28);
    			append_dev(div1, p10);
    			append_dev(div1, t30);
    			append_dev(div1, p11);
    			append_dev(div1, t32);
    			append_dev(div1, p12);
    			append_dev(div1, t34);
    			append_dev(div1, p13);
    			append_dev(div1, t36);
    			append_dev(div1, p14);
    			append_dev(div1, t38);
    			append_dev(div1, p15);
    			append_dev(div1, t40);
    			append_dev(div1, p16);
    			append_dev(div1, t42);
    			append_dev(div1, p17);
    			append_dev(div1, t44);
    			append_dev(div1, p18);
    			append_dev(div1, t46);
    			append_dev(div1, p19);
    			append_dev(p19, t47);
    			append_dev(p19, br3);
    			append_dev(p19, t48);
    			append_dev(p19, br4);
    			append_dev(p19, t49);
    			append_dev(p19, br5);
    			append_dev(p19, t50);
    			append_dev(p19, br6);
    			append_dev(p19, t51);
    			append_dev(p19, br7);
    			append_dev(p19, t52);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!img1_intro) {
    				add_render_callback(() => {
    					img1_intro = create_in_transition(img1, fly, { x: 200, duration: 3000 });
    					img1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UNSC', slots, []);
    	let imageUrl = '/UNSCEB.jpg';
    	let logoUrl = '/UNSCLOGO.png';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UNSC> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, logoUrl });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('logoUrl' in $$props) $$invalidate(1, logoUrl = $$props.logoUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, logoUrl];
    }

    class UNSC extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UNSC",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\AIPPM.svelte generated by Svelte v3.59.2 */
    const file$b = "src\\AIPPM.svelte";

    function create_fragment$b(ctx) {
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let img1_intro;
    	let t2;
    	let div1;
    	let p0;
    	let strong0;
    	let t4;
    	let t5;
    	let p1;
    	let strong1;
    	let t7;
    	let t8;
    	let p2;
    	let strong2;
    	let t10;
    	let t11;
    	let p3;
    	let strong3;
    	let t13;
    	let t14;
    	let br0;
    	let t15;
    	let p4;
    	let strong4;
    	let t17;
    	let p5;
    	let t19;
    	let p6;
    	let t21;
    	let p7;
    	let t23;
    	let p8;
    	let br1;
    	let t25;
    	let p9;
    	let strong5;
    	let t27;
    	let br2;
    	let t28;
    	let p10;
    	let strong6;
    	let t30;
    	let p11;
    	let t32;
    	let p12;
    	let t34;
    	let p13;
    	let t36;
    	let p14;
    	let t38;
    	let p15;
    	let t40;
    	let p16;
    	let t42;
    	let p17;
    	let t44;
    	let p18;
    	let t46;
    	let p19;
    	let t48;
    	let p20;
    	let t50;
    	let p21;
    	let br3;
    	let t52;
    	let p22;
    	let t53;
    	let br4;
    	let t54;
    	let br5;
    	let t55;
    	let br6;
    	let t56;
    	let br7;
    	let t57;
    	let br8;
    	let t58;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = text("\r\n  All India Political Parties Meet");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Chairperson:";
    			t4 = text(" Amay Rathore");
    			t5 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Vice Chairperson:";
    			t7 = text(" Pranjal Tripathi");
    			t8 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Director:";
    			t10 = text(" Shaurya Khaitan");
    			t11 = space();
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Rapporteur:";
    			t13 = text(" Shreyas Garg");
    			t14 = space();
    			br0 = element("br");
    			t15 = space();
    			p4 = element("p");
    			strong4 = element("strong");
    			strong4.textContent = "About the Committee-";
    			t17 = space();
    			p5 = element("p");
    			p5.textContent = "Amidst the tumultuous winds of history, as communal tensions simmered beneath the surface, two cataclysmic events emerged to shape the destiny of a nation. As the echoes of the Babri Masjid demolition reverberated through the land and the devastating Bombay Blasts of 1993 followed in its wake, one cannot help but wonder: Did political maneuvering and covert alliances set the stage for these catastrophic incidents?";
    			t19 = space();
    			p6 = element("p");
    			p6.textContent = "From the problems posed by reservation to the conspiracies relating to the demolition prepare to delve into a complex web of intricate machinations where the future of India is hinged upon the delicate strategies of a select few.";
    			t21 = space();
    			p7 = element("p");
    			p7.textContent = "Emulating the intense deliberations of the All-India Political Parties Meet (AIPPM), the delegates are entrusted with representing prominent political leaders of that era, wielding immense power and influence.";
    			t23 = space();
    			p8 = element("p");
    			p8.textContent = "As the delegates engage in diplomatic arbitrations amidst the confines of these halls their expertise in the art of politics will be put to the test and with clashing political and religious ideologies, they will craft a path towards unity and peace or will navigate the vociferous and deceptive waters of political strategy.\r\n    ";
    			br1 = element("br");
    			t25 = space();
    			p9 = element("p");
    			strong5 = element("strong");
    			strong5.textContent = "Agenda- Addressing the civil and religious tensions in India, 1993";
    			t27 = space();
    			br2 = element("br");
    			t28 = space();
    			p10 = element("p");
    			strong6 = element("strong");
    			strong6.textContent = "Chairperson's Address-";
    			t30 = space();
    			p11 = element("p");
    			p11.textContent = "Greetings Delegates,";
    			t32 = space();
    			p12 = element("p");
    			p12.textContent = "It is with utmost honour that I welcome you to, what is perhaps bound to be the most dynamic committee in the 9th edition of Bosco Mun 2024- The All India Political Party Meet.";
    			t34 = space();
    			p13 = element("p");
    			p13.textContent = "The India of today sits on the throne of uncomprehended achievements and continues to progress in its path of becoming ‘the world power’ to be reckoned with.. This rich, diverse, colourful and bustling nation has emerged as a different version of itself in the 21st Century. The agenda of this committee aims to backtrack and look at the issues which India went through in the early 1990s, the bigger picture being the communal riots and the various series of unprecedented incidents which rocked an already weaker nation into the darkness of uncertainty. It was in this time that active and responsible leadership and unification became the need of the hour.";
    			t36 = space();
    			p14 = element("p");
    			p14.textContent = "The freeze date for this committee is 13th March, 1993.";
    			t38 = space();
    			p15 = element("p");
    			p15.textContent = "For this committee, the Executive Board along with me as the Chairperson, includes Pranjal Tripathi, the Vice Chairperson, Shaurya Khaitan as the director and Shreyas Garg as the Rapporteur. Shreyas, a 10th grader, is a budding MUNner holding great interest in Indian politics. Excellent in academics, with almost perfect scores in Physics and History, he aspires to become an IAS officer. Often labelled as the best junior by both his seniors and his peers, his dedication and keenness to take initiative is truly impeccable.";
    			t40 = space();
    			p16 = element("p");
    			p16.textContent = "Shaurya is an 11th grader who holds a deep interest in finance and stock. A topper of Maths and Economics,he also strives to make a name for himself in the MUN circuit. His research and stats often take everyone by surprise, unlike his sense of humour which is better not touched upon. Shaurya is very hardworking and he prefers to stay away from the limelight and work in the shadows.";
    			t42 = space();
    			p17 = element("p");
    			p17.textContent = "Pranjal is a 12th grade Humanities student and a connoisseur of History and Indian Politics. He has made a name for himself in MUNs as well as business fests across the circuit. He was part of the Board of Directors in Bosco Empresarios 2024. His first love is Liverpool and he will do anything to prove to you how important Mo Salah is to the team. He aims to crack the UPSC exams and holds a very keen interest when it comes to Law and the Constitution. With him as the vice chair, things are bound to be happening.";
    			t44 = space();
    			p18 = element("p");
    			p18.textContent = "Amay Rathore, the Chairperson of this committee and the Deputy Secretary General of Bosco MUN 2024 is also the School Bosco House Captain. A 12th grader Science student, Amay is a name which you will find everywhere. From School Fests to Debates to MUNs, Amay has done it all. Along with a serious addiction to Indian politics, he is also the tech guy of the batch and was the Tech Head of Bosco Fest 2024. Be rest assured, that Amay’s speaking skills and his aggressive nature will always keep the committee fast paced and unpredictable.";
    			t46 = space();
    			p19 = element("p");
    			p19.textContent = "The study guide aims to provide some background information on the issues at hand, focusing mainly on religious and civil strife in India in 1993 and the Babri Masjid demolition. It aims to introduce you to the historical background, main occurrences, and various standpoints on these issues.This study guide provides you with the foundation research and for one to excel in committee, your personal research becomes essential and imperative.";
    			t48 = space();
    			p20 = element("p");
    			p20.textContent = "This committee is bound to be dynamic and fast paced, requiring you to take quick and accurate decisions.Your speeches, points, paperwork all shall hold key to your overall success. If you have any further questions or concerns, please do not hesitate to contact the executive board through the following e-mail address- aippm.boscomun@gmail.com. We will be happy to help out with any queries that might arise.Looking forward to fruitful debate, groundbreaking decisions and a vibrant exchange of ideas. Research well and Good Luck for the Committee!";
    			t50 = space();
    			p21 = element("p");
    			p21.textContent = "Vande Mataram!";
    			br3 = element("br");
    			t52 = space();
    			p22 = element("p");
    			t53 = text("Regards,");
    			br4 = element("br");
    			t54 = text("\r\n    Amay Rathore");
    			br5 = element("br");
    			t55 = text("\r\n    Deputy Secretary General,");
    			br6 = element("br");
    			t56 = text("\r\n    Chairperson of All India Political Party Meet,");
    			br7 = element("br");
    			t57 = text("\r\n    The Ninth Secretariat,");
    			br8 = element("br");
    			t58 = text("\r\n    Bosco MUN 2024");
    			if (!src_url_equal(img0.src, img0_src_value = /*logoUrl*/ ctx[1])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Logo");
    			attr_dev(img0, "class", "logo svelte-4i2gqz");
    			attr_dev(img0, "loading", "lazy");
    			add_location(img0, file$b, 7, 2, 160);
    			attr_dev(h1, "class", "heading svelte-4i2gqz");
    			add_location(h1, file$b, 6, 0, 136);
    			if (!src_url_equal(img1.src, img1_src_value = /*imageUrl*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "AIPPM");
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "class", "svelte-4i2gqz");
    			add_location(img1, file$b, 11, 4, 324);
    			attr_dev(div0, "class", "image-container svelte-4i2gqz");
    			add_location(div0, file$b, 10, 2, 289);
    			attr_dev(strong0, "class", "highlight svelte-4i2gqz");
    			add_location(strong0, file$b, 14, 7, 459);
    			attr_dev(p0, "class", "svelte-4i2gqz");
    			add_location(p0, file$b, 14, 4, 456);
    			attr_dev(strong1, "class", "highlight svelte-4i2gqz");
    			add_location(strong1, file$b, 15, 7, 532);
    			attr_dev(p1, "class", "svelte-4i2gqz");
    			add_location(p1, file$b, 15, 4, 529);
    			attr_dev(strong2, "class", "highlight svelte-4i2gqz");
    			add_location(strong2, file$b, 16, 7, 614);
    			attr_dev(p2, "class", "svelte-4i2gqz");
    			add_location(p2, file$b, 16, 4, 611);
    			attr_dev(strong3, "class", "highlight svelte-4i2gqz");
    			add_location(strong3, file$b, 17, 7, 687);
    			attr_dev(p3, "class", "svelte-4i2gqz");
    			add_location(p3, file$b, 17, 4, 684);
    			add_location(br0, file$b, 18, 4, 756);
    			attr_dev(strong4, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong4, file$b, 19, 31, 793);
    			attr_dev(p4, "class", "address-section svelte-4i2gqz");
    			add_location(p4, file$b, 19, 4, 766);
    			attr_dev(p5, "class", "svelte-4i2gqz");
    			add_location(p5, file$b, 20, 4, 868);
    			attr_dev(p6, "class", "svelte-4i2gqz");
    			add_location(p6, file$b, 22, 4, 1304);
    			attr_dev(p7, "class", "svelte-4i2gqz");
    			add_location(p7, file$b, 24, 4, 1552);
    			attr_dev(p8, "class", "svelte-4i2gqz");
    			add_location(p8, file$b, 26, 4, 1780);
    			add_location(br1, file$b, 27, 8, 2118);
    			attr_dev(strong5, "class", "highlight svelte-4i2gqz");
    			add_location(strong5, file$b, 28, 7, 2131);
    			attr_dev(p9, "class", "svelte-4i2gqz");
    			add_location(p9, file$b, 28, 4, 2128);
    			add_location(br2, file$b, 29, 4, 2243);
    			attr_dev(strong6, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong6, file$b, 30, 31, 2280);
    			attr_dev(p10, "class", "address-section svelte-4i2gqz");
    			add_location(p10, file$b, 30, 4, 2253);
    			attr_dev(p11, "class", "svelte-4i2gqz");
    			add_location(p11, file$b, 31, 4, 2357);
    			attr_dev(p12, "class", "svelte-4i2gqz");
    			add_location(p12, file$b, 32, 6, 2392);
    			attr_dev(p13, "class", "svelte-4i2gqz");
    			add_location(p13, file$b, 33, 4, 2581);
    			attr_dev(p14, "class", "svelte-4i2gqz");
    			add_location(p14, file$b, 34, 4, 3257);
    			attr_dev(p15, "class", "svelte-4i2gqz");
    			add_location(p15, file$b, 35, 4, 3325);
    			attr_dev(p16, "class", "svelte-4i2gqz");
    			add_location(p16, file$b, 36, 4, 3868);
    			attr_dev(p17, "class", "svelte-4i2gqz");
    			add_location(p17, file$b, 38, 4, 4272);
    			attr_dev(p18, "class", "svelte-4i2gqz");
    			add_location(p18, file$b, 40, 4, 4809);
    			attr_dev(p19, "class", "svelte-4i2gqz");
    			add_location(p19, file$b, 42, 4, 5366);
    			attr_dev(p20, "class", "svelte-4i2gqz");
    			add_location(p20, file$b, 43, 4, 5822);
    			attr_dev(p21, "class", "svelte-4i2gqz");
    			add_location(p21, file$b, 45, 4, 6391);
    			add_location(br3, file$b, 45, 25, 6412);
    			add_location(br4, file$b, 46, 15, 6433);
    			add_location(br5, file$b, 47, 16, 6455);
    			add_location(br6, file$b, 48, 29, 6490);
    			add_location(br7, file$b, 49, 50, 6546);
    			add_location(br8, file$b, 50, 26, 6578);
    			attr_dev(p22, "class", "svelte-4i2gqz");
    			add_location(p22, file$b, 46, 4, 6422);
    			attr_dev(div1, "class", "text-container svelte-4i2gqz");
    			add_location(div1, file$b, 13, 2, 422);
    			attr_dev(div2, "class", "container svelte-4i2gqz");
    			add_location(div2, file$b, 9, 0, 262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, img0);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t10);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(p3, strong3);
    			append_dev(p3, t13);
    			append_dev(div1, t14);
    			append_dev(div1, br0);
    			append_dev(div1, t15);
    			append_dev(div1, p4);
    			append_dev(p4, strong4);
    			append_dev(div1, t17);
    			append_dev(div1, p5);
    			append_dev(div1, t19);
    			append_dev(div1, p6);
    			append_dev(div1, t21);
    			append_dev(div1, p7);
    			append_dev(div1, t23);
    			append_dev(div1, p8);
    			append_dev(div1, br1);
    			append_dev(div1, t25);
    			append_dev(div1, p9);
    			append_dev(p9, strong5);
    			append_dev(div1, t27);
    			append_dev(div1, br2);
    			append_dev(div1, t28);
    			append_dev(div1, p10);
    			append_dev(p10, strong6);
    			append_dev(div1, t30);
    			append_dev(div1, p11);
    			append_dev(div1, t32);
    			append_dev(div1, p12);
    			append_dev(div1, t34);
    			append_dev(div1, p13);
    			append_dev(div1, t36);
    			append_dev(div1, p14);
    			append_dev(div1, t38);
    			append_dev(div1, p15);
    			append_dev(div1, t40);
    			append_dev(div1, p16);
    			append_dev(div1, t42);
    			append_dev(div1, p17);
    			append_dev(div1, t44);
    			append_dev(div1, p18);
    			append_dev(div1, t46);
    			append_dev(div1, p19);
    			append_dev(div1, t48);
    			append_dev(div1, p20);
    			append_dev(div1, t50);
    			append_dev(div1, p21);
    			append_dev(div1, br3);
    			append_dev(div1, t52);
    			append_dev(div1, p22);
    			append_dev(p22, t53);
    			append_dev(p22, br4);
    			append_dev(p22, t54);
    			append_dev(p22, br5);
    			append_dev(p22, t55);
    			append_dev(p22, br6);
    			append_dev(p22, t56);
    			append_dev(p22, br7);
    			append_dev(p22, t57);
    			append_dev(p22, br8);
    			append_dev(p22, t58);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!img1_intro) {
    				add_render_callback(() => {
    					img1_intro = create_in_transition(img1, fly, { x: 200, duration: 3000 });
    					img1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AIPPM', slots, []);
    	let imageUrl = '/AIPPMEB.jpg';
    	let logoUrl = '/AIPPMLOGO.png';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AIPPM> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, logoUrl });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('logoUrl' in $$props) $$invalidate(1, logoUrl = $$props.logoUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, logoUrl];
    }

    class AIPPM extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AIPPM",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\JSC.svelte generated by Svelte v3.59.2 */
    const file$a = "src\\JSC.svelte";

    function create_fragment$a(ctx) {
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let img1_intro;
    	let t2;
    	let div1;
    	let p0;
    	let strong0;
    	let t4;
    	let t5;
    	let p1;
    	let strong1;
    	let t7;
    	let t8;
    	let p2;
    	let strong2;
    	let t10;
    	let t11;
    	let p3;
    	let strong3;
    	let t13;
    	let t14;
    	let br0;
    	let t15;
    	let p4;
    	let strong4;
    	let t17;
    	let p5;
    	let t19;
    	let p6;
    	let t21;
    	let p7;
    	let br1;
    	let t23;
    	let p8;
    	let strong5;
    	let t25;
    	let br2;
    	let t26;
    	let p9;
    	let strong6;
    	let t28;
    	let p10;
    	let t30;
    	let p11;
    	let t32;
    	let p12;
    	let t34;
    	let p13;
    	let t36;
    	let p14;
    	let t38;
    	let p15;
    	let t40;
    	let p16;
    	let t42;
    	let p17;
    	let t44;
    	let p18;
    	let t45;
    	let br3;
    	let t46;
    	let br4;
    	let t47;
    	let br5;
    	let t48;
    	let br6;
    	let t49;
    	let br7;
    	let t50;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = text("\r\n  Joseph Stalin's Cabinet");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Chairperson:";
    			t4 = text(" Rohaan Chakrobarty");
    			t5 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Vice Chairperson:";
    			t7 = text(" Abhiraj Chatterjee");
    			t8 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Director:";
    			t10 = text(" Dhrishit Dasgupta");
    			t11 = space();
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Rapporteur:";
    			t13 = text(" Aryaveer Agarwal");
    			t14 = space();
    			br0 = element("br");
    			t15 = space();
    			p4 = element("p");
    			strong4 = element("strong");
    			strong4.textContent = "About the Committee-";
    			t17 = space();
    			p5 = element("p");
    			p5.textContent = "Amidst the chilling winds of a harsh winter, as Europe teetered on the edge of widespread conflict, an influential congregation emerged to alter the fate of nations. Within the guarded chambers of Joseph Stalin's cabinet, where political leaders and military strategists converge, scheming unfolded.";
    			t19 = space();
    			p6 = element("p");
    			p6.textContent = "As the Soviet Union marched towards Finland, the question lingers: Will the architects of Stalin's cabinet navigate the treacherous tides of history, defying expectations, and forever altering the course of our world?";
    			t21 = space();
    			p7 = element("p");
    			p7.textContent = "As the delegates of Joseph Stalin's cabinet, you are to inherit the mantle of forerunners by assuming the roles of eminent Soviet leaders, wielding colossal influence within their respective spheres. Delve into the convolutions of wartime strategy and geopolitical dominance on a grand scale, probe into the intricate web of deceit and conspiracies, engage in tactical decisions and intense dialogue to establish a path towards military conquest and expansion, or navigate the delicate balance of diplomacy and warfare in alignment with your own political motives.\r\n    ";
    			br1 = element("br");
    			t23 = space();
    			p8 = element("p");
    			strong5 = element("strong");
    			strong5.textContent = "Agenda- The Winter War, 1939";
    			t25 = space();
    			br2 = element("br");
    			t26 = space();
    			p9 = element("p");
    			strong6 = element("strong");
    			strong6.textContent = "Chairperson's Address-";
    			t28 = space();
    			p10 = element("p");
    			p10.textContent = "Greetings Delegates,";
    			t30 = space();
    			p11 = element("p");
    			p11.textContent = "It is with great honor that I welcome you to the 20th century, just before World War II, in Soviet Premier Joseph Stalin’s Cabinet at BOSCO MUN 2024. The Soviet Cabinet has always had one agenda: Power and Dominance, as we discuss the war against Finland, famously known as the Winter War.";
    			t32 = space();
    			p12 = element("p");
    			p12.textContent = "In this committee, delegates will assume the roles of pivotal high-ranking officials in the Soviet Cabinet, discussing the nation’s roadmap and war plans against the Finnish.";
    			t34 = space();
    			p13 = element("p");
    			p13.textContent = "The Vice-Chairperson for this committee will be Abhiraj Chatterjee, the school Rua House Vice-Captain from Class 11. A science student with a keen interest in economics and world history, he has a deep passion for debates and MUNs, winning accolades in all while balancing his studies. A foodie at heart, he can lighten the mood in any room with his illogical jokes.";
    			t36 = space();
    			p14 = element("p");
    			p14.textContent = "The Director for this committee will be Dhrishit Dasgupta. He has a deep love for debate and contemporary history, among other interests. In his free time, he works on his never-ending projects or explains to his friends why \"Pulp Fiction\" is better than \"The Shawshank Redemption.\" His knowledge of history surpasses that of any other Class 11 student.";
    			t38 = space();
    			p15 = element("p");
    			p15.textContent = "The Rapporteur for Stalin’s Cabinet will be Aryaveer Agarwal. You can often find him with his laptop more than his books at school. An energetic Class 10 student, he is always ready to jump in whenever someone needs help.";
    			t40 = space();
    			p16 = element("p");
    			p16.textContent = "Alongside them, I will be your Chairperson, Joseph Stalin himself, and the school’s unofficial pseudo-Bengali. Having always been interested in Soviet politics, it is my honor to serve in this role, and it will be our privilege to serve as your Executive Board. We hope this committee will be an enriching experience for veterans and beginners alike.";
    			t42 = space();
    			p17 = element("p");
    			p17.textContent = "To conclude, I wish everyone the very best of luck in their preparation for this committee. Please feel free to contact the members of the Executive Board if you require any clarification.";
    			t44 = space();
    			p18 = element("p");
    			t45 = text("Regards,");
    			br3 = element("br");
    			t46 = text("\r\n      Rohaan Chakraborty,");
    			br4 = element("br");
    			t47 = text("\r\n    Deputy Secretary General,");
    			br5 = element("br");
    			t48 = text("\r\n    Chairperson, Joseph Stalin’s Cabinet,");
    			br6 = element("br");
    			t49 = text("\r\n    The Ninth Secretariat,");
    			br7 = element("br");
    			t50 = text("\r\n    Bosco MUN 2024");
    			if (!src_url_equal(img0.src, img0_src_value = /*logoUrl*/ ctx[1])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Logo");
    			attr_dev(img0, "class", "logo svelte-4i2gqz");
    			attr_dev(img0, "loading", "lazy");
    			add_location(img0, file$a, 7, 2, 156);
    			attr_dev(h1, "class", "heading svelte-4i2gqz");
    			add_location(h1, file$a, 6, 0, 132);
    			if (!src_url_equal(img1.src, img1_src_value = /*imageUrl*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "JSC");
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "class", "svelte-4i2gqz");
    			add_location(img1, file$a, 11, 4, 311);
    			attr_dev(div0, "class", "image-container svelte-4i2gqz");
    			add_location(div0, file$a, 10, 2, 276);
    			attr_dev(strong0, "class", "highlight svelte-4i2gqz");
    			add_location(strong0, file$a, 14, 7, 444);
    			attr_dev(p0, "class", "svelte-4i2gqz");
    			add_location(p0, file$a, 14, 4, 441);
    			attr_dev(strong1, "class", "highlight svelte-4i2gqz");
    			add_location(strong1, file$a, 15, 7, 527);
    			attr_dev(p1, "class", "svelte-4i2gqz");
    			add_location(p1, file$a, 15, 4, 524);
    			attr_dev(strong2, "class", "highlight svelte-4i2gqz");
    			add_location(strong2, file$a, 16, 7, 615);
    			attr_dev(p2, "class", "svelte-4i2gqz");
    			add_location(p2, file$a, 16, 4, 612);
    			attr_dev(strong3, "class", "highlight svelte-4i2gqz");
    			add_location(strong3, file$a, 17, 7, 694);
    			attr_dev(p3, "class", "svelte-4i2gqz");
    			add_location(p3, file$a, 17, 4, 691);
    			add_location(br0, file$a, 18, 4, 771);
    			attr_dev(strong4, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong4, file$a, 19, 31, 808);
    			attr_dev(p4, "class", "address-section svelte-4i2gqz");
    			add_location(p4, file$a, 19, 4, 781);
    			attr_dev(p5, "class", "svelte-4i2gqz");
    			add_location(p5, file$a, 20, 4, 883);
    			attr_dev(p6, "class", "svelte-4i2gqz");
    			add_location(p6, file$a, 22, 4, 1202);
    			attr_dev(p7, "class", "svelte-4i2gqz");
    			add_location(p7, file$a, 24, 4, 1438);
    			add_location(br1, file$a, 25, 8, 2015);
    			attr_dev(strong5, "class", "highlight svelte-4i2gqz");
    			add_location(strong5, file$a, 26, 7, 2028);
    			attr_dev(p8, "class", "svelte-4i2gqz");
    			add_location(p8, file$a, 26, 4, 2025);
    			add_location(br2, file$a, 27, 4, 2102);
    			attr_dev(strong6, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong6, file$a, 28, 31, 2139);
    			attr_dev(p9, "class", "address-section svelte-4i2gqz");
    			add_location(p9, file$a, 28, 4, 2112);
    			attr_dev(p10, "class", "svelte-4i2gqz");
    			add_location(p10, file$a, 29, 4, 2216);
    			attr_dev(p11, "class", "svelte-4i2gqz");
    			add_location(p11, file$a, 31, 4, 2255);
    			attr_dev(p12, "class", "svelte-4i2gqz");
    			add_location(p12, file$a, 33, 4, 2563);
    			attr_dev(p13, "class", "svelte-4i2gqz");
    			add_location(p13, file$a, 35, 4, 2756);
    			attr_dev(p14, "class", "svelte-4i2gqz");
    			add_location(p14, file$a, 37, 4, 3141);
    			attr_dev(p15, "class", "svelte-4i2gqz");
    			add_location(p15, file$a, 39, 4, 3513);
    			attr_dev(p16, "class", "svelte-4i2gqz");
    			add_location(p16, file$a, 41, 4, 3753);
    			attr_dev(p17, "class", "svelte-4i2gqz");
    			add_location(p17, file$a, 42, 4, 4120);
    			add_location(br3, file$a, 43, 15, 4336);
    			add_location(br4, file$a, 44, 25, 4367);
    			add_location(br5, file$a, 45, 29, 4402);
    			add_location(br6, file$a, 46, 41, 4449);
    			add_location(br7, file$a, 47, 26, 4481);
    			attr_dev(p18, "class", "svelte-4i2gqz");
    			add_location(p18, file$a, 43, 4, 4325);
    			attr_dev(div1, "class", "text-container svelte-4i2gqz");
    			add_location(div1, file$a, 13, 2, 407);
    			attr_dev(div2, "class", "container svelte-4i2gqz");
    			add_location(div2, file$a, 9, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, img0);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t10);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(p3, strong3);
    			append_dev(p3, t13);
    			append_dev(div1, t14);
    			append_dev(div1, br0);
    			append_dev(div1, t15);
    			append_dev(div1, p4);
    			append_dev(p4, strong4);
    			append_dev(div1, t17);
    			append_dev(div1, p5);
    			append_dev(div1, t19);
    			append_dev(div1, p6);
    			append_dev(div1, t21);
    			append_dev(div1, p7);
    			append_dev(div1, br1);
    			append_dev(div1, t23);
    			append_dev(div1, p8);
    			append_dev(p8, strong5);
    			append_dev(div1, t25);
    			append_dev(div1, br2);
    			append_dev(div1, t26);
    			append_dev(div1, p9);
    			append_dev(p9, strong6);
    			append_dev(div1, t28);
    			append_dev(div1, p10);
    			append_dev(div1, t30);
    			append_dev(div1, p11);
    			append_dev(div1, t32);
    			append_dev(div1, p12);
    			append_dev(div1, t34);
    			append_dev(div1, p13);
    			append_dev(div1, t36);
    			append_dev(div1, p14);
    			append_dev(div1, t38);
    			append_dev(div1, p15);
    			append_dev(div1, t40);
    			append_dev(div1, p16);
    			append_dev(div1, t42);
    			append_dev(div1, p17);
    			append_dev(div1, t44);
    			append_dev(div1, p18);
    			append_dev(p18, t45);
    			append_dev(p18, br3);
    			append_dev(p18, t46);
    			append_dev(p18, br4);
    			append_dev(p18, t47);
    			append_dev(p18, br5);
    			append_dev(p18, t48);
    			append_dev(p18, br6);
    			append_dev(p18, t49);
    			append_dev(p18, br7);
    			append_dev(p18, t50);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!img1_intro) {
    				add_render_callback(() => {
    					img1_intro = create_in_transition(img1, fly, { x: 200, duration: 3000 });
    					img1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('JSC', slots, []);
    	let imageUrl = '/JSCEB.jpg';
    	let logoUrl = '/JSCLOGO.png';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<JSC> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, logoUrl });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('logoUrl' in $$props) $$invalidate(1, logoUrl = $$props.logoUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, logoUrl];
    }

    class JSC extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JSC",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\ASEAN.svelte generated by Svelte v3.59.2 */
    const file$9 = "src\\ASEAN.svelte";

    function create_fragment$9(ctx) {
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let img1_intro;
    	let t2;
    	let div1;
    	let p0;
    	let strong0;
    	let t4;
    	let t5;
    	let p1;
    	let strong1;
    	let t7;
    	let t8;
    	let p2;
    	let strong2;
    	let t10;
    	let t11;
    	let br0;
    	let t12;
    	let p3;
    	let strong3;
    	let t14;
    	let p4;
    	let t16;
    	let p5;
    	let t18;
    	let p6;
    	let br1;
    	let t20;
    	let p7;
    	let strong4;
    	let t22;
    	let br2;
    	let t23;
    	let p8;
    	let strong5;
    	let t25;
    	let p9;
    	let t27;
    	let p10;
    	let t29;
    	let p11;
    	let t31;
    	let p12;
    	let t33;
    	let p13;
    	let t35;
    	let p14;
    	let t37;
    	let p15;
    	let t38;
    	let br3;
    	let t39;
    	let br4;
    	let t40;
    	let br5;
    	let t41;
    	let br6;
    	let t42;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = text("\r\n  Association of Southeast Asian Nations");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Co-Chairperson:";
    			t4 = text(" Pavvit Singh Batra & Om Arya Paul");
    			t5 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Vice Chairperson:";
    			t7 = text(" Shreyansh Surana");
    			t8 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Rapporteur:";
    			t10 = text(" Rajveer Kumar Pruthi");
    			t11 = space();
    			br0 = element("br");
    			t12 = space();
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "About the Committee-";
    			t14 = space();
    			p4 = element("p");
    			p4.textContent = "In Southeast Asia's vibrant landscape, the sudden shift in the affairs of Myanmar demands immediate attention. Following a sudden military coup that dismantled its fragile democratic framework, Myanmar plunged into upheaval and disarray. The crisis was marked by chaotic protests, severe military subjugation, and multifaceted international responses, which have thrust the nation to the brink of destabilization.";
    			t16 = space();
    			p5 = element("p");
    			p5.textContent = "The Association of Southeast Asian Nations (ASEAN) faces yet another complex crisis wherein you require an intricate understanding of the power struggles, and dynamism of regional politics as well as the geopolitical environment at large.";
    			t18 = space();
    			p6 = element("p");
    			p6.textContent = "This crisis demands influential regional leaders to take centre stage and engage in intense negotiations, and diplomatic dialogue, recommend sustainable solutions, and create alliances to tackle the crisis and prevent the escalation of the conflict. With the future of Myanmar and the stability of Southeast Asia hanging in the balance, delegates emulating key political figures will have to navigate the turbulent waters with continued vigilance, negotiation, and foresight, harmonizing their interests with the enduring principles of diplomacy and statesmanship.\r\n    ";
    			br1 = element("br");
    			t20 = space();
    			p7 = element("p");
    			strong4 = element("strong");
    			strong4.textContent = "Agenda – The Myanmar crisis, 2021";
    			t22 = space();
    			br2 = element("br");
    			t23 = space();
    			p8 = element("p");
    			strong5 = element("strong");
    			strong5.textContent = "Chairperson's Address-";
    			t25 = space();
    			p9 = element("p");
    			p9.textContent = "Greetings Delegates,";
    			t27 = space();
    			p10 = element("p");
    			p10.textContent = "It is with great honour that we welcome you to the Association of Southeast Asian nations at BOSCO MUN 2024; deliberating on, in this committee, the situation in the golden land, the land of temples and pagodas – Myanmar.";
    			t29 = space();
    			p11 = element("p");
    			p11.textContent = "The Freeze Date for this committee will be: 2nd of August, 2021.";
    			t31 = space();
    			p12 = element("p");
    			p12.textContent = "In presiding over this committee, we will be assisted by the Vice – Chairperson and the Green movement president Shreyansh Surana, and our rapporteur and joint secretary of Young Entrepreneurs group at DBPC Rajveer Kumar Pruthi. Shreyansh is a 12th grader who is a powerful orator with a passion for research and debate, finding his feet in the circuit. He may be short but he makes up for it by being an exceptional speaker. He has a deep and abiding interest in economics and finance. Rajveer, a 10th grader, who has a deep and abiding interest in diplomacy and Indian Politics and almost everything that comes under public speaking. He is the most casual and approachable member of this executive board and his lobbying skills are in another league.";
    			t33 = space();
    			p13 = element("p");
    			p13.textContent = "Om Arya Paul is a 12th grader humanities student who has a deep-rooted passion for geopolitics and foreign policy as well as international law along with a keen interest in law, economics, history, and political science. He is also a cinephile, who is always either researching on an intriguing topic or debating on a certain issue.";
    			t35 = space();
    			p14 = element("p");
    			p14.textContent = "Pavvit Singh Batra is a 12th grade science student with an avid interest in Mathematics and Computer Science. He is serving as the tech team head for Bosco MUN 2024 and though he may come across as an introvert, he is one of the fiercest orators you can come across, promising to be the most well researched member of this executive board. What we, as your Executive Board, regard most importantly in committee are policy and rationality. While knowledge and research, too, are of paramount importance, they need to be articulated coherently, and presented spontaneously. Having spoken from both sides of the dais numerous times in the past, we can empathise with your worries, and would like all of you to feel free to contact any of us if you have any queries. The study guide is intended to serve only as the starting point for your research, so please do not let this guide limit your research. Now, let's get this show on the road and make Myanmar's situation less dramatic than a Netflix series finale. Thank you, and let's have a productive session! Happy researching, and good luck for the committee!";
    			t37 = space();
    			p15 = element("p");
    			t38 = text("Regards,");
    			br3 = element("br");
    			t39 = text("\r\n    Om Arya Paul and Pavvit Singh Batra,");
    			br4 = element("br");
    			t40 = text("\r\n    Chairpersons of the Association of the Southeast Asian Nations,");
    			br5 = element("br");
    			t41 = text("\r\n    The Ninth Secretariat,");
    			br6 = element("br");
    			t42 = text("\r\n    Bosco MUN 2024");
    			if (!src_url_equal(img0.src, img0_src_value = /*logoUrl*/ ctx[1])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Logo");
    			attr_dev(img0, "class", "logo svelte-145zfp3");
    			attr_dev(img0, "loading", "lazy");
    			add_location(img0, file$9, 7, 2, 160);
    			attr_dev(h1, "class", "heading svelte-145zfp3");
    			add_location(h1, file$9, 6, 0, 136);
    			if (!src_url_equal(img1.src, img1_src_value = /*imageUrl*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "ASEAN");
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "class", "svelte-145zfp3");
    			add_location(img1, file$9, 11, 4, 330);
    			attr_dev(div0, "class", "image-container svelte-145zfp3");
    			add_location(div0, file$9, 10, 2, 295);
    			attr_dev(strong0, "class", "highlight svelte-145zfp3");
    			add_location(strong0, file$9, 14, 7, 465);
    			attr_dev(p0, "class", "svelte-145zfp3");
    			add_location(p0, file$9, 14, 4, 462);
    			attr_dev(strong1, "class", "highlight svelte-145zfp3");
    			add_location(strong1, file$9, 15, 7, 562);
    			attr_dev(p1, "class", "svelte-145zfp3");
    			add_location(p1, file$9, 15, 4, 559);
    			attr_dev(strong2, "class", "highlight svelte-145zfp3");
    			add_location(strong2, file$9, 16, 7, 644);
    			attr_dev(p2, "class", "svelte-145zfp3");
    			add_location(p2, file$9, 16, 4, 641);
    			add_location(br0, file$9, 17, 4, 721);
    			attr_dev(strong3, "class", "highlight-underline svelte-145zfp3");
    			add_location(strong3, file$9, 18, 31, 758);
    			attr_dev(p3, "class", "address-section svelte-145zfp3");
    			add_location(p3, file$9, 18, 4, 731);
    			attr_dev(p4, "class", "svelte-145zfp3");
    			add_location(p4, file$9, 19, 4, 833);
    			attr_dev(p5, "class", "svelte-145zfp3");
    			add_location(p5, file$9, 21, 4, 1265);
    			attr_dev(p6, "class", "svelte-145zfp3");
    			add_location(p6, file$9, 23, 4, 1523);
    			add_location(br1, file$9, 24, 8, 2100);
    			attr_dev(strong4, "class", "highlight svelte-145zfp3");
    			add_location(strong4, file$9, 25, 7, 2113);
    			attr_dev(p7, "class", "svelte-145zfp3");
    			add_location(p7, file$9, 25, 4, 2110);
    			add_location(br2, file$9, 26, 4, 2193);
    			attr_dev(strong5, "class", "highlight-underline svelte-145zfp3");
    			add_location(strong5, file$9, 27, 31, 2230);
    			attr_dev(p8, "class", "address-section svelte-145zfp3");
    			add_location(p8, file$9, 27, 4, 2203);
    			attr_dev(p9, "class", "svelte-145zfp3");
    			add_location(p9, file$9, 28, 4, 2307);
    			attr_dev(p10, "class", "svelte-145zfp3");
    			add_location(p10, file$9, 30, 4, 2346);
    			attr_dev(p11, "class", "svelte-145zfp3");
    			add_location(p11, file$9, 32, 4, 2586);
    			attr_dev(p12, "class", "svelte-145zfp3");
    			add_location(p12, file$9, 33, 4, 2663);
    			attr_dev(p13, "class", "svelte-145zfp3");
    			add_location(p13, file$9, 35, 4, 3437);
    			attr_dev(p14, "class", "svelte-145zfp3");
    			add_location(p14, file$9, 37, 4, 3789);
    			add_location(br3, file$9, 39, 15, 4927);
    			add_location(br4, file$9, 40, 40, 4973);
    			add_location(br5, file$9, 41, 67, 5046);
    			add_location(br6, file$9, 42, 26, 5078);
    			attr_dev(p15, "class", "svelte-145zfp3");
    			add_location(p15, file$9, 39, 4, 4916);
    			attr_dev(div1, "class", "text-container svelte-145zfp3");
    			add_location(div1, file$9, 13, 2, 428);
    			attr_dev(div2, "class", "container svelte-145zfp3");
    			add_location(div2, file$9, 9, 0, 268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, img0);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t10);
    			append_dev(div1, t11);
    			append_dev(div1, br0);
    			append_dev(div1, t12);
    			append_dev(div1, p3);
    			append_dev(p3, strong3);
    			append_dev(div1, t14);
    			append_dev(div1, p4);
    			append_dev(div1, t16);
    			append_dev(div1, p5);
    			append_dev(div1, t18);
    			append_dev(div1, p6);
    			append_dev(div1, br1);
    			append_dev(div1, t20);
    			append_dev(div1, p7);
    			append_dev(p7, strong4);
    			append_dev(div1, t22);
    			append_dev(div1, br2);
    			append_dev(div1, t23);
    			append_dev(div1, p8);
    			append_dev(p8, strong5);
    			append_dev(div1, t25);
    			append_dev(div1, p9);
    			append_dev(div1, t27);
    			append_dev(div1, p10);
    			append_dev(div1, t29);
    			append_dev(div1, p11);
    			append_dev(div1, t31);
    			append_dev(div1, p12);
    			append_dev(div1, t33);
    			append_dev(div1, p13);
    			append_dev(div1, t35);
    			append_dev(div1, p14);
    			append_dev(div1, t37);
    			append_dev(div1, p15);
    			append_dev(p15, t38);
    			append_dev(p15, br3);
    			append_dev(p15, t39);
    			append_dev(p15, br4);
    			append_dev(p15, t40);
    			append_dev(p15, br5);
    			append_dev(p15, t41);
    			append_dev(p15, br6);
    			append_dev(p15, t42);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!img1_intro) {
    				add_render_callback(() => {
    					img1_intro = create_in_transition(img1, fly, { x: 200, duration: 3000 });
    					img1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ASEAN', slots, []);
    	let imageUrl = '/ASEANEB.jpg';
    	let logoUrl = '/ASEANLOGO.png';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ASEAN> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, logoUrl });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('logoUrl' in $$props) $$invalidate(1, logoUrl = $$props.logoUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, logoUrl];
    }

    class ASEAN extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ASEAN",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\AL.svelte generated by Svelte v3.59.2 */
    const file$8 = "src\\AL.svelte";

    function create_fragment$8(ctx) {
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let img1_intro;
    	let t2;
    	let div1;
    	let p0;
    	let strong0;
    	let t4;
    	let t5;
    	let p1;
    	let strong1;
    	let t7;
    	let t8;
    	let p2;
    	let strong2;
    	let t10;
    	let t11;
    	let br0;
    	let t12;
    	let p3;
    	let strong3;
    	let t14;
    	let p4;
    	let t16;
    	let p5;
    	let t18;
    	let p6;
    	let br1;
    	let t20;
    	let p7;
    	let strong4;
    	let t22;
    	let br2;
    	let t23;
    	let p8;
    	let strong5;
    	let t25;
    	let p9;
    	let t27;
    	let p10;
    	let t29;
    	let p11;
    	let t31;
    	let p12;
    	let t33;
    	let p13;
    	let t35;
    	let p14;
    	let t37;
    	let p15;
    	let t39;
    	let p16;
    	let t40;
    	let br3;
    	let t41;
    	let br4;
    	let t42;
    	let br5;
    	let t43;
    	let br6;
    	let t44;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = text("\r\n  Arab League");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Co-Chairperson:";
    			t4 = text(" Yuvraj Berlia and Devansh Sharma");
    			t5 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Vice Chairperson:";
    			t7 = text(" Siddhant Khinwasara");
    			t8 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Rapporteur:";
    			t10 = text(" Ayush Abhinandan Choudhury");
    			t11 = space();
    			br0 = element("br");
    			t12 = space();
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "About the Committee-";
    			t14 = space();
    			p4 = element("p");
    			p4.textContent = "In the heart of the Arabian world, amid a time of profound change and mounting tensions, the Lebanon Crisis emerged as a pivotal moment in regional history. The crisis was fuelled by internal strife, religious tensions, and the broader geopolitical strains of the Cold War, which threatened to collapse the fragile religious and political equilibrium that held the country together.";
    			t16 = space();
    			p5 = element("p");
    			p5.textContent = "The Arab League, since its inception in 1945 faces a mammoth obstacle before itself in the shape of this crisis. This epoch calls for an intricate knowledge of regional power dynamics, international influence, and geo-politics. Delegates assuming the roles of key political figures will have immense trials of navigating the pressing turmoil as well as addressing the underlying roots of the dispute all while keeping in mind how high the stakes are.";
    			t18 = space();
    			p6 = element("p");
    			p6.textContent = "Engage in rigorous debate, propose viable solutions, conduct diplomatic negotiations, and work in tandem to de-escalate the status quo. The stability of the region hangs in balance. Find a path to peace or force the region to delve in the chaos of war.     \r\n    ";
    			br1 = element("br");
    			t20 = space();
    			p7 = element("p");
    			strong4 = element("strong");
    			strong4.textContent = "Agenda – The Lebanon Crisis, 1958";
    			t22 = space();
    			br2 = element("br");
    			t23 = space();
    			p8 = element("p");
    			strong5 = element("strong");
    			strong5.textContent = "Chairperson's Address-";
    			t25 = space();
    			p9 = element("p");
    			p9.textContent = "Greetings Delegates,";
    			t27 = space();
    			p10 = element("p");
    			p10.textContent = "It is with immense pleasure and warmth that we welcome you to the 9th edition of Bosco Model United Nations and to one of the most enthralling committees being simulated at this year’s conference- The Arab League. The Arab World faces a multitude of maladies in its quest for order and the Lebanon Crisis is yet another manifestation of the delicate divide between the factions that have developed under the Arab Cold war. In its quest for harmony, the Middle-East remains differentiated and in dire straits. At the Arab League, we do not hope to address only opinions or solutions; we hope to address change - change which enables our world to transcend the ordinary boundaries of divided thought and change that leaves us in a better position than yesterday. As the members of the Arab League, you are vested with the power to rewrite history - to lead the Arab world to an Empyrean Edifice of stability or to thrust it into the throes of disaster.";
    			t29 = space();
    			p11 = element("p");
    			p11.textContent = "The Freeze Date for this committee will be the 15th of July, 1958";
    			t31 = space();
    			p12 = element("p");
    			p12.textContent = "In presiding over this committee we will be assisted by the Vice-Chairperson Siddhant Khinwasara and the Rapporteur Ayush Abhinandan Chowdhury. Ayush is the only 10th grader in this executive board. He is a budding MUN’er determined to make a name for himself in the Calcutta MUN circuit by erasing nations off the world map(even the very chairperson of this committee could not escape this). Siddhant is a talented MUN’er known for his strong suit in entertainment motions. He is currently the troop leader of the DBPC Scouts Troop, he also served as the CEO and Managing Director at Bosco Empresarios 2024. Having many laurels attached to his name in MUNs and Business fests alike, he is the perfect Vice Chairperson for this committee.";
    			t33 = space();
    			p13 = element("p");
    			p13.textContent = "Yuvraj Berlia will be serving as the co-chairperson for this committee, he is the School Savio House Captain. He is among the most resourceful and ambitious persons you are likely to meet. Being a fan of the Gujarati cuisine and tradition has recently become a part of his persona. He was also a director at Bosco Empresarios, the Senior Editor of the First Edition of Bosco Monetaire and the head of the Food and Sponsorship Committee at Bosco Fest 2024. He is known for his lofty aspirations of walking around the DU North campus one day, and is sure to  make Bosco Mun 2024 a memorable experience for everyone in his committee.";
    			t35 = space();
    			p14 = element("p");
    			p14.textContent = "Devansh Sharma will be serving as the Co-Chairperson for this committee. Devansh is a calm and composed person with a flair for public speaking and a deep interest in Economics. He is a persuasive speaker who can convince you that the Wagner group is just a food caterer. As a commerce student, his ambitions lie in the North Campus of DU. He is the warmest and most approachable person in the committee and is bound to make the committee experience an enriching one for you!";
    			t37 = space();
    			p15 = element("p");
    			p15.textContent = "So, Good luck delegates. It is our utmost desire to make this committee as fulfilling for you as possible. Judiciously utilise this study guide but ensure that it does not restrict your research. We sincerely hope that we will be able to provide you with a learning and memorable experience through this committee. For any clarifications please feel free to reach out to arableague.boscomun@gmail.com or connect with any of us Personally.";
    			t39 = space();
    			p16 = element("p");
    			t40 = text("Regards,");
    			br3 = element("br");
    			t41 = text("\r\n      Yuvraj Berlia & Devansh Sharma,");
    			br4 = element("br");
    			t42 = text("\r\n    Co-Chairpersons of the Arab League,");
    			br5 = element("br");
    			t43 = text("\r\n    The Ninth Secretariat,");
    			br6 = element("br");
    			t44 = text("\r\n    Bosco MUN 2024");
    			if (!src_url_equal(img0.src, img0_src_value = /*logoUrl*/ ctx[1])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Logo");
    			attr_dev(img0, "class", "logo svelte-4i2gqz");
    			attr_dev(img0, "loading", "lazy");
    			add_location(img0, file$8, 7, 2, 156);
    			attr_dev(h1, "class", "heading svelte-4i2gqz");
    			add_location(h1, file$8, 6, 0, 132);
    			if (!src_url_equal(img1.src, img1_src_value = /*imageUrl*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Arab League");
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "class", "svelte-4i2gqz");
    			add_location(img1, file$8, 11, 4, 299);
    			attr_dev(div0, "class", "image-container svelte-4i2gqz");
    			add_location(div0, file$8, 10, 2, 264);
    			attr_dev(strong0, "class", "highlight svelte-4i2gqz");
    			add_location(strong0, file$8, 15, 7, 442);
    			attr_dev(p0, "class", "svelte-4i2gqz");
    			add_location(p0, file$8, 15, 4, 439);
    			attr_dev(strong1, "class", "highlight svelte-4i2gqz");
    			add_location(strong1, file$8, 16, 7, 542);
    			attr_dev(p1, "class", "svelte-4i2gqz");
    			add_location(p1, file$8, 16, 4, 539);
    			attr_dev(strong2, "class", "highlight svelte-4i2gqz");
    			add_location(strong2, file$8, 17, 7, 627);
    			attr_dev(p2, "class", "svelte-4i2gqz");
    			add_location(p2, file$8, 17, 4, 624);
    			add_location(br0, file$8, 18, 4, 710);
    			attr_dev(strong3, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong3, file$8, 19, 31, 747);
    			attr_dev(p3, "class", "address-section svelte-4i2gqz");
    			add_location(p3, file$8, 19, 4, 720);
    			attr_dev(p4, "class", "svelte-4i2gqz");
    			add_location(p4, file$8, 20, 4, 822);
    			attr_dev(p5, "class", "svelte-4i2gqz");
    			add_location(p5, file$8, 22, 4, 1223);
    			attr_dev(p6, "class", "svelte-4i2gqz");
    			add_location(p6, file$8, 24, 4, 1692);
    			add_location(br1, file$8, 25, 8, 1962);
    			attr_dev(strong4, "class", "highlight svelte-4i2gqz");
    			add_location(strong4, file$8, 26, 7, 1975);
    			attr_dev(p7, "class", "svelte-4i2gqz");
    			add_location(p7, file$8, 26, 4, 1972);
    			add_location(br2, file$8, 27, 4, 2054);
    			attr_dev(strong5, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong5, file$8, 28, 31, 2091);
    			attr_dev(p8, "class", "address-section svelte-4i2gqz");
    			add_location(p8, file$8, 28, 4, 2064);
    			attr_dev(p9, "class", "svelte-4i2gqz");
    			add_location(p9, file$8, 29, 4, 2168);
    			attr_dev(p10, "class", "svelte-4i2gqz");
    			add_location(p10, file$8, 30, 4, 2205);
    			attr_dev(p11, "class", "svelte-4i2gqz");
    			add_location(p11, file$8, 32, 4, 3174);
    			attr_dev(p12, "class", "svelte-4i2gqz");
    			add_location(p12, file$8, 34, 4, 3258);
    			attr_dev(p13, "class", "svelte-4i2gqz");
    			add_location(p13, file$8, 36, 4, 4015);
    			attr_dev(p14, "class", "svelte-4i2gqz");
    			add_location(p14, file$8, 38, 4, 4664);
    			attr_dev(p15, "class", "svelte-4i2gqz");
    			add_location(p15, file$8, 40, 4, 5159);
    			add_location(br3, file$8, 42, 15, 5629);
    			add_location(br4, file$8, 43, 37, 5672);
    			add_location(br5, file$8, 44, 39, 5717);
    			add_location(br6, file$8, 45, 26, 5749);
    			attr_dev(p16, "class", "svelte-4i2gqz");
    			add_location(p16, file$8, 42, 4, 5618);
    			attr_dev(div1, "class", "text-container svelte-4i2gqz");
    			add_location(div1, file$8, 13, 2, 403);
    			attr_dev(div2, "class", "container svelte-4i2gqz");
    			add_location(div2, file$8, 9, 0, 237);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, img0);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t10);
    			append_dev(div1, t11);
    			append_dev(div1, br0);
    			append_dev(div1, t12);
    			append_dev(div1, p3);
    			append_dev(p3, strong3);
    			append_dev(div1, t14);
    			append_dev(div1, p4);
    			append_dev(div1, t16);
    			append_dev(div1, p5);
    			append_dev(div1, t18);
    			append_dev(div1, p6);
    			append_dev(div1, br1);
    			append_dev(div1, t20);
    			append_dev(div1, p7);
    			append_dev(p7, strong4);
    			append_dev(div1, t22);
    			append_dev(div1, br2);
    			append_dev(div1, t23);
    			append_dev(div1, p8);
    			append_dev(p8, strong5);
    			append_dev(div1, t25);
    			append_dev(div1, p9);
    			append_dev(div1, t27);
    			append_dev(div1, p10);
    			append_dev(div1, t29);
    			append_dev(div1, p11);
    			append_dev(div1, t31);
    			append_dev(div1, p12);
    			append_dev(div1, t33);
    			append_dev(div1, p13);
    			append_dev(div1, t35);
    			append_dev(div1, p14);
    			append_dev(div1, t37);
    			append_dev(div1, p15);
    			append_dev(div1, t39);
    			append_dev(div1, p16);
    			append_dev(p16, t40);
    			append_dev(p16, br3);
    			append_dev(p16, t41);
    			append_dev(p16, br4);
    			append_dev(p16, t42);
    			append_dev(p16, br5);
    			append_dev(p16, t43);
    			append_dev(p16, br6);
    			append_dev(p16, t44);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!img1_intro) {
    				add_render_callback(() => {
    					img1_intro = create_in_transition(img1, fly, { x: 200, duration: 3000 });
    					img1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AL', slots, []);
    	let imageUrl = '/ARABEB.jpg';
    	let logoUrl = '/ALLOGO.png';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AL> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, logoUrl });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('logoUrl' in $$props) $$invalidate(1, logoUrl = $$props.logoUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, logoUrl];
    }

    class AL extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AL",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\IPC.svelte generated by Svelte v3.59.2 */
    const file$7 = "src\\IPC.svelte";

    function create_fragment$7(ctx) {
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let img1_intro;
    	let t2;
    	let div1;
    	let p0;
    	let strong0;
    	let t4;
    	let t5;
    	let p1;
    	let strong1;
    	let t7;
    	let t8;
    	let br0;
    	let t9;
    	let p2;
    	let strong2;
    	let t11;
    	let p3;
    	let t13;
    	let p4;
    	let t15;
    	let p5;
    	let br1;
    	let t17;
    	let p6;
    	let strong3;
    	let t19;
    	let br2;
    	let t20;
    	let p7;
    	let strong4;
    	let t22;
    	let p8;
    	let t24;
    	let p9;
    	let t26;
    	let p10;
    	let t28;
    	let p11;
    	let t30;
    	let p12;
    	let t32;
    	let p13;
    	let t34;
    	let p14;
    	let t35;
    	let br3;
    	let t36;
    	let br4;
    	let t37;
    	let br5;
    	let t38;
    	let br6;
    	let t39;
    	let br7;
    	let t40;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = text("\r\n  International Press Corps");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Press Head:";
    			t4 = text(" Riddhiman Gangopadhyay");
    			t5 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Deputy Press Head:";
    			t7 = text("  Himank More");
    			t8 = space();
    			br0 = element("br");
    			t9 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "About the Committee-";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "Amidst chaos from around the world, it falls among our pinnacle duties to protect the people who provide us with the happenings around the world. A world without the Press is a world without knowledge. It is the freedom of the press that makes it formidable in its power, being able to challenge and argue against any decision of a higher power from the viewpoint of the common citizen.";
    			t13 = space();
    			p4 = element("p");
    			p4.textContent = "In these times of disorder, a press that is free, a press that is powerful, and a press that is trustworthy is of significant importance. Delegates have been given the foremost task of determining solutions regarding the problem of censored journalism and the severe lack of protection of the journalists in the fatal regions of war, while also covering the conference and providing all such accurate reports about their endeavour here.";
    			t15 = space();
    			p5 = element("p");
    			p5.textContent = "Engage yourselves and rise to the challenge of upholding the imperative task of free journalism, while remembering about your safety and that the \"Truth shalt not be hidden\".      \r\n    ";
    			br1 = element("br");
    			t17 = space();
    			p6 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Agenda – Freedom of the Press and Protection of the Journalists in conflict zones and the general coverage of the conference.";
    			t19 = space();
    			br2 = element("br");
    			t20 = space();
    			p7 = element("p");
    			strong4 = element("strong");
    			strong4.textContent = "Press Head's Address-";
    			t22 = space();
    			p8 = element("p");
    			p8.textContent = "Greetings Delegates,";
    			t24 = space();
    			p9 = element("p");
    			p9.textContent = "It is with great pleasure that I welcome you to a committee which is a first in the history of Bosco MUN, the International Press Corps. In this unique committee, we will be debating upon press freedom and the safety and protection of press correspondents in conflict zones.";
    			t26 = space();
    			p10 = element("p");
    			p10.textContent = "The mere introduction of such a committee for the very first time at an established MUN like Bosco MUN should serve as a testament to the importance of the same. In such difficult times, the role of the press is becoming increasingly profound, with it playing a central role in dispersing important information about controversial and sensitive issues with utmost ruthlessness and sincerity.";
    			t28 = space();
    			p11 = element("p");
    			p11.textContent = "In chairing this committee I will be assisted by the Deputy Press Head, Himank More, a 12th grader who is an avid and enthusiastic debater and the only thing he loves more than bending his own and others’ policy, is food. An approachable guy with immense problem-solving skills, he is almost always seen with a wide smile across his face.";
    			t30 = space();
    			p12 = element("p");
    			p12.textContent = "Riddhiman Gangopadhyay, the Press Head, is also a 12th grader commerce student with large dreams and an ever-present curiosity about finance, economics and the business world. Although he is more often seen at business conferences (or on FIFA), he finds the concept of MUNs fascinating and considers it a way to sharpen his oratory and research skills.";
    			t32 = space();
    			p13 = element("p");
    			p13.textContent = "Now, as highlighted before, the expectations from the delegates in this committee are very high. As is becoming essential, each and every delegate present will represent large and well-reputed press agencies and have to accordingly maintain extremely high ethical and moral standards and adhere to the highest grade of integrity and righteousness. Research holds great importance in this committee, but your value, rationality and ability to articulate and present smoothly and seamlessly. Of course, the written word will hold paramount significance and every single word that is put into an article will be carefully and meticulously scrutinised and its coherence with your committee stance will also be taken into account. This is mostly everything that I could think about, which was necessary to be briefed to all of you. Wishing you all the very best and I look forward to seeing all of you in committee vigorously scribbling something or the other on notepads or aggressively typing on your phones and asking hard to answer questions to any and every one!";
    			t34 = space();
    			p14 = element("p");
    			t35 = text("Thank you,");
    			br3 = element("br");
    			t36 = text("\r\n      Regards,");
    			br4 = element("br");
    			t37 = text("\r\n      Riddhiman Gangopadhyay,");
    			br5 = element("br");
    			t38 = text("\r\n      Press Head of the International Press Corps,");
    			br6 = element("br");
    			t39 = text("\r\n    The Ninth Secretariat,");
    			br7 = element("br");
    			t40 = text("\r\n    Bosco MUN 2024");
    			if (!src_url_equal(img0.src, img0_src_value = /*logoUrl*/ ctx[1])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Logo");
    			attr_dev(img0, "class", "logo svelte-4i2gqz");
    			attr_dev(img0, "loading", "lazy");
    			add_location(img0, file$7, 7, 2, 156);
    			attr_dev(h1, "class", "heading svelte-4i2gqz");
    			add_location(h1, file$7, 6, 0, 132);
    			if (!src_url_equal(img1.src, img1_src_value = /*imageUrl*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "IPC");
    			attr_dev(img1, "loading", "lazy");
    			attr_dev(img1, "class", "svelte-4i2gqz");
    			add_location(img1, file$7, 11, 4, 313);
    			attr_dev(div0, "class", "image-container svelte-4i2gqz");
    			add_location(div0, file$7, 10, 2, 278);
    			attr_dev(strong0, "class", "highlight svelte-4i2gqz");
    			add_location(strong0, file$7, 14, 7, 446);
    			attr_dev(p0, "class", "svelte-4i2gqz");
    			add_location(p0, file$7, 14, 4, 443);
    			attr_dev(strong1, "class", "highlight svelte-4i2gqz");
    			add_location(strong1, file$7, 15, 7, 532);
    			attr_dev(p1, "class", "svelte-4i2gqz");
    			add_location(p1, file$7, 15, 4, 529);
    			add_location(br0, file$7, 16, 4, 612);
    			attr_dev(strong2, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong2, file$7, 17, 31, 649);
    			attr_dev(p2, "class", "address-section svelte-4i2gqz");
    			add_location(p2, file$7, 17, 4, 622);
    			attr_dev(p3, "class", "svelte-4i2gqz");
    			add_location(p3, file$7, 18, 4, 724);
    			attr_dev(p4, "class", "svelte-4i2gqz");
    			add_location(p4, file$7, 20, 4, 1129);
    			attr_dev(p5, "class", "svelte-4i2gqz");
    			add_location(p5, file$7, 22, 4, 1584);
    			add_location(br1, file$7, 23, 8, 1777);
    			attr_dev(strong3, "class", "highlight svelte-4i2gqz");
    			add_location(strong3, file$7, 24, 7, 1790);
    			attr_dev(p6, "class", "svelte-4i2gqz");
    			add_location(p6, file$7, 24, 4, 1787);
    			add_location(br2, file$7, 25, 4, 1962);
    			attr_dev(strong4, "class", "highlight-underline svelte-4i2gqz");
    			add_location(strong4, file$7, 26, 31, 1999);
    			attr_dev(p7, "class", "address-section svelte-4i2gqz");
    			add_location(p7, file$7, 26, 4, 1972);
    			attr_dev(p8, "class", "svelte-4i2gqz");
    			add_location(p8, file$7, 27, 4, 2075);
    			attr_dev(p9, "class", "svelte-4i2gqz");
    			add_location(p9, file$7, 28, 4, 2112);
    			attr_dev(p10, "class", "svelte-4i2gqz");
    			add_location(p10, file$7, 29, 4, 2399);
    			attr_dev(p11, "class", "svelte-4i2gqz");
    			add_location(p11, file$7, 30, 4, 2803);
    			attr_dev(p12, "class", "svelte-4i2gqz");
    			add_location(p12, file$7, 32, 4, 3160);
    			attr_dev(p13, "class", "svelte-4i2gqz");
    			add_location(p13, file$7, 34, 4, 3533);
    			add_location(br3, file$7, 36, 17, 4629);
    			add_location(br4, file$7, 37, 14, 4649);
    			add_location(br5, file$7, 38, 29, 4684);
    			add_location(br6, file$7, 39, 50, 4740);
    			add_location(br7, file$7, 40, 26, 4772);
    			attr_dev(p14, "class", "svelte-4i2gqz");
    			add_location(p14, file$7, 36, 4, 4616);
    			attr_dev(div1, "class", "text-container svelte-4i2gqz");
    			add_location(div1, file$7, 13, 2, 409);
    			attr_dev(div2, "class", "container svelte-4i2gqz");
    			add_location(div2, file$7, 9, 0, 251);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, img0);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, br0);
    			append_dev(div1, t9);
    			append_dev(div1, p2);
    			append_dev(p2, strong2);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(div1, t13);
    			append_dev(div1, p4);
    			append_dev(div1, t15);
    			append_dev(div1, p5);
    			append_dev(div1, br1);
    			append_dev(div1, t17);
    			append_dev(div1, p6);
    			append_dev(p6, strong3);
    			append_dev(div1, t19);
    			append_dev(div1, br2);
    			append_dev(div1, t20);
    			append_dev(div1, p7);
    			append_dev(p7, strong4);
    			append_dev(div1, t22);
    			append_dev(div1, p8);
    			append_dev(div1, t24);
    			append_dev(div1, p9);
    			append_dev(div1, t26);
    			append_dev(div1, p10);
    			append_dev(div1, t28);
    			append_dev(div1, p11);
    			append_dev(div1, t30);
    			append_dev(div1, p12);
    			append_dev(div1, t32);
    			append_dev(div1, p13);
    			append_dev(div1, t34);
    			append_dev(div1, p14);
    			append_dev(p14, t35);
    			append_dev(p14, br3);
    			append_dev(p14, t36);
    			append_dev(p14, br4);
    			append_dev(p14, t37);
    			append_dev(p14, br5);
    			append_dev(p14, t38);
    			append_dev(p14, br6);
    			append_dev(p14, t39);
    			append_dev(p14, br7);
    			append_dev(p14, t40);
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!img1_intro) {
    				add_render_callback(() => {
    					img1_intro = create_in_transition(img1, fly, { x: 200, duration: 3000 });
    					img1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
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
    	validate_slots('IPC', slots, []);
    	let imageUrl = '/IPCEB.jpg';
    	let logoUrl = '/IPCLOGO.png';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<IPC> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fly, imageUrl, logoUrl });

    	$$self.$inject_state = $$props => {
    		if ('imageUrl' in $$props) $$invalidate(0, imageUrl = $$props.imageUrl);
    		if ('logoUrl' in $$props) $$invalidate(1, logoUrl = $$props.logoUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageUrl, logoUrl];
    }

    class IPC extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IPC",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Resources.svelte generated by Svelte v3.59.2 */

    const file$6 = "src\\Resources.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (31:2) {#each items as item}
    function create_each_block_2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[12].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Study Guides");
    			attr_dev(img, "class", "svelte-1pfgckf");
    			add_location(img, file$6, 32, 6, 947);
    			attr_dev(div, "class", "item svelte-1pfgckf");
    			add_location(div, file$6, 31, 4, 882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false, false);
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(31:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    // (40:2) {#each items2 as item2}
    function create_each_block_1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[4](/*item2*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = /*item2*/ ctx[9].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Resources");
    			attr_dev(img, "class", "svelte-1pfgckf");
    			add_location(img, file$6, 41, 6, 1187);
    			attr_dev(div, "class", "item svelte-1pfgckf");
    			add_location(div, file$6, 40, 4, 1121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_1, false, false, false, false);
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(40:2) {#each items2 as item2}",
    		ctx
    	});

    	return block;
    }

    // (49:2) {#each items3 as item3}
    function create_each_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[5](/*item3*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = /*item3*/ ctx[6].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Portfolios");
    			attr_dev(img, "class", "svelte-1pfgckf");
    			add_location(img, file$6, 50, 6, 1432);
    			attr_dev(div, "class", "item svelte-1pfgckf");
    			add_location(div, file$6, 49, 4, 1366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_2, false, false, false, false);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(49:2) {#each items3 as item3}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let h10;
    	let t1;
    	let div0;
    	let t2;
    	let h11;
    	let t4;
    	let div1;
    	let t5;
    	let h12;
    	let t7;
    	let div2;
    	let each_value_2 = /*items*/ ctx[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*items2*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*items3*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h10 = element("h1");
    			h10.textContent = "Study Guides";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			h11 = element("h1");
    			h11.textContent = "Resources";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			h12 = element("h1");
    			h12.textContent = "Portfolio Guides";
    			t7 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h10, "class", "gallery-heading svelte-1pfgckf");
    			add_location(h10, file$6, 28, 0, 783);
    			attr_dev(div0, "class", "gallery svelte-1pfgckf");
    			add_location(div0, file$6, 29, 0, 830);
    			attr_dev(h11, "class", "gallery-heading svelte-1pfgckf");
    			add_location(h11, file$6, 37, 0, 1023);
    			attr_dev(div1, "class", "gallery svelte-1pfgckf");
    			add_location(div1, file$6, 38, 0, 1067);
    			attr_dev(h12, "class", "gallery-heading svelte-1pfgckf");
    			add_location(h12, file$6, 46, 0, 1261);
    			attr_dev(div2, "class", "gallery svelte-1pfgckf");
    			add_location(div2, file$6, 47, 0, 1312);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(div0, null);
    				}
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div1, null);
    				}
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, h12, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div2, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*downloadPDF, items*/ 1) {
    				each_value_2 = /*items*/ ctx[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*downloadPDF, items2*/ 2) {
    				each_value_1 = /*items2*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*downloadPDF, items3*/ 4) {
    				each_value = /*items3*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
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
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h12);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
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

    function downloadPDF(pdfUrl) {
    	const link = document.createElement('a');
    	link.href = pdfUrl;
    	link.setAttribute('download', '');
    	document.body.appendChild(link);
    	link.click();
    	document.body.removeChild(link);
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Resources', slots, []);

    	let items = [
    		{ img: '/UNSC.png', pdf: '/pdfs/UNSC.pdf' },
    		{
    			img: '/AIPPM.png',
    			pdf: '/pdfs/AIPPM.pdf'
    		},
    		{ img: '/JSC.png', pdf: '/pdfs/JSC.pdf' },
    		{
    			img: '/ASEAN.png',
    			pdf: '/pdfs/ASEAN.pdf'
    		},
    		{ img: '/AL.png', pdf: '/pdfs/AL.pdf' },
    		{ img: '/IPC.png', pdf: '/pdfs/IPC.pdf' }
    	];

    	let items2 = [
    		{
    			img: '/handbook.png',
    			pdf: '/pdfs/BOSCO_MUN_CONFERENCE_HANDBOOK.pdf'
    		}
    	];

    	let items3 = [
    		{
    			img: '/portfolio.png',
    			pdf: '/pdfs/JSCPORTFOLIO.pdf'
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Resources> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => downloadPDF(item.pdf);
    	const click_handler_1 = item2 => downloadPDF(item2.pdf);
    	const click_handler_2 = item3 => downloadPDF(item3.pdf);
    	$$self.$capture_state = () => ({ items, items2, items3, downloadPDF });

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('items2' in $$props) $$invalidate(1, items2 = $$props.items2);
    		if ('items3' in $$props) $$invalidate(2, items3 = $$props.items3);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, items2, items3, click_handler, click_handler_1, click_handler_2];
    }

    class Resources extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resources",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.59.2 */

    const file$5 = "src\\Footer.svelte";

    function create_fragment$5(ctx) {
    	let div10;
    	let div9;
    	let div8;
    	let div1;
    	let h40;
    	let t1;
    	let div0;
    	let p0;
    	let i0;
    	let t2;
    	let t3;
    	let p1;
    	let i1;
    	let t4;
    	let a0;
    	let t6;
    	let p2;
    	let i2;
    	let t7;
    	let t8;
    	let div4;
    	let h41;
    	let t10;
    	let div3;
    	let div2;
    	let a1;
    	let span0;
    	let i3;
    	let t11;
    	let span1;
    	let t13;
    	let div7;
    	let h42;
    	let t15;
    	let div6;
    	let div5;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div1 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Contact us:";
    			t1 = space();
    			div0 = element("div");
    			p0 = element("p");
    			i0 = element("i");
    			t2 = text(" Phone: +91 33 2287-9202");
    			t3 = space();
    			p1 = element("p");
    			i1 = element("i");
    			t4 = space();
    			a0 = element("a");
    			a0.textContent = "dbpc.boscomun@gmail.com";
    			t6 = space();
    			p2 = element("p");
    			i2 = element("i");
    			t7 = text(" Address: 23, Darga Rd, Park Circus, Beniapukur, Kolkata, West Bengal 700017");
    			t8 = space();
    			div4 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Connect On:";
    			t10 = space();
    			div3 = element("div");
    			div2 = element("div");
    			a1 = element("a");
    			span0 = element("span");
    			i3 = element("i");
    			t11 = space();
    			span1 = element("span");
    			span1.textContent = "Instagram";
    			t13 = space();
    			div7 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Locate us:";
    			t15 = space();
    			div6 = element("div");
    			div5 = element("div");
    			iframe = element("iframe");
    			attr_dev(h40, "class", "text-white mb-4 svelte-n268od");
    			add_location(h40, file$5, 130, 8, 2121);
    			attr_dev(i0, "class", "fas fa-phone-alt");
    			add_location(i0, file$5, 133, 12, 2241);
    			attr_dev(p0, "class", "text-white svelte-n268od");
    			add_location(p0, file$5, 132, 10, 2205);
    			attr_dev(i1, "class", "fas fa-envelope");
    			add_location(i1, file$5, 136, 12, 2361);
    			attr_dev(a0, "href", "mailto:dbpc.boscomun@gmail.com");
    			attr_dev(a0, "class", "text-white svelte-n268od");
    			add_location(a0, file$5, 137, 12, 2406);
    			attr_dev(p1, "class", "text-white svelte-n268od");
    			add_location(p1, file$5, 135, 10, 2325);
    			attr_dev(i2, "class", "fas fa-map-marker-alt");
    			add_location(i2, file$5, 140, 12, 2557);
    			attr_dev(p2, "class", "text-white svelte-n268od");
    			add_location(p2, file$5, 139, 10, 2521);
    			attr_dev(div0, "class", "mt-4 svelte-n268od");
    			add_location(div0, file$5, 131, 8, 2175);
    			attr_dev(div1, "class", "col svelte-n268od");
    			add_location(div1, file$5, 129, 6, 2094);
    			attr_dev(h41, "class", "text-white mb-4 svelte-n268od");
    			add_location(h41, file$5, 146, 8, 2753);
    			attr_dev(i3, "class", "fab fa-instagram");
    			add_location(i3, file$5, 150, 53, 3080);
    			attr_dev(span0, "class", "elementor-icon-list-icon svelte-n268od");
    			add_location(span0, file$5, 150, 14, 3041);
    			attr_dev(span1, "class", "elementor-icon-list-text svelte-n268od");
    			add_location(span1, file$5, 151, 14, 3135);
    			attr_dev(a1, "href", "https://www.instagram.com/boscomun2024");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-n268od");
    			add_location(a1, file$5, 149, 12, 2960);
    			attr_dev(div2, "class", "elementor-icon-list-item elementor-inline-item mb-4 svelte-n268od");
    			add_location(div2, file$5, 148, 10, 2881);
    			attr_dev(div3, "class", "elementor-icon-list-items elementor-inline-items");
    			add_location(div3, file$5, 147, 8, 2807);
    			attr_dev(div4, "class", "col svelte-n268od");
    			add_location(div4, file$5, 145, 6, 2726);
    			attr_dev(h42, "class", "text-white mb-4 svelte-n268od");
    			add_location(h42, file$5, 158, 8, 3293);
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "100%");
    			attr_dev(iframe, "id", "gmap_canvas");
    			if (!src_url_equal(iframe.src, iframe_src_value = "https://maps.google.com/maps?q=Don+Bosco+School+Park+Circus&t=&z=13&ie=UTF8&iwloc=&output=embed")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "scrolling", "no");
    			attr_dev(iframe, "marginheight", "0");
    			attr_dev(iframe, "marginwidth", "0");
    			add_location(iframe, file$5, 161, 12, 3419);
    			attr_dev(div5, "class", "gmap_canvas svelte-n268od");
    			add_location(div5, file$5, 160, 10, 3380);
    			attr_dev(div6, "class", "mapouter svelte-n268od");
    			add_location(div6, file$5, 159, 8, 3346);
    			attr_dev(div7, "class", "col svelte-n268od");
    			add_location(div7, file$5, 157, 6, 3266);
    			attr_dev(div8, "class", "row svelte-n268od");
    			add_location(div8, file$5, 128, 4, 2069);
    			attr_dev(div9, "class", "container svelte-n268od");
    			add_location(div9, file$5, 127, 2, 2040);
    			attr_dev(div10, "class", "footer svelte-n268od");
    			add_location(div10, file$5, 126, 0, 2016);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div1);
    			append_dev(div1, h40);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, i0);
    			append_dev(p0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(p1, i1);
    			append_dev(p1, t4);
    			append_dev(p1, a0);
    			append_dev(div0, t6);
    			append_dev(div0, p2);
    			append_dev(p2, i2);
    			append_dev(p2, t7);
    			append_dev(div8, t8);
    			append_dev(div8, div4);
    			append_dev(div4, h41);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, a1);
    			append_dev(a1, span0);
    			append_dev(span0, i3);
    			append_dev(a1, t11);
    			append_dev(a1, span1);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, h42);
    			append_dev(div7, t15);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, iframe);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\OurTeam.svelte generated by Svelte v3.59.2 */
    const file$4 = "src\\OurTeam.svelte";

    function create_fragment$4(ctx) {
    	let div2;
    	let div1;
    	let h1;
    	let t1;
    	let h20;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let h21;
    	let t9;
    	let p2;
    	let t11;
    	let p3;
    	let t13;
    	let p4;
    	let t15;
    	let h22;
    	let t17;
    	let h30;
    	let t19;
    	let p5;
    	let t21;
    	let div0;
    	let h31;
    	let t23;
    	let p6;
    	let t25;
    	let p7;
    	let t27;
    	let p8;
    	let t29;
    	let h32;
    	let t31;
    	let p9;
    	let t33;
    	let p10;
    	let t35;
    	let p11;
    	let t37;
    	let h23;
    	let t39;
    	let h33;
    	let t41;
    	let p12;
    	let t43;
    	let p13;
    	let t45;
    	let p14;
    	let t47;
    	let p15;
    	let t49;
    	let h34;
    	let t51;
    	let p16;
    	let t53;
    	let p17;
    	let t55;
    	let p18;
    	let t57;
    	let p19;
    	let t59;
    	let h35;
    	let t61;
    	let p20;
    	let t63;
    	let p21;
    	let t65;
    	let p22;
    	let t67;
    	let p23;
    	let t69;
    	let h36;
    	let t71;
    	let p24;
    	let t73;
    	let p25;
    	let t75;
    	let p26;
    	let t77;
    	let h37;
    	let t79;
    	let p27;
    	let t81;
    	let p28;
    	let t83;
    	let p29;
    	let t85;
    	let h38;
    	let t87;
    	let p30;
    	let t89;
    	let p31;
    	let t91;
    	let footer;
    	let current;
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Our Team";
    			t1 = space();
    			h20 = element("h2");
    			h20.textContent = "TEACHERS";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Mrs. Rebecca V.T. Karthak";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Ms. Saayani Dey";
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "THE SECRETARIAT";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "SECRETARY GENERAL: Devansh Agarwal - +91 90074 27633";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "CO - DEPUTY SECRETARY GENERAL: Amay Rathore - +91 84207 13614";
    			t13 = space();
    			p4 = element("p");
    			p4.textContent = "CO - DEPUTY SECRETARY GENERAL: Rohaan Chakraborty - +91 91470 71668";
    			t15 = space();
    			h22 = element("h2");
    			h22.textContent = "TECH TEAM";
    			t17 = space();
    			h30 = element("h3");
    			h30.textContent = "VIDEO EDITING";
    			t19 = space();
    			p5 = element("p");
    			p5.textContent = "Pavvit Singh Batra";
    			t21 = space();
    			div0 = element("div");
    			h31 = element("h3");
    			h31.textContent = "WEBSITE";
    			t23 = space();
    			p6 = element("p");
    			p6.textContent = "Hemang Domadia";
    			t25 = space();
    			p7 = element("p");
    			p7.textContent = "Soham Chowdhury";
    			t27 = space();
    			p8 = element("p");
    			p8.textContent = "Sumedh Gadia";
    			t29 = space();
    			h32 = element("h3");
    			h32.textContent = "GRAPHICS";
    			t31 = space();
    			p9 = element("p");
    			p9.textContent = "Ritesh Agarwal";
    			t33 = space();
    			p10 = element("p");
    			p10.textContent = "Archit Tibrewala";
    			t35 = space();
    			p11 = element("p");
    			p11.textContent = "Abhiraj Chatterjee";
    			t37 = space();
    			h23 = element("h2");
    			h23.textContent = "EXECUTIVE BOARD";
    			t39 = space();
    			h33 = element("h3");
    			h33.textContent = "UNITED NATIONS SECURITY COUNCIL";
    			t41 = space();
    			p12 = element("p");
    			p12.textContent = "Chairperson: Devansh Agarwal";
    			t43 = space();
    			p13 = element("p");
    			p13.textContent = "Vice Chairperson: Aryaman Saraogi";
    			t45 = space();
    			p14 = element("p");
    			p14.textContent = "Director: Shubham Sethia";
    			t47 = space();
    			p15 = element("p");
    			p15.textContent = "Rapporteur: Harshvardhan Saraf";
    			t49 = space();
    			h34 = element("h3");
    			h34.textContent = "ALL INDIA POLITICAL PARTY MEET";
    			t51 = space();
    			p16 = element("p");
    			p16.textContent = "Chairpersons: Amay Rathore";
    			t53 = space();
    			p17 = element("p");
    			p17.textContent = "Vice Chairperson: Pranjal Tripathi";
    			t55 = space();
    			p18 = element("p");
    			p18.textContent = "Director:  Shaurya Khaitan";
    			t57 = space();
    			p19 = element("p");
    			p19.textContent = "Rapporteur: Shreyas Garg";
    			t59 = space();
    			h35 = element("h3");
    			h35.textContent = "JOSEPH STALIN’S CABINET";
    			t61 = space();
    			p20 = element("p");
    			p20.textContent = "Chairpersons: Rohaan Chakraborty";
    			t63 = space();
    			p21 = element("p");
    			p21.textContent = "Vice Chairperson: Abhiraj Chatterjee";
    			t65 = space();
    			p22 = element("p");
    			p22.textContent = "Director:  Dhrishit Dasgupta";
    			t67 = space();
    			p23 = element("p");
    			p23.textContent = "Rapporteur: Aryaveer Agarwal";
    			t69 = space();
    			h36 = element("h3");
    			h36.textContent = "ASSOCIATION OF SOUTHEAST ASIAN NATIONS";
    			t71 = space();
    			p24 = element("p");
    			p24.textContent = "Co - Chairpersons: Pavvit Singh Batra & Om Arya Paul";
    			t73 = space();
    			p25 = element("p");
    			p25.textContent = "Vice Chairperson: Shreyansh Surana";
    			t75 = space();
    			p26 = element("p");
    			p26.textContent = "Rapporteur: Rajveer Kumar Pruthi";
    			t77 = space();
    			h37 = element("h3");
    			h37.textContent = "ARAB LEAGUE";
    			t79 = space();
    			p27 = element("p");
    			p27.textContent = "Co - Chairpersons: Yuvraj Berlia and Devansh Sharma";
    			t81 = space();
    			p28 = element("p");
    			p28.textContent = "Vice Chairperson: Siddhant Khinwasara";
    			t83 = space();
    			p29 = element("p");
    			p29.textContent = "Rapporteur: Ayush Abhinandan Choudhury";
    			t85 = space();
    			h38 = element("h3");
    			h38.textContent = "INTERNATIONAL PRESS CORPS";
    			t87 = space();
    			p30 = element("p");
    			p30.textContent = "Press Head: Riddhiman Gangopadhyay";
    			t89 = space();
    			p31 = element("p");
    			p31.textContent = "Deputy Press Head: Himank More";
    			t91 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h1, "class", "svelte-14n03nn");
    			add_location(h1, file$4, 101, 8, 2093);
    			attr_dev(h20, "class", "svelte-14n03nn");
    			add_location(h20, file$4, 102, 8, 2120);
    			attr_dev(p0, "class", "svelte-14n03nn");
    			add_location(p0, file$4, 103, 8, 2147);
    			attr_dev(p1, "class", "svelte-14n03nn");
    			add_location(p1, file$4, 104, 8, 2189);
    			attr_dev(h21, "class", "svelte-14n03nn");
    			add_location(h21, file$4, 105, 8, 2221);
    			attr_dev(p2, "class", "svelte-14n03nn");
    			add_location(p2, file$4, 106, 8, 2255);
    			attr_dev(p3, "class", "svelte-14n03nn");
    			add_location(p3, file$4, 107, 8, 2324);
    			attr_dev(p4, "class", "svelte-14n03nn");
    			add_location(p4, file$4, 108, 8, 2402);
    			attr_dev(h22, "class", "svelte-14n03nn");
    			add_location(h22, file$4, 110, 8, 2488);
    			attr_dev(h30, "class", "svelte-14n03nn");
    			add_location(h30, file$4, 111, 8, 2516);
    			attr_dev(p5, "class", "svelte-14n03nn");
    			add_location(p5, file$4, 112, 8, 2548);
    			attr_dev(h31, "class", "svelte-14n03nn");
    			add_location(h31, file$4, 114, 8, 2614);
    			attr_dev(p6, "class", "svelte-14n03nn");
    			add_location(p6, file$4, 115, 8, 2640);
    			attr_dev(p7, "class", "svelte-14n03nn");
    			add_location(p7, file$4, 116, 8, 2671);
    			attr_dev(p8, "class", "svelte-14n03nn");
    			add_location(p8, file$4, 117, 8, 2703);
    			attr_dev(div0, "class", "website svelte-14n03nn");
    			add_location(div0, file$4, 113, 8, 2583);
    			attr_dev(h32, "class", "svelte-14n03nn");
    			add_location(h32, file$4, 119, 8, 2744);
    			attr_dev(p9, "class", "svelte-14n03nn");
    			add_location(p9, file$4, 120, 8, 2771);
    			attr_dev(p10, "class", "svelte-14n03nn");
    			add_location(p10, file$4, 121, 8, 2802);
    			attr_dev(p11, "class", "svelte-14n03nn");
    			add_location(p11, file$4, 122, 8, 2835);
    			attr_dev(h23, "class", "svelte-14n03nn");
    			add_location(h23, file$4, 123, 8, 2870);
    			attr_dev(h33, "class", "svelte-14n03nn");
    			add_location(h33, file$4, 125, 8, 2906);
    			attr_dev(p12, "class", "svelte-14n03nn");
    			add_location(p12, file$4, 126, 8, 2964);
    			attr_dev(p13, "class", "svelte-14n03nn");
    			add_location(p13, file$4, 127, 8, 3009);
    			attr_dev(p14, "class", "svelte-14n03nn");
    			add_location(p14, file$4, 128, 8, 3067);
    			attr_dev(p15, "class", "svelte-14n03nn");
    			add_location(p15, file$4, 129, 8, 3116);
    			attr_dev(h34, "class", "svelte-14n03nn");
    			add_location(h34, file$4, 131, 8, 3173);
    			attr_dev(p16, "class", "svelte-14n03nn");
    			add_location(p16, file$4, 132, 8, 3230);
    			attr_dev(p17, "class", "svelte-14n03nn");
    			add_location(p17, file$4, 133, 8, 3273);
    			attr_dev(p18, "class", "svelte-14n03nn");
    			add_location(p18, file$4, 134, 8, 3332);
    			attr_dev(p19, "class", "svelte-14n03nn");
    			add_location(p19, file$4, 135, 8, 3383);
    			attr_dev(h35, "class", "svelte-14n03nn");
    			add_location(h35, file$4, 137, 8, 3434);
    			attr_dev(p20, "class", "svelte-14n03nn");
    			add_location(p20, file$4, 138, 8, 3476);
    			attr_dev(p21, "class", "svelte-14n03nn");
    			add_location(p21, file$4, 139, 8, 3525);
    			attr_dev(p22, "class", "svelte-14n03nn");
    			add_location(p22, file$4, 140, 8, 3586);
    			attr_dev(p23, "class", "svelte-14n03nn");
    			add_location(p23, file$4, 141, 8, 3639);
    			attr_dev(h36, "class", "svelte-14n03nn");
    			add_location(h36, file$4, 143, 8, 3694);
    			attr_dev(p24, "class", "svelte-14n03nn");
    			add_location(p24, file$4, 144, 8, 3758);
    			attr_dev(p25, "class", "svelte-14n03nn");
    			add_location(p25, file$4, 145, 8, 3835);
    			attr_dev(p26, "class", "svelte-14n03nn");
    			add_location(p26, file$4, 146, 8, 3886);
    			attr_dev(h37, "class", "svelte-14n03nn");
    			add_location(h37, file$4, 149, 8, 3943);
    			attr_dev(p27, "class", "svelte-14n03nn");
    			add_location(p27, file$4, 150, 8, 3981);
    			attr_dev(p28, "class", "svelte-14n03nn");
    			add_location(p28, file$4, 151, 8, 4057);
    			attr_dev(p29, "class", "svelte-14n03nn");
    			add_location(p29, file$4, 152, 8, 4118);
    			attr_dev(h38, "class", "svelte-14n03nn");
    			add_location(h38, file$4, 154, 8, 4183);
    			attr_dev(p30, "class", "svelte-14n03nn");
    			add_location(p30, file$4, 155, 8, 4235);
    			attr_dev(p31, "class", "svelte-14n03nn");
    			add_location(p31, file$4, 156, 8, 4294);
    			attr_dev(div1, "class", "contact-details svelte-14n03nn");
    			add_location(div1, file$4, 100, 4, 2054);
    			attr_dev(div2, "class", "contact-us-container svelte-14n03nn");
    			add_location(div2, file$4, 99, 0, 2014);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, h20);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(div1, t7);
    			append_dev(div1, h21);
    			append_dev(div1, t9);
    			append_dev(div1, p2);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(div1, t13);
    			append_dev(div1, p4);
    			append_dev(div1, t15);
    			append_dev(div1, h22);
    			append_dev(div1, t17);
    			append_dev(div1, h30);
    			append_dev(div1, t19);
    			append_dev(div1, p5);
    			append_dev(div1, t21);
    			append_dev(div1, div0);
    			append_dev(div0, h31);
    			append_dev(div0, t23);
    			append_dev(div0, p6);
    			append_dev(div0, t25);
    			append_dev(div0, p7);
    			append_dev(div0, t27);
    			append_dev(div0, p8);
    			append_dev(div1, t29);
    			append_dev(div1, h32);
    			append_dev(div1, t31);
    			append_dev(div1, p9);
    			append_dev(div1, t33);
    			append_dev(div1, p10);
    			append_dev(div1, t35);
    			append_dev(div1, p11);
    			append_dev(div1, t37);
    			append_dev(div1, h23);
    			append_dev(div1, t39);
    			append_dev(div1, h33);
    			append_dev(div1, t41);
    			append_dev(div1, p12);
    			append_dev(div1, t43);
    			append_dev(div1, p13);
    			append_dev(div1, t45);
    			append_dev(div1, p14);
    			append_dev(div1, t47);
    			append_dev(div1, p15);
    			append_dev(div1, t49);
    			append_dev(div1, h34);
    			append_dev(div1, t51);
    			append_dev(div1, p16);
    			append_dev(div1, t53);
    			append_dev(div1, p17);
    			append_dev(div1, t55);
    			append_dev(div1, p18);
    			append_dev(div1, t57);
    			append_dev(div1, p19);
    			append_dev(div1, t59);
    			append_dev(div1, h35);
    			append_dev(div1, t61);
    			append_dev(div1, p20);
    			append_dev(div1, t63);
    			append_dev(div1, p21);
    			append_dev(div1, t65);
    			append_dev(div1, p22);
    			append_dev(div1, t67);
    			append_dev(div1, p23);
    			append_dev(div1, t69);
    			append_dev(div1, h36);
    			append_dev(div1, t71);
    			append_dev(div1, p24);
    			append_dev(div1, t73);
    			append_dev(div1, p25);
    			append_dev(div1, t75);
    			append_dev(div1, p26);
    			append_dev(div1, t77);
    			append_dev(div1, h37);
    			append_dev(div1, t79);
    			append_dev(div1, p27);
    			append_dev(div1, t81);
    			append_dev(div1, p28);
    			append_dev(div1, t83);
    			append_dev(div1, p29);
    			append_dev(div1, t85);
    			append_dev(div1, h38);
    			append_dev(div1, t87);
    			append_dev(div1, p30);
    			append_dev(div1, t89);
    			append_dev(div1, p31);
    			insert_dev(target, t91, anchor);
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
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t91);
    			destroy_component(footer, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OurTeam', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OurTeam> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Footer });
    	return [];
    }

    class OurTeam extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OurTeam",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Navbar.svelte generated by Svelte v3.59.2 */
    const file$3 = "src\\Navbar.svelte";

    function create_fragment$3(ctx) {
    	let div9;
    	let div4;
    	let a0;
    	let t1;
    	let div1;
    	let a1;
    	let t3;
    	let div0;
    	let a2;
    	let t5;
    	let a3;
    	let t7;
    	let a4;
    	let t9;
    	let a5;
    	let div0_class_value;
    	let t11;
    	let div3;
    	let a6;
    	let t13;
    	let div2;
    	let a7;
    	let t15;
    	let a8;
    	let t17;
    	let a9;
    	let t19;
    	let a10;
    	let t21;
    	let a11;
    	let t23;
    	let a12;
    	let div2_class_value;
    	let t25;
    	let a13;
    	let t27;
    	let a14;
    	let t29;
    	let a15;
    	let div4_class_value;
    	let t31;
    	let div8;
    	let div5;
    	let t32;
    	let div6;
    	let t33;
    	let div7;
    	let div8_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div4 = element("div");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t1 = space();
    			div1 = element("div");
    			a1 = element("a");
    			a1.textContent = "About";
    			t3 = space();
    			div0 = element("div");
    			a2 = element("a");
    			a2.textContent = "About BoscoMUN";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Rector Principal's Address";
    			t7 = space();
    			a4 = element("a");
    			a4.textContent = "Secretary General's Message";
    			t9 = space();
    			a5 = element("a");
    			a5.textContent = "Deputy Secretary General's Message";
    			t11 = space();
    			div3 = element("div");
    			a6 = element("a");
    			a6.textContent = "Committees";
    			t13 = space();
    			div2 = element("div");
    			a7 = element("a");
    			a7.textContent = "United Nations Security Council";
    			t15 = space();
    			a8 = element("a");
    			a8.textContent = "All India Political Parties Meet";
    			t17 = space();
    			a9 = element("a");
    			a9.textContent = "Joseph Stalin’s Cabinet";
    			t19 = space();
    			a10 = element("a");
    			a10.textContent = "Association of Southeast Asian Nations";
    			t21 = space();
    			a11 = element("a");
    			a11.textContent = "Arab League";
    			t23 = space();
    			a12 = element("a");
    			a12.textContent = "International Press Corps";
    			t25 = space();
    			a13 = element("a");
    			a13.textContent = "Resources";
    			t27 = space();
    			a14 = element("a");
    			a14.textContent = "Individual Registration";
    			t29 = space();
    			a15 = element("a");
    			a15.textContent = "Our Team";
    			t31 = space();
    			div8 = element("div");
    			div5 = element("div");
    			t32 = space();
    			div6 = element("div");
    			t33 = space();
    			div7 = element("div");
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-30870c");
    			add_location(a0, file$3, 307, 4, 6422);
    			attr_dev(a1, "href", "#about");
    			attr_dev(a1, "class", "dropbtn svelte-30870c");
    			add_location(a1, file$3, 309, 6, 6501);
    			attr_dev(a2, "href", "/AboutBoscoMUN");
    			attr_dev(a2, "class", "svelte-30870c");
    			add_location(a2, file$3, 311, 8, 6650);
    			attr_dev(a3, "href", "/PrincipalAddress");
    			attr_dev(a3, "class", "svelte-30870c");
    			add_location(a3, file$3, 312, 8, 6726);
    			attr_dev(a4, "href", "/SecGenMessage");
    			attr_dev(a4, "class", "svelte-30870c");
    			add_location(a4, file$3, 313, 8, 6817);
    			attr_dev(a5, "href", "/DepSecGenMessage");
    			attr_dev(a5, "class", "svelte-30870c");
    			add_location(a5, file$3, 314, 8, 6906);
    			attr_dev(div0, "class", div0_class_value = "dropdown-content " + (/*dropdowns*/ ctx[1]['#about'] ? 'show' : '') + " svelte-30870c");
    			add_location(div0, file$3, 310, 6, 6574);
    			attr_dev(div1, "class", "dropdown svelte-30870c");
    			add_location(div1, file$3, 308, 4, 6471);
    			attr_dev(a6, "href", "#committees");
    			attr_dev(a6, "class", "dropbtn svelte-30870c");
    			add_location(a6, file$3, 318, 6, 7057);
    			attr_dev(a7, "href", "/UNSC");
    			attr_dev(a7, "class", "svelte-30870c");
    			add_location(a7, file$3, 320, 8, 7221);
    			attr_dev(a8, "href", "/AIPPM");
    			attr_dev(a8, "class", "svelte-30870c");
    			add_location(a8, file$3, 321, 8, 7305);
    			attr_dev(a9, "href", "/JSC");
    			attr_dev(a9, "class", "svelte-30870c");
    			add_location(a9, file$3, 322, 8, 7391);
    			attr_dev(a10, "href", "/ASEAN");
    			attr_dev(a10, "class", "svelte-30870c");
    			add_location(a10, file$3, 323, 8, 7466);
    			attr_dev(a11, "href", "/AL");
    			attr_dev(a11, "class", "svelte-30870c");
    			add_location(a11, file$3, 324, 8, 7558);
    			attr_dev(a12, "href", "/IPC");
    			attr_dev(a12, "class", "svelte-30870c");
    			add_location(a12, file$3, 325, 8, 7620);
    			attr_dev(div2, "class", div2_class_value = "dropdown-content " + (/*dropdowns*/ ctx[1]['#committees'] ? 'show' : '') + " svelte-30870c");
    			add_location(div2, file$3, 319, 6, 7140);
    			attr_dev(div3, "class", "dropdown svelte-30870c");
    			add_location(div3, file$3, 317, 4, 7027);
    			attr_dev(a13, "href", "/Resources");
    			attr_dev(a13, "class", "svelte-30870c");
    			add_location(a13, file$3, 328, 4, 7719);
    			attr_dev(a14, "href", "/IndividualRegistration");
    			attr_dev(a14, "class", "hide-on-mobile svelte-30870c");
    			add_location(a14, file$3, 329, 4, 7782);
    			attr_dev(a15, "href", "/OurTeam");
    			attr_dev(a15, "class", "svelte-30870c");
    			add_location(a15, file$3, 330, 4, 7895);
    			attr_dev(div4, "class", div4_class_value = "menu-items " + (/*showMenu*/ ctx[0] ? 'show' : '') + " svelte-30870c");
    			add_location(div4, file$3, 306, 2, 6367);
    			attr_dev(div5, "class", "svelte-30870c");
    			add_location(div5, file$3, 340, 4, 8156);
    			attr_dev(div6, "class", "svelte-30870c");
    			add_location(div6, file$3, 341, 4, 8173);
    			attr_dev(div7, "class", "svelte-30870c");
    			add_location(div7, file$3, 342, 4, 8190);
    			attr_dev(div8, "class", div8_class_value = "burger-menu " + (/*showMenu*/ ctx[0] ? 'active' : '') + " svelte-30870c");
    			attr_dev(div8, "tabindex", "0");
    			attr_dev(div8, "role", "button");
    			attr_dev(div8, "aria-label", "Toggle menu");
    			add_location(div8, file$3, 332, 2, 7963);
    			attr_dev(div9, "class", "navbar svelte-30870c");
    			add_location(div9, file$3, 305, 0, 6343);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div4);
    			append_dev(div4, a0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, a1);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, a2);
    			append_dev(div0, t5);
    			append_dev(div0, a3);
    			append_dev(div0, t7);
    			append_dev(div0, a4);
    			append_dev(div0, t9);
    			append_dev(div0, a5);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, a6);
    			append_dev(div3, t13);
    			append_dev(div3, div2);
    			append_dev(div2, a7);
    			append_dev(div2, t15);
    			append_dev(div2, a8);
    			append_dev(div2, t17);
    			append_dev(div2, a9);
    			append_dev(div2, t19);
    			append_dev(div2, a10);
    			append_dev(div2, t21);
    			append_dev(div2, a11);
    			append_dev(div2, t23);
    			append_dev(div2, a12);
    			append_dev(div4, t25);
    			append_dev(div4, a13);
    			append_dev(div4, t27);
    			append_dev(div4, a14);
    			append_dev(div4, t29);
    			append_dev(div4, a15);
    			append_dev(div9, t31);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div8, t32);
    			append_dev(div8, div6);
    			append_dev(div8, t33);
    			append_dev(div8, div7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a1, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a2, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a3, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a4, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a5, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a6, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a7, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a8, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a9, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a10, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a11, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a12, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a13, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a14, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(a15, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(div8, "click", /*toggleMenu*/ ctx[3], false, false, false, false),
    					listen_dev(div8, "keydown", /*handleKeydown*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dropdowns*/ 2 && div0_class_value !== (div0_class_value = "dropdown-content " + (/*dropdowns*/ ctx[1]['#about'] ? 'show' : '') + " svelte-30870c")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*dropdowns*/ 2 && div2_class_value !== (div2_class_value = "dropdown-content " + (/*dropdowns*/ ctx[1]['#committees'] ? 'show' : '') + " svelte-30870c")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*showMenu*/ 1 && div4_class_value !== (div4_class_value = "menu-items " + (/*showMenu*/ ctx[0] ? 'show' : '') + " svelte-30870c")) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (dirty & /*showMenu*/ 1 && div8_class_value !== (div8_class_value = "burger-menu " + (/*showMenu*/ ctx[0] ? 'active' : '') + " svelte-30870c")) {
    				attr_dev(div8, "class", div8_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let showMenu = false;
    	let dropdowns = { '#about': false, '#committees': false };

    	function handleClick(event) {
    		const href = event.currentTarget.getAttribute('href');
    		const isDropdown = event.currentTarget.classList.contains('dropbtn');

    		if (!isDropdown) {
    			event.preventDefault();
    			$$invalidate(1, dropdowns = { '#about': false, '#committees': false });

    			if (href.startsWith('http')) {
    				window.open(href, '_blank');
    			} else {
    				navigate(href);

    				if (window.innerWidth <= 768) {
    					$$invalidate(0, showMenu = false);
    				}
    			}
    		} else {
    			event.preventDefault();
    			const dropdownId = event.currentTarget.getAttribute('href');

    			$$invalidate(1, dropdowns = {
    				'#about': false,
    				'#committees': false,
    				[dropdownId]: !dropdowns[dropdownId]
    			});
    		}
    	}

    	function toggleMenu() {
    		$$invalidate(0, showMenu = !showMenu);

    		if (!showMenu) {
    			$$invalidate(1, dropdowns = { '#about': false, '#committees': false });
    		}
    	}

    	function handleKeydown(event) {
    		if (event.key === 'Enter' || event.key === ' ') {
    			event.preventDefault();
    			toggleMenu();
    		}
    	}

    	function handleClickOutside(event) {
    		if (showMenu && !event.target.closest('.navbar')) {
    			$$invalidate(0, showMenu = false);
    		}

    		if (!event.target.closest('.dropdown')) {
    			$$invalidate(1, dropdowns = { '#about': false, '#committees': false });
    		}
    	}

    	onMount(() => {
    		document.addEventListener('click', handleClickOutside);

    		return () => {
    			document.removeEventListener('click', handleClickOutside);
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		navigate,
    		onMount,
    		showMenu,
    		dropdowns,
    		handleClick,
    		toggleMenu,
    		handleKeydown,
    		handleClickOutside
    	});

    	$$self.$inject_state = $$props => {
    		if ('showMenu' in $$props) $$invalidate(0, showMenu = $$props.showMenu);
    		if ('dropdowns' in $$props) $$invalidate(1, dropdowns = $$props.dropdowns);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showMenu, dropdowns, handleClick, toggleMenu, handleKeydown];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\CustomCursor.svelte generated by Svelte v3.59.2 */
    const file$2 = "src\\CustomCursor.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "custom-cursor " + (/*isClicking*/ ctx[0] ? 'clicking' : '') + " svelte-n7ppbi");
    			add_location(div0, file$2, 66, 2, 1604);
    			attr_dev(div1, "class", "hide-default-cursor svelte-n7ppbi");
    			add_location(div1, file$2, 65, 0, 1567);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*isClicking*/ 1 && div0_class_value !== (div0_class_value = "custom-cursor " + (/*isClicking*/ ctx[0] ? 'clicking' : '') + " svelte-n7ppbi")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
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
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CustomCursor', slots, ['default']);
    	let isClicking = false;
    	let isMobile = false;

    	const updateCursor = e => {
    		const cursor = document.querySelector('.custom-cursor');
    		cursor.style.left = `${e.clientX}px`;
    		cursor.style.top = `${e.clientY}px`;
    	};

    	const handleMouseDown = () => {
    		$$invalidate(0, isClicking = true);

    		setTimeout(
    			() => {
    				$$invalidate(0, isClicking = false);
    			},
    			200
    		);
    	};

    	const handleTouchStart = () => {
    		isMobile = true;
    		const cursor = document.querySelector('.custom-cursor');
    		cursor.style.display = 'none';
    	};

    	onMount(() => {
    		document.addEventListener('mousemove', updateCursor);
    		document.addEventListener('mousedown', handleMouseDown);
    		document.addEventListener('touchstart', handleTouchStart);

    		return () => {
    			document.removeEventListener('mousemove', updateCursor);
    			document.removeEventListener('mousedown', handleMouseDown);
    			document.removeEventListener('touchstart', handleTouchStart);
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CustomCursor> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		isClicking,
    		isMobile,
    		updateCursor,
    		handleMouseDown,
    		handleTouchStart
    	});

    	$$self.$inject_state = $$props => {
    		if ('isClicking' in $$props) $$invalidate(0, isClicking = $$props.isClicking);
    		if ('isMobile' in $$props) isMobile = $$props.isMobile;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isClicking, $$scope, slots];
    }

    class CustomCursor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CustomCursor",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\IndividualRegistration.svelte generated by Svelte v3.59.2 */

    const file$1 = "src\\IndividualRegistration.svelte";

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Individual Registration";
    			t1 = space();
    			iframe = element("iframe");
    			attr_dev(h1, "class", "heading svelte-qo958d");
    			add_location(h1, file$1, 31, 2, 468);
    			if (!src_url_equal(iframe.src, iframe_src_value = "https://forms.gle/513yK2ND7mRX4qS29")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "Individual Registration");
    			attr_dev(iframe, "class", "svelte-qo958d");
    			add_location(iframe, file$1, 32, 2, 520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, iframe, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(iframe);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('IndividualRegistration', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<IndividualRegistration> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class IndividualRegistration extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IndividualRegistration",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    // (25:0) <Router>
    function create_default_slot_1(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let t3;
    	let route4;
    	let t4;
    	let route5;
    	let t5;
    	let route6;
    	let t6;
    	let route7;
    	let t7;
    	let route8;
    	let t8;
    	let route9;
    	let t9;
    	let route10;
    	let t10;
    	let route11;
    	let t11;
    	let route12;
    	let t12;
    	let route13;
    	let t13;
    	let route14;
    	let current;

    	route0 = new Route({
    			props: { path: "/", component: Index },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/AboutBoscoMUN",
    				component: AboutBoscoMUN
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/SecGenMessage",
    				component: SecGenMessage
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/DepSecGenMessage",
    				component: DepSecGenMessage
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "/PrincipalAddress",
    				component: PrincipalAddress
    			},
    			$$inline: true
    		});

    	route5 = new Route({
    			props: { path: "/UNSC", component: UNSC },
    			$$inline: true
    		});

    	route6 = new Route({
    			props: { path: "/AIPPM", component: AIPPM },
    			$$inline: true
    		});

    	route7 = new Route({
    			props: { path: "/JSC", component: JSC },
    			$$inline: true
    		});

    	route8 = new Route({
    			props: { path: "/ASEAN", component: ASEAN },
    			$$inline: true
    		});

    	route9 = new Route({
    			props: { path: "/AL", component: AL },
    			$$inline: true
    		});

    	route10 = new Route({
    			props: { path: "/IPC", component: IPC },
    			$$inline: true
    		});

    	route11 = new Route({
    			props: {
    				path: "/IndividualRegistration",
    				component: IndividualRegistration
    			},
    			$$inline: true
    		});

    	route12 = new Route({
    			props: { path: "/Resources", component: Resources },
    			$$inline: true
    		});

    	route13 = new Route({
    			props: { path: "/OurTeam", component: OurTeam },
    			$$inline: true
    		});

    	route14 = new Route({
    			props: { path: "/Footer", component: Footer },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    			t5 = space();
    			create_component(route6.$$.fragment);
    			t6 = space();
    			create_component(route7.$$.fragment);
    			t7 = space();
    			create_component(route8.$$.fragment);
    			t8 = space();
    			create_component(route9.$$.fragment);
    			t9 = space();
    			create_component(route10.$$.fragment);
    			t10 = space();
    			create_component(route11.$$.fragment);
    			t11 = space();
    			create_component(route12.$$.fragment);
    			t12 = space();
    			create_component(route13.$$.fragment);
    			t13 = space();
    			create_component(route14.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(route6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(route7, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(route8, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(route9, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(route10, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(route11, target, anchor);
    			insert_dev(target, t11, anchor);
    			mount_component(route12, target, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(route13, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(route14, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			transition_in(route7.$$.fragment, local);
    			transition_in(route8.$$.fragment, local);
    			transition_in(route9.$$.fragment, local);
    			transition_in(route10.$$.fragment, local);
    			transition_in(route11.$$.fragment, local);
    			transition_in(route12.$$.fragment, local);
    			transition_in(route13.$$.fragment, local);
    			transition_in(route14.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			transition_out(route8.$$.fragment, local);
    			transition_out(route9.$$.fragment, local);
    			transition_out(route10.$$.fragment, local);
    			transition_out(route11.$$.fragment, local);
    			transition_out(route12.$$.fragment, local);
    			transition_out(route13.$$.fragment, local);
    			transition_out(route14.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(route6, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(route7, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(route8, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(route9, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(route10, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(route11, detaching);
    			if (detaching) detach_dev(t11);
    			destroy_component(route12, detaching);
    			if (detaching) detach_dev(t12);
    			destroy_component(route13, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(route14, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(25:0) <Router>",
    		ctx
    	});

    	return block;
    }

    // (22:0) <CustomCursor>
    function create_default_slot(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let router;
    	let t1;
    	let style;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(router.$$.fragment);
    			t1 = space();
    			style = element("style");
    			style.textContent = "*{\n\t\tcursor: none !important;\n\t}";
    			add_location(main, file, 22, 0, 883);
    			add_location(style, file, 43, 0, 1688);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(router, main, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, style, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(router);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(style);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(22:0) <CustomCursor>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let customcursor;
    	let current;

    	customcursor = new CustomCursor({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(customcursor.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(customcursor, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const customcursor_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				customcursor_changes.$$scope = { dirty, ctx };
    			}

    			customcursor.$set(customcursor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(customcursor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(customcursor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(customcursor, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		Home: Index,
    		AboutBoscoMUN,
    		SecGenMessage,
    		DepSecGenMessage,
    		PrincipalAddress,
    		UNSC,
    		AIPPM,
    		JSC,
    		ASEAN,
    		AL,
    		IPC,
    		Resources,
    		OurTeam,
    		Navbar,
    		Footer,
    		CustomCursor,
    		IndividualRegistration,
    		comment
    	});

    	return [];
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
    	props: {

    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
