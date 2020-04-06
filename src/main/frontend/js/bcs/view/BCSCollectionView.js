/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSCanvasView} from "./BCSCanvasView";

export function BCSCollectionView(element) {
    BCSView.call(this,element)
}
BCSCollectionView.extend(BCSView)
var prototype = BCSCollectionView.prototype