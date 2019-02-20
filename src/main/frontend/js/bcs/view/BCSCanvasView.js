/**
 * Created by kenhuang on 2019/1/10.
 */
import {BCSView} from './BCSView'
import {FlashCanvas} from '../../lib/flashcanvas'
export function BCSCanvasView(element, style) {
    if (typeof FlashCanvas !== "undefined") {
        element = FlashCanvas.initElement(element);
    }
    BCSView.call(this,element,style)
}

export function BCSCanvasView1(elementId, style) {
    var element = document.getElementById(elementId)
    return new BCSCanvasView(element,style)
}

export function BCSCanvasView2(style) {
    var element = document.createElement('canvas')
    return new BCSCanvasView(element,style)
}
/* 应用补丁之后的canvas代码需要在window.onload执行 */
BCSCanvasView.prototype.drawRect = function () {

}




