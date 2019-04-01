/**
 * Created by kenhuang on 2019/2/20.
 */
(function (window,document) {
    function patchClassList(window) {
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.2.20171210
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

// Full polyfill for browsers with no classList support
// Including IE < Edge missing SVGElement.classList
if (
	   !("classList" in document.createElement("_")) 
	|| document.createElementNS
	&& !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))
) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "The token must not be empty."
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "The token must not contain space characters."
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	return ~checkTokenAndGetIndex(this, token + "");
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (!~checkTokenAndGetIndex(this, token)) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (~index) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.replace = function (token, replacement_token) {
	var index = checkTokenAndGetIndex(token + "");
	if (~index) {
		this.splice(index, 1, replacement_token);
		this._updateClassName();
	}
}
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		// adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
		// modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
		if (ex.number === undefined || ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

}

// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	// replace() polyfill
	if (!("replace" in document.createElement("_").classList)) {
		DOMTokenList.prototype.replace = function (token, replacement_token) {
			var
				  tokens = this.toString().split(" ")
				, index = tokens.indexOf(token + "")
			;
			if (~index) {
				tokens = tokens.slice(index);
				this.remove.apply(this, tokens);
				this.add(replacement_token);
				this.add.apply(this, tokens.slice(1));
			}
		}
	}

	testElement = null;
}());

}
    }

    function patchGetUserMedia() {
/*!
* getusermedia-js
* v1.0.0 - 2015-12-20
* https://github.com/addyosmani/getUserMedia.js
* (c) Addy Osmani; MIT License
*/;(function (window, document) {
    "use strict";

    window.getUserMedia = function (options, successCallback, errorCallback) {

        // Options are required
        if (options !== undefined) {

            // getUserMedia() feature detection
            navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

            if ( !! navigator.getUserMedia_) {


                // constructing a getUserMedia config-object and 
                // an string (we will try both)
                var option_object = {};
                var option_string = '';
                var getUserMediaOptions, container, temp, video, ow, oh;

                if (options.video === true) {
                    option_object.video = true;
                    option_string = 'video';
                }
                if (options.audio === true) {
                    option_object.audio = true;
                    if (option_string !== '') {
                        option_string = option_string + ', ';
                    }
                    option_string = option_string + 'audio';
                }

                container = document.getElementById(options.el);
                temp = document.createElement('video');

                // Fix for ratio
                ow = parseInt(container.offsetWidth, 10);
                oh = parseInt(container.offsetHeight, 10);

                if (options.width < ow && options.height < oh) {
                    options.width = ow;
                    options.height = oh;
                }

                // configure the interim video
                temp.width = options.width;
                temp.height = options.height;
                temp.autoplay = true;
                container.appendChild(temp);
                video = temp;

                // referenced for use in your applications
                options.videoEl = video;
                options.context = 'webrtc';

                // first we try if getUserMedia supports the config object
                try {
                    // try object
                    navigator.getUserMedia_(option_object, successCallback, errorCallback);
                } catch (e) {
                    // option object fails
                    try {
                        // try string syntax
                        // if the config object failes, we try a config string
                        navigator.getUserMedia_(option_string, successCallback, errorCallback);
                    } catch (e2) {
                        // both failed
                        // neither object nor string works
                        return undefined;
                    }
                }
            } else {

                // Act as a plain getUserMedia shield if no fallback is required
                if (options.noFallback === undefined || options.noFallback === false) {

                    // Fallback to flash
                    var source, el, cam;

                    source = '<!--[if IE]>'+
                    '<object id="XwebcamXobjectX" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + options.width + '" height="' + options.height + '">'+
                    '<param name="movie" value="' + options.swffile + '" />'+
                    '<![endif]-->'+
                    '<!--[if !IE]>-->'+
                    '<object id="XwebcamXobjectX" type="application/x-shockwave-flash" data="' + options.swffile + '" width="' + options.width + '" height="' + options.height + '">'+
                    '<!--<![endif]-->'+
                    '<param name="FlashVars" value="mode=' + options.mode + '&amp;quality=' + options.quality + '" />'+
                    '<param name="allowScriptAccess" value="always" />'+
                    '</object>';
                    el = document.getElementById(options.el);
                    el.innerHTML = source;


                    (function register(run) {

                        cam = document.getElementById('XwebcamXobjectX');

                        if (cam.capture !== undefined) {

                            // Simple callback methods are not allowed 
                            options.capture = function (x) {
                                try {
                                    return cam.capture(x);
                                } catch (e) {}
                            };
                            options.save = function (x) {
                                try {
                                    return cam.save(x);
                                } catch (e) {

                                }
                            };
                            options.setCamera = function (x) {
                                try {
                                    return cam.setCamera(x);
                                } catch (e) {}
                            };
                            options.getCameraList = function () {
                                try {
                                    return cam.getCameraList();
                                } catch (e) {}
                            };

                            // options.onLoad();
                            options.context = 'flash';
                            options.onLoad = successCallback;

                        } else if (run === 0) {
                            // options.debug("error", "Flash movie not yet registered!");
                            errorCallback();
                        } else {
                            // Flash interface not ready yet 
                            window.setTimeout(register, 1000 * (4 - run), run - 1);
                        }
                    }(3));

                }

            }
        }
    };

}(this, document));

    }

    function patchXPath() {
(function(){'use strict';var k=this;
function aa(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}function l(a){return"string"==typeof a}function ba(a,b,c){return a.call.apply(a.bind,arguments)}function ca(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}
function da(a,b,c){da=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ba:ca;return da.apply(null,arguments)}function ea(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}}
function m(a){var b=n;function c(){}c.prototype=b.prototype;a.G=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.F=function(a,c,f){for(var g=Array(arguments.length-2),h=2;h<arguments.length;h++)g[h-2]=arguments[h];return b.prototype[c].apply(a,g)}};/*

 The MIT License

 Copyright (c) 2007 Cybozu Labs, Inc.
 Copyright (c) 2012 Google Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/
var fa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function q(a,b){return-1!=a.indexOf(b)}function ga(a,b){return a<b?-1:a>b?1:0};var ha=Array.prototype.indexOf?function(a,b,c){return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(l(a))return l(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},r=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=l(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},ia=Array.prototype.filter?function(a,b,c){return Array.prototype.filter.call(a,
b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g=l(a)?a.split(""):a,h=0;h<d;h++)if(h in g){var p=g[h];b.call(c,p,h,a)&&(e[f++]=p)}return e},t=Array.prototype.reduce?function(a,b,c,d){d&&(b=da(b,d));return Array.prototype.reduce.call(a,b,c)}:function(a,b,c,d){var e=c;r(a,function(c,g){e=b.call(d,e,c,g,a)});return e},ja=Array.prototype.some?function(a,b,c){return Array.prototype.some.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=l(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;
return!1};function ka(a,b){a:{for(var c=a.length,d=l(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1}return 0>b?null:l(a)?a.charAt(b):a[b]}function la(a){return Array.prototype.concat.apply(Array.prototype,arguments)}function ma(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)};var u;a:{var na=k.navigator;if(na){var oa=na.userAgent;if(oa){u=oa;break a}}u=""};var pa=q(u,"Opera"),v=q(u,"Trident")||q(u,"MSIE"),qa=q(u,"Edge"),ra=q(u,"Gecko")&&!(q(u.toLowerCase(),"webkit")&&!q(u,"Edge"))&&!(q(u,"Trident")||q(u,"MSIE"))&&!q(u,"Edge"),sa=q(u.toLowerCase(),"webkit")&&!q(u,"Edge");function ta(){var a=k.document;return a?a.documentMode:void 0}var ua;
a:{var va="",wa=function(){var a=u;if(ra)return/rv\:([^\);]+)(\)|;)/.exec(a);if(qa)return/Edge\/([\d\.]+)/.exec(a);if(v)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(sa)return/WebKit\/(\S+)/.exec(a);if(pa)return/(?:Version)[ \/]?(\S+)/.exec(a)}();wa&&(va=wa?wa[1]:"");if(v){var xa=ta();if(null!=xa&&xa>parseFloat(va)){ua=String(xa);break a}}ua=va}var ya={};
function za(a){if(!ya[a]){for(var b=0,c=fa(String(ua)).split("."),d=fa(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"",p=/(\d*)(\D*)/g,x=/(\d*)(\D*)/g;do{var D=p.exec(g)||["","",""],X=x.exec(h)||["","",""];if(0==D[0].length&&0==X[0].length)break;b=ga(0==D[1].length?0:parseInt(D[1],10),0==X[1].length?0:parseInt(X[1],10))||ga(0==D[2].length,0==X[2].length)||ga(D[2],X[2])}while(0==b)}ya[a]=0<=b}}
var Aa=k.document,Ba=Aa&&v?ta()||("CSS1Compat"==Aa.compatMode?parseInt(ua,10):5):void 0;!ra&&!v||v&&9<=Number(Ba)||ra&&za("1.9.1");v&&za("9");function Ca(a,b){if(!a||!b)return!1;if(a.contains&&1==b.nodeType)return a==b||a.contains(b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||!!(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b.parentNode;return b==a}
function Da(a,b){if(a==b)return 0;if(a.compareDocumentPosition)return a.compareDocumentPosition(b)&2?1:-1;if(v&&!(9<=Number(Ba))){if(9==a.nodeType)return-1;if(9==b.nodeType)return 1}if("sourceIndex"in a||a.parentNode&&"sourceIndex"in a.parentNode){var c=1==a.nodeType,d=1==b.nodeType;if(c&&d)return a.sourceIndex-b.sourceIndex;var e=a.parentNode,f=b.parentNode;return e==f?Ea(a,b):!c&&Ca(e,b)?-1*Fa(a,b):!d&&Ca(f,a)?Fa(b,a):(c?a.sourceIndex:e.sourceIndex)-(d?b.sourceIndex:f.sourceIndex)}d=9==a.nodeType?
a:a.ownerDocument||a.document;c=d.createRange();c.selectNode(a);c.collapse(!0);a=d.createRange();a.selectNode(b);a.collapse(!0);return c.compareBoundaryPoints(k.Range.START_TO_END,a)}function Fa(a,b){var c=a.parentNode;if(c==b)return-1;for(;b.parentNode!=c;)b=b.parentNode;return Ea(b,a)}function Ea(a,b){for(;b=b.previousSibling;)if(b==a)return-1;return 1};var w=v&&!(9<=Number(Ba)),Ga=v&&!(8<=Number(Ba));function y(a,b,c,d){this.a=a;this.nodeName=c;this.nodeValue=d;this.nodeType=2;this.parentNode=this.ownerElement=b}function Ha(a,b){var c=Ga&&"href"==b.nodeName?a.getAttribute(b.nodeName,2):b.nodeValue;return new y(b,a,b.nodeName,c)};function z(a){var b=null,c=a.nodeType;1==c&&(b=a.textContent,b=void 0==b||null==b?a.innerText:b,b=void 0==b||null==b?"":b);if("string"!=typeof b)if(w&&"title"==a.nodeName.toLowerCase()&&1==c)b=a.text;else if(9==c||1==c){a=9==c?a.documentElement:a.firstChild;for(var c=0,d=[],b="";a;){do 1!=a.nodeType&&(b+=a.nodeValue),w&&"title"==a.nodeName.toLowerCase()&&(b+=a.text),d[c++]=a;while(a=a.firstChild);for(;c&&!(a=d[--c].nextSibling););}}else b=a.nodeValue;return""+b}
function A(a,b,c){if(null===b)return!0;try{if(!a.getAttribute)return!1}catch(d){return!1}Ga&&"class"==b&&(b="className");return null==c?!!a.getAttribute(b):a.getAttribute(b,2)==c}function B(a,b,c,d,e){return(w?Ia:Ja).call(null,a,b,l(c)?c:null,l(d)?d:null,e||new C)}
function Ia(a,b,c,d,e){if(a instanceof E||8==a.b||c&&null===a.b){var f=b.all;if(!f)return e;a=Ka(a);if("*"!=a&&(f=b.getElementsByTagName(a),!f))return e;if(c){for(var g=[],h=0;b=f[h++];)A(b,c,d)&&g.push(b);f=g}for(h=0;b=f[h++];)"*"==a&&"!"==b.tagName||F(e,b);return e}La(a,b,c,d,e);return e}
function Ja(a,b,c,d,e){b.getElementsByName&&d&&"name"==c&&!v?(b=b.getElementsByName(d),r(b,function(b){a.a(b)&&F(e,b)})):b.getElementsByClassName&&d&&"class"==c?(b=b.getElementsByClassName(d),r(b,function(b){b.className==d&&a.a(b)&&F(e,b)})):a instanceof G?La(a,b,c,d,e):b.getElementsByTagName&&(b=b.getElementsByTagName(a.f()),r(b,function(a){A(a,c,d)&&F(e,a)}));return e}
function Ma(a,b,c,d,e){var f;if((a instanceof E||8==a.b||c&&null===a.b)&&(f=b.childNodes)){var g=Ka(a);if("*"!=g&&(f=ia(f,function(a){return a.tagName&&a.tagName.toLowerCase()==g}),!f))return e;c&&(f=ia(f,function(a){return A(a,c,d)}));r(f,function(a){"*"==g&&("!"==a.tagName||"*"==g&&1!=a.nodeType)||F(e,a)});return e}return Na(a,b,c,d,e)}function Na(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)A(b,c,d)&&a.a(b)&&F(e,b);return e}
function La(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)A(b,c,d)&&a.a(b)&&F(e,b),La(a,b,c,d,e)}function Ka(a){if(a instanceof G){if(8==a.b)return"!";if(null===a.b)return"*"}return a.f()};function C(){this.b=this.a=null;this.l=0}function Oa(a){this.node=a;this.a=this.b=null}function Pa(a,b){if(!a.a)return b;if(!b.a)return a;var c=a.a;b=b.a;for(var d=null,e,f=0;c&&b;){e=c.node;var g=b.node;e==g||e instanceof y&&g instanceof y&&e.a==g.a?(e=c,c=c.a,b=b.a):0<Da(c.node,b.node)?(e=b,b=b.a):(e=c,c=c.a);(e.b=d)?d.a=e:a.a=e;d=e;f++}for(e=c||b;e;)e.b=d,d=d.a=e,f++,e=e.a;a.b=d;a.l=f;return a}function Qa(a,b){b=new Oa(b);b.a=a.a;a.b?a.a.b=b:a.a=a.b=b;a.a=b;a.l++}
function F(a,b){b=new Oa(b);b.b=a.b;a.a?a.b.a=b:a.a=a.b=b;a.b=b;a.l++}function Ra(a){return(a=a.a)?a.node:null}function Sa(a){return(a=Ra(a))?z(a):""}function H(a,b){return new Ta(a,!!b)}function Ta(a,b){this.f=a;this.b=(this.c=b)?a.b:a.a;this.a=null}function I(a){var b=a.b;if(null==b)return null;var c=a.a=b;a.b=a.c?b.b:b.a;return c.node};function n(a){this.i=a;this.b=this.g=!1;this.f=null}function J(a){return"\n  "+a.toString().split("\n").join("\n  ")}function Ua(a,b){a.g=b}function Va(a,b){a.b=b}function K(a,b){a=a.a(b);return a instanceof C?+Sa(a):+a}function L(a,b){a=a.a(b);return a instanceof C?Sa(a):""+a}function M(a,b){a=a.a(b);return a instanceof C?!!a.l:!!a};function N(a,b,c){n.call(this,a.i);this.c=a;this.h=b;this.o=c;this.g=b.g||c.g;this.b=b.b||c.b;this.c==Wa&&(c.b||c.g||4==c.i||0==c.i||!b.f?b.b||b.g||4==b.i||0==b.i||!c.f||(this.f={name:c.f.name,s:b}):this.f={name:b.f.name,s:c})}m(N);
function O(a,b,c,d,e){b=b.a(d);c=c.a(d);var f;if(b instanceof C&&c instanceof C){b=H(b);for(d=I(b);d;d=I(b))for(e=H(c),f=I(e);f;f=I(e))if(a(z(d),z(f)))return!0;return!1}if(b instanceof C||c instanceof C){b instanceof C?(e=b,d=c):(e=c,d=b);f=H(e);for(var g=typeof d,h=I(f);h;h=I(f)){switch(g){case "number":h=+z(h);break;case "boolean":h=!!z(h);break;case "string":h=z(h);break;default:throw Error("Illegal primitive type for comparison.");}if(e==b&&a(h,d)||e==c&&a(d,h))return!0}return!1}return e?"boolean"==
typeof b||"boolean"==typeof c?a(!!b,!!c):"number"==typeof b||"number"==typeof c?a(+b,+c):a(b,c):a(+b,+c)}N.prototype.a=function(a){return this.c.m(this.h,this.o,a)};N.prototype.toString=function(){var a="Binary Expression: "+this.c,a=a+J(this.h);return a+=J(this.o)};function Xa(a,b,c,d){this.a=a;this.w=b;this.i=c;this.m=d}Xa.prototype.toString=function(){return this.a};var Ya={};
function P(a,b,c,d){if(Ya.hasOwnProperty(a))throw Error("Binary operator already created: "+a);a=new Xa(a,b,c,d);return Ya[a.toString()]=a}P("div",6,1,function(a,b,c){return K(a,c)/K(b,c)});P("mod",6,1,function(a,b,c){return K(a,c)%K(b,c)});P("*",6,1,function(a,b,c){return K(a,c)*K(b,c)});P("+",5,1,function(a,b,c){return K(a,c)+K(b,c)});P("-",5,1,function(a,b,c){return K(a,c)-K(b,c)});P("<",4,2,function(a,b,c){return O(function(a,b){return a<b},a,b,c)});
P(">",4,2,function(a,b,c){return O(function(a,b){return a>b},a,b,c)});P("<=",4,2,function(a,b,c){return O(function(a,b){return a<=b},a,b,c)});P(">=",4,2,function(a,b,c){return O(function(a,b){return a>=b},a,b,c)});var Wa=P("=",3,2,function(a,b,c){return O(function(a,b){return a==b},a,b,c,!0)});P("!=",3,2,function(a,b,c){return O(function(a,b){return a!=b},a,b,c,!0)});P("and",2,2,function(a,b,c){return M(a,c)&&M(b,c)});P("or",1,2,function(a,b,c){return M(a,c)||M(b,c)});function Q(a,b,c){this.a=a;this.b=b||1;this.f=c||1};function Za(a,b){if(b.a.length&&4!=a.i)throw Error("Primary expression must evaluate to nodeset if filter has predicate(s).");n.call(this,a.i);this.c=a;this.h=b;this.g=a.g;this.b=a.b}m(Za);Za.prototype.a=function(a){a=this.c.a(a);return $a(this.h,a)};Za.prototype.toString=function(){var a;a="Filter:"+J(this.c);return a+=J(this.h)};function ab(a,b){if(b.length<a.A)throw Error("Function "+a.j+" expects at least"+a.A+" arguments, "+b.length+" given");if(null!==a.v&&b.length>a.v)throw Error("Function "+a.j+" expects at most "+a.v+" arguments, "+b.length+" given");a.B&&r(b,function(b,d){if(4!=b.i)throw Error("Argument "+d+" to function "+a.j+" is not of type Nodeset: "+b);});n.call(this,a.i);this.h=a;this.c=b;Ua(this,a.g||ja(b,function(a){return a.g}));Va(this,a.D&&!b.length||a.C&&!!b.length||ja(b,function(a){return a.b}))}m(ab);
ab.prototype.a=function(a){return this.h.m.apply(null,la(a,this.c))};ab.prototype.toString=function(){var a="Function: "+this.h;if(this.c.length)var b=t(this.c,function(a,b){return a+J(b)},"Arguments:"),a=a+J(b);return a};function bb(a,b,c,d,e,f,g,h,p){this.j=a;this.i=b;this.g=c;this.D=d;this.C=e;this.m=f;this.A=g;this.v=void 0!==h?h:g;this.B=!!p}bb.prototype.toString=function(){return this.j};var cb={};
function R(a,b,c,d,e,f,g,h){if(cb.hasOwnProperty(a))throw Error("Function already created: "+a+".");cb[a]=new bb(a,b,c,d,!1,e,f,g,h)}R("boolean",2,!1,!1,function(a,b){return M(b,a)},1);R("ceiling",1,!1,!1,function(a,b){return Math.ceil(K(b,a))},1);R("concat",3,!1,!1,function(a,b){return t(ma(arguments,1),function(b,d){return b+L(d,a)},"")},2,null);R("contains",2,!1,!1,function(a,b,c){return q(L(b,a),L(c,a))},2);R("count",1,!1,!1,function(a,b){return b.a(a).l},1,1,!0);
R("false",2,!1,!1,function(){return!1},0);R("floor",1,!1,!1,function(a,b){return Math.floor(K(b,a))},1);R("id",4,!1,!1,function(a,b){function c(a){if(w){var b=e.all[a];if(b){if(b.nodeType&&a==b.id)return b;if(b.length)return ka(b,function(b){return a==b.id})}return null}return e.getElementById(a)}var d=a.a,e=9==d.nodeType?d:d.ownerDocument;a=L(b,a).split(/\s+/);var f=[];r(a,function(a){a=c(a);!a||0<=ha(f,a)||f.push(a)});f.sort(Da);var g=new C;r(f,function(a){F(g,a)});return g},1);
R("lang",2,!1,!1,function(){return!1},1);R("last",1,!0,!1,function(a){if(1!=arguments.length)throw Error("Function last expects ()");return a.f},0);R("local-name",3,!1,!0,function(a,b){return(a=b?Ra(b.a(a)):a.a)?a.localName||a.nodeName.toLowerCase():""},0,1,!0);R("name",3,!1,!0,function(a,b){return(a=b?Ra(b.a(a)):a.a)?a.nodeName.toLowerCase():""},0,1,!0);R("namespace-uri",3,!0,!1,function(){return""},0,1,!0);
R("normalize-space",3,!1,!0,function(a,b){return(b?L(b,a):z(a.a)).replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"")},0,1);R("not",2,!1,!1,function(a,b){return!M(b,a)},1);R("number",1,!1,!0,function(a,b){return b?K(b,a):+z(a.a)},0,1);R("position",1,!0,!1,function(a){return a.b},0);R("round",1,!1,!1,function(a,b){return Math.round(K(b,a))},1);R("starts-with",2,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);return 0==b.lastIndexOf(a,0)},2);R("string",3,!1,!0,function(a,b){return b?L(b,a):z(a.a)},0,1);
R("string-length",1,!1,!0,function(a,b){return(b?L(b,a):z(a.a)).length},0,1);R("substring",3,!1,!1,function(a,b,c,d){c=K(c,a);if(isNaN(c)||Infinity==c||-Infinity==c)return"";d=d?K(d,a):Infinity;if(isNaN(d)||-Infinity===d)return"";c=Math.round(c)-1;var e=Math.max(c,0);a=L(b,a);return Infinity==d?a.substring(e):a.substring(e,c+Math.round(d))},2,3);R("substring-after",3,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);c=b.indexOf(a);return-1==c?"":b.substring(c+a.length)},2);
R("substring-before",3,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);a=b.indexOf(a);return-1==a?"":b.substring(0,a)},2);R("sum",1,!1,!1,function(a,b){a=H(b.a(a));b=0;for(var c=I(a);c;c=I(a))b+=+z(c);return b},1,1,!0);R("translate",3,!1,!1,function(a,b,c,d){b=L(b,a);c=L(c,a);var e=L(d,a);a={};for(d=0;d<c.length;d++){var f=c.charAt(d);f in a||(a[f]=e.charAt(d))}c="";for(d=0;d<b.length;d++)f=b.charAt(d),c+=f in a?a[f]:f;return c},3);R("true",2,!1,!1,function(){return!0},0);function G(a,b){this.h=a;this.c=void 0!==b?b:null;this.b=null;switch(a){case "comment":this.b=8;break;case "text":this.b=3;break;case "processing-instruction":this.b=7;break;case "node":break;default:throw Error("Unexpected argument");}}function db(a){return"comment"==a||"text"==a||"processing-instruction"==a||"node"==a}G.prototype.a=function(a){return null===this.b||this.b==a.nodeType};G.prototype.f=function(){return this.h};
G.prototype.toString=function(){var a="Kind Test: "+this.h;null===this.c||(a+=J(this.c));return a};function eb(a){this.b=a;this.a=0}function fb(a){a=a.match(gb);for(var b=0;b<a.length;b++)hb.test(a[b])&&a.splice(b,1);return new eb(a)}var gb=/\$?(?:(?![0-9-\.])(?:\*|[\w-\.]+):)?(?![0-9-\.])(?:\*|[\w-\.]+)|\/\/|\.\.|::|\d+(?:\.\d*)?|\.\d+|"[^"]*"|'[^']*'|[!<>]=|\s+|./g,hb=/^\s/;function S(a,b){return a.b[a.a+(b||0)]}function T(a){return a.b[a.a++]}function ib(a){return a.b.length<=a.a};function jb(a){n.call(this,3);this.c=a.substring(1,a.length-1)}m(jb);jb.prototype.a=function(){return this.c};jb.prototype.toString=function(){return"Literal: "+this.c};function E(a,b){this.j=a.toLowerCase();a="*"==this.j?"*":"http://www.w3.org/1999/xhtml";this.c=b?b.toLowerCase():a}E.prototype.a=function(a){var b=a.nodeType;if(1!=b&&2!=b)return!1;b=void 0!==a.localName?a.localName:a.nodeName;return"*"!=this.j&&this.j!=b.toLowerCase()?!1:"*"==this.c?!0:this.c==(a.namespaceURI?a.namespaceURI.toLowerCase():"http://www.w3.org/1999/xhtml")};E.prototype.f=function(){return this.j};
E.prototype.toString=function(){return"Name Test: "+("http://www.w3.org/1999/xhtml"==this.c?"":this.c+":")+this.j};function kb(a){n.call(this,1);this.c=a}m(kb);kb.prototype.a=function(){return this.c};kb.prototype.toString=function(){return"Number: "+this.c};function lb(a,b){n.call(this,a.i);this.h=a;this.c=b;this.g=a.g;this.b=a.b;1==this.c.length&&(a=this.c[0],a.u||a.c!=mb||(a=a.o,"*"!=a.f()&&(this.f={name:a.f(),s:null})))}m(lb);function nb(){n.call(this,4)}m(nb);nb.prototype.a=function(a){var b=new C;a=a.a;9==a.nodeType?F(b,a):F(b,a.ownerDocument);return b};nb.prototype.toString=function(){return"Root Helper Expression"};function ob(){n.call(this,4)}m(ob);ob.prototype.a=function(a){var b=new C;F(b,a.a);return b};ob.prototype.toString=function(){return"Context Helper Expression"};
function pb(a){return"/"==a||"//"==a}lb.prototype.a=function(a){var b=this.h.a(a);if(!(b instanceof C))throw Error("Filter expression must evaluate to nodeset.");a=this.c;for(var c=0,d=a.length;c<d&&b.l;c++){var e=a[c],f=H(b,e.c.a),g;if(e.g||e.c!=qb)if(e.g||e.c!=rb)for(g=I(f),b=e.a(new Q(g));null!=(g=I(f));)g=e.a(new Q(g)),b=Pa(b,g);else g=I(f),b=e.a(new Q(g));else{for(g=I(f);(b=I(f))&&(!g.contains||g.contains(b))&&b.compareDocumentPosition(g)&8;g=b);b=e.a(new Q(g))}}return b};
lb.prototype.toString=function(){var a;a="Path Expression:"+J(this.h);if(this.c.length){var b=t(this.c,function(a,b){return a+J(b)},"Steps:");a+=J(b)}return a};function sb(a,b){this.a=a;this.b=!!b}
function $a(a,b,c){for(c=c||0;c<a.a.length;c++)for(var d=a.a[c],e=H(b),f=b.l,g,h=0;g=I(e);h++){var p=a.b?f-h:h+1;g=d.a(new Q(g,p,f));if("number"==typeof g)p=p==g;else if("string"==typeof g||"boolean"==typeof g)p=!!g;else if(g instanceof C)p=0<g.l;else throw Error("Predicate.evaluate returned an unexpected type.");if(!p){p=e;g=p.f;var x=p.a;if(!x)throw Error("Next must be called at least once before remove.");var D=x.b,x=x.a;D?D.a=x:g.a=x;x?x.b=D:g.b=D;g.l--;p.a=null}}return b}
sb.prototype.toString=function(){return t(this.a,function(a,b){return a+J(b)},"Predicates:")};function U(a,b,c,d){n.call(this,4);this.c=a;this.o=b;this.h=c||new sb([]);this.u=!!d;b=this.h;b=0<b.a.length?b.a[0].f:null;a.b&&b&&(a=b.name,a=w?a.toLowerCase():a,this.f={name:a,s:b.s});a:{a=this.h;for(b=0;b<a.a.length;b++)if(c=a.a[b],c.g||1==c.i||0==c.i){a=!0;break a}a=!1}this.g=a}m(U);
U.prototype.a=function(a){var b=a.a,c=this.f,d=null,e=null,f=0;c&&(d=c.name,e=c.s?L(c.s,a):null,f=1);if(this.u)if(this.g||this.c!=tb)if(b=H((new U(ub,new G("node"))).a(a)),c=I(b))for(a=this.m(c,d,e,f);null!=(c=I(b));)a=Pa(a,this.m(c,d,e,f));else a=new C;else a=B(this.o,b,d,e),a=$a(this.h,a,f);else a=this.m(a.a,d,e,f);return a};U.prototype.m=function(a,b,c,d){a=this.c.f(this.o,a,b,c);return a=$a(this.h,a,d)};
U.prototype.toString=function(){var a;a="Step:"+J("Operator: "+(this.u?"//":"/"));this.c.j&&(a+=J("Axis: "+this.c));a+=J(this.o);if(this.h.a.length){var b=t(this.h.a,function(a,b){return a+J(b)},"Predicates:");a+=J(b)}return a};function vb(a,b,c,d){this.j=a;this.f=b;this.a=c;this.b=d}vb.prototype.toString=function(){return this.j};var wb={};function V(a,b,c,d){if(wb.hasOwnProperty(a))throw Error("Axis already created: "+a);b=new vb(a,b,c,!!d);return wb[a]=b}
V("ancestor",function(a,b){for(var c=new C;b=b.parentNode;)a.a(b)&&Qa(c,b);return c},!0);V("ancestor-or-self",function(a,b){var c=new C;do a.a(b)&&Qa(c,b);while(b=b.parentNode);return c},!0);
var mb=V("attribute",function(a,b){var c=new C,d=a.f();if("style"==d&&w&&b.style)return F(c,new y(b.style,b,"style",b.style.cssText)),c;var e=b.attributes;if(e)if(a instanceof G&&null===a.b||"*"==d)for(a=0;d=e[a];a++)w?d.nodeValue&&F(c,Ha(b,d)):F(c,d);else(d=e.getNamedItem(d))&&(w?d.nodeValue&&F(c,Ha(b,d)):F(c,d));return c},!1),tb=V("child",function(a,b,c,d,e){return(w?Ma:Na).call(null,a,b,l(c)?c:null,l(d)?d:null,e||new C)},!1,!0);V("descendant",B,!1,!0);
var ub=V("descendant-or-self",function(a,b,c,d){var e=new C;A(b,c,d)&&a.a(b)&&F(e,b);return B(a,b,c,d,e)},!1,!0),qb=V("following",function(a,b,c,d){var e=new C;do for(var f=b;f=f.nextSibling;)A(f,c,d)&&a.a(f)&&F(e,f),e=B(a,f,c,d,e);while(b=b.parentNode);return e},!1,!0);V("following-sibling",function(a,b){for(var c=new C;b=b.nextSibling;)a.a(b)&&F(c,b);return c},!1);V("namespace",function(){return new C},!1);
var xb=V("parent",function(a,b){var c=new C;if(9==b.nodeType)return c;if(2==b.nodeType)return F(c,b.ownerElement),c;b=b.parentNode;a.a(b)&&F(c,b);return c},!1),rb=V("preceding",function(a,b,c,d){var e=new C,f=[];do f.unshift(b);while(b=b.parentNode);for(var g=1,h=f.length;g<h;g++){var p=[];for(b=f[g];b=b.previousSibling;)p.unshift(b);for(var x=0,D=p.length;x<D;x++)b=p[x],A(b,c,d)&&a.a(b)&&F(e,b),e=B(a,b,c,d,e)}return e},!0,!0);
V("preceding-sibling",function(a,b){for(var c=new C;b=b.previousSibling;)a.a(b)&&Qa(c,b);return c},!0);var yb=V("self",function(a,b){var c=new C;a.a(b)&&F(c,b);return c},!1);function zb(a){n.call(this,1);this.c=a;this.g=a.g;this.b=a.b}m(zb);zb.prototype.a=function(a){return-K(this.c,a)};zb.prototype.toString=function(){return"Unary Expression: -"+J(this.c)};function Ab(a){n.call(this,4);this.c=a;Ua(this,ja(this.c,function(a){return a.g}));Va(this,ja(this.c,function(a){return a.b}))}m(Ab);Ab.prototype.a=function(a){var b=new C;r(this.c,function(c){c=c.a(a);if(!(c instanceof C))throw Error("Path expression must evaluate to NodeSet.");b=Pa(b,c)});return b};Ab.prototype.toString=function(){return t(this.c,function(a,b){return a+J(b)},"Union Expression:")};function Bb(a,b){this.a=a;this.b=b}function Cb(a){for(var b,c=[];;){W(a,"Missing right hand side of binary expression.");b=Db(a);var d=T(a.a);if(!d)break;var e=(d=Ya[d]||null)&&d.w;if(!e){a.a.a--;break}for(;c.length&&e<=c[c.length-1].w;)b=new N(c.pop(),c.pop(),b);c.push(b,d)}for(;c.length;)b=new N(c.pop(),c.pop(),b);return b}function W(a,b){if(ib(a.a))throw Error(b);}function Eb(a,b){a=T(a.a);if(a!=b)throw Error("Bad token, expected: "+b+" got: "+a);}
function Fb(a){a=T(a.a);if(")"!=a)throw Error("Bad token: "+a);}function Gb(a){a=T(a.a);if(2>a.length)throw Error("Unclosed literal string");return new jb(a)}
function Hb(a){var b,c=[],d;if(pb(S(a.a))){b=T(a.a);d=S(a.a);if("/"==b&&(ib(a.a)||"."!=d&&".."!=d&&"@"!=d&&"*"!=d&&!/(?![0-9])[\w]/.test(d)))return new nb;d=new nb;W(a,"Missing next location step.");b=Ib(a,b);c.push(b)}else{a:{b=S(a.a);d=b.charAt(0);switch(d){case "$":throw Error("Variable reference not allowed in HTML XPath");case "(":T(a.a);b=Cb(a);W(a,'unclosed "("');Eb(a,")");break;case '"':case "'":b=Gb(a);break;default:if(isNaN(+b))if(!db(b)&&/(?![0-9])[\w]/.test(d)&&"("==S(a.a,1)){b=T(a.a);
b=cb[b]||null;T(a.a);for(d=[];")"!=S(a.a);){W(a,"Missing function argument list.");d.push(Cb(a));if(","!=S(a.a))break;T(a.a)}W(a,"Unclosed function argument list.");Fb(a);b=new ab(b,d)}else{b=null;break a}else b=new kb(+T(a.a))}"["==S(a.a)&&(d=new sb(Jb(a)),b=new Za(b,d))}if(b)if(pb(S(a.a)))d=b;else return b;else b=Ib(a,"/"),d=new ob,c.push(b)}for(;pb(S(a.a));)b=T(a.a),W(a,"Missing next location step."),b=Ib(a,b),c.push(b);return new lb(d,c)}
function Ib(a,b){var c,d;if("/"!=b&&"//"!=b)throw Error('Step op should be "/" or "//"');if("."==S(a.a))return d=new U(yb,new G("node")),T(a.a),d;if(".."==S(a.a))return d=new U(xb,new G("node")),T(a.a),d;var e;if("@"==S(a.a))e=mb,T(a.a),W(a,"Missing attribute name");else if("::"==S(a.a,1)){if(!/(?![0-9])[\w]/.test(S(a.a).charAt(0)))throw Error("Bad token: "+T(a.a));c=T(a.a);e=wb[c]||null;if(!e)throw Error("No axis with name: "+c);T(a.a);W(a,"Missing node name")}else e=tb;c=S(a.a);if(/(?![0-9])[\w\*]/.test(c.charAt(0)))if("("==
S(a.a,1)){if(!db(c))throw Error("Invalid node type: "+c);c=T(a.a);if(!db(c))throw Error("Invalid type name: "+c);Eb(a,"(");W(a,"Bad nodetype");var f=S(a.a).charAt(0),g=null;if('"'==f||"'"==f)g=Gb(a);W(a,"Bad nodetype");Fb(a);c=new G(c,g)}else if(c=T(a.a),f=c.indexOf(":"),-1==f)c=new E(c);else{var g=c.substring(0,f),h;if("*"==g)h="*";else if(h=a.b(g),!h)throw Error("Namespace prefix not declared: "+g);c=c.substr(f+1);c=new E(c,h)}else throw Error("Bad token: "+T(a.a));a=new sb(Jb(a),e.a);return d||
new U(e,c,a,"//"==b)}function Jb(a){for(var b=[];"["==S(a.a);){T(a.a);W(a,"Missing predicate expression.");var c=Cb(a);b.push(c);W(a,"Unclosed predicate expression.");Eb(a,"]")}return b}function Db(a){if("-"==S(a.a))return T(a.a),new zb(Db(a));var b=Hb(a);if("|"!=S(a.a))a=b;else{for(b=[b];"|"==T(a.a);)W(a,"Missing next union location path."),b.push(Hb(a));a.a.a--;a=new Ab(b)}return a};function Kb(a){switch(a.nodeType){case 1:return ea(Lb,a);case 9:return Kb(a.documentElement);case 11:case 10:case 6:case 12:return Mb;default:return a.parentNode?Kb(a.parentNode):Mb}}function Mb(){return null}function Lb(a,b){if(a.prefix==b)return a.namespaceURI||"http://www.w3.org/1999/xhtml";var c=a.getAttributeNode("xmlns:"+b);return c&&c.specified?c.value||null:a.parentNode&&9!=a.parentNode.nodeType?Lb(a.parentNode,b):null};function Nb(a,b){if(!a.length)throw Error("Empty XPath expression.");a=fb(a);if(ib(a))throw Error("Invalid XPath expression.");b?"function"==aa(b)||(b=da(b.lookupNamespaceURI,b)):b=function(){return null};var c=Cb(new Bb(a,b));if(!ib(a))throw Error("Bad token: "+T(a));this.evaluate=function(a,b){a=c.a(new Q(a));return new Y(a,b)}}
function Y(a,b){if(0==b)if(a instanceof C)b=4;else if("string"==typeof a)b=2;else if("number"==typeof a)b=1;else if("boolean"==typeof a)b=3;else throw Error("Unexpected evaluation result.");if(2!=b&&1!=b&&3!=b&&!(a instanceof C))throw Error("value could not be converted to the specified type");this.resultType=b;var c;switch(b){case 2:this.stringValue=a instanceof C?Sa(a):""+a;break;case 1:this.numberValue=a instanceof C?+Sa(a):+a;break;case 3:this.booleanValue=a instanceof C?0<a.l:!!a;break;case 4:case 5:case 6:case 7:var d=
H(a);c=[];for(var e=I(d);e;e=I(d))c.push(e instanceof y?e.a:e);this.snapshotLength=a.l;this.invalidIteratorState=!1;break;case 8:case 9:a=Ra(a);this.singleNodeValue=a instanceof y?a.a:a;break;default:throw Error("Unknown XPathResult type.");}var f=0;this.iterateNext=function(){if(4!=b&&5!=b)throw Error("iterateNext called with wrong result type");return f>=c.length?null:c[f++]};this.snapshotItem=function(a){if(6!=b&&7!=b)throw Error("snapshotItem called with wrong result type");return a>=c.length||
0>a?null:c[a]}}Y.ANY_TYPE=0;Y.NUMBER_TYPE=1;Y.STRING_TYPE=2;Y.BOOLEAN_TYPE=3;Y.UNORDERED_NODE_ITERATOR_TYPE=4;Y.ORDERED_NODE_ITERATOR_TYPE=5;Y.UNORDERED_NODE_SNAPSHOT_TYPE=6;Y.ORDERED_NODE_SNAPSHOT_TYPE=7;Y.ANY_UNORDERED_NODE_TYPE=8;Y.FIRST_ORDERED_NODE_TYPE=9;function Ob(a){this.lookupNamespaceURI=Kb(a)}
function Pb(a,b){a=a||k;var c=a.Document&&a.Document.prototype||a.document;if(!c.evaluate||b)a.XPathResult=Y,c.evaluate=function(a,b,c,g){return(new Nb(a,c)).evaluate(b,g)},c.createExpression=function(a,b){return new Nb(a,b)},c.createNSResolver=function(a){return new Ob(a)}}var Qb=["wgxpath","install"],Z=k;Qb[0]in Z||!Z.execScript||Z.execScript("var "+Qb[0]);for(var Rb;Qb.length&&(Rb=Qb.shift());)Qb.length||void 0===Pb?Z[Rb]?Z=Z[Rb]:Z=Z[Rb]={}:Z[Rb]=Pb;}).call(this)

    }

    function patchCurrentScript() {
/*!
 * document.currentScript
 * Polyfill for `document.currentScript`.
 * Copyright (c) 2016 James M. Greene
 * Licensed MIT
 * https://github.com/JamesMGreene/document.currentScript
 * v1.1.0
 */
(function() {


// Live NodeList collection
var scripts = document.getElementsByTagName("script");

// Check if the browser supports the `readyState` property on `script` elements
var supportsScriptReadyState = "readyState" in (scripts[0] || document.createElement("script"));

// Lousy browser detection for [not] Opera
var isNotOpera = !window.opera || window.opera.toString() !== "[object Opera]";

// Guaranteed accurate in IE 6-10.
// Not supported in any other browsers. =(
var canPolyfill = supportsScriptReadyState && isNotOpera;


// Attempt to retrieve the native `document.currentScript` accessor method
var nativeCurrentScriptFn = (function(doc) {
  /*jshint proto:true */

  var hasNativeMethod = "currentScript" in doc;
  var canGetDescriptor = typeof Object.getOwnPropertyDescriptor === "function";
  var canGetPrototype = typeof Object.getPrototypeOf === "function";
  var canUseDunderProto = typeof "test".__proto__ === "object";


  function _invokeNativeCurrentScriptMethod() {
    var des,
        csFnIsNotOurs = true;

    if (canGetDescriptor) {
      des = Object.getOwnPropertyDescriptor(doc, "currentScript") || undefined;
      if (des && typeof des.get === "function" && des.get === _currentEvaluatingScript) {
        csFnIsNotOurs = false;
      }
    }

    // Potentially dangerous hack...
    return csFnIsNotOurs ? doc.currentScript : null;
  }

  function _getProto(obj) {
    var proto;
    if (obj != null) {
      proto = (
        canGetPrototype ? Object.getPrototypeOf(obj) :
          canUseDunderProto ? obj.__proto__ :
            obj.constructor != null ? obj.constructor.prototype :
              undefined
      );
    }
    return proto;
  }

  var nativeFn = (function _getCurrentScriptDef(docSelfOrAncestor, doc) {
    var des, cs;

    if (
      hasNativeMethod && canGetDescriptor &&
      docSelfOrAncestor && docSelfOrAncestor !== Object.prototype &&
      doc && doc !== Object.prototype
    ) {
      if (canGetDescriptor) {
        des = Object.getOwnPropertyDescriptor(docSelfOrAncestor, "currentScript") || undefined;
        if (des && typeof des.get === "function") {
          cs = des.get;
        }
      }
      if (!cs) {
        cs = _getCurrentScriptDef(_getProto(docSelfOrAncestor), doc);
      }
    }

    if (!cs) {
      cs = _invokeNativeCurrentScriptMethod;
    }
    else if (cs === _currentEvaluatingScript) {
      cs = undefined;
    }

    return cs;
  })(doc, doc);

  return nativeFn;
})(document);



// Top-level API (compliant with `document.currentScript` specifications)
//
// Get the currently "executing" (i.e. EVALUATING) `script` DOM
// element, per the spec requirements for `document.currentScript`.
//
// IMPORTANT: This polyfill CANNOT achieve 100% accurate results
//            cross-browser. ;_;
function _currentEvaluatingScript() {
  // Yes, this IS possible, i.e. if a script removes other scripts (or itself)
  if (scripts.length === 0) {
    return null;
  }

  // Guaranteed accurate in IE 6-10.
  // Not supported in any other browsers. =(
  if (canPolyfill) {
    for (var i = scripts.length; i--; ) {
      if (scripts[i] && scripts[i].readyState === "interactive") {
        return scripts[i];
      }
    }
  }

  // If the native method exists, defer to that as a last-ditch effort
  if (
    typeof nativeCurrentScriptFn === "function" &&
    _currentEvaluatingScript.doNotDeferToNativeMethod !== true
  ) {
    return nativeCurrentScriptFn.call(document) || null;
  }

  // Any other attempts cannot be guaranteed and, as such, should be left out
  // from this "Strict Mode" behavior.
  // Alas, returning `null` here is not necessarily accurate either.
  // We could return `undefined` instead but that would not comply with the spec
  // in cases where it should correctly be returning `null`.
  return null;
}

// Allow a last-ditch effort to use the native `document.currentScript` accessor
// method (if it exists and can be retrieved)?
_currentEvaluatingScript.doNotDeferToNativeMethod = false;



// Inspect the polyfill-ability of this browser
var needsPolyfill = !("currentScript" in document);
var canDefineProp = typeof Object.defineProperty === "function" &&
  (function() {
    var result;
    try {
      Object.defineProperty(document, "_xyz", {
        get: function() {
          return "blah";
        },
        configurable: true
      });
      result = document._xyz === "blah";
      delete document._xyz;
    }
    catch (e) {
      result = false;
    }
    return result;
  })();


// Add the "private" property for testing, even if the real property can be polyfilled
document._currentScript = _currentEvaluatingScript;

// Polyfill it!
if (needsPolyfill && canDefineProp && typeof canPolyfill !== "undefined" && canPolyfill) {
  Object.defineProperty(document, "currentScript", {
    get: _currentEvaluatingScript
  });
}

})();

    }

    function patchIETouch() {
/*!
  The MIT License (MIT)

  Copyright (c) 2014-current Andrea Giammarchi

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 */

/*

CSS
  Disables all pan/zoom behaviors and fire pointer events in JavaScript instead.
  .disablePanZoom {
    -ms-touch-action: none;
    touch-action: none;
  }

JS
  Disables text selection
  element.addEventListener("selectstart", function(e) { e.preventDefault(); }, false);

*/

(function (navigator, document, pointerEnabled) {

  // highly experimental, should work on IE10 and IE11 only
  // normal IE mouse events won't be affected

  if (!(
    (pointerEnabled = !!navigator.pointerEnabled) ||
    navigator.msPointerEnabled
  ) ||
    'ontouchend' in document
  ) return;

  var
    // shortcuts
    ADD_EVENT_LISTENER = 'addEventListener',
    REMOVE_EVENT_LISTENER = 'removeEventListener',
    // used to force-simulate touch
    SET_CURRENT_CAPTURE = pointerEnabled ?
        'setPointerCapture' : 'msSetPointerCapture',
    RELEASE_CURRENT_CAPTURE = pointerEnabled ?
        'releasePointerCapture' : 'msReleasePointerCapture',
    // shortcut for common replacements
    ElementPrototype = Element.prototype,
    defineProperties = Object.defineProperties,
    defineProperty = Object.defineProperty,
    // for types too
    type = function (type) {
      var lo = type.toLowerCase(),
          ms = 'MS' + type;
      handler[ms] = handler[lo];
      return pointerEnabled ? lo: ms;
    },
    // these are calls to the passed event
    commonMethod = function (name) {
      return {
        value: function () {
          Event[name].call(this);
          this._[name]();
        }
      };
    },
    // DOM Level 0 accessors
    createAccessor = function (type) {
      var ontype = '_on' + type;
      return {
        enumerable: true,
        configurable: true,
        get: function () {
          return this[ontype] || null;
        },
        set: function (callback) {
          if (this[ontype]) {
            this[REMOVE_EVENT_LISTENER](type, this[ontype]);
          }
          this[ontype] = callback;
          if (callback) {
            this[ADD_EVENT_LISTENER](type, callback);
          }
        }
      };
    },
    // these are common DOM overrides
    commonOverride = function (proto, name) {
      var original = proto[name];
      defineProperty(proto, name, {
        configurable: true,
        value: function (type, eventHandler, capture) {
          if (type in types) {
            original.call(
              this,
              types[type],
              handleEvent,
              capture
            );
          }
          original.call(this, type, eventHandler, capture);
        }
      });
    },
    // these are delegated properties
    commonProperty = function (name) {
      return {
        get: function () {
          return this._[name];
        }
      };
    },
    // generates similar functions for similar cases
    upOrCancel = function (type) {
      return function (e) {
        var pointerId = e.pointerId,
            touch = touches[pointerId],
            currentTarget = e.currentTarget;
        delete touches[pointerId];
        if (RELEASE_CURRENT_CAPTURE in currentTarget) {
          currentTarget[RELEASE_CURRENT_CAPTURE](e.pointerId);
        }
        dispatchEvent(type, e, touch);
        delete changedTouches[pointerId];
      };
    },
    // shortcut for all events
    dispatchEvent = function (type, e, touch) {
      var c = document.createEvent('Event');
      c.initEvent(type, true, true);
      _.value = e;
      TouchEventProperties.currentTarget.value = touch.currentTarget;
      defineProperties(c, TouchEventProperties);
      touch.currentTarget.dispatchEvent(c);
    },
    get = function (name, object) {
      function returnID(id) {
        return object[id];
      }
      return function get() {
        _.value = Object.keys(object).map(returnID);
        return defineProperty(this, name, _)[name];
      };
    },
    // basically says if it's touch or not
    humanReadablePointerType = function (e) {
      switch(e.pointerType) {
        case 'mouse':
        case e.MSPOINTER_TYPE_MOUSE:
          return 'mouse';
      }
      // pen is just fine as touch
      return 'touch';
    },
    // recycle common descriptors too
    _ = {value: null},

    // the list of touches / changedTouches
    touches = Object.create(null),
    changedTouches = Object.create(null),
    // TODO: targetTouches = Object.create(null),

    Event = document.createEvent('Event'),
    // all properties per each event
    // defined at runtime .. not so fast
    // but still OKish in terms of RAM and CPU
    TouchEventProperties = {
      _: _,
      touches: {
        configurable: true,
        get: get('touches', touches)
      },
      changedTouches: {
        configurable: true,
        get: get('changedTouches', changedTouches)
      },
      currentTarget: {value:null},
      // almost everything is mirrored
      relatedTarget: commonProperty('relatedTarget'),
      target: commonProperty('target'),
      altKey: commonProperty('altKey'),
      metaKey: commonProperty('metaKey'),
      ctrlKey: commonProperty('ctrlKey'),
      shiftKey: commonProperty('shiftKey'),
      // including methods
      preventDefault: commonMethod('preventDefault'),
      stopPropagation: commonMethod('stopPropagation'),
      stopImmediatePropagation: commonMethod('stopImmediatePropagation')
    },
    // all types translated
    types = Object.create(null),
    // boosted up eventListener
    handleEvent = function (e) {
      if (humanReadablePointerType(e) === 'touch') {
        // invoke normalized methods
        handler[e.type](e);
      }
    },
    // the unique handler for all the things
    handler = {
      pointerdown: function (e) {
        var touch = new Touch(e),
            pointerId = e.pointerId,
            currentTarget = e.currentTarget;
        changedTouches[pointerId] = touches[pointerId] = touch;
        if (SET_CURRENT_CAPTURE in currentTarget) {
          currentTarget[SET_CURRENT_CAPTURE](e.pointerId);
        }
        dispatchEvent('touchstart', e, touch);
      },
      pointermove: function (e) {
        var pointerId = e.pointerId,
            touch = touches[pointerId];
        touch._ = e;
        dispatchEvent('touchmove', e, touch);
        changedTouches[pointerId]._ = e;
      },
      pointerup: upOrCancel('touchend'),
      pointercancel: upOrCancel('touchcancel')
    },
    accessors = {
      ontouchstart: createAccessor('touchstart'),
      ontouchmove: createAccessor('touchmove'),
      ontouchend: createAccessor('touchend'),
      ontouchcancel: createAccessor('touchcancel')
    }
  ;

  // facade for initial events info
  function Touch(_) {
    // the event needs to be refreshed
    // each touchmove
    this._ = _;
    this.currentTarget = _.currentTarget;
  }

  // all common properties
  defineProperties(
    Touch.prototype,
    {
      identifier: commonProperty('pointerId'),
      target: commonProperty('target'),
      screenX: commonProperty('screenX'),
      screenY: commonProperty('screenY'),
      clientX: commonProperty('clientX'),
      clientY: commonProperty('clientY'),
      pageX: commonProperty('pageX'),
      pageY: commonProperty('pageY')
    }
  );

  types.touchstart  = type('PointerDown');
  types.touchmove   = type('PointerMove');
  types.touchend    = type('PointerUp');
  types.touchcancel = type('PointerCancel');

  commonOverride(document, ADD_EVENT_LISTENER);
  commonOverride(document, REMOVE_EVENT_LISTENER);
  commonOverride(ElementPrototype, ADD_EVENT_LISTENER);
  commonOverride(ElementPrototype, REMOVE_EVENT_LISTENER);

  // make these available as DOM Level 0
  defineProperties(document, accessors);
  defineProperties(ElementPrototype, accessors);

}(navigator, document));
    }

    function patchPointerAccuracy() {
/**
 * pointeraccuracy.js: Heuristically determine the pointer accuracy 
 * -- 'coarse' or 'fine' -- for a device/ user agent.
 * 
 * If rendering for a component, widget etc. should be depending on the accuracy
 * of the pointing device, the level 4 media query '@media (pointer:coarse)' is
 * handy. Browser support is low for this MQ but this classifier allows you to
 * still get the desired information. It resembles this media query
 * heuristically based on the following properties: 
 * - Pointer media query result (if available)
 * - Touch capability
 * 
 * @copyright n-fuse GmbH [All rights reserved]
 * @version 0.9.2
 * @license pointeraccuracy.js is (c) 2013 n-fuse GmbH [All rights reserved] and
 *          licensed under the MIT license.
 */
var Pointeraccuracy = {
  listener: null,
  pointerModeNative: null,
  pointerMode: null,

  init: function() {
    var thiz = this;

    // Find out whether the browser supports the pointer mode media query 
    // and if so, execute it
    if (window.matchMedia('(pointer:fine)').matches) {
      thiz.pointerModeNative = 'fine'; // mouse, stylus, ...
    } else if (window.matchMedia('(pointer:coarse)').matches) {
      thiz.pointerModeNative = 'coarse'; // touch screen
    }

    // Initial classification
    thiz.classify();
  },

  // The classifier returns either 'fine' or 'coarse'
  // thus cancelling out 'none' and preventing 'undefined' which are useless in
  // most cases.
  classify: function() {
    var thiz = this;
    var mode;
    if (thiz.pointerModeNative !== null) { // If pointer MQ is supported, just
                                           // use its result
      mode = thiz.pointerModeNative;
    } else {
      if (thiz.hasTouchSupport()) {
        mode = 'coarse';
      } else {
        mode = 'fine';
      }
    }
    thiz.setPointerMode(mode);
  },

  setModeListener: function(cb) {
    var thiz = this;
    thiz.listener = cb;
  },

  setPointerMode: function(mode) {
    var thiz = this;
    if (thiz.pointerMode !== mode) {
      thiz.pointerMode = mode;
      if (typeof (thiz.listener) === 'function') {
        thiz.listener(mode);
      }
    }
  },

  getPointerMode: function() {
    return this.pointerMode;
  },

  hasTouchSupport: function() {
    return !!('ontouchstart' in window) // works on most browsers
        || !!('onmsgesturechange' in window); // works on IE10
  },

  isPointerFine: function() {
    return this.pointerMode === 'fine';
  },

  isPointerCoarse: function() {
    return this.pointerMode === 'coarse';
  }
};

    }

    function patchCSSSupports() {
/** @license CSS.supports polyfill | @version 0.4 | MIT License | github.com/termi/CSS.supports */

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @warning_level VERBOSE
// @jscomp_warning missingProperties
// @output_file_name CSS.supports.js
// @check_types
// ==/ClosureCompiler==

/*
TODO::
1. element.style.webkitProperty == element.style.WebkitProperty in Webkit (Chrome at least), so
CSS.supporst("webkit-animation", "name") is true. Think this is wrong.
*/

;(function() {
	"use strict";

	var global = window
		, _CSS_supports
		, msie
		, testElement
		, prevResultsCache
		, _CSS = global["CSS"]
	;

	if( !_CSS ) {
		_CSS = global["CSS"] = {};
	}

	// ---=== HAS CSS.supports support ===---
	_CSS_supports = _CSS.supports;

	// ---=== HAS supportsCSS support ===---
	if( !_CSS_supports && global["supportsCSS"] ) {// Opera 12.10 impl
		_CSS_supports = _CSS.supports = global["supportsCSS"].bind(global);
		if( global.__proto__ ) {
			delete global.__proto__["supportsCSS"];
		}
	}


	if(typeof _CSS_supports === "function") {
		if( (function() {
			// Test for support [supports condition](http://www.w3.org/TR/css3-conditional/#supportscondition)
			try {
				_CSS_supports.call(_CSS, "(a:a)");
				// SUCCESS
				return !(global = _CSS_supports = null);//return true
			}
			catch(e) {//FAIL
				//_CSS_supports = _CSS_supports.bind(global);
			}
		})() ) {
			// EXIT
			return;// Do not need anything to do. Exit from polyfill
		}
	}
	else {
		// ---=== NO CSS.supports support ===---

		msie = "runtimeStyle" in document.documentElement;
		testElement = global["document"].createElement("_");
		prevResultsCache = {};

		_CSS_supports = function(ToCamel_replacer, testStyle, testElement, propertyName, propertyValue) {
			var name_and_value = propertyName + "\\/" + propertyValue;
			if( name_and_value in prevResultsCache ) {
				return prevResultsCache[name_and_value];
			}

			/* TODO:: for IE < 9:
			 _ = document.documentElement.appendChild(document.createElement("_"))
			 _.currentStyle[propertyName] == propertyValue
			*/
			var __bind__RE_FIRST_LETTER = this
				, propertyName_CC = (propertyName + "").replace(__bind__RE_FIRST_LETTER, ToCamel_replacer)
			;

			var result = propertyName && propertyValue && (propertyName_CC in testStyle);

			if( result ) {
				/*if( msie ) {

					try {
						testElement.style[propertyName] = propertyValue;// IE throw here, if unsupported this syntax
						testElement.style.cssText = "";
					}
					catch(e) {
						result = false;
					}

					if( result ) {
						testElement.id = uuid;
						_document.body.appendChild(testElement);

						if( (prevPropValue = testElement.currentStyle[propertyName]) != propertyValue ) {
							_document.body.insertAdjacentHTML("beforeend", "<br style='display:none' id='" + uuid + "br'><style id='" + uuid + "style'>" +
								"#" + uuid + "{display:none;height:0;width:0;visibility:hidden;position:absolute;position:fixed;" + propertyName + ":" + propertyValue + "}" +
								"</style>");

							if( !(propertyName in testElement.currentStyle) ) {
								partOfCompoundPropName
							}

							if( /\(|\s/.test(propertyValue) ) {
								currentPropValue = testElement.currentStyle[propertyName];
								result = !!currentPropValue && currentPropValue != prevPropValue;
							}
							else {
								result = testElement.currentStyle[propertyName] == propertyValue;
							}
							//_document.documentElement.removeChild(document.getElementById(uuid + "br"));
							//_document.documentElement.removeChild(document.getElementById(uuid + "style"));
						}

						//_document.documentElement.removeChild(testElement);
					}*/

				if( msie ) {
					if( /\(|\s/.test(propertyValue) ) {
						try {
							testStyle[propertyName_CC] = propertyValue;
							result = !!testStyle[propertyName_CC];
						}
						catch(e) {
							result = false;
						}
					}
					else {
						testStyle.cssText = "display:none;height:0;width:0;visibility:hidden;position:absolute;position:fixed;" + propertyName + ":" + propertyValue;
						document.documentElement.appendChild(testElement);
						result = testElement.currentStyle[propertyName_CC] == propertyValue;
						document.documentElement.removeChild(testElement);
					}
				}
				else {
					testStyle.cssText = propertyName + ":" + propertyValue;
					result = testStyle[propertyName_CC];
					result = result == propertyValue || result && testStyle.length > 0;
				}
			}

			testStyle.cssText = "";

			return prevResultsCache[name_and_value] = result;
		}.bind(
			/(-)([a-z])/g // __bind__RE_FIRST_LETTER
			, function(a, b, c) { // ToCamel_replacer
				return c.toUpperCase()
			}
			, testElement.style // testStyle
			, msie ? testElement : null // testElement
		);
	}

	// _supportsCondition("(a:b) or (display:block) or (display:none) and (display:block1)")
	function _supportsCondition(str) {
		if(!str) {
			_supportsCondition.throwSyntaxError();
		}

		/** @enum {number} @const */
		var RMAP = {
			NOT: 1
			, AND: 2
			, OR: 4
			, PROPERTY: 8
			, VALUE: 16
			, GROUP_START: 32
			, GROUP_END: 64
		};

		var resultsStack = []
			, chr
			, result
			, valid = true
			, isNot
			, start
			, currentPropertyName
			, expectedPropertyValue
			, passThisGroup
			, nextRuleCanBe = 
				RMAP.NOT | RMAP.GROUP_START | RMAP.PROPERTY
			, currentRule
			, i = -1
			, newI
			, len = str.length
		;

		resultsStack.push(void 0);

		function _getResult() {
			var l = resultsStack.length - 1;
			if( l < 0 )valid = false;
			return resultsStack[ l ];
		}

		/**
		 * @param {string=} val
		 * @private
		 */
		function _setResult(val) {
			var l = resultsStack.length - 1;
			if( l < 0 )valid = false;
			result = resultsStack[ l ] = val;
		}

		/**
		 * @param {string?} that
		 * @param {string?} notThat
		 * @param {number=} __i
		 * @param {boolean=} cssValue
		 * @return {(number|undefined)}
		 * @private
		 */
		function _checkNext(that, notThat, __i, cssValue) {
			newI = __i || i;

			var chr
				, isQuited
				, isUrl
				, special
			;

			if(cssValue) {
				newI--;
			}

			do {
				chr = str.charAt(++newI);

				if(cssValue) {
					special = chr && (isQuited || isUrl);
					if(chr == "'" || chr == "\"") {
						special = (isQuited = !isQuited);
					}
					else if(!isQuited) {
						if(!isUrl && chr == "(") {
							// TODO:: in Chrome: $0.style.background = "url('http://asd))')"; $0.style.background == "url(http://asd%29%29/)"
							isUrl = true;
							special = true;
						}
						else if(isUrl && chr == ")") {
							isUrl = false;
							special = true;
						}
					}
				}
			}
			while(special || (chr && (!that || chr != that) && (!notThat || chr == notThat)));

			if(that == null || chr == that) {
				return newI;
			}
		}

		while(++i < len) {
			if(currentRule == RMAP.NOT) {
				nextRuleCanBe = RMAP.GROUP_START | RMAP.PROPERTY;
			}
			else if(currentRule == RMAP.AND || currentRule == RMAP.OR || currentRule == RMAP.GROUP_START) {
				nextRuleCanBe = RMAP.GROUP_START | RMAP.PROPERTY | RMAP.NOT;
			}
			else if(currentRule == RMAP.GROUP_END) {
				nextRuleCanBe = RMAP.GROUP_START | RMAP.NOT | RMAP.OR | RMAP.AND;
			}
			else if(currentRule == RMAP.VALUE) {
				nextRuleCanBe = RMAP.GROUP_END | RMAP.GROUP_START | RMAP.NOT | RMAP.OR | RMAP.AND;
			}
			else if(currentRule == RMAP.PROPERTY) {
				nextRuleCanBe = RMAP.VALUE;
			}

			chr = str.charAt(i);

			if(nextRuleCanBe & RMAP.NOT && chr == "n" && str.substr(i, 3) == "not") {
				currentRule = RMAP.NOT;
				i += 2;
			}
			else if(nextRuleCanBe & RMAP.AND && chr == "a" && str.substr(i, 3) == "and") {
				currentRule = RMAP.AND;
				i += 2;
			}
			else if(nextRuleCanBe & RMAP.OR && chr == "o" && str.substr(i, 2) == "or") {
				currentRule = RMAP.OR;
				i++;
			}
			else if(nextRuleCanBe & RMAP.GROUP_START && chr == "(" && _checkNext("(", " ")) {
				currentRule = RMAP.GROUP_START;
				i = newI - 1;
			}
			else if(nextRuleCanBe & RMAP.GROUP_END && chr == ")" && resultsStack.length > 1) {
				currentRule = RMAP.GROUP_END;
			}
			else if(nextRuleCanBe & RMAP.PROPERTY && chr == "(" && (start = _checkNext(null, " ")) && _checkNext(":", null, start)) {
				currentRule = RMAP.PROPERTY;
				i = newI - 1;
				currentPropertyName = str.substr(start, i - start + 1).trim();
				start = 0;
				expectedPropertyValue = null;
				continue;
			}
			else if(nextRuleCanBe & RMAP.VALUE && (start = _checkNext(null, " ")) && _checkNext(")", null, start, true)) {
				currentRule = RMAP.VALUE;
				i = newI;
				expectedPropertyValue = str.substr(start, i - start).trim();
				start = 0;
				chr = " ";
			}
			else if(chr == " ") {
				continue;
			}
			else {
				currentRule = 0;
			}

			if(!valid || !chr || !(currentRule & nextRuleCanBe)) {
				_supportsCondition.throwSyntaxError();
			}
			valid = true;

			if(currentRule == RMAP.OR) {
				if(result === false) {
					_setResult();
					passThisGroup = false;
				}
				else if(result === true) {
					passThisGroup = true;
				}

				continue;
			}

			if( passThisGroup ) {
				continue;
			}

			result = _getResult();

			if(currentRule == RMAP.NOT) {
				isNot = true;

				continue;
			}

			if(currentRule == RMAP.AND) {
				if(result === false) {
					passThisGroup = true;
				}
				else {
					_setResult();
				}

				continue;
			}

			if(result === false && !(currentRule & (RMAP.GROUP_END | RMAP.GROUP_START))) {
				_setResult(result);
				continue;
			}

			if( currentRule == RMAP.GROUP_START ) { // Group start
				resultsStack.push(void 0);
			}
			else if( currentRule == RMAP.GROUP_END ) { // Group end
				passThisGroup = false;

				resultsStack.pop();
				if( _getResult() !== void 0) {
					result = !!(result & _getResult());
				}

				isNot = false;
			}
			else if( currentRule == RMAP.VALUE ) { // Property value
				_setResult(_CSS_supports(currentPropertyName, expectedPropertyValue));
				if(isNot)result = !result;

				isNot = false;
				expectedPropertyValue = currentPropertyName = null;
			}

			_setResult(result);
		}

		if(!valid || result === void 0 || resultsStack.length > 1) {
			_supportsCondition.throwSyntaxError();
		}

		return result;
	}
	_supportsCondition.throwSyntaxError = function() {
		throw new Error("SYNTAX_ERR");
	};

	/**
	 * @expose
	 */
	_CSS.supports = function(a, b) {
		if(!arguments.length) {
			throw new Error("WRONG_ARGUMENTS_ERR");//TODO:: DOMException ?
		}

		if(arguments.length == 1) {
			return _supportsCondition(a);
		}

		return _CSS_supports(a, b);
	};

	global = testElement = null;// no need this any more
})();

    }

    function patchFlexibility() {
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.flexibility=e()}}(function(){return function e(t,r,l){function n(f,i){if(!r[f]){if(!t[f]){var s="function"==typeof require&&require;if(!i&&s)return s(f,!0);if(o)return o(f,!0);var a=new Error("Cannot find module '"+f+"'");throw a.code="MODULE_NOT_FOUND",a}var c=r[f]={exports:{}};t[f][0].call(c.exports,function(e){var r=t[f][1][e];return n(r?r:e)},c,c.exports,e,t,r,l)}return r[f].exports}for(var o="function"==typeof require&&require,f=0;f<l.length;f++)n(l[f]);return n}({1:[function(e,t,r){t.exports=function(e){var t,r,l,n=-1;if(e.lines.length>1&&"flex-start"===e.style.alignContent)for(t=0;l=e.lines[++n];)l.crossStart=t,t+=l.cross;else if(e.lines.length>1&&"flex-end"===e.style.alignContent)for(t=e.flexStyle.crossSpace;l=e.lines[++n];)l.crossStart=t,t+=l.cross;else if(e.lines.length>1&&"center"===e.style.alignContent)for(t=e.flexStyle.crossSpace/2;l=e.lines[++n];)l.crossStart=t,t+=l.cross;else if(e.lines.length>1&&"space-between"===e.style.alignContent)for(r=e.flexStyle.crossSpace/(e.lines.length-1),t=0;l=e.lines[++n];)l.crossStart=t,t+=l.cross+r;else if(e.lines.length>1&&"space-around"===e.style.alignContent)for(r=2*e.flexStyle.crossSpace/(2*e.lines.length),t=r/2;l=e.lines[++n];)l.crossStart=t,t+=l.cross+r;else for(r=e.flexStyle.crossSpace/e.lines.length,t=e.flexStyle.crossInnerBefore;l=e.lines[++n];)l.crossStart=t,l.cross+=r,t+=l.cross}},{}],2:[function(e,t,r){t.exports=function(e){for(var t,r=-1;line=e.lines[++r];)for(t=-1;child=line.children[++t];){var l=child.style.alignSelf;"auto"===l&&(l=e.style.alignItems),"flex-start"===l?child.flexStyle.crossStart=line.crossStart:"flex-end"===l?child.flexStyle.crossStart=line.crossStart+line.cross-child.flexStyle.crossOuter:"center"===l?child.flexStyle.crossStart=line.crossStart+(line.cross-child.flexStyle.crossOuter)/2:(child.flexStyle.crossStart=line.crossStart,child.flexStyle.crossOuter=line.cross,child.flexStyle.cross=child.flexStyle.crossOuter-child.flexStyle.crossBefore-child.flexStyle.crossAfter)}}},{}],3:[function(e,t,r){t.exports=function l(e,l){var t="row"===l||"row-reverse"===l,r=e.mainAxis;if(r){var n=t&&"inline"===r||!t&&"block"===r;n||(e.flexStyle={main:e.flexStyle.cross,cross:e.flexStyle.main,mainOffset:e.flexStyle.crossOffset,crossOffset:e.flexStyle.mainOffset,mainBefore:e.flexStyle.crossBefore,mainAfter:e.flexStyle.crossAfter,crossBefore:e.flexStyle.mainBefore,crossAfter:e.flexStyle.mainAfter,mainInnerBefore:e.flexStyle.crossInnerBefore,mainInnerAfter:e.flexStyle.crossInnerAfter,crossInnerBefore:e.flexStyle.mainInnerBefore,crossInnerAfter:e.flexStyle.mainInnerAfter,mainBorderBefore:e.flexStyle.crossBorderBefore,mainBorderAfter:e.flexStyle.crossBorderAfter,crossBorderBefore:e.flexStyle.mainBorderBefore,crossBorderAfter:e.flexStyle.mainBorderAfter})}else t?e.flexStyle={main:e.style.width,cross:e.style.height,mainOffset:e.style.offsetWidth,crossOffset:e.style.offsetHeight,mainBefore:e.style.marginLeft,mainAfter:e.style.marginRight,crossBefore:e.style.marginTop,crossAfter:e.style.marginBottom,mainInnerBefore:e.style.paddingLeft,mainInnerAfter:e.style.paddingRight,crossInnerBefore:e.style.paddingTop,crossInnerAfter:e.style.paddingBottom,mainBorderBefore:e.style.borderLeftWidth,mainBorderAfter:e.style.borderRightWidth,crossBorderBefore:e.style.borderTopWidth,crossBorderAfter:e.style.borderBottomWidth}:e.flexStyle={main:e.style.height,cross:e.style.width,mainOffset:e.style.offsetHeight,crossOffset:e.style.offsetWidth,mainBefore:e.style.marginTop,mainAfter:e.style.marginBottom,crossBefore:e.style.marginLeft,crossAfter:e.style.marginRight,mainInnerBefore:e.style.paddingTop,mainInnerAfter:e.style.paddingBottom,crossInnerBefore:e.style.paddingLeft,crossInnerAfter:e.style.paddingRight,mainBorderBefore:e.style.borderTopWidth,mainBorderAfter:e.style.borderBottomWidth,crossBorderBefore:e.style.borderLeftWidth,crossBorderAfter:e.style.borderRightWidth},"content-box"===e.style.boxSizing&&("number"==typeof e.flexStyle.main&&(e.flexStyle.main+=e.flexStyle.mainInnerBefore+e.flexStyle.mainInnerAfter+e.flexStyle.mainBorderBefore+e.flexStyle.mainBorderAfter),"number"==typeof e.flexStyle.cross&&(e.flexStyle.cross+=e.flexStyle.crossInnerBefore+e.flexStyle.crossInnerAfter+e.flexStyle.crossBorderBefore+e.flexStyle.crossBorderAfter));e.mainAxis=t?"inline":"block",e.crossAxis=t?"block":"inline","number"==typeof e.style.flexBasis&&(e.flexStyle.main=e.style.flexBasis+e.flexStyle.mainInnerBefore+e.flexStyle.mainInnerAfter+e.flexStyle.mainBorderBefore+e.flexStyle.mainBorderAfter),e.flexStyle.mainOuter=e.flexStyle.main,e.flexStyle.crossOuter=e.flexStyle.cross,"auto"===e.flexStyle.mainOuter&&(e.flexStyle.mainOuter=e.flexStyle.mainOffset),"auto"===e.flexStyle.crossOuter&&(e.flexStyle.crossOuter=e.flexStyle.crossOffset),"number"==typeof e.flexStyle.mainBefore&&(e.flexStyle.mainOuter+=e.flexStyle.mainBefore),"number"==typeof e.flexStyle.mainAfter&&(e.flexStyle.mainOuter+=e.flexStyle.mainAfter),"number"==typeof e.flexStyle.crossBefore&&(e.flexStyle.crossOuter+=e.flexStyle.crossBefore),"number"==typeof e.flexStyle.crossAfter&&(e.flexStyle.crossOuter+=e.flexStyle.crossAfter)}},{}],4:[function(e,t,r){var l=e("../reduce");t.exports=function(e){if(e.mainSpace>0){var t=l(e.children,function(e,t){return e+parseFloat(t.style.flexGrow)},0);t>0&&(e.main=l(e.children,function(r,l){return"auto"===l.flexStyle.main?l.flexStyle.main=l.flexStyle.mainOffset+parseFloat(l.style.flexGrow)/t*e.mainSpace:l.flexStyle.main+=parseFloat(l.style.flexGrow)/t*e.mainSpace,l.flexStyle.mainOuter=l.flexStyle.main+l.flexStyle.mainBefore+l.flexStyle.mainAfter,r+l.flexStyle.mainOuter},0),e.mainSpace=0)}}},{"../reduce":12}],5:[function(e,t,r){var l=e("../reduce");t.exports=function(e){if(e.mainSpace<0){var t=l(e.children,function(e,t){return e+parseFloat(t.style.flexShrink)},0);t>0&&(e.main=l(e.children,function(r,l){return l.flexStyle.main+=parseFloat(l.style.flexShrink)/t*e.mainSpace,l.flexStyle.mainOuter=l.flexStyle.main+l.flexStyle.mainBefore+l.flexStyle.mainAfter,r+l.flexStyle.mainOuter},0),e.mainSpace=0)}}},{"../reduce":12}],6:[function(e,t,r){var l=e("../reduce");t.exports=function(e){var t;e.lines=[t={main:0,cross:0,children:[]}];for(var r,n=-1;r=e.children[++n];)"nowrap"===e.style.flexWrap||0===t.children.length||"auto"===e.flexStyle.main||e.flexStyle.main-e.flexStyle.mainInnerBefore-e.flexStyle.mainInnerAfter-e.flexStyle.mainBorderBefore-e.flexStyle.mainBorderAfter>=t.main+r.flexStyle.mainOuter?(t.main+=r.flexStyle.mainOuter,t.cross=Math.max(t.cross,r.flexStyle.crossOuter)):e.lines.push(t={main:r.flexStyle.mainOuter,cross:r.flexStyle.crossOuter,children:[]}),t.children.push(r);e.flexStyle.mainLines=l(e.lines,function(e,t){return Math.max(e,t.main)},0),e.flexStyle.crossLines=l(e.lines,function(e,t){return e+t.cross},0),"auto"===e.flexStyle.main&&(e.flexStyle.main=Math.max(e.flexStyle.mainOffset,e.flexStyle.mainLines+e.flexStyle.mainInnerBefore+e.flexStyle.mainInnerAfter+e.flexStyle.mainBorderBefore+e.flexStyle.mainBorderAfter)),"auto"===e.flexStyle.cross&&(e.flexStyle.cross=Math.max(e.flexStyle.crossOffset,e.flexStyle.crossLines+e.flexStyle.crossInnerBefore+e.flexStyle.crossInnerAfter+e.flexStyle.crossBorderBefore+e.flexStyle.crossBorderAfter)),e.flexStyle.crossSpace=e.flexStyle.cross-e.flexStyle.crossInnerBefore-e.flexStyle.crossInnerAfter-e.flexStyle.crossBorderBefore-e.flexStyle.crossBorderAfter-e.flexStyle.crossLines,e.flexStyle.mainOuter=e.flexStyle.main+e.flexStyle.mainBefore+e.flexStyle.mainAfter,e.flexStyle.crossOuter=e.flexStyle.cross+e.flexStyle.crossBefore+e.flexStyle.crossAfter}},{"../reduce":12}],7:[function(e,t,r){function l(t){for(var r,l=-1;r=t.children[++l];)e("./flex-direction")(r,t.style.flexDirection);e("./flex-direction")(t,t.style.flexDirection),e("./order")(t),e("./flexbox-lines")(t),e("./align-content")(t),l=-1;for(var n;n=t.lines[++l];)n.mainSpace=t.flexStyle.main-t.flexStyle.mainInnerBefore-t.flexStyle.mainInnerAfter-t.flexStyle.mainBorderBefore-t.flexStyle.mainBorderAfter-n.main,e("./flex-grow")(n),e("./flex-shrink")(n),e("./margin-main")(n),e("./margin-cross")(n),e("./justify-content")(n,t.style.justifyContent,t);e("./align-items")(t)}t.exports=l},{"./align-content":1,"./align-items":2,"./flex-direction":3,"./flex-grow":4,"./flex-shrink":5,"./flexbox-lines":6,"./justify-content":8,"./margin-cross":9,"./margin-main":10,"./order":11}],8:[function(e,t,r){t.exports=function(e,t,r){var l,n,o,f=r.flexStyle.mainInnerBefore,i=-1;if("flex-end"===t)for(l=e.mainSpace,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter;else if("center"===t)for(l=e.mainSpace/2,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter;else if("space-between"===t)for(n=e.mainSpace/(e.children.length-1),l=0,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter+n;else if("space-around"===t)for(n=2*e.mainSpace/(2*e.children.length),l=n/2,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter+n;else for(l=0,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter}},{}],9:[function(e,t,r){t.exports=function(e){for(var t,r=-1;t=e.children[++r];){var l=0;"auto"===t.flexStyle.crossBefore&&++l,"auto"===t.flexStyle.crossAfter&&++l;var n=e.cross-t.flexStyle.crossOuter;"auto"===t.flexStyle.crossBefore&&(t.flexStyle.crossBefore=n/l),"auto"===t.flexStyle.crossAfter&&(t.flexStyle.crossAfter=n/l),"auto"===t.flexStyle.cross?t.flexStyle.crossOuter=t.flexStyle.crossOffset+t.flexStyle.crossBefore+t.flexStyle.crossAfter:t.flexStyle.crossOuter=t.flexStyle.cross+t.flexStyle.crossBefore+t.flexStyle.crossAfter}}},{}],10:[function(e,t,r){t.exports=function(e){for(var t,r=0,l=-1;t=e.children[++l];)"auto"===t.flexStyle.mainBefore&&++r,"auto"===t.flexStyle.mainAfter&&++r;if(r>0){for(l=-1;t=e.children[++l];)"auto"===t.flexStyle.mainBefore&&(t.flexStyle.mainBefore=e.mainSpace/r),"auto"===t.flexStyle.mainAfter&&(t.flexStyle.mainAfter=e.mainSpace/r),"auto"===t.flexStyle.main?t.flexStyle.mainOuter=t.flexStyle.mainOffset+t.flexStyle.mainBefore+t.flexStyle.mainAfter:t.flexStyle.mainOuter=t.flexStyle.main+t.flexStyle.mainBefore+t.flexStyle.mainAfter;e.mainSpace=0}}},{}],11:[function(e,t,r){var l=/^(column|row)-reverse$/;t.exports=function(e){e.children.sort(function(e,t){return e.style.order-t.style.order||e.index-t.index}),l.test(e.style.flexDirection)&&e.children.reverse()}},{}],12:[function(e,t,r){function l(e,t,r){for(var l=e.length,n=-1;++n<l;)n in e&&(r=t(r,e[n],n));return r}t.exports=l},{}],13:[function(e,t,r){function l(e){i(f(e))}var n=e("./read"),o=e("./write"),f=e("./readAll"),i=e("./writeAll");t.exports=l,t.exports.read=n,t.exports.write=o,t.exports.readAll=f,t.exports.writeAll=i},{"./read":15,"./readAll":16,"./write":17,"./writeAll":18}],14:[function(e,t,r){function l(e,t,r){var l=e[t],f=String(l).match(o);if(!f){var a=t.match(s);if(a){var c=e["border"+a[1]+"Style"];return"none"===c?0:i[l]||0}return l}var y=f[1],x=f[2];return"px"===x?1*y:"cm"===x?.3937*y*96:"in"===x?96*y:"mm"===x?.3937*y*96/10:"pc"===x?12*y*96/72:"pt"===x?96*y/72:"rem"===x?16*y:n(l,r)}function n(e,t){f.style.cssText="border:none!important;clip:rect(0 0 0 0)!important;display:block!important;font-size:1em!important;height:0!important;margin:0!important;padding:0!important;position:relative!important;width:"+e+"!important",t.parentNode.insertBefore(f,t.nextSibling);var r=f.offsetWidth;return t.parentNode.removeChild(f),r}t.exports=l;var o=/^([-+]?\d*\.?\d+)(%|[a-z]+)$/,f=document.createElement("div"),i={medium:4,none:0,thick:6,thin:2},s=/^border(Bottom|Left|Right|Top)Width$/},{}],15:[function(e,t,r){function l(e){var t={alignContent:"stretch",alignItems:"stretch",alignSelf:"auto",borderBottomStyle:"none",borderBottomWidth:0,borderLeftStyle:"none",borderLeftWidth:0,borderRightStyle:"none",borderRightWidth:0,borderTopStyle:"none",borderTopWidth:0,boxSizing:"content-box",display:"inline",flexBasis:"auto",flexDirection:"row",flexGrow:0,flexShrink:1,flexWrap:"nowrap",justifyContent:"flex-start",height:"auto",marginTop:0,marginRight:0,marginLeft:0,marginBottom:0,paddingTop:0,paddingRight:0,paddingLeft:0,paddingBottom:0,maxHeight:"none",maxWidth:"none",minHeight:0,minWidth:0,order:0,position:"static",width:"auto"},r=e instanceof Element;if(r){var l=e.hasAttribute("data-style"),i=l?e.getAttribute("data-style"):e.getAttribute("style")||"";l||e.setAttribute("data-style",i);var s=window.getComputedStyle&&getComputedStyle(e)||{};f(t,s);var c=e.currentStyle||{};n(t,c),o(t,i);for(var y in t)t[y]=a(t,y,e);var x=e.getBoundingClientRect();t.offsetHeight=x.height||e.offsetHeight,t.offsetWidth=x.width||e.offsetWidth}var S={element:e,style:t};return S}function n(e,t){for(var r in e){var l=r in t;if(l)e[r]=t[r];else{var n=r.replace(/[A-Z]/g,"-$&").toLowerCase(),o=n in t;o&&(e[r]=t[n])}}var f="-js-display"in t;f&&(e.display=t["-js-display"])}function o(e,t){for(var r;r=i.exec(t);){var l=r[1].toLowerCase().replace(/-[a-z]/g,function(e){return e.slice(1).toUpperCase()});e[l]=r[2]}}function f(e,t){for(var r in e){var l=r in t;l&&!s.test(r)&&(e[r]=t[r])}}t.exports=l;var i=/([^\s:;]+)\s*:\s*([^;]+?)\s*(;|$)/g,s=/^(alignSelf|height|width)$/,a=e("./getComputedLength")},{"./getComputedLength":14}],16:[function(e,t,r){function l(e){var t=[];return n(e,t),t}function n(e,t){for(var r,l=o(e),i=[],s=-1;r=e.childNodes[++s];){var a=3===r.nodeType&&!/^\s*$/.test(r.nodeValue);if(l&&a){var c=r;r=e.insertBefore(document.createElement("flex-item"),c),r.appendChild(c)}var y=r instanceof Element;if(y){var x=n(r,t);if(l){var S=r.style;S.display="inline-block",S.position="absolute",x.style=f(r).style,i.push(x)}}}var m={element:e,children:i};return l&&(m.style=f(e).style,t.push(m)),m}function o(e){var t=e instanceof Element,r=t&&e.getAttribute("data-style"),l=t&&e.currentStyle&&e.currentStyle["-js-display"],n=i.test(r)||s.test(l);return n}t.exports=l;var f=e("../read"),i=/(^|;)\s*display\s*:\s*(inline-)?flex\s*(;|$)/i,s=/^(inline-)?flex$/i},{"../read":15}],17:[function(e,t,r){function l(e){o(e);var t=e.element.style,r="inline"===e.mainAxis?["main","cross"]:["cross","main"];t.boxSizing="content-box",t.display="block",t.position="relative",t.width=n(e.flexStyle[r[0]]-e.flexStyle[r[0]+"InnerBefore"]-e.flexStyle[r[0]+"InnerAfter"]-e.flexStyle[r[0]+"BorderBefore"]-e.flexStyle[r[0]+"BorderAfter"]),t.height=n(e.flexStyle[r[1]]-e.flexStyle[r[1]+"InnerBefore"]-e.flexStyle[r[1]+"InnerAfter"]-e.flexStyle[r[1]+"BorderBefore"]-e.flexStyle[r[1]+"BorderAfter"]);for(var l,f=-1;l=e.children[++f];){var i=l.element.style,s="inline"===l.mainAxis?["main","cross"]:["cross","main"];i.boxSizing="content-box",i.display="block",i.position="absolute","auto"!==l.flexStyle[s[0]]&&(i.width=n(l.flexStyle[s[0]]-l.flexStyle[s[0]+"InnerBefore"]-l.flexStyle[s[0]+"InnerAfter"]-l.flexStyle[s[0]+"BorderBefore"]-l.flexStyle[s[0]+"BorderAfter"])),"auto"!==l.flexStyle[s[1]]&&(i.height=n(l.flexStyle[s[1]]-l.flexStyle[s[1]+"InnerBefore"]-l.flexStyle[s[1]+"InnerAfter"]-l.flexStyle[s[1]+"BorderBefore"]-l.flexStyle[s[1]+"BorderAfter"])),i.top=n(l.flexStyle[s[1]+"Start"]),i.left=n(l.flexStyle[s[0]+"Start"]),i.marginTop=n(l.flexStyle[s[1]+"Before"]),i.marginRight=n(l.flexStyle[s[0]+"After"]),i.marginBottom=n(l.flexStyle[s[1]+"After"]),i.marginLeft=n(l.flexStyle[s[0]+"Before"])}}function n(e){return"string"==typeof e?e:Math.max(e,0)+"px"}t.exports=l;var o=e("../flexbox")},{"../flexbox":7}],18:[function(e,t,r){function l(e){for(var t,r=-1;t=e[++r];)n(t)}t.exports=l;var n=e("../write")},{"../write":17}]},{},[13])(13)});
    }

    function patchCaptionator() {

/*
	Captionator 0.6 [CaptionPlanet]
	Christopher Giffard, 2011
	Share and enjoy

	https://github.com/cgiffard/Captionator
*/
/*global HTMLVideoElement: true, NodeList: true, Audio: true, HTMLElement: true, document:true, window:true, XMLHttpRequest:true, navigator:true, VirtualMediaContainer:true */
/*jshint strict:true */
/*Tab indented, tab = 4 spaces*/


/* Build date: Fri Jan 25 2013 15:37:24 GMT+1100 (EST) */

;(function(){
	"use strict";

	//	Variables you might want to tweak
	var minimumFontSize = 10;				//	We don't want the type getting any smaller than this.
	var minimumLineHeight = 16;				//	As above, in points
	var fontSizeVerticalPercentage = 4.5;	//	Caption font size is 4.5% of the video height
	var lineHeightRatio = 1.5;				//	Caption line height is 1.3 times the font size
	var cueBackgroundColour	= [0,0,0,0.5];	//	R,G,B,A
	var objectsCreated = false;				//	We don't want to create objects twice, or instanceof won't work
	
	var captionator = {};
	window.captionator = captionator;

	
	
	// Captionator internal cue structure object
	/**
	* @constructor
	*/
	captionator.CaptionatorCueStructure = function CaptionatorCueStructure(cueSource,options) {
		var cueStructureObject = this;
		this.isTimeDependent = false;
		this.cueSource = cueSource;
		this.options = options;
		this.processedCue = null;
		this.toString = function toString(currentTimestamp) {
			if (options.processCueHTML !== false) {
				var processLayer = function(layerObject,depth) {
					if (cueStructureObject.processedCue === null) {
						var compositeHTML = "", itemIndex, cueChunk;
						for (itemIndex in layerObject) {
							if (itemIndex.match(/^\d+$/) && layerObject.hasOwnProperty(itemIndex)) {
								// We're not a prototype function or local property, and we're in range
								cueChunk = layerObject[itemIndex];
								// Don't generate text from the token if it has no contents
								if (cueChunk instanceof Object && cueChunk.children && cueChunk.children.length) {
									if (cueChunk.token === "v") {
										compositeHTML +="<q data-voice=\"" + cueChunk.voice.replace(/[\"]/g,"") + "\" class='voice " +
														"speaker-" + cueChunk.voice.replace(/[^a-z0-9]+/ig,"-").toLowerCase() + " webvtt-span' " + 
														"title=\"" + cueChunk.voice.replace(/[\"]/g,"") + "\">" +
														processLayer(cueChunk.children,depth+1) +
														"</q>";
									} else if(cueChunk.token === "c") {
										compositeHTML +="<span class='webvtt-span webvtt-class-span " + cueChunk.classes.join(" ") + "'>" +
														processLayer(cueChunk.children,depth+1) +
														"</span>";
									} else if(cueChunk.timeIn > 0) {
										// If a timestamp is unspecified, or the timestamp suggests this token is valid to display, return it
										if ((currentTimestamp === null || currentTimestamp === undefined) ||
											(currentTimestamp > 0 && currentTimestamp >= cueChunk.timeIn)) {
									
											compositeHTML +="<span class='webvtt-span webvtt-timestamp-span' " +
															"data-timestamp='" + cueChunk.token + "' data-timestamp-seconds='" + cueChunk.timeIn + "'>" +
															processLayer(cueChunk.children,depth+1) +
															"</span>";
											
										} else if (currentTimestamp < cueChunk.timeIn) {
											// Deliver tag hidden, with future class
											compositeHTML +="<span class='webvtt-span webvtt-timestamp-span webvtt-cue-future' aria-hidden='true' style='opacity: 0;' " +
															"data-timestamp='" + cueChunk.token + "' data-timestamp-seconds='" + cueChunk.timeIn + "'>" +
															processLayer(cueChunk.children,depth+1) +
															"</span>";
										}
									} else {
										compositeHTML +=cueChunk.rawToken +
														processLayer(cueChunk.children,depth+1) +
														"</" + cueChunk.token + ">";
									}
								} else if (cueChunk instanceof String || typeof(cueChunk) === "string" || typeof(cueChunk) === "number") {
									compositeHTML += cueChunk;
								} else {
									// Didn't match - file a bug!
								}
							}
						}
						
						if (!cueStructureObject.isTimeDependent && depth === 0) {
							cueStructureObject.processedCue = compositeHTML;
						}
					
						return compositeHTML;
					} else {
						return cueStructureObject.processedCue;
					}
				};
				return processLayer(this,0);
			} else {
				return cueSource;
			}
		};
		
		// Now you can get the plain text out of CaptionatorCueStructure.
		// Runs through the parse tree, ignoring tags and just returning the inner text.
		// If you've got processCueHTML explicitly set to false, then it removes HTML tags from the
		// result using a regex.
		
		this.getPlain = function(currentTimestamp) {
			if (options.processCueHTML !== false) {
				var processLayer = function(layerObject,depth) {
					var compositePlain = "", itemIndex, cueChunk;
					for (itemIndex in layerObject) {
						if (itemIndex.match(/^\d+$/) && layerObject.hasOwnProperty(itemIndex)) {
							// We're not a prototype function or local property, and we're in range
							cueChunk = layerObject[itemIndex];
							// Don't generate text from the token if it has no contents
							if (cueChunk instanceof Object && cueChunk.children && cueChunk.children.length) {
								if (cueChunk.timeIn > 0) {
									// If a timestamp is unspecified, or the timestamp suggests this token is valid to display, return it
									if ((currentTimestamp === null || currentTimestamp === undefined) ||
										(currentTimestamp > 0 && currentTimestamp >= cueChunk.timeIn)) {
									
										compositePlain += processLayer(cueChunk.children,depth+1);
									}
								} else {
									compositePlain += processLayer(cueChunk.children,depth+1);
								}
							} else if (cueChunk instanceof String || typeof(cueChunk) === "string" || typeof(cueChunk) === "number") {
								compositePlain += cueChunk;
							}
						}
					}
					
					return compositePlain;
				};
				return processLayer(this,0);
			} else {
				return cueSource.replace(/<[^>]*>/ig,"");
			}
		};
	};
	captionator.CaptionatorCueStructure.prototype = [];
	
	

	
	
	// Set up objects & types
	// As defined by http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html
	/**
	* @constructor
	*/
	captionator.TextTrack = function TextTrack(id,kind,label,language,trackSource,isDefault) {
	
		this.onload = function () {};
		this.onerror = function() {};
		this.oncuechange = function() {};
	
		this.id = id || "";
		this.internalMode = captionator.TextTrack.OFF;
		this.cues = new captionator.TextTrackCueList(this);
		this.activeCues = new captionator.ActiveTextTrackCueList(this.cues,this);
		this.kind = kind || "subtitles";
		this.label = label || "";
		this.language = language || "";
		this.src = trackSource || "";
		this.readyState = captionator.TextTrack.NONE;
		this.internalDefault = isDefault || false;
		
		// Create getters and setters for mode
		this.getMode = function() {
			return this.internalMode;
		};
		
		this.setMode = function(value) {
			var allowedModes = [captionator.TextTrack.OFF,captionator.TextTrack.HIDDEN,captionator.TextTrack.SHOWING], containerID, container;
			if (allowedModes.indexOf(value) !== -1) {
				if (value !== this.internalMode) {
					this.internalMode = value;
			
					if (this.readyState === captionator.TextTrack.NONE && this.src.length > 0 && value > captionator.TextTrack.OFF) {
						this.loadTrack(this.src,null);
					}
					
					// Refresh all captions on video
					this.videoNode._captionator_dirtyBit = true;
					captionator.rebuildCaptions(this.videoNode);
				
					if (value === captionator.TextTrack.OFF) {
						// make sure the resource is reloaded next time (Is this correct behaviour?)
						this.cues.length = 0; // Destroy existing cue data (bugfix)
						this.readyState = captionator.TextTrack.NONE;
					}
				}
			} else {
				throw new Error("Illegal mode value for track: " + value);
			}
		};
	
		// Create getter for default
		this.getDefault = function() {
			return this.internalDefault;
		};
	
		if (Object.prototype.__defineGetter__) {
			this.__defineGetter__("mode", this.getMode);
			this.__defineSetter__("mode", this.setMode);
			this.__defineGetter__("default", this.getDefault);
		} else if (Object.defineProperty) {
			Object.defineProperty(this,"mode",
				{get: this.getMode, set: this.setMode}
			);
			Object.defineProperty(this,"default",
				{get: this.getDefault}
			);
		}
	
		this.loadTrack = function(source, callback) {
			var captionData, ajaxObject = new XMLHttpRequest();
			if (this.readyState === captionator.TextTrack.LOADED) {
				if (callback instanceof Function) {
					callback(captionData);
				}
			} else {
				this.src = source;
				this.readyState = captionator.TextTrack.LOADING;
			
				var currentTrackElement = this;
				ajaxObject.open('GET', source, true);
				ajaxObject.onreadystatechange = function (eventData) {
					if (ajaxObject.readyState === 4) {
						if(ajaxObject.status === 200) {
							var TrackProcessingOptions = currentTrackElement.videoNode._captionatorOptions || {};
							if (currentTrackElement.kind === "metadata") {
								// People can load whatever data they please into metadata tracks.
								// Don't process it.
								TrackProcessingOptions.processCueHTML = false;
								TrackProcessingOptions.sanitiseCueHTML = false;
							}
							
							captionData = captionator.parseCaptions(ajaxObject.responseText,TrackProcessingOptions);
							currentTrackElement.readyState = captionator.TextTrack.LOADED;
							currentTrackElement.cues.loadCues(captionData);
							currentTrackElement.activeCues.refreshCues.apply(currentTrackElement.activeCues);
							currentTrackElement.videoNode._captionator_dirtyBit = true;
							captionator.rebuildCaptions(currentTrackElement.videoNode);
							currentTrackElement.onload.call(this);
						
							if (callback instanceof Function) {
								callback.call(currentTrackElement,captionData);
							}
						} else {
							// Throw error handler, if defined
							currentTrackElement.readyState = captionator.TextTrack.ERROR;
							currentTrackElement.onerror();
						}
					}
				};
				try {
					ajaxObject.send(null);
				} catch(Error) {
					// Throw error handler, if defined
					currentTrackElement.readyState = captionator.TextTrack.ERROR;
					currentTrackElement.onerror(Error);
				}
			}
		};
	
		// mutableTextTrack.addCue(cue)
		// Adds the given cue to mutableTextTrack's text track list of cues.
		// Raises an exception if the argument is null, associated with another text track, or already in the list of cues.
	
		this.addCue = function(cue) {
			if (cue && cue instanceof captionator.TextTrackCue) {
				this.cues.addCue(cue);
			} else {
				throw new Error("The argument is null or not an instance of TextTrackCue.");
			}
		};
	
		// mutableTextTrack.removeCue(cue)
		// Removes the given cue from mutableTextTrack's text track list of cues.
		// Raises an exception if the argument is null, associated with another text track, or not in the list of cues.
	
		this.removeCue = function() {
		
		};
	};
	
	// Define constants for TextTrack.readyState
	captionator.TextTrack.NONE = 0;
	captionator.TextTrack.LOADING = 1;
	captionator.TextTrack.LOADED = 2;
	captionator.TextTrack.ERROR = 3;
	// Define constants for TextTrack.mode
	captionator.TextTrack.OFF = 0;
	captionator.TextTrack.HIDDEN = 1;
	captionator.TextTrack.SHOWING = 2;
	
	

	
	
	/**
	* @constructor
	*/
	captionator.TextTrackCue = function TextTrackCue(id, startTime, endTime, text, settings, pauseOnExit, track) {
		// Set up internal data store
		this.id = id;
		this.track = track instanceof captionator.TextTrack ? track : null;
		this.startTime = parseFloat(startTime);
		this.endTime = parseFloat(endTime) >= this.startTime ? parseFloat(endTime) : this.startTime;
		this.text = typeof(text) === "string" || text instanceof captionator.CaptionatorCueStructure ? text : "";
		this.settings = typeof(settings) === "string" ? settings : "";
		this.intSettings = {};
		this.pauseOnExit = !!pauseOnExit;
		this.wasActive = false;
	
		// Parse settings & set up cue defaults
	
		// A writing direction, either horizontal (a line extends horizontally and is positioned vertically,
		// with consecutive lines displayed below each other), vertical growing left (a line extends vertically
		// and is positioned horizontally, with consecutive lines displayed to the left of each other), or
		// vertical growing right (a line extends vertically and is positioned horizontally, with consecutive
		// lines displayed to the right of each other).
		// Values:
		// horizontal, vertical, vertical-lr
		this.direction = "horizontal";
	
		// A boolean indicating whether the line's position is a line position (positioned to a multiple of the
		// line dimensions of the first line of the cue), or whether it is a percentage of the dimension of the video.
		this.snapToLines = true;
	
		// Either a number giving the position of the lines of the cue, to be interpreted as defined by the
		// writing direction and snap-to-lines flag of the cue, or the special value auto, which means the
		// position is to depend on the other active tracks.
		this.linePosition = "auto";
	
		// A number giving the position of the text of the cue within each line, to be interpreted as a percentage
		// of the video, as defined by the writing direction.
		this.textPosition = 50;
	
		// A number giving the size of the box within which the text of each line of the cue is to be aligned, to
		// be interpreted as a percentage of the video, as defined by the writing direction.
		this.size = 0;
	
		// An alignment for the text of each line of the cue, either start alignment (the text is aligned towards its
		// start side), middle alignment (the text is aligned centered between its start and end sides), end alignment
		// (the text is aligned towards its end side). Which sides are the start and end sides depends on the
		// Unicode bidirectional algorithm and the writing direction. [BIDI]
		// Values:
		// start, middle, end
		this.alignment = "middle";
	
		// Parse VTT Settings...
		if (this.settings.length) {
			var intSettings = this.intSettings;
			var currentCue = this;
			settings = settings.split(/\s+/).filter(function(settingItem) { return settingItem.length > 0;});
			if (settings instanceof Array) {
				settings.forEach(function(cueItem) {
					var settingMap = {"D":"direction","L":"linePosition","T":"textPosition","A":"alignment","S":"size"};
					cueItem = cueItem.split(":");
					if (settingMap[cueItem[0]]) {
						intSettings[settingMap[cueItem[0]]] = cueItem[1];
					}
				
					if (settingMap[cueItem[0]] in currentCue) {
						currentCue[settingMap[cueItem[0]]] = cueItem[1];
					}
				});
			}
		}
		
		if (this.linePosition.match(/\%/)) {
			this.snapToLines = false;
		}
	
		// Functions defined by spec (getters, kindof)
		this.getCueAsSource = function getCueAsSource() {
			// Choosing the below line instead will mean that the raw, unprocessed source will be returned instead.
			// Not really sure which is the correct behaviour.
			// return this.text instanceof captionator.CaptionatorCueStructure? this.text.cueSource : this.text;
			return String(this.text);
		};
	
		this.getCueAsHTML = function getCueAsHTML() {
			var DOMFragment = document.createDocumentFragment();
			var DOMNode = document.createElement("div");
			DOMNode.innerHTML = String(this.text);
			
			Array.prototype.forEach.call(DOMNode.childNodes,function(child) {
				DOMFragment.appendChild(child.cloneNode(true));
			});
		
			return DOMFragment;
		};
	
		this.isActive = function() {
			var currentTime = 0;
			if (this.track instanceof captionator.TextTrack) {
				if ((this.track.mode === captionator.TextTrack.SHOWING || this.track.mode === captionator.TextTrack.HIDDEN) && this.track.readyState === captionator.TextTrack.LOADED) {
					try {
						currentTime = this.track.videoNode.currentTime;
						
						if (this.startTime <= currentTime && this.endTime >= currentTime) {
							// Fire enter event if we were not active and now are
							if (!this.wasActive) {
								this.wasActive = true;
								this.onenter();
							}
	
							return true;
						}
					} catch(Error) {
						return false;
					}
				}
			}
			
			// Fire exit event if we were active and now are not
			if (this.wasActive) {
				this.wasActive = false;
				this.onexit();
			}
	
			return false;
		};
	
		if (Object.prototype.__defineGetter__) {
			this.__defineGetter__("active", this.isActive);
		} else if (Object.defineProperty) {
			Object.defineProperty(this,"active",
				{get: this.isActive}
			);
		}
		
		this.toString = function toString() {
			return "TextTrackCue:" + this.id + "\n" + String(this.text);
		};
		
		// Events defined by spec
		this.onenter = function() {};
		this.onexit = function() {};
	};
	
	

	/**
	* @constructor
	*/
	captionator.TextTrackCueList = function TextTrackCueList(track) {
		this.track = track instanceof captionator.TextTrack ? track : null;
	
		this.getCueById = function(cueID) {
			return this.filter(function(currentCue) {
				return currentCue.id === cueID;
			})[0];
		};
	
		this.loadCues = function(cueData) {
			for (var cueIndex = 0; cueIndex < cueData.length; cueIndex ++) {
				cueData[cueIndex].track = this.track;
				Array.prototype.push.call(this,cueData[cueIndex]);
			}
		};
	
		this.addCue = function(cue) {
			if (cue && cue instanceof captionator.TextTrackCue) {
				if (cue.track === this.track || !cue.track) {
					// TODO: Check whether cue is already in list of cues.
					// TODO: Sort cue list based on TextTrackCue.startTime.
					Array.prototype.push.call(this,cue);
				} else {
					throw new Error("This cue is associated with a different track!");
				}
			} else {
				throw new Error("The argument is null or not an instance of TextTrackCue.");
			}
		};
	
		this.toString = function() {
			return "[TextTrackCueList]";
		};
	};
	captionator.TextTrackCueList.prototype = [];
	
	/**
	* @constructor
	*/
	captionator.ActiveTextTrackCueList = function ActiveTextTrackCueList(textTrackCueList,textTrack) {
		// Among active cues:
	
		// The text track cues of a media element's text tracks are ordered relative to each
		// other in the text track cue order, which is determined as follows: first group the
		// cues by their text track, with the groups being sorted in the same order as their
		// text tracks appear in the media element's list of text tracks; then, within each
		// group, cues must be sorted by their start time, earliest first; then, any cues with
		// the same start time must be sorted by their end time, earliest first; and finally,
		// any cues with identical end times must be sorted in the order they were created (so
		// e.g. for cues from a WebVTT file, that would be the order in which the cues were
		// listed in the file).
	
		this.refreshCues = function() {
			if (textTrackCueList.length) {
				var cueList = this;
				var cueListChanged = false;
				var oldCueList = [].slice.call(this,0);
				this.length = 0;
				
				textTrackCueList.forEach(function(cue) {
					if (cue.active) {
						cueList.push(cue);
	
						if (cueList[cueList.length-1] !== oldCueList[cueList.length-1]) {
							cueListChanged = true;
						}
					}
				});
	
				if (cueListChanged) {
					try {
						textTrack.oncuechange();
					} catch(error){}
				}
			}
		};
	
		this.toString = function() {
			return "[ActiveTextTrackCueList]";
		};
	
		this.refreshCues();
	};
	captionator.ActiveTextTrackCueList.prototype = new captionator.TextTrackCueList(null);

	/**
	* @constructor
	*/
	var VirtualMediaContainer = function(targetObject) {
		this.targetObject = targetObject;
		this.currentTime = 0;
		var timeupdateEventHandler = function() {};
	
		this.addEventListener = function(event,handler,ignore) {
			if (event === "timeupdate" && handler instanceof Function) {
				this.timeupdateEventHandler = handler;
			}
		};
	
		this.attachEvent = function(event,handler) {
			if (event === "timeupdate" && handler instanceof Function) {
				this.timeupdateEventHandler = handler;
			}
		};
	
		this.updateTime = function(newTime) {
			if (!isNaN(newTime)) {
				this.currentTime = newTime;
				timeupdateEventHandler();
			}
		};
		
		
	};

	/*
		captionator.rebuildCaptions(HTMLVideoElement videoElement)
	
		Loops through all the TextTracks for a given element and manages their display (including generation of container elements.)
	
		First parameter: HTMLVideoElement object with associated TextTracks
	
		RETURNS:
	
		Nothing.
	
	*/
	captionator.rebuildCaptions = function(videoElement) {
		var trackList = videoElement.textTracks || [];
		var options = videoElement._captionatorOptions instanceof Object ? videoElement._captionatorOptions : {};
		var currentTime = videoElement.currentTime;
		var compositeActiveCues = [];
		var cuesChanged = false;
		var activeCueIDs = [];
		var cueSortArray = [];
	
		// Work out what cues are showing...
		trackList.forEach(function(track,trackIndex) {
			if (track.mode === captionator.TextTrack.SHOWING && track.readyState === captionator.TextTrack.LOADED) {
				cueSortArray = [].slice.call(track.activeCues,0);
				
				// Do a reverse sort
				// Since the available cue render area is a square which decreases in size
				// (away from each side of the video) with each successive cue added,
				// and we want cues which are older to be displayed above cues which are newer,
				// we sort active cues within each track so that older ones are rendered first.
				
				cueSortArray = cueSortArray.sort(function(cueA, cueB) {
					if (cueA.startTime > cueB.startTime) {
						return -1;
					} else {
						return 1;
					}
				});
				
				compositeActiveCues = compositeActiveCues.concat(cueSortArray);
			}
		});
	
		// Determine whether cues have changed - we generate an ID based on track ID, cue ID, and text length
		activeCueIDs = compositeActiveCues.map(function(cue) {return cue.track.id + "." + cue.id + ":" + cue.text.toString(currentTime).length;});
		cuesChanged = !captionator.compareArray(activeCueIDs,videoElement._captionator_previousActiveCues);
		
		// If they've changed, we re-render our cue canvas.
		if (cuesChanged || videoElement._captionator_dirtyBit) {
			// If dirty bit was set, it certainly isn't now.
			videoElement._captionator_dirtyBit = false;
	
			// Destroy internal tracking variable (which is used for caption rendering)
			videoElement._captionator_availableCueArea = null;
			
			// Internal tracking variable to determine whether our composite active cue list for the video has changed
			videoElement._captionator_previousActiveCues = activeCueIDs;
			
			// Get the canvas ready if it isn't already
			captionator.styleCueCanvas(videoElement);
			
			// Clear old nodes from canvas
			var oldNodes =
				[].slice.call(videoElement._descriptionContainerObject.getElementsByTagName("div"),0)
				.concat([].slice.call(videoElement._containerObject.getElementsByTagName("div"),0));
			
			oldNodes.forEach(function(node) {
				// If the cue doesn't think it's active...
				if (node.cueObject && !node.cueObject.active) {
					
					// Mark cue as not rendered
					node.cueObject.rendered = false;
					
					// Delete node reference
					node.cueObject.domNode = null;
					
					// Delete node
					node.parentElement.removeChild(node);
				}
			});
		
			// Now we render the cues
			compositeActiveCues.forEach(function(cue) {
				var cueNode, cueInner;
				
				if (cue.track.kind !== "metadata" && cue.mode !== captionator.TextTrack.HIDDEN) {
				
					if (!cue.rendered) {
						// Create, ID, and Class all the bits
						cueNode = document.createElement("div");
						cueInner = document.createElement("span");
						cueInner.className = "captionator-cue-inner";
						cueNode.id = String(cue.id).length ? cue.id : captionator.generateID();
						cueNode.className = "captionator-cue";
						cueNode.appendChild(cueInner);
						cueNode.cueObject = cue;
						cue.domNode = cueNode;
					
						// Set the language
						// Will eventually move to a cue-granular method of specifying language
						cueNode.setAttribute("lang",cue.track.language);
					
						// Plonk the cue contents in
						cueNode.currentText = cue.text.toString(currentTime);
						cueInner.innerHTML = cueNode.currentText;
					
						// Mark cue as rendered
						cue.rendered = true;
				
						if (cue.track.kind === "descriptions") {
							// Append descriptions to the hidden descriptive canvas instead
							// No styling required for these.
							videoElement._descriptionContainerObject.appendChild(cueNode);
						} else {
							// Append everything else to the main cue canvas.
							videoElement._containerObject.appendChild(cueNode);
						}
					
					} else {
					
						// If the cue is already rendered, get the node out
						cueNode = cue.domNode;
						cueInner = cueNode.getElementsByClassName("captionator-cue-inner")[0];
					
						// But first check it to determine whether its own content has changed
						if (cue.text.toString(currentTime) !== cueNode.currentText) {
							cueNode.currentText = cue.text.toString(currentTime); 
							cueInner.innerHTML = cueNode.currentText;
						
							// Reset spanning pointer to maintain our layout
							cueInner.spanified = false;
						}
					}
				
					if (cue.track.kind !== "descriptions") {
						// Re-style cue...
						captionator.styleCue(cueNode,cue,videoElement);
					}
				}
			});
		}
	};

	/*
		captionator.captionify([selector string array | DOMElement array | selector string | singular dom element ],
								[defaultLanguage - string in BCP47],
								[options - JS Object])
	
		Adds closed captions to video elements. The first, second and third parameter are both optional.
	
		First parameter: Use an array of either DOMElements or selector strings (compatible with querySelectorAll.)
		All of these elements will be captioned if tracks are available. If this parameter is omitted, all video elements
		present in the DOM will be captioned if tracks are available.
	
		Second parameter: BCP-47 string for default language. If this parameter is omitted, the User Agent's language
		will be used to choose a track.
	
		Third parameter: as yet unused - will implement animation settings and some other global options with this
		parameter later.
	
	
		RETURNS:
	
		False on immediate failure due to input being malformed, otherwise true (even if the process fails later.)
		Because of the asynchronous download requirements, this function can't really return anything meaningful.
	
	
	*/
	captionator.captionify = function(element,defaultLanguage,options) {
		var videoElements = [], elementIndex = 0;
		options = options instanceof Object? options : {};
	
		// Override defaults if options are present...
		if (options.minimumFontSize && typeof(options.minimumFontSize) === "number") {
			minimumFontSize = options.minimumFontSize;
		}
	
		if (options.minimumLineHeight && typeof(options.minimumLineHeight) === "number") {
			minimumLineHeight = options.minimumLineHeight;
		}
		
		if (options.fontSizeVerticalPercentage && typeof(options.fontSizeVerticalPercentage) === "number") {
			fontSizeVerticalPercentage = options.fontSizeVerticalPercentage;
		}
		
		if (options.lineHeightRatio && typeof(options.lineHeightRatio) !== "number") {
			lineHeightRatio = options.lineHeightRatio;
		}
	
		if (options.cueBackgroundColour && options.cueBackgroundColour instanceof Array) {
			cueBackgroundColour = options.cueBackgroundColour;
		}
		
		/* Feature detection block */
		// VirtualMediaContainer is an element designed to provide a media interface to Captionator
		// where the browser doesn't support native HTML5 video (it might wrap a flash movie, for example)
		if (!HTMLVideoElement && !(element instanceof VirtualMediaContainer) && !options.forceCaptionify) {
			// Browser doesn't support HTML5 video - die here.
			return false;
		}
		
		// Browser supports native track API
		// This should catch Chrome latest and IE10.
		if ((typeof(document.createElement("video").addTextTrack) === "function" || typeof(document.createElement("video").addTrack) === "function") && !options.forceCaptionify) {
			return false;
		}
		
		// if requested by options, export the object types
		if (!objectsCreated && options.exportObjects) {
			window.TextTrack = captionator.TextTrack;
			window.TextTrackCueList = captionator.TextTrackCueList;
			window.ActiveTextTrackCueList = captionator.ActiveTextTrackCueList;
			window.TextTrackCue = captionator.TextTrackCue;
			
			// Next time captionator.captionify() is called, the objects are already available to us.
			objectsCreated = true;
		}
	
		if (!element || element === false || element === undefined || element === null) {
			videoElements = [].slice.call(document.getElementsByTagName("video"),0); // select and convert to array
		} else {
			if (element instanceof Array) {
				for (elementIndex = 0; elementIndex < element.length; elementIndex ++) {
					if (typeof(element[elementIndex]) === "string") {
						videoElements = videoElements.concat([].slice.call(document.querySelectorAll(element[elementIndex]),0)); // select and convert to array
					} else if (element[elementIndex].constructor === HTMLVideoElement) {
						videoElements.push(element[elementIndex]);
					}
				}
			} else if (typeof(element) === "string") {
				videoElements = [].slice.call(document.querySelectorAll(element),0); // select and convert to array
			} else if (element.constructor === HTMLVideoElement) {
				videoElements.push(element);
			}
		}
		
		if (videoElements.length) {
			videoElements.forEach(function(videoElement) {
				videoElement.addTextTrack = function(id,kind,label,language,src,type,isDefault) {
					var allowedKinds = ["subtitles","captions","descriptions","captions","metadata","chapters"]; // WHATWG SPEC
					
					var textKinds = allowedKinds.slice(0,7);
					var newTrack;
					id = typeof(id) === "string" ? id : "";
					label = typeof(label) === "string" ? label : "";
					language = typeof(language) === "string" ? language : "";
					isDefault = typeof(isDefault) === "boolean" ? isDefault : false; // Is this track set as the default?
	
					// If the kind isn't known, throw DOM syntax error exception
					if (!allowedKinds.filter(function (currentKind){
							return kind === currentKind ? true : false;
						}).length) {
						throw captionator.createDOMException(12,"DOMException 12: SYNTAX_ERR: You must use a valid kind when creating a TimedTextTrack.","SYNTAX_ERR");
	
					} else {
						newTrack = new captionator.TextTrack(id,kind,label,language,src,null);
						if (newTrack) {
							if (!(videoElement.textTracks instanceof Array)) {
								videoElement.textTracks = [];
							}
	
							videoElement.textTracks.push(newTrack);
							return newTrack;
						} else {
							return false;
						}
					}
				};
	
				captionator.processVideoElement(videoElements[elementIndex],defaultLanguage,options);
			});
	
			return true;
		} else {
			return false;
		}
	};

	/*
		captionator.parseCaptions(string captionData, object options)
	
		Accepts and parses SRT caption/subtitle data. Will extend for WebVTT shortly. Perhaps non-JSON WebVTT will work already?
		This function has been intended from the start to (hopefully) loosely parse both. I'll patch it as required.
	
		First parameter: Entire text data (UTF-8) of the retrieved SRT/WebVTT file. This parameter is mandatory. (really - what did
		you expect it was going to do without it!)
	
		Second parameter: Captionator internal options object. See the documentation for allowed values.
	
		RETURNS:
	
		An array of TextTrackCue Objects in initial state.
	*/
	
	
	
	
	captionator.parseCaptions = function(captionData, options) {
		// Be liberal in what you accept from others...
		options = options instanceof Object ? options : {};
		var fileType = "", subtitles = [];
		var cueStyles = "";
		var cueDefaults = [];
	
		// Set up timestamp parsers - SRT does WebVTT timestamps as well.
		var SUBTimestampParser			= /^(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\,(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\s*(.*)/;
		var SBVTimestampParser			= /^(\d+)?:?(\d{2}):(\d{2})\.(\d+)\,(\d+)?:?(\d{2}):(\d{2})\.(\d+)\s*(.*)/;
		var SRTTimestampParser			= /^(\d{2})?:?(\d{2}):(\d{2})[\.\,](\d+)\s+\-\-\>\s+(\d{2})?:?(\d{2}):(\d{2})[\.\,](\d+)\s*(.*)/;
		var SRTChunkTimestampParser		= /(\d{2})?:?(\d{2}):(\d{2})[\.\,](\d+)/;
		var GoogleTimestampParser		= /^([\d\.]+)\s+\+([\d\.]+)\s*(.*)/;
		var LRCTimestampParser			= /^\[(\d{2})?:?(\d{2})\:(\d{2})\.(\d{2,3})\]\s*(.*?)$/;
		var WebVTTDEFAULTSCueParser		= /^(DEFAULTS|DEFAULT)\s+\-\-\>\s+(.*)/g;
		var WebVTTSTYLECueParser		= /^(STYLE|STYLES)\s+\-\-\>\s*\n([\s\S]*)/g;
		var WebVTTCOMMENTCueParser		= /^(COMMENT|COMMENTS)\s+\-\-\>\s+(.*)/g;
		var TTMLCheck					= /<tt\s+xml/ig;
		var TTMLTimestampParserAdv		= /^(\d{2})?:?(\d{2}):(\d{2})\.(\d+)/;
		var TTMLTimestampParserHuman	= /^([\d\.]+)[smhdwy]/ig; // Under development, will need to study TTML spec more. :)
		
		if (captionData) {
			// This function parses and validates cue HTML/VTT tokens, and converts them into something understandable to the renderer.
			var processCaptionHTML = function processCaptionHTML(inputHTML) {
				var cueStructure = new captionator.CaptionatorCueStructure(inputHTML,options),
					cueSplit = [],
					splitIndex,
					currentToken,
					currentContext,
					stack = [],
					stackIndex = 0,
					chunkTimestamp,
					timeData,
					lastCueTime; // Useful for LRC, which does not specify an end time
				
				var hasRealTextContent = function(textInput) {
					return !!textInput.replace(/[^a-z0-9]+/ig,"").length;
				};
				
				// Process out special cue spans
				cueSplit = inputHTML.split(/(<\/?[^>]+>)/ig);
				
				currentContext = cueStructure;
				for (splitIndex in cueSplit) {
					if (cueSplit.hasOwnProperty(splitIndex)) {
						currentToken = cueSplit[splitIndex];
						
						if (currentToken.substr(0,1) === "<") {
							if (currentToken.substr(1,1) === "/") {
								// Closing tag
								var TagName = currentToken.substr(2).split(/[\s>]+/g)[0];
								if (stack.length > 0) {
									// Scan backwards through the stack to determine whether we've got an open tag somewhere to close.
									var stackScanDepth = 0;
									for (stackIndex = stack.length-1; stackIndex >= 0; stackIndex --) {
										var parentContext = stack[stackIndex][stack[stackIndex].length-1];
										stackScanDepth = stackIndex;
										if (parentContext.token === TagName) { break; }
									}
								
									currentContext = stack[stackScanDepth];
									stack = stack.slice(0,stackScanDepth);
								} else {
									// Tag mismatch!
								}
							} else {
								// Opening Tag
								// Check whether the tag is valid according to the WebVTT specification
								// If not, don't allow it (unless the sanitiseCueHTML option is explicitly set to false)
							
								if ((	currentToken.substr(1).match(SRTChunkTimestampParser)	||
										currentToken.match(/^<v\s+[^>]+>/i)						||
										currentToken.match(/^<c[a-z0-9\-\_\.]+>/)				||
										currentToken.match(/^<(b|i|u|ruby|rt)>/))				||
									options.sanitiseCueHTML !== false) {
									
									var tmpObject = {
										"token":	currentToken.replace(/[<\/>]+/ig,"").split(/[\s\.]+/)[0],
										"rawToken":	currentToken,
										"children":	[]
									};
									
									if (tmpObject.token === "v") {
										tmpObject.voice = currentToken.match(/^<v\s*([^>]+)>/i)[1];
									} else if (tmpObject.token === "c") {
										tmpObject.classes = currentToken
																.replace(/[<\/>\s]+/ig,"")
																.split(/[\.]+/ig)
																.slice(1)
																.filter(hasRealTextContent);
									} else if (!!(chunkTimestamp = tmpObject.rawToken.match(SRTChunkTimestampParser))) {
										cueStructure.isTimeDependent = true;
										timeData = chunkTimestamp.slice(1);
										tmpObject.timeIn =	parseInt((timeData[0]||0) * 60 * 60,10) +	// Hours
															parseInt((timeData[1]||0) * 60,10) +		// Minutes
															parseInt((timeData[2]||0),10) +				// Seconds
															parseFloat("0." + (timeData[3]||0));		// MS
									}
								
									currentContext.push(tmpObject);
									stack.push(currentContext);
									currentContext = tmpObject.children;
								}
							}
						} else {
							// Text string
							if (options.sanitiseCueHTML !== false) {
								currentToken = currentToken
												.replace(/</g,"&lt;")
												.replace(/>/g,"&gt;")
												.replace(/\&/g,"&amp;");
								
								if (!options.ignoreWhitespace) {
									currentToken = currentToken.replace(/\n+/g,"<br />");
								}
							}
						
							currentContext.push(currentToken);
						}
					}
				}
	
				return cueStructure;
			};
			
			// This function takes chunks of text representing cues, and converts them into cue objects.
			var parseCaptionChunk = function parseCaptionChunk(subtitleElement,objectCount) {
				var subtitleParts, timeIn, timeOut, html, timeData, subtitlePartIndex, cueSettings = "", id, specialCueData;
				var timestampMatch, tmpCue;
	
				// WebVTT Special Cue Logic
				if ((specialCueData = WebVTTDEFAULTSCueParser.exec(subtitleElement))) {
					cueDefaults = specialCueData.slice(2).join("");
					cueDefaults = cueDefaults.split(/\s+/g).filter(function(def) { return def && !!def.length; });
					return null;
				} else if ((specialCueData = WebVTTSTYLECueParser.exec(subtitleElement))) {
					cueStyles += specialCueData[specialCueData.length-1];
					return null;
				} else if ((specialCueData = WebVTTCOMMENTCueParser.exec(subtitleElement))) {
					return null; // At this stage, we don't want to do anything with these.
				}
	
				if (fileType === "LRC") {
					subtitleParts = [
						subtitleElement.substr(0,subtitleElement.indexOf("]")+1),
						subtitleElement.substr(subtitleElement.indexOf("]")+1)
					];
				} else {
					subtitleParts = subtitleElement.split(/\n/g);
				}
			
				// Trim off any blank lines (logically, should only be max. one, but loop to be sure)
				while (!subtitleParts[0].replace(/\s+/ig,"").length && subtitleParts.length > 0) {
					subtitleParts.shift();
				}
			
				if (subtitleParts[0].match(/^\s*[a-z0-9\-]+\s*$/ig)) {
					// The identifier becomes the cue ID (when *we* load the cues from file. Programatically created cues can have an ID of whatever.)
					id = String(subtitleParts.shift().replace(/\s*/ig,""));
				} else {
					// We're not parsing a format with an ID prior to each caption like SRT or WebVTT
					id = objectCount;
				}
			
				for (subtitlePartIndex = 0; subtitlePartIndex < subtitleParts.length; subtitlePartIndex ++) {
					var timestamp = subtitleParts[subtitlePartIndex];
					
					if ((timestampMatch = SRTTimestampParser.exec(timestamp)) ||
						(timestampMatch = SUBTimestampParser.exec(timestamp)) ||
						(timestampMatch = SBVTimestampParser.exec(timestamp))) {
						
						// WebVTT / SRT / SUB (VOBSub) / YouTube SBV style timestamp
						
						timeData = timestampMatch.slice(1);
						
						timeIn =	parseInt((timeData[0]||0) * 60 * 60,10) +	// Hours
									parseInt((timeData[1]||0) * 60,10) +		// Minutes
									parseInt((timeData[2]||0),10) +				// Seconds
									parseFloat("0." + (timeData[3]||0));		// MS
						
						timeOut =	parseInt((timeData[4]||0) * 60 * 60,10) +	// Hours
									parseInt((timeData[5]||0) * 60,10) +		// Minutes
									parseInt((timeData[6]||0),10) +				// Seconds
									parseFloat("0." + (timeData[7]||0));		// MS
						
						if (timeData[8]) {
							cueSettings = timeData[8];
						}
				
					} else if (!!(timestampMatch = GoogleTimestampParser.exec(timestamp))) {
						
						// Google's proposed WebVTT timestamp style
						timeData = timestampMatch.slice(1);
						
						timeIn = parseFloat(timeData[0]);
						timeOut = timeIn + parseFloat(timeData[1]);
	
						if (timeData[2]) {
							cueSettings = timeData[2];
						}
	
					} else if (!!(timestampMatch = LRCTimestampParser.exec(timestamp))) {
						timeData = timestampMatch.slice(1,timestampMatch.length-1);
	
						timeIn =	parseInt((timeData[0]||0) * 60 * 60,10) +	// Hours
									parseInt((timeData[1]||0) * 60,10) +		// Minutes
									parseInt((timeData[2]||0),10) +				// Seconds
									parseFloat("0." + (timeData[3]||0));		// MS
						
						timeOut = timeIn;
					}
					
					// We've got the timestamp - return all the other unmatched lines as the raw subtitle data
					subtitleParts = subtitleParts.slice(0,subtitlePartIndex).concat(subtitleParts.slice(subtitlePartIndex+1));
					break;
				}
	
				if (!timeIn && !timeOut) {
					// We didn't extract any time information. Assume the cue is invalid!
					return null;
				}
	
				// Consolidate cue settings, convert defaults to object
				var compositeCueSettings =
					cueDefaults
						.reduce(function(previous,current,index,array){
							previous[current.split(":")[0]] = current.split(":")[1];
							return previous;
						},{});
				
				// Loop through cue settings, replace defaults with cue specific settings if they exist
				compositeCueSettings =
					cueSettings
						.split(/\s+/g)
						.filter(function(set) { return set && !!set.length; })
						// Convert array to a key/val object
						.reduce(function(previous,current,index,array){
							previous[current.split(":")[0]] = current.split(":")[1];
							return previous;
						},compositeCueSettings);
				
				// Turn back into string like the TextTrackCue constructor expects
				cueSettings = "";
				for (var key in compositeCueSettings) {
					if (compositeCueSettings.hasOwnProperty(key)) {
						cueSettings += !!cueSettings.length ? " " : "";
						cueSettings += key + ":" + compositeCueSettings[key];
					}
				}
				
				// The remaining lines are the subtitle payload itself (after removing an ID if present, and the time);
				html = options.processCueHTML === false ? subtitleParts.join("\n") : processCaptionHTML(subtitleParts.join("\n"));
				tmpCue = new captionator.TextTrackCue(id, timeIn, timeOut, html, cueSettings, false, null);
				tmpCue.styleData = cueStyles;
				return tmpCue;
			};
			
			var processTTMLTimestamp = function processTTMLTimestamp(timestamp)  {
				var timeData, timeValue = 0;
				if (typeof(timestamp) !== "string") return 0;
	
				if ((timeData = TTMLTimestampParserAdv.exec(timestamp))) {
					timeData = timeData.slice(1);
					timeValue =	parseInt((timeData[0]||0) * 60 * 60,10) +	// Hours
								parseInt((timeData[1]||0) * 60,10) +		// Minutes
								parseInt((timeData[2]||0),10) +				// Seconds
								parseFloat("0." + (timeData[3]||0));		// MS
				}
	
				return timeValue;
			};
	
			var parseXMLChunk = function parseXMLChunk(xmlNode,index) {
				var timeDataIn, timeDataOut, html, tmpCue, timeIn = 0, timeOut = 0;
				var timestampIn = String(xmlNode.getAttribute("begin"));
				var timestampOut = String(xmlNode.getAttribute("end"));
				var id = xmlNode.getAttribute("id") || index;
	
				timeIn = processTTMLTimestamp(timestampIn);
				timeOut = processTTMLTimestamp(timestampOut);
	
				html = options.processCueHTML === false ? xmlNode.innerHTML : processCaptionHTML(xmlNode.innerHTML);
				return new captionator.TextTrackCue(id, timeIn, timeOut, html, {}, false, null);
			};
	
			// Begin parsing --------------------
			subtitles = captionData
							.replace(/\r\n/g,"\n")
							.replace(/\r/g,"\n");
			
			if (TTMLCheck.exec(captionData)) {
				// We're dealing with TTML
				// Simple, ugly way of getting QSA on our data.
				var TTMLElement = document.createElement("ttml");
				TTMLElement.innerHTML = captionData;
	
				var captionElements = [].slice.call(TTMLElement.querySelectorAll("[begin],[end]"),0);
				var captions = captionElements.map(parseXMLChunk);
				
				return captions;
			} else {
				// We're dealing with a line-based format
				// Check whether any of the lines match an LRC format
	
				if (captionData.split(/\n+/g).reduce(function(prev,current,index,array) {
						return prev || !!LRCTimestampParser.exec(current);
					},false)) {
					
					// LRC file... split by single line
					subtitles = subtitles.split(/\n+/g);
					fileType = "LRC";
				} else {
					subtitles = subtitles.split(/\n\n+/g);
				}
				
				subtitles = subtitles.filter(function(lineGroup) {
									if (lineGroup.match(/^WEBVTT(\s*FILE)?/ig)) {
										fileType = "WebVTT";
										return false;
									} else {
										if (lineGroup.replace(/\s*/ig,"").length) {
											return true;
										}
										return false;
									}
								})
								.map(parseCaptionChunk)
								.filter(function(cue) {
									// In the parseCaptionChunk function, we return null for special and malformed cues,
									// and cues we want to ignore, rather than expose to JS. Filter these out now.
									if (cue !== null) {
										return true;
									}
	
									return false;
								});
				
				if (fileType === "LRC") {
					// Post-process to get appropriate end-times for LRC cues
					// LRC cue end times are not explicitly set, they are
					// implicit based on the start time of the next cue.
					// We also then do a pass to strip blank cues.
	
					subtitles
						.forEach(function(cue,index) {
							var thisCueStartTime = 0, lastCue;
							if (index > 0) {
								thisCueStartTime = cue.startTime;
								lastCue = subtitles[--index];
	
								if (lastCue.endTime < thisCueStartTime) {
									lastCue.endTime = thisCueStartTime;
								}
							}
						});
					
					subtitles = subtitles.filter(function(cue) {
							if (cue.text.toString().replace(/\s*/,"").length > 0) {
								return true;
							}
	
							return false;
						});
				}
	
				return subtitles;
			}
	
			return [];
		} else {
			throw new Error("Required parameter captionData not supplied.");
		}
	};

	/*
		captionator.processVideoElement(videoElement <HTMLVideoElement>,
								[defaultLanguage - string in BCP47],
								[options - JS Object])
	
		Processes track items within an HTMLVideoElement. The second and third parameter are both optional.
	
		First parameter: Mandatory HTMLVideoElement object.
	
		Second parameter: BCP-47 string for default language. If this parameter is omitted, the User Agent's language
		will be used to choose a track.
	
		Third parameter: as yet unused - will implement animation settings and some other global options with this
		parameter later.
	
		RETURNS:
	
		Reference to the HTMLVideoElement.
	
	
	*/
	
	captionator.processVideoElement = function(videoElement,defaultLanguage,options) {
		var trackList = [];
		var language = navigator.language || navigator.userLanguage;
		var globalLanguage = defaultLanguage || language.split("-")[0];
		options = options instanceof Object? options : {};
	
		if (!videoElement.captioned) {
			videoElement._captionatorOptions = options;
			videoElement.className += (videoElement.className.length ? " " : "") + "captioned";
			videoElement.captioned = true;
		
			// Check whether video element has an ID. If not, create one
			if (videoElement.id.length === 0) {
				videoElement.id = captionator.generateID();
			}
		
			var enabledDefaultTrack = false;
			[].slice.call(videoElement.querySelectorAll("track"),0).forEach(function(trackElement) {
				var sources = null;
				if (trackElement.querySelectorAll("source").length > 0) {
					sources = trackElement.querySelectorAll("source");
				} else {
					sources = trackElement.getAttribute("src");
				}
			
				var trackObject = videoElement.addTextTrack(
										(trackElement.getAttribute("id")||captionator.generateID()),
										trackElement.getAttribute("kind"),
										trackElement.getAttribute("label"),
										trackElement.getAttribute("srclang").split("-")[0],
										sources,
										trackElement.getAttribute("type"),
										trackElement.hasAttribute("default")); // (Christopher) I think we can get away with this given it's a boolean attribute anyway
			
				trackElement.track = trackObject;
				trackObject.trackNode = trackElement;
				trackObject.videoNode = videoElement;
				trackList.push(trackObject);
			
				// Now determine whether the track is visible by default.
				// The comments in this section come straight from the spec...
				var trackEnabled = false;
				
				// If the text track kind is subtitles or captions and the user has indicated an interest in having a track
				// with this text track kind, text track language, and text track label enabled, and there is no other text track
				// in the media element's list of text tracks with a text track kind of either subtitles or captions whose text track mode is showing
				// ---> Let the text track mode be showing.
				
				if ((trackObject.kind === "subtitles" || trackObject.kind === "captions") &&
					(defaultLanguage === trackObject.language && options.enableCaptionsByDefault)) {
					if (!trackList.filter(function(trackObject) {
							if ((trackObject.kind === "captions" || trackObject.kind === "subtitles") && defaultLanguage === trackObject.language && trackObject.mode === captionator.TextTrack.SHOWING) {
								return true;
							} else {
								return false;
							}
						}).length) {
						trackEnabled = true;
					}
				}
				
				// If the text track kind is chapters and the text track language is one that the user agent has reason to believe is
				// appropriate for the user, and there is no other text track in the media element's list of text tracks with a text track
				// kind of chapters whose text track mode is showing
				// ---> Let the text track mode be showing.
				
				if (trackObject.kind === "chapters" && (defaultLanguage === trackObject.language)) {
					if (!trackList.filter(function(trackObject) {
							if (trackObject.kind === "chapters" && trackObject.mode === captionator.TextTrack.SHOWING) {
								return true;
							} else {
								return false;
							}
						}).length) {
						trackEnabled = true;
					}
				}
				
				// If the text track kind is descriptions and the user has indicated an interest in having text descriptions
				// with this text track language and text track label enabled, and there is no other text track in the media element's
				// list of text tracks with a text track kind of descriptions whose text track mode is showing
				
				if (trackObject.kind === "descriptions" && (options.enableDescriptionsByDefault === true) && (defaultLanguage === trackObject.language)) {
					if (!trackList.filter(function(trackObject) {
							if (trackObject.kind === "descriptions" && trackObject.mode === captionator.TextTrack.SHOWING) {
								return true;
							} else {
								return false;
							}
						}).length) {
						trackEnabled = true;
					}
				}
				
				// If there is a text track in the media element's list of text tracks whose text track mode is showing by default,
				// the user agent must furthermore change that text track's text track mode to hidden.
				
				if (trackEnabled === true) {
					trackList.forEach(function(trackObject) {
						if(trackObject.trackNode.hasAttribute("default") && trackObject.mode === captionator.TextTrack.SHOWING) {
							trackObject.mode = captionator.TextTrack.HIDDEN;
						}
					});
				}
			
				// If the track element has a default attribute specified, and there is no other text track in the media element's
				// list of text tracks whose text track mode is showing or showing by default
				// Let the text track mode be showing by default.
			
				if (trackElement.hasAttribute("default")) {
					if (!trackList.filter(function(trackObject) {
							if (trackObject.trackNode.hasAttribute("default") && trackObject.trackNode !== trackElement) {
								return true;
							} else {
								return false;
							}
						}).length) {
						trackEnabled = true;
						trackObject.internalDefault = true;
					}
				}
			
				// Otherwise
				// Let the text track mode be disabled.
			
				if (trackEnabled === true) {
					trackObject.mode = captionator.TextTrack.SHOWING;
				}
			});
			
			videoElement.addEventListener("timeupdate", function(eventData){
				var videoElement = eventData.target;
				// update active cues
				try {
					videoElement.textTracks.forEach(function(track) {
						track.activeCues.refreshCues.apply(track.activeCues);
					});
				} catch(error) {}
			
				// External renderer?
				if (options.renderer instanceof Function) {
					options.renderer.call(captionator,videoElement);
				} else {
					captionator.rebuildCaptions(videoElement);
				}
			}, false);
			
			window.addEventListener("resize", function(eventData) {
				videoElement._captionator_dirtyBit = true; // mark video as dirty, force captionator to rerender captions
				captionator.rebuildCaptions(videoElement);
			},false);
	
			// Hires mode
			if (options.enableHighResolution === true) {
				window.setInterval(function captionatorHighResProcessor() {
					try {
						videoElement.textTracks.forEach(function(track) {
							track.activeCues.refreshCues.apply(track.activeCues);
						});
					} catch(error) {}
				
					// External renderer?
					if (options.renderer instanceof Function) {
						options.renderer.call(captionator,videoElement);
					} else {
						captionator.rebuildCaptions(videoElement);
					}
				},20);
			}
		}
	
		return videoElement;
	};

	/*
		captionator.getNodeMetrics(DOMNode)
	
		Calculates and returns a number of sizing and position metrics from a DOMNode of any variety (though this function is intended
		to be used with HTMLVideoElements.) Returns the height of the default controls on a video based on user agent detection
		(As far as I know, there's no way to dynamically calculate the height of browser UI controls on a video.)
	
		First parameter: DOMNode from which to calculate sizing metrics. This parameter is mandatory.
	
		RETURNS:
	
		An object with the following properties:
			left: The calculated left offset of the node
			top: The calculated top offset of the node
			height: The calculated height of the node
			width: The calculated with of the node
			controlHeight: If the node is a video and has the `controls` attribute present, the height of the UI controls for the video. Otherwise, zero.
	
	*/
	
	captionator.getNodeMetrics = function(DOMNode) {
		var nodeComputedStyle = window.getComputedStyle(DOMNode,null);
		var offsetObject = DOMNode;
		var offsetTop = DOMNode.offsetTop, offsetLeft = DOMNode.offsetLeft;
		var width = DOMNode, height = 0;
		var controlHeight = 0;
		
		width = parseInt(nodeComputedStyle.getPropertyValue("width"),10);
		height = parseInt(nodeComputedStyle.getPropertyValue("height"),10);
		
		// Slightly verbose expression in order to pass JSHint
		while (!!(offsetObject = offsetObject.offsetParent)) {
			offsetTop += offsetObject.offsetTop;
			offsetLeft += offsetObject.offsetLeft;
		}
	
		if (DOMNode.hasAttribute("controls")) {
			// Get heights of default control strip in various browsers
			// There could be a way to measure this live but I haven't thought/heard of it yet...
			var UA = navigator.userAgent.toLowerCase();
			if (UA.indexOf("chrome") !== -1) {
				controlHeight = 32;
			} else if (UA.indexOf("opera") !== -1) {
				controlHeight = 25;
			} else if (UA.indexOf("firefox") !== -1) {
				controlHeight = 28;
			} else if (UA.indexOf("ie 9") !== -1 || UA.indexOf("ipad") !== -1) {
				controlHeight = 44;
			} else if (UA.indexOf("safari") !== -1) {
				controlHeight = 25;
			}
		} else if (DOMNode._captionatorOptions) {
			var tmpCaptionatorOptions = DOMNode._captionatorOptions;
			if (tmpCaptionatorOptions.controlHeight) {
				controlHeight = parseInt(tmpCaptionatorOptions.controlHeight,10);
			}
		}
	
		return {
			left: offsetLeft,
			top: offsetTop,
			width: width,
			height: height,
			controlHeight: controlHeight
		};
	};
	
	/*
		captionator.applyStyles(DOMNode, Style Object)
	
		A fast way to apply multiple CSS styles to a DOMNode.
	
		First parameter: DOMNode to style. This parameter is mandatory.
	
		Second parameter: A key/value object where the keys are camel-cased variants of CSS property names to apply,
		and the object values are CSS property values as per the spec. This parameter is mandatory.
	
		RETURNS:
	
		Nothing.
	
	*/
	
	captionator.applyStyles = function(StyleNode, styleObject) {
		for (var styleName in styleObject) {
			if ({}.hasOwnProperty.call(styleObject, styleName)) {
				StyleNode.style[styleName] = styleObject[styleName];
			}
		}
	};
	
	/*
		captionator.checkDirection(text)
	
		Determines whether the text string passed into the function is an RTL (right to left) or LTR (left to right) string.
	
		First parameter: Text string to check. This parameter is mandatory.
	
		RETURNS:
	
		The text string 'rtl' if the text is a right to left string, 'ltr' if the text is a left to right string, or an empty string
		if the direction could not be determined.
	
	*/
	captionator.checkDirection = function(text) {
		// Inspired by http://www.frequency-decoder.com/2008/12/12/automatically-detect-rtl-text
		// Thanks guys!
		var ltrChars            = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
			rtlChars            = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
			ltrDirCheckRe       = new RegExp('^[^'+rtlChars+']*['+ltrChars+']'),
			rtlDirCheckRe       = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');
	
		return !!rtlDirCheckRe.test(text) ? 'rtl' : (!!ltrDirCheckRe.test(text) ? 'ltr' : '');
	};
	
	/*
		captionator.styleCue(DOMNode, cueObject, videoNode)
	
		Styles and positions cue nodes according to the WebVTT specification.
	
		First parameter: The DOMNode representing the cue to style. This parameter is mandatory.
	
		Second parameter: The TextTrackCue itself.
	
		Third Parameter: The HTMLVideoElement with which the cue is associated. This parameter is mandatory.
	
		RETURNS:
	
		Nothing.
	
	*/
	captionator.styleCue = function(DOMNode, cueObject, videoElement) {
		// Variables for maintaining render calculations
		var cueX = 0, cueY = 0, cueWidth = 0, cueHeight = 0, cueSize, cueAlignment, cuePaddingLR = 0, cuePaddingTB = 0;
		var baseFontSize, basePixelFontSize, baseLineHeight, tmpHeightExclusions;
		var videoHeightInLines, videoWidthInLines, pixelLineHeight, verticalPixelLineHeight, charactersPerLine = 0, characterCount = 0;
		var characters = 0, lineCount = 0, finalLineCharacterCount = 0, finalLineCharacterHeight = 0, currentLine = 0;
		var characterX, characterY, characterPosition = 0;
		var options = videoElement._captionatorOptions || {};
		var videoMetrics;
		var maxCueSize = 100, internalTextPosition = 50, textBoundingBoxWidth = 0, textBoundingBoxPercentage = 0, autoSize = true;
		var plainCueText = "", plainCueTextContainer;
		
		// In future, support cue-granular language detection method
		var cueLanguage = cueObject.track.language;
		
		// Function to facilitate vertical text alignments in browsers which do not support writing-mode
		// (sadly, all the good ones!)
		var spanify = function(DOMNode) {
			if (DOMNode.spanified) return DOMNode.characterCount;
			
			var stringHasLength = function(textString) { return !!textString.length; };
			var spanCode = "<span class='captionator-cue-character'>";
			var nodeIndex, currentNode, currentNodeValue, replacementFragment, characterCount = 0;
			var styleSpan = function(span) {
				characterCount ++;
				captionator.applyStyles(span,{
					"display":		"block",
					"lineHeight":	"auto",
					"height":		basePixelFontSize + "px",
					"width":		verticalPixelLineHeight + "px",
					"textAlign":	"center"
				});
			};
			
			for (nodeIndex in DOMNode.childNodes) {
				if (DOMNode.childNodes.hasOwnProperty(nodeIndex) && !DOMNode.childNodes[nodeIndex].nospan) {
					currentNode = DOMNode.childNodes[nodeIndex];
					if (currentNode.nodeType === 3) {
						replacementFragment = document.createDocumentFragment();
						currentNodeValue = currentNode.nodeValue;
						
						replacementFragment.appendChild(document.createElement("span"));
						
						replacementFragment.childNodes[0].innerHTML =
								spanCode +
								currentNodeValue
									.split(/(.)/)
									.filter(stringHasLength)
									.join("</span>" + spanCode) +
								"</span>";
						
						[].slice.call(replacementFragment.querySelectorAll("span.captionator-cue-character"),0).forEach(styleSpan);
						
						currentNode.parentNode.replaceChild(replacementFragment,currentNode);
					} else if (DOMNode.childNodes[nodeIndex].nodeType === 1) {
						characterCount += spanify(DOMNode.childNodes[nodeIndex]);
					}
				}
			}
			
			// We have to know when we've already split this thing up into spans,
			// so we don't end up creating more and more sub-spans when we restyle the node
			DOMNode.characterCount = characterCount;
			DOMNode.spanified = true;
			
			return characterCount;
		};
	
		// Set up the cue canvas
		videoMetrics = captionator.getNodeMetrics(videoElement);
		
		// Define storage for the available cue area, diminished as further cues are added
		// Cues occupy the largest possible area they can, either by width or height
		// (depending on whether the `direction` of the cue is vertical or horizontal)
		// Cues which have an explicit position set do not detract from this area.
		// It is the subtitle author's responsibility to ensure they don't overlap if
		// they decide to override default positioning!
		
		if (!videoElement._captionator_availableCueArea) {
			videoElement._captionator_availableCueArea = {
				"bottom": (videoMetrics.height-videoMetrics.controlHeight),
				"right": videoMetrics.width,
				"top": 0,
				"left": 0,
				"height": (videoMetrics.height-videoMetrics.controlHeight),
				"width": videoMetrics.width
			};
		}
	
		if (cueObject.direction === "horizontal") {
			// Calculate text bounding box
			// (isn't useful for vertical cues, because we're doing all glyph positioning ourselves.)
			captionator.applyStyles(DOMNode,{
				"width": "auto",
				"position": "static",
				"display": "inline-block",
				"padding": "1em"
			});
	
			textBoundingBoxWidth = parseInt(DOMNode.offsetWidth,10);
			textBoundingBoxPercentage = Math.floor((textBoundingBoxWidth / videoElement._captionator_availableCueArea.width) * 100);
			textBoundingBoxPercentage = textBoundingBoxPercentage <= 100 ? textBoundingBoxPercentage : 100;
		}
	
		// Calculate font metrics
		baseFontSize = ((videoMetrics.height * (fontSizeVerticalPercentage/100))/96)*72;
		baseFontSize = baseFontSize >= minimumFontSize ? baseFontSize : minimumFontSize;
		basePixelFontSize = Math.floor((baseFontSize/72)*96);
		baseLineHeight = Math.floor(baseFontSize * lineHeightRatio);
		baseLineHeight = baseLineHeight > minimumLineHeight ? baseLineHeight : minimumLineHeight;
		pixelLineHeight = Math.ceil((baseLineHeight/72)*96);
		verticalPixelLineHeight	= pixelLineHeight;
		
		if (pixelLineHeight * Math.floor(videoMetrics.height / pixelLineHeight) < videoMetrics.height) {
			pixelLineHeight = Math.floor(videoMetrics.height / Math.floor(videoMetrics.height / pixelLineHeight));
			baseLineHeight = Math.ceil((pixelLineHeight/96)*72);
		}
		
		if (pixelLineHeight * Math.floor(videoMetrics.width / pixelLineHeight) < videoMetrics.width) {
			verticalPixelLineHeight = Math.ceil(videoMetrics.width / Math.floor(videoMetrics.width / pixelLineHeight));
		}
		
		// Calculate render area height & width in lines
		videoHeightInLines = Math.floor(videoElement._captionator_availableCueArea.height / pixelLineHeight);
		videoWidthInLines = Math.floor(videoElement._captionator_availableCueArea.width / verticalPixelLineHeight);
		
		// Calculate cue size and padding
		if (parseFloat(String(cueObject.size).replace(/[^\d\.]/ig,"")) === 0) {
			// We assume (given a size of 0) that no explicit size was set.
			// Depending on settings, we either use the WebVTT default size of 100% (the Captionator.js default behaviour),
			// or the proportion of the video the text bounding box takes up (widthwise) as a percentage (proposed behaviour, LeanBack's default)
			if (options.sizeCuesByTextBoundingBox === true) {
				cueSize = textBoundingBoxPercentage;
			} else {
				cueSize = 100;
				autoSize = false;
			}
		} else {
			autoSize = false;
			cueSize = parseFloat(String(cueObject.size).replace(/[^\d\.]/ig,""));
			cueSize = cueSize <= 100 ? cueSize : 100;
		}
		
		cuePaddingLR = cueObject.direction === "horizontal" ? Math.floor(videoMetrics.width * 0.01) : 0;
		cuePaddingTB = cueObject.direction === "horizontal" ? 0 : Math.floor(videoMetrics.height * 0.01);
		
		if (cueObject.linePosition === "auto") {
			cueObject.linePosition = cueObject.direction === "horizontal" ? videoHeightInLines : videoWidthInLines;
		} else if (String(cueObject.linePosition).match(/\%/)) {
			cueObject.snapToLines = false;
			cueObject.linePosition = parseFloat(String(cueObject.linePosition).replace(/\%/ig,""));
		}
		
		if (cueObject.direction === "horizontal") {
			cueHeight = pixelLineHeight;
	
			if (cueObject.textPosition !== "auto" && autoSize) {
				internalTextPosition = parseFloat(String(cueObject.textPosition).replace(/[^\d\.]/ig,""));
				
				// Don't squish the text
				if (cueSize - internalTextPosition > textBoundingBoxPercentage) {
					cueSize -= internalTextPosition;
				} else {
					cueSize = textBoundingBoxPercentage;
				}
			}
	
			if (cueObject.snapToLines === true) {
				cueWidth = videoElement._captionator_availableCueArea.width * (cueSize/100);
			} else {
				cueWidth = videoMetrics.width * (cueSize/100);
			}
	
			if (cueObject.textPosition === "auto") {
				cueX = ((videoElement._captionator_availableCueArea.right - cueWidth) / 2) + videoElement._captionator_availableCueArea.left;
			} else {
				internalTextPosition = parseFloat(String(cueObject.textPosition).replace(/[^\d\.]/ig,""));
				cueX = ((videoElement._captionator_availableCueArea.right - cueWidth) * (internalTextPosition/100)) + videoElement._captionator_availableCueArea.left;
			}
			
			if (cueObject.snapToLines === true) {
				cueY = ((videoHeightInLines-1) * pixelLineHeight) + videoElement._captionator_availableCueArea.top;
			} else {
				tmpHeightExclusions = videoMetrics.controlHeight + pixelLineHeight + (cuePaddingTB*2);
				cueY = (videoMetrics.height - tmpHeightExclusions) * (cueObject.linePosition/100);
			}
			
		} else {
			// Basic positioning
			cueY = videoElement._captionator_availableCueArea.top;
			cueX = videoElement._captionator_availableCueArea.right - verticalPixelLineHeight;
			cueWidth = verticalPixelLineHeight;
			cueHeight = videoElement._captionator_availableCueArea.height * (cueSize/100);
			
			// Split into characters, and continue calculating width & positioning with new info
			characterCount = spanify(DOMNode);
			characters = [].slice.call(DOMNode.querySelectorAll("span.captionator-cue-character"),0);
			charactersPerLine = Math.floor((cueHeight-cuePaddingTB*2)/basePixelFontSize);
			cueWidth = Math.ceil(characterCount/charactersPerLine) * verticalPixelLineHeight;
			lineCount = Math.ceil(characterCount/charactersPerLine);
			finalLineCharacterCount = characterCount - (charactersPerLine * (lineCount - 1));
			finalLineCharacterHeight = finalLineCharacterCount * basePixelFontSize;
			
			// Work out CueX taking into account linePosition...
			if (cueObject.snapToLines === true) {
				cueX = cueObject.direction === "vertical-lr" ? videoElement._captionator_availableCueArea.left : videoElement._captionator_availableCueArea.right - cueWidth;
			} else {
				var temporaryWidthExclusions = cueWidth + (cuePaddingLR * 2);
				if (cueObject.direction === "vertical-lr") {
					cueX = (videoMetrics.width - temporaryWidthExclusions) * (cueObject.linePosition/100);
				} else {
					cueX = (videoMetrics.width-temporaryWidthExclusions) - ((videoMetrics.width - temporaryWidthExclusions) * (cueObject.linePosition/100));
				}
			}
			
			// Work out CueY taking into account textPosition...
			if (cueObject.textPosition === "auto") {
				cueY = ((videoElement._captionator_availableCueArea.bottom - cueHeight) / 2) + videoElement._captionator_availableCueArea.top;
			} else {
				cueObject.textPosition = parseFloat(String(cueObject.textPosition).replace(/[^\d\.]/ig,""));
				cueY = ((videoElement._captionator_availableCueArea.bottom - cueHeight) * (cueObject.textPosition/100)) + 
						videoElement._captionator_availableCueArea.top;
			}
			
			// Iterate through the characters and position them accordingly...
			currentLine = 0;
			characterPosition = 0;
			characterX = 0;
			characterY = 0;
			
			characters.forEach(function(characterSpan,characterCount) {
				if (cueObject.direction === "vertical-lr") {
					characterX = verticalPixelLineHeight * currentLine;
				} else {
					characterX = cueWidth - (verticalPixelLineHeight * (currentLine+1));
				}
				
				if (cueObject.alignment === "start" || (cueObject.alignment !== "start" && currentLine < lineCount-1)) {
					characterY = (characterPosition * basePixelFontSize) + cuePaddingTB;
				} else if (cueObject.alignment === "end") {
					characterY = ((characterPosition * basePixelFontSize)-basePixelFontSize) + ((cueHeight+(cuePaddingTB*2))-finalLineCharacterHeight);
				} else if (cueObject.alignment === "middle") {
					characterY = (((cueHeight - (cuePaddingTB*2))-finalLineCharacterHeight)/2) + (characterPosition * basePixelFontSize);
				}
				
				// Because these are positioned absolutely, screen readers don't read them properly.
				// Each of the characters is set to be ignored, and the entire text is duplicated in a hidden element to ensure
				// it is read correctly.
				characterSpan.setAttribute("aria-hidden","true");
	
				captionator.applyStyles(characterSpan,{
					"position": "absolute",
					"top": characterY + "px",
					"left": characterX + "px"
				});
				
				if (characterPosition >= charactersPerLine-1) {
					characterPosition = 0;
					currentLine ++;
				} else {
					characterPosition ++;
				}
			});
			
			// Get the plain cue text
			if (!DOMNode.accessified) {
				plainCueText = cueObject.text.getPlain(videoElement.currentTime);
				plainCueTextContainer = document.createElement("div");
				plainCueTextContainer.innerHTML = plainCueText;
				plainCueTextContainer.nospan = true;
				DOMNode.appendChild(plainCueTextContainer);
				DOMNode.accessified = true;
			
				// Now hide it. Don't want it interfering with cue display
				captionator.applyStyles(plainCueTextContainer,{
					"position": "absolute",
					"overflow": "hidden",
					"width": "1px",
					"height": "1px",
					"opacity": "0",
					"textIndent": "-999em"
				});
			}
		}
		
		if (cueObject.direction === "horizontal") {
			if (captionator.checkDirection(String(cueObject.text)) === "rtl") {
				cueAlignment = {"start":"right","middle":"center","end":"left"}[cueObject.alignment];
			} else {	
				cueAlignment = {"start":"left","middle":"center","end":"right"}[cueObject.alignment];
			}
		}
	
		captionator.applyStyles(DOMNode,{
			"position": "absolute",
			"overflow": "hidden",
			"width": cueWidth + "px",
			"height": cueHeight + "px",
			"top": cueY + "px",
			"left": cueX + "px",
			"padding": cuePaddingTB + "px " + cuePaddingLR + "px",
			"textAlign": cueAlignment,
			"backgroundColor": "rgba(" + cueBackgroundColour.join(",") + ")",
			"direction": captionator.checkDirection(String(cueObject.text)),
			"lineHeight": baseLineHeight + "pt",
			"boxSizing": "border-box"
		});
		
		if (cueObject.direction === "vertical" || cueObject.direction === "vertical-lr") {
			// Work out how to shrink the available render area
			// If subtracting from the right works out to a larger area, subtract from the right.
			// Otherwise, subtract from the left.	
			if (((cueX - videoElement._captionator_availableCueArea.left) - videoElement._captionator_availableCueArea.left) >=
				(videoElement._captionator_availableCueArea.right - (cueX + cueWidth))) {
				
				videoElement._captionator_availableCueArea.right = cueX;
			} else {
				videoElement._captionator_availableCueArea.left = cueX + cueWidth;
			}
			
			videoElement._captionator_availableCueArea.width =
				videoElement._captionator_availableCueArea.right - 
				videoElement._captionator_availableCueArea.left;
			
		} else {
			// Now shift cue up if required to ensure it's all visible
			if (DOMNode.scrollHeight > DOMNode.offsetHeight * 1.2) {
				if (cueObject.snapToLines) {
					var upwardAjustmentInLines = 0;
					while (DOMNode.scrollHeight > DOMNode.offsetHeight * 1.2) {
						cueHeight += pixelLineHeight;
						DOMNode.style.height = cueHeight + "px";
						upwardAjustmentInLines ++;
					}
					
					cueY = cueY - (upwardAjustmentInLines*pixelLineHeight);
					DOMNode.style.top = cueY + "px";
				} else {
					// Not working by lines, so instead of shifting up, simply throw out old cueY calculation
					// and completely recalculate its value
					var upwardAjustment = (DOMNode.scrollHeight - cueHeight);
					cueHeight = (DOMNode.scrollHeight + cuePaddingTB);
					tmpHeightExclusions = videoMetrics.controlHeight + cueHeight + (cuePaddingTB*2);
					cueY = (videoMetrics.height - tmpHeightExclusions) * (cueObject.linePosition/100);
					
					DOMNode.style.height = cueHeight + "px";
					DOMNode.style.top = cueY + "px";
				}
			}
						
			// Work out how to shrink the available render area
			// If subtracting from the bottom works out to a larger area, subtract from the bottom.
			// Otherwise, subtract from the top.
			if (((cueY - videoElement._captionator_availableCueArea.top) - videoElement._captionator_availableCueArea.top) >=
				(videoElement._captionator_availableCueArea.bottom - (cueY + cueHeight)) &&
				videoElement._captionator_availableCueArea.bottom > cueY) {
				
				videoElement._captionator_availableCueArea.bottom = cueY;
			} else {
				if (videoElement._captionator_availableCueArea.top < cueY + cueHeight) {
					videoElement._captionator_availableCueArea.top = cueY + cueHeight;
				}
			}
			
			videoElement._captionator_availableCueArea.height =
				videoElement._captionator_availableCueArea.bottom - 
				videoElement._captionator_availableCueArea.top;
		}
		
		// DEBUG->
	
		// DEBUG FUNCTIONS
		// This function can be used for debugging WebVTT captions. It will not be
		// included in production versions of Captionator.
		// -----------------------------------------------------------------------
		if (options.debugMode) {
			var debugCanvas, debugContext;
			var generateDebugCanvas = function() {
				if (!debugCanvas) {
					if (videoElement._captionatorDebugCanvas) {
						debugCanvas = videoElement._captionatorDebugCanvas;
						debugContext = videoElement._captionatorDebugContext;
					} else {
						debugCanvas = document.createElement("canvas");
						debugCanvas.setAttribute("width",videoMetrics.width);
						debugCanvas.setAttribute("height",videoMetrics.height - videoMetrics.controlHeight);
						document.body.appendChild(debugCanvas);
						captionator.applyStyles(debugCanvas,{
							"position": "absolute",
							"top": videoMetrics.top + "px",
							"left": videoMetrics.left + "px",
							"width": videoMetrics.width + "px",
							"height": (videoMetrics.height - videoMetrics.controlHeight) + "px",
							"zIndex": 3000
						});
				
						debugContext = debugCanvas.getContext("2d");
						videoElement._captionatorDebugCanvas = debugCanvas;
						videoElement._captionatorDebugContext = debugContext;
					}
				}
			};
			
			var clearDebugCanvas = function() {
				generateDebugCanvas();
				debugCanvas.setAttribute("width",videoMetrics.width);
			};
			
			var drawLines = function() {
				var lineIndex;
				
				// Set up canvas for drawing debug information
				generateDebugCanvas();
				
				debugContext.strokeStyle = "rgba(255,0,0,0.5)";
				debugContext.lineWidth = 1;
				
				// Draw horizontal line dividers
				debugContext.beginPath();
				for (lineIndex = 0; lineIndex < videoHeightInLines; lineIndex ++) {
					debugContext.moveTo(0.5,(lineIndex*pixelLineHeight)+0.5);
					debugContext.lineTo(videoMetrics.width,(lineIndex*pixelLineHeight)+0.5);
				}
				
				debugContext.closePath();
				debugContext.stroke();
				debugContext.beginPath();
				debugContext.strokeStyle = "rgba(0,255,0,0.5)";
				
				// Draw vertical line dividers
				// Right to left, vertical
				for (lineIndex = videoWidthInLines; lineIndex >= 0; lineIndex --) {
					debugContext.moveTo((videoMetrics.width-(lineIndex*verticalPixelLineHeight))-0.5,-0.5);
					debugContext.lineTo((videoMetrics.width-(lineIndex*verticalPixelLineHeight))-0.5,videoMetrics.height);
				}
				
				debugContext.closePath();
				debugContext.stroke();
				debugContext.beginPath();
				debugContext.strokeStyle = "rgba(255,255,0,0.5)";
				
				// Draw vertical line dividers
				// Left to right, vertical
				for (lineIndex = 0; lineIndex <= videoWidthInLines; lineIndex ++) {
					debugContext.moveTo((lineIndex*verticalPixelLineHeight)+0.5,-0.5);
					debugContext.lineTo((lineIndex*verticalPixelLineHeight)+0.5,videoMetrics.height);
				}
				
				debugContext.stroke();
				
				videoElement.linesDrawn = true;
			};
			
			var drawAvailableArea = function() {
				generateDebugCanvas();
				
				debugContext.fillStyle = "rgba(100,100,255,0.5)";
				
				debugContext.fillRect(
						videoElement._captionator_availableCueArea.left,
						videoElement._captionator_availableCueArea.top,
						videoElement._captionator_availableCueArea.right,
						videoElement._captionator_availableCueArea.bottom);
				debugContext.stroke();
				
			};
			
			clearDebugCanvas();
			drawAvailableArea();
			drawLines();
		}
		// END DEBUG FUNCTIONS
		// <-DEBUG
	};
	
	/*
		captionator.styleCueCanvas(VideoNode)
	
		Styles and positions a canvas (not a <canvas> object - just a div) for displaying cues on a video.
		If the HTMLVideoElement in question does not have a canvas, one is created for it.
	
		First parameter: The HTMLVideoElement for which the cue canvas will be styled/created. This parameter is mandatory.
	
		RETURNS:
	
		Nothing.
	
	*/
	captionator.styleCueCanvas = function(videoElement) {
		var baseFontSize, baseLineHeight;
		var containerObject, descriptionContainerObject;
		var containerID, descriptionContainerID;
		var options = videoElement._captionatorOptions instanceof Object ? videoElement._captionatorOptions : {};
	
		if (!(videoElement instanceof HTMLVideoElement)) {
			throw new Error("Cannot style a cue canvas for a non-video node!");
		}
		
		if (videoElement._containerObject) {
			containerObject = videoElement._containerObject;
			containerID = containerObject.id;
		}
		
		if (videoElement._descriptionContainerObject) {
			descriptionContainerObject = videoElement._descriptionContainerObject;
			descriptionContainerID = descriptionContainerObject.id;
		}
		
		if (!descriptionContainerObject) {
			// Contain hidden descriptive captions
			descriptionContainerObject = document.createElement("div");
			descriptionContainerObject.className = "captionator-cue-descriptive-container";
			descriptionContainerID = captionator.generateID();
			descriptionContainerObject.id = descriptionContainerID;
			videoElement._descriptionContainerObject = descriptionContainerObject;
			
			// ARIA LIVE for descriptive text
			descriptionContainerObject.setAttribute("aria-live","polite");
			descriptionContainerObject.setAttribute("aria-atomic","true");
			descriptionContainerObject.setAttribute("role","region");
			
			// Stick it in the body
			document.body.appendChild(descriptionContainerObject);
			
			// Hide the descriptive canvas...
			captionator.applyStyles(descriptionContainerObject,{
				"position": "absolute",
				"overflow": "hidden",
				"width": "1px",
				"height": "1px",
				"opacity": "0",
				"textIndent": "-999em"
			});
		} else if (!descriptionContainerObject.parentNode) {
			document.body.appendChild(descriptionContainerObject);
		}
	
		if (!containerObject) {
			// visually display captions
			containerObject = document.createElement("div");
			containerObject.className = "captionator-cue-canvas";
			containerID = captionator.generateID();
			containerObject.id = containerID;
			
			// We can choose to append the canvas to an element other than the body.
			// If this option is specified, we no longer use the offsetTop/offsetLeft of the video
			// to define the position, we just inherit it.
			//
			// options.appendCueCanvasTo can be an HTMLElement, or a DOM query.
			// If the query fails, the canvas will be appended to the body as normal.
			// If the query is successful, the canvas will be appended to the first matched element.
	
			if (options.appendCueCanvasTo) {
				var canvasParentNode = null;
	
				if (options.appendCueCanvasTo instanceof HTMLElement) {
					canvasParentNode = options.appendCueCanvasTo;
				} else if (typeof(options.appendCueCanvasTo) === "string") {
					try {
						var canvasSearchResult = document.querySelectorAll(options.appendCueCanvasTo);
						if (canvasSearchResult.length > 0) {
							canvasParentNode = canvasSearchResult[0];
						} else { throw null; /* Bounce to catch */ }
					} catch(error) {
						canvasParentNode = document.body;
						options.appendCueCanvasTo = false;
					}
				} else {
					canvasParentNode = document.body;
					options.appendCueCanvasTo = false;
				}
	
				canvasParentNode.appendChild(containerObject);
			} else {
				document.body.appendChild(containerObject);
			}
	
			videoElement._containerObject = containerObject;
			
			// No aria live, as descriptions aren't placed in this container.
			// containerObject.setAttribute("role","region");
			
		} else if (!containerObject.parentNode) {
			document.body.appendChild(containerObject);
		}
	
		// Set up the cue canvas
		var videoMetrics = captionator.getNodeMetrics(videoElement);
	
		// Set up font metrics
		baseFontSize = ((videoMetrics.height * (fontSizeVerticalPercentage/100))/96)*72;
		baseFontSize = baseFontSize >= minimumFontSize ? baseFontSize : minimumFontSize;
		baseLineHeight = Math.floor(baseFontSize * lineHeightRatio);
		baseLineHeight = baseLineHeight > minimumLineHeight ? baseLineHeight : minimumLineHeight;
	
		// Style node!
		captionator.applyStyles(containerObject,{
			"position": "absolute",
			"overflow": "hidden",
			"zIndex": 100,
			"height": (videoMetrics.height - videoMetrics.controlHeight) + "px",
			"width": videoMetrics.width + "px",
			"top": (options.appendCueCanvasTo ? 0 : videoMetrics.top) + "px",
			"left": (options.appendCueCanvasTo ? 0 : videoMetrics.left) + "px",
			"color": "white",
			"fontFamily": "Verdana, Helvetica, Arial, sans-serif",
			"fontSize": baseFontSize + "pt",
			"lineHeight": baseLineHeight + "pt",
			"boxSizing": "border-box"
		});
	};

	/*
		Subclassing DOMException so we can reliably throw it without browser intervention. This is quite hacky. See SO post:
		http://stackoverflow.com/questions/5136727/manually-artificially-throwing-a-domexception-with-javascript
	*/
	captionator.createDOMException = function(code,message,name) {
		try {
			//	Deliberately cause a DOMException error
			document.querySelectorAll("div/[]");
		} catch(Error) {
			//	Catch it and subclass it
			/**
			* @constructor
			*/
			var CustomDOMException = function CustomDOMException(code,message,name){ this.code = code; this.message = message; this.name = name; };
			CustomDOMException.prototype = Error;
			return new CustomDOMException(code,message,name);
		}
	};
	
	/*
		captionator.compareArray(array1, array2)
	
		Rough and ready array comparison function we can use to easily determine
		whether cues have changed or not.
	
		First parameter: The first aray to compare
	
		Second parameter: The second array to compare
		
		RETURNS:
	
		True if the arrays are the same length and all elements in each array are the strictly equal (index for index.)
		False in all other circumstances.
		Returns false if either parameter is not an instance of Array().
	
	*/
	captionator.compareArray = function compareArray(array1,array2) {
		//	If either of these arguments aren't arrays, we consider them unequal
		if (!(array1 instanceof Array) || !(array2 instanceof Array)) { return false; }
		//	If the lengths are different, we consider then unequal
		if (array1.length !== array2.length) { return false; }
		//	Loop through, break at first value inequality
		for (var index in array1) {
			if (array1.hasOwnProperty(index)) {
				if (array1[index] !== array2[index]) { return false; }
			}
		}
		//	If we haven't broken, they're the same!
		return true;
	};
	
	/*
		captionator.generateID([number ID length])
	
		Generates a randomised string prefixed with the word captionator. This function is used internally to keep track of
		objects and nodes in the DOM.
	
		First parameter: A number of random characters/numbers to generate. This defaults to 10.
	
		RETURNS:
	
		The generated ID string.
	
	*/
	captionator.generateID = function(stringLength) {
		var idComposite = "";
		stringLength = stringLength ? stringLength : 10;
		while (idComposite.length < stringLength) {
			idComposite += String.fromCharCode(65 + Math.floor(Math.random()*26));
		}
	
		return "captionator" + idComposite;
	};

})();

    }

    if(window.browser){
        var patches = {
            'patchClassList':patchClassList,
            'patchGetUserMedia':patchGetUserMedia,
            'patchCurrentScript':patchCurrentScript,
            'patchIETouch':patchIETouch,
            'patchPointerAccuracy':patchPointerAccuracy,
            'patchCSSSupports':patchCSSSupports,
            'patchFlexibility':patchFlexibility,
            'patchCaptionator':patchCaptionator
        }
        if(window.browser.isIE && window.browser.version >= 10 && window.browser.version <= 11){
            patches.patchXPath = patchXPath
        }
        window.browser.addPatches(patches)
    }
})(this,this.document)