/**
 * Created by kenhuang on 2019/1/29.
 */
// https://github.com/shinnn/location-origin.js
(function (window,document) {
    function patchLocationOrigin() {
        // import "location-origin.js"
    }
    //<link rel="prefetch" href="(url)">
    function patchResourceHints() {
        // import "jiagra.js"
    }
    function patchDataset() {
        // import "html5-dataset.js"
    }
    function patchDialog() {
        // import "dialog-polyfill.js"
    }
    function patchDOMEventsLevel3() {
        // import 'DOMEventsLevel3.shim.js'
    }
    function patchPointerEvents() {
        // import 'pointer_events_polyfill.js'
    }
    if(window.browser){
        window.browser.addPatches({
            'patchResourceHints':patchResourceHints,
            'patchDialog':patchDialog,
            'patchDataset':patchDataset,
            'patchPointerEvents':patchPointerEvents
        })
    }
    if(window.browser.isIE){
        if(window.browser.version  === 10){
            window.navigator.language = window.navigator.language ||(window.navigator.userLanguage && window.navigator
                    .userLanguage.replace(/-[a-z]{2}$/, String.prototype.toUpperCase)) || 'en-US'
        }
        if(window.browser.version >= 9){
            patchDOMEventsLevel3()
        }
        patchLocationOrigin()
    }

})(this,this.document)