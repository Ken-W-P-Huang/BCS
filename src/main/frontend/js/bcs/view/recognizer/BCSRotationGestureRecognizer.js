/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,EventTypeEnum,defaults} from './BCSGestureRecognizer'
import {BCSPoint,BCSVector1} from './BCSPoint'
var NUMBER_OF_TOUCHES_REQUIRED = 2

// Begins:  when two touches have moved enough to be considered a rotation
// Changes: when a finger moves while two fingers are down
// Ends:    when both fingers have lifted

export function BCSRotationGestureRecognizer(target,action){
    BCSGestureRecognizer.call(this,target,action)
    var propertiesMap = {
        rotation:0,
        /*顺时针为正，逆时针为负*/
        velocity:0,
        initVector:null,
        lastVector:0,
        lastTimestamp : 0
    }
    this.initProperties(propertiesMap)
}

var rotationGestureRecognizerMap = {}
BCSRotationGestureRecognizer.extend(BCSGestureRecognizer)
var prototype = BCSRotationGestureRecognizer.prototype
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
    this.setPrivate('rotation',0)
    this.setPrivate('velocity',0)
    this.setPrivate('initVector',null)
    this.setPrivate('rotateAngle',0)
    this.setPrivate('lastTimestamp',0)
}


prototype.getRotation = function () {
    return rotationGestureRecognizerMap[this.getKey()].rotation
}
prototype.getVelocity = function () {
    return rotationGestureRecognizerMap[this.getKey()].velocity
}
prototype.shouldRequireFailureOf = function(otherGestureRecognizer){
    if (otherGestureRecognizer.isKindOf(BCSRotationGestureRecognizer)
        && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
    if (otherGestureRecognizer.isKindOf(BCSRotationGestureRecognizer)
        && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

prototype.touchesBegan = function (touches, event){
    var  touchesNeeded = [],i = 0,
        numberNeeded = NUMBER_OF_TOUCHES_REQUIRED - BCSGestureRecognizer.prototype.getNumberOfTouches.call(this)
    for(i = 0; i < numberNeeded && i < touches.length; i++) {
        touchesNeeded.push(touches[i])
    }
    BCSGestureRecognizer.prototype.touchesBegan.call(this,touchesNeeded, event)
    if (!this.getPrivate('initVector') && BCSGestureRecognizer.prototype.getNumberOfTouches.call(this)
        === NUMBER_OF_TOUCHES_REQUIRED) {
        this.setPrivate('initVector',new BCSVector1(BCSGestureRecognizer.prototype.locateTouch.call(this,0,
            this.getView().window), BCSGestureRecognizer.prototype.locateTouch.call(this,1,this.getView().window)))
        this.setPrivate('lastTimestamp',event.timeStamp)
    }
    if (this.state !== BCSGestureRecognizerStateEnum.BEGAN &&  this.state !== BCSGestureRecognizerStateEnum.CHANGED) {
        this.state = BCSGestureRecognizerStateEnum.POSSIBLE
    }
    for(; i < touches.length; i++) {
      this.ignore(touches[i],event)
    }
}
function calculateRotationVelocity(self) {
    var vectorAfterUpdate = self.getPrivate('lastVector')
    var delta = vectorAfterUpdate.intersectionAngleWith(self.getPrivate('lastVector'))
    self.setPrivate('rotation',self.getPrivate('rotation')+delta)
    var duration = event.timeStamp - self.getPrivate('lastTimestamp')
    if (duration > 0 ) {
        //todo 不知道为何会出现duration = 0
        self.setPrivate('velocity',delta / duration * 1000)
    }
    self.setPrivate('lastTimestamp',event.timeStamp)
    self.setPrivate('lastVector',vectorAfterUpdate)
}
//抬起后rotation和velocity保持不变，可以抬起一根手指后重新按下与另一根手指重新形成新手势
prototype.touchesMoved = function (touches, event){
    var vectorAfterUpdate,delta,duration
    BCSGestureRecognizer.prototype.touchesMoved.call(this,touches, event)
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === NUMBER_OF_TOUCHES_REQUIRED) {
        vectorAfterUpdate = new BCSVector1(BCSGestureRecognizer.prototype.locateTouch.call(this,0,this.getView().window),
            BCSGestureRecognizer.prototype.locateTouch.call(this,1,this.getView().window))
        switch(this.state){
            case BCSGestureRecognizerStateEnum.POSSIBLE:
                delta = vectorAfterUpdate.intersectionAngleWith(this.getPrivate('initVector'))
                if (Math.abs(delta) >= defaults.rotationMinAngle ) {
                    this.state = BCSGestureRecognizerStateEnum.BEGAN
                    if (delta < 0 ) {
                        this.setPrivate('rotation',delta + defaults.rotationMinAngle)
                    }else{
                        this.setPrivate('rotation',delta - defaults.rotationMinAngle)
                    }
                    duration = event.timeStamp - this.getPrivate('lastTimestamp')
                    if (duration !== 0 ) {
                        this.setPrivate('velocity',this.getPrivate('rotation') / duration * 1000)
                    }
                    this.setPrivate('lastTimestamp',event.timeStamp)
                    this.setPrivate('lastVector',vectorAfterUpdate)
                }
                break
            case BCSGestureRecognizerStateEnum.BEGAN:
                this.state = BCSGestureRecognizerStateEnum.CHANGED
                calculateRotationVelocity()
                break
            case BCSGestureRecognizerStateEnum.CHANGED:
                calculateRotationVelocity()
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
