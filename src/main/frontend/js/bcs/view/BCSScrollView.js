/**
 * Created by kenhuang on 2019/1/25.
 */
import {BCSView,BCSView1} from './BCSView'
import {BCSProgressView} from "./BCSProgressView";
import {BCSEdgeInsets, BCSPoint, BCSSize} from "./BCSPoint";

export var BCSScrollViewIndicatorStyleEnum =  {
    Default: 0,
    black:1,
    white:2
}

export var BCSScrollViewKeyboardDismissModeEnum = {
    none: 0,
    // dismisses the keyboard when a drag begins
    onDrag:1,
    // the keyboard follows the dragging touch off screen, and may be pulled upward again to cancel the dismiss
    interactive:2
}

export var BCSScrollViewIndexDisplayModeEnum =  {
    // the index will show or hide automatically as needed
    automatic: 0,
    // the index will never be displayed
    alwaysHidden:1
}

export var BCSScrollViewContentInsetAdjustmentBehaviorEnum = {
    // Similar to .scrollableAxes, but for backward compatibility will also adjust the top & bottom contentInset when the scroll view is owned by a view controller with automaticallyAdjustsScrollViewInsets = YES inside a navigation controller, regardless of whether the scroll view is scrollable
    automatic: 0,
    // Edges for scrollable axes are adjusted (i.e., contentSize.width/height > frame.size.width/height or alwaysBounceHorizontal/Vertical = YES)
    scrollableAxes:1,
    // contentInset is not adjusted
    never:2,
    // contentInset is always adjusted by the scroll view's safeAreaInsets
    always:3
}

