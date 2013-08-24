define("/dist/menu", [ "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto" ], function(require, exports, module) {
    var Backbone = require("gallery/backbone/1.0.0/backbone");
    var $ = require("zepto/zepto/1.0.0/zepto");
    var Menu = Backbone.View.extend({
        el: $("header"),
        show: false,
        events: {
            "click .menu-trigger": "toogle"
        },
        initialize: function() {
            this.menu = this.$el.next();
            this.render();
        },
        toogle: function(e) {
            e.preventDefault();
            this.show = !this.show;
            this.render();
        },
        render: function() {
            if (this.show) {
                this.menu.css("height", 172);
            } else {
                this.menu.css("height", 0);
            }
        }
    });
    module.exports = Menu;
});

define("/dist/pixelegos", [ "./menu", "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto", "./tool", "./canvas", "island205/venus/1.0.0/venus" ], function(require, exports, module) {
    var Menu = require("./menu");
    var Tool = require("./tool");
    var Canvas = require("./canvas");
    var $ = require("zepto/zepto/1.0.0/zepto");
    $(function() {
        var menu = new Menu();
        var tool = new Tool();
        var canvas = new Canvas();
        tool.on("select", function(color) {
            canvas.color = color;
        });
        tool.on("erase", function() {
            canvas.color = "white";
        });
    });
});

