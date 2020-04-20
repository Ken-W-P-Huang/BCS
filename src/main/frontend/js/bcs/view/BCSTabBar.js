/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSSwitch} from "./BCSSwitch";

export function BCSTabBar() {
    BCSView.call(this,{
        bottom:'0px',
        width:'100%'
    })

}
BCSTabBar.extend(BCSView)
var prototype = BCSTabBar.prototype