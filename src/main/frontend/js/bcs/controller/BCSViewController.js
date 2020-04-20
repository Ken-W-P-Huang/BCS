/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSView} from '../view/BCSView'
var controllerComponentName = 'controller'
export function BCSViewController(view) {
    var propertiesMap = {
        childViewControllers : [],
        parent : null,
        presentedViewController : null,
        presentingViewController : null
    }
    this.enableProtectedProperty(propertiesMap)
    if (view && view.isKindOf(BCSView)) {
        this.view = view
    }else {
        this.view = new BCSView({width:'100%',height:'100%'})
    }
    this.view.getLayer().setAttribute(controllerComponentName,this.getClass())
}
var prototype = BCSViewController.prototype
prototype.getChildViewControllers = function () {
    return this.getProtected('childViewControllers')
}
prototype.getParent = function () {
    return this.getProtected('parent')
}
prototype.getPresentedViewController = function () {
    return this.getProtected('presentedViewController')
}
prototype.getPresentingViewController = function () {
    return this.getProtected('presentingViewController')
}
// 构造函数会在document.onload事件触发时调用，viewDidLoad则在window.onload事件中调用
prototype.viewDidLoad = function () {

}
prototype.layoutSubViews = function () {

}

prototype.viewWillAppear=function (animated) {

}
prototype.viewDidAppear = function (animated) {

}
prototype.viewWillDisappear = function (animated) {

}
prototype.viewDidDisappear = function (animated) {

}
prototype.viewWillUnload = function () {

}
prototype.viewDidUnload = function () {

}
prototype.addChildViewController = function (viewController) {
}

prototype.insertChildViewController = function (viewControllerIndex) {

}
prototype.removeFromParentViewController = function () {

}

prototype.removeChildViewController = function (index) {

}
/**
 *
 * @param dataURL json数据的URL
 * @param errorCallback
 * @param method
 * @param data  Post所需的data，应该没用
 * @returns {*}
 */
prototype.loadPageInfo = function (dataURL,errorCallback,method,data) {
    var pageinfo,key = BCSViewController.key
    if(window.name){
        var object = JSON.parse(window.name)
        pageinfo = object[key]
        if(pageinfo){
            try{
                delete object[key]
            }catch(e){
                object[key] = undefined
            }
            window.name = JSON.stringify(object)
            /* 可能发生异常情况，导致pageinfo没有被使用就载入新页面 */
            if (pageinfo.url !== location.href && pageinfo.pathname !== location.pathname ) {
                pageinfo = undefined
            }
        }
    }
    if(!pageinfo && dataURL ){
        method = method || window.HttpMethodEnum.GET
        var request = new XMLHttpRequest()
        if (request !== null) {
            /* window.location.search 用户可能输入参数 */
            request.open(method, '' + dataURL + window.location.search, false)
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    switch (request.status) {
                        case 302:
                        case 200:
                            if (request.responseText) {
                                pageinfo = JSON.parse(request.responseText)
                            }
                            break
                        default:
                            errorCallback && errorCallback(request.status, request.statusText)
                            break
                    }
                }
            }
            request.send(data)
        }else{
            throw new TypeError('XMLHttpRequest is not supported')
        }
    }
    if(pageinfo && pageinfo.title){
        document.title = pageinfo.title
    }
    return pageinfo
}

/**
 * 1.Chrome打开新页面的瞬间,newWindow和当前window似乎共用同一个sessionStorage。此时不能设置newWindow的sessionStorage，
 * 否则会引起newWindow的sessionStorage异常。只能直接将页面数据保存在window.name下。
 * 2.Chrome在当前tab打开新页面时，ajax异步模式和Chrome插件会导致浏览器前进后退功能异常。异步模式下，Firefox,Safari浏览器必须
 * 在异步代码外使用newWindow=window.open('',WindowNameEnum.blank)创建新window。建议使用Ajax同步模式，反正要等收到服务器端的数
 * 据之后才能打开新页面。
 * 3.Safari 从页面打开另一新页面时，浏览器可以后退。切换页面之后才正常。
 * 4.字符串长度
 * 5.sessionStorage会保留同一个tab下同一个域名不同页面的信息，故为了兼容sessionStorage，window.name的内容必须保留
 *  Mac Chrome 512M  Safari 1G Firefox 128M
 *  XP Chrome 128M IE8 128M
 * @param pageInfo 含有表示跳转页面完整路径或者相对根路径的url
 *        例如 pageInfo = {
 *              url:'https://www.cc.com/dd' //优先完整路径
 *              pathName:''/abc.html''
 *        }
 * @param windowName "_blank" "_self".(_parent，_top，自定义name的情况未测试，暂时无用。)
 * @param newWindow 在异步代码调用本方法时，需要先在同步代码段中打开空的window，否则浏览器会进行拦截。
 */
prototype.openWindow = function (pageInfo,windowName,newWindow) {
    Function.requireArgumentNumber(arguments,2)
    Function.requireArgumentType(pageInfo,'object')
    if(pageInfo instanceof Object){
        var url,name,object,WindowNameEnum = window.WindowNameEnum
        if (pageInfo.url) {
            url = pageInfo.url
        }else if(pageInfo.pathname){
            url = location.hostname + pageInfo.pathname
        }else{
            throw new TypeError('invalid url & pathname')
        }
        windowName = windowName || WindowNameEnum.SELF
        newWindow= newWindow ||window.open('',windowName)
        if(newWindow){
            if (newWindow.name) {
                object = JSON.parse(newWindow.name)
            }else {
                object = {}
            }
            object[BCSViewController.key] = pageInfo
            /*bluebird内部机制未知，但感觉会在调用外部函数JSON.stringify时切换以让出CPU，而非等待函数结束后再切换*/
            name = JSON.stringify(object)
            newWindow.name = name
            newWindow.location.assign(url)
        }else{
            throw new OpenWindowException('Failed to open window.Please check if url is correct ' +// jshint ignore:line
                'or popup new window function is blocked!')
        }
    }else{
        throw new TypeError('invalid pageinfo') // jshint ignore:line
    }
}

BCSViewController.key = "$page"






