/**
 * Created by kenhuang on 2018/12/16.
 */

(function (window) {

    function patchConsole(window) {
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
    function patchWebSockets(window) {
        // import ''
    }
    function patchHistory(window) {
        // import ''
    }

    function patchCSS3(window) {
        // import 'PIE_IE9_uncompressed.js'
    }
    function patchCSS3Filter(window) {

    }
    function patchTransform(window,document) {
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
    function patchWebPerformance(window) {
        // import 'usertiming.js'
    }
    function patchPlaceholder() {
        // import 'placeholders.js'
    }
    if(window.browser){
        var patches =  {
            'patchWebSockets':patchWebSockets,
            'patchHistory':patchHistory,
            'patchWebPerformance':patchWebPerformance,
            'patchTransform':patchTransform,
            'patchPlaceholder':patchPlaceholder,
            'patchConsole':patchConsole}
        if(window.browser.version === 9){
           patches.patchCSS3 = patchCSS3
        }
        window.browser.addPatches(patches)
    }
})(this)