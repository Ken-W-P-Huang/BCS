/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,EventTypeEnum} from './BCSGestureRecognizer'
var NUMBER_OF_TOUCHES_REQUIRED = 2

// Begins:  when two touches have moved enough to be considered a pinch
// Changes: when a finger moves while two fingers remain down
// Ends:    when both fingers have lifted

export function BCSPinchGestureRecognizer(target,action){
    BCSGestureRecognizer.call(this,target,action)
    pinchGestureRecognizerMap[this.getKey()] = {
        scale:0,
        /*放大为正，缩小为负*/
        velocity:0,

    }
}

var pinchGestureRecognizerMap = {}
BCSPinchGestureRecognizer.extend(BCSGestureRecognizer)
var prototype = BCSPinchGestureRecognizer.prototype
prototype.getNumberOfTouches = function () {
    return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this)
}

prototype.locate = function (view) {
    if (this.getNumberOfTouches() > 0 ) {
        return BCSGestureRecognizer.locate(view)
    }else{
        return new BCSPoint(- view.getStyle('left'), - view.getStyle('top') )
    }
}

prototype.locateTouch = function (index,view) {
    if(this.getNumberOfTouches() > 0){
        return BCSGestureRecognizer.prototype.locateTouch(index,view)
    }else{
        return BCSGestureRecognizer.prototype.locateTouch(-1,view)
    }
}
prototype.reset = function() {
    BCSGestureRecognizer.prototype.reset.call(this)
    var data = longPressGestureRecognizerMap[this.getKey()]
    data.numberOfContinualTaps = 0
    data.initTapStartLocation = new BCSPoint()
    data.currentTouchBeganTimeStamp = 0
    data.numberOfOffTouches = 0
    data.isAvailableTouchesRemovable = false
    clearTimeout(data.timer)
    data.timer = undefined
}


prototype.getScale = function () {
    return pinchGestureRecognizerMap[this.getKey()].scale
}
prototype.getVelocity = function () {
    return pinchGestureRecognizerMap[this.getKey()].velocity
}
prototype.shouldRequireFailureOf = function(otherGestureRecognizer){
    if (otherGestureRecognizer.isKindOf(BCSPinchGestureRecognizer)
        && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
    if (otherGestureRecognizer.isKindOf(BCSPinchGestureRecognizer)
        && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

prototype.touchesBegan = function (touches, event){
    var data = pinchGestureRecognizerMap[this.getKey()],
        touchesNeeded = [],i = 0
    for(i = 0; i < 2 - BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) && i < touches.length; i++) {
        touchesNeeded.push(touches[i])
    }
    BCSGestureRecognizer.prototype.touchesBegan.call(this,touchesNeeded, event)
    for(; i < touches.length; i++) {
      this.ignore(touches[i],event)
    }
}

prototype.touchesMoved = function (touches, event){
    var data = pinchGestureRecognizerMap[this.getKey()]
    BCSGestureRecognizer.prototype.touchesMoved.call(this,touches, event)
    if (this.getNumberOfTouches() === 2 ) {
        switch(this.state){
            case BCSGestureRecognizerStateEnum.POSSIBLE:
                // 距离增加/减少8
                this.state = BCSGestureRecognizerStateEnum.BEGAN
                break
            case BCSGestureRecognizerStateEnum.BEGAN:
                this.state = BCSGestureRecognizerStateEnum.CHANGED
            case BCSGestureRecognizerStateEnum.CHANGED:
                data
                break
            default:

        }
    }
}

//抬起后scale和velocity保持不变，可以抬起一根手指后重新按下与另一根手指重新形成新手势
prototype.touchesEnded = function (touches, event){
    var data = pinchGestureRecognizerMap[this.getKey()]
    BCSGestureRecognizer.prototype.touchesEnded.call(this,touches, event)
    if (this.state === BCSGestureRecognizerStateEnum.BEGAN
        || this.state === BCSGestureRecognizerStateEnum.CHANGED) {
        this.state = BCSGestureRecognizerStateEnum.ENDED
    }
}

prototype.deinit = function () {
    BCSGestureRecognizer.prototype.deinit.call(this)
    try{
        delete pinchGestureRecognizerMap[this.getKey()]
    }catch(e){
        pinchGestureRecognizerMap[this.getKey()] = undefined
    }
}