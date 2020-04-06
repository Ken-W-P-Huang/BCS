/**
 * Created by kenhuang on 2019/2/16.
 */
import {BCSView} from './BCSView'
import {BCSCollectionView} from "./BCSCollectionView";

export function BCSCollectionViewCell(element) {
    BCSView.call(this,element)
}
BCSCollectionViewCell.extend(BCSView)
var prototype = BCSCollectionViewCell.prototype