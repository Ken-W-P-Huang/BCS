/**
 * Created by kenhuang on 2019/2/19.
 */
(function (window) {
    function JSONP() {
        var scriptNode = window.document.createElement('script')
        var head = window.document.getElementsByTagName('head')[0]
        scriptNode.open  = function (method,url) {
            this.readyState = 1
            url += (url.indexOf('?') === -1) ? '?' : '&'
            this.src = url
            this.status = 200
            this.statusText = 'ok'
            this.response = {}
        }

        scriptNode.getAllResponseHeaders = function () {
            return ''
        }
        scriptNode.getResponseHeader = function (headerName) {
            return null
        }
        scriptNode.send = function () {
            this.readyState = 2
            this.callbackFunctionName = this.jsonpCallback
            if(this.jsonpCallback){
                if(typeof window[this.callbackFunctionName] !== "function" ){
                    throw new TypeError(this.callbackFunctionName + ' is not Function type')
                }
            }else{
                this.callbackFunctionName = ('jsonp' + Math.random()).replace(/0\./, '')
                this.callbackFunction = window[this.callbackFunctionName] = function (data) {
                    this.response = data
                }.bind(this)
            }
            this.src= this.src + 'jsonpCallback=' + this.callbackFunctionName
            head.appendChild(this)
        }
        scriptNode.setRequestHeader = function (name, value) {
            this[name] = value
        }
        scriptNode.abort = function () {
            head.removeChild(this)
            if(this.callbackFunction){
                // IE8 throws an exception when you try to delete a property on window
                // http://stackoverflow.com/a/1824228/751089
                try {
                    delete window[this.callbackFunctionName]
                } catch (e) {
                    window[this.callbackFunctionName] = undefined
                }
            }
        }
        return scriptNode
    }

})(this)