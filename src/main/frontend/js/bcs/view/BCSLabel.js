/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'

export function BCSLabel(style) {
    this.enableProtectedProperty({
        layer : document.createElement('label')
    })
    BCSView.call(this,style)
}

BCSLabel.extend(BCSView)
BCSView.import('LABEL',BCSLabel)
var prototype = BCSLabel.prototype
prototype.setText = function (text) {
    var element = this.getLayer()
    if ('innerText' in element ) {
        element.innerText = text
    }else{
        element.textContent = text
    }
}
