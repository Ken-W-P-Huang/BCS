/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSPickerView} from "./BCSPickerView";

export function BCSProgressView(element) {
    BCSView.call(this,element)
}
BCSProgressView.extend(BCSView)
var prototype = BCSProgressView.prototype