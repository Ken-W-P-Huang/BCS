/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'

export function BCSToolbar() {
    BCSView1.call(this,BCSToolbar.style)
}

{
    BCSToolbar.extend(BCSView)
    BCSToolbar.style = {
        width:'100%',
        height:'44px',
        bottom:'0px',
        backgroundColor:'red'
    }
}