define("gallery/backbone/1.0.0/backbone", [ "gallery/underscore/1.4.4/underscore", "$" ], function(require, exports) {
    var previousUnderscore = this._;
    var previousJQuery = this.jQuery;
    this._ = require("gallery/underscore/1.4.4/underscore");
    this.jQuery = require("$");
    (function() {
        var root = this;
        var previousBackbone = root.Backbone;
        var array = [];
        var push = array.push;
        var slice = array.slice;
        var splice = array.splice;
        var Backbone;
        if (typeof exports !== "undefined") {
            Backbone = exports;
        } else {
            Backbone = root.Backbone = {};
        }
        Backbone.VERSION = "1.0.0";
        var _ = root._;
        if (!_ && typeof require !== "undefined") _ = require("gallery/underscore/1.4.4/underscore");
        Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;
        Backbone.noConflict = function() {
            root.Backbone = previousBackbone;
            return this;
        };
        Backbone.emulateHTTP = false;
        Backbone.emulateJSON = false;
        var Events = Backbone.Events = {
            on: function(name, callback, context) {
                if (!eventsApi(this, "on", name, [ callback, context ]) || !callback) return this;
                this._events || (this._events = {});
                var events = this._events[name] || (this._events[name] = []);
                events.push({
                    callback: callback,
                    context: context,
                    ctx: context || this
                });
                return this;
            },
            once: function(name, callback, context) {
                if (!eventsApi(this, "once", name, [ callback, context ]) || !callback) return this;
                var self = this;
                var once = _.once(function() {
                    self.off(name, once);
                    callback.apply(this, arguments);
                });
                once._callback = callback;
                return this.on(name, once, context);
            },
            off: function(name, callback, context) {
                var retain, ev, events, names, i, l, j, k;
                if (!this._events || !eventsApi(this, "off", name, [ callback, context ])) return this;
                if (!name && !callback && !context) {
                    this._events = {};
                    return this;
                }
                names = name ? [ name ] : _.keys(this._events);
                for (i = 0, l = names.length; i < l; i++) {
                    name = names[i];
                    if (events = this._events[name]) {
                        this._events[name] = retain = [];
                        if (callback || context) {
                            for (j = 0, k = events.length; j < k; j++) {
                                ev = events[j];
                                if (callback && callback !== ev.callback && callback !== ev.callback._callback || context && context !== ev.context) {
                                    retain.push(ev);
                                }
                            }
                        }
                        if (!retain.length) delete this._events[name];
                    }
                }
                return this;
            },
            trigger: function(name) {
                if (!this._events) return this;
                var args = slice.call(arguments, 1);
                if (!eventsApi(this, "trigger", name, args)) return this;
                var events = this._events[name];
                var allEvents = this._events.all;
                if (events) triggerEvents(events, args);
                if (allEvents) triggerEvents(allEvents, arguments);
                return this;
            },
            stopListening: function(obj, name, callback) {
                var listeners = this._listeners;
                if (!listeners) return this;
                var deleteListener = !name && !callback;
                if (typeof name === "object") callback = this;
                if (obj) (listeners = {})[obj._listenerId] = obj;
                for (var id in listeners) {
                    listeners[id].off(name, callback, this);
                    if (deleteListener) delete this._listeners[id];
                }
                return this;
            }
        };
        var eventSplitter = /\s+/;
        var eventsApi = function(obj, action, name, rest) {
            if (!name) return true;
            if (typeof name === "object") {
                for (var key in name) {
                    obj[action].apply(obj, [ key, name[key] ].concat(rest));
                }
                return false;
            }
            if (eventSplitter.test(name)) {
                var names = name.split(eventSplitter);
                for (var i = 0, l = names.length; i < l; i++) {
                    obj[action].apply(obj, [ names[i] ].concat(rest));
                }
                return false;
            }
            return true;
        };
        var triggerEvents = function(events, args) {
            var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
            switch (args.length) {
              case 0:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx);
                return;

              case 1:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
                return;

              case 2:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
                return;

              case 3:
                while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                return;

              default:
                while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
            }
        };
        var listenMethods = {
            listenTo: "on",
            listenToOnce: "once"
        };
        _.each(listenMethods, function(implementation, method) {
            Events[method] = function(obj, name, callback) {
                var listeners = this._listeners || (this._listeners = {});
                var id = obj._listenerId || (obj._listenerId = _.uniqueId("l"));
                listeners[id] = obj;
                if (typeof name === "object") callback = this;
                obj[implementation](name, callback, this);
                return this;
            };
        });
        Events.bind = Events.on;
        Events.unbind = Events.off;
        _.extend(Backbone, Events);
        var Model = Backbone.Model = function(attributes, options) {
            var defaults;
            var attrs = attributes || {};
            options || (options = {});
            this.cid = _.uniqueId("c");
            this.attributes = {};
            _.extend(this, _.pick(options, modelOptions));
            if (options.parse) attrs = this.parse(attrs, options) || {};
            if (defaults = _.result(this, "defaults")) {
                attrs = _.defaults({}, attrs, defaults);
            }
            this.set(attrs, options);
            this.changed = {};
            this.initialize.apply(this, arguments);
        };
        var modelOptions = [ "url", "urlRoot", "collection" ];
        _.extend(Model.prototype, Events, {
            changed: null,
            validationError: null,
            idAttribute: "id",
            initialize: function() {},
            toJSON: function(options) {
                return _.clone(this.attributes);
            },
            sync: function() {
                return Backbone.sync.apply(this, arguments);
            },
            get: function(attr) {
                return this.attributes[attr];
            },
            escape: function(attr) {
                return _.escape(this.get(attr));
            },
            has: function(attr) {
                return this.get(attr) != null;
            },
            set: function(key, val, options) {
                var attr, attrs, unset, changes, silent, changing, prev, current;
                if (key == null) return this;
                if (typeof key === "object") {
                    attrs = key;
                    options = val;
                } else {
                    (attrs = {})[key] = val;
                }
                options || (options = {});
                if (!this._validate(attrs, options)) return false;
                unset = options.unset;
                silent = options.silent;
                changes = [];
                changing = this._changing;
                this._changing = true;
                if (!changing) {
                    this._previousAttributes = _.clone(this.attributes);
                    this.changed = {};
                }
                current = this.attributes, prev = this._previousAttributes;
                if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];
                for (attr in attrs) {
                    val = attrs[attr];
                    if (!_.isEqual(current[attr], val)) changes.push(attr);
                    if (!_.isEqual(prev[attr], val)) {
                        this.changed[attr] = val;
                    } else {
                        delete this.changed[attr];
                    }
                    unset ? delete current[attr] : current[attr] = val;
                }
                if (!silent) {
                    if (changes.length) this._pending = true;
                    for (var i = 0, l = changes.length; i < l; i++) {
                        this.trigger("change:" + changes[i], this, current[changes[i]], options);
                    }
                }
                if (changing) return this;
                if (!silent) {
                    while (this._pending) {
                        this._pending = false;
                        this.trigger("change", this, options);
                    }
                }
                this._pending = false;
                this._changing = false;
                return this;
            },
            unset: function(attr, options) {
                return this.set(attr, void 0, _.extend({}, options, {
                    unset: true
                }));
            },
            clear: function(options) {
                var attrs = {};
                for (var key in this.attributes) attrs[key] = void 0;
                return this.set(attrs, _.extend({}, options, {
                    unset: true
                }));
            },
            hasChanged: function(attr) {
                if (attr == null) return !_.isEmpty(this.changed);
                return _.has(this.changed, attr);
            },
            changedAttributes: function(diff) {
                if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
                var val, changed = false;
                var old = this._changing ? this._previousAttributes : this.attributes;
                for (var attr in diff) {
                    if (_.isEqual(old[attr], val = diff[attr])) continue;
                    (changed || (changed = {}))[attr] = val;
                }
                return changed;
            },
            previous: function(attr) {
                if (attr == null || !this._previousAttributes) return null;
                return this._previousAttributes[attr];
            },
            previousAttributes: function() {
                return _.clone(this._previousAttributes);
            },
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                if (options.parse === void 0) options.parse = true;
                var model = this;
                var success = options.success;
                options.success = function(resp) {
                    if (!model.set(model.parse(resp, options), options)) return false;
                    if (success) success(model, resp, options);
                    model.trigger("sync", model, resp, options);
                };
                wrapError(this, options);
                return this.sync("read", this, options);
            },
            save: function(key, val, options) {
                var attrs, method, xhr, attributes = this.attributes;
                if (key == null || typeof key === "object") {
                    attrs = key;
                    options = val;
                } else {
                    (attrs = {})[key] = val;
                }
                if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;
                options = _.extend({
                    validate: true
                }, options);
                if (!this._validate(attrs, options)) return false;
                if (attrs && options.wait) {
                    this.attributes = _.extend({}, attributes, attrs);
                }
                if (options.parse === void 0) options.parse = true;
                var model = this;
                var success = options.success;
                options.success = function(resp) {
                    model.attributes = attributes;
                    var serverAttrs = model.parse(resp, options);
                    if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
                    if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
                        return false;
                    }
                    if (success) success(model, resp, options);
                    model.trigger("sync", model, resp, options);
                };
                wrapError(this, options);
                method = this.isNew() ? "create" : options.patch ? "patch" : "update";
                if (method === "patch") options.attrs = attrs;
                xhr = this.sync(method, this, options);
                if (attrs && options.wait) this.attributes = attributes;
                return xhr;
            },
            destroy: function(options) {
                options = options ? _.clone(options) : {};
                var model = this;
                var success = options.success;
                var destroy = function() {
                    model.trigger("destroy", model, model.collection, options);
                };
                options.success = function(resp) {
                    if (options.wait || model.isNew()) destroy();
                    if (success) success(model, resp, options);
                    if (!model.isNew()) model.trigger("sync", model, resp, options);
                };
                if (this.isNew()) {
                    options.success();
                    return false;
                }
                wrapError(this, options);
                var xhr = this.sync("delete", this, options);
                if (!options.wait) destroy();
                return xhr;
            },
            url: function() {
                var base = _.result(this, "urlRoot") || _.result(this.collection, "url") || urlError();
                if (this.isNew()) return base;
                return base + (base.charAt(base.length - 1) === "/" ? "" : "/") + encodeURIComponent(this.id);
            },
            parse: function(resp, options) {
                return resp;
            },
            clone: function() {
                return new this.constructor(this.attributes);
            },
            isNew: function() {
                return this.id == null;
            },
            isValid: function(options) {
                return this._validate({}, _.extend(options || {}, {
                    validate: true
                }));
            },
            _validate: function(attrs, options) {
                if (!options.validate || !this.validate) return true;
                attrs = _.extend({}, this.attributes, attrs);
                var error = this.validationError = this.validate(attrs, options) || null;
                if (!error) return true;
                this.trigger("invalid", this, error, _.extend(options || {}, {
                    validationError: error
                }));
                return false;
            }
        });
        var modelMethods = [ "keys", "values", "pairs", "invert", "pick", "omit" ];
        _.each(modelMethods, function(method) {
            Model.prototype[method] = function() {
                var args = slice.call(arguments);
                args.unshift(this.attributes);
                return _[method].apply(_, args);
            };
        });
        var Collection = Backbone.Collection = function(models, options) {
            options || (options = {});
            if (options.url) this.url = options.url;
            if (options.model) this.model = options.model;
            if (options.comparator !== void 0) this.comparator = options.comparator;
            this._reset();
            this.initialize.apply(this, arguments);
            if (models) this.reset(models, _.extend({
                silent: true
            }, options));
        };
        var setOptions = {
            add: true,
            remove: true,
            merge: true
        };
        var addOptions = {
            add: true,
            merge: false,
            remove: false
        };
        _.extend(Collection.prototype, Events, {
            model: Model,
            initialize: function() {},
            toJSON: function(options) {
                return this.map(function(model) {
                    return model.toJSON(options);
                });
            },
            sync: function() {
                return Backbone.sync.apply(this, arguments);
            },
            add: function(models, options) {
                return this.set(models, _.defaults(options || {}, addOptions));
            },
            remove: function(models, options) {
                models = _.isArray(models) ? models.slice() : [ models ];
                options || (options = {});
                var i, l, index, model;
                for (i = 0, l = models.length; i < l; i++) {
                    model = this.get(models[i]);
                    if (!model) continue;
                    delete this._byId[model.id];
                    delete this._byId[model.cid];
                    index = this.indexOf(model);
                    this.models.splice(index, 1);
                    this.length--;
                    if (!options.silent) {
                        options.index = index;
                        model.trigger("remove", model, this, options);
                    }
                    this._removeReference(model);
                }
                return this;
            },
            set: function(models, options) {
                options = _.defaults(options || {}, setOptions);
                if (options.parse) models = this.parse(models, options);
                if (!_.isArray(models)) models = models ? [ models ] : [];
                var i, l, model, attrs, existing, sort;
                var at = options.at;
                var sortable = this.comparator && at == null && options.sort !== false;
                var sortAttr = _.isString(this.comparator) ? this.comparator : null;
                var toAdd = [], toRemove = [], modelMap = {};
                for (i = 0, l = models.length; i < l; i++) {
                    if (!(model = this._prepareModel(models[i], options))) continue;
                    if (existing = this.get(model)) {
                        if (options.remove) modelMap[existing.cid] = true;
                        if (options.merge) {
                            existing.set(model.attributes, options);
                            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
                        }
                    } else if (options.add) {
                        toAdd.push(model);
                        model.on("all", this._onModelEvent, this);
                        this._byId[model.cid] = model;
                        if (model.id != null) this._byId[model.id] = model;
                    }
                }
                if (options.remove) {
                    for (i = 0, l = this.length; i < l; ++i) {
                        if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
                    }
                    if (toRemove.length) this.remove(toRemove, options);
                }
                if (toAdd.length) {
                    if (sortable) sort = true;
                    this.length += toAdd.length;
                    if (at != null) {
                        splice.apply(this.models, [ at, 0 ].concat(toAdd));
                    } else {
                        push.apply(this.models, toAdd);
                    }
                }
                if (sort) this.sort({
                    silent: true
                });
                if (options.silent) return this;
                for (i = 0, l = toAdd.length; i < l; i++) {
                    (model = toAdd[i]).trigger("add", model, this, options);
                }
                if (sort) this.trigger("sort", this, options);
                return this;
            },
            reset: function(models, options) {
                options || (options = {});
                for (var i = 0, l = this.models.length; i < l; i++) {
                    this._removeReference(this.models[i]);
                }
                options.previousModels = this.models;
                this._reset();
                this.add(models, _.extend({
                    silent: true
                }, options));
                if (!options.silent) this.trigger("reset", this, options);
                return this;
            },
            push: function(model, options) {
                model = this._prepareModel(model, options);
                this.add(model, _.extend({
                    at: this.length
                }, options));
                return model;
            },
            pop: function(options) {
                var model = this.at(this.length - 1);
                this.remove(model, options);
                return model;
            },
            unshift: function(model, options) {
                model = this._prepareModel(model, options);
                this.add(model, _.extend({
                    at: 0
                }, options));
                return model;
            },
            shift: function(options) {
                var model = this.at(0);
                this.remove(model, options);
                return model;
            },
            slice: function(begin, end) {
                return this.models.slice(begin, end);
            },
            get: function(obj) {
                if (obj == null) return void 0;
                return this._byId[obj.id != null ? obj.id : obj.cid || obj];
            },
            at: function(index) {
                return this.models[index];
            },
            where: function(attrs, first) {
                if (_.isEmpty(attrs)) return first ? void 0 : [];
                return this[first ? "find" : "filter"](function(model) {
                    for (var key in attrs) {
                        if (attrs[key] !== model.get(key)) return false;
                    }
                    return true;
                });
            },
            findWhere: function(attrs) {
                return this.where(attrs, true);
            },
            sort: function(options) {
                if (!this.comparator) throw new Error("Cannot sort a set without a comparator");
                options || (options = {});
                if (_.isString(this.comparator) || this.comparator.length === 1) {
                    this.models = this.sortBy(this.comparator, this);
                } else {
                    this.models.sort(_.bind(this.comparator, this));
                }
                if (!options.silent) this.trigger("sort", this, options);
                return this;
            },
            sortedIndex: function(model, value, context) {
                value || (value = this.comparator);
                var iterator = _.isFunction(value) ? value : function(model) {
                    return model.get(value);
                };
                return _.sortedIndex(this.models, model, iterator, context);
            },
            pluck: function(attr) {
                return _.invoke(this.models, "get", attr);
            },
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                if (options.parse === void 0) options.parse = true;
                var success = options.success;
                var collection = this;
                options.success = function(resp) {
                    var method = options.reset ? "reset" : "set";
                    collection[method](resp, options);
                    if (success) success(collection, resp, options);
                    collection.trigger("sync", collection, resp, options);
                };
                wrapError(this, options);
                return this.sync("read", this, options);
            },
            create: function(model, options) {
                options = options ? _.clone(options) : {};
                if (!(model = this._prepareModel(model, options))) return false;
                if (!options.wait) this.add(model, options);
                var collection = this;
                var success = options.success;
                options.success = function(resp) {
                    if (options.wait) collection.add(model, options);
                    if (success) success(model, resp, options);
                };
                model.save(null, options);
                return model;
            },
            parse: function(resp, options) {
                return resp;
            },
            clone: function() {
                return new this.constructor(this.models);
            },
            _reset: function() {
                this.length = 0;
                this.models = [];
                this._byId = {};
            },
            _prepareModel: function(attrs, options) {
                if (attrs instanceof Model) {
                    if (!attrs.collection) attrs.collection = this;
                    return attrs;
                }
                options || (options = {});
                options.collection = this;
                var model = new this.model(attrs, options);
                if (!model._validate(attrs, options)) {
                    this.trigger("invalid", this, attrs, options);
                    return false;
                }
                return model;
            },
            _removeReference: function(model) {
                if (this === model.collection) delete model.collection;
                model.off("all", this._onModelEvent, this);
            },
            _onModelEvent: function(event, model, collection, options) {
                if ((event === "add" || event === "remove") && collection !== this) return;
                if (event === "destroy") this.remove(model, options);
                if (model && event === "change:" + model.idAttribute) {
                    delete this._byId[model.previous(model.idAttribute)];
                    if (model.id != null) this._byId[model.id] = model;
                }
                this.trigger.apply(this, arguments);
            }
        });
        var methods = [ "forEach", "each", "map", "collect", "reduce", "foldl", "inject", "reduceRight", "foldr", "find", "detect", "filter", "select", "reject", "every", "all", "some", "any", "include", "contains", "invoke", "max", "min", "toArray", "size", "first", "head", "take", "initial", "rest", "tail", "drop", "last", "without", "indexOf", "shuffle", "lastIndexOf", "isEmpty", "chain" ];
        _.each(methods, function(method) {
            Collection.prototype[method] = function() {
                var args = slice.call(arguments);
                args.unshift(this.models);
                return _[method].apply(_, args);
            };
        });
        var attributeMethods = [ "groupBy", "countBy", "sortBy" ];
        _.each(attributeMethods, function(method) {
            Collection.prototype[method] = function(value, context) {
                var iterator = _.isFunction(value) ? value : function(model) {
                    return model.get(value);
                };
                return _[method](this.models, iterator, context);
            };
        });
        var View = Backbone.View = function(options) {
            this.cid = _.uniqueId("view");
            this._configure(options || {});
            this._ensureElement();
            this.initialize.apply(this, arguments);
            this.delegateEvents();
        };
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;
        var viewOptions = [ "model", "collection", "el", "id", "attributes", "className", "tagName", "events" ];
        _.extend(View.prototype, Events, {
            tagName: "div",
            $: function(selector) {
                return this.$el.find(selector);
            },
            initialize: function() {},
            render: function() {
                return this;
            },
            remove: function() {
                this.$el.remove();
                this.stopListening();
                return this;
            },
            setElement: function(element, delegate) {
                if (this.$el) this.undelegateEvents();
                this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
                this.el = this.$el[0];
                if (delegate !== false) this.delegateEvents();
                return this;
            },
            delegateEvents: function(events) {
                if (!(events || (events = _.result(this, "events")))) return this;
                this.undelegateEvents();
                for (var key in events) {
                    var method = events[key];
                    if (!_.isFunction(method)) method = this[events[key]];
                    if (!method) continue;
                    var match = key.match(delegateEventSplitter);
                    var eventName = match[1], selector = match[2];
                    method = _.bind(method, this);
                    eventName += ".delegateEvents" + this.cid;
                    if (selector === "") {
                        this.$el.on(eventName, method);
                    } else {
                        this.$el.on(eventName, selector, method);
                    }
                }
                return this;
            },
            undelegateEvents: function() {
                this.$el.off(".delegateEvents" + this.cid);
                return this;
            },
            _configure: function(options) {
                if (this.options) options = _.extend({}, _.result(this, "options"), options);
                _.extend(this, _.pick(options, viewOptions));
                this.options = options;
            },
            _ensureElement: function() {
                if (!this.el) {
                    var attrs = _.extend({}, _.result(this, "attributes"));
                    if (this.id) attrs.id = _.result(this, "id");
                    if (this.className) attrs["class"] = _.result(this, "className");
                    var $el = Backbone.$("<" + _.result(this, "tagName") + ">").attr(attrs);
                    this.setElement($el, false);
                } else {
                    this.setElement(_.result(this, "el"), false);
                }
            }
        });
        Backbone.sync = function(method, model, options) {
            var type = methodMap[method];
            _.defaults(options || (options = {}), {
                emulateHTTP: Backbone.emulateHTTP,
                emulateJSON: Backbone.emulateJSON
            });
            var params = {
                type: type,
                dataType: "json"
            };
            if (!options.url) {
                params.url = _.result(model, "url") || urlError();
            }
            if (options.data == null && model && (method === "create" || method === "update" || method === "patch")) {
                params.contentType = "application/json";
                params.data = JSON.stringify(options.attrs || model.toJSON(options));
            }
            if (options.emulateJSON) {
                params.contentType = "application/x-www-form-urlencoded";
                params.data = params.data ? {
                    model: params.data
                } : {};
            }
            if (options.emulateHTTP && (type === "PUT" || type === "DELETE" || type === "PATCH")) {
                params.type = "POST";
                if (options.emulateJSON) params.data._method = type;
                var beforeSend = options.beforeSend;
                options.beforeSend = function(xhr) {
                    xhr.setRequestHeader("X-HTTP-Method-Override", type);
                    if (beforeSend) return beforeSend.apply(this, arguments);
                };
            }
            if (params.type !== "GET" && !options.emulateJSON) {
                params.processData = false;
            }
            if (params.type === "PATCH" && window.ActiveXObject && !(window.external && window.external.msActiveXFilteringEnabled)) {
                params.xhr = function() {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                };
            }
            var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
            model.trigger("request", model, xhr, options);
            return xhr;
        };
        var methodMap = {
            create: "POST",
            update: "PUT",
            patch: "PATCH",
            "delete": "DELETE",
            read: "GET"
        };
        Backbone.ajax = function() {
            return Backbone.$.ajax.apply(Backbone.$, arguments);
        };
        var Router = Backbone.Router = function(options) {
            options || (options = {});
            if (options.routes) this.routes = options.routes;
            this._bindRoutes();
            this.initialize.apply(this, arguments);
        };
        var optionalParam = /\((.*?)\)/g;
        var namedParam = /(\(\?)?:\w+/g;
        var splatParam = /\*\w+/g;
        var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
        _.extend(Router.prototype, Events, {
            initialize: function() {},
            route: function(route, name, callback) {
                if (!_.isRegExp(route)) route = this._routeToRegExp(route);
                if (_.isFunction(name)) {
                    callback = name;
                    name = "";
                }
                if (!callback) callback = this[name];
                var router = this;
                Backbone.history.route(route, function(fragment) {
                    var args = router._extractParameters(route, fragment);
                    callback && callback.apply(router, args);
                    router.trigger.apply(router, [ "route:" + name ].concat(args));
                    router.trigger("route", name, args);
                    Backbone.history.trigger("route", router, name, args);
                });
                return this;
            },
            navigate: function(fragment, options) {
                Backbone.history.navigate(fragment, options);
                return this;
            },
            _bindRoutes: function() {
                if (!this.routes) return;
                this.routes = _.result(this, "routes");
                var route, routes = _.keys(this.routes);
                while ((route = routes.pop()) != null) {
                    this.route(route, this.routes[route]);
                }
            },
            _routeToRegExp: function(route) {
                route = route.replace(escapeRegExp, "\\$&").replace(optionalParam, "(?:$1)?").replace(namedParam, function(match, optional) {
                    return optional ? match : "([^/]+)";
                }).replace(splatParam, "(.*?)");
                return new RegExp("^" + route + "$");
            },
            _extractParameters: function(route, fragment) {
                var params = route.exec(fragment).slice(1);
                return _.map(params, function(param) {
                    return param ? decodeURIComponent(param) : null;
                });
            }
        });
        var History = Backbone.History = function() {
            this.handlers = [];
            _.bindAll(this, "checkUrl");
            if (typeof window !== "undefined") {
                this.location = window.location;
                this.history = window.history;
            }
        };
        var routeStripper = /^[#\/]|\s+$/g;
        var rootStripper = /^\/+|\/+$/g;
        var isExplorer = /msie [\w.]+/;
        var trailingSlash = /\/$/;
        History.started = false;
        _.extend(History.prototype, Events, {
            interval: 50,
            getHash: function(window) {
                var match = (window || this).location.href.match(/#(.*)$/);
                return match ? match[1] : "";
            },
            getFragment: function(fragment, forcePushState) {
                if (fragment == null) {
                    if (this._hasPushState || !this._wantsHashChange || forcePushState) {
                        fragment = this.location.pathname;
                        var root = this.root.replace(trailingSlash, "");
                        if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
                    } else {
                        fragment = this.getHash();
                    }
                }
                return fragment.replace(routeStripper, "");
            },
            start: function(options) {
                if (History.started) throw new Error("Backbone.history has already been started");
                History.started = true;
                this.options = _.extend({}, {
                    root: "/"
                }, this.options, options);
                this.root = this.options.root;
                this._wantsHashChange = this.options.hashChange !== false;
                this._wantsPushState = !!this.options.pushState;
                this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
                var fragment = this.getFragment();
                var docMode = document.documentMode;
                var oldIE = isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7);
                this.root = ("/" + this.root + "/").replace(rootStripper, "/");
                if (oldIE && this._wantsHashChange) {
                    this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;
                    this.navigate(fragment);
                }
                if (this._hasPushState) {
                    Backbone.$(window).on("popstate", this.checkUrl);
                } else if (this._wantsHashChange && "onhashchange" in window && !oldIE) {
                    Backbone.$(window).on("hashchange", this.checkUrl);
                } else if (this._wantsHashChange) {
                    this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
                }
                this.fragment = fragment;
                var loc = this.location;
                var atRoot = loc.pathname.replace(/[^\/]$/, "$&/") === this.root;
                if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
                    this.fragment = this.getFragment(null, true);
                    this.location.replace(this.root + this.location.search + "#" + this.fragment);
                    return true;
                } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
                    this.fragment = this.getHash().replace(routeStripper, "");
                    this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
                }
                if (!this.options.silent) return this.loadUrl();
            },
            stop: function() {
                Backbone.$(window).off("popstate", this.checkUrl).off("hashchange", this.checkUrl);
                clearInterval(this._checkUrlInterval);
                History.started = false;
            },
            route: function(route, callback) {
                this.handlers.unshift({
                    route: route,
                    callback: callback
                });
            },
            checkUrl: function(e) {
                var current = this.getFragment();
                if (current === this.fragment && this.iframe) {
                    current = this.getFragment(this.getHash(this.iframe));
                }
                if (current === this.fragment) return false;
                if (this.iframe) this.navigate(current);
                this.loadUrl() || this.loadUrl(this.getHash());
            },
            loadUrl: function(fragmentOverride) {
                var fragment = this.fragment = this.getFragment(fragmentOverride);
                var matched = _.any(this.handlers, function(handler) {
                    if (handler.route.test(fragment)) {
                        handler.callback(fragment);
                        return true;
                    }
                });
                return matched;
            },
            navigate: function(fragment, options) {
                if (!History.started) return false;
                if (!options || options === true) options = {
                    trigger: options
                };
                fragment = this.getFragment(fragment || "");
                if (this.fragment === fragment) return;
                this.fragment = fragment;
                var url = this.root + fragment;
                if (this._hasPushState) {
                    this.history[options.replace ? "replaceState" : "pushState"]({}, document.title, url);
                } else if (this._wantsHashChange) {
                    this._updateHash(this.location, fragment, options.replace);
                    if (this.iframe && fragment !== this.getFragment(this.getHash(this.iframe))) {
                        if (!options.replace) this.iframe.document.open().close();
                        this._updateHash(this.iframe.location, fragment, options.replace);
                    }
                } else {
                    return this.location.assign(url);
                }
                if (options.trigger) this.loadUrl(fragment);
            },
            _updateHash: function(location, fragment, replace) {
                if (replace) {
                    var href = location.href.replace(/(javascript:|#).*$/, "");
                    location.replace(href + "#" + fragment);
                } else {
                    location.hash = "#" + fragment;
                }
            }
        });
        Backbone.history = new History();
        var extend = function(protoProps, staticProps) {
            var parent = this;
            var child;
            if (protoProps && _.has(protoProps, "constructor")) {
                child = protoProps.constructor;
            } else {
                child = function() {
                    return parent.apply(this, arguments);
                };
            }
            _.extend(child, parent, staticProps);
            var Surrogate = function() {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate();
            if (protoProps) _.extend(child.prototype, protoProps);
            child.__super__ = parent.prototype;
            return child;
        };
        Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;
        var urlError = function() {
            throw new Error('A "url" property or function must be specified');
        };
        var wrapError = function(model, options) {
            var error = options.error;
            options.error = function(resp) {
                if (error) error(model, resp, options);
                model.trigger("error", model, resp, options);
            };
        };
    }).call(this);
    this._ = previousUnderscore;
    this.jQuery = previousJQuery;
});

