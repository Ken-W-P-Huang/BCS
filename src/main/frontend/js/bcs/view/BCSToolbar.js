/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSTextField} from "./BCSTextField";
var style = {
    width:'100%',
    height:'44px',
    bottom:'0px',
    backgroundColor:'red'
}
export function BCSToolbar() {
    BCSView.call(this,style)
}
BCSToolbar.extend(BCSView)
var prototype = BCSToolbar.prototype

