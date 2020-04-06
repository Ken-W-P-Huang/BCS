/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'
import {BCSSwitch} from "./BCSSwitch";

export function BCSTabBar() {
    BCSView1.call(this,{
        bottom:'0px',
        width:'100%'
    })

}
BCSTabBar.extend(BCSView)
var prototype = BCSTabBar.prototype