/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,EventTypeEnum} from './BCSGestureRecognizer'

var NUMBER_OF_TOUCHES_REQUIRED = 2


// Begins:  when two touches have moved enough to be considered a rotation
// Changes: when a finger moves while two fingers are down
// Ends:    when both fingers have lifted
export function BCSRotateGestureRecognizer(target,action){
    BCSGestureRecognizer.call(this,target,action)
    this.rotation = 0
    rotateGestureRecognizerMap[this.getKey()] = {
        numberOfContinualTaps : 0,
        initTouchBeganLocation : null,
        currentTouchBeganLocation : null,
        currentTouchBeganTimeStamp : 0,
        longPressStartPoint : null,
        velocity : 0,
    }
}

var rotateGestureRecognizerMap = {}
BCSRotateGestureRecognizer.extend(BCSGestureRecognizer)
BCSRotateGestureRecognizer.prototype.shouldRequireFailureOf = function(otherGestureRecognizer){
    if (otherGestureRecognizer.isKindOf(BCSRotateGestureRecognizer)
        && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

BCSRotateGestureRecognizer.prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
    if (otherGestureRecognizer.isKindOf(BCSRotateGestureRecognizer)
        && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}


BCSRotateGestureRecognizer.prototype.getVelocity = function () {
    return rotateGestureRecognizerMap[this.getKey()].velocity
}

BCSRotateGestureRecognizer.prototype.touchesBegan = function (touches, event){
    var data = rotateGestureRecognizerMap[this.getKey()]
    BCSGestureRecognizer.prototype.touchesBegan.call(this,touches, event)

}

BCSRotateGestureRecognizer.prototype.touchesMoved = function (touches, event){
    var data = rotateGestureRecognizerMap[this.getKey()]
    BCSGestureRecognizer.prototype.touchesMoved.call(this,touches, event)

}

BCSRotateGestureRecognizer.prototype.touchesEnded = function (touches, event){
    var data = rotateGestureRecognizerMap[this.getKey()]
    BCSGestureRecognizer.prototype.touchesEnded.call(this,touches, event)

}

BCSRotateGestureRecognizer.prototype.deinit = function () {
    BCSGestureRecognizer.prototype.deinit.call(this)
    try{
        delete rotateGestureRecognizerMap[this.getKey()]
    }catch(e){
        rotateGestureRecognizerMap[this.getKey()] = undefined
    }
}