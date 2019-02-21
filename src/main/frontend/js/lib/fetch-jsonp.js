/**
 * Created by kenhuang on 2019/2/19.
 */
// http://vinc.top/2017/02/09/jsonp%E5%AF%BC%E8%87%B4%E7%9A%84%E5%AE%89%E5%85%A8%E9%97%AE%E9%A2%98/
(function (window) {
    function JSONP() {
        var scriptNode = window.document.createElement('script')
        var head = window.document.getElementsByTagName('head')[0]
        var callback = 'callback'
        var callbackFunction = ('jsonp' + Math.random()).replace(/0\./, '')
        function resolveUrl(url) {
            var hostUrl = window.location.href
            if(url){
                var urlLowerCase = url.toLowerCase()
                if(urlLowerCase.startsWith('http')|| urlLowerCase.startsWith('https')){
                    urlLowerCase = urlLowerCase.replace(/\\/g,'//')
                    return urlLowerCase
                }else{
                    var index = hostUrl.lastIndexOf('/')
                    return hostUrl.substring(0,index) + '/'+ url
                }
            }else{
                return hostUrl
            }
        }
        scriptNode.open  = function (method,url) {
            this.readyState = 1
            url = resolveUrl(url)
            url += (url.indexOf('?') === -1) ? '?' : '&'
            this.src = url
            if(typeof this.onreadystatechange === "function"){
                this.onreadystatechange()
            }if(typeof this.onload === "function"){
                this.onload()
            }
        }

        scriptNode.getAllResponseHeaders = function () {
            return ''
        }
        scriptNode.getResponseHeader = function (headerName) {
            return null
        }
        scriptNode.send = function (data) {
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
            }.bind(this)
            var jsonpCallback = (data && data.jsonpCallback) || callback
            /* 先调用生成的函数callbackFunction，再在callbackFunction中调用用户指定的函数 */
            this.src= this.src + jsonpCallback + '=' + callbackFunction
            if(typeof this.onreadystatechange === "function"){
                this.onreadystatechange()
            }else if(typeof this.onload === "function"){
                this.onload()
            }
            head.appendChild(this)
        }
        scriptNode.setRequestHeader = function (name, value) {
            this[name] = value
        }
        scriptNode.abort = function () {
            if(typeof window[callbackFunction] === "function"){
                // IE8 throws an exception when you try to delete a property on window
                // http://stackoverflow.com/a/1824228/751089
                try {
                    head.removeChild(this)
                    delete window[callbackFunction]
                } catch (e) {
                    window[callbackFunction] = undefined
                }
            }
        }
        return scriptNode
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
                request.headers.forEach(function (name,value) {
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
})(this)


