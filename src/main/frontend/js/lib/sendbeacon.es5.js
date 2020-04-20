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
    global.sendbeacon = mod.exports;
  }
})(this, function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var isString = function isString(val) {
    return typeof val === 'string';
  };
  var isBlob = function isBlob(val) {
    return val instanceof Blob;
  };

  polyfill.call((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' ? window : undefined || {});

  function polyfill() {
    if (isSupported.call(this)) return;

    if (!('navigator' in this)) this.navigator = {};
    this.navigator.sendBeacon = sendBeacon.bind(this);
  };

  function sendBeacon(url, data) {
    var event = this.event && this.event.type;
    var sync = event === 'unload' || event === 'beforeunload';

    var xhr = 'XMLHttpRequest' in this ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('POST', url, !sync);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', '*/*');

    if (isString(data)) {
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      xhr.responseType = 'text/plain';
    } else if (isBlob(data) && data.type) {
      xhr.setRequestHeader('Content-Type', data.type);
    }

    try {
      xhr.send(data);
    } catch (error) {
      return false;
    }

    return true;
  }

  function isSupported() {
    return 'navigator' in this && 'sendBeacon' in this.navigator;
  }
});