define("gallery/underscore/1.4.4/underscore", [], function(require, exports, module) {
    (function() {
        var n = this, t = n._, r = {}, e = Array.prototype, u = Object.prototype, i = Function.prototype, a = e.push, o = e.slice, c = e.concat, l = u.toString, f = u.hasOwnProperty, s = e.forEach, p = e.map, h = e.reduce, v = e.reduceRight, d = e.filter, g = e.every, m = e.some, y = e.indexOf, b = e.lastIndexOf, x = Array.isArray, _ = Object.keys, j = i.bind, w = function(n) {
            return n instanceof w ? n : this instanceof w ? (this._wrapped = n, void 0) : new w(n);
        };
        "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = w), 
        exports._ = w) : n._ = w, w.VERSION = "1.4.4";
        var A = w.each = w.forEach = function(n, t, e) {
            if (null != n) if (s && n.forEach === s) n.forEach(t, e); else if (n.length === +n.length) {
                for (var u = 0, i = n.length; i > u; u++) if (t.call(e, n[u], u, n) === r) return;
            } else for (var a in n) if (w.has(n, a) && t.call(e, n[a], a, n) === r) return;
        };
        w.map = w.collect = function(n, t, r) {
            var e = [];
            return null == n ? e : p && n.map === p ? n.map(t, r) : (A(n, function(n, u, i) {
                e[e.length] = t.call(r, n, u, i);
            }), e);
        };
        var O = "Reduce of empty array with no initial value";
        w.reduce = w.foldl = w.inject = function(n, t, r, e) {
            var u = arguments.length > 2;
            if (null == n && (n = []), h && n.reduce === h) return e && (t = w.bind(t, e)), 
            u ? n.reduce(t, r) : n.reduce(t);
            if (A(n, function(n, i, a) {
                u ? r = t.call(e, r, n, i, a) : (r = n, u = !0);
            }), !u) throw new TypeError(O);
            return r;
        }, w.reduceRight = w.foldr = function(n, t, r, e) {
            var u = arguments.length > 2;
            if (null == n && (n = []), v && n.reduceRight === v) return e && (t = w.bind(t, e)), 
            u ? n.reduceRight(t, r) : n.reduceRight(t);
            var i = n.length;
            if (i !== +i) {
                var a = w.keys(n);
                i = a.length;
            }
            if (A(n, function(o, c, l) {
                c = a ? a[--i] : --i, u ? r = t.call(e, r, n[c], c, l) : (r = n[c], u = !0);
            }), !u) throw new TypeError(O);
            return r;
        }, w.find = w.detect = function(n, t, r) {
            var e;
            return E(n, function(n, u, i) {
                return t.call(r, n, u, i) ? (e = n, !0) : void 0;
            }), e;
        }, w.filter = w.select = function(n, t, r) {
            var e = [];
            return null == n ? e : d && n.filter === d ? n.filter(t, r) : (A(n, function(n, u, i) {
                t.call(r, n, u, i) && (e[e.length] = n);
            }), e);
        }, w.reject = function(n, t, r) {
            return w.filter(n, function(n, e, u) {
                return !t.call(r, n, e, u);
            }, r);
        }, w.every = w.all = function(n, t, e) {
            t || (t = w.identity);
            var u = !0;
            return null == n ? u : g && n.every === g ? n.every(t, e) : (A(n, function(n, i, a) {
                return (u = u && t.call(e, n, i, a)) ? void 0 : r;
            }), !!u);
        };
        var E = w.some = w.any = function(n, t, e) {
            t || (t = w.identity);
            var u = !1;
            return null == n ? u : m && n.some === m ? n.some(t, e) : (A(n, function(n, i, a) {
                return u || (u = t.call(e, n, i, a)) ? r : void 0;
            }), !!u);
        };
        w.contains = w.include = function(n, t) {
            return null == n ? !1 : y && n.indexOf === y ? n.indexOf(t) != -1 : E(n, function(n) {
                return n === t;
            });
        }, w.invoke = function(n, t) {
            var r = o.call(arguments, 2), e = w.isFunction(t);
            return w.map(n, function(n) {
                return (e ? t : n[t]).apply(n, r);
            });
        }, w.pluck = function(n, t) {
            return w.map(n, function(n) {
                return n[t];
            });
        }, w.where = function(n, t, r) {
            return w.isEmpty(t) ? r ? null : [] : w[r ? "find" : "filter"](n, function(n) {
                for (var r in t) if (t[r] !== n[r]) return !1;
                return !0;
            });
        }, w.findWhere = function(n, t) {
            return w.where(n, t, !0);
        }, w.max = function(n, t, r) {
            if (!t && w.isArray(n) && n[0] === +n[0] && 65535 > n.length) return Math.max.apply(Math, n);
            if (!t && w.isEmpty(n)) return -1 / 0;
            var e = {
                computed: -1 / 0,
                value: -1 / 0
            };
            return A(n, function(n, u, i) {
                var a = t ? t.call(r, n, u, i) : n;
                a >= e.computed && (e = {
                    value: n,
                    computed: a
                });
            }), e.value;
        }, w.min = function(n, t, r) {
            if (!t && w.isArray(n) && n[0] === +n[0] && 65535 > n.length) return Math.min.apply(Math, n);
            if (!t && w.isEmpty(n)) return 1 / 0;
            var e = {
                computed: 1 / 0,
                value: 1 / 0
            };
            return A(n, function(n, u, i) {
                var a = t ? t.call(r, n, u, i) : n;
                e.computed > a && (e = {
                    value: n,
                    computed: a
                });
            }), e.value;
        }, w.shuffle = function(n) {
            var t, r = 0, e = [];
            return A(n, function(n) {
                t = w.random(r++), e[r - 1] = e[t], e[t] = n;
            }), e;
        };
        var k = function(n) {
            return w.isFunction(n) ? n : function(t) {
                return t[n];
            };
        };
        w.sortBy = function(n, t, r) {
            var e = k(t);
            return w.pluck(w.map(n, function(n, t, u) {
                return {
                    value: n,
                    index: t,
                    criteria: e.call(r, n, t, u)
                };
            }).sort(function(n, t) {
                var r = n.criteria, e = t.criteria;
                if (r !== e) {
                    if (r > e || r === void 0) return 1;
                    if (e > r || e === void 0) return -1;
                }
                return n.index < t.index ? -1 : 1;
            }), "value");
        };
        var F = function(n, t, r, e) {
            var u = {}, i = k(t || w.identity);
            return A(n, function(t, a) {
                var o = i.call(r, t, a, n);
                e(u, o, t);
            }), u;
        };
        w.groupBy = function(n, t, r) {
            return F(n, t, r, function(n, t, r) {
                (w.has(n, t) ? n[t] : n[t] = []).push(r);
            });
        }, w.countBy = function(n, t, r) {
            return F(n, t, r, function(n, t) {
                w.has(n, t) || (n[t] = 0), n[t]++;
            });
        }, w.sortedIndex = function(n, t, r, e) {
            r = null == r ? w.identity : k(r);
            for (var u = r.call(e, t), i = 0, a = n.length; a > i; ) {
                var o = i + a >>> 1;
                u > r.call(e, n[o]) ? i = o + 1 : a = o;
            }
            return i;
        }, w.toArray = function(n) {
            return n ? w.isArray(n) ? o.call(n) : n.length === +n.length ? w.map(n, w.identity) : w.values(n) : [];
        }, w.size = function(n) {
            return null == n ? 0 : n.length === +n.length ? n.length : w.keys(n).length;
        }, w.first = w.head = w.take = function(n, t, r) {
            return null == n ? void 0 : null == t || r ? n[0] : o.call(n, 0, t);
        }, w.initial = function(n, t, r) {
            return o.call(n, 0, n.length - (null == t || r ? 1 : t));
        }, w.last = function(n, t, r) {
            return null == n ? void 0 : null == t || r ? n[n.length - 1] : o.call(n, Math.max(n.length - t, 0));
        }, w.rest = w.tail = w.drop = function(n, t, r) {
            return o.call(n, null == t || r ? 1 : t);
        }, w.compact = function(n) {
            return w.filter(n, w.identity);
        };
        var R = function(n, t, r) {
            return A(n, function(n) {
                w.isArray(n) ? t ? a.apply(r, n) : R(n, t, r) : r.push(n);
            }), r;
        };
        w.flatten = function(n, t) {
            return R(n, t, []);
        }, w.without = function(n) {
            return w.difference(n, o.call(arguments, 1));
        }, w.uniq = w.unique = function(n, t, r, e) {
            w.isFunction(t) && (e = r, r = t, t = !1);
            var u = r ? w.map(n, r, e) : n, i = [], a = [];
            return A(u, function(r, e) {
                (t ? e && a[a.length - 1] === r : w.contains(a, r)) || (a.push(r), i.push(n[e]));
            }), i;
        }, w.union = function() {
            return w.uniq(c.apply(e, arguments));
        }, w.intersection = function(n) {
            var t = o.call(arguments, 1);
            return w.filter(w.uniq(n), function(n) {
                return w.every(t, function(t) {
                    return w.indexOf(t, n) >= 0;
                });
            });
        }, w.difference = function(n) {
            var t = c.apply(e, o.call(arguments, 1));
            return w.filter(n, function(n) {
                return !w.contains(t, n);
            });
        }, w.zip = function() {
            for (var n = o.call(arguments), t = w.max(w.pluck(n, "length")), r = Array(t), e = 0; t > e; e++) r[e] = w.pluck(n, "" + e);
            return r;
        }, w.object = function(n, t) {
            if (null == n) return {};
            for (var r = {}, e = 0, u = n.length; u > e; e++) t ? r[n[e]] = t[e] : r[n[e][0]] = n[e][1];
            return r;
        }, w.indexOf = function(n, t, r) {
            if (null == n) return -1;
            var e = 0, u = n.length;
            if (r) {
                if ("number" != typeof r) return e = w.sortedIndex(n, t), n[e] === t ? e : -1;
                e = 0 > r ? Math.max(0, u + r) : r;
            }
            if (y && n.indexOf === y) return n.indexOf(t, r);
            for (;u > e; e++) if (n[e] === t) return e;
            return -1;
        }, w.lastIndexOf = function(n, t, r) {
            if (null == n) return -1;
            var e = null != r;
            if (b && n.lastIndexOf === b) return e ? n.lastIndexOf(t, r) : n.lastIndexOf(t);
            for (var u = e ? r : n.length; u--; ) if (n[u] === t) return u;
            return -1;
        }, w.range = function(n, t, r) {
            1 >= arguments.length && (t = n || 0, n = 0), r = arguments[2] || 1;
            for (var e = Math.max(Math.ceil((t - n) / r), 0), u = 0, i = Array(e); e > u; ) i[u++] = n, 
            n += r;
            return i;
        }, w.bind = function(n, t) {
            if (n.bind === j && j) return j.apply(n, o.call(arguments, 1));
            var r = o.call(arguments, 2);
            return function() {
                return n.apply(t, r.concat(o.call(arguments)));
            };
        }, w.partial = function(n) {
            var t = o.call(arguments, 1);
            return function() {
                return n.apply(this, t.concat(o.call(arguments)));
            };
        }, w.bindAll = function(n) {
            var t = o.call(arguments, 1);
            return 0 === t.length && (t = w.functions(n)), A(t, function(t) {
                n[t] = w.bind(n[t], n);
            }), n;
        }, w.memoize = function(n, t) {
            var r = {};
            return t || (t = w.identity), function() {
                var e = t.apply(this, arguments);
                return w.has(r, e) ? r[e] : r[e] = n.apply(this, arguments);
            };
        }, w.delay = function(n, t) {
            var r = o.call(arguments, 2);
            return setTimeout(function() {
                return n.apply(null, r);
            }, t);
        }, w.defer = function(n) {
            return w.delay.apply(w, [ n, 1 ].concat(o.call(arguments, 1)));
        }, w.throttle = function(n, t) {
            var r, e, u, i, a = 0, o = function() {
                a = new Date(), u = null, i = n.apply(r, e);
            };
            return function() {
                var c = new Date(), l = t - (c - a);
                return r = this, e = arguments, 0 >= l ? (clearTimeout(u), u = null, a = c, i = n.apply(r, e)) : u || (u = setTimeout(o, l)), 
                i;
            };
        }, w.debounce = function(n, t, r) {
            var e, u;
            return function() {
                var i = this, a = arguments, o = function() {
                    e = null, r || (u = n.apply(i, a));
                }, c = r && !e;
                return clearTimeout(e), e = setTimeout(o, t), c && (u = n.apply(i, a)), u;
            };
        }, w.once = function(n) {
            var t, r = !1;
            return function() {
                return r ? t : (r = !0, t = n.apply(this, arguments), n = null, t);
            };
        }, w.wrap = function(n, t) {
            return function() {
                var r = [ n ];
                return a.apply(r, arguments), t.apply(this, r);
            };
        }, w.compose = function() {
            var n = arguments;
            return function() {
                for (var t = arguments, r = n.length - 1; r >= 0; r--) t = [ n[r].apply(this, t) ];
                return t[0];
            };
        }, w.after = function(n, t) {
            return 0 >= n ? t() : function() {
                return 1 > --n ? t.apply(this, arguments) : void 0;
            };
        }, w.keys = _ || function(n) {
            if (n !== Object(n)) throw new TypeError("Invalid object");
            var t = [];
            for (var r in n) w.has(n, r) && (t[t.length] = r);
            return t;
        }, w.values = function(n) {
            var t = [];
            for (var r in n) w.has(n, r) && t.push(n[r]);
            return t;
        }, w.pairs = function(n) {
            var t = [];
            for (var r in n) w.has(n, r) && t.push([ r, n[r] ]);
            return t;
        }, w.invert = function(n) {
            var t = {};
            for (var r in n) w.has(n, r) && (t[n[r]] = r);
            return t;
        }, w.functions = w.methods = function(n) {
            var t = [];
            for (var r in n) w.isFunction(n[r]) && t.push(r);
            return t.sort();
        }, w.extend = function(n) {
            return A(o.call(arguments, 1), function(t) {
                if (t) for (var r in t) n[r] = t[r];
            }), n;
        }, w.pick = function(n) {
            var t = {}, r = c.apply(e, o.call(arguments, 1));
            return A(r, function(r) {
                r in n && (t[r] = n[r]);
            }), t;
        }, w.omit = function(n) {
            var t = {}, r = c.apply(e, o.call(arguments, 1));
            for (var u in n) w.contains(r, u) || (t[u] = n[u]);
            return t;
        }, w.defaults = function(n) {
            return A(o.call(arguments, 1), function(t) {
                if (t) for (var r in t) null == n[r] && (n[r] = t[r]);
            }), n;
        }, w.clone = function(n) {
            return w.isObject(n) ? w.isArray(n) ? n.slice() : w.extend({}, n) : n;
        }, w.tap = function(n, t) {
            return t(n), n;
        };
        var I = function(n, t, r, e) {
            if (n === t) return 0 !== n || 1 / n == 1 / t;
            if (null == n || null == t) return n === t;
            n instanceof w && (n = n._wrapped), t instanceof w && (t = t._wrapped);
            var u = l.call(n);
            if (u != l.call(t)) return !1;
            switch (u) {
              case "[object String]":
                return n == t + "";

              case "[object Number]":
                return n != +n ? t != +t : 0 == n ? 1 / n == 1 / t : n == +t;

              case "[object Date]":
              case "[object Boolean]":
                return +n == +t;

              case "[object RegExp]":
                return n.source == t.source && n.global == t.global && n.multiline == t.multiline && n.ignoreCase == t.ignoreCase;
            }
            if ("object" != typeof n || "object" != typeof t) return !1;
            for (var i = r.length; i--; ) if (r[i] == n) return e[i] == t;
            r.push(n), e.push(t);
            var a = 0, o = !0;
            if ("[object Array]" == u) {
                if (a = n.length, o = a == t.length) for (;a-- && (o = I(n[a], t[a], r, e)); ) ;
            } else {
                var c = n.constructor, f = t.constructor;
                if (c !== f && !(w.isFunction(c) && c instanceof c && w.isFunction(f) && f instanceof f)) return !1;
                for (var s in n) if (w.has(n, s) && (a++, !(o = w.has(t, s) && I(n[s], t[s], r, e)))) break;
                if (o) {
                    for (s in t) if (w.has(t, s) && !a--) break;
                    o = !a;
                }
            }
            return r.pop(), e.pop(), o;
        };
        w.isEqual = function(n, t) {
            return I(n, t, [], []);
        }, w.isEmpty = function(n) {
            if (null == n) return !0;
            if (w.isArray(n) || w.isString(n)) return 0 === n.length;
            for (var t in n) if (w.has(n, t)) return !1;
            return !0;
        }, w.isElement = function(n) {
            return !(!n || 1 !== n.nodeType);
        }, w.isArray = x || function(n) {
            return "[object Array]" == l.call(n);
        }, w.isObject = function(n) {
            return n === Object(n);
        }, A([ "Arguments", "Function", "String", "Number", "Date", "RegExp" ], function(n) {
            w["is" + n] = function(t) {
                return l.call(t) == "[object " + n + "]";
            };
        }), w.isArguments(arguments) || (w.isArguments = function(n) {
            return !(!n || !w.has(n, "callee"));
        }), "function" != typeof /./ && (w.isFunction = function(n) {
            return "function" == typeof n;
        }), w.isFinite = function(n) {
            return isFinite(n) && !isNaN(parseFloat(n));
        }, w.isNaN = function(n) {
            return w.isNumber(n) && n != +n;
        }, w.isBoolean = function(n) {
            return n === !0 || n === !1 || "[object Boolean]" == l.call(n);
        }, w.isNull = function(n) {
            return null === n;
        }, w.isUndefined = function(n) {
            return n === void 0;
        }, w.has = function(n, t) {
            return f.call(n, t);
        }, w.noConflict = function() {
            return n._ = t, this;
        }, w.identity = function(n) {
            return n;
        }, w.times = function(n, t, r) {
            for (var e = Array(n), u = 0; n > u; u++) e[u] = t.call(r, u);
            return e;
        }, w.random = function(n, t) {
            return null == t && (t = n, n = 0), n + Math.floor(Math.random() * (t - n + 1));
        };
        var M = {
            escape: {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#x27;",
                "/": "&#x2F;"
            }
        };
        M.unescape = w.invert(M.escape);
        var S = {
            escape: RegExp("[" + w.keys(M.escape).join("") + "]", "g"),
            unescape: RegExp("(" + w.keys(M.unescape).join("|") + ")", "g")
        };
        w.each([ "escape", "unescape" ], function(n) {
            w[n] = function(t) {
                return null == t ? "" : ("" + t).replace(S[n], function(t) {
                    return M[n][t];
                });
            };
        }), w.result = function(n, t) {
            if (null == n) return null;
            var r = n[t];
            return w.isFunction(r) ? r.call(n) : r;
        }, w.mixin = function(n) {
            A(w.functions(n), function(t) {
                var r = w[t] = n[t];
                w.prototype[t] = function() {
                    var n = [ this._wrapped ];
                    return a.apply(n, arguments), D.call(this, r.apply(w, n));
                };
            });
        };
        var N = 0;
        w.uniqueId = function(n) {
            var t = ++N + "";
            return n ? n + t : t;
        }, w.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var T = /(.)^/, q = {
            "'": "'",
            "\\": "\\",
            "\r": "r",
            "\n": "n",
            "	": "t",
            "\u2028": "u2028",
            "\u2029": "u2029"
        }, B = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        w.template = function(n, t, r) {
            var e;
            r = w.defaults({}, r, w.templateSettings);
            var u = RegExp([ (r.escape || T).source, (r.interpolate || T).source, (r.evaluate || T).source ].join("|") + "|$", "g"), i = 0, a = "__p+='";
            n.replace(u, function(t, r, e, u, o) {
                return a += n.slice(i, o).replace(B, function(n) {
                    return "\\" + q[n];
                }), r && (a += "'+\n((__t=(" + r + "))==null?'':_.escape(__t))+\n'"), e && (a += "'+\n((__t=(" + e + "))==null?'':__t)+\n'"), 
                u && (a += "';\n" + u + "\n__p+='"), i = o + t.length, t;
            }), a += "';\n", r.variable || (a = "with(obj||{}){\n" + a + "}\n"), a = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + a + "return __p;\n";
            try {
                e = Function(r.variable || "obj", "_", a);
            } catch (o) {
                throw o.source = a, o;
            }
            if (t) return e(t, w);
            var c = function(n) {
                return e.call(this, n, w);
            };
            return c.source = "function(" + (r.variable || "obj") + "){\n" + a + "}", c;
        }, w.chain = function(n) {
            return w(n).chain();
        };
        var D = function(n) {
            return this._chain ? w(n).chain() : n;
        };
        w.mixin(w), A([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(n) {
            var t = e[n];
            w.prototype[n] = function() {
                var r = this._wrapped;
                return t.apply(r, arguments), "shift" != n && "splice" != n || 0 !== r.length || delete r[0], 
                D.call(this, r);
            };
        }), A([ "concat", "join", "slice" ], function(n) {
            var t = e[n];
            w.prototype[n] = function() {
                return D.call(this, t.apply(this._wrapped, arguments));
            };
        }), w.extend(w.prototype, {
            chain: function() {
                return this._chain = !0, this;
            },
            value: function() {
                return this._wrapped;
            }
        });
    }).call(this);
});