export function BCSScrollView(style,element){
    BCSView.call(this,style,element)
    this.initProperties({
        /* When contentInsetAdjustmentBehavior allows, UIScrollView may incorporate
         its safeAreaInsets into the adjustedContentInset.
        */
        adjustedContentInset:BCSEdgeInsets.zero,
        /* contentLayoutGuide anchors (e.g., contentLayoutGuide.centerXAnchor, etc.) refer to
         the untranslated content area of the scroll view.
        */
        // contentLayoutGuide: UILayoutGuide,
        /* frameLayoutGuide anchors (e.g., frameLayoutGuide.centerXAnchor) refer to
         the untransformed frame of the scroll view.
         */
        // frameLayoutGuide:UILayoutGuide,
        /*
         Scrolling with no scroll bars is a bit complex. on touch down, we don't know if the user will want to scroll or track a subview like a control.
         on touch down, we start a timer and also look at any movement. if the time elapses without sufficient change in position, we start sending events to
         the hit view in the content subview. if the user then drags far enough, we switch back to dragging and cancel any tracking in the subview.
         the methods below are called by the scroll view and give subclasses override points to add in custom behaviour.
         you can remove the delay in delivery of touchesBegan:withEvent: to subviews by setting delaysContentTouches to NO.
         */
         // returns YES if user has touched. may not yet have started dragging
         isTracking : false,
         // returns YES if user has started scrolling. this may require some time and or distance to move to initiate dragging
         isDragging : false,
        // returns YES if user isn't dragging (touch up) but scroll view is still moving
         isDecelerating:false

})

    this.contentOffset = BCSPoint.zero
    this.contentSize = BCSSize.zero
    this.contentInset = BCSEdgeInsets.zero
    /* Configure the behavior of adjustedContentInset.
     Default is UIScrollViewContentInsetAdjustmentAutomatic.
     */
    this.contentInsetAdjustmentBehavior = null // UIScrollView.ContentInsetAdjustmentBehavior
    this.delegate = null  // UIScrollViewDelegate
    // if YES, try to lock vertical or horizontal scrolling while dragging
    this.isDirectionalLockEnabled= false
    // if YES, bounces past edge of content and back again
    this.bounces= true
    // if YES and bounces is YES, even if content is smaller than bounds, allow drag vertically
    this.alwaysBounceVertical= false
    // default NO. if YES and bounces is YES, even if content is smaller than bounds, allow drag horizontally
    this.alwaysBounceHorizontal= false
    // default NO. if YES, stop on multiples of view bounds
    this.isPagingEnabled= false
    // default YES. turn off any dragging temporarily
    this.isScrollEnabled= true
    // default YES. show indicator while we are tracking. fades out after tracking
    this.showsHorizontalScrollIndicator = true
    // default YES. show indicator while we are tracking. fades out after tracking
    this.showsVerticalScrollIndicator = true
    // default is UIEdgeInsetsZero. adjust indicators inside of insets
    this.scrollIndicatorInsets = BCSEdgeInsets.zero
    // default is UIScrollViewIndicatorStyleDefault
    this.indicatorStyle = BCSScrollViewIndicatorStyleEnum.Default
    this.decelerationRate = BCSScrollViewDecelerationRate.normal
    this.indexDisplayMode = BCSScrollViewIndexDisplayModeEnum.automatic
    //if NO, we immediately call -touchesShouldBegin:withEvent:inContentView:. this has no effect on presses
    this.delaysContentTouches = true
    //if NO, then once we start tracking, we don't try to drag if the touch moves. this has no effect on presses
    this.canCancelContentTouches = true
    /*
     the following properties and methods are for zooming. as the user tracks with two fingers, we adjust the offset and the scale of the content. When the gesture ends, you should update the content
     as necessary. Note that the gesture can end and a finger could still be down. While the gesture is in progress, we do not send any tracking calls to the subview.
     the delegate must implement both viewForZoomingInScrollView: and scrollViewDidEndZooming:withView:atScale: in order for zooming to work and the max/min zoom scale must be different
     note that we are not scaling the actual scroll view but the 'content view' returned by the delegate. the delegate must return a subview, not the scroll view itself, from viewForZoomingInScrollview:
     */
    this.minimumZoomScale = 1.0
    // must be > minimum zoom scale to enable zooming
    this.maximumZoomScale = 1.0
    this.zoomScale = 1.0
    // default is YES. if set, user can go past min/max zoom while gesturing and the zoom will animate to the min/max value at gesture end
    this.bouncesZoom = true
    // When the user taps the status bar, the scroll view beneath the touch which is closest to the status bar will be scrolled to top, but only if its `scrollsToTop` property is YES, its delegate does not return NO from `-scrollViewShouldScrollToTop:`, and it is not already at the top.
    // On iPhone, we execute this gesture only if there's one on-screen scroll view with `scrollsToTop` == YES. If more than one is found, none will be scrolled.
    this.scrollsToTop = true
    // Use these accessors to configure the scroll view's built-in gesture recognizers.
    // Do not change the gestures' delegates or override the getters for these properties.
    this.keyboardDismissMode = BCSScrollViewKeyboardDismissModeEnum.none
    // this.refreshControl = new BCSRefreshControl()
}
BCSScrollView.extend(BCSView)
var prototype = BCSScrollView.prototype
prototype.getContentLayoutGuide = function(){
    return this.getPrivate('contentLayoutGuide')
}
prototype.getFrameLayoutGuide = function(){
    return this.getPrivate('frameLayoutGuide')
}
prototype.getIsTracking = function(){
    return this.getPrivate('isTracking')
}
prototype.getIsDragging = function(){
    return this.getPrivate('isDragging')
}
prototype.getIsDecelerating = function(){
    return this.getPrivate('isDecelerating')
}
// returns YES if user in zoom gesture
prototype.getIsZooming = function(){
    return this.getPrivate('isZooming')
}
// returns YES if we are in the middle of zooming back to the min/max value
prototype.getIsZoomBouncing = function(){
    return this.getPrivate('isZoomBouncing')
}
// Change `panGestureRecognizer.allowedTouchTypes` to limit scrolling to a particular set of touch types.
prototype.getPanGestureRecognizer = function(){
    return this.getPrivate('panGestureRecognizer')
}
// `pinchGestureRecognizer` will return nil when zooming is disabled.
prototype.getPinchGestureRecognizer = function(){
    return this.getPrivate('pinchGestureRecognizer')
}
// `directionalPressGestureRecognizer` is disabled by default, but can be enabled to perform scrolling in response to up / down / left / right arrow button presses directly, instead of scrolling indirectly in response to focus updates.
prototype.getDirectionalPressGestureRecognizer = function(){
    return this.getPrivate('directionalPressGestureRecognizer')
}

prototype.adjustedContentInsetDidChange = function(){
    
}
// animate at constant velocity to new offset
prototype.setContentOffset = function(contentOffset,animated){

}

