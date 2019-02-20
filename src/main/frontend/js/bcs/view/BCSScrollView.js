/**
 * Created by kenhuang on 2019/1/25.
 */
import {BCSView} from './BCSView'
export function BCSScrollView(){
    BCSView.call(this)
    if(!BCSView.prototype.appendTo){
        BCSView.prototype.enableRubberBand = function () {

        }
        BCSView.prototype.enableQuickMove = function () {
            var lastTime = 0
            var currentTime =0
            // var lastPoint
            // var currentPoint
            //如果容器位置大于等于0时，则在拖动时就启用橡皮筋，否则进行滑屏直到屏幕底部
            //防止误点击
            // 速度残留，需要在touchstart将速度设置为0
            // 1/2跳转
            //防抖动
            //横竖方向都适用
            //即点即停
        }
    }
}
BCSScrollView.extend(BCSView)

