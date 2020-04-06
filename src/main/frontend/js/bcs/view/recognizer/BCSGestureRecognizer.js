/**
 * Created by kenhuang on 2019/3/12.
 */
import EventTypeEnum from '../model/Browser'
import BCSPoint from './BCSPoint'
export var BCSGestureRecognizerStateEnum = {
    // 识别器还没有识别出它的手势(状态)(Possible)，但是可能计算触摸事件。这是默认状态
    POSSIBLE:0,
    // 识别器已经接收识别为此手势(状态)的触摸(Began)。在下一轮run循环中，响应方法将会被调用。
    BEGAN:1,
    // 识别器已经接收到触摸，并且识别为手势改变(Changed)。在下一轮run循环中，响应方法将会被调用。
    CHANGED:2,
    // 识别器已经接收到触摸，并且识别为手势结束(Ended)。在下一轮run循环中，响应方法将会被调用并且识别器将会被重置到UIGestureRecognizerStatePossible状态。
    ENDED:3,
    // 识别器已经接收到触摸，这种触摸导致手势取消(Cancelled)。在下一轮run循环中，响应方法将会被调用。识别器将会被重置到UIGestureRecognizerStatePossible状态。
    CANCELLED:4,
    FAILED:5
    //更改请注意，部分条件判断使用 ">" "<"而非使用"==="
}

var defaults = {
    /*可以当作连续敲击的最长时间间隔*/
    onInterval:750,
    offInterval:350,
    /*在屏幕上允许的最大偏移量*/
    offsetThreshold: 45,
    /*最多5根手指在屏幕上,超过会被cancel*/
    touchesThreshold: 5,
    /*扫屏时判定手势所需的移动距离*/
    swipeOffsetThreshold: 75,
    /*扫屏时最长持续时间*/
    swipeMaxDuration:500,
    /*确定为缩放的最小移动距离*/
    pinchMinOffset:8,
    /*确定为缩放的最小移动距离*/
    rotationMinAngle:0.1,
    /*确定为平移的最小移动距离*/
    panMinOffset:10
}

/**
 * BCSGestureRecognizer可以存放同一个target的不同action，不同target可能有相同的action名
 * iOS event.allTouches会一直存在，touches表示触发当前事件的touches。
 * 不同event的相同identifier的touch可能不是同一个对象（几乎是100%确定）
 * 前端event
 * 　touches：当前屏幕上所有触摸点的列表;
 *   targetTouches：当前对象上所有触摸点的列表
 *   changedTouches：涉及当前(引发)事件的触摸点的列表
 * 多用一根手指触摸会再次触发touchstart事件，只要有手指抬起就触发touchend
 * 故按照iOS API，target为对象，action为方法指针而非名称
 * @param target
 * @param action
 * @constructor
 */
export function BCSGestureRecognizer(target,action) {
    Function.requireArgumentType(target,'object')
    Function.requireArgumentType(action,'function')
    var propertiesMap = {
        actionMap : new Map(),
        view:null,
        /*手势识别器本次识别应该考虑的touch (identifier:touch),按照identifier排序*/
        availableTouches:{},
        dependentSet:new Set()
    }
    this.enablePrivateProperty(propertiesMap)
    this.state = BCSGestureRecognizerStateEnum.POSSIBLE
    this.delegate = null
    this.isEnabled = true
    this.cancelsTouchesInView = true
    this.delaysTouchesBegan = false
    this.delaysTouchesEnded = true
    this.allowedTouchTypes = []
    // this.allowedPressTypes = []
    this.requiresExclusiveTouchType = true
    this.name = this.getClass()
    this.addTarget(target,action)
}

var prototype = BCSGestureRecognizer.prototype
prototype.reset = function () {
    this.setPrivate('availableTouches',{})
    this.setPrivate('dependentSet',new Set())
}
//本识别器失败后，dependent才能继续识别
prototype.addDependent = function (dependent){
    this.getPrivate('dependentSet').add(dependent)
}
prototype.hasDependent = function (dependent){
    return this.getPrivate('dependentSet').has(dependent)
}

prototype.ignoreAvailableTouches = function () {
    var availableTouches = this.getPrivate('availableTouches'),
        event = this.getPrivate('event')
    for (var identifier in availableTouches) {
        if (availableTouches.hasOwnProperty(identifier) ) {
            this.ignore(availableTouches[identifier],event)
        }
    }
}

