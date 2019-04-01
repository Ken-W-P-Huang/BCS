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
    tapGestureRecognizerMap[this.getKey()] = {
        numberOfContinualTaps : 0,
        /*第一次点击时的位置即基准位置，此时numberOfTouchesRequired条件已满足*/
        initTapStartLocation : new BCSPoint(),
        currentTouchBeganTimeStamp : 0,
        numberOfOffTouches:0,
        isAvailableTouchesRemovable:false,
        timer:undefined
    }
    this.numberOfTapsRequired = 1
    this.numberOfTouchesRequired = 1
}

var tapGestureRecognizerMap = {}
BCSTapGestureRecognizer.extend(BCSGestureRecognizer)
var prototype = BCSTapGestureRecognizer.prototype
prototype.getNumberOfTouches = function () {
    return BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ?
        this.numberOfTouchesRequired:0
}

prototype.locate = function (view) {
    var location = tapGestureRecognizerMap[this.getKey()].initTapStartLocation
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
    var data = tapGestureRecognizerMap[this.getKey()]
    data.numberOfContinualTaps = 0
    data.initTapStartLocation = new BCSPoint()
    data.currentTouchBeganTimeStamp = 0
    data.numberOfOffTouches = 0
    data.isAvailableTouchesRemovable = false
    clearTimeout(data.timer)
    data.timer = undefined
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

function startTimer(self,data,interval) {
    data.timer = setTimeout(function () {
        if ( self.state !== BCSGestureRecognizerStateEnum.FAILED) {
            self.state = BCSGestureRecognizerStateEnum.FAILED
            self.ignoreAvailableTouches()
            self.reset()
        }
        console.log('reset')
    },interval)
}

/**
 * touches不一定同时进来
 * @param touches
 * @param event
 */
prototype.touchesBegan = function (touches, event){
    var data = tapGestureRecognizerMap[this.getKey()]
    if (touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) <= this.numberOfTouchesRequired) {
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === 0) {
            /*停止连续敲击倒计时并开始新一轮敲击计时*/
            data.timer = clearTimeout(data.timer)
            data.currentTouchBeganTimeStamp = event.timeStamp
            data.isAvailableTouchesRemovable = false
            startTimer(this,data,defaults.onInterval)
            this.state = BCSGestureRecognizerStateEnum.POSSIBLE
        }
        BCSGestureRecognizer.prototype.touchesBegan.call(this,touches, event)
        if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ) {
            if (data.numberOfContinualTaps === 0) {
                data.initTapStartLocation = BCSGestureRecognizer.prototype.locate.call(this,
                    this.getView().window)
            }else{
                /* 检查本次触点和第一次触点距离是否过大*/
                if (data.initTapStartLocation.distanceFrom(BCSGestureRecognizer.prototype.locate.call(this,
                        this.getView().window))
                    > defaults.offsetThreshold) {
                    data.timer = clearTimeout(data.timer)
                    this.state = BCSGestureRecognizerStateEnum.FAILED
                    return
                }
            }
            data.timer = clearTimeout(data.timer)
            startTimer(this,data,defaults.onInterval * 2 - event.timeStamp + data.currentTouchBeganTimeStamp)
        }
    }else{
        data.timer = clearTimeout(data.timer)
        this.state = BCSGestureRecognizerStateEnum.FAILED
    }
}

prototype.touchesMoved = function (touches, event){
    var data = tapGestureRecognizerMap[this.getKey()]
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired
        && (event.targetTouches.length < this.numberOfTouchesRequired
        || data.initTapStartLocation.distanceFrom(BCSGestureRecognizer.prototype.locate.call(this,this.getView().window)))
        > defaults.offsetThreshold) {
        data.timer = clearTimeout(data.timer)
        this.state = BCSGestureRecognizerStateEnum.FAILED
    }
}

prototype.touchesEnded = function (touches, event){
    var data = tapGestureRecognizerMap[this.getKey()]
    if (BCSGestureRecognizer.prototype.getNumberOfTouches.call(this) === this.numberOfTouchesRequired ) {
        /* 手指可能先后离开屏幕,从而触发多次touchesEnded */
        for(var i = 0; i < touches.length; i++) {
            // console.log(Date(),data.numberOfOffTouches)
            if (this.hasAvailableTouch(touches[i]) ) {
                if ( data.numberOfOffTouches + 1 === this.numberOfTouchesRequired) {
                    /*本轮结束，停止计时*/
                    data.timer = clearTimeout(data.timer)
                    data.numberOfContinualTaps++
                    if (data.numberOfContinualTaps === this.numberOfTapsRequired  ) {
                        if (this.delegate && this.delegate.shouldBegin && !this.delegate.shouldBegin()) {
                            this.state = BCSGestureRecognizerStateEnum.FAILED
                        } else {
                            this.state = BCSGestureRecognizerStateEnum.ENDED
                        }
                    }else{
                        /*连续敲击倒计时*/
                        startTimer(this,data,defaults.offInterval)
                        data.isAvailableTouchesRemovable = true
                    }
                }else{
                    data.numberOfOffTouches++
                }
            }
        }
    }else {
        data.timer = clearTimeout(data.timer)
        this.state = BCSGestureRecognizerStateEnum.FAILED
    }
}

prototype.removeAvailableTouches = function (touches) {
    var data = tapGestureRecognizerMap[this.getKey()]
    if (data.isAvailableTouchesRemovable ) {
        data.numberOfOffTouches = 0
        BCSGestureRecognizer.prototype.removeAvailableTouches.call(this)
    }
}

prototype.deinit = function () {
    BCSGestureRecognizer.prototype.deinit.call(this)
    try{
        delete tapGestureRecognizerMap[this.getKey()]
    }catch(e){
        tapGestureRecognizerMap[this.getKey()] = undefined
    }
}