/*! zepto - v1.0.0 - 2013-06-07
* Copyright (c) 2013 ; Licensed  */
define("zepto/zepto/1.0.0/zepto", [], function(a, b, c) {
    !function(a) {
        String.prototype.trim === a && (String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, "");
        }), Array.prototype.reduce === a && (Array.prototype.reduce = function(b) {
            if (void 0 === this || null === this) throw new TypeError();
            var c, d = Object(this), e = d.length >>> 0, f = 0;
            if ("function" != typeof b) throw new TypeError();
            if (0 == e && 1 == arguments.length) throw new TypeError();
            if (arguments.length >= 2) c = arguments[1]; else for (;;) {
                if (f in d) {
                    c = d[f++];
                    break;
                }
                if (++f >= e) throw new TypeError();
            }
            for (;e > f; ) f in d && (c = b.call(a, c, d[f], f, d)), f++;
            return c;
        });
    }();
    var d = function() {
        function a(a) {
            return null == a ? String(a) : W[X.call(a)] || "object";
        }
        function b(b) {
            return "function" == a(b);
        }
        function c(a) {
            return null != a && a == a.window;
        }
        function d(a) {
            return null != a && a.nodeType == a.DOCUMENT_NODE;
        }
        function e(b) {
            return "object" == a(b);
        }
        function f(a) {
            return e(a) && !c(a) && a.__proto__ == Object.prototype;
        }
        function g(a) {
            return a instanceof Array;
        }
        function h(a) {
            return "number" == typeof a.length;
        }
        function i(a) {
            return E.call(a, function(a) {
                return null != a;
            });
        }
        function j(a) {
            return a.length > 0 ? y.fn.concat.apply([], a) : a;
        }
        function k(a) {
            return a.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase();
        }
        function l(a) {
            return a in H ? H[a] : H[a] = new RegExp("(^|\\s)" + a + "(\\s|$)");
        }
        function m(a, b) {
            return "number" != typeof b || J[k(a)] ? b : b + "px";
        }
        function n(a) {
            var b, c;
            return G[a] || (b = F.createElement(a), F.body.appendChild(b), c = I(b, "").getPropertyValue("display"), 
            b.parentNode.removeChild(b), "none" == c && (c = "block"), G[a] = c), G[a];
        }
        function o(a) {
            return "children" in a ? D.call(a.children) : y.map(a.childNodes, function(a) {
                return 1 == a.nodeType ? a : void 0;
            });
        }
        function p(a, b, c) {
            for (x in b) c && (f(b[x]) || g(b[x])) ? (f(b[x]) && !f(a[x]) && (a[x] = {}), g(b[x]) && !g(a[x]) && (a[x] = []), 
            p(a[x], b[x], c)) : b[x] !== w && (a[x] = b[x]);
        }
        function q(a, b) {
            return b === w ? y(a) : y(a).filter(b);
        }
        function r(a, c, d, e) {
            return b(c) ? c.call(a, d, e) : c;
        }
        function s(a, b, c) {
            null == c ? a.removeAttribute(b) : a.setAttribute(b, c);
        }
        function t(a, b) {
            var c = a.className, d = c && c.baseVal !== w;
            return b === w ? d ? c.baseVal : c : (d ? c.baseVal = b : a.className = b, void 0);
        }
        function u(a) {
            var b;
            try {
                return a ? "true" == a || ("false" == a ? !1 : "null" == a ? null : isNaN(b = Number(a)) ? /^[\[\{]/.test(a) ? y.parseJSON(a) : a : b) : a;
            } catch (c) {
                return a;
            }
        }
        function v(a, b) {
            b(a);
            for (var c in a.childNodes) v(a.childNodes[c], b);
        }
        var w, x, y, z, A, B, C = [], D = C.slice, E = C.filter, F = window.document, G = {}, H = {}, I = F.defaultView.getComputedStyle, J = {
            "column-count": 1,
            columns: 1,
            "font-weight": 1,
            "line-height": 1,
            opacity: 1,
            "z-index": 1,
            zoom: 1
        }, K = /^\s*<(\w+|!)[^>]*>/, L = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, M = /^(?:body|html)$/i, N = [ "val", "css", "html", "text", "data", "width", "height", "offset" ], O = [ "after", "prepend", "before", "append" ], P = F.createElement("table"), Q = F.createElement("tr"), R = {
            tr: F.createElement("tbody"),
            tbody: P,
            thead: P,
            tfoot: P,
            td: Q,
            th: Q,
            "*": F.createElement("div")
        }, S = /complete|loaded|interactive/, T = /^\.([\w-]+)$/, U = /^#([\w-]*)$/, V = /^[\w-]+$/, W = {}, X = W.toString, Y = {}, Z = F.createElement("div");
        return Y.matches = function(a, b) {
            if (!a || 1 !== a.nodeType) return !1;
            var c = a.webkitMatchesSelector || a.mozMatchesSelector || a.oMatchesSelector || a.matchesSelector;
            if (c) return c.call(a, b);
            var d, e = a.parentNode, f = !e;
            return f && (e = Z).appendChild(a), d = ~Y.qsa(e, b).indexOf(a), f && Z.removeChild(a), 
            d;
        }, A = function(a) {
            return a.replace(/-+(.)?/g, function(a, b) {
                return b ? b.toUpperCase() : "";
            });
        }, B = function(a) {
            return E.call(a, function(b, c) {
                return a.indexOf(b) == c;
            });
        }, Y.fragment = function(a, b, c) {
            a.replace && (a = a.replace(L, "<$1></$2>")), b === w && (b = K.test(a) && RegExp.$1), 
            b in R || (b = "*");
            var d, e, g = R[b];
            return g.innerHTML = "" + a, e = y.each(D.call(g.childNodes), function() {
                g.removeChild(this);
            }), f(c) && (d = y(e), y.each(c, function(a, b) {
                N.indexOf(a) > -1 ? d[a](b) : d.attr(a, b);
            })), e;
        }, Y.Z = function(a, b) {
            return a = a || [], a.__proto__ = y.fn, a.selector = b || "", a;
        }, Y.isZ = function(a) {
            return a instanceof Y.Z;
        }, Y.init = function(a, c) {
            if (a) {
                if (b(a)) return y(F).ready(a);
                if (Y.isZ(a)) return a;
                var d;
                if (g(a)) d = i(a); else if (e(a)) d = [ f(a) ? y.extend({}, a) : a ], a = null; else if (K.test(a)) d = Y.fragment(a.trim(), RegExp.$1, c), 
                a = null; else {
                    if (c !== w) return y(c).find(a);
                    d = Y.qsa(F, a);
                }
                return Y.Z(d, a);
            }
            return Y.Z();
        }, y = function(a, b) {
            return Y.init(a, b);
        }, y.extend = function(a) {
            var b, c = D.call(arguments, 1);
            return "boolean" == typeof a && (b = a, a = c.shift()), c.forEach(function(c) {
                p(a, c, b);
            }), a;
        }, Y.qsa = function(a, b) {
            var c;
            return d(a) && U.test(b) ? (c = a.getElementById(RegExp.$1)) ? [ c ] : [] : 1 !== a.nodeType && 9 !== a.nodeType ? [] : D.call(T.test(b) ? a.getElementsByClassName(RegExp.$1) : V.test(b) ? a.getElementsByTagName(b) : a.querySelectorAll(b));
        }, y.contains = function(a, b) {
            return a !== b && a.contains(b);
        }, y.type = a, y.isFunction = b, y.isWindow = c, y.isArray = g, y.isPlainObject = f, 
        y.isEmptyObject = function(a) {
            var b;
            for (b in a) return !1;
            return !0;
        }, y.inArray = function(a, b, c) {
            return C.indexOf.call(b, a, c);
        }, y.camelCase = A, y.trim = function(a) {
            return a.trim();
        }, y.uuid = 0, y.support = {}, y.expr = {}, y.map = function(a, b) {
            var c, d, e, f = [];
            if (h(a)) for (d = 0; d < a.length; d++) c = b(a[d], d), null != c && f.push(c); else for (e in a) c = b(a[e], e), 
            null != c && f.push(c);
            return j(f);
        }, y.each = function(a, b) {
            var c, d;
            if (h(a)) {
                for (c = 0; c < a.length; c++) if (b.call(a[c], c, a[c]) === !1) return a;
            } else for (d in a) if (b.call(a[d], d, a[d]) === !1) return a;
            return a;
        }, y.grep = function(a, b) {
            return E.call(a, b);
        }, window.JSON && (y.parseJSON = JSON.parse), y.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(a, b) {
            W["[object " + b + "]"] = b.toLowerCase();
        }), y.fn = {
            forEach: C.forEach,
            reduce: C.reduce,
            push: C.push,
            sort: C.sort,
            indexOf: C.indexOf,
            concat: C.concat,
            map: function(a) {
                return y(y.map(this, function(b, c) {
                    return a.call(b, c, b);
                }));
            },
            slice: function() {
                return y(D.apply(this, arguments));
            },
            ready: function(a) {
                return S.test(F.readyState) ? a(y) : F.addEventListener("DOMContentLoaded", function() {
                    a(y);
                }, !1), this;
            },
            get: function(a) {
                return a === w ? D.call(this) : this[a >= 0 ? a : a + this.length];
            },
            toArray: function() {
                return this.get();
            },
            size: function() {
                return this.length;
            },
            remove: function() {
                return this.each(function() {
                    null != this.parentNode && this.parentNode.removeChild(this);
                });
            },
            each: function(a) {
                return C.every.call(this, function(b, c) {
                    return a.call(b, c, b) !== !1;
                }), this;
            },
            filter: function(a) {
                return b(a) ? this.not(this.not(a)) : y(E.call(this, function(b) {
                    return Y.matches(b, a);
                }));
            },
            add: function(a, b) {
                return y(B(this.concat(y(a, b))));
            },
            is: function(a) {
                return this.length > 0 && Y.matches(this[0], a);
            },
            not: function(a) {
                var c = [];
                if (b(a) && a.call !== w) this.each(function(b) {
                    a.call(this, b) || c.push(this);
                }); else {
                    var d = "string" == typeof a ? this.filter(a) : h(a) && b(a.item) ? D.call(a) : y(a);
                    this.forEach(function(a) {
                        d.indexOf(a) < 0 && c.push(a);
                    });
                }
                return y(c);
            },
            has: function(a) {
                return this.filter(function() {
                    return e(a) ? y.contains(this, a) : y(this).find(a).size();
                });
            },
            eq: function(a) {
                return -1 === a ? this.slice(a) : this.slice(a, +a + 1);
            },
            first: function() {
                var a = this[0];
                return a && !e(a) ? a : y(a);
            },
            last: function() {
                var a = this[this.length - 1];
                return a && !e(a) ? a : y(a);
            },
            find: function(a) {
                var b, c = this;
                return b = "object" == typeof a ? y(a).filter(function() {
                    var a = this;
                    return C.some.call(c, function(b) {
                        return y.contains(b, a);
                    });
                }) : 1 == this.length ? y(Y.qsa(this[0], a)) : this.map(function() {
                    return Y.qsa(this, a);
                });
            },
            closest: function(a, b) {
                var c = this[0], e = !1;
                for ("object" == typeof a && (e = y(a)); c && !(e ? e.indexOf(c) >= 0 : Y.matches(c, a)); ) c = c !== b && !d(c) && c.parentNode;
                return y(c);
            },
            parents: function(a) {
                for (var b = [], c = this; c.length > 0; ) c = y.map(c, function(a) {
                    return (a = a.parentNode) && !d(a) && b.indexOf(a) < 0 ? (b.push(a), a) : void 0;
                });
                return q(b, a);
            },
            parent: function(a) {
                return q(B(this.pluck("parentNode")), a);
            },
            children: function(a) {
                return q(this.map(function() {
                    return o(this);
                }), a);
            },
            contents: function() {
                return this.map(function() {
                    return D.call(this.childNodes);
                });
            },
            siblings: function(a) {
                return q(this.map(function(a, b) {
                    return E.call(o(b.parentNode), function(a) {
                        return a !== b;
                    });
                }), a);
            },
            empty: function() {
                return this.each(function() {
                    this.innerHTML = "";
                });
            },
            pluck: function(a) {
                return y.map(this, function(b) {
                    return b[a];
                });
            },
            show: function() {
                return this.each(function() {
                    "none" == this.style.display && (this.style.display = null), "none" == I(this, "").getPropertyValue("display") && (this.style.display = n(this.nodeName));
                });
            },
            replaceWith: function(a) {
                return this.before(a).remove();
            },
            wrap: function(a) {
                var c = b(a);
                if (this[0] && !c) var d = y(a).get(0), e = d.parentNode || this.length > 1;
                return this.each(function(b) {
                    y(this).wrapAll(c ? a.call(this, b) : e ? d.cloneNode(!0) : d);
                });
            },
            wrapAll: function(a) {
                if (this[0]) {
                    y(this[0]).before(a = y(a));
                    for (var b; (b = a.children()).length; ) a = b.first();
                    y(a).append(this);
                }
                return this;
            },
            wrapInner: function(a) {
                var c = b(a);
                return this.each(function(b) {
                    var d = y(this), e = d.contents(), f = c ? a.call(this, b) : a;
                    e.length ? e.wrapAll(f) : d.append(f);
                });
            },
            unwrap: function() {
                return this.parent().each(function() {
                    y(this).replaceWith(y(this).children());
                }), this;
            },
            clone: function() {
                return this.map(function() {
                    return this.cloneNode(!0);
                });
            },
            hide: function() {
                return this.css("display", "none");
            },
            toggle: function(a) {
                return this.each(function() {
                    var b = y(this);
                    (a === w ? "none" == b.css("display") : a) ? b.show() : b.hide();
                });
            },
            prev: function(a) {
                return y(this.pluck("previousElementSibling")).filter(a || "*");
            },
            next: function(a) {
                return y(this.pluck("nextElementSibling")).filter(a || "*");
            },
            html: function(a) {
                return a === w ? this.length > 0 ? this[0].innerHTML : null : this.each(function(b) {
                    var c = this.innerHTML;
                    y(this).empty().append(r(this, a, b, c));
                });
            },
            text: function(a) {
                return a === w ? this.length > 0 ? this[0].textContent : null : this.each(function() {
                    this.textContent = a;
                });
            },
            attr: function(a, b) {
                var c;
                return "string" == typeof a && b === w ? 0 == this.length || 1 !== this[0].nodeType ? w : "value" == a && "INPUT" == this[0].nodeName ? this.val() : !(c = this[0].getAttribute(a)) && a in this[0] ? this[0][a] : c : this.each(function(c) {
                    if (1 === this.nodeType) if (e(a)) for (x in a) s(this, x, a[x]); else s(this, a, r(this, b, c, this.getAttribute(a)));
                });
            },
            removeAttr: function(a) {
                return this.each(function() {
                    1 === this.nodeType && s(this, a);
                });
            },
            prop: function(a, b) {
                return b === w ? this[0] && this[0][a] : this.each(function(c) {
                    this[a] = r(this, b, c, this[a]);
                });
            },
            data: function(a, b) {
                var c = this.attr("data-" + k(a), b);
                return null !== c ? u(c) : w;
            },
            val: function(a) {
                return a === w ? this[0] && (this[0].multiple ? y(this[0]).find("option").filter(function() {
                    return this.selected;
                }).pluck("value") : this[0].value) : this.each(function(b) {
                    this.value = r(this, a, b, this.value);
                });
            },
            offset: function(a) {
                if (a) return this.each(function(b) {
                    var c = y(this), d = r(this, a, b, c.offset()), e = c.offsetParent().offset(), f = {
                        top: d.top - e.top,
                        left: d.left - e.left
                    };
                    "static" == c.css("position") && (f.position = "relative"), c.css(f);
                });
                if (0 == this.length) return null;
                var b = this[0].getBoundingClientRect();
                return {
                    left: b.left + window.pageXOffset,
                    top: b.top + window.pageYOffset,
                    width: Math.round(b.width),
                    height: Math.round(b.height)
                };
            },
            css: function(b, c) {
                if (arguments.length < 2 && "string" == typeof b) return this[0] && (this[0].style[A(b)] || I(this[0], "").getPropertyValue(b));
                var d = "";
                if ("string" == a(b)) c || 0 === c ? d = k(b) + ":" + m(b, c) : this.each(function() {
                    this.style.removeProperty(k(b));
                }); else for (x in b) b[x] || 0 === b[x] ? d += k(x) + ":" + m(x, b[x]) + ";" : this.each(function() {
                    this.style.removeProperty(k(x));
                });
                return this.each(function() {
                    this.style.cssText += ";" + d;
                });
            },
            index: function(a) {
                return a ? this.indexOf(y(a)[0]) : this.parent().children().indexOf(this[0]);
            },
            hasClass: function(a) {
                return C.some.call(this, function(a) {
                    return this.test(t(a));
                }, l(a));
            },
            addClass: function(a) {
                return this.each(function(b) {
                    z = [];
                    var c = t(this), d = r(this, a, b, c);
                    d.split(/\s+/g).forEach(function(a) {
                        y(this).hasClass(a) || z.push(a);
                    }, this), z.length && t(this, c + (c ? " " : "") + z.join(" "));
                });
            },
            removeClass: function(a) {
                return this.each(function(b) {
                    return a === w ? t(this, "") : (z = t(this), r(this, a, b, z).split(/\s+/g).forEach(function(a) {
                        z = z.replace(l(a), " ");
                    }), t(this, z.trim()), void 0);
                });
            },
            toggleClass: function(a, b) {
                return this.each(function(c) {
                    var d = y(this), e = r(this, a, c, t(this));
                    e.split(/\s+/g).forEach(function(a) {
                        (b === w ? !d.hasClass(a) : b) ? d.addClass(a) : d.removeClass(a);
                    });
                });
            },
            scrollTop: function() {
                return this.length ? "scrollTop" in this[0] ? this[0].scrollTop : this[0].scrollY : void 0;
            },
            position: function() {
                if (this.length) {
                    var a = this[0], b = this.offsetParent(), c = this.offset(), d = M.test(b[0].nodeName) ? {
                        top: 0,
                        left: 0
                    } : b.offset();
                    return c.top -= parseFloat(y(a).css("margin-top")) || 0, c.left -= parseFloat(y(a).css("margin-left")) || 0, 
                    d.top += parseFloat(y(b[0]).css("border-top-width")) || 0, d.left += parseFloat(y(b[0]).css("border-left-width")) || 0, 
                    {
                        top: c.top - d.top,
                        left: c.left - d.left
                    };
                }
            },
            offsetParent: function() {
                return this.map(function() {
                    for (var a = this.offsetParent || F.body; a && !M.test(a.nodeName) && "static" == y(a).css("position"); ) a = a.offsetParent;
                    return a;
                });
            }
        }, y.fn.detach = y.fn.remove, [ "width", "height" ].forEach(function(a) {
            y.fn[a] = function(b) {
                var e, f = this[0], g = a.replace(/./, function(a) {
                    return a[0].toUpperCase();
                });
                return b === w ? c(f) ? f["inner" + g] : d(f) ? f.documentElement["offset" + g] : (e = this.offset()) && e[a] : this.each(function(c) {
                    f = y(this), f.css(a, r(this, b, c, f[a]()));
                });
            };
        }), O.forEach(function(b, c) {
            var d = c % 2;
            y.fn[b] = function() {
                var b, e, f = y.map(arguments, function(c) {
                    return b = a(c), "object" == b || "array" == b || null == c ? c : Y.fragment(c);
                }), g = this.length > 1;
                return f.length < 1 ? this : this.each(function(a, b) {
                    e = d ? b : b.parentNode, b = 0 == c ? b.nextSibling : 1 == c ? b.firstChild : 2 == c ? b : null, 
                    f.forEach(function(a) {
                        if (g) a = a.cloneNode(!0); else if (!e) return y(a).remove();
                        v(e.insertBefore(a, b), function(a) {
                            null == a.nodeName || "SCRIPT" !== a.nodeName.toUpperCase() || a.type && "text/javascript" !== a.type || a.src || window.eval.call(window, a.innerHTML);
                        });
                    });
                });
            }, y.fn[d ? b + "To" : "insert" + (c ? "Before" : "After")] = function(a) {
                return y(a)[b](this), this;
            };
        }), Y.Z.prototype = y.fn, Y.uniq = B, Y.deserializeValue = u, y.zepto = Y, y;
    }();
    window.Zepto = d, "$" in window || (window.$ = d), function(a) {
        function b(a) {
            var b = this.os = {}, c = this.browser = {}, d = a.match(/WebKit\/([\d.]+)/), e = a.match(/(Android)\s+([\d.]+)/), f = a.match(/(iPad).*OS\s([\d_]+)/), g = !f && a.match(/(iPhone\sOS)\s([\d_]+)/), h = a.match(/(webOS|hpwOS)[\s\/]([\d.]+)/), i = h && a.match(/TouchPad/), j = a.match(/Kindle\/([\d.]+)/), k = a.match(/Silk\/([\d._]+)/), l = a.match(/(BlackBerry).*Version\/([\d.]+)/), m = a.match(/(BB10).*Version\/([\d.]+)/), n = a.match(/(RIM\sTablet\sOS)\s([\d.]+)/), o = a.match(/PlayBook/), p = a.match(/Chrome\/([\d.]+)/) || a.match(/CriOS\/([\d.]+)/), q = a.match(/Firefox\/([\d.]+)/);
            (c.webkit = !!d) && (c.version = d[1]), e && (b.android = !0, b.version = e[2]), 
            g && (b.ios = b.iphone = !0, b.version = g[2].replace(/_/g, ".")), f && (b.ios = b.ipad = !0, 
            b.version = f[2].replace(/_/g, ".")), h && (b.webos = !0, b.version = h[2]), i && (b.touchpad = !0), 
            l && (b.blackberry = !0, b.version = l[2]), m && (b.bb10 = !0, b.version = m[2]), 
            n && (b.rimtabletos = !0, b.version = n[2]), o && (c.playbook = !0), j && (b.kindle = !0, 
            b.version = j[1]), k && (c.silk = !0, c.version = k[1]), !k && b.android && a.match(/Kindle Fire/) && (c.silk = !0), 
            p && (c.chrome = !0, c.version = p[1]), q && (c.firefox = !0, c.version = q[1]), 
            b.tablet = !!(f || o || e && !a.match(/Mobile/) || q && a.match(/Tablet/)), b.phone = !(b.tablet || !(e || g || h || l || m || p && a.match(/Android/) || p && a.match(/CriOS\/([\d.]+)/) || q && a.match(/Mobile/)));
        }
        b.call(a, navigator.userAgent), a.__detect = b;
    }(d), function(a) {
        function b(a) {
            return a._zid || (a._zid = n++);
        }
        function c(a, c, f, g) {
            if (c = d(c), c.ns) var h = e(c.ns);
            return (m[b(a)] || []).filter(function(a) {
                return !(!a || c.e && a.e != c.e || c.ns && !h.test(a.ns) || f && b(a.fn) !== b(f) || g && a.sel != g);
            });
        }
        function d(a) {
            var b = ("" + a).split(".");
            return {
                e: b[0],
                ns: b.slice(1).sort().join(" ")
            };
        }
        function e(a) {
            return new RegExp("(?:^| )" + a.replace(" ", " .* ?") + "(?: |$)");
        }
        function f(b, c, d) {
            "string" != a.type(b) ? a.each(b, d) : b.split(/\s/).forEach(function(a) {
                d(a, c);
            });
        }
        function g(a, b) {
            return a.del && ("focus" == a.e || "blur" == a.e) || !!b;
        }
        function h(a) {
            return p[a] || a;
        }
        function i(c, e, i, j, k, l) {
            var n = b(c), o = m[n] || (m[n] = []);
            f(e, i, function(b, e) {
                var f = d(b);
                f.fn = e, f.sel = j, f.e in p && (e = function(b) {
                    var c = b.relatedTarget;
                    return !c || c !== this && !a.contains(this, c) ? f.fn.apply(this, arguments) : void 0;
                }), f.del = k && k(e, b);
                var i = f.del || e;
                f.proxy = function(a) {
                    var b = i.apply(c, [ a ].concat(a.data));
                    return b === !1 && (a.preventDefault(), a.stopPropagation()), b;
                }, f.i = o.length, o.push(f), c.addEventListener(h(f.e), f.proxy, g(f, l));
            });
        }
        function j(a, d, e, i, j) {
            var k = b(a);
            f(d || "", e, function(b, d) {
                c(a, b, d, i).forEach(function(b) {
                    delete m[k][b.i], a.removeEventListener(h(b.e), b.proxy, g(b, j));
                });
            });
        }
        function k(b) {
            var c, d = {
                originalEvent: b
            };
            for (c in b) s.test(c) || void 0 === b[c] || (d[c] = b[c]);
            return a.each(t, function(a, c) {
                d[a] = function() {
                    return this[c] = q, b[a].apply(b, arguments);
                }, d[c] = r;
            }), d;
        }
        function l(a) {
            if (!("defaultPrevented" in a)) {
                a.defaultPrevented = !1;
                var b = a.preventDefault;
                a.preventDefault = function() {
                    this.defaultPrevented = !0, b.call(this);
                };
            }
        }
        var m = (a.zepto.qsa, {}), n = 1, o = {}, p = {
            mouseenter: "mouseover",
            mouseleave: "mouseout"
        };
        o.click = o.mousedown = o.mouseup = o.mousemove = "MouseEvents", a.event = {
            add: i,
            remove: j
        }, a.proxy = function(c, d) {
            if (a.isFunction(c)) {
                var e = function() {
                    return c.apply(d, arguments);
                };
                return e._zid = b(c), e;
            }
            if ("string" == typeof d) return a.proxy(c[d], c);
            throw new TypeError("expected function");
        }, a.fn.bind = function(a, b) {
            return this.each(function() {
                i(this, a, b);
            });
        }, a.fn.unbind = function(a, b) {
            return this.each(function() {
                j(this, a, b);
            });
        }, a.fn.one = function(a, b) {
            return this.each(function(c, d) {
                i(this, a, b, null, function(a, b) {
                    return function() {
                        var c = a.apply(d, arguments);
                        return j(d, b, a), c;
                    };
                });
            });
        };
        var q = function() {
            return !0;
        }, r = function() {
            return !1;
        }, s = /^([A-Z]|layer[XY]$)/, t = {
            preventDefault: "isDefaultPrevented",
            stopImmediatePropagation: "isImmediatePropagationStopped",
            stopPropagation: "isPropagationStopped"
        };
        a.fn.delegate = function(b, c, d) {
            return this.each(function(e, f) {
                i(f, c, d, b, function(c) {
                    return function(d) {
                        var e, g = a(d.target).closest(b, f).get(0);
                        return g ? (e = a.extend(k(d), {
                            currentTarget: g,
                            liveFired: f
                        }), c.apply(g, [ e ].concat([].slice.call(arguments, 1)))) : void 0;
                    };
                });
            });
        }, a.fn.undelegate = function(a, b, c) {
            return this.each(function() {
                j(this, b, c, a);
            });
        }, a.fn.live = function(b, c) {
            return a(document.body).delegate(this.selector, b, c), this;
        }, a.fn.die = function(b, c) {
            return a(document.body).undelegate(this.selector, b, c), this;
        }, a.fn.on = function(b, c, d) {
            return !c || a.isFunction(c) ? this.bind(b, c || d) : this.delegate(c, b, d);
        }, a.fn.off = function(b, c, d) {
            return !c || a.isFunction(c) ? this.unbind(b, c || d) : this.undelegate(c, b, d);
        }, a.fn.trigger = function(b, c) {
            return ("string" == typeof b || a.isPlainObject(b)) && (b = a.Event(b)), l(b), b.data = c, 
            this.each(function() {
                "dispatchEvent" in this && this.dispatchEvent(b);
            });
        }, a.fn.triggerHandler = function(b, d) {
            var e, f;
            return this.each(function(g, h) {
                e = k("string" == typeof b ? a.Event(b) : b), e.data = d, e.target = h, a.each(c(h, b.type || b), function(a, b) {
                    return f = b.proxy(e), e.isImmediatePropagationStopped() ? !1 : void 0;
                });
            }), f;
        }, "focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error".split(" ").forEach(function(b) {
            a.fn[b] = function(a) {
                return a ? this.bind(b, a) : this.trigger(b);
            };
        }), [ "focus", "blur" ].forEach(function(b) {
            a.fn[b] = function(a) {
                return a ? this.bind(b, a) : this.each(function() {
                    try {
                        this[b]();
                    } catch (a) {}
                }), this;
            };
        }), a.Event = function(a, b) {
            "string" != typeof a && (b = a, a = b.type);
            var c = document.createEvent(o[a] || "Events"), d = !0;
            if (b) for (var e in b) "bubbles" == e ? d = !!b[e] : c[e] = b[e];
            return c.initEvent(a, d, !0, null, null, null, null, null, null, null, null, null, null, null, null), 
            c.isDefaultPrevented = function() {
                return this.defaultPrevented;
            }, c;
        };
    }(d), function(a) {
        function b(b, c, d) {
            var e = a.Event(c);
            return a(b).trigger(e, d), !e.defaultPrevented;
        }
        function c(a, c, d, e) {
            return a.global ? b(c || s, d, e) : void 0;
        }
        function d(b) {
            b.global && 0 === a.active++ && c(b, null, "ajaxStart");
        }
        function e(b) {
            b.global && !--a.active && c(b, null, "ajaxStop");
        }
        function f(a, b) {
            var d = b.context;
            return b.beforeSend.call(d, a, b) === !1 || c(b, d, "ajaxBeforeSend", [ a, b ]) === !1 ? !1 : (c(b, d, "ajaxSend", [ a, b ]), 
            void 0);
        }
        function g(a, b, d) {
            var e = d.context, f = "success";
            d.success.call(e, a, f, b), c(d, e, "ajaxSuccess", [ b, d, a ]), i(f, b, d);
        }
        function h(a, b, d, e) {
            var f = e.context;
            e.error.call(f, d, b, a), c(e, f, "ajaxError", [ d, e, a ]), i(b, d, e);
        }
        function i(a, b, d) {
            var f = d.context;
            d.complete.call(f, b, a), c(d, f, "ajaxComplete", [ b, d ]), e(d);
        }
        function j() {}
        function k(a) {
            return a && (a = a.split(";", 2)[0]), a && (a == x ? "html" : a == w ? "json" : u.test(a) ? "script" : v.test(a) && "xml") || "text";
        }
        function l(a, b) {
            return (a + "&" + b).replace(/[&?]{1,2}/, "?");
        }
        function m(b) {
            b.processData && b.data && "string" != a.type(b.data) && (b.data = a.param(b.data, b.traditional)), 
            !b.data || b.type && "GET" != b.type.toUpperCase() || (b.url = l(b.url, b.data));
        }
        function n(b, c, d, e) {
            var f = !a.isFunction(c);
            return {
                url: b,
                data: f ? c : void 0,
                success: f ? a.isFunction(d) ? d : void 0 : c,
                dataType: f ? e || d : d
            };
        }
        function o(b, c, d, e) {
            var f, g = a.isArray(c);
            a.each(c, function(c, h) {
                f = a.type(h), e && (c = d ? e : e + "[" + (g ? "" : c) + "]"), !e && g ? b.add(h.name, h.value) : "array" == f || !d && "object" == f ? o(b, h, d, c) : b.add(c, h);
            });
        }
        var p, q, r = 0, s = window.document, t = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, u = /^(?:text|application)\/javascript/i, v = /^(?:text|application)\/xml/i, w = "application/json", x = "text/html", y = /^\s*$/;
        a.active = 0, a.ajaxJSONP = function(b) {
            if (!("type" in b)) return a.ajax(b);
            var c, d = "jsonp" + ++r, e = s.createElement("script"), i = function() {
                clearTimeout(c), a(e).remove(), delete window[d];
            }, k = function(a) {
                i(), a && "timeout" != a || (window[d] = j), h(null, a || "abort", l, b);
            }, l = {
                abort: k
            };
            return f(l, b) === !1 ? (k("abort"), !1) : (window[d] = function(a) {
                i(), g(a, l, b);
            }, e.onerror = function() {
                k("error");
            }, e.src = b.url.replace(/=\?/, "=" + d), a("head").append(e), b.timeout > 0 && (c = setTimeout(function() {
                k("timeout");
            }, b.timeout)), l);
        }, a.ajaxSettings = {
            type: "GET",
            beforeSend: j,
            success: j,
            error: j,
            complete: j,
            context: null,
            global: !0,
            xhr: function() {
                return new window.XMLHttpRequest();
            },
            accepts: {
                script: "text/javascript, application/javascript",
                json: w,
                xml: "application/xml, text/xml",
                html: x,
                text: "text/plain"
            },
            crossDomain: !1,
            timeout: 0,
            processData: !0,
            cache: !0
        }, a.ajax = function(b) {
            var c = a.extend({}, b || {});
            for (p in a.ajaxSettings) void 0 === c[p] && (c[p] = a.ajaxSettings[p]);
            d(c), c.crossDomain || (c.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(c.url) && RegExp.$2 != window.location.host), 
            c.url || (c.url = window.location.toString()), m(c), c.cache === !1 && (c.url = l(c.url, "_=" + Date.now()));
            var e = c.dataType, i = /=\?/.test(c.url);
            if ("jsonp" == e || i) return i || (c.url = l(c.url, "callback=?")), a.ajaxJSONP(c);
            var n, o = c.accepts[e], r = {}, s = /^([\w-]+:)\/\//.test(c.url) ? RegExp.$1 : window.location.protocol, t = c.xhr();
            c.crossDomain || (r["X-Requested-With"] = "XMLHttpRequest"), o && (r.Accept = o, 
            o.indexOf(",") > -1 && (o = o.split(",", 2)[0]), t.overrideMimeType && t.overrideMimeType(o)), 
            (c.contentType || c.contentType !== !1 && c.data && "GET" != c.type.toUpperCase()) && (r["Content-Type"] = c.contentType || "application/x-www-form-urlencoded"), 
            c.headers = a.extend(r, c.headers || {}), t.onreadystatechange = function() {
                if (4 == t.readyState) {
                    t.onreadystatechange = j, clearTimeout(n);
                    var b, d = !1;
                    if (t.status >= 200 && t.status < 300 || 304 == t.status || 0 == t.status && "file:" == s) {
                        e = e || k(t.getResponseHeader("content-type")), b = t.responseText;
                        try {
                            "script" == e ? (1, eval)(b) : "xml" == e ? b = t.responseXML : "json" == e && (b = y.test(b) ? null : a.parseJSON(b));
                        } catch (f) {
                            d = f;
                        }
                        d ? h(d, "parsererror", t, c) : g(b, t, c);
                    } else h(null, t.status ? "error" : "abort", t, c);
                }
            };
            var u = "async" in c ? c.async : !0;
            t.open(c.type, c.url, u);
            for (q in c.headers) t.setRequestHeader(q, c.headers[q]);
            return f(t, c) === !1 ? (t.abort(), !1) : (c.timeout > 0 && (n = setTimeout(function() {
                t.onreadystatechange = j, t.abort(), h(null, "timeout", t, c);
            }, c.timeout)), t.send(c.data ? c.data : null), t);
        }, a.get = function() {
            return a.ajax(n.apply(null, arguments));
        }, a.post = function() {
            var b = n.apply(null, arguments);
            return b.type = "POST", a.ajax(b);
        }, a.getJSON = function() {
            var b = n.apply(null, arguments);
            return b.dataType = "json", a.ajax(b);
        }, a.fn.load = function(b, c, d) {
            if (!this.length) return this;
            var e, f = this, g = b.split(/\s/), h = n(b, c, d), i = h.success;
            return g.length > 1 && (h.url = g[0], e = g[1]), h.success = function(b) {
                f.html(e ? a("<div>").html(b.replace(t, "")).find(e) : b), i && i.apply(f, arguments);
            }, a.ajax(h), this;
        };
        var z = encodeURIComponent;
        a.param = function(a, b) {
            var c = [];
            return c.add = function(a, b) {
                this.push(z(a) + "=" + z(b));
            }, o(c, a, b), c.join("&").replace(/%20/g, "+");
        };
    }(d), function(a) {
        a.fn.serializeArray = function() {
            var b, c = [];
            return a(Array.prototype.slice.call(this.get(0).elements)).each(function() {
                b = a(this);
                var d = b.attr("type");
                "fieldset" != this.nodeName.toLowerCase() && !this.disabled && "submit" != d && "reset" != d && "button" != d && ("radio" != d && "checkbox" != d || this.checked) && c.push({
                    name: b.attr("name"),
                    value: b.val()
                });
            }), c;
        }, a.fn.serialize = function() {
            var a = [];
            return this.serializeArray().forEach(function(b) {
                a.push(encodeURIComponent(b.name) + "=" + encodeURIComponent(b.value));
            }), a.join("&");
        }, a.fn.submit = function(b) {
            if (b) this.bind("submit", b); else if (this.length) {
                var c = a.Event("submit");
                this.eq(0).trigger(c), c.defaultPrevented || this.get(0).submit();
            }
            return this;
        };
    }(d), function(a, b) {
        function c(a) {
            return d(a.replace(/([a-z])([A-Z])/, "$1-$2"));
        }
        function d(a) {
            return a.toLowerCase();
        }
        function e(a) {
            return f ? f + a : d(a);
        }
        var f, g, h, i, j, k, l, m, n = "", o = {
            Webkit: "webkit",
            Moz: "",
            O: "o",
            ms: "MS"
        }, p = window.document, q = p.createElement("div"), r = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i, s = {};
        a.each(o, function(a, c) {
            return q.style[a + "TransitionProperty"] !== b ? (n = "-" + d(a) + "-", f = c, !1) : void 0;
        }), g = n + "transform", s[h = n + "transition-property"] = s[i = n + "transition-duration"] = s[j = n + "transition-timing-function"] = s[k = n + "animation-name"] = s[l = n + "animation-duration"] = s[m = n + "animation-timing-function"] = "", 
        a.fx = {
            off: f === b && q.style.transitionProperty === b,
            speeds: {
                _default: 400,
                fast: 200,
                slow: 600
            },
            cssPrefix: n,
            transitionEnd: e("TransitionEnd"),
            animationEnd: e("AnimationEnd")
        }, a.fn.animate = function(b, c, d, e) {
            return a.isPlainObject(c) && (d = c.easing, e = c.complete, c = c.duration), c && (c = ("number" == typeof c ? c : a.fx.speeds[c] || a.fx.speeds._default) / 1e3), 
            this.anim(b, c, d, e);
        }, a.fn.anim = function(d, e, f, n) {
            var o, p, q, t = {}, u = "", v = this, w = a.fx.transitionEnd;
            if (e === b && (e = .4), a.fx.off && (e = 0), "string" == typeof d) t[k] = d, t[l] = e + "s", 
            t[m] = f || "linear", w = a.fx.animationEnd; else {
                p = [];
                for (o in d) r.test(o) ? u += o + "(" + d[o] + ") " : (t[o] = d[o], p.push(c(o)));
                u && (t[g] = u, p.push(g)), e > 0 && "object" == typeof d && (t[h] = p.join(", "), 
                t[i] = e + "s", t[j] = f || "linear");
            }
            return q = function(b) {
                if ("undefined" != typeof b) {
                    if (b.target !== b.currentTarget) return;
                    a(b.target).unbind(w, q);
                }
                a(this).css(s), n && n.call(this);
            }, e > 0 && this.bind(w, q), this.size() && this.get(0).clientLeft, this.css(t), 
            0 >= e && setTimeout(function() {
                v.each(function() {
                    q.call(this);
                });
            }, 0), this;
        }, q = null;
    }(d), c.exports = window.Zepto;
});

