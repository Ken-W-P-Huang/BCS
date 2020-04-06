/**
 * Created by kenhuang on 2019/2/20.
 */
(function (window,document) {
    function patchClassList(window) {
        // import "classList.js"
    }

    function patchGetUserMedia() {
        // import "getUserMedia.js"
    }

    function patchXPath() {
        // import 'wgxpath.install.js'
    }

    function patchCurrentScript() {
        // import 'document.currentScript.js'
    }

    function patchIETouch() {
        // import 'ie-touch.max.js'
    }

    function patchPointerAccuracy() {
        // import 'pointeraccuracy.js'
    }

    function patchCSSSupports() {
        // import 'CSS.supports.js'
    }

    function patchFlexibility() {
        // import 'flexibility.js'
    }

    function patchCaptionator() {
        // import 'captionator.js'
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