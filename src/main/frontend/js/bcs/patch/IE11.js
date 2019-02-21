/**
 * Created by kenhuang on 2019/2/20.
 */
(function (window) {
    function patchClassList(window) {
        // import "classList.js"
    }
    if(window.browser){
        window.browser.addPatches({
            'patchClassList':patchClassList
        })
    }
})(this)