define("/dist/tool", [ "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto" ], function(require, exports, module) {
    var Backbone = require("gallery/backbone/1.0.0/backbone");
    var $ = require("zepto/zepto/1.0.0/zepto");
    var COLORS = [ "black", "silver", "red", "fuchsia", "green", "yellow", "blue", "aqua" ];
    var Tool = Backbone.View.extend({
        el: $("footer"),
        showColorPanel: false,
        events: {
            "click .color-select-trigger": "toogleColorPanel",
            "click .eraser": "eraser"
        },
        initialize: function() {
            var that = this;
            this.colorPanel = $(".color-panel");
            this.colorPanel.children("div").bind("click", function(e) {
                that.toogleColorPanel(e);
                that.trigger("select", $(this).attr("data-color"));
            });
            this.on("select", function(color) {
                that.$el.find(".color-select-trigger").css("background-color", color);
            });
            this.render();
        },
        toogleColorPanel: function(e) {
            e.preventDefault();
            this.showColorPanel = !this.showColorPanel;
            if (this.showColorPanel) {
                this.colorPanel.show();
            } else {
                this.colorPanel.hide();
            }
        },
        eraser: function(e) {
            e.preventDefault();
            this.trigger("erase");
        },
        render: function() {
            this.colorPanel.children("div").each(function(index, el) {
                $(el).css("background-color", COLORS[index]).attr("data-color", COLORS[index]);
            });
        }
    });
    module.exports = Tool;
});

