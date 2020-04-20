/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSSlider} from "./BCSSlider";

export function BCSSwitch(element) {
    BCSView.call(this,element)
}
BCSSwitch.extend(BCSView)
var prototype = BCSSwitch.prototype