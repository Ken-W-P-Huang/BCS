/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSScrollView} from "./BCSScrollView";

export function BCSSlider(element) {
    BCSView.call(this,element)
}
BCSSlider.extend(BCSView)
var prototype = BCSSlider.prototype