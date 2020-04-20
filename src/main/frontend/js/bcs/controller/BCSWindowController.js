/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSViewController} from './BCSViewController'
/**
 * 用于PC端
 * @param element
 * @constructor
 */
export function BCSWindowController(view) {
    BCSViewController.call(this,view)
}
BCSWindowController.extend(BCSViewController)