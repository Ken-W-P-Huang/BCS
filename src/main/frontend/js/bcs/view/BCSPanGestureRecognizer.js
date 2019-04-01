/**
 * Created by kenhuang on 2019/3/12.
 */
import {BCSGestureRecognizer,BCSGestureRecognizerStateEnum,EventTypeEnum} from './BCSGestureRecognizer'
// Begins:  when at least minimumNumberOfTouches have moved enough to be considered a pan
// Changes: when a finger moves while at least minimumNumberOfTouches are down
// Ends:    when all fingers have lifted
export function BCSPanGestureRecognizer(target,action){
    BCSGestureRecognizer.call(this,target,action)
}

var panGestureRecognizerMap = {}
BCSPanGestureRecognizer.extend(BCSGestureRecognizer)
BCSPanGestureRecognizer.prototype.shouldRequireFailureOf = function(otherGestureRecognizer){
    if (otherGestureRecognizer.isKindOf(BCSPanGestureRecognizer)
        && this.numberOfTapsRequired < otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

BCSPanGestureRecognizer.prototype.shouldBeRequiredToFailBy = function (otherGestureRecognizer) {
    if (otherGestureRecognizer.isKindOf(BCSPanGestureRecognizer)
        && this.numberOfTapsRequired >= otherGestureRecognizer.numberOfTapsRequired) {
        return true
    }
    return false
}

BCSPanGestureRecognizer.prototype.touchesBegan = function (touches, event){
    var data = panGestureRecognizerMap[this.getKey()]
    BCSGestureRecognizer.prototype.touchesBegan.call(this,touches, event)

}

BCSPanGestureRecognizer.prototype.touchesMoved = function (touches, event){
    var data = panGestureRecognizerMap[this.getKey()]
    BCSGestureRecognizer.prototype.touchesMoved.call(this,touches, event)


    // console.log('touchesMoved',this.name,this.state)
}

BCSPanGestureRecognizer.prototype.touchesEnded = function (touches, event){
    var data = panGestureRecognizerMap[this.getKey()]
    BCSGestureRecognizer.prototype.touchesEnded.call(this,touches, event)

    console.log('touchesEnded',this.name,this.state)
}

BCSPanGestureRecognizer.prototype.deinit = function () {
    BCSGestureRecognizer.prototype.deinit.call(this)
    try{
        delete panGestureRecognizerMap[this.getKey()]
    }catch(e){
        panGestureRecognizerMap[this.getKey()] = undefined
    }
}