/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,EventTypeEnum,defaults} from './BCSGestureRecognizer'
import {BCSPoint} from './BCSPoint'
// Begins:  when at least minimumNumberOfTouches have moved enough to be considered a pan
// Changes: when a finger moves while at least minimumNumberOfTouches are down
// Ends:    when all fingers have lifted
export function BCSPanGestureRecognizer(target,action){
    BCSGestureRecognizer.call(this,target,action)
    this.minimumNumberOfTouches = 1
    this.maximumNumberOfTouches = Number.MAX_SAFE_INTEGER
    var propertiesMap = {
        initLocation : null,
        panLocation:null,
        lastTimestamp : 0,
        translation :new BCSPoint(0,0),
        velocity:new BCSPoint(0,0)
    }
    this.initProperties(propertiesMap)
}

BCSPanGestureRecognizer.extend(BCSGestureRecognizer)
var prototype = BCSPanGestureRecognizer.prototype

prototype.getNumberOfTouches = function () {
    var number = BCSGestureRecognizer.prototype.getNumberOfTouches.call(this)
    return number <= this.maximumNumberOfTouches ? number : this.maximumNumberOfTouches
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
    this.setPrivate('initLocation',null)
    this.setPrivate('panLocation',null)
    this.setPrivate('lastTimestamp',0)
    this.setPrivate('translation',new BCSPoint(0,0))
    this.setPrivate('velocity',new BCSPoint(0,0))
}

prototype.shouldRequireFailureOf = function(otherGestureRecognizer){
    if (otherGestureRecognizer.isKindOf(BCSPanGestureRecognizer)
        && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
    if (otherGestureRecognizer.isKindOf(BCSPanGestureRecognizer)
        && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

prototype.touchesBegan = function (touches, event){
    if (this.state === BCSGestureRecognizerStateEnum.BEGAN
        || this.state === BCSGestureRecognizerStateEnum.CHANGED) {
        var touchesNeeded = [],i,
            numberNeeded = this.maximumNumberOfTouches - BCSGestureRecognizer.prototype.getNumberOfTouches.call(this)
        for(i = 0; i < numberNeeded && i < touches.length; i++) {
            touchesNeeded.push(touches[i])
        }
        BCSGestureRecognizer.prototype.touchesBegan.call(this,touchesNeeded, event)
    }else{
        this.state = BCSGestureRecognizerStateEnum.POSSIBLE
        BCSGestureRecognizer.prototype.touchesBegan.call(this,touches, event)
        var number = BCSGestureRecognizer.prototype.getNumberOfTouches.call(this)
        if(number > this.maximumNumberOfTouches){
            this.state =  BCSGestureRecognizerStateEnum.FAILED
        }else if (number >= this.minimumNumberOfTouches ) {
            this.setPrivate('initLocation',BCSGestureRecognizer.prototype.locate.call(this,this.getView().window))
            this.setPrivate('lastTimestamp',event.timeStamp)
        }
    }
}

function setTranslation(self,event,location) {
    var duration = (event.timeStamp - self.getPrivate('lastTimestamp'))/1000,
        deltaX = location.x - self.getPrivate('panLocation').x,
        deltaY = location.y - self.getPrivate('panLocation').y,
        translation = self.getPrivate('translation')
    self.setPrivate('translation',new BCSPoint(translation.x +  deltaX,translation.y + deltaY ))
    self.setPrivate('velocity',new BCSPoint(deltaX / duration,deltaY / duration))
    self.setPrivate('panLocation',location)
    self.setPrivate('lastTimestamp',event.timeStamp)
}

prototype.touchesMoved = function (touches, event){
    BCSGestureRecognizer.prototype.touchesMoved.call(this,touches, event)
    var location = BCSGestureRecognizer.prototype.locate.call(this,this.getView().window),
        delta = 0
    switch(this.state){
        case BCSGestureRecognizerStateEnum.POSSIBLE:
            if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) >= this.minimumNumberOfTouches ) {
                delta = location.x - this.getPrivate('initLocation').x
                if (Math.abs(delta) >= defaults.panMinOffset) {
                    if (delta < 0 ) {
                        this.setPrivate('panLocation',new BCSPoint(
                            this.getPrivate('initLocation').x - defaults.panMinOffset,location.y))
                    }else{
                        this.setPrivate('panLocation',new BCSPoint(
                            this.getPrivate('initLocation').x + defaults.panMinOffset,location.y))
                    }
                    this.state =  BCSGestureRecognizerStateEnum.BEGAN
                    setTranslation()
                }
                delta = location.y - this.getPrivate('initLocation').y
                if (Math.abs(delta) >= defaults.panMinOffset) {
                    if (delta < 0 ) {
                        this.setPrivate('panLocation',new BCSPoint(location.x,
                            this.getPrivate('initLocation').y - defaults.panMinOffset))
                    }else{
                        this.setPrivate('panLocation',new BCSPoint(location.x,
                            this.getPrivate('initLocation').y + defaults.panMinOffset))
                    }
                    this.state =  BCSGestureRecognizerStateEnum.BEGAN
                    setTranslation()
                }
            }
            break
        case BCSGestureRecognizerStateEnum.BEGAN:
            this.state = BCSGestureRecognizerStateEnum.CHANGED
            setTranslation()
            break
        case BCSGestureRecognizerStateEnum.CHANGED:
            setTranslation()
            break
        default:

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

prototype.translation = function (view) {
    return this.getPrivate('translation')
}

prototype.setTranslation = function (translation,view) {
    this.setPrivate('translation',translation)
}

prototype.velocity = function (view) {
    return this.getPrivate('velocity')
}


