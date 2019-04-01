(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.FormData = mod.exports;
  }
})(this, function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  /* global FormData self Blob File */
  /* eslint-disable no-inner-declarations */

  if (typeof Blob === 'function' && (typeof FormData === 'undefined' || !FormData.prototype.keys)) {
    var normalizeValue = function normalizeValue(_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          value = _ref2[0],
          filename = _ref2[1];

      if (value instanceof Blob) {
        // Should always returns a new File instance
        // console.assert(fd.get(x) !== fd.get(x))
        value = new File([value], filename, {
          type: value.type,
          lastModified: value.lastModified
        });
      }

      return value;
    };

    var ensureArgs = function ensureArgs(args, expected) {
      if (args.length < expected) {
        throw new TypeError(expected + ' argument required, but only ' + args.length + ' present.');
      }
    };

    var normalizeArgs = function normalizeArgs(name, value, filename) {
      return value instanceof Blob
      // normalize name and filename if adding an attachment
      ? [String(name), value, filename !== undefined ? filename + '' // Cast filename to string if 3th arg isn't undefined
      : typeof value.name === 'string' // if name prop exist
      ? value.name // Use File.name
      : 'blob'] // otherwise fallback to Blob

      // If no attachment, just cast the args to strings
      : [String(name), String(value)];
    };

    var normalizeLinefeeds = function normalizeLinefeeds(value) {
      return value.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    };

    var each = function each(arr, cb) {
      for (var i = 0; i < arr.length; i++) {
        cb(arr[i]);
      }
    };

    var global = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' ? window : (typeof self === 'undefined' ? 'undefined' : _typeof(self)) === 'object' ? self : undefined;

    // keep a reference to native implementation
    var _FormData = global.FormData;

    // To be monkey patched
    var _send = global.XMLHttpRequest && global.XMLHttpRequest.prototype.send;
    var _fetch = global.Request && global.fetch;

    // Unable to patch Request constructor correctly
    // const _Request = global.Request
    // only way is to use ES6 class extend
    // https://github.com/babel/babel/issues/1966

    var stringTag = global.Symbol && Symbol.toStringTag;
    var map = new WeakMap();
    var wm = function wm(o) {
      return map.get(o);
    };

    // Add missing stringTags to blob and files
    if (stringTag) {
      if (!Blob.prototype[stringTag]) {
        Blob.prototype[stringTag] = 'Blob';
      }

      if ('File' in global && !File.prototype[stringTag]) {
        File.prototype[stringTag] = 'File';
      }
    }

    // Fix so you can construct your own File
    try {
      new File([], ''); // eslint-disable-line
    } catch (a) {
      global.File = function File(b, d, c) {
        var blob = new Blob(b, c);
        var t = c && void 0 !== c.lastModified ? new Date(c.lastModified) : new Date();

        Object.defineProperties(blob, {
          name: {
            value: d
          },
          lastModifiedDate: {
            value: t
          },
          lastModified: {
            value: +t
          },
          toString: {
            value: function value() {
              return '[object File]';
            }
          }
        });

        if (stringTag) {
          Object.defineProperty(blob, stringTag, {
            value: 'File'
          });
        }

        return blob;
      };
    }

    var FormDataPolyfill = function () {
      /**
       * FormData class
       *
       * @param {HTMLElement=} form
       */
      function FormDataPolyfill(form) {
        _classCallCheck(this, FormDataPolyfill);

        map.set(this, Object.create(null));

        if (!form) return this;

        var self = this;

        each(form.elements, function (elm) {
          if (!elm.name || elm.disabled || elm.type === 'submit' || elm.type === 'button') return;

          if (elm.type === 'file') {
            each(elm.files || [], function (file) {
              self.append(elm.name, file);
            });
          } else if (elm.type === 'select-multiple' || elm.type === 'select-one') {
            each(elm.options, function (opt) {
              !opt.disabled && opt.selected && self.append(elm.name, opt.value);
            });
          } else if (elm.type === 'checkbox' || elm.type === 'radio') {
            if (elm.checked) self.append(elm.name, elm.value);
          } else {
            var value = elm.type === 'textarea' ? normalizeLinefeeds(elm.value) : elm.value;
            self.append(elm.name, value);
          }
        });
      }

      /**
       * Append a field
       *
       * @param   {String}           name      field name
       * @param   {String|Blob|File} value     string / blob / file
       * @param   {String=}          filename  filename to use with blob
       * @return  {Undefined}
       */


      _createClass(FormDataPolyfill, [{
        key: 'append',
        value: function append(name, value, filename) {
          ensureArgs(arguments, 2);
          var _normalizeArgs$apply = normalizeArgs.apply(null, arguments);

          var _normalizeArgs$apply2 = _slicedToArray(_normalizeArgs$apply, 3);

          name = _normalizeArgs$apply2[0];
          value = _normalizeArgs$apply2[1];
          filename = _normalizeArgs$apply2[2];

          var map = wm(this);

          if (!map[name]) map[name] = [];

          map[name].push([value, filename]);
        }
      }, {
        key: 'delete',
        value: function _delete(name) {
          ensureArgs(arguments, 1);
          delete wm(this)[String(name)];
        }
      }, {
        key: 'entries',
        value: regeneratorRuntime.mark(function entries() {
          var map, name, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, value;

          return regeneratorRuntime.wrap(function entries$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  map = wm(this);
                  _context.t0 = regeneratorRuntime.keys(map);

                case 2:
                  if ((_context.t1 = _context.t0()).done) {
                    _context.next = 32;
                    break;
                  }

                  name = _context.t1.value;
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _iteratorError = undefined;
                  _context.prev = 7;
                  _iterator = map[name][Symbol.iterator]();

                case 9:
                  if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                    _context.next = 16;
                    break;
                  }

                  value = _step.value;
                  _context.next = 13;
                  return [name, normalizeValue(value)];

                case 13:
                  _iteratorNormalCompletion = true;
                  _context.next = 9;
                  break;

                case 16:
                  _context.next = 22;
                  break;

                case 18:
                  _context.prev = 18;
                  _context.t2 = _context['catch'](7);
                  _didIteratorError = true;
                  _iteratorError = _context.t2;

                case 22:
                  _context.prev = 22;
                  _context.prev = 23;

                  if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                  }

                case 25:
                  _context.prev = 25;

                  if (!_didIteratorError) {
                    _context.next = 28;
                    break;
                  }

                  throw _iteratorError;

                case 28:
                  return _context.finish(25);

                case 29:
                  return _context.finish(22);

                case 30:
                  _context.next = 2;
                  break;

                case 32:
                case 'end':
                  return _context.stop();
              }
            }
          }, entries, this, [[7, 18, 22, 30], [23,, 25, 29]]);
        })
      }, {
        key: 'forEach',
        value: function forEach(callback, thisArg) {
          ensureArgs(arguments, 1);
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = this[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _step2$value = _slicedToArray(_step2.value, 2),
                  name = _step2$value[0],
                  value = _step2$value[1];

              callback.call(thisArg, value, name, this);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }, {
        key: 'get',
        value: function get(name) {
          ensureArgs(arguments, 1);
          var map = wm(this);
          name = String(name);
          return map[name] ? normalizeValue(map[name][0]) : null;
        }
      }, {
        key: 'getAll',
        value: function getAll(name) {
          ensureArgs(arguments, 1);
          return (wm(this)[String(name)] || []).map(normalizeValue);
        }
      }, {
        key: 'has',
        value: function has(name) {
          ensureArgs(arguments, 1);
          return String(name) in wm(this);
        }
      }, {
        key: 'keys',
        value: regeneratorRuntime.mark(function keys() {
          var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _step3$value, name;

          return regeneratorRuntime.wrap(function keys$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _iteratorNormalCompletion3 = true;
                  _didIteratorError3 = false;
                  _iteratorError3 = undefined;
                  _context2.prev = 3;
                  _iterator3 = this[Symbol.iterator]();

                case 5:
                  if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                    _context2.next = 12;
                    break;
                  }

                  _step3$value = _slicedToArray(_step3.value, 1), name = _step3$value[0];
                  _context2.next = 9;
                  return name;

                case 9:
                  _iteratorNormalCompletion3 = true;
                  _context2.next = 5;
                  break;

                case 12:
                  _context2.next = 18;
                  break;

                case 14:
                  _context2.prev = 14;
                  _context2.t0 = _context2['catch'](3);
                  _didIteratorError3 = true;
                  _iteratorError3 = _context2.t0;

                case 18:
                  _context2.prev = 18;
                  _context2.prev = 19;

                  if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                    _iterator3['return']();
                  }

                case 21:
                  _context2.prev = 21;

                  if (!_didIteratorError3) {
                    _context2.next = 24;
                    break;
                  }

                  throw _iteratorError3;

                case 24:
                  return _context2.finish(21);

                case 25:
                  return _context2.finish(18);

                case 26:
                case 'end':
                  return _context2.stop();
              }
            }
          }, keys, this, [[3, 14, 18, 26], [19,, 21, 25]]);
        })
      }, {
        key: 'set',
        value: function set(name, value, filename) {
          ensureArgs(arguments, 2);
          var _normalizeArgs$apply3 = normalizeArgs.apply(null, arguments);

          var _normalizeArgs$apply4 = _slicedToArray(_normalizeArgs$apply3, 3);

          name = _normalizeArgs$apply4[0];
          value = _normalizeArgs$apply4[1];
          filename = _normalizeArgs$apply4[2];

          wm(this)[name] = [[value, filename]];
        }
      }, {
        key: 'values',
        value: regeneratorRuntime.mark(function values() {
          var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _step4$value, value;

          return regeneratorRuntime.wrap(function values$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _iteratorNormalCompletion4 = true;
                  _didIteratorError4 = false;
                  _iteratorError4 = undefined;
                  _context3.prev = 3;
                  _iterator4 = this[Symbol.iterator]();

                case 5:
                  if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                    _context3.next = 12;
                    break;
                  }

                  _step4$value = _slicedToArray(_step4.value, 2), value = _step4$value[1];
                  _context3.next = 9;
                  return value;

                case 9:
                  _iteratorNormalCompletion4 = true;
                  _context3.next = 5;
                  break;

                case 12:
                  _context3.next = 18;
                  break;

                case 14:
                  _context3.prev = 14;
                  _context3.t0 = _context3['catch'](3);
                  _didIteratorError4 = true;
                  _iteratorError4 = _context3.t0;

                case 18:
                  _context3.prev = 18;
                  _context3.prev = 19;

                  if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                    _iterator4['return']();
                  }

                case 21:
                  _context3.prev = 21;

                  if (!_didIteratorError4) {
                    _context3.next = 24;
                    break;
                  }

                  throw _iteratorError4;

                case 24:
                  return _context3.finish(21);

                case 25:
                  return _context3.finish(18);

                case 26:
                case 'end':
                  return _context3.stop();
              }
            }
          }, values, this, [[3, 14, 18, 26], [19,, 21, 25]]);
        })
      }, {
        key: '_asNative',
        value: function _asNative() {
          var fd = new _FormData();

          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = this[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var _step5$value = _slicedToArray(_step5.value, 2),
                  name = _step5$value[0],
                  value = _step5$value[1];

              fd.append(name, value);
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                _iterator5['return']();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          return fd;
        }
      }, {
        key: '_blob',
        value: function _blob() {
          var boundary = '----formdata-polyfill-' + Math.random();
          var chunks = [];

          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = this[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var _step6$value = _slicedToArray(_step6.value, 2),
                  name = _step6$value[0],
                  value = _step6$value[1];

              chunks.push('--' + boundary + '\r\n');

              if (value instanceof Blob) {
                chunks.push('Content-Disposition: form-data; name="' + name + '"; filename="' + value.name + '"\r\n', 'Content-Type: ' + (value.type || 'application/octet-stream') + '\r\n\r\n', value, '\r\n');
              } else {
                chunks.push('Content-Disposition: form-data; name="' + name + '"\r\n\r\n' + value + '\r\n');
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                _iterator6['return']();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          chunks.push('--' + boundary + '--');

          return new Blob(chunks, {
            type: 'multipart/form-data; boundary=' + boundary
          });
        }
      }, {
        key: Symbol.iterator,
        value: function value() {
          return this.entries();
        }
      }, {
        key: 'toString',
        value: function toString() {
          return '[object FormData]';
        }
      }]);

      return FormDataPolyfill;
    }();

    if (stringTag) {
      /**
       * Create the default string description.
       * It is accessed internally by the Object.prototype.toString().
       *
       * @return {String} FormData
       */
      FormDataPolyfill.prototype[stringTag] = 'FormData';
    }

    // Patch xhr's send method to call _blob transparently
    if (_send) {
      global.XMLHttpRequest.prototype.send = function (data) {
        // I would check if Content-Type isn't already set
        // But xhr lacks getRequestHeaders functionallity
        // https://github.com/jimmywarting/FormData/issues/44
        if (data instanceof FormDataPolyfill) {
          var blob = data['_blob']();
          this.setRequestHeader('Content-Type', blob.type);
          _send.call(this, blob);
        } else {
          _send.call(this, data);
        }
      };
    }

    // Patch fetch's function to call _blob transparently
    if (_fetch) {
      var _fetch2 = global.fetch;

      global.fetch = function (input, init) {
        if (init && init.body && init.body instanceof FormDataPolyfill) {
          init.body = init.body['_blob']();
        }

        return _fetch2(input, init);
      };
    }

    global['FormData'] = FormDataPolyfill;
  }
});
