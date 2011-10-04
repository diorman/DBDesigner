
Table = function() {
	//If the constructor gets a TableModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof TableModel) this.setModel(arguments[0]);
	else this.setModel(new TableModel());
	
	this.setUI(new TableUI(this));
};

$.extend(Table.prototype, Component);

Table.prototype.getName = function(){
	return this.getModel().getName();
};

Table.prototype.isSelected = function(){
	return this.getModel().isSelected();
};

Table.prototype.setSelected = function(b){
	this.getModel().setSelected(b);
	this.getUI().updateSelected(b);
};

Table.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'name':
			ui.updateName(event.newValue);
			break;
		case 'collapsed':
			ui.updateCollapsed(event.newValue);
			break;
		case 'selected':
			this.trigger(Table.Event.SELECTION_CHANGED, {tableIsSelected: event.newValue});
			break;
	}
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, event);	
};

Table.prototype.editTable = function(){
	this.trigger(Table.Event.ALTER_TABLE);
};

// *****************************************************************************

TableModel = function() {
	
};

$.extend(TableModel.prototype, DBObjectModel);

TableModel.prototype.setPosition = function(position){
	var oldPosition = this.getPosition();
	if(oldPosition.top != position.top || oldPosition.left != position.left){
		$.extend(this._position, position);
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'position', oldValue: oldPosition, newValue: position});
	}
};

TableModel.prototype.getPosition = function(){
	if(typeof this._position == 'undefined') this._position = {top:0, left:0}
	return $.extend({}, this._position);
};

TableModel.prototype.setWithoutOIDS = function(b){
	this._withoutOIDS = b;
}

TableModel.prototype.getWithoutOIDS = function(){
	if(typeof this._withoutOIDS == 'undefined') this._withoutOIDS = true;
	return this._withoutOIDS;
}

TableModel.prototype.isSelected = function(){
	if(typeof this._selected == 'undefined') this._selected = false;
	return this._selected;
};

TableModel.prototype.setSelected = function(b){
	var oldValue = this.isSelected();
	if(oldValue != b){
		this._selected = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selected', oldValue: oldValue, newValue: b});
	}
};

TableModel.prototype.isCollapsed = function(){
	if(typeof this._collapsed == 'undefined') this._collapsed = false;
	return this._collapsed;
};

TableModel.prototype.setCollapsed = function(b){
	var oldValue = this.isCollapsed();
	if(oldValue != b){
		this._collapsed = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'collapsed', oldValue: oldValue, newValue: b});
	}
};

TableModel.prototype.isSelected = function(){
	if(typeof this._selected == 'undefined') this._selected = false;
	return this._selected;
};

TableModel.prototype.setSelected = function(b){
	var oldValue = this.isSelected();
	if(oldValue != b){
		this._selected = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selected', oldValue: oldValue, newValue: b});
	}
};

// *****************************************************************************

TableUI = function(controller) {
	this.setTemplateID('Table');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('#canvas').multiDraggable({containment: 'parent'});
	this.updateView();
};

$.extend(TableUI.prototype, ComponentUI);

TableUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	var selectionChanged = $.proxy(this.selectionChanged, this);
	dom.bind({
		dragstart: $.proxy(this.onDragStart, this),
		dragstop: $.proxy(this.onDragStop, this),
		selectableselected: selectionChanged,
		selectableunselected: selectionChanged
	});
	dom.find('a.button').click($.proxy(this.onButtonPressed, this));
	dom.find('div.header').dblclick($.proxy(this.onHeaderDblClicked, this));
};

TableUI.prototype.updateView = function(){
	var model = this.getController().getModel();
	this.updatePosition(model.getPosition());
	this.updateName(model.getName());
	this.updateCollapsed(model.isCollapsed());
	this.updateSelected(model.isSelected());
};

TableUI.prototype.updatePosition = function(position){
	this.getDom().css({top: position.top + 'px', left: position.left + 'px'});
};

TableUI.prototype.updateName = function(name){
	this.find('div.header > span.title').text(name);
	this.updateWidth();
};

TableUI.prototype.onDragStart = function(){
	console.log('dragstart');
};

TableUI.prototype.onDragStop = function(){
	console.log(this.getDom().width());
	console.log(this.find('div.header > span.title').outerWidth());
	
};

TableUI.prototype.onButtonPressed = function(event){
	var model = this.getController().getModel();
	var $button = $(event.currentTarget);
	if($button.is('a.collapse-button')){
		model.setCollapsed(!model.isCollapsed());
	}
	else if($button.is('a.properties-button')){
		
	}
	event.preventDefault();
};

TableUI.prototype.onHeaderDblClicked = function(event){
	if($(event.target).is('div.header, span.title')){
		this.getController().editTable();
	}
};

TableUI.prototype.updateWidth = function(){
	var dom = this.getDom();
	var w = dom.find('div.header > span.title').outerWidth() + 54/*(buttons)*/;
	dom.css({width: w, minWidth: w});
};

TableUI.prototype.updateCollapsed = function(b){
	var dom = this.getDom();
	var hasClass = dom.hasClass('db-table-collapsed');
	if(b && !hasClass){
		dom.addClass('db-table-collapsed')
			.find('a.collapse-button span')
			.removeClass('ui-icon-circle-triangle-s')
			.addClass('ui-icon-circle-triangle-e');
	}
	else if(!b && hasClass){
		dom.removeClass('db-table-collapsed')
			.find('a.collapse-button span')
			.removeClass('ui-icon-circle-triangle-e')
			.addClass('ui-icon-circle-triangle-s');
	}
	this.updateWidth();
};

TableUI.prototype.updateSelected = function(b){
	var dom = this.getDom();
	var hasClass = dom.hasClass('ui-selected');
	if(b && !hasClass) dom.addClass('ui-selected');
	else if(!b && hasClass) dom.removeClass('ui-selected');
};

TableUI.prototype.selectionChanged = function(event){
	var selected = event.type == 'selectableselected';
	this.getController().getModel().setSelected(selected);
};
