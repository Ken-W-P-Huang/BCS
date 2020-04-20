/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,defaults} from './BCSGestureRecognizer'
import {BCSPoint} from './BCSPoint'

// Recognizes: when numberOfTouchesRequired have tapped numberOfTapsRequired times

// Touch Location Behaviors:
//     locationInView:         location of the tap, from the first tap in the sequence if numberOfTapsRequired > 1. this is the centroid if numberOfTouchesRequired > 1
//     locationOfTouch:inView: location of a particular touch, from the first tap in the sequence if numberOfTapsRequired > 1

export function BCSTapGestureRecognizer(target,action) {
    BCSGestureRecognizer.call(this,target,action)
    var propertiesMap = {
        numberOfContinualTaps : 0,
        /*第一次点击时的位置即基准位置，此时numberOfTouchesRequired条件已满足*/
        initTapStartLocation : new BCSPoint(),
        currentTouchBeganTimeStamp : 0,
        numberOfOffTouches:0,
        isAvailableTouchesRemovable:false,
        timer:undefined
    }
    this.enableProtectedProperty(propertiesMap)
    this.numberOfTapsRequired = 1
    this.numberOfTouchesRequired = 1
}


BCSTapGestureRecognizer.extend(BCSGestureRecognizer)
var prototype = BCSTapGestureRecognizer.prototype
prototype.getNumberOfTouches = function () {
    return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ?
        this.numberOfTouchesRequired:0
}

prototype.locate = function (view) {
    var location = this.getProtected('initTapStartLocation')
    return new BCSPoint(location.x - view.getStyle('left'),location.y - view.getStyle('top') )
}
prototype.locateTouch = function (index,view) {
    if(this.getNumberOfTouches() > 0){
        return BCSGestureRecognizer.prototype.locateTouch(index,view)
    }else{
        return BCSGestureRecognizer.prototype.locateTouch(-1,view)
    }
}

prototype.reset = function () {
    BCSGestureRecognizer.prototype.reset.call(this)
    this.setProtected('numberOfContinualTaps',0)
    this.setProtected('initTapStartLocation',new BCSPoint())
    this.setProtected('currentTouchBeganTimeStamp',0)
    this.setProtected('numberOfOffTouches',0)
    clearTimeout(this.getProtected('timer'))
    this.setProtected('timer',undefined)
}

prototype.shouldRequireFailureOf = function(otherGestureRecognizer){
    if (otherGestureRecognizer.isKindOf(BCSTapGestureRecognizer)
        && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}


prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
    if (otherGestureRecognizer.isKindOf(BCSTapGestureRecognizer)
        && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

function startTimer(self,interval) {
    self.setProtected('timer',setTimeout(function () {
        if ( self.state !== BCSGestureRecognizerStateEnum.FAILED) {
            self.state = BCSGestureRecognizerStateEnum.FAILED
            self.ignoreAvailableTouches()
            self.reset()
        }
        console.log('reset')
    },interval))
}

/**
 * touches不一定同时进来
 * @param touches
 * @param event
 */
prototype.touchesBegan = function (touches, event){
    if (touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) <= this.numberOfTouchesRequired) {
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === 0) {
            /*停止连续敲击倒计时并开始新一轮敲击计时*/
            clearTimeout(this.getProtected('timer'))
            this.setProtected('timer',undefined)
            this.setProtected('currentTouchBeganTimeStamp',event.timeStamp)
            this.setProtected('isAvailableTouchesRemovable',false)
            startTimer(this,defaults.onInterval)
            this.state = BCSGestureRecognizerStateEnum.POSSIBLE
        }
        BCSGestureRecognizer.prototype.touchesBegan.call(this,touches, event)
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ) {
            if (this.getProtected('numberOfContinualTaps') === 0) {
                this.setProtected('initTapStartLocation',BCSGestureRecognizer.prototype.locate.call(this,
                    this.getView().window))
            }else{
                /* 检查本次触点和第一次触点距离是否过大*/
                if (this.getProtected('initTapStartLocation').distanceFrom(BCSGestureRecognizer.prototype.
                    locate.call(this, this.getView().window)) > defaults.offsetThreshold) {
                    this.setProtected('timer', clearTimeout(this.getProtected('timer')))
                    this.state = BCSGestureRecognizerStateEnum.FAILED
                    return
                }
            }
            this.setProtected('timer', clearTimeout(this.getProtected('timer')))
            startTimer(this,defaults.onInterval * 2 - event.timeStamp
                + this.getProtected('currentTouchBeganTimeStamp'))
        }
    }else{
        this.setProtected('timer', clearTimeout(this.getProtected('timer')))
        this.state = BCSGestureRecognizerStateEnum.FAILED
    }
}

prototype.touchesMoved = function (touches, event){
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired &&
        (event.targetTouches.length < this.numberOfTouchesRequired || this.getProtected('initTapStartLocation')
            .distanceFrom(BCSGestureRecognizer.prototype.locate.call(this,this.getView().window)))
        > defaults.offsetThreshold) {
        this.setProtected('timer', clearTimeout(this.getProtected('timer')))
        this.state = BCSGestureRecognizerStateEnum.FAILED
    }
}

prototype.touchesEnded = function (touches, event){
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ) {
        /* 手指可能先后离开屏幕,从而触发多次touchesEnded */
        for(var i = 0; i < touches.length; i++) {
            if (this.hasAvailableTouch(touches[i]) ) {
                if ( this.getProtected('numberOfOffTouches') + 1 === this.numberOfTouchesRequired) {
                    /*本轮结束，停止计时*/
                    this.setProtected('timer', clearTimeout(this.getProtected('timer')))
                    var numberOfContinualTaps = this.getProtected('numberOfContinualTaps')
                    this.setProtected('numberOfContinualTaps',++numberOfContinualTaps)
                    if (numberOfContinualTaps === this.numberOfTapsRequired  ) {
                        if (this.delegate && this.delegate.shouldBegin && !this.delegate.shouldBegin()) {
                            this.state = BCSGestureRecognizerStateEnum.FAILED
                        } else {
                            this.state = BCSGestureRecognizerStateEnum.ENDED
                        }
                    }else{
                        /*连续敲击倒计时*/
                        startTimer(this,defaults.offInterval)
                        this.setProtected('isAvailableTouchesRemovable',true)
                    }
                }else{
                    var numberOfOffTouches = this.getProtected('numberOfOffTouches')
                    this.setProtected('numberOfOffTouches',++numberOfOffTouches)
                }
            }
        }
    }else {
        this.setProtected('timer', clearTimeout(this.getProtected('timer')))
        this.state = BCSGestureRecognizerStateEnum.FAILED
    }
}

prototype.removeAvailableTouches = function (touches) {
    if (this.getProtected('isAvailableTouchesRemovable') ) {
        this.setProtected('numberOfOffTouches',0)
        BCSGestureRecognizer.prototype.removeAvailableTouches.call(this)
    }
}