define("/dist/canvas", [ "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "island205/venus/1.0.0/venus", "zepto/zepto/1.0.0/zepto" ], function(require, exports, module) {
    var Backbone = require("gallery/backbone/1.0.0/backbone");
    var Vango = require("island205/venus/1.0.0/venus").Vango;
    var $ = require("zepto/zepto/1.0.0/zepto");
    var Canvas = Backbone.View.extend({
        el: $(".canvas"),
        color: "green",
        size: 9,
        width: 320,
        events: {
            "click canvas": "draw"
        },
        initialize: function() {
            this.canvas = new Vango(this.el, 320, 320);
            this.drawGrid();
        },
        draw: function(e) {
            e.preventDefault();
            var tile = this.getTile(e.offsetX, e.offsetY);
            this.drawTile(tile, this.color);
        },
        getTile: function(x, y) {
            var x = Math.floor(x / (this.width / this.size));
            var y = Math.floor(y / (this.width / this.size));
            return {
                x: x,
                y: y
            };
        },
        drawGrid: function() {
            var width = (this.width - (this.size + 1)) / this.size;
            for (var i = 0, len = this.size; i <= len; i++) {
                this.canvas.line(width * i + i, 0, width * i + i, this.width, {
                    stroke: true,
                    fill: false,
                    styles: {
                        strokeStyle: "silver"
                    }
                });
                this.canvas.line(0, width * i + i, this.width, width * i + i, {
                    stroke: true,
                    fill: false,
                    styles: {
                        strokeStyle: "silver"
                    }
                });
            }
        },
        drawTile: function(tile, color) {
            var width = (this.width - (this.size + 1)) / this.size;
            x = tile.x * (width + 1);
            y = tile.y * (width + 1);
            this.canvas.rectangle(x, y, width, width, {
                styles: {
                    fillStyle: color
                }
            });
        }
    });
    module.exports = Canvas;
});

