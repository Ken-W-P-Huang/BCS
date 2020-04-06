/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,defaults} from './BCSGestureRecognizer'
import {BCSPoint} from './BCSPoint'
/**
 * 未达到numberOfTapsRequired和numberOfTouchesRequired条件时，getNumberOfTouches一直为0
 * 满足后即可改变，但此时state仍为0。长按期间不允许大幅度移动
 * 允许移动期间触发长按，长按触发后（state=1）第一次touchend就触发事件
 * @param target
 * @param action
 * @constructor
 */
export function BCSLongPressGestureRecognizer(target,action){
    BCSGestureRecognizer.call(this,target,action)
    // Default is 0. The number of full taps required before the press for gesture to be recognized
    this.numberOfTapsRequired = 0
    this.numberOfTouchesRequired = 1
    //秒为单位
    this.minimumPressDuration = 0.5
    this.allowableMovement = 10
    var propertiesMap = {
        numberOfContinualTaps : 0,
        /*第一次点击时的位置即基准位置，或者长按的基准位置。两个位置可以不同*/
        initTapStartLocation : new BCSPoint(),
        currentTouchBeganTimeStamp : 0,
        numberOfOffTouches:0,
        isAvailableTouchesRemovable:false,
        timer:undefined
    }
    this.initProperties(propertiesMap)
}

BCSLongPressGestureRecognizer.extend(BCSGestureRecognizer)
var prototype = BCSLongPressGestureRecognizer.prototype
prototype.getNumberOfTouches = function () {
    return (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired
    && this.getPrivate('numberOfContinualTaps') === this.numberOfTapsRequired)?
        this.numberOfTouchesRequired : 0
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
    this.setPrivate('numberOfContinualTaps',0)
    this.setPrivate('initTapStartLocation',new BCSPoint())
    this.setPrivate('currentTouchBeganTimeStamp',0)
    this.setPrivate('numberOfOffTouches',0)
    this.setPrivate('isAvailableTouchesRemovable',false)
    clearTimeout(this.getPrivate('timer'))
    this.setPrivate('timer',undefined)
}


prototype.shouldRequireFailureOf = function(otherGestureRecognizer){
    if (otherGestureRecognizer.isKindOf(BCSLongPressGestureRecognizer)
        && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
    if (otherGestureRecognizer.isKindOf(BCSLongPressGestureRecognizer)
        && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

function startTimer(self,interval) {
    self.setPrivate('timer',setTimeout(function () {
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
    if (this.state !== BCSGestureRecognizerStateEnum.BEGAN && this.state !== BCSGestureRecognizerStateEnum.CHANGED) {
        if (touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) <= this.numberOfTouchesRequired) {
            if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === 0) {
                /*停止连续敲击倒计时并开始新一轮敲击计时*/
                this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
                this.setPrivate('currentTouchBeganTimeStamp',event.timeStamp)
                this.setPrivate('isAvailableTouchesRemovable',false)
                this.state = BCSGestureRecognizerStateEnum.POSSIBLE
                if (this.getPrivate('numberOfContinualTaps') < this.numberOfTapsRequired ) {
                    startTimer(this,defaults.onInterval)
                }
            }
            BCSGestureRecognizer.prototype.touchesBegan.call(this,touches, event)
            if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ) {
                if ( this.getPrivate('numberOfContinualTaps') < this.numberOfTapsRequired ) {
                    if (this.getPrivate('numberOfContinualTaps') === 0) {
                        this.setPrivate('initTapStartLocation',BCSGestureRecognizer.prototype.locate.call(this,
                            this.getView().window))
                    }else{
                        /* 检查本次触点和第一次触点距离是否过大*/
                        if (this.getPrivate('initTapStartLocation').distanceFrom(BCSGestureRecognizer.prototype
                                .locate.call(this, this.getView().window)) > defaults.offsetThreshold) {
                            this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
                            this.state = BCSGestureRecognizerStateEnum.FAILED
                            return
                        }
                    }
                    this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
                    startTimer(this,defaults.onInterval * 2 - event.timeStamp
                        + this.getPrivate('currentTouchBeganTimeStamp'))
                }else {
                    /*开始长按*/
                    this.setPrivate('currentTouchBeganTimeStamp',event.timeStamp)
                    this.setPrivate('initTapStartLocation',BCSGestureRecognizer.prototype.locate.call(this,
                        this.getView().window))
                    this.setPrivate('timer',setTimeout(function () {
                        this.state = BCSGestureRecognizerStateEnum.BEGAN
                        this.getView().executeStateChangedRecognizers([this])
                    }.bind(this),this.minimumPressDuration * 1000))
                }
            }
        }else{
            this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
            this.state = BCSGestureRecognizerStateEnum.FAILED
        }
    }else{
        for(var i = 0; i < touches.length ; i++) {
            this.ignore(touches[i],event)
        }
    }
}

prototype.touchesMoved = function (touches, event){
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ) {
        if (this.getPrivate('numberOfContinualTaps') < this.numberOfTapsRequired) {
            if (event.targetTouches.length < this.numberOfTouchesRequired
                || this.getPrivate('initTapStartLocation').distanceFrom(BCSGestureRecognizer.prototype
                    .locate.call(this,this.getView().window)) > defaults.offsetThreshold) {
                this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
                this.state = BCSGestureRecognizerStateEnum.FAILED
            }
        }else{
            /*长按移动*/
            if(BCSGestureRecognizer.prototype.locate.call(this,this.getView().window)
                    .distanceFrom(this.getPrivate('initTapStartLocation')) > this.allowableMovement){
                this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
                this.state = BCSGestureRecognizerStateEnum.FAILED
            }else{
                if (this.state === BCSGestureRecognizerStateEnum.BEGAN) {
                    this.state = BCSGestureRecognizerStateEnum.CHANGED
                }
            }
        }
    }
}

prototype.touchesEnded = function (touches, event){
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ) {
        if (this.getPrivate('numberOfContinualTaps') === this.numberOfTapsRequired  ) {
            /*长按未完成，则报错*/
            if ((this.state !== BCSGestureRecognizerStateEnum.BEGAN
                && this.state !== BCSGestureRecognizerStateEnum.CHANGED)
                || (this.delegate && this.delegate.shouldBegin && !this.delegate.shouldBegin())) {
                this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
                this.state = BCSGestureRecognizerStateEnum.FAILED
            } else {
                this.state = BCSGestureRecognizerStateEnum.ENDED
            }
        }else{
            /* 手指可能先后离开屏幕,从而触发多次touchesEnded */
            for(var i = 0; i < touches.length; i++) {
                if (this.hasAvailableTouch(touches[i]) ) {
                    if ( this.getPrivate('numberOfOffTouches') + 1 === this.numberOfTouchesRequired) {
                        /*本轮结束，停止计时*/
                        this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
                        this.setPrivate('numberOfContinualTaps',this.getPrivate('numberOfContinualTaps')+1)
                        /*连续敲击倒计时*/
                        startTimer(this,defaults.offInterval)
                        this.setPrivate('isAvailableTouchesRemovable',true)
                    }else{
                        this.setPrivate('numberOfOffTouches',this.getPrivate('numberOfOffTouches')+1)
                    }
                }
            }
        }
    }else {
        this.setPrivate('timer',clearTimeout(this.setPrivate('timer')))
        this.state = BCSGestureRecognizerStateEnum.FAILED
    }
}

prototype.removeAvailableTouches = function (touches) {
    if (this.getPrivate('isAvailableTouchesRemovable') ) {
        this.setPrivate('numberOfOffTouches',0)
        BCSGestureRecognizer.prototype.removeAvailableTouches.call(this)
    }
}




