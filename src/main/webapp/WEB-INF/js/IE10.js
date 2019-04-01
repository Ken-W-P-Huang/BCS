/**
 * Created by kenhuang on 2019/1/29.
 */
// https://github.com/shinnn/location-origin.js
(function (window,document) {
    function patchLocationOrigin() {
(function() {
  'use strict';
  var loc, value;

  loc = window.location;

  if (loc.origin) {
    return;
  }
  function get() {
      
  }
  value = loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '');

  try {
    Object.defineProperty(loc, 'origin', {
      value: value,
      enumerable: true
    });
  } catch (_error) {
    loc.origin = value;
  }

}).call(this);

    }
    //<link rel="prefetch" href="(url)">
    function patchResourceHints() {
/*
 * jiagra 0.05
 *
 * Currently features:
 *  - tracking timers/intervals to see if they've been fired or not
 *      window.checkTimeout(timeoutID)
 *      // returns 'active', 'fired', 'firedActive', 'cleared' or 'firedCleared'
 *      // active has never fired (interval or timeout)
 *      // cleared has never fired and been cleared (interval or timeout)
 *      // fired is a timeout that has fired
 *      // firedActive is an interval that has fired and still active
 *      // firedCleared is an interval that has fired and cleared
 *
 *  - get a list (array) of timers that are either active, cleared or fired
 *      window.activeTimeouts()  // active or firedActive
 *      window.clearedTimeouts() // cleared or firedCleared
 *      window.firedTimeouts()   // fired, firedActive or firedCleared
 *
 *  - clearInterval/clearTimeout now returns 'true' if cleared,
 *      'false' if already cleared/fired, or undefined if no such timer
 *      Note that a timeout that is already 'fired' won't adjust to 'cleared'
 *
 *  - document.currentScript polyfill + improvements over browser implementations
 *      Returns the script object which document.currentScript is getting called from.
 *      Unlike Opera/FF's built-in implementation, it will even work in callbacks and event handlers.
 *      It will also work on browsers which don't have a native implementation such as IE/Chrome/FF3.
 *
 *  - prerendering/prefetching polyfill (pre-caching) for all browsers
 *    even if your browser doesn't support either.
 *
 *  - John Resig's "degrading script tags", http://ejohn.org/blog/degrading-script-tags/
 *    which now applies to ALL script tags on a page!
 *      // can be globally enabled/disabled, and individually enabled/disabled
 *      <script src="path/to/script.js">
 *          code() // this gets executed after script.js loads
 *      </script>
 *      <script src="path/to/script.js" data-degrade="true">
 *          code() // this will run even if degradeEnabled is turned off
 *      </script>
 *      <script src="path/to/script.js" data-degrade="false">
 *          code() // this will NOT run
 *      </script>
 *
 * by Samy Kamkar, http://samy.pl/
 * 06/15/2011
 *
 * Learn more about Chrome prerendering:
 *  http://code.google.com/chrome/whitepapers/prerender.html
 *
 * Learn more about Firefox prefetching:
 *  https://developer.mozilla.org/en/Link_prefetching_FAQ
 *
 * TODO:
 *  pass how late in ms a timer got fired (Gecko does this, other browsers don't)
 *  an iframe can break out, we could prevent this same-domain with ajax get + html parser + caching, can support single-file pre-caching for cross-domain with Image(), but what about a cross-domain site (without proxy)?
 *  if one of the URLs fails, we stop precaching because we couldn't catch iframe error :( we could set a timeout...
 *  don't precache if browser actually supports prerender/prefetching
 *  allow replacing links with the iframe so we don't ever have to redirect
 *
 *  Usage (or lack there of) may change any time.
 */

(function(w, d, undefined)
{
	// are degrading script tags enabled by default?
	var degradeEnabled = 1;

	// set this to 0 if you suspect any of the pre-rendered
	// URLs will use javascript to framebreak!
	var useIframe = 1;

	// when using iframes to precache pages, we can replace the
	// actual links on the page with an onclick handler that makes
	// the iframe span the entire page instead of redirecting
	var replaceLinks = 1;

	// size in px of scrollbar
	var scrollBuffer = 20;

	var scripts = d.getElementsByTagName('script'),
		a		= d.getElementsByTagName('a'),
		link	= d.getElementsByTagName('link'),
		meta	= d.getElementsByTagName('meta');


	/***************************************************************************/
	/* degrading script tags */
	/* this code is by John Resig */
	/* see: http://ejohn.org/blog/degrading-script-tags/ */
	/***************************************************************************/

	var smartTags = function()
	{
		// dynamic array, .length may change
		for (var i = 0, l = scripts.length; i < l; i++)
		{
			// the array may change as it's dynamic so store object
			// in case something gets inserted before it
			var script = scripts[i];
			var degrade = script.getAttribute('data-degrade');

			// finds scripts with a URL and execute the contents inside
			if (script.src && !script.jExecuted && (
				( degradeEnabled && !fals(degrade)) ||
				(!degradeEnabled &&  tru (degrade)))
			)
			{
				script.jExecuted = true;
				if (script.innerHTML)
					eval(script.innerHTML);
			}
		}
	};


	/***************************************************************************/
	/* allow monitoring timers */
	/***************************************************************************/

	var timers = {};

	// allow checking whether a timer is set, fired or cleared
	w.checkInterval  = w.checkTimeout = function(timer) { return timers[timer] };

	// return list of fired timers (at least fired once)
	w.firedTimeouts    = w.firedIntervals = function()
	{
		var fired = [];
		for (var timer in timers)
			if (timers[timer].substr(0, 5) === 'fired')
				fired.push(timer);
		return fired;
	};

	// return list of cleared timers
	w.clearedTimeouts  = w.clearedIntervals = function()
	{
		var cleared = [];
		for (var timer in timers)
			if (timers[timer] === 'cleared' || timers[timer] === 'firedCleared')
				cleared.push(timer);
		return cleared;
	};

	// return list of active timers
	w.activeTimeouts = w.activeIntervals = function()
	{
		var active = [];
		for (var timer in timers)
			// an interval that's been fired is still active
			if (timers[timer] === 'active' || timers[timer] === 'firedActive')
				active.push(timer);
		return active;
	};

	w._setTimeout    = w.setTimeout;
	w._setInterval   = w.setInterval;
	w._clearTimeout  = w.clearTimeout;
	w._clearInterval = w.clearInterval;
	w.clearInterval  = w.clearTimeout = function(timer)
	{
		// if it's already fired or doesn't exist, you can't really clear it.
		if (timers[timer] === 'active' || timers[timer] === 'firedActive')
		{
			w._clearInterval(timer);
			timers[timer] = timers[timer] === 'active' ? 'cleared' : 'firedCleared';
			return true;
		}
		else if (timers[timer])
			return false;

		// timer that doesn't exist
		return undefined;
	};
	w.setTimeout  = function () { return newSetTimeout(true,  Array.prototype.slice.call(arguments)) };
	w.setInterval = function () { return newSetTimeout(false, Array.prototype.slice.call(arguments)) };

	// our new timer tracker
	var newSetTimeout = function(timeout, args)
	{
		// if we're passing a function ref or a string (don't use a string n00b!)
		var origFn = typeof(args[0]) === 'function' ? args[0] : new Function(args[0]);

		// our function calls a placeholder function that gets replaced once we know our timer id
		// leave origFn in there just in case we get called before getting replaced (shouldn't happen)
		// gecko also passes back the # of ms late it was to call back
		var temp = function(ms) { return origFn(ms); };

		// replace with placeholder
		args[0] = function(ms) { return temp(ms) };

		// create our real timer
		// XXX -- do we need to allow different scope other than `this`?
		var fn = timeout ? w._setTimeout : w._setInterval;

		// support IE6
		var timer = fn.apply ? fn.apply(this, args) : fn(args[0], args[1], args[2]); 

		// now change the sub-function we call to know when we've fired
		// now that we know our timer ID (only known AFTER calling setTimeout)
		temp = function(ms)
		{
			// now we've been fired by the timeout
			timers[timer] = timeout ? 'fired' : 'firedActive';
			return origFn(ms);
		};

		// we have an active (set) timer
		timers[timer] = 'active';
		return timer;
	};



	/***************************************************************************/
	/* handle prerendering */
	/***************************************************************************/

	var visibleFrame,
		origDocSettings;

	// Scan the page once for all of the link and meta elements that might have prefetch info
	var prefetchObjs = [];

	// Checks for a change in w.location.hash, and if so returns us to the original page
	var checkHash = function(href)
	{
		// We clicked off the hash, clear the iframe and set the body back
		if (w.location.hash !== '#' + href)
		{
			// Reset our page back to how it was before the iframe was displayed
			if (origDocSettings)
			{
				d.body.style.height    = origDocSettings.height;
				d.body.style.maxHeight = origDocSettings.maxHeight;
				d.body.style.overflow  = origDocSettings.overflow;
				d.body.style.padding   = origDocSettings.padding;
				d.body.style.margin    = origDocSettings.margin;
				d.body.style.border    = origDocSettings.border;
			}

			// Make the iframe invsible and delete the height/width so it doesn't give the page unnecessary scroll bars
			visibleFrame.style.visibility = 'hidden';
			visibleFrame.style.height = '';
			visibleFrame.style.width = '';

			return true;
		}

		return false;
	};


	// track our rendered stuff so we don't double-request
	var rendered = {};

	// we run this every time to replace iframes ASAP
	var replaceLink = function(href)
	{
		for (var i = 0; i < a.length; i++)
		{
			if (a[i].href === href || a[i].href === href + '/')
			{
				var oldOnclick = a[i].onclick;
				a[i].onclick = (function(href, oldOnclick) {
					return function() {
						if (oldOnclick) oldOnclick();

						// Set a new location, so the back button returns us to our original page
						w.location.href = '#' + href;
						// Look for the hash to change. If it does (back button pressed), hide the iframe
						(function()
						{
							if (!checkHash(href))
								w.setTimeout(arguments.callee, 100);
						})();

						visibleFrame = d.getElementById(href);
						var height = d.documentElement.clientHeight;
						height -= pageY(visibleFrame) + scrollBuffer;
						height = (height < 0) ? 0 : height;

						// Modify page all at once
						visibleFrame.style.zIndex = "1337";
						d.body.style.height    = "100%";
						d.body.style.maxHeight = "100%";
						d.body.style.overflow  = "hidden";
						d.body.style.padding   = "0";
						d.body.style.margin    = "0";
						d.body.style.border    = "0";
						visibleFrame.style.backgroundColor = "#FFFFFF";
						visibleFrame.style.height     = height + 'px';
						visibleFrame.style.border     = "0";
						visibleFrame.style.width      = '100%';
						visibleFrame.style.visibility = 'visible';
						visibleFrame.contentWindow.focus();
						w.onresize = arguments.callee;
						return false;
					};
				})(href, oldOnclick);
			}
		}
	};

	var pageY = function(elem)
	{
		return elem.offsetParent ? (elem.offsetTop + pageY(elem.offsetParent)) : elem.offsetTop;
	};

	var prerender = function(href, i)
	{
		// already rendered
		if (rendered[href])
			return findprerender(i + 1);
		rendered[href] = 1;

		// We're not really rendering, just loading the page in
		// a hidden iframe in order to cache all objects on the page.
		var iframe = d.createElement(useIframe ? 'iframe' : 'img');
		iframe.style.visibility = 'hidden';
		iframe.style.position   = 'absolute';
		iframe.onload = iframe.onerror = function()
		{
			// load next prerender so we don't render multiple items simultaneously
			if (useIframe && replaceLinks)
				replaceLink(href);
			findprerender(i + 1);
		};
		iframe.src = href;
		iframe.id  = href;

		// append iframe to DOM
		d.body.insertBefore(iframe, d.body.firstChild);	
	};

	// go through objects to prerender
	var findprerender = function(i)
	{
		for (; i < prefetchObjs.length; i++)
			// Process link tags
			if (prefetchObjs[i].nodeName === "LINK" && prefetchObjs[i].rel && prefetchObjs[i].rel.match(/\b(?:pre(?:render|fetch)|next)\b/))
				return prerender(prefetchObjs[i].href, i);
			// Process meta tags
			else if (prefetchObjs[i].nodeName === "META" && prefetchObjs[i].httpEquiv === "Link" && prefetchObjs[i].content && prefetchObjs[i].content.match(/\brel=(?:pre(?:render|fetch)|next)\b/))
				if (url = prefetchObjs[i].content.match(/^<(.*)>; /))
					return prerender(url[1], i);
	};

	// onload function for prerendering
	var startPrerendering = function()
	{
		// Put all the objects onto one array that we can process later
		var llen = link.length, mlen = meta.length;
		for (var x = 0; x < llen; x++)
			prefetchObjs[x] = link[x];

		for (; x - llen < mlen; x++)
			prefetchObjs[x] = meta[x - llen];

		if (prefetchObjs.length > 0)
		{
			// Remember the settings we are going to modify when displaying the iframe (if we have replaceLinks on)
			if (replaceLinks && !origDocSettings)
				origDocSettings = {
					'height':		d.body.style.height,
					'maxHeight':	d.body.style.maxHeight,
					'overflow':		d.body.style.overflow,
					'padding':		d.body.style.padding,
					'margin':		d.body.style.margin,
					'border':		d.body.style.border
				};

			// Find all pre-renders and do it!
			findprerender(0);
		};
	};


	/***************************************************************************/
	/* document.currentScript polyfill + improvements */
	/***************************************************************************/
	/*
		Notes:
		document.currentScript in FF4/Opera isn't useful because it won't return from a callback or event handler
		Chrome / FF3+ work fine (via try/catch)
		IE can *either* obtain params passed to function (via try/catch) OR obtain URL script executed from (via window.onerror), but not sure if both will work together
		Safari < 5.1 doesn't support window.onerror nor does it provide full trace (via try/catch), however you can get "last" stack URL from try/catch (e.sourceURL)
		arguments.callee.caller returns null from remotely loaded JS
		Setting a global var during onload isn't useful because the JS will start to execute first
		Setting a global var just before creating the script isn't useful because the call may be asynchronous and another JS file may load and execute at that time, then believe it's a different script
		This works when scripts are created through a script tag, d.createElement() or d.write(), doesn't matter
	*/
	d._currentScript = d.currentScript;

	// return script object based off of src
	var getScriptFromURL = function(url)
	{
		for (var i = 0; i < scripts.length; i++)
			if (scripts[i].src === url)
				return scripts[i];

		return undefined;
	}

	var actualScript = d.actualScript = function()
	{
		// use native implementation if it knows what's up (doubt it, sucker)
		if (d._currentScript)
			return d._currentScript;

		// we could hit a function outside of try to call window.onerror and get url, but problem with this:
		// 1) onerror won't resume execution
		// 2) doesn't tell us what was *passed* to the function (doesn't matter here)
		// 3) safari doesn't support window.onerror
		// this might be a good solution for MSIE though since stack trace does not show URLs
		/*
		if (navigator.userAgent.indexOf('MSIE ') !== -1)
		{
			w.onerror = function(error, url, line)
			{
				if (error.indexOf('Object exp') !== -1)
				{
					foo2(undefined, url);
					return true;
				}
			};
			omgwtf
		}
		*/

		var stack;
		try
		{
			omgwtf
		} catch(e) {
			stack = e.stack;
		};

		if (!stack)
			return undefined;

		// chrome uses at, ff uses @
		var e = stack.indexOf(' at ') !== -1 ? ' at ' : '@';
		while (stack.indexOf(e) !== -1)
			stack = stack.substring(stack.indexOf(e) + e.length);
		stack = stack.substring(0, stack.indexOf(':', stack.indexOf(':')+1));

		return getScriptFromURL(stack);
	};
	if (d.__defineGetter__)
		d.__defineGetter__('currentScript', actualScript);


	/***************************************************************************/
	/* onload events to fire */
	/***************************************************************************/
	addEvent(function() { 
		// begin our prerendering routine
		startPrerendering();

		// use our smart "degrading" script tags
		smartTags();
	});


	/***************************************************************************/
	/* general functions */
	/***************************************************************************/

	function addEvent(cb, evt, obj)
	{
		// default to onload
		if (!evt)
			evt = 'load';

		// default to window as 'this'
		if (!obj)
			obj = w;

		// if we're already completed, run now
		if (d.readyState === 'complete') 
			cb();

		// set event listener
		else if (obj.addEventListener)
			obj.addEventListener(evt, cb, false);
		else if (obj.attachEvent)
			obj.attachEvent('on' + evt, cb);
	}


	function tru(test)
	{
		return test === 'true' || test === true || test === '1' || test === 1;
	}

	// explicit false, this is NOT the same as !tru()
	function fals(test)
	{
		return test === 'false' || test === false || test === '0' || test === 0;
	}
			

})(this, this.document);


/* Or for a good time!

(s=(d=document).getElementsByTagName(x='script')[0]).parentNode.insertBefore(d.createElement(x),s).src='//namb.la/'+7;

*/

    }
    function patchDataset() {
/**
 * Add dataset support to elements
 * No globals, no overriding prototype with non-standard methods, 
 *   handles CamelCase properly, attempts to use standard 
 *   Object.defineProperty() (and Function bind()) methods, 
 *   falls back to native implementation when existing
 * Inspired by http://code.eligrey.com/html5/dataset/ 
 *   (via https://github.com/adalgiso/html5-dataset/blob/master/html5-dataset.js )
 * Depends on Function.bind and Object.defineProperty/Object.getOwnPropertyDescriptor (polyfills below)
 * All code below is Licensed under the X11/MIT License
*/

// Inspired by https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        'use strict';
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            FNOP = function () {},
            fBound = function () {
                return fToBind.apply(
                    this instanceof FNOP && oThis ? this : oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments))
               );
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };
}

