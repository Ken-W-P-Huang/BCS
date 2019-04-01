/**
 * Created by kenhuang on 2018/10/20.
 */
import File from './File'
//fetch https://github.com/RubyLouvre/fetch-polyfill
//mockjs
//mintUI  MUI

(function (window) {
    /**
     * 不能对Object进行扩展，会破坏jQuery
     * https://stackoverflow.com/questions/21729895/jquery-conflict-with-native-prototype
     * @param attributes
     *  @param values
     */
    Object.prototype.overload = function (attributes,values) {
        var i,length
        if(attributes.length > values.length){
            for(i = values.length; i< attributes.length;i++){
                this[attributes[i]] = null
            }
            length = values.length
        }else{
            length = attributes.length
        }

        for(i = 0;i<length;i++){
            this[attributes[i]] = values[i]
        }
    }
    Object.prototype.shallowCopy = function (obj) {
        for(var member in obj){
            if(obj.hasOwnProperty(member)){
                this[member] = obj[member]
            }
        }
        return this
    }
    Element.prototype.setStyle = function (css) {
        this.style.shallowCopy(css)
    }
    /**
     * 观察者模式,仅限IE9及以上的直接属性。IE9以下全部使用NotificationCenter
     * @param observer
     * @param key
     * @param observerListMap
     */

    Object.prototype._addObserver= function (observerListMap,observer,key) {
        if(typeof observer !== "object" || !key){
            throw new Error('Invalid parameters.')
        }else if(!this.hasOwnProperty(key)){
            throw new Error('Object doesn\'t have such property \''+key+'\'.')
        }
        if(!observerListMap[key]){
            observerListMap[key] = {
                value:this[key],
                list:[]
            }
            function setter(newValue) {
                var observerList = observerListMap[key].list
                var oldValue = observerListMap[key].value
                observerListMap[key].value = newValue
                if (observerList) {
                    for (var i = 0; i < observerList.length; i++) {
                        if (typeof observerList[i].observeValueForKey === 'function') {
                            observerList[i].observeValueForKey(this, key, oldValue, newValue)
                        }
                    }
                }
            }
            function getter(key) {
                return observerListMap[key].value
            }
            if (Object.defineProperty) {
                Object.defineProperty(this, key, {
                    set:setter,
                    get:getter
                })
            }else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__){
                Object.prototype.__defineGetter__.call(this, key, getter)
                Object.prototype.__defineSetter__.call(this, key, setter)
            }
        }
        /* 防止重复添加 */
        var list = observerListMap[key].list
        for(var i = 0;i<list.length;i++){
            if(list[i] === observer){
                return
            }
        }
        list.push(observer)
    }
    Object.prototype._removeObserver= function (observerListMap,observer,key) {
        if(observerListMap){
            function remove(observerList,observer) {
                for(var i = 0; i < observerList.length; i++) {
                    if(observerList[i] == observer) {
                        if(i == 0) {
                            observerList.shift()
                            return
                        } else if(i == length-1) {
                            observerList.pop()
                            return
                        } else {
                            observerList.splice(i,1)
                            return
                        }
                    }
                }
            }
            if(key){
                /* 删除指定属性的指定观察者 */
                var observerList =  observerListMap[key].list
                if(observerList){
                    remove(observerList,observer)
                }
            }else{
                /* 删除所有属性的指定观察者 */
                for(var o in observerListMap){
                    remove(o.list,observer)
                }
            }
        }
    }
    /**
     * 在构造方法中使用，observerListMap为构造方法中的私有属性
     * @param observerListMap
     */
    Object.prototype.enableKVO = function (observerListMap) {
        this.addObserver = function (observer,key) {
            this._addObserver(observerListMap,observer,key)
        }
        this.removeObserver = function (observer,key) {
            this._removeObserver(observerListMap,observer,key)
        }
    }
    /**
     * NotificationCenter.default
     */
    (function () {
        function _NotificationCenter() {
            var observerListMap = {}
            /**
             *
             * @param observer 观察者
             * @param selector 观察者响应方法
             * @param name     消息, null表示接收任意的消息
             * @param object   发送者，null表示接收所有发送者发送的消息
             */
            this.addObserver = function (observer, selector,name,object) {
                name = name || null
                object = object || null
                if(typeof observer !== "object" || typeof selector !== "function"
                    || (typeof name !== "string" && name !== null)
                    || (typeof object !== "object" && object !== null) ){
                    throw new Error('Invalid parameters.')
                }
                if(!observerListMap[name]){
                    observerListMap[name] = []
                }
                /* 防止重复添加 */
                for(var o in this.observerListMap[name] ){
                    if(o.observer === observer  && o.object === object){
                        for(var s in o.selectors){
                            if(s === selector){
                                return
                            }
                        }
                        o.selectors.push(selector)
                        return
                    }
                }
                observerListMap[name].push({
                    observer:observer,
                    selectors:[selector],
                    object:object})
            }
            this.post = function (name,object,userInfo) {
                function send(observerList,notification) {
                    if(observerList){
                        for(var i = 0;i<observerList.length;i++){
                            if(observerList[i].object === object || observerList[i].object === null){
                                try{
                                    observerList[i]['selectors'](notification)
                                }catch (e){

                                }
                            }

                        }
                    }
                }
                object = object || null
                if(typeof name === 'string'){
                    var notification = {
                        name:name,
                        object:object,
                        userInfo:userInfo
                    }
                    send(observerListMap[name],notification)
                    send(observerListMap[null],notification)
                }
            }
            this.removeObserver = function (observer,name,object) {
                function remove(observerList,observer,object) {
                    for(var i = 0; i < observerList.length; i++) {
                        if(observerList[i].observer === observer && observerList[i].object === object) {
                            if(i == 0) {
                                observerList.shift()
                                return
                            } else if(i == length-1) {
                                observerList.pop()
                                return
                            } else {
                                observerList.splice(i,1)
                                return
                            }
                        }
                    }
                }
                var observerList
                object = object || null
                if(name){
                    /* 删除指定属性的指定观察者 */
                    observerList =  observerListMap[name]
                    if(observerList){
                        remove(observerList,observer,object)
                    }
                }else{
                    /* 删除所有属性的指定观察者 */
                    for(observerList in this.observerListMap){
                        remove(observerList,observer,object)
                    }
                }
            }
        }
        window.NotificationCenter = {default : new _NotificationCenter()}
    })()

    /**
     * 用于寄生组合继承,方法名不能为extends，会在IE下报错！
     * @param superClass 父类构造函数
     */
    Function.prototype.extend = function(superClass) {
        var Super = function(){}
        Super.prototype = superClass.prototype
        this.prototype = new Super()
        this.prototype.constructor = this
        return this
    }
    Function.prototype.defineStatic= function (obj) {
        return this.shallowCopy(obj)
    }
    /**
     * 有无法处理的情况，慎用
     * @param callee
     * @returns {*}
     */
    Function.getName = function (callee) {
        if(callee.name){
            return callee.name
        }
        var _callee = callee.toString().replace(/[\s\?]*/g,""),
            comb = _callee.length >= 50 ? 50 :_callee.length
        _callee = _callee.substring(0,comb)
        var name = _callee.match(/^function([^\(]+?)\(/)
        if(name && name[1]){
            return name[1]
        }
        if(callee.caller){
            var caller = callee.caller,
                _caller = caller.toString().replace(/[\s\?]*/g,"")
            var last = _caller.indexOf(_callee),
                str = _caller.substring(last-30,last)
            name = str.match(/var([^\=]+?)\=/)
            if(name && name[1]){
                return name[1]
            }
        }
        var stack = new Error().stack
        if(stack){
            name = stack.match(/Function.getName.*\n    at (.*) \(/)
            if(name && name[1]){
                return name[1].replace('new window.','').replace('new ','')
            }
        }
        return "anonymous"
    }
    /* 错误处理 */
    Error.prototype.printStackTrace = function () {
        if(this.stack){
            window.print(this.stack)
        }else{
            window.console.log("No stack exists!Maybe you are using old version of IE.\n" +
                "name:"+this.name+"\n" +
                "functionName:"+this.functionName+"\n" +
                "lineNumber:"+this.lineNumber+"\n" +
                "message:"+this.message)
        }
    }
    window.Exception =function (msg,name) {
        /* 不能使用Error.apply(this, arguments)  */
        this.message = msg
        this.stack = (new Error()).stack
        this.name = name || "Exception"
    }
    window.onerror = function(message, url, line,column,error) {
        window.console.log(url+":"+line+":"+column+":\""+message+"\"")
        return false
    }
    window.Exception.extend(Error)
    window.MalformedURLException = function(msg){
        Exception.call(this,msg,'MalformedURLException')
    }
    window.MalformedURLException.extend(Exception)
    window.OpenWindowException = function (msg){
        Exception.call(this,msg,'OpenWindowException')
    }
    window.OpenWindowException.extend(Exception)


    window.WindowName ={
        'self':'_self',
        'blank':'_blank',
        'parent':'_parent',
        'top':'_top'
    }
    window.HttpMethod = {
        'post':'post',
        'delete':'delete',
        'put':'put',
        'get':'get',
        'head':'head',
        'trace':'trace',
        'options':'options',
        'patch':'patch'
    }

    /**
     * $page 应当包含页面的url(可以不用包含域名),data等必要属性，i18n(jquery实现另一种方式的i18n),title为可选属性，
     */
    window.BCS = {
        key:"$page",
        loadPageInfo : function (dataURL,errorCallback,method,data) {
            if(!window[BCS.key]){
                if(window.name){
                    var obj = JSON.parse(window.name)
                    window[BCS.key] = obj[BCS.key]
                    window.name = ''
                }

                if(!window[BCS.key] && dataURL ){
                    method = method || window.HttpMethod.get
                    var xmlhttp
                    if (window.XMLHttpRequest) {
                        xmlhttp=new XMLHttpRequest()
                    } else if (window.ActiveXObject) {
                        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
                    }
                    if (xmlhttp!=null) {
                        /* window.location.search 用户可能输入参数 */
                        xmlhttp.open(method,''+dataURL+window.location.search,false)
                        xmlhttp.onreadystatechange = function () {
                            if(xmlhttp.readyState === 4 ){
                                switch (xmlhttp.status){
                                    case 302:
                                    case 200:
                                        if(xmlhttp.responseText){
                                            window[BCS.key] = JSON.parse(xmlhttp.responseText)
                                        }
                                        break
                                    default:
                                        errorCallback && errorCallback(xmlhttp.status,xmlhttp.statusText)
                                        break
                                }
                            }
                        }
                        xmlhttp.send(data)
                    } else {
                        errorCallback && errorCallback(-1,"This browser does not support XMLHttpRequest.")
                    }
                }
            }
            if(window[BCS.key]){
                document.title = window[BCS.key].title || document.title
            }
        },
        /**
         * 1.Chrome打开新页面的瞬间,newWindow和当前window似乎共用同一个sessionStorage。此时不能设置sessionStorage，
         * 否则会引起newWindow的sessionStorage异常。只能直接将页面数据保存在window.name下。
         * 2.Chrome在当前tab打开新页面时，ajax异步模式和Chrome插件会导致浏览器前进后退功能异常。异步模式下，Firefox,Safari浏览器必须
         * 在异步代码外使用newWindow=window.open('',WindowName.blank)创建新window。建议使用Ajax同步模式，反正要等收到服务器端的数
         * 据之后才能打开新页面。
         * 3.Safari 从页面打开另一新页面时，浏览器可以后退。切换页面之后才正常。
         * 4.字符串长度
         *  Mac Chrome 512M  Safari 1G Firefox 128M
         *  XP Chrome 128M IE8 128M
         * @param pageInfo
         * @param windowName "_blank" "_self".(_parent，_top，自定义name的情况未测试，暂时无用。)
         * @param newWindow 为了和Safari浏览器兼容，在同步时，如ajax async=false可以忽略此参数。
         */
        openWindow:function (pageInfo,windowName,newWindow) {
            if(pageInfo && pageInfo.url){
                windowName = windowName || window.WindowName.self
                newWindow= newWindow ||window.open('',windowName)
                if(newWindow){
                    newWindow.location.assign(pageInfo.url)
                    var obj = {}
                    obj[BCS.key] = pageInfo
                    newWindow.name = JSON.stringify(obj)

                }else{
                    throw new OpenWindowException('Failed to open window.Please check if url is correct ' +
                        'or popup new window function is blocked!')
                }
            }else{
                throw new MalformedURLException('Member pageInfo.url should not be null!')
            }
        },

    }

})(typeof window === 'undefined' ? this : window)

