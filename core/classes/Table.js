
Table = function() {
	//If the constructor gets a TableModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof TableModel) this.setModel(arguments[0]);
	else this.setModel(new TableModel());
	
	this.setUI(new TableUI(this));
};

$.extend(Table.prototype, DBObject);

Table.createFromJSON = function(json){
	var table = new Table(TableModel.createFromJSON(json));
	if(json.columns && json.columns.length > 0) {
		table.getColumnCollection().loadJSON(json.columns, table);
	}
	if(json.uniqueKeys && json.uniqueKeys.length > 0) {
		table.getUniqueKeyCollection().loadJSON(json.uniqueKeys, table);
	}
	
	return table;
};

Table.prototype.isSelected = function(){
	return this.getModel().isSelected();
};

Table.prototype.setSelected = function(b){
	this.getModel().setSelected(b);
	this.getUI().updateSelected(b);
};

Table.prototype.setPosition = function(position){
	this.getModel().setPosition(position);
};

Table.prototype.getPosition = function(){
	return this.getModel().getPosition();
};

Table.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'dropped':
			this.getUI().drop();
			this.trigger(DBObject.Event.DBOBJECT_DROPPED);
			break;
		case 'name':
			this.modelChanged(event.property, ui.updateName, [event.newValue]);
			break;
		case 'collapsed':
			ui.updateCollapsed(event.newValue);
			break;
		case 'selected':
			this.trigger(Table.Event.SELECTION_CHANGED, {tableIsSelected: event.newValue});
			break;
		case 'stopEditing':
			this.modelChanged();
			break;
		default:
			this.modelChanged(event.property, true);
			break;
	}	
};

Table.prototype.alterTable = function(){
	this.trigger(Table.Event.ALTER_REQUEST);
};

Table.prototype.getColumnCollection = function(){
	return this.getModel().getColumnCollection();
};

Table.prototype.getForeignKeyCollection = function(){
	return this.getModel().getForeignKeyCollection();
};

Table.prototype.getUniqueKeyCollection = function(){
	return this.getModel().getUniqueKeyCollection();
};

Table.prototype.refresh = function(){
	this.getUI().updateWidth();
};

Table.prototype.triggerViewBoxChanged = function(data){
	if(typeof data != 'object') data = {};
	this.trigger(Table.Event.VIEW_BOX_CHANGED, data);
};

Table.prototype.triggerDetailRequest = function(){
	this.trigger(Table.Event.DETAIL_REQUEST);
};

Table.prototype.getSize = function(){
	return this.getUI().getSize();
};

Table.prototype.getWithoutOIDS = function(){
	return this.getModel().getWithoutOIDS();
};

Table.prototype.drop = function(){
	this.getModel().drop();
};

Table.prototype.serialize = function(){
	return this.getModel().serialize();
};

// *****************************************************************************

TableModel = function() {
	
};

$.extend(TableModel.prototype, DBObjectModel);

TableModel.createFromJSON = function(json){
	json.withoutOIDS = $.parseBool(json.withoutOIDS);
	json.collapsed = $.parseBool(json.collapsed);
	json.position = {top: parseInt(json.position.top), left: parseInt(json.position.left)}
	
	var model = new TableModel();
	model.setName(json.name);
	model.setComment(json.comment);
	model.setWithoutOIDS(json.withoutOIDS);
	model.setCollapsed(json.collapsed);
	model.setPosition(json.position);
	return model;
};

TableModel.prototype.setPosition = function(position){
	this._position = $.extend(this.getPosition(), position);
};

TableModel.prototype.getPosition = function(){
	if(typeof this._position == 'undefined') this._position = {top:0, left:0}
	return $.extend({}, this._position);
};

TableModel.prototype.setWithoutOIDS = function(b){
	var oldValue = this.getWithoutOIDS();
	if(oldValue != b){
		this._withoutOIDS = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'options', oldValue: oldValue, newValue: b});
	}
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

TableModel.prototype.getColumnCollection = function(){
	if(typeof this._columnCollection == 'undefined') this._columnCollection = new ColumnCollection();
	return this._columnCollection;
};

TableModel.prototype.getForeignKeyCollection = function(){
	if(typeof this._foreignKeyCollection == 'undefined') this._foreignKeyCollection = new ForeignKeyCollection();
	return this._foreignKeyCollection;
};

TableModel.prototype.getUniqueKeyCollection = function(){
	if(typeof this._uniqueKeyCollection == 'undefined') this._uniqueKeyCollection = new UniqueKeyCollection();
	return this._uniqueKeyCollection;
};

TableModel.prototype.getSize = function(){
	if(typeof this._size == 'undefined') this._size = {width: 0, height: 0};
	return $.extend({}, this._size);
};

TableModel.prototype.setSize = function(size){
	this._size = $.extend(this.getSize(), size);
};

TableModel.prototype.drop = function(){
	var foreignKeys = this.getForeignKeyCollection().getForeignKeys();
	var uniqueKeys = this.getUniqueKeyCollection().getUniqueKeys();
	var i;
	//Remove constraints to delete references from foreign tables and list of constraints
	for(i = 0; i < foreignKeys.length; i++){ foreignKeys[i].drop(); }
	for(i = 0; i < uniqueKeys.length; i++){ uniqueKeys[i].drop(); }
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'dropped'});
};

TableModel.prototype.serialize = function(){
	return  {
		name: this.getName(),
		comment: this.getComment(),
		withoutOIDS: this.getWithoutOIDS(),
		collapsed: this.isCollapsed(),
		position: this.getPosition(),
		columns: this.getColumnCollection().serialize(),
		foreignKeys: this.getForeignKeyCollection().serialize(),
		uniqueKeys: this.getUniqueKeyCollection().serialize()
	};
};

// *****************************************************************************

TableUI = function(controller) {
	this.setTemplateID('Table');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('#canvas').data('dbobject', controller).multiDraggable({containment: 'parent'});
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
	this.getController().triggerViewBoxChanged({dragging: true});
};

TableUI.prototype.onDragStop = function(){
	var $canvas = $('#canvas');
	var position = this.getDom().position();
	var controller = this.getController();
	position.left += $canvas.scrollLeft();
	position.top += $canvas.scrollTop();
	controller.setPosition(position);
	controller.triggerViewBoxChanged();
};

TableUI.prototype.onButtonPressed = function(event){
	var model = this.getController().getModel();
	var $button = $(event.currentTarget);
	if($button.is('a.collapse-button')){
		model.setCollapsed(!model.isCollapsed());
	}
	else if($button.is('a.properties-button')){
		this.getController().triggerDetailRequest();
	}
	event.preventDefault();
};

TableUI.prototype.onHeaderDblClicked = function(event){
	if($(event.target).is('div.header, span.title')){
		this.getController().alterTable();
	}
};

TableUI.prototype.updateWidth = function(){
	var controller = this.getController();
	var dom = this.getDom();
	var w = dom.find('div.header > span.title').outerWidth() + 54/*(buttons)*/;
	var model = controller.getModel();
	if(!model.isCollapsed()){
		dom.find('span.definition').each(function(){
			w = Math.max($(this).outerWidth() + 22, w);
		});
	}
	dom.css({width: w, minWidth: w});
	model.setSize(this.getSize());
	controller.triggerViewBoxChanged();
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

TableUI.prototype.getSize = function(){
	var dom = this.getDom();
	var size = {
		width: dom.outerWidth(),
		height: dom.outerHeight()
	}
	return size;
};

TableUI.prototype.drop = function(){
	this.getDom().remove();
};
