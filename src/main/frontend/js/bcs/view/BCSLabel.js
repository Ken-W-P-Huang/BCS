/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'

export function BCSLabel(style) {
    BCSView1.call(this,style,'label')
}

BCSLabel.extend(BCSView)
var prototype = BCSLabel.prototype
prototype.setText = function (text) {
    var element = this.getLayer()
    if ('innerText' in element ) {
        element.innerText = text
    }else{
        element.textContent = text
    }
}