/*
 * Xccessors Standard: Cross-browser ECMAScript 5 accessors
 * http://purl.eligrey.com/github/Xccessors
 * 
 * 2010-06-21
 * 
 * By Eli Grey, http://eligrey.com
 * 
 * A shim that partially implements Object.defineProperty,
 * Object.getOwnPropertyDescriptor, and Object.defineProperties in browsers that have
 * legacy __(define|lookup)[GS]etter__ support.
 * 
 * Licensed under the X11/MIT License
 *   See LICENSE.md
*/

// Removed a few JSLint options as Notepad++ JSLint validator complaining and 
//   made comply with JSLint; also moved 'use strict' inside function
/*jslint white: true, undef: true, plusplus: true,
  bitwise: true, regexp: true, newcap: true, maxlen: 90 */

/*! @source http://purl.eligrey.com/github/Xccessors/blob/master/xccessors-standard.js*/

(function () {
    'use strict';
    var ObjectProto = Object.prototype,
    defineGetter = ObjectProto.__defineGetter__,
    defineSetter = ObjectProto.__defineSetter__,
    lookupGetter = ObjectProto.__lookupGetter__,
    lookupSetter = ObjectProto.__lookupSetter__,
    hasOwnProp = ObjectProto.hasOwnProperty;
    
    if (defineGetter && defineSetter && lookupGetter && lookupSetter) {

        if (!Object.defineProperty) {
            Object.defineProperty = function (obj, prop, descriptor) {
                if (arguments.length < 3) { // all arguments required
                    throw new TypeError("Arguments not optional");
                }
                
                prop += ""; // convert prop to string

                if (hasOwnProp.call(descriptor, "value")) {
                    if (!lookupGetter.call(obj, prop) && !lookupSetter.call(obj, prop)) {
                        // data property defined and no pre-existing accessors
                        obj[prop] = descriptor.value;
                    }

                    if ((hasOwnProp.call(descriptor, "get") ||
                         hasOwnProp.call(descriptor, "set"))) 
                    {
                        // descriptor has a value prop but accessor already exists
                        throw new TypeError("Cannot specify an accessor and a value");
                    }
                }

                // can't switch off these features in ECMAScript 3
                // so throw a TypeError if any are false
                if (!(descriptor.writable && descriptor.enumerable && 
                    descriptor.configurable))
                {
                    throw new TypeError(
                        "This implementation of Object.defineProperty does not support" +
                        " false for configurable, enumerable, or writable."
                    );
                }
                
                if (descriptor.get) {
                    defineGetter.call(obj, prop, descriptor.get);
                }
                if (descriptor.set) {
                    defineSetter.call(obj, prop, descriptor.set);
                }
            
                return obj;
            };
        }

        if (!Object.getOwnPropertyDescriptor) {
            Object.getOwnPropertyDescriptor = function (obj, prop) {
                if (arguments.length < 2) { // all arguments required
                    throw new TypeError("Arguments not optional.");
                }
                
                prop += ""; // convert prop to string

                var descriptor = {
                    configurable: true,
                    enumerable  : true,
                    writable    : true
                },
                getter = lookupGetter.call(obj, prop),
                setter = lookupSetter.call(obj, prop);

                if (!hasOwnProp.call(obj, prop)) {
                    // property doesn't exist or is inherited
                    return descriptor;
                }
                if (!getter && !setter) { // not an accessor so return prop
                    descriptor.value = obj[prop];
                    return descriptor;
                }

                // there is an accessor, remove descriptor.writable;
                // populate descriptor.get and descriptor.set (IE's behavior)
                delete descriptor.writable;
                descriptor.get = descriptor.set = undefined;
                
                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }
                
                return descriptor;
            };
        }

        if (!Object.defineProperties) {
            Object.defineProperties = function (obj, props) {
                var prop;
                for (prop in props) {
                    if (hasOwnProp.call(props, prop)) {
                        Object.defineProperty(obj, prop, props[prop]);
                    }
                }
            };
        }
    }
}());

// Begin dataset code

