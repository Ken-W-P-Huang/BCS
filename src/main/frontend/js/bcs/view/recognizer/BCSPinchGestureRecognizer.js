/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,EventTypeEnum,defaults} from './BCSGestureRecognizer'
import BCSPoint from './BCSPoint'
var NUMBER_OF_TOUCHES_REQUIRED = 2

// Begins:  when two touches have moved enough to be considered a pinch
// Changes: when a finger moves while two fingers remain down
// Ends:    when both fingers have lifted

export function BCSPinchGestureRecognizer(target,action){
    BCSGestureRecognizer.call(this,target,action)
    var propertiesMap = {
        scale:1,
        /*放大为正，缩小为负*/
        velocity:0,
        initDistance:0,
        scaleDistance:0,
        lastTimestamp : 0
    }
    this.initProperties(propertiesMap)
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
    this.setPrivate('scale',1)
    this.setPrivate('velocity',0)
    this.setPrivate('initDistance',0)
    this.setPrivate('scaleDistance',0)
    this.setPrivate('lastTimestamp',0)
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
    this.state = BCSGestureRecognizerStateEnum.POSSIBLE
    var touchesNeeded = [],i = 0,
        numberNeeded = NUMBER_OF_TOUCHES_REQUIRED - BCSGestureRecognizer.prototype.getNumberOfTouches.call(this)
    for(i = 0; i < numberNeeded && i < touches.length; i++) {
        touchesNeeded.push(touches[i])
    }
    BCSGestureRecognizer.prototype.touchesBegan.call(this,touchesNeeded, event)
    if (this.getPrivate('lastTimestamp') === 0 &&
        BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === NUMBER_OF_TOUCHES_REQUIRED) {
        this.setPrivate('initDistance',BCSGestureRecognizer.prototype.locateTouch.call(this,0,this.getView()
            .window).distanceFrom(BCSGestureRecognizer.prototype.locateTouch.call(this,1,this.getView().window)))
        this.setPrivate('lastTimestamp',event.timeStamp)
    }
    if (this.state !== BCSGestureRecognizerStateEnum.BEGAN &&  this.state !== BCSGestureRecognizerStateEnum.CHANGED) {
        this.state = BCSGestureRecognizerStateEnum.POSSIBLE
    }
    for(; i < touches.length; i++) {
      this.ignore(touches[i],event)
    }
}
function calculateScaleVelocity(self) {
    var distanceAfterUpdate = 0
    var scale = distanceAfterUpdate / self.getPrivate('scaleDistance')
    var duration = event.timeStamp - self.getPrivate('lastTimestamp')
    if (duration !== 0 ) {
        //todo 不知道为何会出现duration = 0
        self.setPrivate('velocity', (scale - self.getPrivate('scale')) / duration * 1000)
    }
    self.setPrivate('lastTimestamp',event.timeStamp)
    self.setPrivate('scale',scale)
}
//抬起后scale和velocity保持不变，可以抬起一根手指后重新按下与另一根手指重新形成新手势
prototype.touchesMoved = function (touches, event){
    var distanceAfterUpdate = 0
    BCSGestureRecognizer.prototype.touchesMoved.call(this,touches, event)
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === NUMBER_OF_TOUCHES_REQUIRED) {
        distanceAfterUpdate = BCSGestureRecognizer.prototype.locateTouch.call(this,0,this.getView().window)
            .distanceFrom(BCSGestureRecognizer.prototype.locateTouch.call(this,1,this.getView().window))
        switch(this.state){
            case BCSGestureRecognizerStateEnum.POSSIBLE:
                var delta = distanceAfterUpdate - this.getPrivate('initDistance')
                if (Math.abs(delta) >= defaults.pinchMinOffset ) {
                    this.setPrivate('scaleDistance',this.getPrivate('initDistance')
                        + delta/Math.abs(delta) * defaults.pinchMinOffset)
                    this.state = BCSGestureRecognizerStateEnum.BEGAN
                    calculateScaleVelocity(this)
                }
                break
            case BCSGestureRecognizerStateEnum.BEGAN:
                this.state = BCSGestureRecognizerStateEnum.CHANGED
                calculateScaleVelocity(this)
                break
            case BCSGestureRecognizerStateEnum.CHANGED:
                calculateScaleVelocity(this)
                break
            default:
        }
    }
}

prototype.touchesEnded = function (touches, event){
    BCSGestureRecognizer.prototype.touchesEnded.call(this,touches, event)
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === touches.length ) {
        if (this.state === BCSGestureRecognizerStateEnum.BEGAN
            || this.state === BCSGestureRecognizerStateEnum.CHANGED) {
            this.state = BCSGestureRecognizerStateEnum.ENDED
        }else{
            this.state = BCSGestureRecognizerStateEnum.FAILED
        }
    }else{
        setTimeout(function () {
            BCSGestureRecognizer.prototype.removeAvailableTouches.call(this,touches)
        }.bind(this))
    }
}


