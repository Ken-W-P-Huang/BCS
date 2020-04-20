/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import BCSLabel from './BCSLabel'
import BCSImageView from './BCSImageView'
import {BCSBarButtonItem} from "./BCSBarButtonItem";
import {BCSControl} from "./BCSControl";

export function BCSButton(style) {
    BCSControl.call(this,style)
    var titleLabel = new BCSLabel()
    var imageView = new BCSImageView()
    this.enableProtectedProperty({
        'titleLabel':titleLabel,
        'imageView':imageView
    })
    this.setProtected('titleLabel',titleLabel)
    this.setProtected('imageView',imageView)
    this.addSubView(titleLabel)
    this.addSubView(imageView)
}

BCSButton.extend(BCSControl)
BCSView.import('BUTTON',BCSButton)
var prototype = BCSButton.prototype
prototype.getTitleLabel = function () {
    return this.getProtected('titleLabel')
}
prototype.getImageView = function () {
    return this.getProtected('imageView')
}