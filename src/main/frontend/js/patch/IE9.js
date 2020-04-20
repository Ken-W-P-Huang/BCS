/**
 * Created by kenhuang on 2018/12/16.
 */

(function (window,document) {

    function patchConsole() {
        /**
         * 直接禁用console相关功能。可以在IE6安装companionjs启用
         * IE8/9只能在调试模式下才启用console
         */
        var prop, method
        var dummy = function() {}
        var properties = ['memory']
        var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
        'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
        'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',')
        if (window  && !window.console) {
            var console
            window.console = {}
            console = window.console
            while (prop = properties.pop()){ // jshint ignore:line
                if (!console[prop]) {
                    console[prop] = {}
                }
            }
            while (method = methods.pop()) { // jshint ignore:line
                if (!console[method]) {
                    console[method] = dummy
                }
            }
        }
    }
    // Known issue: If an element is created using the overridden createElement method this element returns a document fragment as its parentNode, but should be normally null. If a script relies on this behavior, shivMethodsshould be set to false. Note: jQuery 1.7+ has implemented his own HTML5 DOM creation fix for Internet Explorer 6-8. If all your scripts (including Third party scripts) are using jQuery's manipulation and DOM creation methods, you might want to set this option to false.
    function patchHTML5() {
        // import 'html5shiv-printshiv.js'
        window.html5.shivMethods = false
    }

    function patchWebSockets() {
        var WEB_SOCKET_SWF_LOCATION = "./swf/WebSocketMain.swf"
        // import 'swfobject.js'
        // import 'web_socket.js'
    }

    function patchHistory() {
        // import 'history.html4.js'
        // import 'history.js'
        // import 'history.adapter.native.js'
    }

    function patchCSS3() {
        // import 'PIE_IE9_uncompressed.js'
    }

    function patchFormData() {
        // import 'FormData.es5.js'
    }

    function patchTransform() {
        // import 'EventHelpers.js'
        // import 'cssQuery-p.js'
        // import 'sylvester.src.js'
        /* jshint ignore:start */
         window.$V = Vector.create
         window.$M = Matrix.create
         window.$L = Line.create
         window.$P = Plane.create
        // import 'cssSandpaper.js'
        window.cssSandpaper = cssSandpaper
        window.MatrixGenerator = MatrixGenerator
        /* jshint ignore:end */
    }
    function patchWebPerformance() {
        // import 'usertiming.js'
    }
    function patchPlaceholder() {
        // import 'placeholders.js'
    }
    
    function patchBlob() {
        // import 'Blob.js'
    }

    function patchBase64() {
        // import 'base64.js'
    }

    function patchTypedArray() {
        // import 'typedarray.js'
    }

    function patchWorker() {
        // import 'fakeworker.js'
    }
    function patchXPath() {
        // import 'xpath.js'
    }
    function patchPageVisibility() {
        // import 'visibly.js'
    }

    function patchOfflineEvents() {
        // import 'offline-events.js'
    }
    function patchRequestAnimationFrame() {
        // import 'raf.js'
    }
    function patchProgress() {
        // import 'raf.js'
    }
    function patchRangeSelection() {
        // import 'rangy-classapplier.js'
        // import 'rangy-core.js'
        // import 'rangy-highlighter.js'
        // import 'rangy-selectionsaverestore.js'
        // import 'rangy-serializer.js'
    }

    function patchCSS3Filter(path,isSkipStylesheets) {
        var polyfilter_scriptpath = path || './js/'
        var polyfilter_skip_stylesheets = isSkipStylesheets || true
        // import 'cssParser.js'
        // import 'css-filters-polyfill.js'
    }

    if(window.browser){
        var patches =  {
            // 'patchHTML5':patchHTML5,
            'patchWebSockets':patchWebSockets,
            'patchHistory':patchHistory,
            'patchWebPerformance':patchWebPerformance,
            'patchTransform':patchTransform,
            'patchPlaceholder':patchPlaceholder,
            'patchBlob':patchBlob,
            'patchBase64':patchBase64,
            'patchTypedArray':patchTypedArray,
            'patchWorker':patchWorker,
            'patchConsole':patchConsole,
            'patchPageVisibility':patchPageVisibility,
            'patchRequestAnimationFrame':patchRequestAnimationFrame,
            'patchProgress':patchProgress,
            'patchRangeSelection':patchRangeSelection,
            'patchCSS3Filter':patchCSS3Filter
        }
        if(window.browser.isIE && window.browser.version === 9){
           patches.patchCSS3 = patchCSS3
        }
        window.browser.addPatches(patches)
    }
    patchHTML5()
    patchBlob()
    patchConsole()
})(this,this.document)