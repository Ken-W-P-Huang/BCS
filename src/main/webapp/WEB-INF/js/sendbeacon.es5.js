/*!BC-S - 1.0.0-2020-04-03 */

!function(e,t){if("function"==typeof define&&define.amd)define([],t);else if("undefined"!=typeof exports)t();else{t(),e.sendbeacon={}}}(this,function(){"use strict";var e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},f=function f(e){return"string"==typeof e},u=function u(e){return e instanceof Blob};(function t(){if(function e(){return"navigator"in this&&"sendBeacon"in this.navigator}.call(this))return;"navigator"in this||(this.navigator={});this.navigator.sendBeacon=function s(e,t){var n=this.event&&this.event.type,o="unload"===n||"beforeunload"===n,i="XMLHttpRequest"in this?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");i.open("POST",e,!o),i.withCredentials=!0,i.setRequestHeader("Accept","*/*"),f(t)?(i.setRequestHeader("Content-Type","text/plain;charset=UTF-8"),i.responseType="text/plain"):u(t)&&t.type&&i.setRequestHeader("Content-Type",t.type);try{i.send(t)}catch(r){return!1}return!0}.bind(this)}).call("object"===("undefined"==typeof window?"undefined":e(window))?window:undefined||{})});