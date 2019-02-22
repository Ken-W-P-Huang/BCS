/**
 * Created by kenhuang on 2019/2/19.
 */
(function (window,document) {

    function patchFetchJSONP() {
        // import 'fetch-jsonp.js'
    }
    
    function patchFileSaver() {
        // import 'FileSaver.js'
    }

    function patchRaphael() {
        // import 'raphael.no-deps.js'
    }
    function patchCango3D() {
        // import 'Cango3D-8v00.js'
    }
    function patchMathML() {
        // import 'MathJax.js'
    }

    if(window.browser){
        window.browser.addPatches({
            'patchFetchJSONP':patchFetchJSONP,
            'patchFileSaver':patchFileSaver,
            'patchRaphael':patchRaphael,
            'patchCango3D':patchCango3D,
            'patchMathML':patchMathML
        })
    }

})(this,this.document)