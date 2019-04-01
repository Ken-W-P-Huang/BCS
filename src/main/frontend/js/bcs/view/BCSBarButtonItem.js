/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'

export function BCSBarItem() {
    this.isEnabled = true
    this.title = ''
    this.image = ''
    this.landscapeImagePhone = ''
    this.largeContentSizeImage = ''
    this.imageInsets = null
    this.landscapeImagePhoneInsets = null
    this.largeContentSizeImageInsets = null
    this.tag = 0
}
{
    BCSBarItem.prototype.setTitleTextAttributes = function (attributes,state) {
        
    }
    BCSBarItem.prototype.titleTextAttributes = function (state) {
        
    }
}

export function BCSBarButtonItem(element) {
    BCSView.call(this,element)

}
BCSBarButtonItem.extend(BCSView)