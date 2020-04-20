/**
 * Created by kenhuang on 2019/2/16.
 */
import BCSView from './BCSView'

var BCSTableViewCellStyleEnum = {
    Default:1,
    value1:2,
    value2:3,
    subtitle:4
}

var BCSTableViewCellSelectionStyleEnum = {
    none:1,
    blue:2,
    gray:3,
    Default:4
}
var BCSTableViewCellFocusStyleEnum = {
    Default:1,
    custom:2
}

var BCSTableViewCellEditingStyleEnum = {
    none:1,
    delete:2,
    insert:3
}

var BCSTableViewCellAccessoryTypeEnum = {
    none:1,
    disclosureIndicator:2,
    detailDisclosureButton:3,
    checkmark:4,
    detailButton:5
}

var BCSTableViewCellDragStateEnum = {
    none:1,
    lifting:2,
    dragging:3
}



export function BCSTableViewCell(style,element) {
    BCSView.call(this,style,element)
    // this.setProtected('imageView',)
    // this.setProtected('textLabel',)
    // this.setProtected('detailTextLabel',)
    // this.setProtected('contentView',)
    // this.setProtected('reuseIdentifier',)
    // // default is UITableViewCellEditingStyleNone. This is set by UITableView using the delegate's value for cells who customize their appearance accordingly.
    // this.setProtected('editingStyle',)
    // this.setProtected('showingDeleteConfirmation',)
    var propertiesMap = {

    }
    this.enableProtectedProperty(propertiesMap)
    this.backgroundView = null
    this.selectedBackgroundView = null
    this.multipleSelectionBackgroundView = null
    this.selectionStyle = BCSTableViewCellSelectionStyleEnum.Default
    this.isSelected = false
    this.isHighlighted = false
    this.showsReorderControl = false
    this.shouldIndentWhileEditing = true
    this.accessoryType = BCSTableViewCellAccessoryTypeEnum.none
    this.accessoryView = null
    this.editingAccessoryType = BCSTableViewCellEditingStyleEnum.none
    this.editingAccessoryView = null
    this.indentationLevel = 0
    this.indentationWidth = 10.0
    this.separatorInset = null
    this.isEditing = false
    this.focusStyle = BCSTableViewCellFocusStyleEnum.Default
    this.userInteractionEnabledWhileDragging = false
}

BCSTableViewCell.extend(BCSView)
var prototype = BCSTableViewCell.prototype
prototype.getImageView = function(){
    return this.getProtected('imageView')
}
prototype.getTextLabel = function(){
    return this.getProtected('textLabel')
}
prototype.getDetailTextLabel = function(){
    return this.getProtected('detailTextLabel')
}
prototype.getContentView = function(){
    return this.getProtected('contentView')
}
prototype.getReuseIdentifier = function(){
    return this.getProtected('reuseIdentifier')
}
prototype.getEditingStyle = function(){
    return this.getProtected('editingStyle')
}
prototype.getShowingDeleteConfirmation = function(){
    return this.getProtected('showingDeleteConfirmation')
}
prototype.prepareForReuse = function () {
    
}
prototype.setSelected = function (selected,animated) {
    
}
prototype.setHighlighted = function (highlighted,animated) {
    
}
prototype.setEditing = function (editing,animated) {
    
}

prototype.willTransition = function (state) {
    
}
prototype.didTransition = function (state) {

}

prototype.dragStateDidChange = function (dragState) {

}