//         //如果容器位置大于等于0时，则在拖动时就启用橡皮筋，否则进行滑屏直到屏幕底部
//         //防止误点击
//         // 速度残留，需要在touchstart将速度设置为0
//         // 1/2跳转
//         //防抖动
//         //横竖方向都适用
//         //即点即停

// scroll so rect is just visible (nearest edges). nothing if rect completely visible
prototype.scrollRectToVisible = function(rect, animated) {

}
// displays the scroll indicators for a short time. This should be done whenever you bring the scroll view to front.
prototype.flashScrollIndicators = function(rect, animated) {

} 
// override points for subclasses to control delivery of touch events to subviews of the scroll view
// called before touches are delivered to a subview of the scroll view. if it returns NO the touches will not be delivered to the subview
// this has no effect on presses
// default returns YES
prototype.touchesShouldBegin = function(touches,event, view) {

}
// called before scrolling begins if touches have already been delivered to a subview of the scroll view. if it returns NO the touches will continue to be delivered to the subview and scrolling will not occur
// not called if canCancelContentTouches is NO. default returns YES if view isn't a UIControl
// this has no effect on presses
prototype.touchesShouldCancel = function(view) {

}
prototype.setZoomScale = function(scale, animated){

}
prototype.zoom  = function(rect, animated){

}

export function BCSScrollViewDecelerationRate (rawValue) {
    
}
BCSScrollViewDecelerationRate.normal = new BCSScrollViewDecelerationRate()
BCSScrollViewDecelerationRate.fast = new BCSScrollViewDecelerationRate()




//
// public protocol UIScrollViewDelegate : NSObjectProtocol {
//
//
// @available(iOS 2.0, *)
//     optional public func scrollViewDidScroll(_ scrollView: UIScrollView) // any offset changes
//
// @available(iOS 3.2, *)
//     optional public func scrollViewDidZoom(_ scrollView: UIScrollView) // any zoom scale changes
//
//
//     // called on start of dragging (may require some time and or distance to move)
// @available(iOS 2.0, *)
//     optional public func scrollViewWillBeginDragging(_ scrollView: UIScrollView)
//
//     // called on finger up if the user dragged. velocity is in points/millisecond. targetContentOffset may be changed to adjust where the scroll view comes to rest
// @available(iOS 5.0, *)
//     optional public func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>)
//
//     // called on finger up if the user dragged. decelerate is true if it will continue moving afterwards
// @available(iOS 2.0, *)
//     optional public func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool)
//
//
// @available(iOS 2.0, *)
//     optional public func scrollViewWillBeginDecelerating(_ scrollView: UIScrollView) // called on finger up as we are moving
//
// @available(iOS 2.0, *)
//     optional public func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) // called when scroll view grinds to a halt
//
//
// @available(iOS 2.0, *)
//     optional public func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView) // called when setContentOffset/scrollRectVisible:animated: finishes. not called if not animating
//
//
// @available(iOS 2.0, *)
//     optional public func viewForZooming(in scrollView: UIScrollView) -> UIView? // return a view that will be scaled. if delegate returns nil, nothing happens
//
//         @available(iOS 3.2, *)
//     optional public func scrollViewWillBeginZooming(_ scrollView: UIScrollView, with view: UIView?) // called before the scroll view begins zooming its content
//
// @available(iOS 2.0, *)
//     optional public func scrollViewDidEndZooming(_ scrollView: UIScrollView, with view: UIView?, atScale scale: CGFloat) // scale between minimum and maximum. called after any 'bounce' animations
//
//
// @available(iOS 2.0, *)
//     optional public func scrollViewShouldScrollToTop(_ scrollView: UIScrollView) -> Bool // return a yes if you want to scroll to the top. if not defined, assumes YES
//
// @available(iOS 2.0, *)
//     optional public func scrollViewDidScrollToTop(_ scrollView: UIScrollView) // called when scrolling animation finished. may be called immediately if already at top
//
//
//     /* Also see -[UIScrollView adjustedContentInsetDidChange]
//      */
// @available(iOS 11.0, *)
//     optional public func scrollViewDidChangeAdjustedContentInset(_ scrollView: UIScrollView)
// }










