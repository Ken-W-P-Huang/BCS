/**
 * Created by kenhuang on 2019/1/25.
 */
/**
 * 无需暴露
 * @constructor
 */
import {NotificationCenter} from './NotificationCenter'
function Extensions(window) {

    /**
     * 对Object进行扩展会破坏jQuery
     * https://stackoverflow.com/questions/21729895/jquery-conflict-with-native-prototype
     */
    function extendObject () {
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
        /**
         * 观察者模式,仅限IE9及以上的直接属性。IE9以下全部使用NotificationCenter
         * @param observer
         * @param key
         * @param observerListMap
         */
        Object.prototype._addObserver = function (observerListMap,observer,key) {
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
        Object.prototype._removeObserver = function (observerListMap,observer,key) {
            function remove(observerList,observer) {
                for(var i = 0; i < observerList.length; i++) {
                    if(observerList[i] === observer) {
                        if(i === 0) {
                            observerList.shift()
                            return
                        } else if(i === length-1) {
                            observerList.pop()
                            return
                        } else {
                            observerList.splice(i,1)
                            return
                        }
                    }
                }
            }
            if(observerListMap){

                if(key){
                    /* 删除指定属性的指定观察者 */
                    var observerList =  observerListMap[key].list
                    if(observerList){
                        remove(observerList,observer)
                    }
                }else{
                    /* 删除所有属性的指定观察者 */
                    for(var o in observerListMap){
                        if(observerListMap.hasOwnProperty(o)){
                            remove(o.list,observer)
                        }
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
        Object.isElement = function (object) {
            return typeof object === 'object' && object.nodeType === 1
        }

    }

     function extendFunction() {
        /**
         * 用于寄生组合继承,方法名不能为extends，会在IE下报错！
         * @param publicObject  公共方法（如果含有属性不报错）
         * @param superClass 父类构造函数
         * @param staticObject 静态属性和方法
         */
        Function.prototype.extend = function(superClass,publicObject,staticObject) {
            if(typeof this  === 'function'){
                if(typeof superClass === 'function' ){
                    var Super = function(){}
                    Super.prototype = superClass.prototype
                    this.prototype = new Super()
                    this.prototype.constructor = this
                }
                if(typeof publicObject === 'object'){
                    this.prototype.shallowCopy(publicObject)
                }
                if(typeof staticObject === 'object'){
                    this.shallowCopy(staticObject)
                }
            }
        }
        /**
         * 有无法处理的情况，慎用
         * @param callee
         * @returns {*}
         */
        Function.prototype.getName = function (callee) {
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
    }
    /**
     * IE6 无法对Window.prototype进行扩展
     */
    function extendWindow () {
        function Exception (msg,name) {
            /* 不能使用Error.apply(this, arguments)  */
            this.message = msg
            this.stack = (new Error()).stack
            this.name = name || "Exception"
        }
        Exception.extend(Error)
        window.Error.prototype.printStackTrace = function () {
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

        window.WindowNameEnum = {
            'SELF':'_self',
            'BLANK':'_blank',
            'PARENT':'_parent',
            'TOP':'_top'
        }
        window.HttpMethodEnum = {
            'POST':'POST',
            'DELETE':'DELETE',
            'PUT':'PUT',
            'GET':'GET',
            'HEAD':'HEAD',
            'TRACE':'TRACE',
            'OPTIONS':'OPTIONS',
            'PATCH':'PATCH'
        }
        window.NotificationCenter = {'default' : new NotificationCenter()}
        /* 错误处理 */
        window.onerror = function(message, url, line,column,error) {
            window.console.log(url+":"+line+":"+column+":\""+message+"\"")
            return false
        }
        window.Exception = Exception
        window.MalformedURLException = function(msg){
            Exception.call(this,msg,'MalformedURLException')
        }
        window.MalformedURLException.extend(Exception)
        window.OpenWindowException = function (msg){
            Exception.call(this,msg,'OpenWindowException')
        }
        window.OpenWindowException.extend(Exception)
        window.InvalidParameterException = function (msg){
            Exception.call(this,msg,'InvalidParameterException')
        }
        window.InvalidParameterException.extend(Exception)
        window.document.ready = function (callback) {
            /* 兼容FF,Google */
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', function handleDOMContentLoaded() {
                    document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded, false);
                    callback();
                }, false)
            } else if (document.attachEvent) {
                /* 兼容IE */
                document.attachEvent('onreadystatechange', function handleReadyStateChange() {
                    if (document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", handleReadyStateChange);
                        callback();
                    }
                })
            } else if (document.lastChild === document.body) {
                callback();
            }
        }

    }
    function extendString () {
        /* 和cssSandpaper冲突 */
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
            }
        }
        String.prototype.toFirstUpperCase = function () {
            return this.charAt(0).toUpperCase()+ this.slice(1);
        }
    }
    function extendArray() {
        // Array.prototype.indexOf = function (element) {
        //     for (var i = 0; i < this.length; i++) {
        //         if (this[i] === element) {
        //             return i
        //         }
        //     }
        //     return -1
        // }
        Array.prototype.remove = function (element) {
            var index = this.indexOf(element)
            if (index > -1) {
                return this.splice(index, 1);
            }
        }
    }
    this.apply = function () {
        extendObject()
        extendFunction()
        extendWindow()
        extendString()
        extendArray()
    }
}