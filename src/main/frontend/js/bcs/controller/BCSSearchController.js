/**
 * Created by kenhuang on 2019/3/5.
 */
import {BCSViewController} from './BCSViewController'
export function BCSSearchController(view) {
    BCSViewController.call(this,view)
}
BCSSearchController.extend(BCSViewController)