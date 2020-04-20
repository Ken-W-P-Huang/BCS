/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSNavigationItem} from "./BCSNavigationItem";

export function BCSPageControl(element) {
    BCSView.call(this,element)
}
BCSPageControl.extend(BCSView)
var prototype = BCSPageControl.prototype