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
    if(window.browser){
        var patches = {
            'patchClassList':patchClassList,
            'patchGetUserMedia':patchGetUserMedia,
            'patchCurrentScript':patchCurrentScript
        }
        if(window.browser.isIE && window.browser.version >= 10 && window.browser.version <= 11){
            patches.patchXPath = patchXPath
        }
        window.browser.addPatches(patches)

    }
})(this,this.document)