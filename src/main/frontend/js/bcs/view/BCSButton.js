/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'
import BCSLabel from './BCSLabel'
import BCSImageView from './BCSImageView'
import {BCSBarButtonItem} from "./BCSBarButtonItem";
import {BCSControl} from "./BCSControl";

export function BCSButton(style) {
    BCSControl.call(this,style)
    var titleLabel = new BCSLabel()
    var imageView = new BCSImageView()
    this.setPrivate('titleLabel',titleLabel)
    this.setPrivate('imageView',imageView)
    this.addSubView(titleLabel)
    this.addSubView(imageView)
}

BCSButton.extend(BCSControl)
var prototype = BCSButton.prototype
prototype.getTitleLabel = function () {
    return this.getPrivate('titleLabel')
}
prototype.getImageView = function () {
    return this.getPrivate('imageView')
}