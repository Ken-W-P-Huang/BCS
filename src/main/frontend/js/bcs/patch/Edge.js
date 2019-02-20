/**
 * Created by kenhuang on 2019/1/28.
 */
(function (window) {
    function patchPromise(window) {
        // import 'bluebird.js'
    }
    function patchFetch(window) {
        if(!window.Promise){
            patchPromise(window)
        }
        // import 'fetch.js'
    }

    function patchBeacon() {

    }
    function patchHTML5() {
        // import 'html5shiv-printshiv.js'
    }
    function patch() {

    }
    if(window.browser){
        window.browser.addPatches({
            'patchPromise':patchPromise,
            'patchFetch':patchFetch,
            'patchHTML5':patchHTML5,
            'patchBeacon':patchBeacon})
    }
})(this)