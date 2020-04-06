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
        Object.prototype.getClass = function () {
            if (this.constructor && this.constructor.toString()) {
                if(this.constructor.name) {
                    return this.constructor.name;
                }
                var arr
                var str = this.constructor.toString()
                if(str.charAt(0) === '[') {
                    arr = str.match(/\[\w+\s*(\w+)\]/)
                } else {
                    arr = str.match(/function\s*(\w+)/)
                }
                if (arr && arr.length ===2) {
                    return arr[1]
                }
            }
            return undefined
        }
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

        Object.prototype.deinit = function (observedObject) {
            if ('delegate' in this) {
                this.delegate = undefined
            }
            if ('dataSource' in this) {
                this.dataSource = undefined
            }
            NotificationCenter.default.removeObserver(this)
            if (observedObject) {
                observedObject.removeObserver(this)
            }

        }

        Object.prototype.isMemberOf = function(Class){
            if(typeof Class === 'function'){
                if(this.__proto__){ // jshint ignore:line
                    return this.__proto__ === Class.prototype // jshint ignore:line
                }
                return this.constructor === Class
            }else{
                throw new TypeError('Class '+Class+'\'s value is not valid Class')
            }
        }

        Object.prototype.isKindOf = function(Class){
            if(typeof Class === 'function'){
                Function.requireArgumentNumber(arguments,1)
                return this instanceof  Class
            }else{
                throw new TypeError('Class '+Class+'\'s value is not valid Class')
            }
        }
        Object.isPlainObject =function(object){
            throw new TypeError('waiting to implement!')
        }

        var toString = Object.prototype.toString
        Object.prototype.toString = function () {
            if(this.getClass){
                return '[object '+this.getClass()+']'
            }else{
                return toString.call(this)
            }
        }

        /**
         * 不能向对象添加额外的私有属性，故不能使用KVC添加额外的属性。如果有添加属性需要，可以使用对象自身的扩展功能。
         *  @param Class 类对象
         * @param propertiesMap
         */
        Object.prototype.enablePrivateProperty = function (Class,propertiesMap) {
            var superGetPrivate, superSetPrivate,superInitProperties
            for (var key in propertiesMap) {
                if (this.hasOwnProperty(key) ) {
                    throw new Error('Duplicate key ' + key + '.')
                }
            }
            if ('setPrivate' in this ) {
                superGetPrivate = this.getPrivate
                superSetPrivate = this.setPrivate
                superInitProperties = this.superInitProperties
            }
            this.setPrivate = function(key,value){
                if (propertiesMap.hasOwnProperty(key) && Class === this.constructor ) {
                    propertiesMap[key] = value
                }else if(typeof superSetPrivate === 'function'){
                    superSetPrivate(key,value)
                }else{
                    throw new Error('Class ' + this.getClass() + ' doesn\'t have a property ' + key + '.')
                }
            }
            this.getPrivate = function(key){
                if (propertiesMap.hasOwnProperty(key) && Class === this.constructor ) {
                    return propertiesMap[key]
                }else if(typeof superSetPrivate === 'function'){
                    return superGetPrivate(key)
                }else{
                    throw new Error('Class ' + this.getClass() + ' doesn\'t have a property ' + key + '.')
                }
            }
            this.initProperties = function (map) {
                if (Class === this.constructor ) {
                    for (var key in map) {
                        if (map.hasOwnProperty(key) ) {
                            if (propertiesMap.hasOwnProperty(key) ) {
                                throw new Error('Class ' + this.getClass() + ' has already had a private property named \''
                                    + key + '\'.')
                            }else{
                                propertiesMap[key] = map[key]
                            }
                        }
                    }
                }else if(typeof superInitProperties === 'function'){
                    superInitProperties(map)
                }else{
                    throw new Error('Class ' + Class + ' and  constructor' + this.constructor + ' mismatch.')
                }
            }
        }

        Object.prototype .setValueForKey = function(key,value){
            if (this.hasOwnProperty(key) ){
                this[key] = value
                return
            }
            if (this.setPrivate) {
                this.setPrivate(key,value)
            } else{
                throw new Error('Class ' + this.getClass() + ' doesn\'t have a property ' + key + '.')
            }
        }

        Object.prototype.setValuesForKeys = function(keyValueMap){
            for (var key in keyValueMap) {
                if (keyValueMap.hasOwnProperty(key) ) {
                    this.setValueForKey(key,keyValueMap[key])
                }
            }
        }
        Object.prototype .valueForKey = function(key){
            if (this.hasOwnProperty(key) ){
                return this[key]
            }
            if (this.get ) {
                return this.get(key)
            }
            throw new Error('Class ' + this.getClass() + ' doesn\'t have a property ' + key + '.')
        }
        function resolveKeyPath(object,keyPath){
            var keys = keyPath.split('.')
            for(var i = 0; i < keys.length -1 ; i++) {
                object = object.valueForKey(keys[i])
                if (typeof object !== "object") {
                    throw new Error('KeyPath '+ keyPath +' is invalid for class ' + this.getClass() +'.')
                }
            }
            return {
                object:object,
                key:keys[keys.length - 1]
            }
        }
        Object.prototype.setValueForKeyPath = function (keyPath,value) {
            var result = resolveKeyPath(this,keyPath)
            result.object.setValueForKey(result.key,value)
        }
        Object.prototype.valueForKeyPath = function (keyPath) {
            var result = resolveKeyPath(this,keyPath)
            return result.object.valueForKey(result.key)
        }
        window.NSKeyValueObservingOptions = {
            new:0,
            old:1,
            initial:4,
            prior:8

        }
        function remove(observerListMap,key,observerList,observer) {
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
            observerListMap.set(key,observerList)
        }
        /**
         * 观察者模式,KVO仅限IE9及以上的直接属性。IE9以下全部使用NotificationCenter。
         * 在构造方法中使用，observerListMap为私有属性,用于存放被监视的属性值。
         * observerListMap的每一个List的第0个元素为key对应当前值。故Observer从List第1个元素开始
         * swift允许重复添加observer，即多次添加时会多次触发。每次删除只删除一次添加。
         * 与swift不同的是这里是先添加先触发，swift是后添加先触发
         * @param privatePropertiesMap
         * @param observerListMap
         */
        Object.prototype.enableKVO = function (privatePropertiesMap,observerListMap) {
            Function.requireArgumentNumber(arguments,1)
            if(observerListMap.isKindOf(window.ListMap)){
                this.addObserver = function (observer,keyPath,options,context) {
                    Function.requireArgumentNumber(arguments,2)
                    function setter(newValue) {
                        var observerList = observerListMap.getAll(keyPath)
                        var oldValue =  observerList[0]
                        observerList[0] = newValue
                        for (var i = 1; i < observerList.length; i++) {
                            if (typeof observerList[i].observer.observeValue === 'function') {
                                observerList[i].observer.observeValue(this, keyPath, this,{
                                    old:oldValue,
                                    new:newValue
                                }, context)
                            }
                        }
                    }
                    function getter(key) {
                        return observerListMap.get(key)[0]
                    }
                    if (!(observer instanceof Object)) {
                        throw new TypeError('Observer must be object type.')
                    } else if (!keyPath || typeof keyPath !== 'string' ) {
                        throw new TypeError('Key must be string type.')
                    }
                    if(!observerListMap.has(keyPath)){
                        /* 得到上一层的对象以及最后一层的key */
                        var result = resolveKeyPath(this,keyPath),
                            object = this
                        /* 该属性可能是私有属性的直接属性，会被resolveKeyPath漏掉 */
                        if (result.object === this && privatePropertiesMap.hasOwnProperty(result.key)) {
                            object = privatePropertiesMap
                        }
                        /* 保存原有的值到observerListMap[keyPath][0]*/
                        observerListMap.append(keyPath,object[keyPath])
                        /* 此时已经应用ES5补丁 */
                        if (Object.defineProperty) {
                            Object.defineProperty(object, keyPath, {
                                set:setter,
                                get:getter
                            })
                        } else {
                            throw new TypeError('Object.defineProperty is not supported in this browser')
                        }
                        // else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) {
                        //     Object.prototype.__defineGetter__.call(this, key, getter);
                        //     Object.prototype.__defineSetter__.call(this, key, setter);
                        // }
                    }
                    observerListMap.append(keyPath,{
                        observer:observer,
                        context:context
                    })
                }
                this.removeObserver = function (observer,keyPath,context) {
                    //todo 是否在移除最后一个观察者后将值还原回去
                    if(keyPath){
                        /* 删除指定属性的指定观察者 */
                        var observerList =  observerListMap.getAll(keyPath)
                        remove(observerListMap,keyPath,observerList,observer)
                    }else{
                        /* 删除所有属性的指定观察者 */
                        observerListMap.forEach(function (observerList,key) {
                            remove(observerListMap,key,observerList,observer)
                        })
                    }
                }
            }else{
                throw new TypeError('observerListMap is not ListMap type')
            }
        }
    }

     function extendFunction() {
        /**
         * 用于寄生组合继承,方法名不能为extends，会在IE下报错！
         * @param publicObject  公共方法（如果含有属性不报错）
         * @param superClFunction.prototype.extendass 父类构造函数
         * @param staticObject 静态属性和方法
         */
        Function.prototype.extend = function(superClass) {
            Function.requireArgumentType(superClass,'function')
            Function.requireArgumentType(this,'function')
            var Super = function(){}
            Super.prototype = superClass.prototype
            this.prototype = new Super()
            this.prototype.constructor = this
        }
        /**
         * 有无法处理的情况，慎用
         * @param callee
         * @returns {*}
         */
        Function.prototype.getName = function (callee) {
            // return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
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

        Function.requireArgumentNumber = function(args, expected) {
             if (args.length < expected) {
                 throw new TypeError(expected +' argument required, but only '+ args.length+' present.')
             }
        }

        Function.requireArgumentType = function (arg,type) {
            var className = type.toFirstUpperCase()
            var isFunction = window[className]['is'+className]
            var is
            if(isFunction){
                is = isFunction(arg)
            }else {
                is = arg instanceof window[className]
                if(!is){
                    is = typeof arg === type
                }
            }
            if(!is){
                throw new TypeError((typeof arg) +" " + arg + " is not a " + type)
            }
        }
    }

    /**
     * IE6 无法对Window.prototype进行扩展
     */
    function extendWindow () {
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
        window.TypeEnum ={
            'NUMBER':'number',
            'STRING':'string',
            'NULL':'null',
            'ARRAY':'array',
            'UNDEFINED':'undefined',
            'OBJECT':'object',
            'FUNCTION':'function',
            'BOOLEAN':'boolean',
        }


        /* 错误处理 */
        function Exception (msg,name) {
            /* 不能使用Error.apply(this, arguments)  */
            this.message = msg
            this.stack = (new Error()).stack
            this.name = name || "Exception"
        }
        Exception.extend(Error)
        window.Exception = Exception
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
        if(!window.execScript) { // jshint ignore:line
            window.execScript = function (script, lang) { // jshint ignore:line
                if (lang && lang.toUpperCase().indexOf("VB") >= 0) {
                   throw new TypeError('VBScript is not supported in this browser')
                }
                window["eval"].call(window, script) // jshint ignore:line
            }
        }
        window.document.ready = function (callback) {
            if(callback){
                if (document.attachEvent) {
                    /* 兼容IE */
                    document.attachEvent('onreadystatechange', function handleReadyStateChange() {
                        if (document.readyState === "complete") {
                            document.detachEvent("onreadystatechange", handleReadyStateChange);
                            callback()
                        }
                    })
                } else if (document.addEventListener) {
                    /* 兼容FF,Google */
                    document.addEventListener('DOMContentLoaded', function handleDOMContentLoaded() {
                        document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded, false)
                        callback()
                    }, false)
                }  else if (document.lastChild === document.body) {
                    callback()
                }
            }
        }
    }
    function extendString () {
        /* 会被cssSandpaper覆盖 */
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
            }
        }
        if(!String.prototype.toFirstUpperCase){
            String.prototype.toFirstUpperCase = function () {
                return this.charAt(0).toUpperCase()+ this.slice(1);
            }
        }
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (searchString,position) {
                position = position === undefined ? 0: Number(position)
                if (position < 0 ) {
                    position = 0
                }
                return this.indexOf(String(searchString)) === position
            }
            String.prototype.endsWith = function (searchString,position) {
                var index = this.indexOf(String(searchString))
                if (index === -1 ) {
                  return false
                }
                position = position === undefined ? this.length:Number(position)
                if (position < 0 ) {
                    position = 0
                }
                return index + searchString.length === position
            }
        }
        //获取/设置cookie
        if(!String.prototype.get){
            String.prototype.get = function (name) {
                Function.requireArgumentNumber(arguments,1)
                var array = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"))
                if(array !== null) {
                    return decodeURIComponent(array[2])
                }
                return null
            }

            String.prototype.set = function (name,value,seconds,domain,path) {
                Function.requireArgumentNumber(arguments,2)
                var expires = new Date()
                value = value || ''
                seconds= seconds || -2592000
                domain = domain || document.domain
                if(value === null || seconds <= 0) {
                    value = ''
                    seconds = -2592000
                }
                if(!isNaN(seconds)){
                    expires.setTime(expires.getTime() + seconds * 1000)
                }
                document.cookie = name + '=' + encodeURIComponent(value)
                    +(expires?'; expires='+expires.toGMTString():'')
                    +'; path='+path
                    +(domain?'; domain='+domain:'')
            }
        }
        String.isString = function (any) {
            Function.requireArgumentNumber(arguments,1)
            if(any instanceof Object){
                return any.isKindOf(String)
            }else{
                return Object.prototype.toString.call(any)==='[object String]'
            }
        }
        String.prototype.byteLength = function () {
            var length=0
            for(var i = 0; i < this.length; i++){
                if (this.charCodeAt(i) > 127 || this.charCodeAt(i) < 0){
                    length += 2
                }else{
                    length++
                }
            }
            return length;
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
            Function.requireArgumentNumber(arguments,1)
            var index = this.indexOf(element)
            if (index > -1) {
                return this.splice(index, 1);
            }
        }
    }

    function extendOthers() {
        if(!window.Element){
            window.Element = function () {

            }
        }
        Element.isElement = function (object) {
            Function.requireArgumentNumber(arguments,1)
            return object instanceof Object && object.nodeType === 1
        }
    }
    function extendNumber() {
        if(!Number.isNumber){
            Number.isNumber = function (any) {
                Function.requireArgumentNumber(arguments,1)
                if(any instanceof Object){
                    return any.isKindOf(Number)
                }else{
                    return Object.prototype.toString.call(any)==='[object Number]'
                }
            }
        }
    }

    function transformValue(value) {
        if (typeof value === 'object') {
            if (value.isKindOf(Symbol)) {
                throw new TypeError('Cannot convert a Symbol value to a string')
            }else{
                return value.toString()
            }
        }else if(value === undefined){
            return ''
        }else{
            return String(value)
        }
    }

    function extendCollections() {
        /* jshint ignore:start */
        function Iterator(array) {
            var index = 0
            this.next = function () {
                if(index < array.length ){
                    return {done: false, value:array[index++]}
                }else{
                    return {done: true, value:undefined}
                }
            }
        }
        if (!window.Map && !window.Set) {
            var map = new Map()
            var isConstructor = false
            window.Symbol = function Symbol(value) {
                if (isConstructor) {
                    var timestamp = String(+new Date())
                    value = transformValue(value)
                    this.toString = function () {
                        if (value ) {
                            return 'Symbol('+value +')@'+ timestamp
                        }
                        return 'Symbol()@'+timestamp
                    }
                    isConstructor = false
                }else{
                    if ( this.constructor === Symbol) {
                        throw new TypeError('Symbol is not a constructor')
                    }
                    isConstructor = true
                    return new Symbol(value)
                }
            }

            {
                Symbol.for = function (key) {
                    var symbol
                    if (key === undefined ) {
                        key = 'undefined'
                    }else{
                        key = transformValue(key)
                    }
                    if (map.has(key) ) {
                        return map.get(key)
                    }
                    symbol = Symbol(key)
                    map.set(key,symbol)
                    return symbol
                }
                Symbol.keyFor = function (symbol) {
                    if (!symbol.isMemberOf(Symbol)) {
                        throw new TypeError(typeof symbol + ' is not a symbol')
                    }
                    var entry,entries = map.entries()
                    while(!(entry = entries.next()).done){
                        if (entry.value[1] === symbol ) {
                            return entry.value[0]
                        }
                    }
                    return undefined
                }

                // Symbol.iterator = Symbol('Symbol.iterator')
            }

            /**
             * Map的key，value可以是任意数据类型，故无须做参数判断
             * @constructor
             */
            window.Map = function Map(iterable) {
                var items = []
                this.clear = function () {
                    items = []
                }
                this['delete'] = function (key) {
                    var i = items.findIndex(function(item){
                        return item[0] === key
                    })
                    if(i >= 0){
                        items.splice(i,1)
                        return true
                    }
                    return false

                }

                this.get = function (key) {
                    var item = items.find(function (item) {
                        return item[0] === key
                    })
                    if(item){
                        return item[1]
                    }
                    return undefined
                }
                /* Map可以存放undefined。通过get方法会漏掉undefined */
                this.has = function (key) {
                    return items.some(function (item) {
                        return item[0] === key
                    })
                }

                this.set = function (key,value) {
                    var item = items.find(function(item){
                        return item[0] === key
                    })
                    if(item){
                        item[1]=value
                    }else{
                        items.push([key,value])
                    }
                    return this
                }

                this.getSize = function () {
                    return items.length
                }
                this.keys = function () {
                    return new MapIterator(items.slice(),'keys')
                }

                this.values = function () {
                    return new MapIterator(items.slice(),'values')
                }
                this.entries = function () {
                    return new MapIterator(items.slice(),'entries')
                }

                if(iterable){
                    if(iterable instanceof Object && iterable[Symbol.iterator]){
                        var iterator = iterable[Symbol.iterator]()
                        var entry,nextResult
                        while(true){
                            nextResult = iterator.next()
                            if(nextResult.done){
                                break
                            }else{
                                entry = nextResult.value
                                if(entry.isKindOf(Object)){
                                    if(Array.isArray(entry)){
                                        /* 不需要判断数组长度 */
                                        this.set(entry[0],entry[1])
                                    }else{
                                        this.set()
                                    }
                                }else{
                                    throw new TypeError('Iterator value '+ entry + ' is not an entry object')
                                }
                            }
                        }
                    }else{
                        throw new TypeError((typeof iterable) +' '+ iterable + ' is not iterable (cannot read property ' +
                            'Symbol(Symbol.iterator))')
                    }
                }
            }
            {
                var MapIteratorKindEnum = {
                    'keys':keepKey,
                    'values':keepValue,
                    'entries':keepEntry
                }
                function keepKey(item) {
                    item.value = item.value[0]
                    return item
                }
                function keepValue(item) {
                    item.value = item.value[1]
                    return item
                }
                function keepEntry(item) {
                    return item
                }
                function MapIterator(array,kind) {
                    Iterator.call(this,array)
                    var superNext = this.next
                    var handler = MapIteratorKindEnum[kind]
                    this.next = function () {
                        return handler(superNext.call(this,array))
                    }
                }
                MapIterator.extend(Iterator)
                Map.prototype.forEach = function (callback,thisArg) {
                    Function.requireArgumentType(callback,window.TypeEnum.FUNCTION)
                    var entries = this.entries()
                    var entry
                    while (entry = entries.next().value){
                        callback.call(thisArg,entry[1],entry[0],this)
                    }
                }
                Map.prototype[Symbol.iterator] = Map.prototype.entries
            }

            window.WeakMap = function (iterable) {
                var map  = new Map()
                this['delete'] = function (key) {
                    if(key instanceof Object){
                        return map['delete'](key)
                    }
                    return false
                }
                this.get = map.get
                this.has = map.has
                this.set = function (key,value) {
                    if(key instanceof Object ){
                        map.set(key,value)
                    }else {
                        throw new TypeError('Invalid value used as weak map key')
                    }
                    return this
                }
                if(iterable){
                    if(iterable instanceof Object && iterable[Symbol.iterator]){
                        var iterator = iterable[Symbol.iterator]()
                        var entry,nextResult
                        while(true){
                            nextResult = iterator.next()
                            if(nextResult.done){
                                break
                            }else{
                                entry = nextResult.value
                                if(entry.isKindOf(Object)){
                                    if(Array.isArray(entry) && entry[0] && entry[0] instanceof Object){
                                        /* 不需要判断数组长度 */
                                        this.set(entry[0],entry[1])
                                    }else{
                                        throw new TypeError('Invalid value used as weak map key')
                                    }
                                }else{
                                    throw new TypeError('Iterator value '+ entry + ' is not an entry object')
                                }
                            }
                        }
                    }else{
                        throw new TypeError((typeof iterable) +''+ iterable + ' is not iterable (cannot read property ' +
                            'Symbol(Symbol.iterator))')
                    }
                }

            }

            window.Set = function(iterable) {
                var map  = new Map()
                this.add = function (value) {
                    map.set(value,value)
                    return this
                }
                this.clear = map.clear
                this['delete'] = map['delete']
                this.has = map.has
                this.getSize = map.getSize
                this.entries = function () {
                    return new SetIterator(map.entries())
                }
                this.values = function () {
                    return new SetIterator(map.values())
                }
                this.keys = this.values
                if(iterable){
                    if(iterable instanceof Object && iterable[Symbol.iterator]){
                        var iterator = iterable[Symbol.iterator]()
                        var nextResult
                        while(true){
                            nextResult = iterator.next()
                            if(nextResult.done){
                                break
                            }else{
                                map.set(nextResult.value,nextResult.value)
                            }
                        }
                    }else{
                        throw new TypeError((typeof iterable) +' '+ iterable + ' is not iterable (cannot read property ' +
                            'Symbol(Symbol.iterator))')
                    }
                }
            }
            {
                function SetIterator(mapIterator) {
                    this.next = function () {
                        return mapIterator.next()
                    }
                }
                SetIterator.extend(Iterator)
                Set.prototype.forEach = Map.prototype.forEach
                Set.prototype[Symbol.iterator] = Set.prototype.values
            }

            window.WeakSet = function (iterable) {
                var set = new Set()
                this.add = function (value) {
                    if(value instanceof Object){
                        set.add(value)
                        return this
                    }else {
                        throw new TypeError('Invalid value used in weak set')
                    }
                }
                this['delete'] = set['delete']
                this.has = set.has
                if(iterable){
                    if(iterable instanceof Object && iterable[Symbol.iterator]){
                        var iterator = iterable[Symbol.iterator]()
                        var nextResult
                        while(true){
                            nextResult = iterator.next()
                            if(nextResult.done){
                                break
                            }else{
                                if(nextResult.value instanceof Object){
                                    set.add(nextResult.value)
                                }else{
                                    throw new TypeError('Invalid value used in weak set')
                                }
                            }
                        }
                    }else{
                        throw new TypeError((typeof iterable) +''+ iterable + ' is not iterable (cannot read property ' +
                            'Symbol(Symbol.iterator))')
                    }
                }
            }
        }
        window.ListMap = function (iterable) {
            var list,map = new Map()
            this.append = function (key, value) {
                var list = map.get(key)
                if (!list) {
                    list = []
                    map.set(key,list)
                }
                list.push(value)
                return this
            }
            this['delete'] = function (key) {
                return map['delete'](key)
            }
            this.get = function (key) {
                list = map.get(key)
                return list ? list[0] : undefined
            }
            this.getAll = function (key) {
                list = map.get(key)
                return list ? list.slice(0) : []
            }

            this.has = function (key) {
                return map.has(key)
            }
            this.set = function (key, value) {
                return map.set(key,[value])
            }
            this.entries = function () {
                return new ListMapIterator(map.entries())
            }
            this.values = function () {
                return new ListMapIterator(map.values())
            }
            this.keys = function () {
                return new ListMapIterator(map.keys())
            }

            if(iterable){
                if(iterable instanceof Object && iterable[Symbol.iterator]){
                    var iterator = iterable[Symbol.iterator]()
                    var entry,nextResult
                    while(true){
                        nextResult = iterator.next()
                        if(nextResult.done){
                            break
                        }else{
                            entry = nextResult.value
                            if(entry.isKindOf(Object)){
                                if(Array.isArray(entry)){
                                    /* 不需要判断数组长度 */
                                    if(Array.isArray(entry[1])){
                                        this.set(entry[0],entry[1])
                                    }else{
                                        this.set(entry[0],[entry[1]])
                                    }
                                }else{
                                    this.set()
                                }
                            }else{
                                throw new TypeError('Iterator value '+ entry + ' is not an entry object')
                            }
                        }
                    }
                }else{
                    throw new TypeError((typeof iterable) +''+ iterable + ' is not iterable (cannot read property ' +
                        'Symbol(Symbol.iterator))')
                }
            }
        }
        {
            function ListMapIterator(mapIterator) {
                SetIterator.call(this,mapIterator)
            }
            ListMapIterator.extend(Iterator)
            ListMap.prototype.forEach = Map.prototype.forEach
        }

        window.SetMap = function (iterable) {
            var set,map = new Map()
            this.append = function (key, value) {
                var set = map.get(key)
                if (!set) {
                    set = new Set()
                    map.set(key,set)
                }
                set.add(value)
                return this
            }
            this['delete'] = function (key) {
                return map['delete'](key)
            }
            this.get = function (key) {
                set = map.get(key)
                return set ? set.values().next().value : null
            }

            this.getAll = function (key) {
                return map.get(key)
            }

            this.has = function (key) {
                return map.has(key)
            }
            this.set = function (key, value) {
                return map.set(key,new Set([value]))
            }
            this.entries = function () {
                return new SetMapIterator(map.entries())
            }
            this.values = function () {
                return new SetMapIterator(map.values())
            }
            this.keys = function () {
                return new SetMapIterator(map.keys())
            }
            if(iterable){
                if(iterable instanceof Object && iterable[Symbol.iterator]){
                    var iterator = iterable[Symbol.iterator]()
                    var entry,nextResult
                    while(true){
                        nextResult = iterator.next()
                        if(nextResult.done){
                            break
                        }else{
                            entry = nextResult.value
                            if(entry.isKindOf(Object)){
                                if(Array.isArray(entry)){
                                    /* 不需要判断数组长度 */
                                    if(entry[1].isKindOf(Set)){
                                        this.set(entry[0],entry[1])
                                    }else{
                                        this.set(entry[0],new Set([entry[1]]))
                                    }
                                }else{
                                    this.set()
                                }
                            }else{
                                throw new TypeError('Iterator value '+ entry + ' is not an entry object')
                            }
                        }
                    }
                }else{
                    throw new TypeError((typeof iterable) +''+ iterable + ' is not iterable (cannot read property ' +
                        'Symbol(Symbol.iterator))')
                }
            }
        }
        {
            function SetMapIterator(mapIterator) {
                SetIterator.call(this,mapIterator)
            }
            SetMapIterator.extend(Iterator)
            SetMap.prototype.forEach = Map.prototype.forEach
        }
        /* jshint ignore:end */
    }

    this.apply = function () {
        extendObject()
        extendFunction()
        extendWindow()
        extendString()
        extendArray()
        extendNumber()
        extendOthers()
        extendCollections()
    }

    this.applyMobile = function () {
        if (!Event) {
            window.Event = function Event() {
                throw new TypeError('This browser doesn\'t support instantiation of class Event')
            }
        }
        window.EventTypeEnum = {
            'TOUCH_START':'touchstart',
            'TOUCH_MOVE':'touchmove',
            'TOUCH_END':'touchend',
            'TOUCH_CANCEL':'touchcancel',
            'values':['touchstart','touchmove','touchend','touchcancel']
        }
    }
}