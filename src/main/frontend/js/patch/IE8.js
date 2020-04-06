/**
 * Created by kenhuang on 2019/1/11.
 */
(function (window,document) {
    function patchCanvas() {
        window.FlashCanvasOptions = {swfPath:location.protocol+'//'+location.host+'/swf/'}
        // import 'flashcanvas.js'
    }

    function patchVideoAudio() {
        // import 'jquery.js'
        // import 'mediaelement-and-player.js'
    }

    function patchGeoLocation() {
        // import 'geo.js'
    }

    function patchES5() {
        // import "es5-shim.js"
    }

    function patchJSON() {
        // import 'json.js'
    }

    function patchBackgroundBorder() {
        // import 'PIE_IE678_uncompressed.js'
    }

    function patchDOMImplementation() {
        // import 'DOMImplementation.prototype.createDocument.js'
    }

    function patchDom2() {
        // import 'ie8.max.js'
    }

    function patchHTMLSelectElement() {
        // import 'HTMLSelectElement.js'
    }

    function patchXMLHttpRequest() {
        window.XMLHttpRequest = window.XMLHttpRequest || function() {
                try { return new window.ActiveXObject("Msxml2.XMLHTTP.6.0") } catch (_) { }
                try { return new window.ActiveXObject("Msxml2.XMLHTTP.3.0") } catch (_) { }
                try { return new window.ActiveXObject("Msxml2.XMLHTTP") } catch (_) { }
                throw Error("This browser does not support XMLHttpRequest.")
        }
        window.XMLHttpRequest.UNSENT = 0
        window.XMLHttpRequest.OPENED = 1
        window.XMLHttpRequest.HEADERS_RECEIVED = 2
        window.XMLHttpRequest.LOADING = 3
        window.XMLHttpRequest.DONE = 4
    }

    function patchDetails() {
        // import "Element.details.ie8.js"
    }

    function patchViewportUnits() {
        // import "tokenizer.js"
        // import "vminpoly.js"
        // import "parser.js"
    }

    function patchCSSObjectFit() {
        // import 'object-fit-polyfill.js'
    }

    function patchMediaQueries() {
        // import 'respond.src.js'
    }

    if(window.browser){
        var patches = {
            'patchCanvas':patchCanvas,
            'patchVideoAudio':patchVideoAudio,
            'patchGeoLocation':patchGeoLocation,
            'patchDOMImplementation':patchDOMImplementation,
            'patchBackgroundBorder':patchBackgroundBorder,
            'patchViewportUnits':patchViewportUnits,
            'patchCSSObjectFit':patchCSSObjectFit,
            'patchMediaQueries':patchMediaQueries,
            'patchHTMLSelectElement':patchHTMLSelectElement
        }
        if(window.browser.isIE && window.browser.version === 8){
            patches.patchDetails  = patchDetails
        }
        window.browser.addPatches(patches)
        document.head = document.head || document.getElementsByTagName('head')[0]
    }
    patchJSON()
    patchES5()

    patchXMLHttpRequest()
    if(window.browser.isIE && window.browser.version === 8){
        patchDom2()
    }
})(this,this.document)

