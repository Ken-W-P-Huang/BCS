/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSCollectionViewCell} from "./BCSCollectionViewCell";

export function BCSDatePicker(element) {
    BCSView.call(this,element)
}
BCSDatePicker.extend(BCSView)
var prototype = BCSDatePicker.prototype
