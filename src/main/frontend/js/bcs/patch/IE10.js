/**
 * Created by kenhuang on 2019/1/29.
 */
// https://github.com/shinnn/location-origin.js
(function (window) {
    function patchLocationOrigin(window) {
        // import "location-origin.js"
    }
    if(window.browser){
        window.browser.addPatches({'patchLocationOrigin':patchLocationOrigin})
    }
})(this)