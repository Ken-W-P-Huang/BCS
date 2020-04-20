/**
 * Created by kenhuang on 2019/2/19.
 */
(function (window,document) {
    /**
     * http://vinc.top/2017/02/09/jsonp%E5%AF%BC%E8%87%B4%E7%9A%84%E5%AE%89%E5%85%A8%E9%97%AE%E9%A2%98/
     * jsonpCallback:链接指定回调函数所用的参数名。如果不指定，则默认使用callback的值
     * jsonpCallbackFunction:用户自定义函数名，该函数必须为window的属性，在生成的随机函数callbackFunction中被调用
     */
    function patchFetchJSONP() {
        if(!window.Promise){
            window.browser.patch(window.PatchEnum.PROMISE)
        }
        function JSONP() {
            var scriptNode = window.document.createElement('script')
            var head = window.document.getElementsByTagName('head')[0]
            var callback = 'callback'
            var callbackFunction = ('jsonp' + Math.random()).replace(/0\./, '')
            function resolveUrl(url) {
                var hostUrl = location.href
                if(url){
                    var urlLowerCase = url.toLowerCase()
                    if(urlLowerCase.startsWith('http')|| urlLowerCase.startsWith('https')){
                        urlLowerCase = urlLowerCase.replace(/\\/g,'//')
                        return urlLowerCase
                    }else{
                        return hostUrl.replace(location.pathname,'') + '/'+ url
                    }
                }else{
                    return hostUrl
                }
            }
            this.open  = function (method,url) {
                this.readyState = 1
                url = resolveUrl(url)
                url += (url.indexOf('?') === -1) ? '?' : '&'
                scriptNode.src = url
                if(typeof this.onreadystatechange === "function"){
                    this.onreadystatechange()
                }if(typeof this.onload === "function"){
                    this.onload()
                }
            }

            this.getAllResponseHeaders = function () {
                return ''
            }
            this.getResponseHeader = function (headerName) {
                return null
            }
            this.send = function (data) {
                this.readyState = 2
                window[callbackFunction] = function (response) {
                    this.readyState = 4
                    this.response = JSON.stringify(response)
                    this.status = 200
                    this.statusText = 'ok'
                    this.abort()
                    if(data.jsonpCallbackFunction){
                        if(typeof window[data.jsonpCallbackFunction] !== "function" ){
                            throw new TypeError('jsonpCallbackFunction is not Function type')
                        }else{
                            window[data.jsonpCallbackFunction](response)
                        }
                    }
                    if(typeof this.onreadystatechange === "function"){
                        this.onreadystatechange()
                    }else if(typeof this.onload === "function"){
                        this.onload()
                    }
                }.bind(this)
                var jsonpCallback = (data && data.jsonpCallback) || callback
                /* 先调用生成的函数callbackFunction，再在callbackFunction中调用用户指定的函数 */
                scriptNode.src= scriptNode.src + jsonpCallback + '=' + callbackFunction
                if(typeof this.onreadystatechange === "function"){
                    this.onreadystatechange()
                }else if(typeof this.onload === "function"){
                    this.onload()
                }
                head.appendChild(scriptNode)
            }
            this.setRequestHeader = function (name, value) {
                this[name] = value
            }
            this.abort = function () {
                if(typeof window[callbackFunction] === "function"){
                    // IE8 throws an exception when you try to delete a property on window
                    // http://stackoverflow.com/a/1824228/751089
                    try {
                        head.removeChild(scriptNode)
                        delete window[callbackFunction]
                    } catch (e) {
                        window[callbackFunction] = undefined
                    }
                }
            }
        }
        if(!window.fetchJsonp){
            window.fetchJsonp = function (input, init) {
                return new Promise(function (resolve,reject) {
                    var request,xmlHttpRequest,timer,timeout
                    if (typeof init.timeout === 'number') {
                        timeout = init.timeout
                    }else{
                        timeout = 5000
                    }
                    if (!input && (input instanceof Request)) {
                        request = input
                    } else {
                        request = new Request(input, init)
                    }
                    xmlHttpRequest = new JSONP()
                    xmlHttpRequest.onload = xmlHttpRequest.onreadystatechange = function () {
                        /*Chrome只要有应答都返回resolve*/
                        if (xmlHttpRequest.readyState === 4) {
                            clearInterval(timer)
                            var body = 'response' in xmlHttpRequest ? xmlHttpRequest.response : xmlHttpRequest.responseText
                            var response = new Response(body, {
                                status: xmlHttpRequest.status,
                                statusText: xmlHttpRequest.statusText,
                                url:''
                            })
                            xmlHttpRequest.abort()
                            if(response.ok || response.getOk()){
                                resolve(response)
                            }else{
                                reject(new TypeError('Network request failed'))
                            }
                        }
                    }

                    xmlHttpRequest.onerror = function (error) {
                        xmlHttpRequest.abort()
                        clearInterval(timer)
                        reject(error)
                    }

                    xmlHttpRequest.open(null, request.url || request.getUrl(), true)
                    var headers = request.headers || request.getHeaders()
                    headers.forEach(function (name,value) {
                        xmlHttpRequest.setRequestHeader(name, value)
                    })
                    timer = setTimeout(function () {
                        xmlHttpRequest.abort()
                        reject(new TypeError('Network request timeout'))
                    }, timeout)
                    xmlHttpRequest.send(init)
                })
            }
        }
    }

    function patchRaphael() {
        // import 'raphael.no-deps.js'
    }
    function patchCango3D() {
        // import 'Cango3D-8v00.js'
    }

    function patchStyleScoped() {
        // import 'scoper.js'
    }

    function patchOverthrow() {
        // import 'overthrow-detect.js'
        // import 'overthrow-init.js'
        // import 'overthrow-polyfill.js'
        // import 'overthrow-toss.js'
    }

    function patchEasyXDM() {
        // import 'easyXDM.Core.js'
        // import 'easyXDM.Debug.js'
        // import 'easyXDM.DomHelper.js'
        // import 'easyXDM.Fn.js'
        // import 'easyXDM.Socket.js'
        // import 'easyXDM.Rpc.js'
        // import 'easyXDM.FlashTransport.js'
        // import 'easyXDM.SameOriginTransport.js'
        // import 'easyXDM.PostMessageTransport.js'
        // import 'easyXDM.FrameElementTransport.js'
        // import 'easyXDM.NameTransport.js'
        // import 'easyXDM.HashTransport.js'
        // import 'easyXDM.ReliableBehavior.js'
        // import 'easyXDM.QueueBehavior.js'
        // import 'easyXDM.VerifyBehavior.js'
        // import 'easyXDM.RpcBehavior.js'
        window.easyXDM  = easyXDM // jshint ignore:line
    }

    if(window.browser){
        window.browser.addPatches({
            'patchFetchJSONP':patchFetchJSONP,
            'patchRaphael':patchRaphael,
            'patchCango3D':patchCango3D,
            'patchEasyXDM':patchEasyXDM,
            'patchOverthrow':patchOverthrow,
            'patchStyleScoped':patchStyleScoped
        })
    }

})(this,this.document)