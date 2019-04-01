/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'
import BCSLabel from './BCSLabel'
import BCSImageView from './BCSImageView'

export function BCSButton(style) {
    BCSView1.call(this,style,'button')
    var titleLabel = new BCSLabel()
    var imageView = new BCSImageView()
    this.addSubView(titleLabel)
    this.addSubView(imageView)

    this.getTitleLabel = function () {
        return titleLabel
    }
    this.getImageView = function () {
        return imageView
    }
}
{
    BCSButton.extend(BCSView)
    BCSButton.prototype.addTarget = function (target,action,controlEvents) {
        
    }
    BCSButton.prototype.removeTarget = function (target,action,controlEvents) {

    }
}
