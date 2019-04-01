/**
 * Created by kenhuang on 2019/1/26.
 */
import {BCSViewController} from './BCSViewController'
/**
 * 用于PC端
 * @param element
 * @constructor
 */
export function BCSWindowController(element) {
    BCSViewController.call(this,element)
}
BCSWindowController.extend(BCSViewController)