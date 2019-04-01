/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'

export function BCSLabel(style) {
    BCSView1.call(this,style)
    var element = this.getLayer()
    this.setText = function (text) {
        if ('innerText' in element ) {
            element.innerText = text
        }else{
            element.textContent = text
        }
    }
}
{
    BCSLabel.extend(BCSView)
}
