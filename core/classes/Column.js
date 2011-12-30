Column = function() {
	//If the constructor gets a ColumnModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof ColumnModel) this.setModel(arguments[0]);
	else this.setModel(new ColumnModel());
	
	this.setUI(new ColumnUI(this));
};

$.extend(Column.prototype, Component);

Column.prototype.getName = function(){
	return this.getModel().getName();
};

Column.prototype.modelPropertyChanged = function(event){
	switch(event.property){
		case 'parent':
			this.getUI().updateParent();
			break;
		default:
			this.getUI().updateView();
			break;
	}
};

Column.prototype.alterColumn = function(){
	this.trigger(Column.Event.ALTER_COLUMN, {column: this});
};

Column.prototype.isPrimaryKey = function(){
	return this.getModel().isPrimaryKey();
};

Column.prototype.isUniqueKey = function(){
	return this.getModel().isUniqueKey();
};

// *****************************************************************************



ColumnModel = function(){};
$.extend(ColumnModel.prototype, DBObjectModel);

ColumnModel.prototype.setType = function(type){
	var oldValue = this.getType();
	if(oldValue != type){
		this._type = type;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'type', newValue: type, oldValue: oldValue});
	}
};
ColumnModel.prototype.getType = function(){
	if(typeof this._type == 'undefined') this._type = 'SERIAL';
	return this._type;
};

ColumnModel.prototype.setLength = function(length){
	var oldValue = this.getLength();
	if(oldValue != length){
		this._length = length;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'length', newValue: length, oldValue: oldValue});
	}
};

ColumnModel.prototype.getLength = function(){
	if(typeof this._length == 'undefined') this._length = '';
	return this._length;
};

ColumnModel.prototype.setDefault = function(def){
	var oldValue = this.getDefault();
	if(oldValue != def){
		this._default = def;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'default', newValue: def, oldValue: oldValue});
	}
};

ColumnModel.prototype.getDefault = function(){
	if(typeof this._default == 'undefined') this._default = '';
	return this._default;
};

ColumnModel.prototype.setArray = function(b){
	this.setFlagState(ColumnModel.Flag.Array, b);
};

ColumnModel.prototype.isArray = function(){
	return (this.getFlags() & ColumnModel.Flag.ARRAY) != 0;
};

ColumnModel.prototype.setPrimaryKey = function(b){
	this.setFlagState(ColumnModel.Flag.PRIMARY_KEY, b);
};

ColumnModel.prototype.isPrimaryKey = function(){
	return (this.getFlags() & ColumnModel.Flag.PRIMARY_KEY) != 0;
};

ColumnModel.prototype.setForeignKey = function(b){
	this.setFlagState(ColumnModel.Flag.FOREIGN_KEY, b);
};

ColumnModel.prototype.isForeignKey = function(){
	return (this.getFlags() & ColumnModel.Flag.FOREIGN_KEY) != 0;
};

ColumnModel.prototype.setUniqueKey = function(b){
	this.setFlagState(ColumnModel.Flag.UNIQUE_KEY, b);
};

ColumnModel.prototype.isUniqueKey = function(){
	return (this.getFlags() & ColumnModel.Flag.UNIQUE_KEY) != 0;
};

ColumnModel.prototype.setNotnull = function(b){
	this.setFlagState(ColumnModel.Flag.NOTNULL, b);
};

ColumnModel.prototype.isNotnull = function(){
	return (this.getFlags() & ColumnModel.Flag.NOTNULL) != 0;
};

ColumnModel.prototype.setParent = function(table){
	this._parent = table;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'parent', newValue: table, oldValue: null});
};

ColumnModel.prototype.getParent = function(){
	if(typeof this._parent == 'undefined') this._parent = null;
	return this._parent;
};

// *****************************************************************************

ColumnUI = function(controller){
	this.setTemplateID('Column');
	this.setController(controller);
	this.init();
	this.updateView();
	this.updateParent();
};
$.extend(ColumnUI.prototype, ComponentUI);

ColumnUI.prototype.updateView = function(){
	var model = this.getController().getModel();
	var dom = this.getDom();
	var $keys = dom.find('span.keys');
	var def = model.getName() + ' : ' + model.getType();
	if(model.isArray()) def += '[]';
	
	dom.find('span.definition').text(def);
	if(model.isPrimaryKey() && model.isForeignKey()) $keys.attr('class', 'keys pk-fk');
	else if(model.isUniqueKey() && model.isForeignKey()) $keys.attr('class', 'keys uk-fk');
	else if(model.isPrimaryKey()) $keys.attr('class', 'keys pk');
	else if(model.isUniqueKey()) $keys.attr('class', 'keys uk');
	else if(model.isForeignKey()) $keys.attr('class', 'keys fk');
	else $keys.attr('class', 'keys');
	
	if(model.isNotnull() || model.isPrimaryKey()) dom.addClass('notnull');
	else dom.removeClass('notnull');
	model.getParent().refresh();
};

ColumnUI.prototype.updateParent = function(){
	var table = this.getController().getModel().getParent();
	if(table != null) this.getDom().appendTo(table.getUI().find('div.column-container'));
	table.refresh();
};

ColumnUI.prototype.onDblClick = function(){
	this.getController().alterColumn();
};

ColumnUI.prototype.bindEvents = function(){
	this.getDom().dblclick($.proxy(this.onDblClick, this));
};

