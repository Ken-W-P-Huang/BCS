/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,EventTypeEnum,defaults} from './BCSGestureRecognizer'
import {BCSPoint} from './BCSPoint'
export var BCSSwipeGestureRecognizerDirectionEnum = {
    RIGHT:1,
    LEFT:2,
    UP:4,
    DOWN:8
}
export function BCSSwipeGestureRecognizer(target,action){
    BCSGestureRecognizer.call(this,target,action)
    this.numberOfTouchesRequired  = 1
    this.direction = BCSSwipeGestureRecognizerDirectionEnum.RIGHT
    var propertiesMap = {
        swipeStartPoint:null,
        swipeStartTimeStamp:0,
        swipeNumberOfTouches:0,
        newTotalX:0,
        newTotalY:0,
        /*满足开始触发swipe条件时touch成员*/
        previousTouches:{}
    }
    this.initProperties(propertiesMap)
}

var swipeGestureRecognizerMap = {}
BCSSwipeGestureRecognizer.extend(BCSGestureRecognizer)
var prototype = BCSSwipeGestureRecognizer.prototype
prototype.reset = function () {
    BCSGestureRecognizer.prototype.reset.call(this)
    this.setPrivate('swipeStartPoint',null)
    this.setPrivate('swipeStartTimeStamp',0)
    /*满足开始触发swipe条件时touch成员*/
    this.setPrivate('swipeNumberOfTouches',0)
    this.setPrivate('previousTouches',{})
    this.setPrivate('newTotalX',0)
    this.setPrivate('newTotalY',0)
}

prototype.getNumberOfTouches = function () {
    return  this.state !== BCSGestureRecognizerStateEnum.FAILED ?
        swipeGestureRecognizerMap[this.getKey()].swipeNumberOfTouches : 0
}

prototype.locate = function (view) {
    var location = swipeGestureRecognizerMap[this.getKey()].initTouchBeganLocation
    if (this.getNumberOfTouches() > 0 ) {
        return new BCSPoint(location.x - view.getStyle('left'),location.y - view.getStyle('top') )
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


prototype.shouldRequireFailureOf = function(otherGestureRecognizer){
    if (otherGestureRecognizer.isKindOf(BCSSwipeGestureRecognizer)) {
        return true
    }
    return false
}

prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
    if (otherGestureRecognizer.isKindOf(BCSSwipeGestureRecognizer)) {
        return false
    }
    return true
}
/**
 * 有多少个touch就收纳多少。但起始位置和时间按照<=numberOfTouchesRequired时计算，
 * 如果touches的数量+原来的数量超出numberOfTouchesRequired，则以上一次为准
 * @param touches
 * @param event
 */
prototype.touchesBegan = function (touches, event){
    var numberOfAllTouches = touches.length + BCSGestureRecognizer.prototype.getNumberOfTouches.call(this)
    BCSGestureRecognizer.prototype.touchesBegan.call(this, touches, event)
    this.state = BCSGestureRecognizerStateEnum.POSSIBLE
    if (numberOfAllTouches <= this.numberOfTouchesRequired) {
        for(var i = 0; i < touches.length; i++) {
            this.getPrivate('previousTouches')[touches[i].identifier] = touches[i]
        }
        this.setPrivate('swipeStartTimeStamp',event.timeStamp)
        this.setPrivate('swipeStartPoint',BCSGestureRecognizer.prototype.locate.call(this,this.getView().window))
        this.setPrivate('swipeNumberOfTouches',this.getPrivate('swipeNumberOfTouches')+touches.length)
    }
}

function refreshStatus(self,touch){
    var newTotalX = self.getPrivate('newTotalX'),
        newTotalY = self.getPrivate('newTotalY')
    newTotalX += touch.pageX - self.getPrivate('previousTouches')[touch.identifier].pageX
    newTotalY += touch.pageY - self.getPrivate('previousTouches')[touch.identifier].pageY
    self.setPrivate('newTotalX',newTotalX)
    self.setPrivate('newTotalY',newTotalY)
    self.getPrivate('previousTouches')[touch.identifier] = touch
}

prototype.touchesMoved = function (touches, event){
    var i,numberOfTouches = this.getNumberOfTouches()
    /* 1.如果同时放入超过指定数量的手指，移动时并不会报错，直到手指抬起为止，可以往任意方向移动,从触摸到屏幕开始计算，不会超时
     * 2.可能还计算移动速率，觉得复杂，没有实现
     */
    if (touches.length <= this.getNumberOfTouches() ) {
        if (event.timeStamp - this.getPrivate('swipeStartTimeStamp') <= defaults.swipeMaxDuration) {
            var touch,previousTouch
            switch(this.direction){
                case BCSSwipeGestureRecognizerDirectionEnum.RIGHT:
                    for(i = 0; i < touches.length; i++) {
                        touch = touches[i]
                        previousTouch = this.getPrivate('previousTouches')[touch.identifier]
                        if (previousTouch) {
                            if ( touch.pageX - previousTouch.pageX  <= 0) {
                                this.state = BCSGestureRecognizerStateEnum.FAILED
                                return
                            }else{
                                refreshStatus(this,touch)
                            }
                        }
                    }
                    break
                case BCSSwipeGestureRecognizerDirectionEnum.LEFT:
                    for(i = 0; i < touches.length; i++) {
                        touch = touches[i]
                        previousTouch = this.getPrivate('previousTouches')[touch.identifier]
                        if (previousTouch) {
                            if ( touch.pageX - previousTouch.pageX  >= 0) {
                                this.state = BCSGestureRecognizerStateEnum.FAILED
                                return
                            }else{
                                refreshStatus(this,touch)
                            }
                        }
                    }
                    break
                case BCSSwipeGestureRecognizerDirectionEnum.UP:
                    for(i = 0; i < touches.length; i++) {
                        touch = touches[i]
                        previousTouch = this.getPrivate('previousTouches')[touch.identifier]
                        if (previousTouch) {
                            if ( touch.pageY - previousTouch.pageY  >= 0) {
                                this.state = BCSGestureRecognizerStateEnum.FAILED
                                return
                            }else{
                                refreshStatus(this,touch)
                            }
                        }
                    }
                    break
                case BCSSwipeGestureRecognizerDirectionEnum.DOWN:
                    for(i = 0; i < touches.length; i++) {
                        touch = touches[i]
                        previousTouch = this.getPrivate('previousTouches')[touch.identifier]
                        if (previousTouch) {
                            if ( touch.pageY - previousTouch.pageY  <= 0) {
                                this.state = BCSGestureRecognizerStateEnum.FAILED
                                return
                            }else{
                                refreshStatus(this,touch)
                            }
                        }
                    }
                    break
                default:
            }
            if (this.getNumberOfTouches() === this.numberOfTouchesRequired &&
                this.getPrivate('swipeStartPoint').distanceFrom(new BCSPoint(this.getPrivate('newTotalX')
                    / numberOfTouches, this.getPrivate('newTotalY') / numberOfTouches)) >=defaults.swipeOffsetThreshold ) {
                this.state = BCSGestureRecognizerStateEnum.ENDED
            }
            BCSGestureRecognizer.prototype.touchesMoved.call(this,touches, event)
        }else{
            this.state = BCSGestureRecognizerStateEnum.FAILED
        }
    }

}

prototype.touchesEnded = function (touches, event){
    this.state = BCSGestureRecognizerStateEnum.FAILED
}




