/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSTabBar} from "./BCSTabBar";

export function BCSTabBarItem(element) {
    BCSView.call(this,element)
}
BCSTabBarItem.extend(BCSView)
var prototype = BCSTabBarItem.prototype