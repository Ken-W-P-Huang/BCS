/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView,BCSView1} from './BCSView'

export function BCSImageView(style,imageSrc) {
    BCSView1.call(this,style,'img')
    if (imageSrc) {
        this.getLayer().src = imageSrc
    }
    //todo animation
}
BCSImageView.extend(BCSView)