prototype.ignore = function(touch, event){
    delete  this.getPrivate('availableTouches')[touch.identifier]
}

/* number of touches involved for which locations can be queried */
prototype.getNumberOfTouches = function () {
    return Object.keys(this.getPrivate('availableTouches')).length
}

prototype.hasAvailableTouch = function (touch) {
    return this.getPrivate('availableTouches').hasOwnProperty(touch.identifier)
}

prototype.removeAvailableTouches = function (touches) {
    var availableTouches = this.getPrivate('availableTouches')
    if (touches) {
        for(var i = 0; i <touches.length; i++) {
            delete availableTouches[touches[i].identifier]
        }
    }else{
        this.setPrivate('availableTouches',{})
    }
}

/**
 * 手势在view中的大概位置，通常是中心点
 * @param view
 * @returns {{}}
 */
prototype.locate = function (view) {
    var touches = this.getPrivate('availableTouches'),
        length =  Object.keys(touches).length
    if (view && length > 0) {
        var averageX = 0,
            averageY = 0
        for (var identifier in touches) {
            if (touches.hasOwnProperty(identifier) ) {
                averageX += touches[identifier].pageX
                averageY += touches[identifier].pageY
            }
        }
        return new BCSPoint(averageX/length - view.getStyle('left') ,
            averageY/length - view.getStyle('top'))
    }else{
        return new BCSPoint()
    }
}
/**
 * 指定的touch在view中的位置
 * @param index
 * @param view
 * @returns {{}}
 */
prototype.locateTouch = function (index,view) {
    var touches = this.getPrivate('availableTouches')
    if (view  && index >= 0 ) {
        var key = Object.keys(touches)[index]
        if (key) {
            return new BCSPoint(touches[key].pageX -  view.getStyle('left') ,
                touches[key].pageY - view.getStyle('top'))
        }else{
            throw new TypeError('Index out of bounds')
        }
    }else{
        throw new Error('Could not locate touch.')
    }
}


prototype.require = function (otherGestureRecognizer) {

}

prototype.canPrevent = function(preventingGestureRecognizer){
    return true
}

prototype.canBePrevented = function(preventedGestureRecognizer){
    return true
}

prototype.shouldRequireFailure = function(otherGestureRecognizer){
    return false
}

prototype.shouldBeRequiredToFail = function (otherGestureRecognizer) {
    return false
}
prototype.addTarget = function (target,action) {
    var actionMap = this.getPrivate('availableTouches')
    if (target && action ) {
        Function.requireArgumentType(target,'object')
        Function.requireArgumentType(action,'function')
        actionMap.set(action,target)
    }
}

prototype.removeTarget = function (target,action) {
    var actionMap = this.getPrivate('availableTouches')
    if (action) {
        actionMap.delete(action)
    }else if (target) {
        actionMap.forEach(function (value,key) {
            if (value === target) {
                actionMap.delete(key)
            }
        })
    }else{
        actionMap.clear()
    }
}

prototype.getView = function () {
    return this.getPrivate('view')
}

prototype.executeActions = function () {
    var actionMap = this.getPrivate('availableTouches')
    actionMap.forEach(function (target,action) {
        action.call(target,this)
    }.bind(this))
}

function refreshAvailableTouches(self,touches,isStrict) {
    var availableTouches = this.getPrivate('availableTouches')
    for(var i = 0; i < touches.length; i++) {
        if (isStrict) {
            if (availableTouches.hasOwnProperty(touches[i].identifier) ) {
                availableTouches[touches[i].identifier] = touches[i]
            }
        }else{
            availableTouches[touches[i].identifier] = touches[i]
        }
    }
}
prototype.touchesBegan = function (touches, event){
    refreshAvailableTouches(this,touches)
}
prototype.touchesMoved = function (touches, event){
    refreshAvailableTouches(this,touches,true)
}
prototype.touchesEnded = function (touches, event){
    refreshAvailableTouches(this,touches,true)
}

prototype.touchesCancelled = function (touches, event){
    this.state = BCSGestureRecognizerStateEnum.CANCELLED
}