define("island205/venus/1.0.0/venus", [ "./vango" ], function(a, b) {
    var c = a("./vango");
    b.Vango = c;
}), define("island205/venus/1.0.0/vango", [], function(a, b, c) {
    !function() {
        Array.prototype.forEach || (Array.prototype.forEach = function(a, b) {
            var c, d;
            if (null == this) throw new TypeError("this is null or not defined");
            var e = Object(this), f = e.length >>> 0;
            if ("[object Function]" != {}.toString.call(a)) throw new TypeError(a + " is not a function");
            for (b && (c = b), d = 0; f > d; ) {
                var g;
                d in e && (g = e[d], a.call(c, g, d, e)), d++;
            }
        });
    }(), function(a, d) {
        "object" == typeof b ? c.exports = d() : "function" == typeof define && define.amd ? define(d) : a.Vango = d();
    }(this, function() {
        function a(a, b, c) {
            var d;
            null != a && (d = this.canvas = i.createElement("canvas"), d.width = b, d.height = c, 
            this.context = d.getContext("2d"), a.appendChild(d));
        }
        function b(a) {
            var b = this;
            return function(c, d) {
                if (null == c) return this;
                if ("string" == typeof c && 1 === arguments.length && a) return a.call(this, c);
                if ("object" == typeof c) for (var e in c) b.call(this, e, c[e]); else b.call(this, c, d);
                return this;
            };
        }
        function c(a, b) {
            var c;
            a = a || {}, a = e(l, a), c = a.styles, this.save(), c && this.style(c), b && b(), 
            a.fill && this.fill(), a.stroke && this.stroke(), this.restore();
        }
        function d(a, b) {
            var c = i.createElement("image");
            c.onload = function() {
                b(c), delete c;
            }, c.src = a;
        }
        function e(a, b) {
            var c = {};
            for (var d in a) c[d] = a[d];
            for (d in b) c[d] = b[d];
            return c;
        }
        function f(a) {
            var b = a;
            if (!b) return [];
            var c = [ "m", "M", "l", "L", "v", "V", "h", "H", "z", "Z", "c", "C", "q", "Q", "t", "T", "s", "S", "a", "A" ];
            b = b.replace(new RegExp(" ", "g"), ",");
            for (var d = 0; d < c.length; d++) b = b.replace(new RegExp(c[d], "g"), "|" + c[d]);
            for (var e = b.split("|"), f = [], h = 0, i = 0, d = 1; d < e.length; d++) {
                var j = e[d], k = j.charAt(0);
                j = j.slice(1), j = j.replace(new RegExp(",-", "g"), "-"), j = j.replace(new RegExp("-", "g"), ",-");
                var l = j.split(",");
                l.length > 0 && "" === l[0] && l.shift();
                for (var m = 0; m < l.length; m++) l[m] = parseFloat(l[m]);
                for (;l.length > 0 && !isNaN(l[0]); ) {
                    var n = void 0, o = [];
                    switch (k) {
                      case "l":
                        h += l.shift(), i += l.shift(), n = "L", o.push(h, i);
                        break;

                      case "L":
                        h = l.shift(), i = l.shift(), o.push(h, i);
                        break;

                      case "m":
                        h += l.shift(), i += l.shift(), n = "M", o.push(h, i), k = "l";
                        break;

                      case "M":
                        h = l.shift(), i = l.shift(), n = "M", o.push(h, i), k = "L";
                        break;

                      case "h":
                        h += l.shift(), n = "L", o.push(h, i);
                        break;

                      case "H":
                        h = l.shift(), n = "L", o.push(h, i);
                        break;

                      case "v":
                        i += l.shift(), n = "L", o.push(h, i);
                        break;

                      case "V":
                        i = l.shift(), n = "L", o.push(h, i);
                        break;

                      case "C":
                        o.push(l.shift(), l.shift(), l.shift(), l.shift()), h = l.shift(), i = l.shift(), 
                        o.push(h, i);
                        break;

                      case "c":
                        o.push(h + l.shift(), i + l.shift(), h + l.shift(), i + l.shift()), h += l.shift(), 
                        i += l.shift(), n = "C", o.push(h, i);
                        break;

                      case "S":
                        var p = h, q = i, r = f[f.length - 1];
                        "C" === r.command && (p = h + (h - r.points[2]), q = i + (i - r.points[3])), o.push(p, q, l.shift(), l.shift()), 
                        h = l.shift(), i = l.shift(), n = "C", o.push(h, i);
                        break;

                      case "s":
                        var p = h, q = i, r = f[f.length - 1];
                        "C" === r.command && (p = h + (h - r.points[2]), q = i + (i - r.points[3])), o.push(p, q, h + l.shift(), i + l.shift()), 
                        h += l.shift(), i += l.shift(), n = "C", o.push(h, i);
                        break;

                      case "Q":
                        o.push(l.shift(), l.shift()), h = l.shift(), i = l.shift(), o.push(h, i);
                        break;

                      case "q":
                        o.push(h + l.shift(), i + l.shift()), h += l.shift(), i += l.shift(), n = "Q", o.push(h, i);
                        break;

                      case "T":
                        var p = h, q = i, r = f[f.length - 1];
                        "Q" === r.command && (p = h + (h - r.points[0]), q = i + (i - r.points[1])), h = l.shift(), 
                        i = l.shift(), n = "Q", o.push(p, q, h, i);
                        break;

                      case "t":
                        var p = h, q = i, r = f[f.length - 1];
                        "Q" === r.command && (p = h + (h - r.points[0]), q = i + (i - r.points[1])), h += l.shift(), 
                        i += l.shift(), n = "Q", o.push(p, q, h, i);
                        break;

                      case "A":
                        var s = l.shift(), t = l.shift(), u = l.shift(), v = l.shift(), w = l.shift(), x = h, y = i;
                        h = l.shift(), i = l.shift(), n = "A", o = g(x, y, h, i, v, w, s, t, u);
                        break;

                      case "a":
                        var s = l.shift(), t = l.shift(), u = l.shift(), v = l.shift(), w = l.shift(), x = h, y = i;
                        h += l.shift(), i += l.shift(), n = "A", o = g(x, y, h, i, v, w, s, t, u);
                    }
                    f.push({
                        command: n || k,
                        points: o
                    });
                }
                ("z" === k || "Z" === k) && f.push({
                    command: "z",
                    points: []
                });
            }
            return f;
        }
        function g(a, b, c, d, e, f, g, h, i) {
            var j = i * (Math.PI / 180), k = Math.cos(j) * (a - c) / 2 + Math.sin(j) * (b - d) / 2, l = -1 * Math.sin(j) * (a - c) / 2 + Math.cos(j) * (b - d) / 2, m = k * k / (g * g) + l * l / (h * h);
            m > 1 && (g *= Math.sqrt(m), h *= Math.sqrt(m));
            var n = Math.sqrt((g * g * h * h - g * g * l * l - h * h * k * k) / (g * g * l * l + h * h * k * k));
            e == f && (n *= -1), isNaN(n) && (n = 0);
            var o = n * g * l / h, p = n * -h * k / g, q = (a + c) / 2 + Math.cos(j) * o - Math.sin(j) * p, r = (b + d) / 2 + Math.sin(j) * o + Math.cos(j) * p, s = function(a) {
                return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
            }, t = function(a, b) {
                return (a[0] * b[0] + a[1] * b[1]) / (s(a) * s(b));
            }, u = function(a, b) {
                return (a[0] * b[1] < a[1] * b[0] ? -1 : 1) * Math.acos(t(a, b));
            }, v = u([ 1, 0 ], [ (k - o) / g, (l - p) / h ]), w = [ (k - o) / g, (l - p) / h ], x = [ (-1 * k - o) / g, (-1 * l - p) / h ], y = u(w, x);
            return t(w, x) <= -1 && (y = Math.PI), t(w, x) >= 1 && (y = 0), 0 == f && y > 0 && (y -= 2 * Math.PI), 
            1 == f && 0 > y && (y += 2 * Math.PI), [ q, r, g, h, v, y, j, f ];
        }
        var h, i = (Object.prototype.hasOwnProperty, document), j = Math.PI, k = a.prototype, l = {
            fill: !0,
            stroke: !1
        };
        return h = function() {
            var a;
            return a = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(a) {
                setTimeout(function() {
                    a(new Date());
                }, 1e3 / 60);
            }, animate = function(b, c) {
                var d, e, f, g = this;
                return e = new Date(), d = -1, f = function(h) {
                    var i;
                    return i = h - e, i >= b ? (c.call(g, d), void 0) : (c.call(g, i), a(f));
                }, a(f);
            };
        }(), k.attr = function(a, b) {
            this.canvas.setAttribute(a, b);
        }, k.attr = b.call(k.attr, function(a) {
            return this.canvas.getAttribute(a);
        }), k.css = function(a, b) {
            this.canvas.style[a] = b;
        }, k.css = b.call(k.css, function(a) {
            return this.canvas.style[a];
        }), [ "getContext", "toDataURL" ].forEach(function(a) {
            k[a] = function() {
                var b = this.canvas;
                return b[a].apply(b, arguments);
            };
        }), k.style = function(a, b) {
            this.context[a] = b;
        }, k.style = b.call(k.style, function(a) {
            return this.context[a];
        }), [ "beginPath", "closePath", "fill", "stroke", "clip", "moveTo", "lineTo", "arc", "arcTo", "bezierCurveTo", "quadraticCurveTo", "rect", "clearRect", "fillRect", "strokeRect", "fillText", "strokeText", "drawImage", "putImageData", "save", "restore", "scale", "rotate", "translate", "transform", "setTransform" ].forEach(function(a) {
            k[a] = function() {
                var b = this.context;
                return b[a].apply(b, arguments), this;
            };
        }), [ "isPointInPath", "measureText", "createImageData", "getImageData", "createLinearGradient", "createRadialGradient", "createPattern" ].forEach(function(a) {
            k[a] = function() {
                var b = this.context;
                return b[a].apply(b, arguments);
            };
        }), a.extend = function(a, b) {
            k[a] = b;
        }, a.extend = b.call(a.extend), a.extend("extend", b.call(function(a, b) {
            this[a] = b;
        })), a.extend({
            line: function(a, b, d, e, f) {
                var g = this;
                return c.call(this, f, function() {
                    g.beginPath(), g.moveTo(a, b), g.lineTo(d, e);
                }), this;
            },
            circle: function(a, b, d, e) {
                var f = this;
                return c.call(this, e, function() {
                    f.beginPath(), f.arc(a, b, d, 0, 2 * j);
                }), this;
            },
            rectangle: function(a, b, c, d, f) {
                var g;
                return f = f || {}, f = e(l, f), g = f.styles, this.save(), g && this.style(g), 
                f.fill && this.fillRect(a, b, c, d), f.stroke && this.strokeRect(a, b, c, d), this.restore(), 
                this;
            },
            ellipse: function(a, b, d, e, f) {
                var g = this;
                return c.call(this, f, function() {
                    g.beginPath(), g.moveTo(a, b - e), g.bezierCurveTo(a + d, b - e, a + d, b + e, a, b + e), 
                    g.bezierCurveTo(a - d, b + e, a - d, b - e, a, b - e), g.closePath();
                }), this;
            },
            polygon: function(a, b, d, e, f, g, h) {
                var i = this;
                return f = f || 0, g = g || !1, c.call(this, h, function() {
                    i.beginPath(), i.moveTo(a + e * Math.sin(f), b - e * Math.cos(f));
                    for (var c = 2 * Math.PI / d, h = 1; d > h; h++) f += g ? -c : c, i.lineTo(a + e * Math.sin(f), b - e * Math.cos(f));
                    i.closePath();
                }), this;
            },
            sector: function(a, b, d, e, f, g, h) {
                var i = this;
                return h = h || !1, c.call(this, g, function() {
                    i.beginPath(), i.arc(a, b, d, e, f, h), i.lineTo(a, b), i.closePath();
                }), this;
            },
            path: function(a, b) {
                var d = this, e = f(a);
                c.call(this, b, function() {
                    d.beginPath();
                    for (var a = 0; a < e.length; a++) {
                        var b = e[a].command, c = e[a].points;
                        switch (b) {
                          case "L":
                            d.lineTo(c[0], c[1]);
                            break;

                          case "M":
                            d.moveTo(c[0], c[1]);
                            break;

                          case "C":
                            d.bezierCurveTo(c[0], c[1], c[2], c[3], c[4], c[5]);
                            break;

                          case "Q":
                            d.quadraticCurveTo(c[0], c[1], c[2], c[3]);
                            break;

                          case "A":
                            var f = c[0], g = c[1], h = c[2], i = c[3], j = c[4], k = c[5], l = c[6], m = c[7], n = h > i ? h : i, o = h > i ? 1 : h / i, p = h > i ? i / h : 1;
                            d.translate(f, g), d.rotate(l), d.scale(o, p), d.arc(0, 0, n, j, j + k, 1 - m), 
                            d.scale(1 / o, 1 / p), d.rotate(-l), d.translate(-f, -g);
                            break;

                          case "z":
                            d.closePath();
                        }
                    }
                    d.closePath();
                });
            },
            image: function(a, b, c) {
                function e(a) {
                    b.unshift(a), f.drawImage.apply(f, b), c && c.call(null, b);
                }
                var f = this;
                return b = b || [], "string" == typeof a ? d(a, e) : e(a), this;
            },
            text: function(a, b, c, d) {
                var f, g;
                return d = d || {}, d = e(d, l), f = d.styles, this.save(), f && this.style(f), 
                g = d.maxWidth, d.fill && this.fillText(c, a, b, g), d.stroke && this.strokeText(c, a, b, g), 
                this.restore(), this;
            },
            shear: function(a, b) {
                return this.transform(1, b, a, 1, 0, 0), this;
            },
            rotateAbout: function(a, b, c) {
                var d = Math.cos(c), e = Math.sin(c);
                return this.transform(d, -e, e, d, -a * d - b * e + a, a * e - b * d + b), this;
            },
            clear: function() {
                this.clearRect(0, 0, this.attr("width", this.attr("height")));
            }
        }), function() {
            var b = !!window.addEventListener;
            a.extend({
                on: function(a, c) {
                    var d, e = this.canvas, f = this;
                    this.listeners = this.listeners || {}, b ? (d = this.listeners[a + c] = function() {
                        c.apply(f, arguments);
                    }, e.addEventListener(a, d, !1)) : (d = this.listeners[a + c] = function() {
                        c.call(f, window.event);
                    }, e.attachEvent("on" + a, d));
                },
                off: function(a, c) {
                    var d, e = this.canvas;
                    this.listeners = this.listeners || {}, d = this.listeners[a + c], b ? e.removeEventListener(a, d, !1) : e.detachEvent("on" + a, d);
                }
            });
        }(), k.animate = h, a;
    });
});
