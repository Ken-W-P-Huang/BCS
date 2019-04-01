/**
 * Created by kenhuang on 2019/3/5.
 */
import {BCSViewController} from './BCSViewController'
export function BCSSearchController(element) {
    BCSViewController.call(this,element)
}
BCSSearchController.extend(BCSViewController)