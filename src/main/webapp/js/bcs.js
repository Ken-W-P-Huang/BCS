/**
 * Created by kenhuang on 2018/10/20.
 */
/******************************************************************************************************************
 * 错误处理
 ******************************************************************************************************************/
(function () {
    window.onerror = function(message, url, line,column,error) {
        console.log(url+":"+line+":"+column+":\""+message+"\"")
        return false
    }
    Error.prototype.log = function () {
        var stack = this.stack
        stack=stack.substring(stack.lastIndexOf(" ")+1)
        stack=stack.substring(stack.indexOf("@")+1).trim("\n")
        console.log(stack+":\""+this.name+","+this.message+"\"")
    }
})()
/******************************************************************************************************************
 *  LocalStorage
 ******************************************************************************************************************/
function LocalStorage() {
    var private = {
        hostKey: location.hostKey ? location.hostKey : 'localHost',
        isLocalStorageAvailable: window.localStorage ? true : false,
        dataElement: null
    }
    if (typeof this.initDom !== 'function') {
        LocalStorage.prototype.initDom = function () {
            if (!private.dataElement) {
                try {
                    private.dataElement = document.createElement('input')
                    private.dataElement.type = 'hidden'
                    private.dataElement.addBehavior('#default#userData')
                    document.getElementsByTagName("head")[0].appendChild(private.dataElement)
                    // var expireDate = new Date()
                    // expireDate.setDate(expireDate.getDate() + 1)
                    // private.dataElement.expires = expireDate.toUTCString()
                } catch (err) {
                    err.log()
                    return false
                }
            }
            return true
        }
    }

    if (typeof this.set !== 'function') {
        LocalStorage.prototype.set = function (key, value) {
            if (private.isLocalStorageAvailable) {
                window.localStorage.setItem(key, value)
            } else {
                if (this.initDom()) {
                    try {
                        private.dataElement.load()
                        private.dataElement.setAttribute(key, value)
                        private.dataElement.save(private.hostKey)
                    } catch (e) {
                        e.log()
                        return false
                    }
                } else {
                    return false
                }
            }
        }
    }

    if (typeof this.get !== 'function') {
        LocalStorage.prototype.get = function (key) {
            if (private.isLocalStorageAvailable) {
                return window.localStorage.getItem(key)
            } else {
                if (this.initDom()) {
                    try {
                        private.dataElement.load(private.hostKey)
                        return private.dataElement.getAttribute(key)
                    } catch (e) {
                        e.log()
                        return null
                    }
                } else {
                    return null
                }
            }
        }
    }

    if (typeof this.remove !== 'function') {
        LocalStorage.prototype.remove = function (key) {
            if (private.isLocalStorageAvailable) {
                localStorage.removeItem(key)
            } else {
                if (this.initDom()) {
                    try {
                        private.dataElement.load(private.hostKey)
                        private.dataElement.removeAttribute(key)
                        private.dataElement.save(private.hostKey)
                    } catch (e) {
                        e.log()
                        return false
                    }
                } else {
                    return false
                }
            }
        }
    }
}
/******************************************************************************************************************
 *  BCS
 ******************************************************************************************************************/
/**
 * $page 应当包含url,data等必要属性，i18n,title为可选属性
 * @constructor
 */
(function () {
    function BCS() {}
    // var localStorage = new LocalStorage()
    BCS.loadPageInfo = function (dataURL, errorCallback) {
        if(window.name){
            window.$page = window.name
            window.name = ''
        }else{
            if(dataURL){
                $.ajax({url:''+dataURL+window.location.search,
                    type:'GET',
                    async:false,
                    dataType:'text',
                    success:function (data) {
                        window.$page =data
                    },
                    error:errorCallback})
            }
        }
        if(!$.isPlainObject(window.$page)){
            window.$page = $.parseJSON(window.$page)
        }
        if(window.$page){
            if( window.$page.title){
                document.title = window.$page.title
            }
        }
    }

    /**
     * 在windowName=_self的情况下,newWindow.$page = pageData无效。window.name却可以保存数据到下一页面。
     * _parent，_top，name的情况未测试，暂时无用。
     * @param pageData
     * @param windowName "_blank" "_self"
     */
    BCS.openWindow = function (pageInfo,windowName) {
        if(pageInfo && pageInfo.url){
            if(!windowName){
                windowName = "_self"
            }
            var newWindow = window.open(pageInfo.url,windowName,'',false)
            newWindow.name = JSON.stringify(pageInfo)
        }
    }
    window.BCS = BCS
})()

/******************************************************************************************************************
 * Ignore below!!!!
 ******************************************************************************************************************/
/*不能扩展，会引发IE6 avalon异常*/
// Object.prototype.printProperties=function() {
//     var propertyInfo = [];
//     for(var property in this){
//         if(this.hasOwnProperty(property)){
//             propertyInfo.push(property + ":" + this[property]);
//         }
//     }
//     console.log(propertyInfo.join("\n"))
// }
/**
 * 在windowName=_self的情况下,在本方法结束前window/newWindow.document依然是旧的html文档，尝试使用ajax下载目标html文档，并往文档中插
 * 入"\<script>window.$page="+JSON.stringify($page)+"\<\/script>"，然后使用newWindow.document.write()载入目标html文档。
 * h5才能修改地址栏的地址,而且旧的html文档历史会消失。location.href/assign()和window.open(_self)效果类似。
 * @param $page
 * @param windowName
 */
// function openWindowForFun($page,windowName) {
//     if($page && $page.url){
//         if(!windowName){
//             windowName = "_self"
//         }
//         const newWindow =window.open($page.url,windowName,'',false)
//         const newDocucment = $.ajax({url:$page.url,type:'get',async:false}).responseText
//         if(newDocucment){
//             newWindow.document.write(newDocucment)
//             $(newDocucment).find("head script:first").prepend("\<script>window.$page="+JSON.stringify($page)+"\<\/script>")
//         }
//         window.history.pushState({html:newDocucment},"",location.href.replace(location.pathname,"/"+$page.url))
//     }
// }