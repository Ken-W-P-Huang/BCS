/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'

export function BCSImageView(style,imageSrc) {
    BCSView1.call(this,style,'img')
    if (imageSrc) {
        this.getLayer().src = imageSrc
    }
    this.isUserInteractionEnabled = false
    this.highlightedImage = null
    this.isHighlighted = false
    this.animationImages = []
    this.highlightedAnimationImages = []
    // for one cycle of images. default is number of images * 1/30th of a second (i.e. 30 fps)
    this.animationDuration = 0
    // 0 means infinite (default is 0)
    this.animationRepeatCount = 0
    this.tintColor = 0
    this.isAnimating = false
}

BCSImageView.extend(BCSView)
var prototype = BCSImageView.prototype
prototype.startAnimating = function () {
    
}
prototype.stopAnimating = function () {

}