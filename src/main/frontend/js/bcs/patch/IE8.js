/**
 * Created by kenhuang on 2019/1/11.
 */
(function (window,document) {
    function patchCanvas() {
        // import 'flashcanvas.js'
    }
    function patchVideo(window) {
        // import ''
    }
    function patchAudio(window) {
        // import ''
    }
    function patchPNG(window) {
        // import ''
    }
    function patchGeoLocation(window) {
        // import ''
    }
    function patchES5(window) {
        // import "es5-shim.js"
    }
    function patchJSON(window) {
        // import 'json.js'
    }

    function patchCSS3() {
        // import 'PIE_IE678_uncompressed.js'
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

    if(window.browser){
        window.browser.addPatches({
            'patchCanvas':patchCanvas,
            'patchVideo':patchVideo,
            'patchAudio':patchAudio,
            'patchPNG':patchPNG,
            'patchGeoLocation':patchGeoLocation,
            'patchCSS3':patchCSS3
        })
    }
    patchJSON(window)
    patchES5(window)
    patchXMLHttpRequest()
    /* canvas必须在当前js中执行，跨脚本无效，原因未知 */
    patchCanvas()
})(this,this.document)

