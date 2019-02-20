/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSViewController} from './BCSViewController'
/**
 * 用于PC端
 * @param element
 * @constructor
 */
export function BCSWindowController(element) {
    BCSViewController.call(this,element)
}
BCSWindowController.extend(BCSViewController,{
    loadPageInfo :function (dataURL,errorCallback,method,data) {
    if(!this.window[BCSWindowController.key]){
        if(this.window.name){
            var obj = JSON.parse(this.window.name)
            this.window[BCSWindowController.key] = obj[BCSWindowController.key]
            this.window.name = ''
        }
        if(!this.window[BCSWindowController.key] && dataURL ){
            method = method || this.window.HttpMethodEnum.get
            var xmlhttp
            if (this.window.XMLHttpRequest) {
                xmlhttp=new XMLHttpRequest()
            } else if (this.window.ActiveXObject) {
                xmlhttp=new this.window.ActiveXObject("Microsoft.XMLHTTP")
            }
            if (xmlhttp) {
                /* window.location.search 用户可能输入参数 */
                xmlhttp.open(method,''+dataURL+this.window.location.search,false)
                xmlhttp.onreadystatechange = function () {
                    if(xmlhttp.readyState === 4 ){
                        switch (xmlhttp.status){
                            case 302:
                            case 200:
                                if(xmlhttp.responseText){
                                    this.window[BCSWindowController.key] = JSON.parse(xmlhttp.responseText)
                                }
                                break
                            default:
                                if(errorCallback){
                                    errorCallback(xmlhttp.status,xmlhttp.statusText)
                                }
                                break
                        }
                    }
                }
                xmlhttp.send(data)
            } else {
                if(errorCallback){
                    errorCallback(-1,"This browser does not support XMLHttpRequest.")
                }
            }
        }
    }
    if(this.window[BCSWindowController.key]){
        document.title = this.window[BCSWindowController.key].title || document.title
    }
},
/**
 * 1.Chrome打开新页面的瞬间,newWindow和当前window似乎共用同一个sessionStorage。此时不能设置sessionStorage，
 * 否则会引起newWindow的sessionStorage异常。只能直接将页面数据保存在window.name下。
 * 2.Chrome在当前tab打开新页面时，ajax异步模式和Chrome插件会导致浏览器前进后退功能异常。异步模式下，Firefox,Safari浏览器必须
 * 在异步代码外使用newWindow=window.open('',WindowNameEnum.blank)创建新window。建议使用Ajax同步模式，反正要等收到服务器端的数
 * 据之后才能打开新页面。
 * 3.Safari 从页面打开另一新页面时，浏览器可以后退。切换页面之后才正常。
 * 4.字符串长度
 *  Mac Chrome 512M  Safari 1G Firefox 128M
 *  XP Chrome 128M IE8 128M
 * @param pageInfo
 * @param windowName "_blank" "_self".(_parent，_top，自定义name的情况未测试，暂时无用。)
 * @param newWindow 为了和Safari浏览器兼容，在同步时，如ajax async=false可以忽略此参数。
 */
openWindow : function (pageInfo,windowName,newWindow) {
    if(pageInfo && pageInfo.url){
        windowName = windowName || this.window.WindowNameEnum.self
        newWindow= newWindow ||this.window.open('',windowName)
        if(newWindow){
            newWindow.location.assign(pageInfo.url)
            var obj = {}
            obj[BCSWindowController.key] = pageInfo
            newWindow.name = JSON.stringify(obj)

        }else{
            throw new OpenWindowException('Failed to open window.Please check if url is correct ' +// jshint ignore:line
                'or popup new window function is blocked!')
        }
    }else{
        throw new MalformedURLException('Member pageInfo.url should not be null!') // jshint ignore:line
    }
}
},{
    key : "$page",
})