/**
 * Created by kenhuang on 2020/4/13.
 */
import {BCSView} from './BCSView'

export function BCSWindow() {
    var Class,subElement,children,controllerClass
    var viewMap = new Map()
    var controllerMap = new Map()
    var element = document.getElementsByTagName("html")[0]
    var list = [element]
    this.enableProtectedProperty({
        layer : element,
        rootViewController:null
    })
    BCSView.call(this)
    /* 解析HTML文档，生成子View树*/
    viewMap.set(element,this)
    while (list.length > 0){
        element = list.shift()
        children = element.children
        for(var i = 0; i< children.length; i++){
            subElement = children[i]
            if (!IgnoreTagEnum[subElement.tagName]) { // jshint ignore:line
                list.push(subElement)
                /* 已经自行使用view='xxx'指定类型 */
                Class =  window[subElement.getAttribute(componentName)] // jshint ignore:line
                if(!Class){
                    // /*根据标签名创建相应类型的View*/
                    // Class = window['BCS' + subElement.tagName.toFirstUpperCase()]
                    Class = ElementViewEnum[subElement.tagName] // jshint ignore:line
                }
                if (!Class) {
                    /* 默认BCSView处理 */
                    if (subElement.tagName !== 'div') {
                        console.log(subElement.tagName + ' is initialized as BCSView.')
                    }
                    Class = BCSView
                }
                var view = new Class()
                subElement.setAttribute(componentName,Class.name) // jshint ignore:line
                view.setProtected('layer',subElement)
                viewMap.get(element).getProtected('subViews').push(view)
                viewMap.set(subElement,view)
                controllerClass =  window[subElement.getAttribute(controllerComponentName)] // jshint ignore:line
                if(controllerClass){
                    controllerMap.set(subElement,new controllerClass(view))
                }
            }
        }
    }
    this.findViewById = function (id) {
        var e = document.getElementById(id)
        return viewMap.get(e)
    }
    this.findControllerById = function (id) {
        var e = document.getElementById(id)
        return controllerMap.get(e)
    }
}
BCSWindow.extend(BCSView)
BCSWindow.prototype.setRootViewController = function (controller) {
    this.setProtected('rootViewController',controller)
    this.getSubViews()[0].addSubView(controller.view)
}