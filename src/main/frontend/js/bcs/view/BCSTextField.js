/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSTableView} from "./BCSTableView";

export function BCSTextField(element) {
    BCSView.call(this,element)
}
BCSTextField.extend(BCSView)
var prototype = BCSTextField.prototype