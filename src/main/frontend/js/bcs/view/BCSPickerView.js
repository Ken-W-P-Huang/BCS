/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSPageControl} from "./BCSPageControl";

export function BCSPickerView(element) {
    BCSView.call(this,element)
}
BCSPickerView.extend(BCSView)
var prototype = BCSPickerView.prototype