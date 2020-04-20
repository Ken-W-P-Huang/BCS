/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'

export function BCSImageView(style,imageSrc,element) {
    if (! element) {
        element = document.createElement('label')
    }
    BCSView.call(this,style,element)
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
BCSView.import('IMG',BCSImageView)
var prototype = BCSImageView.prototype
prototype.startAnimating = function () {
    
}
prototype.stopAnimating = function () {

}