/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSViewController} from './BCSViewController'
export function BCSTabBarController(view) {
    BCSViewController.call(this,view)
    this.viewControllers = []
}
BCSTabBarController.extend(BCSViewController)