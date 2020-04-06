/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'
import BCSButton from './BCSButton'
import {BCSDatePicker} from "./BCSDatePicker";


function BCSBarButton() {

}
BCSBarButton.extend(BCSButton)
var prototype1 = BCSBarButton.prototype

export function BCSNavigationBar() {
    BCSView1.call(this,BCSNavigationBar.style)
    this.isTranslucent = false
    this.delegate = null
}

BCSNavigationBar.extend(BCSView)
BCSNavigationBar.style = {
    width:'100%',
    height:'44px',
    // borderBottom:'solid 1px #333',
    backgroundColor:'rgba(255,255,255,0.8)'
}
var prototype2 = BCSNavigationBar.prototype