/**
 * Created by kenhuang on 2019/1/11.
 */
(function (window) {
    function patchCanvas(window,document) {
        // import 'flashcanvas.js'
        // import 'canvas2png.js' xxxx
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
    /* canvas必须在当前js中执行，跨脚本无效，原因未知 */
    patchCanvas(window,window.document)
})(this)

