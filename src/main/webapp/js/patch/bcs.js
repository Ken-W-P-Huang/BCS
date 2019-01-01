/**
 * Created by kenhuang on 2018/10/20.
 */

(function (window) {
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
    /**
     * 不能对Object进行扩展，会破坏jQuery
     * https://stackoverflow.com/questions/21729895/jquery-conflict-with-native-prototype
     * @param obj
     */
    Function.prototype.defineStatic= function (obj) {
        var member
        for(member in obj){
            if(obj.hasOwnProperty(member)){
                this[member] = obj[member]
            }
        }
        return this
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

    window.isIE = function(version){
        var b = document.createElement("b")
        b.innerHTML ="<!--[if lt IE"+version+"]> <i></i> <![endif]-->"
        return b.getElementsByTagName("i").length == 1
    }
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

/**********************************************************************************************************************
 * 类
 **********************************************************************************************************************/
    function File(fullPath) {
        'use strict'
        var name,path
        var arr = fullPath.split("/")
        name = arr[arr.length - 1]
        delete arr[arr.length - 1]
        path = arr.join("/")
        if(typeof File.prototype.getName !== "function"){
            File.prototype.getName = function () {
                return name
            }
            File.prototype.getPath = function () {
                return path
            }
        }
    }
    File.defineStatic({
        getCurrentJsFile : function () {
            var scripts = document.getElementsByTagName("script")
            return new File(scripts[scripts.length - 1].getAttribute("src"))
        },
        importScripts:function () {
            for(var i=0;i<arguments.length;i++){
                document.write('<script src="'+arguments[i]+'"><\/script>')
            }
        },
        importCsses: function () {
            for(var i=0;i<arguments.length;i++){
                document.write('<link rel="stylesheet" type="text/css" href="'+arguments[i]+'"\/>')
            }
        }
    })

    /**
     *  引入依赖，IE10不支持条件注释载入js文件,不建议使用IE9兼容模式 <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE9">
     *  https://msdn.microsoft.com/en-us/library/hh801214(v=vs.85).aspx
     *  http://www.webhek.com/post/conditional-comments-in-ie11-10.html
     */
    var file = File.getCurrentJsFile()
    if (!document.addEventListener) {
        // IE6~IE8
        File.importScripts(
            file.getPath()+'../lib/excanvas.js',
            file.getPath()+'../lib/json.js',
            file.getPath()+'../lib/respond.js',
            file.getPath()+'../lib/es5-shim.js',
            //file.getPath()+'../lib/es5-sham.js',
            file.getPath()+'ie678patch.js')
    }
    File.importCsses(file.getPath()+'../../css/lib/bootstrap.css')
    File.importScripts(file.getPath()+'../lib/avalon.js',
        file.getPath()+'../lib/jquery.js',
        file.getPath()+'../lib/jquery-migrate.js',
        file.getPath()+'../lib/bootstrap.js')
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
         * 1.chrome打开新页面的瞬间,newWindow和当前window似乎共用同一个sessionStorage。此时不能设置sessionStorage，
         * 否则会引起newWindow的sessionStorage异常。只能直接将页面数据保存在window.name下。
         * 2.chrome在当前tab打开新页面时，ajax异步模式和Chrome插件会导致浏览器前进后退功能异常。异步模式下，firefox,safari浏览器必须
         * 在异步代码外使用newWindow=window.open('',WindowName.blank)创建新window。建议使用Ajax同步模式，反正要等收到服务器端的数
         * 据之后才能打开新页面。
         * 3.safari 从页面打开另一新页面时，浏览器可以后退。切换页面之后才正常。
         * @param pageInfo
         * @param windowName "_blank" "_self".(_parent，_top，自定义name的情况未测试，暂时无用。)
         * @param newWindow 为了和safari浏览器兼容，在同步时，如ajax async=false可以忽略此参数。
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
        }
    }

})(typeof window === 'undefined' ? this : window)

