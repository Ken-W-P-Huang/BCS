import {BCSView} from './BCSView'
export var BCSControlContentVerticalAlignmentEnum = {
    center:0,
    top:1,
    bottom:2,
    fill:3
}


export var BCSControlContentHorizontalAlignmentEnum = {
    center:1,
    left:2,
    right:3,
    fill:4,
    leading:5,
    trailing:6
}

export var BCSControlState = {
    normal: 1,
    // used when UIControl isHighlighted is set
    highlighted: 2,
    disabled: 3,
    // flag usable by app (see below)
    selected: 4,
    // Applicable only when the screen supports focus
    focused: 5,
    // additional flags available for application use
    application: 6,
    // flags reserved for internal framework use
    reserved: 7
}

export var BCSControlEvent = {
    touchDown: 1,
    touchDownRepeat: 2,
    touchDragInside: 3,
    touchDragOutside: 4,
    touchDragEnter:5 ,
    touchDragExit: 6,
    touchUpInside: 7,
    touchUpOutside: 8,
    touchCancel:9 ,
    valueChanged:10 ,
    primaryActionTriggered: 11,
    editingDidBegin:12 ,
    editingChanged:13 ,
    editingDidEnd: 14,
    editingDidEndOnExit: 15,
    allTouchEvents: 16,
    allEditingEvents: 17,
    applicationReserved: 18,
    systemReserved: 19,
    allEvents:20
}

export function BCSControl(style,element) {
    BCSView.call(this,style,element)
    // if NO, ignores touch events and subclasses may draw differently
    this.isEnabled = true
    // may be used by some subclasses or by application
    this.isSelected = false
    // this gets set/cleared automatically when touch enters/exits during tracking and cleared on up
    this.isHighlighted = false
    // how to position content vertically inside control. default is center
    this.ontentVerticalAlignment = BCSControlContentVerticalAlignmentEnum.center
    // how to position content horizontally inside control. default is center
    this.contentHorizontalAlignment = BCSControlContentHorizontalAlignmentEnum.center
    this.initProperties({
        state:BCSControlState.normal
    })
}
BCSControl.extend(BCSView)
var prototype = BCSControl.prototype
// how to position content horizontally inside control, guaranteed to return 'left' or 'right' for any 'leading' or 'trailing'
prototype.getEffectiveContentHorizontalAlignment = function(){
    return this.getPrivate('effectiveContentHorizontalAlignment')
}
// could be more than one state (e.g. disabled|selected). synthesized from other flags.
prototype.getState = function(){
    return this.getPrivate('state')
}
prototype.getIsTracking = function(){
    return this.getPrivate('isTracking')
}
// valid during tracking only
prototype.getIsTouchInside = function(){
    return this.getPrivate('isTouchInside')
}
// get info about target & actions. this makes it possible to enumerate all target/actions by checking for each event kind
prototype.getAllTargets = function(){
    return this.getPrivate('allTargets')
}
// list of all events that have at least one action
prototype.getAllControlEvents = function(){
    return this.getPrivate('allControlEvents')
}
prototype.get = function(){
    return this.getPrivate('')
}

prototype.beginTracking = function(touch,event){

}

prototype.continueTracking = function(touch,event) {

}
// touch is sometimes nil if cancelTracking calls through to this.
prototype.endTracking = function(touch,event) {

}
// event may be nil if cancelled for non-event reasons, e.g. removed from window
prototype.cancelTracking = function(event) {

}

// add target/action for particular event. you can call this multiple times and you can specify multiple target/actions for a particular event.
// passing in nil as the target goes up the responder chain. The action may optionally include the sender and the event in that order
// the action cannot be NULL. Note that the target is not retained.
prototype.addTarget = function(target, action,controlEvents){

}

// remove the target/action for a set of events. pass in NULL for the action to remove all actions for that target
prototype.removeTarget = function(target, action,controlEvents){

}
// set may include NSNull to indicate at least one nil target
// list of all events that have at least one action
// single event. returns NSArray of NSString selector names. returns nil if none
prototype.actions = function(target,controlEvent){

}

// send the action. the first method is called for the event and is a point at which you can observe or override behavior. it is called repeately by the second.
prototype.sendAction = function(action,target,event){

}
// send all actions associated with events
prototype.sendActions = function(controlEvents) {

}








