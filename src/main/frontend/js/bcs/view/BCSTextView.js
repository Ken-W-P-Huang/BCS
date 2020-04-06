/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'

export function BCSTextView(element) {
    BCSView.call(this,element,'textarea')
}
BCSTextView.extend(BCSView)