if (!document.documentElement.dataset && 
         // FF is empty while IE gives empty object
        (!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset')  ||
        !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
    ) {
    var propDescriptor = {
        enumerable: true,
        get: function () {
            'use strict';
            var i, 
                that = this,
                HTML5_DOMStringMap, 
                attrVal, attrName, propName,
                attribute,
                attributes = this.attributes,
                attsLength = attributes.length,
                toUpperCase = function (n0) {
                    return n0.charAt(1).toUpperCase();
                },
                getter = function () {
                    return this;
                },
                setter = function (attrName, value) {
                    return (typeof value !== 'undefined') ? 
                        this.setAttribute(attrName, value) : 
                        this.removeAttribute(attrName);
                };
            try { // Simulate DOMStringMap w/accessor support
                // Test setting accessor on normal object
                ({}).__defineGetter__('test', function () {});
                HTML5_DOMStringMap = {};
            }
            catch (e1) { // Use a DOM object for IE8
                HTML5_DOMStringMap = document.createElement('div');
            }
            for (i = 0; i < attsLength; i++) {
                attribute = attributes[i];
                // Fix: This test really should allow any XML Name without 
                //         colons (and non-uppercase for XHTML)
                if (attribute && attribute.name && 
                    (/^data-\w[\w\-]*$/).test(attribute.name)) {
                    attrVal = attribute.value;
                    attrName = attribute.name;
                    // Change to CamelCase
                    propName = attrName.substr(5).replace(/-./g, toUpperCase);
                    try {
                        Object.defineProperty(HTML5_DOMStringMap, propName, {
                            enumerable: this.enumerable,
                            get: getter.bind(attrVal || ''),
                            set: setter.bind(that, attrName)
                        });
                    }
                    catch (e2) { // if accessors are not working
                        HTML5_DOMStringMap[propName] = attrVal;
                    }
                }
            }
            return HTML5_DOMStringMap;
        }
    };
    try {
        // FF enumerates over element's dataset, but not 
        //   Element.prototype.dataset; IE9 iterates over both
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    } catch (e) {
        propDescriptor.enumerable = false; // IE8 does not allow setting to true
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    }
}

    }
    function patchDialog() {
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.dialogPolyfill = factory());
}(this, function () { 'use strict';

  // nb. This is for IE10 and lower _only_.
  var supportCustomEvent = window.CustomEvent;
  if (!supportCustomEvent || typeof supportCustomEvent === 'object') {
    supportCustomEvent = function CustomEvent(event, x) {
      x = x || {};
      var ev = document.createEvent('CustomEvent');
      ev.initCustomEvent(event, !!x.bubbles, !!x.cancelable, x.detail || null);
      return ev;
    };
    supportCustomEvent.prototype = window.Event.prototype;
  }

  /**
   * @param {Element} el to check for stacking context
   * @return {boolean} whether this el or its parents creates a stacking context
   */
  function createsStackingContext(el) {
    while (el && el !== document.body) {
      var s = window.getComputedStyle(el);
      var invalid = function(k, ok) {
        return !(s[k] === undefined || s[k] === ok);
      };
      
      if (s.opacity < 1 ||
          invalid('zIndex', 'auto') ||
          invalid('transform', 'none') ||
          invalid('mixBlendMode', 'normal') ||
          invalid('filter', 'none') ||
          invalid('perspective', 'none') ||
          s['isolation'] === 'isolate' ||
          s.position === 'fixed' ||
          s.webkitOverflowScrolling === 'touch') {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  /**
   * Finds the nearest <dialog> from the passed element.
   *
   * @param {Element} el to search from
   * @return {HTMLDialogElement} dialog found
   */
  function findNearestDialog(el) {
    while (el) {
      if (el.localName === 'dialog') {
        return /** @type {HTMLDialogElement} */ (el);
      }
      el = el.parentElement;
    }
    return null;
  }

  /**
   * Blur the specified element, as long as it's not the HTML body element.
   * This works around an IE9/10 bug - blurring the body causes Windows to
   * blur the whole application.
   *
   * @param {Element} el to blur
   */
  function safeBlur(el) {
    if (el && el.blur && el !== document.body) {
      el.blur();
    }
  }

  /**
   * @param {!NodeList} nodeList to search
   * @param {Node} node to find
   * @return {boolean} whether node is inside nodeList
   */
  function inNodeList(nodeList, node) {
    for (var i = 0; i < nodeList.length; ++i) {
      if (nodeList[i] === node) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {HTMLFormElement} el to check
   * @return {boolean} whether this form has method="dialog"
   */
  function isFormMethodDialog(el) {
    if (!el || !el.hasAttribute('method')) {
      return false;
    }
    return el.getAttribute('method').toLowerCase() === 'dialog';
  }

  /**
   * @param {!HTMLDialogElement} dialog to upgrade
   * @constructor
   */
  function dialogPolyfillInfo(dialog) {
    this.dialog_ = dialog;
    this.replacedStyleTop_ = false;
    this.openAsModal_ = false;

    // Set a11y role. Browsers that support dialog implicitly know this already.
    if (!dialog.hasAttribute('role')) {
      dialog.setAttribute('role', 'dialog');
    }

    dialog.show = this.show.bind(this);
    dialog.showModal = this.showModal.bind(this);
    dialog.close = this.close.bind(this);

    if (!('returnValue' in dialog)) {
      dialog.returnValue = '';
    }

    if ('MutationObserver' in window) {
      var mo = new MutationObserver(this.maybeHideModal.bind(this));
      mo.observe(dialog, {attributes: true, attributeFilter: ['open']});
    } else {
      // IE10 and below support. Note that DOMNodeRemoved etc fire _before_ removal. They also
      // seem to fire even if the element was removed as part of a parent removal. Use the removed
      // events to force downgrade (useful if removed/immediately added).
      var removed = false;
      var cb = function() {
        removed ? this.downgradeModal() : this.maybeHideModal();
        removed = false;
      }.bind(this);
      var timeout;
      var delayModel = function(ev) {
        if (ev.target !== dialog) { return; }  // not for a child element
        var cand = 'DOMNodeRemoved';
        removed |= (ev.type.substr(0, cand.length) === cand);
        window.clearTimeout(timeout);
        timeout = window.setTimeout(cb, 0);
      };
      ['DOMAttrModified', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument'].forEach(function(name) {
        dialog.addEventListener(name, delayModel);
      });
    }
    // Note that the DOM is observed inside DialogManager while any dialog
    // is being displayed as a modal, to catch modal removal from the DOM.

    Object.defineProperty(dialog, 'open', {
      set: this.setOpen.bind(this),
      get: dialog.hasAttribute.bind(dialog, 'open')
    });

    this.backdrop_ = document.createElement('div');
    this.backdrop_.className = 'backdrop';
    this.backdrop_.addEventListener('click', this.backdropClick_.bind(this));
  }

  dialogPolyfillInfo.prototype = {

    get :function dialog() {
      return this.dialog_;
    },

    /**
     * Maybe remove this dialog from the modal top layer. This is called when
     * a modal dialog may no longer be tenable, e.g., when the dialog is no
     * longer open or is no longer part of the DOM.
     */
    maybeHideModal: function() {
      if (this.dialog_.hasAttribute('open') && document.body.contains(this.dialog_)) { return; }
      this.downgradeModal();
    },

    /**
     * Remove this dialog from the modal top layer, leaving it as a non-modal.
     */
    downgradeModal: function() {
      if (!this.openAsModal_) { return; }
      this.openAsModal_ = false;
      this.dialog_.style.zIndex = '';

      // This won't match the native <dialog> exactly because if the user set top on a centered
      // polyfill dialog, that top gets thrown away when the dialog is closed. Not sure it's
      // possible to polyfill this perfectly.
      if (this.replacedStyleTop_) {
        this.dialog_.style.top = '';
        this.replacedStyleTop_ = false;
      }

      // Clear the backdrop and remove from the manager.
      this.backdrop_.parentNode && this.backdrop_.parentNode.removeChild(this.backdrop_);
      dialogPolyfill.dm.removeDialog(this);
    },

    /**
     * @param {boolean} value whether to open or close this dialog
     */
    setOpen: function(value) {
      if (value) {
        this.dialog_.hasAttribute('open') || this.dialog_.setAttribute('open', '');
      } else {
        this.dialog_.removeAttribute('open');
        this.maybeHideModal();  // nb. redundant with MutationObserver
      }
    },

    /**
     * Handles clicks on the fake .backdrop element, redirecting them as if
     * they were on the dialog itself.
     *
     * @param {!Event} e to redirect
     */
    backdropClick_: function(e) {
      if (!this.dialog_.hasAttribute('tabindex')) {
        // Clicking on the backdrop should move the implicit cursor, even if dialog cannot be
        // focused. Create a fake thing to focus on. If the backdrop was _before_ the dialog, this
        // would not be needed - clicks would move the implicit cursor there.
        var fake = document.createElement('div');
        this.dialog_.insertBefore(fake, this.dialog_.firstChild);
        fake.tabIndex = -1;
        fake.focus();
        this.dialog_.removeChild(fake);
      } else {
        this.dialog_.focus();
      }

      var redirectedEvent = document.createEvent('MouseEvents');
      redirectedEvent.initMouseEvent(e.type, e.bubbles, e.cancelable, window,
          e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey,
          e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
      this.dialog_.dispatchEvent(redirectedEvent);
      e.stopPropagation();
    },

    /**
     * Focuses on the first focusable element within the dialog. This will always blur the current
     * focus, even if nothing within the dialog is found.
     */
    focus_: function() {
      // Find element with `autofocus` attribute, or fall back to the first form/tabindex control.
      var target = this.dialog_.querySelector('[autofocus]:not([disabled])');
      if (!target && this.dialog_.tabIndex >= 0) {
        target = this.dialog_;
      }
      if (!target) {
        // Note that this is 'any focusable area'. This list is probably not exhaustive, but the
        // alternative involves stepping through and trying to focus everything.
        var opts = ['button', 'input', 'keygen', 'select', 'textarea'];
        var query = opts.map(function(el) {
          return el + ':not([disabled])';
        });
        // TODO(samthor): tabindex values that are not numeric are not focusable.
        query.push('[tabindex]:not([disabled]):not([tabindex=""])');  // tabindex != "", not disabled
        target = this.dialog_.querySelector(query.join(', '));
      }
      safeBlur(document.activeElement);
      target && target.focus();
    },

    /**
     * Sets the zIndex for the backdrop and dialog.
     *
     * @param {number} dialogZ
     * @param {number} backdropZ
     */
    updateZIndex: function(dialogZ, backdropZ) {
      if (dialogZ < backdropZ) {
        throw new Error('dialogZ should never be < backdropZ');
      }
      this.dialog_.style.zIndex = dialogZ;
      this.backdrop_.style.zIndex = backdropZ;
    },

    /**
     * Shows the dialog. If the dialog is already open, this does nothing.
     */
    show: function() {
      if (!this.dialog_.open) {
        this.setOpen(true);
        this.focus_();
      }
    },

    /**
     * Show this dialog modally.
     */
    showModal: function() {
      if (this.dialog_.hasAttribute('open')) {
        throw new Error('Failed to execute \'showModal\' on dialog: The element is already open, and therefore cannot be opened modally.');
      }
      if (!document.body.contains(this.dialog_)) {
        throw new Error('Failed to execute \'showModal\' on dialog: The element is not in a Document.');
      }
      if (!dialogPolyfill.dm.pushDialog(this)) {
        throw new Error('Failed to execute \'showModal\' on dialog: There are too many open modal dialogs.');
      }

      if (createsStackingContext(this.dialog_.parentElement)) {
        console.warn('A dialog is being shown inside a stacking context. ' +
            'This may cause it to be unusable. For more information, see this link: ' +
            'https://github.com/GoogleChrome/dialog-polyfill/#stacking-context');
      }

      this.setOpen(true);
      this.openAsModal_ = true;

      // Optionally center vertically, relative to the current viewport.
      if (dialogPolyfill.needsCentering(this.dialog_)) {
        dialogPolyfill.reposition(this.dialog_);
        this.replacedStyleTop_ = true;
      } else {
        this.replacedStyleTop_ = false;
      }

      // Insert backdrop.
      this.dialog_.parentNode.insertBefore(this.backdrop_, this.dialog_.nextSibling);

      // Focus on whatever inside the dialog.
      this.focus_();
    },

    /**
     * Closes this HTMLDialogElement. This is optional vs clearing the open
     * attribute, however this fires a 'close' event.
     *
     * @param {string=} opt_returnValue to use as the returnValue
     */
    close: function(opt_returnValue) {
      if (!this.dialog_.hasAttribute('open')) {
        throw new Error('Failed to execute \'close\' on dialog: The element does not have an \'open\' attribute, and therefore cannot be closed.');
      }
      this.setOpen(false);

      // Leave returnValue untouched in case it was set directly on the element
      if (opt_returnValue !== undefined) {
        this.dialog_.returnValue = opt_returnValue;
      }

      // Triggering "close" event for any attached listeners on the <dialog>.
      var closeEvent = new supportCustomEvent('close', {
        bubbles: false,
        cancelable: false
      });
      this.dialog_.dispatchEvent(closeEvent);
    }

  };

  var dialogPolyfill = {};

  dialogPolyfill.reposition = function(element) {
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    var topValue = scrollTop + (window.innerHeight - element.offsetHeight) / 2;
    element.style.top = Math.max(scrollTop, topValue) + 'px';
  };

  dialogPolyfill.isInlinePositionSetByStylesheet = function(element) {
    for (var i = 0; i < document.styleSheets.length; ++i) {
      var styleSheet = document.styleSheets[i];
      var cssRules = null;
      // Some browsers throw on cssRules.
      try {
        cssRules = styleSheet.cssRules;
      } catch (e) {}
      if (!cssRules) { continue; }
      for (var j = 0; j < cssRules.length; ++j) {
        var rule = cssRules[j];
        var selectedNodes = null;
        // Ignore errors on invalid selector texts.
        try {
          selectedNodes = document.querySelectorAll(rule.selectorText);
        } catch(e) {}
        if (!selectedNodes || !inNodeList(selectedNodes, element)) {
          continue;
        }
        var cssTop = rule.style.getPropertyValue('top');
        var cssBottom = rule.style.getPropertyValue('bottom');
        if ((cssTop && cssTop !== 'auto') || (cssBottom && cssBottom !== 'auto')) {
          return true;
        }
      }
    }
    return false;
  };

  dialogPolyfill.needsCentering = function(dialog) {
    var computedStyle = window.getComputedStyle(dialog);
    if (computedStyle.position !== 'absolute') {
      return false;
    }

    // We must determine whether the top/bottom specified value is non-auto.  In
    // WebKit/Blink, checking computedStyle.top == 'auto' is sufficient, but
    // Firefox returns the used value. So we do this crazy thing instead: check
    // the inline style and then go through CSS rules.
    if ((dialog.style.top !== 'auto' && dialog.style.top !== '') ||
        (dialog.style.bottom !== 'auto' && dialog.style.bottom !== '')) {
      return false;
    }
    return !dialogPolyfill.isInlinePositionSetByStylesheet(dialog);
  };

  /**
   * @param {!Element} element to force upgrade
   */
  dialogPolyfill.forceRegisterDialog = function(element) {
    if (window.HTMLDialogElement || element.showModal) {
      console.warn('This browser already supports <dialog>, the polyfill ' +
          'may not work correctly', element);
    }
    if (element.localName !== 'dialog') {
      throw new Error('Failed to register dialog: The element is not a dialog.');
    }
    new dialogPolyfillInfo(/** @type {!HTMLDialogElement} */ (element));
  };

  /**
   * @param {!Element} element to upgrade, if necessary
   */
  dialogPolyfill.registerDialog = function(element) {
    if (!element.showModal) {
      dialogPolyfill.forceRegisterDialog(element);
    }
  };

  /**
   * @constructor
   */
  dialogPolyfill.DialogManager = function() {
    /** @type {!Array<!dialogPolyfillInfo>} */
    this.pendingDialogStack = [];

    var checkDOM = this.checkDOM_.bind(this);

    // The overlay is used to simulate how a modal dialog blocks the document.
    // The blocking dialog is positioned on top of the overlay, and the rest of
    // the dialogs on the pending dialog stack are positioned below it. In the
    // actual implementation, the modal dialog stacking is controlled by the
    // top layer, where z-index has no effect.
    this.overlay = document.createElement('div');
    this.overlay.className = '_dialog_overlay';
    this.overlay.addEventListener('click', function(e) {
      this.forwardTab_ = undefined;
      e.stopPropagation();
      checkDOM([]);  // sanity-check DOM
    }.bind(this));

    this.handleKey_ = this.handleKey_.bind(this);
    this.handleFocus_ = this.handleFocus_.bind(this);

    this.zIndexLow_ = 100000;
    this.zIndexHigh_ = 100000 + 150;

    this.forwardTab_ = undefined;

    if ('MutationObserver' in window) {
      this.mo_ = new MutationObserver(function(records) {
        var removed = [];
        records.forEach(function(rec) {
          for (var i = 0, c; c = rec.removedNodes[i]; ++i) {
            if (!(c instanceof Element)) {
              continue;
            } else if (c.localName === 'dialog') {
              removed.push(c);
            }
            removed = removed.concat(c.querySelectorAll('dialog'));
          }
        });
        removed.length && checkDOM(removed);
      });
    }
  };

  /**
   * Called on the first modal dialog being shown. Adds the overlay and related
   * handlers.
   */
  dialogPolyfill.DialogManager.prototype.blockDocument = function() {
    document.documentElement.addEventListener('focus', this.handleFocus_, true);
    document.addEventListener('keydown', this.handleKey_);
    this.mo_ && this.mo_.observe(document, {childList: true, subtree: true});
  };

  /**
   * Called on the first modal dialog being removed, i.e., when no more modal
   * dialogs are visible.
   */
  dialogPolyfill.DialogManager.prototype.unblockDocument = function() {
    document.documentElement.removeEventListener('focus', this.handleFocus_, true);
    document.removeEventListener('keydown', this.handleKey_);
    this.mo_ && this.mo_.disconnect();
  };

  /**
   * Updates the stacking of all known dialogs.
   */
  dialogPolyfill.DialogManager.prototype.updateStacking = function() {
    var zIndex = this.zIndexHigh_;

    for (var i = 0, dpi; dpi = this.pendingDialogStack[i]; ++i) {
      dpi.updateZIndex(--zIndex, --zIndex);
      if (i === 0) {
        this.overlay.style.zIndex = --zIndex;
      }
    }

    // Make the overlay a sibling of the dialog itself.
    var last = this.pendingDialogStack[0];
    if (last) {
      var p = last.dialog.parentNode || document.body;
      p.appendChild(this.overlay);
    } else if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  };

  /**
   * @param {Element} candidate to check if contained or is the top-most modal dialog
   * @return {boolean} whether candidate is contained in top dialog
   */
  dialogPolyfill.DialogManager.prototype.containedByTopDialog_ = function(candidate) {
    while (candidate = findNearestDialog(candidate)) {
      for (var i = 0, dpi; dpi = this.pendingDialogStack[i]; ++i) {
        if (dpi.dialog === candidate) {
          return i === 0;  // only valid if top-most
        }
      }
      candidate = candidate.parentElement;
    }
    return false;
  };

  dialogPolyfill.DialogManager.prototype.handleFocus_ = function(event) {
    if (this.containedByTopDialog_(event.target)) { return; }

    if (document.activeElement === document.documentElement) { return; }

    event.preventDefault();
    event.stopPropagation();
    safeBlur(/** @type {Element} */ (event.target));

    if (this.forwardTab_ === undefined) { return; }  // move focus only from a tab key

    var dpi = this.pendingDialogStack[0];
    var dialog = dpi.dialog;
    var position = dialog.compareDocumentPosition(event.target);
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      if (this.forwardTab_) {
        // forward
        dpi.focus_();
      } else if (event.target !== document.documentElement) {
        // backwards if we're not already focused on <html>
        document.documentElement.focus();
      }
    }

    return false;
  };

  dialogPolyfill.DialogManager.prototype.handleKey_ = function(event) {
    this.forwardTab_ = undefined;
    if (event.keyCode === 27) {
      event.preventDefault();
      event.stopPropagation();
      var cancelEvent = new supportCustomEvent('cancel', {
        bubbles: false,
        cancelable: true
      });
      var dpi = this.pendingDialogStack[0];
      if (dpi && dpi.dialog.dispatchEvent(cancelEvent)) {
        dpi.dialog.close();
      }
    } else if (event.keyCode === 9) {
      this.forwardTab_ = !event.shiftKey;
    }
  };

  /**
   * Finds and downgrades any known modal dialogs that are no longer displayed. Dialogs that are
   * removed and immediately readded don't stay modal, they become normal.
   *
   * @param {!Array<!HTMLDialogElement>} removed that have definitely been removed
   */
  dialogPolyfill.DialogManager.prototype.checkDOM_ = function(removed) {
    // This operates on a clone because it may cause it to change. Each change also calls
    // updateStacking, which only actually needs to happen once. But who removes many modal dialogs
    // at a time?!
    var clone = this.pendingDialogStack.slice();
    clone.forEach(function(dpi) {
      if (removed.indexOf(dpi.dialog) !== -1) {
        dpi.downgradeModal();
      } else {
        dpi.maybeHideModal();
      }
    });
  };

  /**
   * @param {!dialogPolyfillInfo} dpi
   * @return {boolean} whether the dialog was allowed
   */
  dialogPolyfill.DialogManager.prototype.pushDialog = function(dpi) {
    var allowed = (this.zIndexHigh_ - this.zIndexLow_) / 2 - 1;
    if (this.pendingDialogStack.length >= allowed) {
      return false;
    }
    if (this.pendingDialogStack.unshift(dpi) === 1) {
      this.blockDocument();
    }
    this.updateStacking();
    return true;
  };

  /**
   * @param {!dialogPolyfillInfo} dpi
   */
  dialogPolyfill.DialogManager.prototype.removeDialog = function(dpi) {
    var index = this.pendingDialogStack.indexOf(dpi);
    if (index === -1) { return; }

    this.pendingDialogStack.splice(index, 1);
    if (this.pendingDialogStack.length === 0) {
      this.unblockDocument();
    }
    this.updateStacking();
  };

  dialogPolyfill.dm = new dialogPolyfill.DialogManager();
  dialogPolyfill.formSubmitter = null;
  dialogPolyfill.useValue = null;

  /**
   * Installs global handlers, such as click listers and native method overrides. These are needed
   * even if a no dialog is registered, as they deal with <form method="dialog">.
   */
  if (window.HTMLDialogElement === undefined) {

    /**
     * If HTMLFormElement translates method="DIALOG" into 'get', then replace the descriptor with
     * one that returns the correct value.
     */
    var testForm = document.createElement('form');
    testForm.setAttribute('method', 'dialog');
    if (testForm.method !== 'dialog') {
      var methodDescriptor = Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, 'method');
      if (methodDescriptor) {
        // nb. Some older iOS and older PhantomJS fail to return the descriptor. Don't do anything
        // and don't bother to update the element.
        var realGet = methodDescriptor.get;
        methodDescriptor.get = function() {
          if (isFormMethodDialog(this)) {
            return 'dialog';
          }
          return realGet.call(this);
        };
        var realSet = methodDescriptor.set;
        methodDescriptor.set = function(v) {
          if (typeof v === 'string' && v.toLowerCase() === 'dialog') {
            return this.setAttribute('method', v);
          }
          return realSet.call(this, v);
        };
        Object.defineProperty(HTMLFormElement.prototype, 'method', methodDescriptor);
      }
    }

    /**
     * Global 'click' handler, to capture the <input type="submit"> or <button> element which has
     * submitted a <form method="dialog">. Needed as Safari and others don't report this inside
     * document.activeElement.
     */
    document.addEventListener('click', function(ev) {
      dialogPolyfill.formSubmitter = null;
      dialogPolyfill.useValue = null;
      if (ev.defaultPrevented) { return; }  // e.g. a submit which prevents default submission

      var target = /** @type {Element} */ (ev.target);
      if (!target || !isFormMethodDialog(target.form)) { return; }

      var valid = (target.type === 'submit' && ['button', 'input'].indexOf(target.localName) > -1);
      if (!valid) {
        if (!(target.localName === 'input' && target.type === 'image')) { return; }
        // this is a <input type="image">, which can submit forms
        dialogPolyfill.useValue = ev.offsetX + ',' + ev.offsetY;
      }

      var dialog = findNearestDialog(target);
      if (!dialog) { return; }

      dialogPolyfill.formSubmitter = target;

    }, false);

    /**
     * Replace the native HTMLFormElement.submit() method, as it won't fire the
     * submit event and give us a chance to respond.
     */
    var nativeFormSubmit = HTMLFormElement.prototype.submit;
    var replacementFormSubmit = function () {
      if (!isFormMethodDialog(this)) {
        return nativeFormSubmit.call(this);
      }
      var dialog = findNearestDialog(this);
      dialog && dialog.close();
    };
    HTMLFormElement.prototype.submit = replacementFormSubmit;

    /**
     * Global form 'dialog' method handler. Closes a dialog correctly on submit
     * and possibly sets its return value.
     */
    document.addEventListener('submit', function(ev) {
      var form = /** @type {HTMLFormElement} */ (ev.target);
      if (!isFormMethodDialog(form)) { return; }
      ev.preventDefault();

      var dialog = findNearestDialog(form);
      if (!dialog) { return; }

      // Forms can only be submitted via .submit() or a click (?), but anyway: sanity-check that
      // the submitter is correct before using its value as .returnValue.
      var s = dialogPolyfill.formSubmitter;
      if (s && s.form === form) {
        dialog.close(dialogPolyfill.useValue || s.value);
      } else {
        dialog.close();
      }
      dialogPolyfill.formSubmitter = null;

    }, true);
  }

  return dialogPolyfill;

}));

    }
    function patchDOMEventsLevel3() {
/** @license DOM Keyboard Event Level 3 polyfill | @version 0.4.4 | MIT License | github.com/termi */

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @warning_level VERBOSE
// @jscomp_warning missingProperties
// @output_file_name DOMEventsLevel3.shim.min.js
// @check_types
// ==/ClosureCompiler==
/**
 * @version 0.4
 * TODO::
 * 0. refactoring and JSDoc's
 * 1. Bug fixing:
 *   - FF: char "[" (keyCode:91) or "\"(keyCode:92) for key "OS"
 * 2. repeat property
 * 3. preventDefault for keypress for special keys (Ctrl+c, shift+a, etc) for Opera lt 12.50
 *
 * TODO Links:
 * 1. http://help.dottoro.com/ljlwfxum.php | onkeypress event | keypress event
 * 2. http://api.jquery.com/event.preventDefault/#comment-31391501 | Bug in Opera with keypress
 * 3. http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboard-event-order
 * 4. http://www.quirksmode.org/dom/events/keys.html
 * 5. http://stackoverflow.com/questions/9200589/keypress-malfunction-in-opera
 * 6. http://code.google.com/p/closure-library/source/browse/trunk/closure/goog/events/keyhandler.js
 * 7. http://www.javascripter.net/faq/keycodes.htm
 /*
 http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
 http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/DOM3-Events.html#events-KeyboardEvent
 */

/*
 http://lists.w3.org/Archives/Public/www-dom/2010JanMar/0062.html
 http://w3c-test.org/webapps/DOMEvents/tests/submissions/Microsoft/converted/EventObject.multiple.dispatchEvent.html
 Test Description: An event object may be properly dispatched multiple times while also allowing to prevent the event objects propagation prior to the event dispatch.
 var evt = document.createEvent("Event");
 evt.initEvent("foo", true, true);
 var el = document.createElement("_");
 var evtCount = 0;
 el.addEventListener(evt.type, function(e){ evtCount++; e.stopPropagation() });
 el.dispatchEvent(evt);
 el.dispatchEvent(evt);
 console.log(evtCount);
 PASS: IE9, FireFox
 FAILS: Chrome, Opera, Safari
*/

// [[[|||---=== GCC DEFINES START ===---|||]]]
/** @define {boolean} */
var __GCC__ECMA_SCRIPT_SHIMS__ = false;
//IF __GCC__ECMA_SCRIPT_SHIMS__ == true [
//TODO::
//]
var __GCC__NEW_KEYBOARD_EVENTS_PROPOSAL__ = true;
//more info: http://lists.w3.org/Archives/Public/www-dom/2012JulSep/0108.html
//]
// [[[|||---=== GCC DEFINES END ===---|||]]]

if( !function( global ) {
	try {
		return (new global["KeyboardEvent"]( "keyup", {"key": "a"} ))["key"] == "a";
	}
	catch ( __e__ ) {
		return false;
	}
}( this ) )void function( ) {

	var global = this

		, _DOM_KEY_LOCATION_STANDARD = 0x00 // Default or unknown location
		, _DOM_KEY_LOCATION_LEFT = 0x01 // e.g. Left Alt key
		, _DOM_KEY_LOCATION_RIGHT = 0x02 // e.g. Right Alt key
		, _DOM_KEY_LOCATION_NUMPAD = 0x03 // e.g. Numpad 0 or +
		, _DOM_KEY_LOCATION_MOBILE = 0x04
		, _DOM_KEY_LOCATION_JOYSTICK = 0x05

		, _Event_prototype = global["Event"].prototype

		, _KeyboardEvent_prototype = global["KeyboardEvent"] && global["KeyboardEvent"].prototype || _Event_prototype

		, _Event_prototype__native_key_getter

		, _Event_prototype__native_char_getter

		, _Event_prototype__native_location_getter

		, _Event_prototype__native_keyCode_getter

		, _Object_defineProperty = Object.defineProperty || function(obj, prop, val) {
			if( "value" in val ) {
				obj[prop] = val["value"];
				return;
			}

			if( "get" in val ) {
				obj.__defineGetter__(prop, val["get"]);
			}
			if( "set" in val ) {
				obj.__defineSetter__(prop, val["set"]);
			}
		}

		, _Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor

		, getObjectPropertyGetter = function( obj, prop ) {
			/* FF throw Error{message: "Illegal operation on WrappedNative prototype object", name: "NS_ERROR_XPC_BAD_OP_ON_WN_PROTO", result: 2153185292}
			 *  when Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, "location")
			 *  so using __lookupGetter__ instead
			 */
			return "__lookupGetter__" in obj ?
				obj.__lookupGetter__( prop ) :
				_Object_getOwnPropertyDescriptor ? (_Object_getOwnPropertyDescriptor( obj, prop ) || {})["get"] : void 0
			;
		}

		, KEYBOARD_EVENTS = {
			"keydown": null,
			"keyup": null,
			"keypress": null
		}
		, UUID = 1
		/** @const @type {string} */
		, _event_handleUUID = "_h_9e2"
		/** @const @type {string} */
		, _event_eventsUUID = "_e_8vj"
		/** @const @type {string} */
		, _shim_event_keyCodeUUID = _event_handleUUID + "__keyCode"

		, _keyboardEvent_properties_dictionary = {
			"char": "",
			"key": "",
			"location": _DOM_KEY_LOCATION_STANDARD,
			"ctrlKey": false,
			"shiftKey": false,
			"altKey": false,
			"metaKey": false,
			"repeat": false,
			"locale": "",

			"detail": 0,
			"bubbles": false,
			"cancelable": false
		}

		/** @const
		 * Opera lt 12.10 has no event.stopImmediatePropagation
		 * */
		, _Event_has_stopImmediatePropagation = "stopImmediatePropagation" in document.createEvent( "Event" )

		/** @const */
		, _Array_slice = Array.prototype.slice

		/** Use native "bind" or unsafe bind for service and performance needs
		 * @const
		 * @param {Object} object
		 * @param {...} var_args
		 * @return {Function} */
		, _unSafeBind = Function.prototype.bind || function( object, var_args ) {
			var __method = this
				, args = _Array_slice.call( arguments, 1 )
			;
			return function() {
				return __method.apply( object, args.concat( _Array_slice.call( arguments ) ) );
			}
		}

		/** @const */
		, _hasOwnProperty = _unSafeBind.call( Function.prototype.call, Object.prototype.hasOwnProperty )

		, _try_initKeyboardEvent = true

		, _getter_KeyboardEvent_location

		, _initKeyboardEvent_type = (function( _createEvent ) {
			try {
				var e = _createEvent.call(document,  "KeyboardEvent" );//Old browsers unsupported "KeyboardEvent"

				e.initKeyboardEvent(
					"keyup" // in DOMString typeArg
					, false // in boolean canBubbleArg
					, false // in boolean cancelableArg
					, global // in views::AbstractView viewArg
					, "+" // [test]in DOMString keyIdentifierArg | webkit event.keyIdentifier | IE9 event.char | IE9 event.key
					, 3 // [test]in unsigned long keyLocationArg | webkit event.keyIdentifier | IE9 event.key | IE9 event.location
					, true // [test]in boolean ctrlKeyArg | webkit event.shiftKey | old webkit event.ctrlKey | IE9 event.modifiersList
					, false // [test]shift | alt
					, true // [test]shift | alt
					, false // meta
					, false // altGraphKey
				);
				return ((e["keyIdentifier"] || e["key"]) == "+" && (e["keyLocation"] || e["location"]) == 3) && (
					e.ctrlKey ?
						e.altKey ? // webkit
							1
							:
							3
						:
						e.shiftKey ?
							2 // webkit
							:
							4 // IE9/IE10
					)
					|| (e["char"] == "+") && 5 //https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent#initKeyboardEvent()
					|| 9 // FireFox|w3c
				;
			}
			catch ( __e__ ) {
				return 0
			}
		})( document.createEvent )

		, canOverwrite_keyCode

		, canOverwrite_which

		, testKeyboardEvent = function() {
			try {
				return this && new this( "keyup", {"key": "a", "char": "b"} ) || {}
			} catch ( e ) {
				return {}
			}
		}.call( global["KeyboardEvent"] )

		, newKeyboadrEvent_key_property_proposal__getKey_

		, __Property_descriptor__ = {
			"enumerable": false
			, "configurable": true
			, "writable": true
		}
	;

	if( _Object_getOwnPropertyDescriptor ) {//Modern browser
		//IE9 has key property in KeyboardEvent.prototype otherwise Opera has no properties in KeyboardEvent.prototype
		_Event_prototype__native_key_getter = getObjectPropertyGetter( _KeyboardEvent_prototype, "key" ) || getObjectPropertyGetter( testKeyboardEvent, "key" );
		//IE9 has char property in KeyboardEvent.prototype otherwise Opera has no properties in KeyboardEvent.prototype
		_Event_prototype__native_char_getter = getObjectPropertyGetter( _KeyboardEvent_prototype, "char" ) || getObjectPropertyGetter( testKeyboardEvent, "char" );
		//IE9 has location property in KeyboardEvent.prototype otherwise Opera has no properties in KeyboardEvent.prototype
		_Event_prototype__native_location_getter = getObjectPropertyGetter( _KeyboardEvent_prototype, "location" ) || getObjectPropertyGetter( testKeyboardEvent, "location" );
		//IE9 doesn't allow overwrite "keyCode" and "charCode"
		_Event_prototype__native_keyCode_getter = getObjectPropertyGetter( _KeyboardEvent_prototype, "keyCode" );
	}

	/*

	 [OLD key-values-list] https://developer.mozilla.org/en/DOM/KeyboardEvent#Key_names_and_Char_values
	 [key-values-list] http://www.w3.org/TR/DOM-Level-3-Events/#key-values-list

	 Key | Char | Typical Usage (Informative) | Category (Informative)
	 'Attn' |  | The Attention (Attn) key. | General
	 'Apps' |  | Toggle display of available (interactive) application list. | General
	 'Crsel' |  | The Cursor Select (Crsel) key. | General
	 'ExSel' |  | The Extend Selection (ExSel) key. | General
	 'F1' |  | The F1 key, a general purpose function key, as index 1. | General
	 'F2' |  | The F2 key, a general purpose function key, as index 2. | General
	 'F3' |  | The F3 key, a general purpose function key, as index 3. | General
	 'F4' |  | The F4 key, a general purpose function key, as index 4. | General
	 'F5' |  | The F5 key, a general purpose function key, as index 5. | General
	 'F6' |  | The F6 key, a general purpose function key, as index 6. | General
	 'F7' |  | The F7 key, a general purpose function key, as index 7. | General
	 'F8' |  | The F8 key, a general purpose function key, as index 8. | General
	 'F9' |  | The F9 key, a general purpose function key, as index 9. | General
	 'F10' |  | The F10 key, a general purpose function key, as index 10. | General
	 'F11' |  | The F11 key, a general purpose function key, as index 11. | General
	 'F12' |  | The F12 key, a general purpose function key, as index 12. | General
	 'F13' |  | The F13 key, a general purpose function key, as index 13. | General
	 'F14' |  | The F14 key, a general purpose function key, as index 14. | General
	 'F15' |  | The F15 key, a general purpose function key, as index 15. | General
	 'F16' |  | The F16 key, a general purpose function key, as index 16. | General
	 'F17' |  | The F17 key, a general purpose function key, as index 17. | General
	 'F18' |  | The F18 key, a general purpose function key, as index 18. | General
	 'F19' |  | The F19 key, a general purpose function key, as index 19. | General
	 'F20' |  | The F20 key, a general purpose function key, as index 20. | General
	 'F21' |  | The F21 key, a general purpose function key, as index 21. | General
	 'F22' |  | The F22 key, a general purpose function key, as index 22. | General
	 'F23' |  | The F23 key, a general purpose function key, as index 23. | General
	 'F24' |  | The F24 key, a general purpose function key, as index 24. | General
	 'LaunchApplication1' |  | The Start Application One key. | General
	 'LaunchApplication2' |  | The Start Application Two key. | General
	 'LaunchMail' |  | The Start Mail key. | General
	 'List' |  | Toggle display listing of currently available content or programs. | General
	 'Props' |  | The properties (props) key. | General
	 'Soft1' |  | General purpose virtual function key, as index 1. | General
	 'Soft2' |  | General purpose virtual function key, as index 2. | General
	 'Soft3' |  | General purpose virtual function key, as index 3. | General
	 'Soft4' |  | General purpose virtual function key, as index 4. | General
	 'Accept' |  | The Accept (Commit, OK) key. Accept current option or input method sequence conversion. | UI
	 'Again' |  | The Again key, to redo or repeat an action. | UI
	 'Enter' |  | The Enter key, to activate current selection or accept current input. Note: This key value is also used for the 'Return' (Macintosh numpad) key. | UI
	 'Find' |  | The Find key. | UI
	 'Help' |  | Toggle display of help information. | UI
	 'Info' |  | Toggle display of information about currently selected context or media. | UI
	 'Menu' |  | Toggle display of content or system menu, if available. | UI
	 'ScrollLock' |  | The Scroll Lock key, to toggle between scrolling and cursor movement modes. | UI
	 'Execute' |  | The Execute key. | UI
	 'Cancel' | '\u0018' | The Cancel key. | UI
	 'Esc' | '\u001B' | The Escape (Esc) key, to initiate an escape sequence. | UI
	 'Exit' |  | Exit current state or current application (as appropriate). | UI
	 'Zoom' |  | Toggle between full-screen and scaled content, or alter magnification level. | UI
	 'Separator' |  | The Separator key, for context-sensitive text separators. | Character
	 'Spacebar' | '\u0020' | The Space (Spacebar) key (' '). | Character
	 'Add' | '\u002B' | The Add key, or plus sign ('+'). Note: the Add key is usually found on the numeric keypad (e.g., the 10-key) on typical 101-key keyboards and usually requires the 'NumLock' state to be enabled. | Character / Math
	 'Subtract' | '\u2212' | The Subtract key, or minus sign ('−'). Note: the Subtract key is usually found on the numeric keypad (e.g., the 10-key) on typical 101-key keyboards and usually requires the 'NumLock' state to be enabled. | Character / Math
	 'Multiply' | '\u002A' | The Multiply key, or multiplication sign ('*'). Note: the Multiply key is usually found on the numeric keypad (e.g., the 10-key) on typical 101-key keyboards and usually requires the 'NumLock' state to be enabled. Note: This key value can be represented by different characters depending on context, including  '\u002A' (ASTERISK, '*') or '\u00D7' (MULTIPLICATION SIGN, '×'). | Character / Math
	 'Divide' | '\u00F7' | The Divide key, or division sign ('÷'). Note: the Divide key is usually found on the numeric keypad (e.g., the 10-key) on typical 101-key keyboards and usually requires the 'NumLock' state to be enabled. | Character / Math
	 'Equals' | '\u003D' | The Equals key, or equals sign ('='). Note: the Equals key is usually found on the numeric keypad (e.g., the 10-key) on typical 101-key keyboards and usually requires the 'NumLock' state to be enabled. | Character / Math
	 'Decimal' | '\u2396' | The Decimal key, or decimal separator key symbol ('.'). Note: the Decimal key is usually found on the numeric keypad (e.g., the 10-key) on typical 101-key keyboards and usually requires the 'NumLock' state to be enabled. Note: This key value can be represented by different characters due to localization, such as '\u002E' (FULL STOP, '.') or '\u00B7' (MIDDLE DOT, '·'). | Character / Math
	 'BrightnessDown' |  | The Brightness Down key. Typically controls the display brightness. | Device
	 'BrightnessUp' |  | The Brightness Up key. Typically controls the display brightness. | Device
	 'Camera' |  | The Camera key. | Device
	 'Eject' |  | Toggle removable media to eject (open) and insert (close) state. | Device
	 'Power' |  | Toggle power state. Note: Some devices might not expose this key to the operating environment. | Device
	 'PrintScreen' |  | The Print Screen (PrintScrn, SnapShot) key, to initiate print-screen function. | Device
	 'BrowserFavorites' |  | The Browser Favorites key. | Browser
	 'BrowserHome' |  | The Browser Home key, used with keyboard entry, to go to the home page. | Browser
	 'BrowserRefresh' |  | The Browser Refresh key. | Browser
	 'BrowserSearch' |  | The Browser Search key. | Browser
	 'BrowserStop' |  | The Browser Stop key. | Browser
	 'HistoryBack' |  | Navigate to previous content or page in current history. | Browser
	 'HistoryForward' |  | Navigate to next content or page in current history. | Browser
	 'Left' |  | The left arrow key, to navigate or traverse leftward. | Navigation
	 'PageDown' |  | The Page Down key, to scroll down or display next page of content. | Navigation
	 'PageUp' |  | The Page Up key, to scroll up or display previous page of content. | Navigation
	 'Right' |  | The right arrow key, to navigate or traverse rightward. | Navigation
	 'Up' |  | The up arrow key, to navigate or traverse upward. | Navigation
	 'UpLeft' |  | The diagonal up-left arrow key, to navigate or traverse diagonally up and to the left. | Navigation
	 'UpRight' |  | The diagonal up-right arrow key, to navigate or traverse diagonally up and to the right. | Navigation
	 'Down' |  | The down arrow key, to navigate or traverse downward. | Navigation
	 'DownLeft' |  | The diagonal down-left arrow key, to navigate or traverse diagonally down and to the left. | Navigation
	 'DownRight' |  | The diagonal down-right arrow key, to navigate or traverse diagonally down and to the right. | Navigation
	 'Home' |  | The Home key, used with keyboard entry, to go to start of content. | Edit / Navigation
	 'End' |  | The End key, used with keyboard entry to go to the end of content. | Edit / Navigation
	 'Select' |  | The Select key. | Edit / Navigation
	 'Tab' | '\u0009' | The Horizontal Tabulation (Tab) key. | Edit / Navigation
	 'Backspace' | '\u0008' | The Backspace key. | Edit
	 'Clear' |  | The Clear key, for removing current selected input. | Edit
	 'Copy' |  | The Copy key. | Edit
	 'Cut' |  | The Cut key. | Edit
	 'Del' | '\u007F' | The Delete (Del) Key. Note: This key value is also used for the key labeled 'delete' on MacOS keyboards when modified by the 'Fn' key. | Edit
	 'EraseEof' |  | The Erase to End of Field key. This key deletes all characters from the current cursor position to the end of the current field. | Edit
	 'Insert' |  | The Insert (Ins) key, to toggle between text modes for insertion or overtyping. | Edit
	 'Paste' |  | The Paste key. | Edit
	 'Undo' |  | The Undo key. | Edit
	 'DeadGrave' | '\u0300' | The Combining Grave Accent (Greek Varia, Dead Grave) key. | Composition
	 'DeadEacute' | '\u0301' | The Combining Acute Accent (Stress Mark, Greek Oxia, Tonos, Dead Eacute) key. | Composition
	 'DeadCircumflex' | '\u0302' | The Combining Circumflex Accent (Hat, Dead Circumflex) key. | Composition
	 'DeadTilde' | '\u0303' | The Combining Tilde (Dead Tilde) key. | Composition
	 'DeadMacron' | '\u0304' | The Combining Macron (Long, Dead Macron) key. | Composition
	 'DeadBreve' | '\u0306' | The Combining Breve (Short, Dead Breve) key. | Composition
	 'DeadAboveDot' | '\u0307' | The Combining Dot Above (Derivative, Dead Above Dot) key. | Composition
	 'DeadUmlaut' | '\u0308' | The Combining Diaeresis (Double Dot Abode, Umlaut, Greek Dialytika, Double Derivative, Dead Diaeresis) key. | Composition
	 'DeadAboveRing' | '\u030A' | The Combining Ring Above (Dead Above Ring) key. | Composition
	 'DeadDoubleacute' | '\u030B' | The Combining Double Acute Accent (Dead Doubleacute) key. | Composition
	 'DeadCaron' | '\u030C' | The Combining Caron (Hacek, V Above, Dead Caron) key. | Composition
	 'DeadCedilla' | '\u0327' | The Combining Cedilla (Dead Cedilla) key. | Composition
	 'DeadOgonek' | '\u0328' | The Combining Ogonek (Nasal Hook, Dead Ogonek) key. | Composition
	 'DeadIota' | '\u0345' | The Combining Greek Ypogegrammeni (Greek Non-Spacing Iota Below, Iota Subscript, Dead Iota) key. | Composition
	 'DeadVoicedSound' | '\u3099' | The Combining Katakana-Hiragana Voiced Sound Mark (Dead Voiced Sound) key. | Composition
	 'DeadSemivoicedSound' | '\u309A' | The Combining Katakana-Hiragana Semi-Voiced Sound Mark (Dead Semivoiced Sound) key. | Composition
	 'Alphanumeric' |  | The Alphanumeric key. | Modifier
	 'Alt' |  | The Alternative (Alt, Option, Menu) key. Enable alternate modifier function for interpreting concurrent or subsequent keyboard input. Note: This key value is also used for the Apple 'Option' key. | Modifier
	 'AltGraph' |  | The Alt-Graph key. | Modifier
	 'CapsLock' |  | The Caps Lock (Capital) key. Toggle capital character lock function for interpreting subsequent keyboard input event. | Modifier
	 'Control' |  | The Control (Ctrl) key, to enable control modifier function for interpreting concurrent or subsequent keyboard input. | Modifier
	 'Fn' |  | The Function switch (Fn) key. Activating this key simultaneously with another key changes that key's value to an alternate character or function. | Modifier
	 'FnLock' |  | The Function-Lock (FnLock, F-Lock) key. Activating this key switches the mode of the keyboard to changes some keys' values to an alternate character or function.  | Modifier
	 'Meta' |  | The Meta key, to enable meta modifier function for interpreting concurrent or subsequent keyboard input. Note: This key value is also used for the Apple 'Command' key. | Modifier
	 'Process' |  | The Process key. | Modifier
	 'NumLock' |  | The Number Lock key, to toggle numer-pad mode function for interpreting subsequent keyboard input. | Modifier
	 'Shift' |  | The Shift key, to enable shift modifier function for interpreting concurrent or subsequent keyboard input. | Modifier
	 'SymbolLock' |  | The Symbol Lock key. | Modifier
	 'OS' |  | The operating system key (e.g. the "Windows Logo" key). | Modifier
	 'Compose' |  | The Compose key, also known as Multi_key on the X Window System. This key acts in a manner similar to a dead key, triggering a mode where subsequent key presses are combined to produce a different character. | Modifier
	 'AllCandidates' |  | The All Candidates key, to initate the multi-candidate mode. | IME
	 'NextCandidate' |  | The Next Candidate function key. | IME
	 'PreviousCandidate' |  | The Previous Candidate function key. | IME
	 'CodeInput' |  | The Code Input key, to initiate the Code Input mode to allow characters to be entered by their code points. | IME
	 'Convert' |  | The Convert key, to convert the current input method sequence. | IME
	 'Nonconvert' |  | The Nonconvert (Don't Convert) key, to accept current input method sequence without conversion in IMEs. | IME
	 'FinalMode' |  | The Final Mode (Final) key used on some Asian keyboards, to enable the final mode for IMEs. | IME
	 'FullWidth' |  | The Full-Width Characters key. | IME
	 'HalfWidth' |  | The Half-Width Characters key. | IME
	 'ModeChange' |  | The Mode Change key, to toggle between or cycle through input modes of IMEs. | IME
	 'RomanCharacters' |  | The Roman Characters function key, also known as the 'Youngja' or 'Young' key. | IME
	 'HangulMode' |  | The Hangul (Korean characters) Mode key, to toggle between Hangul and English modes. | IME
	 'HanjaMode' |  | The Hanja (Korean characters) Mode key. | IME
	 'JunjaMode' |  | The Junja (Korean characters) Mode key. | IME
	 'Hiragana' |  | The Hiragana (Japanese Kana characters) key. | IME
	 'JapaneseHiragana' |  | The Japanese-Hiragana key. | IME
	 'JapaneseKatakana' |  | The Japanese-Katakana key. | IME
	 'JapaneseRomaji' |  | The Japanese-Romaji key. | IME
	 'KanaMode' |  | The Kana Mode (Kana Lock) key. | IME
	 'KanjiMode' |  | The Kanji (Japanese name for ideographic characters of Chinese origin) Mode key. | IME
	 'Katakana' |  | The Katakana (Japanese Kana characters) key. | IME
	 'AudioFaderFront' |  | Adjust audio fader towards front. | Media
	 'AudioFaderRear' |  | Adjust audio fader towards rear. | Media
	 'AudioBalanceLeft' |  | Adjust audio balance leftward. | Media
	 'AudioBalanceRight' |  | Adjust audio balance rightward. | Media
	 'AudioBassBoostDown' |  | Decrease audio bass boost or cycle down through bass boost states. | Media
	 'AudioBassBoostUp' |  | Increase audio bass boost or cycle up through bass boost states. | Media
	 'AudioMute' |  | Toggle between muted state and prior volume level. | Media
	 'AudioVolumeDown' |  | Decrease audio volume. | Media
	 'AudioVolumeUp' |  | Increase audio volume. | Media
	 'MediaPause' |  | Pause playback, if not paused or stopped; also used with keyboard entry to pause scrolling output. | Media
	 'MediaPlay' |  | Initiate or continue media playback at normal speed, if not currently playing at normal speed. | Media
	 'MediaTrackEnd' |  | Seek to end of media or program. | Media
	 'MediaTrackNext' |  | Seek to next media or program track. | Media
	 'MediaPlayPause' |  | Toggle media between play and pause states. | Media
	 'MediaTrackPrevious' |  | Seek to previous media or program track. | Media
	 'MediaTrackSkip' |  | Skip current content or program. | Media
	 'MediaTrackStart' |  | Seek to start of media or program. | Media
	 'MediaStop' |  | Stop media playing, pausing, forwarding, rewinding, or recording, if not already stopped. | Media
	 'SelectMedia' |  | The Select Media key. | Media
	 'Blue' |  | General purpose color-coded media function key, as index 3. | Media
	 'Brown' |  | General purpose color-coded media function key, as index 5. | Media
	 'ChannelDown' |  | Select next (numerically or logically) lower channel.. | Media
	 'ChannelUp' |  | Select next (numerically or logically) higher channel. | Media
	 'ClearFavorite0' |  | Clear program or content stored as favorite 0. | Media
	 'ClearFavorite1' |  | Clear program or content stored as favorite 1. | Media
	 'ClearFavorite2' |  | Clear program or content stored as favorite 2. | Media
	 'ClearFavorite3' |  | Clear program or content stored as favorite 3. | Media
	 'Dimmer' |  | Adjust brightness of device, or toggle between or cycle through states. | Media
	 'DisplaySwap' |  | Swap video sources. | Media
	 'FastFwd' |  | Initiate or continue forward playback at faster than normal speed, or increase speed if already fast forwarding. | Media
	 'Green' |  | General purpose color-coded media function key, as index 1. | Media
	 'Grey' |  | General purpose color-coded media function key, as index 4. | Media
	 'Guide' |  | Toggle display of program or content guide. | Media
	 'InstantReplay' |  | Toggle instant replay. | Media
	 'MediaLast' |  | Select previously selected channel or media. | Media
	 'Link' |  | Launch linked content, if available and appropriate. | Media
	 'Live' |  | Toggle display listing of currently available live content or programs. | Media
	 'Lock' |  | Lock or unlock current content or program. | Media
	 'NextDay' |  | If guide is active and displayed, then display next day's content. | Media
	 'NextFavoriteChannel' |  | Select next favorite channel (in favorites list). | Media
	 'OnDemand' |  | Access on-demand content or programs. | Media
	 'PinPDown' |  | Move picture-in-picture window downward. | Media
	 'PinPMove' |  | Move picture-in-picture window. | Media
	 'PinPToggle' |  | Toggle display of picture-in-picture window. | Media
	 'PinPUp' |  | Move picture-in-picture window upward. | Media
	 'PlaySpeedDown' |  | Decrease media playback speed. | Media
	 'PlaySpeedReset' |  | Reset playback speed to normal speed (according to current media function). | Media
	 'PlaySpeedUp' |  | Increase media playback speed. | Media
	 'PrevDay' |  | If guide is active and displayed, then display previous day's content. | Media
	 'RandomToggle' |  | Toggle random media or content shuffle mode. | Media
	 'RecallFavorite0' |  | Select (recall) program or content stored as favorite 0. | Media
	 'RecallFavorite1' |  | Select (recall) program or content stored as favorite 1. | Media
	 'RecallFavorite2' |  | Select (recall) program or content stored as favorite 2. | Media
	 'RecallFavorite3' |  | Select (recall) program or content stored as favorite 3. | Media
	 'MediaRecord' |  | Initiate or resume recording of currently selected media. | Media
	 'RecordSpeedNext' |  | Toggle or cycle between media recording speeds (if applicable). | Media
	 'Red' |  | General purpose color-coded media function key, as index 0. | Media
	 'MediaRewind' |  | Initiate or continue reverse playback at faster than normal speed, or increase speed if already rewinding. | Media
	 'RfBypass' |  | Toggle RF (radio frequency) input bypass mode. | Media
	 'ScanChannelsToggle' |  | Toggle scan channels mode. | Media
	 'ScreenModeNext' |  | Advance display screen mode to next available mode. | Media
	 'Settings' |  | Toggle display of device settings screen. | Media
	 'SplitScreenToggle' |  | Toggle split screen mode. | Media
	 'StoreFavorite0' |  | Store current program or content as favorite 0. | Media
	 'StoreFavorite1' |  | Store current program or content as favorite 1. | Media
	 'StoreFavorite2' |  | Store current program or content as favorite 2. | Media
	 'StoreFavorite3' |  | Store current program or content as favorite 3. | Media
	 'Subtitle' |  | Toggle display of subtitles, if available. | Media
	 'AudioSurroundModeNext' |  | Advance surround audio mode to next available mode. | Media
	 'Teletext' |  | Toggle display of teletext, if available. | Media
	 'VideoModeNext' |  | Advance video mode to next available mode. | Media
	 'DisplayWide' |  | Toggle device display mode between wide aspect and normal aspect mode. | Media
	 'Wink' |  | Cause device to identify itself in some manner, e.g., audibly or visibly. | Media
	 'Yellow' |  | General purpose color-coded media function key, as index 2. | Media
	 'Unidentified' |  | This key value is used when an implementations is unable to identify another key value, due to either hardware, platform, or software constraints. | Special
	 */

	var
	/**
	 *Key map based on http://calormen.com/polyfill/keyboard.js
	 * @const
	 */
		VK__NON_CHARACTER_KEYS = {
			3: 'Cancel', // char \x0018 ???
			6: 'Help', // ???
			8: 'Backspace',
			9: 'Tab',
			12: 'Clear', // NumPad Center
			13: 'Enter',

			16: 'Shift',
			17: 'Control',
			18: 'Alt',
			19: 'Pause', // TODO:: not in [key-values-list], but usefull
			20: 'CapsLock',

			21: 'KanaMode', // IME
			22: 'HangulMode', // IME
			23: 'JunjaMode', // IME
			24: 'FinalMode', // IME
			25: 'HanjaMode', // IME
			//  0x19: 'KanjiMode', keyLocation: _KeyboardEvent.DOM_KEY_LOCATION_STANDARD, // IME; duplicate on Windows

			27: 'Esc',

			28: 'Convert', // IME
			29: 'Nonconvert', // IME
			30: 'Accept', // IME
			31: 'ModeChange', // IME

			32: 'Spacebar',
			33: 'PageUp',
			34: 'PageDown',
			35: 'End',
			36: 'Home',
			37: 'Left',
			38: 'Up',
			39: 'Right',
			40: 'Down',
			41: 'Select',
			//42: 'Print', // ??? not in [key-values-list]
			43: 'Execute',
			44: 'PrintScreen',
			45: 'Insert',
			46: 'Del',
			47: 'Help', // ???

			91: { _key: 'OS', _char: false, _location: _DOM_KEY_LOCATION_LEFT }, // Left Windows
			92: { _key: 'OS', _char: false, _location: _DOM_KEY_LOCATION_RIGHT }, // Right Windows
			93: 'Menu', // 'Context Menu' from [OLD key-values-list]

			// TODO: Test in WebKit
			106: { _key: 'Multiply', _char: '*', _location: _DOM_KEY_LOCATION_NUMPAD }, // or 'Asterisk' ?
			107: { _key: 'Add', _char: '+', _location: _DOM_KEY_LOCATION_NUMPAD },
			108: { _key: 'Separator', _char: false, _location: _DOM_KEY_LOCATION_NUMPAD }, // ??? NumPad Enter ???
			109: { _key: 'Subtract', _char: '-', _location: _DOM_KEY_LOCATION_NUMPAD },
			110: { _key: 'Decimal', _char: '.', _location: _DOM_KEY_LOCATION_NUMPAD },
			111: { _key: 'Divide', _char: '/'/* TODO:: or '\u00F7' */, _location: _DOM_KEY_LOCATION_NUMPAD },

			// TODO: Test in WebKit
			144: { _key: 'NumLock', _char: false, _location: _DOM_KEY_LOCATION_NUMPAD },
			145: 'ScrollLock',

			// NOTE: Not exposed to browsers so we don't need this
			/*
			 0xA0: { _key : 'Shift', _char: false, _location: _DOM_KEY_LOCATION_LEFT },
			 0xA1: { _key : 'Shift', _char: false, _location: _DOM_KEY_LOCATION_RIGHT },
			 0xA2: { _key : 'Control', _char: false, _location: _DOM_KEY_LOCATION_LEFT },
			 0xA3: { _key : 'Control', _char: false, _location: _DOM_KEY_LOCATION_RIGHT },
			 0xA4: { _key : 'Alt', _char: false, _location: _DOM_KEY_LOCATION_LEFT },
			 0xA5: { _key : 'Alt', _char: false, _location: _DOM_KEY_LOCATION_RIGHT },
			 */

			180: 'LaunchMail',
			181: 'SelectMedia',
			182: 'LaunchApplication1',
			183: 'LaunchApplication2',

			// TODO: Check keyIdentifier in WebKit
			224: 'Meta', // Apple Command key
			229: 'Process', // IME

			246: 'Attn',
			247: 'Crsel',
			248: 'Exsel',
			249: 'EraseEof',
			251: 'Zoom',
			254: 'Clear'
		}
		, VK__CHARACTER_KEYS__DOWN_UP = __GCC__NEW_KEYBOARD_EVENTS_PROPOSAL__ ?
		{
			186: ';'// 'ж', ';', ':'
			, 187: '='
			, 188: ','// 'б', ',', '<'
			, 189: '-'
			, 190: '.'// 'ю', '.', '>'
			, 191: '/'// '.', '/', '?'
			, 192: '`'// 'ё', '`', '~'
			, 219: '['// 'х', '[', '{'
			, 220: '\\'//'\', '\', '|'
			, 221: ']'// 'ъ', '[', '{'
			, 222: "'"// 'э', '"', '''
			, 226: '\\'// '\', '|', '/'
		}
		: { }
		, _userAgent_ = global.navigator.userAgent.toLowerCase()
		, _IS_MAC = !!~(global.navigator.platform + "").indexOf( "Mac" )
		, _BROWSER = {}
		, __i
		/** @type {boolean} */
		, IS_NEED_KEYCODE_BUGFIX
		/** @type {boolean} */
		, IS_OPERA_DOUBBLE_KEYPRESS_BUG
		, tmp
		/** @const @type {number} */
		, _KEYPRESS_VK__CHARACTER_KEYS__DOWN_UP_DELTA = 999
	;

	for( __i = 105 ; __i > 95 ; --__i ) {
		//0, 1, 2 ... 9
		tmp = __i - 96;
		VK__CHARACTER_KEYS__DOWN_UP[tmp + 48] = _Event_prototype__native_key_getter ? tmp + "" : {_key : tmp + ""};//48, 49, 50 ... 57

		//0-9 on Numpad
		VK__CHARACTER_KEYS__DOWN_UP[__i] = { _key: tmp + "", _location: _DOM_KEY_LOCATION_NUMPAD };//96, 97, 98 .. 105
	}

	if( !_Event_prototype__native_key_getter ) {
		for(__i in VK__CHARACTER_KEYS__DOWN_UP) if(_hasOwnProperty(VK__CHARACTER_KEYS__DOWN_UP, __i) && typeof(VK__CHARACTER_KEYS__DOWN_UP[__i]) != "object") {
			VK__CHARACTER_KEYS__DOWN_UP[__i] = {_key: VK__CHARACTER_KEYS__DOWN_UP[__i]};
		}
	}

	// 0x70 ~ 0x87: 'F1' ~ 'F24'
	for( __i = 135 ; __i > 111 ; --__i ) {
		VK__NON_CHARACTER_KEYS[__i] = "F" + (__i - 111);
	}

	if( global["opera"] ) {// Opera special cases
		if( !_Event_prototype__native_char_getter ) {
			//TODO: for Win only?
			IS_NEED_KEYCODE_BUGFIX = true;
			IS_OPERA_DOUBBLE_KEYPRESS_BUG = true;//TODO:: avoid Opera double keypress bug

			/*
			 VK__NON_CHARACTER_KEYS[43] = VK__NON_CHARACTER_KEYS[0x6B];	// key:'Add', char:'+'
			 VK__NON_CHARACTER_KEYS[43]._keyCode = 107;
			 VK__NON_CHARACTER_KEYS[43]._needkeypress = true;	// instead of _key: 0
			 VK__NON_CHARACTER_KEYS[45] = VK__NON_CHARACTER_KEYS[0x6D];	// key:'Subtract', char:'-'
			 VK__NON_CHARACTER_KEYS[45]._keyCode = 109;
			 VK__NON_CHARACTER_KEYS[45]._needkeypress = true;	// instead of _key: 0
			 */
			VK__NON_CHARACTER_KEYS[57351] = VK__NON_CHARACTER_KEYS[93];	//'Menu'
			VK__CHARACTER_KEYS__DOWN_UP[187] = VK__CHARACTER_KEYS__DOWN_UP[61] = {_key: 0, _keyCode: 187};	//'=' (US Standard ? need to ckeck it out)
			VK__CHARACTER_KEYS__DOWN_UP[189] = VK__CHARACTER_KEYS__DOWN_UP[109] = {_key: 0, _keyCode: 189/*not for 187 keyCode, but for 109 */, _location: 3};//TODO: location=3 only for win? //'-' (US Standard ? need to ckeck it out)
			/*
			 Unusable for Opera due to key '[' has keyCode=219 and key '\' has keyCode=220
			 TODO: filtering by keypress event. 'OS' key has no keypress event
			 (VK__NON_CHARACTER_KEYS[219] = VK__NON_CHARACTER_KEYS[0x5B])._keyCode = 91;
			 (VK__NON_CHARACTER_KEYS[220] = VK__NON_CHARACTER_KEYS[0x5C])._keyCode = 92;
			 */

			if( _IS_MAC ) {
				/*TODO::
				 0x11: { keyIdentifier: 'Meta' },
				 0xE030: { keyIdentifier: 'Control' }
				 */
			}
		}
	}
	else {
		//browser sniffing
		_BROWSER["names"] = _userAgent_.match( /(mozilla|compatible|chrome|webkit|safari)/gi );
		__i = _BROWSER["names"] && _BROWSER["names"].length || 0;
		while( __i-- > 0 )_BROWSER[_BROWSER["names"][__i]] = true;

		if( _BROWSER["mozilla"] && !_BROWSER["compatible"] && !_BROWSER["webkit"] ) {// Mozilla special cases
			//TODO:: only Windows?
			IS_NEED_KEYCODE_BUGFIX = true;

			//Firefox version
			_BROWSER._version = +(_userAgent_.match( /firefox\/([0-9]+)/ ) || [])[1];

			tmp = VK__CHARACTER_KEYS__DOWN_UP[61] = VK__CHARACTER_KEYS__DOWN_UP[187];//US Standard
			tmp._keyCode = 187;
			tmp = VK__CHARACTER_KEYS__DOWN_UP[173] = VK__CHARACTER_KEYS__DOWN_UP[189];//US Standard
			tmp._keyCode = 189;
			tmp = VK__CHARACTER_KEYS__DOWN_UP[59] = VK__CHARACTER_KEYS__DOWN_UP[186];//US Standard
			tmp._keyCode = 186;
			if( _BROWSER._version < 15 ) {
				VK__NON_CHARACTER_KEYS[107] = VK__NON_CHARACTER_KEYS[61];
				VK__CHARACTER_KEYS__DOWN_UP[109] = VK__CHARACTER_KEYS__DOWN_UP[173];

				//Can't handle Subtract(key="-",location="3") and Add(key="+",location="3") keys in FF < 15
			}
		}
		else if( _BROWSER["safari"] && !_BROWSER["chrome"] ) {// Safari WebKit special cases
			/*TODO::
			 0x03: { keyIdentifier: 'Enter', keyName: 'Enter', keyChar: '\u000D' }, // old Safari
			 0x0A: { keyIdentifier: 'Enter', keyName: 'Enter', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_MOBILE, keyChar: '\u000D' }, // iOS
			 0x19: { keyIdentifier: 'U+0009', keyName: 'Tab', keyChar: '\u0009'} // old Safari for Shift+Tab
			 */
			if( _IS_MAC ) {
				/*
				 0x5B: { keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
				 0x5D: { keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },
				 0xE5: { keyIdentifier: 'U+0051', keyName: 'Q', keyChar: 'Q'} // On alternate presses, Ctrl+Q sends this
				 */
			}
		}
		else if( _BROWSER["chrome"] ) {// Chrome WebKit special cases
			if( _IS_MAC ) {
				/*TODO::
				 0x5B: { keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
				 0x5D: { keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT }
				 */
			}
		}
	}

	var VK__FAILED_KEYIDENTIFIER = {//webkit 'keyIdentifier' or Opera12.10/IE9 'key'
		//keyIdentifier.substring( 0, 2 ) !== "U+"
		//'U+0008': null, // -> 'Backspace'
		//'U+0009': null, // -> 'Tab'
		//'U+0020': null, // -> 'Spacebar'
		//'U+007F': null, // -> 'Del'
		//'U+0010': null, // [test this] -> 'Fn' ?? 'Function' ?
		//'U+001C': null, // [test this] -> 'Left'
		//'U+001D': null, // [test this] -> 'Right'
		//'U+001E': null, // [test this] -> 'Up'
		//'U+001F': null, // [test this] -> 'Down'

		'Escape': null, // from [OLD key-values-list] -> 'Esc'
		'Win': null, // from [OLD key-values-list] -> 'OS'
		'Scroll': null, // from [OLD key-values-list] -> 'ScrollLock'
		'Apps': null, // from [OLD key-values-list] -> 'Menu'

		//From Opera impl
		'Delete': null, // from [OLD key-values-list] -> 'Del'
		'Window': null, // from [OLD key-values-list] -> 'OS'
		'ContextMenu': null, // from [OLD key-values-list] -> 'Menu'
		'Mul': null // from [OLD key-values-list] -> 'Multiply'
		/*
		 0xAD: 'VolumeMute',
		 0xAE: 'VolumeDown',
		 0xAF: 'VolumeUp',
		 0xB0: 'MediaNextTrack',
		 0xB1: 'MediaPreviousTrack',
		 0xB2: 'MediaStop',
		 0xB3: 'MediaPlayPause',
		 */

		/*
		 0xA6: 'BrowserBack',
		 0xA7: 'BrowserForward',
		 0xA8: 'BrowserRefresh',
		 0xA9: 'BrowserStop',
		 0xAA: 'BrowserSearch',
		 0xAB: 'BrowserFavorites',
		 0xAC: 'BrowserHome',
		 */

		/*
		 0xFA: 'Play',
		 */
	};

// NOTE: 'char' is the default character for that key, and doesn't reflect modifier
// states. It is primarily used here to indicate that this is a non-special key
// BUGS:
// do we need some kind of detection ?
	/*TODO::
	 VK_SPECIAL = {
	 // Mozilla special cases
	 'moz': {
	 0x3B: 'U+00BA', keyName: 'Semicolon', keyChar: ';', _shiftChar: ':', // ; : (US Standard)
	 0x3D: 'U+00BB', keyName: 'Equals', keyChar: '=', _shiftChar: '+', // = +
	 0x6B: 'U+00BB', keyName: 'Equals', keyChar: '=', _shiftChar: '+', // = +
	 0x6D: 'U+00BD', keyName: 'Minus', keyChar: '-', _shiftChar: '_', // - _
	 // TODO: Check keyIdentifier in WebKit for numpad
	 0xBB: 'Add', keyName: 'Add', keyLocation: _DOM_KEY_LOCATION_NUMPAD, keyChar: '+',
	 0xBD: 'Subtract', keyName: 'Subtract', keyLocation: _DOM_KEY_LOCATION_NUMPAD, keyChar: '-' }
	 },

	 // Chrome WebKit special cases
	 'chrome': {
	 },
	 'chrome-mac': {
	 0x5B: 'Meta', keyLocation: _DOM_KEY_LOCATION_LEFT,
	 0x5D: 'Meta', keyLocation: _DOM_KEY_LOCATION_RIGHT }
	 },


	 // Safari WebKit special cases
	 'safari': {
	 0x03: 'Enter', _keyCode: 13, keyName: 'Enter', keyChar: '\u000D', // old Safari
	 0x0A: 'Enter', _keyCode: 13, keyName: 'Enter', keyLocation: _KeyboardEvent.DOM_KEY_LOCATION_MOBILE, keyChar: '\u000D', // iOS
	 0x19: 'Tab', _keyCode: 9, keyName: 'Tab', keyChar: '\u0009'} // old Safari for Shift+Tab
	 },
	 'safari-mac': {
	 0x5B: 'Meta', keyLocation: _DOM_KEY_LOCATION_LEFT,
	 0x5D: 'Meta', keyLocation: _DOM_KEY_LOCATION_RIGHT,
	 0xE5: 'U+0051', keyName: 'Q', keyChar: 'Q'} // On alternate presses, Ctrl+Q sends this
	 },

	 // Opera special cases
	 'opera': {
	 // NOTE: several of these collide in theory, but most other keys are unrepresented
	 [true,cant prevent in input]0x2F: 'Divide', _keyCode: 111, keyName: 'Divide', keyLocation: _DOM_KEY_LOCATION_NUMPAD, keyChar: '/', // Same as 'Help'
	 [true,cant prevent in input]0x2A: 'Multiply', _keyCode: 106, keyName: 'Multiply', keyLocation: _DOM_KEY_LOCATION_NUMPAD, keyChar: '*', // Same as 'Print'
	 [true,cant prevent in input]//0x2D: 'Subtract', keyName: 'Subtract', _ keyCode: 109, keyLocation: _DOM_KEY_LOCATION_NUMPAD,   keyChar: '-', // Same as 'Insert'
	 [true,cant prevent in input]0x2B: 'Add', keyName: 'Add', _ keyCode: 107, keyLocation: _DOM_KEY_LOCATION_NUMPAD, keyChar: '+', // Same as 'Execute'

	 [true]0x3B: 'U+00BA', _keyCode: 186, keyName: 'Semicolon', keyChar: ';', _shiftChar: '', // ; : (US Standard)
	 [true]0x3D: 'U+00BB', _keyCode: 187, keyName: 'Equals', keyChar: '=', _shiftChar: '', // = +

	 [no need]0x6D: 'U+00BD', keyName: 'Minus', keyChar: '-', _shiftChar: '_'} // - _
	 },
	 'opera-mac': {
	 0x11: 'Meta',
	 0xE030: 'Control' }
	 }
	 };
	 */


	/**
	 * http://html5labs.interoperabilitybridges.com/dom4events/#constructors-keyboardevent
	 * http://www.w3.org/TR/DOM-Level-3-Events/#idl-interface-KeyboardEvent-initializers
	 * https://www.w3.org/Bugs/Public/show_bug.cgi?id=14052
	 * @constructor
	 * @param {string} type
	 * @param {Object=} dict
	 */
	function _KeyboardEvent ( type, dict ) {// KeyboardEvent  constructor
		var e;
		try {
			e = document.createEvent( "KeyboardEvent" );
		}
		catch ( err ) {
			e = document.createEvent( "Event" );
		}

		dict = dict || {};

		var localDict = {}
			, _prop_name
			, _prop_value
		;

		for( _prop_name in _keyboardEvent_properties_dictionary )if( _hasOwnProperty( _keyboardEvent_properties_dictionary, _prop_name ) ) {
			localDict[_prop_name] = _prop_name in dict && (_prop_value = dict[_prop_name]) !== void 0 ?
				_prop_value
				:
				_keyboardEvent_properties_dictionary[_prop_name]
			;
		}

		var _ctrlKey = localDict["ctrlKey"] || false
			, _shiftKey = localDict["shiftKey"] || false
			, _altKey = localDict["altKey"] || false
			, _metaKey = localDict["metaKey"] || false
			, _altGraphKey = localDict["altGraphKey"] || false

			, modifiersListArg = _initKeyboardEvent_type > 3 ? (
					(_ctrlKey ? "Control" : "")
					+ (_shiftKey ? " Shift" : "")
					+ (_altKey ? " Alt" : "")
					+ (_metaKey ? " Meta" : "")
					+ (_altGraphKey ? " AltGraph" : "")
				).trim() : null

			, _key = (localDict["key"] || "") + ""
			, _char = (localDict["char"] || "") + ""
			, _location = localDict["location"]
			, _keyCode = _key && _key.charCodeAt( 0 ) || 0 //TODO:: more powerfull key to charCode

			, _bubbles = localDict["bubbles"]
			, _cancelable = localDict["cancelable"]

			, _repeat = localDict["repeat"]
			, _locale = localDict["locale"]

			, success_init = false
		;

		_keyCode = localDict["keyCode"] = localDict["keyCode"] || _keyCode;
		localDict["which"] = localDict["which"] || _keyCode;

		if( !canOverwrite_keyCode ) {//IE9
			e["__keyCode"] = _keyCode;
			e["__charCode"] = _keyCode;
			e["__which"] = _keyCode;
		}


		if( "initKeyEvent" in e ) {//FF
			//https://developer.mozilla.org/en/DOM/event.initKeyEvent

			e.initKeyEvent( type, _bubbles, _cancelable, global,
				_ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _keyCode );
			success_init = true;
		}
		else if( "initKeyboardEvent" in e ) {
			//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()

			if( _try_initKeyboardEvent ) {
				try {
					if( _initKeyboardEvent_type == 1 ) { // webkit
						/*
						 http://stackoverflow.com/a/8490774/1437207
						 For Webkit-based browsers (Safari/Chrome), the event initialization call should look a bit differently (see https://bugs.webkit.org/show_bug.cgi?id=13368):
						 initKeyboardEvent(
						 in DOMString typeArg,
						 in boolean canBubbleArg,
						 in boolean cancelableArg,
						 in views::AbstractView viewArg,
						 in DOMString keyIdentifierArg,
						 in unsigned long keyLocationArg,
						 in boolean ctrlKeyArg,
						 in boolean shiftKeyArg,
						 in boolean altKeyArg,
						 in boolean metaKeyArg,
						 in boolean altGraphKeyArg
						 );
						 */
						e.initKeyboardEvent( type, _bubbles, _cancelable, global, _key, _location, _ctrlKey, _shiftKey, _altKey, _metaKey, _altGraphKey );
						e["__char"] = _char;
					}
					else if( _initKeyboardEvent_type == 2 ) { // old webkit
						/*
						 http://code.google.com/p/chromium/issues/detail?id=52408
						 event.initKeyboardEvent(
						 "keypress",        //  in DOMString typeArg,
						 true,             //  in boolean canBubbleArg,
						 true,             //  in boolean cancelableArg,
						 null,             //  in nsIDOMAbstractView viewArg,  Specifies UIEvent.view. This value may be null.
						 false,            //  in boolean ctrlKeyArg,
						 false,            //  in boolean altKeyArg,
						 false,            //  in boolean shiftKeyArg,
						 false,            //  in boolean metaKeyArg,
						 13,              //  in unsigned long keyCodeArg,
						 0                //  in unsigned long charCodeArg
						 );
						 */
						e.initKeyboardEvent( type, _bubbles, _cancelable, global, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _keyCode );
					}
					else if( _initKeyboardEvent_type == 3 ) { // webkit
						/*
						 initKeyboardEvent(
						 type,
						 canBubble,
						 cancelable,
						 view,
						 keyIdentifier,
						 keyLocationA,
						 ctrlKey,
						 altKey,
						 shiftKey,
						 metaKey,
						 altGraphKey
						 );
						 */
						e.initKeyboardEvent( type, _bubbles, _cancelable, global, _key, _location, _ctrlKey, _altKey, _shiftKey, _metaKey, _altGraphKey );
						e["__char"] = _char;
					}
					else if( _initKeyboardEvent_type == 4 ) { // IE9
						/*
						 http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
						 eventType [in] Type: BSTR One of the following values, or a user-defined custom event type: keydown,keypress,keyup
						 canBubble [in] Type: VARIANT_BOOL
						 cancelable [in] Type: VARIANT_BOOL
						 viewArg [in] Type: IHTMLWindow2 The active window object or null. This value is returned in the view property of the event.
						 keyArg [in] Type: BSTR The key identifier. This value is returned in the key property of the event.
						 locationArg [in] Type: unsigned long The location of the key on the device. This value is returned in the location property of the event.
						 modifiersListArg [in] Type: BSTR A space-separated list of any of the following values: Alt,AltGraph,CapsLock,Control,Meta,NumLock,Scroll,Shift,Win
						 repeat [in] Type: VARIANT_BOOL The number of times this key has been pressed. This value is returned in the repeat property of the event.
						 locale [in] Type: BSTR The locale name. This value is returned in the locale attribute of the event.
						 */
						e.initKeyboardEvent( type, _bubbles, _cancelable, global, _key, _location, modifiersListArg, _repeat, _locale );
						e["__char"] = _char;
					}
					else if( _initKeyboardEvent_type == 5 ) { // FireFox|w3c
						/*
						 http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
						 https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
						 void initKeyboardEvent(
						 in DOMString typeArg,
						 in boolean canBubbleArg,
						 in boolean cancelableArg,
						 in views::AbstractView viewArg,
						 in DOMString charArg,
						 in DOMString keyArg,
						 in unsigned long locationArg,
						 in DOMString modifiersListArg,
						 in boolean repeat,
						 in DOMString localeArg
						 );
						 */
						e.initKeyboardEvent( type, _bubbles, _cancelable, global, _char, _key, _location, modifiersListArg, _repeat, _locale );
					}
					else { // w3c TODO:: test for browsers that implement it
						/*
						 http://docs.webplatform.org/wiki/dom/methods/initKeyboardEvent
						 initKeyboardEvent(
						 eventType
						 canBubble
						 cancelable
						 view
						 key
						 location
						 modifiersList
						 repeat
						 locale);
						 */
						e.initKeyboardEvent( type, _bubbles, _cancelable, global, _key, _location, modifiersListArg, _repeat, _locale );
					}
					success_init = true;
				}
				catch ( __e__ ) {
					_try_initKeyboardEvent = false;
				}
			}
		}


		if( !success_init ) {
			e.initEvent( type, _bubbles, _cancelable, global );
			e["__char"] = _char;
			e["__key"] = _key;
			e["__location"] = _location;
		}

		for( _prop_name in _keyboardEvent_properties_dictionary )if( _hasOwnProperty( _keyboardEvent_properties_dictionary, _prop_name ) ) {
			if( e[_prop_name] != localDict[_prop_name] ) {
				delete e[_prop_name];
				_Object_defineProperty( e, _prop_name, { writable: true, "value": localDict[_prop_name] } );
			}
		}

		if( !("isTrusted" in e) )e.isTrusted = false;

		return e;
	}

	_KeyboardEvent["DOM_KEY_LOCATION_STANDARD"] = _DOM_KEY_LOCATION_STANDARD; // Default or unknown location
	_KeyboardEvent["DOM_KEY_LOCATION_LEFT"] = _DOM_KEY_LOCATION_LEFT; // e.g. Left Alt key
	_KeyboardEvent["DOM_KEY_LOCATION_RIGHT"] = _DOM_KEY_LOCATION_RIGHT; // e.g. Right Alt key
	_KeyboardEvent["DOM_KEY_LOCATION_NUMPAD"] = _DOM_KEY_LOCATION_NUMPAD; // e.g. Numpad 0 or +
	_KeyboardEvent["DOM_KEY_LOCATION_MOBILE"] = _DOM_KEY_LOCATION_MOBILE;
	_KeyboardEvent["DOM_KEY_LOCATION_JOYSTICK"] = _DOM_KEY_LOCATION_JOYSTICK;
	_KeyboardEvent.prototype = _KeyboardEvent_prototype;

	tmp = new _KeyboardEvent( "keyup" );

	try {
		delete tmp["keyCode"];
		_Object_defineProperty( tmp, "keyCode", { "writable": true, "value": 9 } );
		delete tmp["which"];
		_Object_defineProperty( tmp, "which", { "writable": true, "value": 9 } );
	}
	catch(e){}

	canOverwrite_which = tmp.which === 9;

	if( !(canOverwrite_keyCode = tmp.keyCode == 9) && _Event_prototype__native_keyCode_getter ) {
		_Object_defineProperty( _KeyboardEvent_prototype, "keyCode", {
			"enumerable": true,
			"configurable": true,
			"get": function() {
				if( "__keyCode" in this )return this["__keyCode"];

				return _Event_prototype__native_keyCode_getter.call( this );
			},
			"set": function( newValue ) {
				return this["__keyCode"] = isNaN( newValue ) ? 0 : newValue;
			}
		} );
		_Object_defineProperty( _KeyboardEvent_prototype, "charCode", {
			"enumerable": true,
			"configurable": true,
			"get": function() {
				if( "__charCode" in this )return this["__charCode"];

				return _Event_prototype__native_keyCode_getter.call( this );
			},
			"set": function( newValue ) {
				return this["__charCode"] = isNaN( newValue ) ? 0 : newValue;
			}
		} );
	}
	else {
		_Event_prototype__native_keyCode_getter = void 0;

		/*ovewrite_keyCode_which_charCode = function(key) {
		 //["which", "keyCode", "charCode"].forEach
		 var _event = this["e"]
		 , _keyCode = this["k"]
		 ;
		 if(!_event || !_keyCode)return;

		 delete _event[key];
		 _Object_defineProperty(_event, key, {value : _keyCode});
		 }*/
	}

	if( __GCC__NEW_KEYBOARD_EVENTS_PROPOSAL__ ) {
		/**
		 * @this {Event}
		 * @param {string} originalKey
		 * */
		newKeyboadrEvent_key_property_proposal__getKey_ = function( originalKey ) {
			originalKey = originalKey || "";
			if( originalKey.length > 1 ) {//fast IS SPECIAL KEY
				return originalKey;
			}

			var eventKeyCode = this.which || this.keyCode;

			if( this.type == "keypress" ) {
				//http://www.w3.org/TR/DOM-Level-3-Events/#event-type-keypress
				//Warning! the keypress event type is defined in this specification for reference and completeness, but this specification deprecates the use of this event type. When in editing contexts, authors can subscribe to the "input" event defined in [HTML5] instead.

				eventKeyCode += _KEYPRESS_VK__CHARACTER_KEYS__DOWN_UP_DELTA;
			}

			var vkCharacterKey = VK__CHARACTER_KEYS__DOWN_UP[eventKeyCode]
				, value_is_object = vkCharacterKey && typeof vkCharacterKey == "object"
				, _key = value_is_object ? vkCharacterKey._key : vkCharacterKey
				, _keyCode
			;

			if(_key)return _key;

			_keyCode = vkCharacterKey && vkCharacterKey._keyCode
				|| (eventKeyCode > 64 && eventKeyCode < 91 && eventKeyCode)//a-z
			;

			return (_keyCode && String.fromCharCode( _keyCode ) || originalKey).toLowerCase()
		}
	}

	function _helper_isRight_keyIdentifier ( _keyIdentifier ) {
		return _keyIdentifier && !(_keyIdentifier in VK__FAILED_KEYIDENTIFIER) && _keyIdentifier.substring( 0, 2 ) !== "U+";
	}

	_Object_defineProperty( _KeyboardEvent_prototype, "key", {
		"enumerable": true,
		"configurable": true,
		"get": function() {
			var thisObj = this
				, value
			;

			if( _Event_prototype__native_key_getter ) {//IE9 & Opera
				value = _Event_prototype__native_key_getter.call( thisObj );

				if( value && value.length < 2 || _helper_isRight_keyIdentifier(value) ) {
					if( __GCC__NEW_KEYBOARD_EVENTS_PROPOSAL__ ) {
						return newKeyboadrEvent_key_property_proposal__getKey_.call( this, value );
					}
					else {
						return value;
					}
				}
			}

			if( "__key" in thisObj )return thisObj["__key"];

			if( !(thisObj.type in KEYBOARD_EVENTS) )return;

			var _keyCode = thisObj.which || thisObj.keyCode
				, notKeyPress = thisObj.type != "keypress"
				, value_is_object
			;

			if( notKeyPress ) {
				if( "keyIdentifier" in thisObj && _helper_isRight_keyIdentifier( thisObj["keyIdentifier"] ) ) {
					value = thisObj["keyIdentifier"];
				}
				else if( !__GCC__NEW_KEYBOARD_EVENTS_PROPOSAL__ || !notKeyPress || (value = VK__NON_CHARACTER_KEYS[_keyCode]) ) {
					value = value || VK__CHARACTER_KEYS__DOWN_UP[_keyCode];
					value_is_object = value && typeof value == "object";
					value =
						(value_is_object ? value._key : value) ||
							thisObj["char"]//char getter
					;
				}
				else {
					value = newKeyboadrEvent_key_property_proposal__getKey_.call( this, value );
				}
			}
			else { // For keypress
				value = thisObj["char"];//char getter
			}

			__Property_descriptor__["value"] = value;
			_Object_defineProperty(thisObj, "__key", __Property_descriptor__);
			return value;
		}
	} );
	_Object_defineProperty( _KeyboardEvent_prototype, "char", {
		"enumerable": true,
		"configurable": true,
		"get": function() {
			var thisObj = this;

			if( !(thisObj.type in KEYBOARD_EVENTS) )return;

			if( thisObj.ctrlKey
				|| thisObj.altKey
				|| thisObj.metaKey
			) {
				return "";
			}

			if( "__char" in thisObj )return thisObj["__char"];

			var value
				, notKeyPress = thisObj.type != "keypress"
				, _keyCode = !notKeyPress && thisObj["__keyCode"] || thisObj.which || thisObj.keyCode
				, value_is_object
			;

			if( notKeyPress && (value = VK__NON_CHARACTER_KEYS[_keyCode]) && !(typeof value == "object") ) {
				//Test for Special key (Esc, Shift, Insert etc) and that this Special key has no "char" value
				return "";
			}

			if( _Event_prototype__native_char_getter && (value = _Event_prototype__native_char_getter.call( thisObj )) !== null ) {//IE9 & Opera
				//unfortunately after initKeyboardEvent _Event_prototype__native_char_getter starting to return "null"
				//so save 'true' char in "__char"
			}
			else {
				value = VK__CHARACTER_KEYS__DOWN_UP[_keyCode] || VK__NON_CHARACTER_KEYS[_keyCode];
				value_is_object = value && typeof value == "object";

				if( !value_is_object || value._char === false ) {
					//For special keys event.char is empty string (or "Undeterminade" as in spec)
					value = "";
				}
				else if( value_is_object && value._char !== void 0 ) {
					value = value._char || "";
				}
				else {
					if( "keyIdentifier" in thisObj && _helper_isRight_keyIdentifier( thisObj["keyIdentifier"] ) ) {//webkit
						value = "";
					}
					else {
						/*TODO:: remove this block
						 if( notKeyPress && value_is_object && value._keyCode ) {
						 //_keyCode = value._keyCode;
						 }*/
						value = String.fromCharCode( _keyCode );
						if( notKeyPress && !thisObj.shiftKey ) {
							value = value.toLowerCase();
						}
					}
				}

			}

			__Property_descriptor__["value"] = value;
			_Object_defineProperty(thisObj, "__char", __Property_descriptor__);
			return value;
		}
	} );
	_getter_KeyboardEvent_location = function() {
		var thisObj = this;

		if( _Event_prototype__native_location_getter ) {//IE9
			return _Event_prototype__native_location_getter.call( this );
		}

		if( "__location" in thisObj )return thisObj["__location"];

		if( !(thisObj.type in KEYBOARD_EVENTS) )return;

		var _keyCode = thisObj.which || thisObj.keyCode
			, notKeyPress = thisObj.type != "keypress"
			, value
		;

		/*Not working with _KeyboardEvent function and do we realy need this anyway?
		 if(thisObj.type == "keypress") {
		 //TODO:: tests
		 value = 0;
		 }
		 else */
		if( "keyLocation" in thisObj ) {//webkit
			value = thisObj["keyLocation"];
		}
		else {
			value = notKeyPress && (VK__NON_CHARACTER_KEYS[_keyCode] || VK__CHARACTER_KEYS__DOWN_UP[_keyCode]);
			value = typeof value == "object" && value._location || _DOM_KEY_LOCATION_STANDARD;
		}

		__Property_descriptor__["value"] = value;
		_Object_defineProperty(thisObj, "__location", __Property_descriptor__);
		return value;
	};
	_Object_defineProperty( _KeyboardEvent_prototype, "location", {
		"enumerable": true,
		"configurable": true,
		"get": _getter_KeyboardEvent_location
	} );

	function _keyDownHandler ( e ) {
		var _keyCode = e.which || e.keyCode
			, thisObj = this._this
			, listener
			, _
			, vkNonCharacter
			// There is no keypress event for Ctrl + <any key> and Alt + <any key>
			//  and "char" property for for such a key combination is undefined.
			//  Not even trying to find out "char" value. It's useless
		;

		/*TODO: testing
		 if(canOverwrite_keyCode && vkCommon && vkCommon._keyCode && e.keyCode != vkCommon._keyCode) {
		 ["which", "keyCode", "charCode"].forEach(ovewrite_keyCode_which_charCode, {"e" : e, "k" : vkCommon._keyCode});
		 }*/

		if( // passed event if the is no need to transform it
			e.ctrlKey || e.altKey || e.metaKey//Special events
			|| ((vkNonCharacter = VK__NON_CHARACTER_KEYS[_keyCode]) && vkNonCharacter._key !== 0)
			|| e["__key"] || e.isTrusted === false // Synthetic event
		) {
			listener = this._listener;

			if( typeof listener === "object" ) {
				if( "handleEvent" in listener ) {
					thisObj = listener;
					listener = listener.handleEvent;
				}
			}

			if( listener && listener.apply ) {
				listener.apply( thisObj, arguments );
			}
		}
		else {
			_ = thisObj["_"] || (thisObj["_"] = {});
			_[_shim_event_keyCodeUUID] = _keyCode;

			//Fix Webkit keyLocation bug ("i", "o" and others keys "keyLocation" in 'keypress' event == 3. Why?)
			if( "keyLocation" in e ) {//TODO:: tests
				_["_keyLocation"] = e.keyLocation;
			}
		}
	}

	function _keyDown_via_keyPress_Handler ( e ) {
		var _keyCode
			, _charCode = e.which || e.keyCode
			, thisObj = this
			, _ = thisObj["_"]
			, _event
			, need__stopImmediatePropagation__and__preventDefault
			, vkCharacterKey
			, __key
		;

		if( e["__stopNow"] )return;

		if( _ && _shim_event_keyCodeUUID in _ ) {
			_keyCode = _[_shim_event_keyCodeUUID];
			delete _[_shim_event_keyCodeUUID];

			e["__keyCode"] = _keyCode;//save keyCode from 'keydown' and 'keyup' for 'keypress'

			if( vkCharacterKey = VK__CHARACTER_KEYS__DOWN_UP[_keyCode]) {
				if( IS_NEED_KEYCODE_BUGFIX && vkCharacterKey._keyCode ) {
					_keyCode = vkCharacterKey._keyCode;
				}
			}

			//Fix Webkit keyLocation bug ("i", "o" and others keys "keyLocation" in 'keypress' event == 3. Why?)
			if( "keyLocation" in e && "_keyLocation" in _ ) {//webkit//TODO:: tests
				delete e.keyLocation;
				e.keyLocation = _["_keyLocation"];
			}

			if( __GCC__NEW_KEYBOARD_EVENTS_PROPOSAL__ ) {
				if( _keyCode < 91 && _keyCode > 64 && _charCode != _keyCode && (!VK__CHARACTER_KEYS__DOWN_UP[_keyCode]) ) {
					vkCharacterKey = vkCharacterKey || (VK__CHARACTER_KEYS__DOWN_UP[_keyCode] = {});
					vkCharacterKey._keyCode = _keyCode;
				}
			}

			__key = vkCharacterKey && vkCharacterKey._key || (String.fromCharCode(_keyCode)).toLowerCase();

			e["__key"] = __key;
			e["__char"] = String.fromCharCode(_charCode);

			_event = new global["KeyboardEvent"]( "keydown", e );

			delete _event["keyLocation"];//webkit //TODO: need this???
			delete _event["__location"];

			if( canOverwrite_which ) {//Not Safari
				delete _event["which"];
				_Object_defineProperty( _event, "which", {"value": _keyCode} );
			}
			else {
				_event["__which"] = _keyCode;
			}
			if( canOverwrite_keyCode ) {//Not IE9 | Not Safari
				delete _event["keyCode"];
				_Object_defineProperty( _event, "keyCode", {"value": _keyCode} );
			}
			_event["__location"] = _getter_KeyboardEvent_location.call( _event );

			if( !_Event_prototype__native_key_getter ) {//Not IE9 & Opera 12
				vkCharacterKey = vkCharacterKey || (vkCharacterKey = VK__CHARACTER_KEYS__DOWN_UP[_charCode] = VK__CHARACTER_KEYS__DOWN_UP[_keyCode] = {});

				vkCharacterKey._char = _event["char"];

				if( !__GCC__NEW_KEYBOARD_EVENTS_PROPOSAL__ ) {
					vkCharacterKey._key = vkCharacterKey._char;
				}
			}

			need__stopImmediatePropagation__and__preventDefault = !(e.target || thisObj).dispatchEvent( _event );
			//if need__stopImmediatePropagation__and__preventDefault == true -> preventDefault and stopImmediatePropagation
		}
		else {
			//handle key what not generate character's key
			need__stopImmediatePropagation__and__preventDefault = (
				!e.ctrlKey &&
					(_ = VK__CHARACTER_KEYS__DOWN_UP[_charCode]) && (typeof _ == "object" ? _._key || "" : _).length > 1
				) ?
				2//Only stopImmediatePropagation
				:
				0//Nothing
			;
		}

		if( need__stopImmediatePropagation__and__preventDefault ) {
			if( need__stopImmediatePropagation__and__preventDefault === true ) {
				e.preventDefault();
			}

			if( _Event_has_stopImmediatePropagation ) {
				e.stopImmediatePropagation();
			}
			else {
				e["__stopNow"] = true;
				e.stopPropagation();
			}
		}
	}

	/*
	 var __TEMP_KEY
	 , __TEMP_KEYCODE
	 , __TEMP_CHAR
	 , __TEMP_KEYLOCATION
	 ;

	 document.addEventListener("mousedown", function(e) {
	 //debugger
	 var _keyCode = e.which || e.keyCode
	 , thisObj = this
	 , listener
	 , special = e.ctrlKey || e.altKey
	 , vkCommon = VK__NON_CHARACTER_KEYS[_keyCode]
	 ;

	 if(special || vkCommon && vkCommon._key !== 0 || e["__key"]) {

	 }
	 else {
	 __TEMP_KEYCODE = _keyCode;

	 //Fix Webkit keyLocation bug ("i", "o" and others keys "keyLocation" in 'keypress' event == 3. Why?)
	 if("keyLocation" in e) {//TODO:: tests
	 __TEMP_KEYLOCATION = e.keyLocation;
	 }

	 e.stopImmediatePropagation();
	 }
	 }, true);*/
	if( !_Event_prototype__native_char_getter ) {
		[
			(tmp = global["Document"]) && tmp.prototype || global["document"],
			(tmp = global["HTMLDocument"]) && tmp.prototype,
			(tmp = global["Window"]) && tmp.prototype || global,
			(tmp = global["Node"]) && tmp.prototype,
			(tmp = global["Element"]) && tmp.prototype
		].forEach( function( prototypeToFix ) {
				if(!prototypeToFix || !_hasOwnProperty(prototypeToFix, "addEventListener"))return;
				
				var old_addEventListener = prototypeToFix.addEventListener
					, old_removeEventListener = prototypeToFix.removeEventListener
				;

				if( old_addEventListener ) {					
					prototypeToFix.addEventListener = function( type, listener, useCapture ) {
						var thisObj = this
							, _
							, _eventsUUID
							, _event_UUID
							, _events_countUUID
						;

						if( (type + "").toLowerCase() === "keydown" ) {
							//debugger
							_eventsUUID = _event_eventsUUID + (useCapture ? "-" : "") + type;
							_event_UUID = _eventsUUID + (listener[_event_handleUUID] || (listener[_event_handleUUID] = ++UUID));
							_events_countUUID = _eventsUUID + "__count";

							if( !(_ = this["_"]) )_ = this["_"] = {};

							if( _event_UUID in _ )return;

							if( _[_events_countUUID] === void 0 ) {
								old_addEventListener.call( thisObj, "keypress", _keyDown_via_keyPress_Handler, true );
							}

							_[_events_countUUID] = (_[_events_countUUID] || 0) + 1;

							arguments[1] = _[_event_UUID] = _unSafeBind.call( _keyDownHandler, {_listener: listener, _this: this} );
						}

						return old_addEventListener.apply( thisObj, arguments );
					};

					if( old_removeEventListener )prototypeToFix.removeEventListener = function( type, listener, useCapture ) {
						var thisObj = this
							, _
							, _eventsUUID
							, _event_UUID
							, _events_countUUID
						;

						if( (type + "").toLowerCase() === "keydown" ) {
							_eventsUUID = _event_eventsUUID + (useCapture ? "-" : "") + type;
							_event_UUID = _eventsUUID + listener[_event_handleUUID];
							_events_countUUID = _eventsUUID + "__count";
							_ = thisObj["_"];

							if( _event_UUID && _ && _[_events_countUUID] ) {
								--_[_events_countUUID];

								if( arguments[1] = _[_event_UUID] ) {
									delete _[_event_UUID];
								}
							}
						}

						return old_removeEventListener.apply( thisObj, arguments );
					};
				}
			} );	
	}
	else {
		document.addEventListener("keydown", function(e) {
			var _char = (_Event_prototype__native_char_getter ? _Event_prototype__native_char_getter.call(e) : e["char"])
				, _charCode = _char && _char.charCodeAt(0)
				, _keyCode
				, vkCharacter
				, vkCharacter_key
			;
			if( _charCode && !(VK__CHARACTER_KEYS__DOWN_UP[_charCode += _KEYPRESS_VK__CHARACTER_KEYS__DOWN_UP_DELTA]) ) {
				vkCharacter = VK__CHARACTER_KEYS__DOWN_UP[_charCode] = {};
				_keyCode = e.keyCode;
				if( vkCharacter_key = VK__CHARACTER_KEYS__DOWN_UP[_keyCode] ) {
					_char = typeof vkCharacter_key == "object" && vkCharacter_key._key || vkCharacter_key;
				}
				else {
					_char = String.fromCharCode(_keyCode);
				}
				if(_keyCode > 64 && _keyCode < 91 && _keyCode) {//a-z
					_char = _char.toLowerCase();
				}
				vkCharacter._key = _char;
			}
		}, true);
	}


	//export
	global["KeyboardEvent"] = _KeyboardEvent;

	//cleaning
	_DOM_KEY_LOCATION_LEFT = _DOM_KEY_LOCATION_RIGHT = _DOM_KEY_LOCATION_NUMPAD = _DOM_KEY_LOCATION_MOBILE = _DOM_KEY_LOCATION_JOYSTICK =
		_Object_getOwnPropertyDescriptor = getObjectPropertyGetter = tmp = testKeyboardEvent = _KeyboardEvent = _KeyboardEvent_prototype = __i =
			_Event_prototype = _userAgent_ = _BROWSER = _IS_MAC = null;
}.call( this );

    }
    function patchPointerEvents() {
/*
 * Pointer Events Polyfill: Adds support for the style attribute
 * "pointer-events: none" to browsers without this feature (namely, IE).
 * (c) 2013, Kent Mewhort, licensed under BSD. See LICENSE.txt for details.
 */

// constructor
function PointerEventsPolyfill(options) {
    // set defaults
    this.options = {
        selector: '*',
        mouseEvents: ['click', 'dblclick', 'mousedown', 'mouseup'],
        usePolyfillIf: function() {
            if (navigator.appName == 'Microsoft Internet Explorer')
            {
                /* jshint ignore:start */
                var agent = navigator.userAgent;
                if (agent.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/) != null) {
                    var version = parseFloat(RegExp.$1);
                    if (version < 11)
                      return true;
                }
                /* jshint ignore:end */
            }
            return false;
        }
    };
    if (options) {
        var obj = this;
        $.each(options, function(k, v) {
          obj.options[k] = v;
        });
    }

    if (this.options.usePolyfillIf())
      this.register_mouse_events();
}


/**
 * singleton initializer
 *
 * @param   {object}    options     Polyfill options.
 * @return  {object}    The polyfill object.
 */

PointerEventsPolyfill.initialize = function(options) {
/* jshint ignore:start */
    if (PointerEventsPolyfill.singleton == null)
      PointerEventsPolyfill.singleton = new PointerEventsPolyfill(options);
/* jshint ignore:end */
    return PointerEventsPolyfill.singleton;
};


/**
 * handle mouse events w/ support for pointer-events: none
 */
PointerEventsPolyfill.prototype.register_mouse_events = function() {
    // register on all elements (and all future elements) matching the selector
    $(document).on(
        this.options.mouseEvents.join(' '),
        this.options.selector,
        function(e) {
        if ($(this).css('pointer-events') == 'none') {
             // peak at the element below
             var origDisplayAttribute = $(this).css('display');
             $(this).css('display', 'none');

             var underneathElem = document.elementFromPoint(
                e.clientX,
                e.clientY);

            if (origDisplayAttribute)
                $(this)
                    .css('display', origDisplayAttribute);
            else
                $(this).css('display', '');

             // fire the mouse event on the element below
            e.target = underneathElem;
            $(underneathElem).trigger(e);

            return false;
        }
        return true;
    });
};

    }
    if(window.browser){
        window.browser.addPatches({
            'patchResourceHints':patchResourceHints,
            'patchDialog':patchDialog,
            'patchDataset':patchDataset,
            'patchPointerEvents':patchPointerEvents
        })
    }
    if(window.browser.isIE){
        if(window.browser.version  === 10){
            window.navigator.language = window.navigator.language ||(window.navigator.userLanguage && window.navigator
                    .userLanguage.replace(/-[a-z]{2}$/, String.prototype.toUpperCase)) || 'en-US'
        }
        if(window.browser.version >= 9){
            patchDOMEventsLevel3()
        }
        patchLocationOrigin()
    }

})(this,this.document)