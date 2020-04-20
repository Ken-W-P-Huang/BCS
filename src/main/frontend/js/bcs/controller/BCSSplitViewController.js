/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSViewController}  from './BCSViewController'
export function BCSSplitViewController(view) {
    BCSViewController.call(this,view)
    this.viewControllers = []
}
BCSSplitViewController.extend(BCSViewController)