/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'
import BCSButton from './BCSButton'


function BCSBarButton() {

}
BCSBarButton.extend(BCSButton)

export function BCSNavigationBar() {
    BCSView1.call(this,BCSNavigationBar.style)
    this.isTranslucent = false
    this.delegate = null
}

{
    BCSNavigationBar.extend(BCSView)
    BCSNavigationBar.style = {
        width:'100%',
        height:'44px',
        // borderBottom:'solid 1px #333',
        backgroundColor:'rgba(255,255,255,0.8)'
    }
}
