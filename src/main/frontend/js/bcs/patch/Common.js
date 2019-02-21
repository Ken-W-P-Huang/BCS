/**
 * Created by kenhuang on 2019/2/19.
 */
(function (window) {

    function patchFetchJSONP() {
        // import 'fetch-jsonp.js'
    }
    
    function patchFileSaver() {
        // import 'FileSaver.js'
    }

    if(window.browser){
        window.browser.addPatches({
            'patchFetchJSONP':patchFetchJSONP,
            'patchFileSaver':patchFileSaver
        })
    }

})(this)