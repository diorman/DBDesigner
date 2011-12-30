ForeignKey = function() {
	//If the constructor gets a ColumnModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof ForeignKeyModel) this.setModel(arguments[0]);
	else this.setModel(new ForeignKeyModel());
	
	//this.setUI(new ForeignKeyUI(this));
};

$.extend(ForeignKey.prototype, Component);

ForeignKey.prototype.getName = function(){
	return this.getModel().getName();
};

// *****************************************************************************

ForeignKeyModel = function(){};


ForeignKeyModel.prototype.setParent = function(table){
	this._parent = table;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'parent', newValue: table, oldValue: null});
};

ForeignKeyModel.prototype.getParent = function(){
	if(typeof this._parent == 'undefined') this._parent = null;
	return this._parent;
};

ForeignKeyModel.prototype.setReferencedTable = function(table){
	this._referencedTable = table;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'referencedTable', newValue: table, oldValue: null});
};

ForeignKeyModel.prototype.getReferencedTable = function(){
	if(typeof this._parent == 'undefined') this._referencedTable = null;
	return this._referencedTable;
};

ForeignKeyModel.prototype.getUpdateAction = function(){
	if(typeof this._updateAction == 'undefined') this._updateAction = ForeignKeyModel.Action.NO_ACTION;
	return this._updateAction;
};
ForeignKeyModel.prototype.setUpdateAction = function(action){
	this._updateAction = action;
};
ForeignKeyModel.prototype.getDeleteAction = function(){
	if(typeof this._deleteAction == 'undefined') this._deleteAction = ForeignKeyModel.Action.NO_ACTION;
	return this._deleteAction;
};
ForeignKeyModel.prototype.setDeleteAction = function(action){
	this._updateAction = action;
};

ForeignKeyModel.prototype.getColumns = function(){
	if(typeof this._columns == 'undefined') this._columns = [];
	return this._columns;
};

ForeignKeyModel.prototype.setColumns = function(columns){
	this._columns = columns;
};

ForeignKeyModel.prototype.setDeferrable = function(b){
	this.setFlagState(ForeignKeyModel.Flag.DEFERRABLE, b);
};

ForeignKeyModel.prototype.isDeferrable = function(){
	return (this.getFlags() & ForeignKeyModel.Flag.DEFERRABLE) != 0;
};

ForeignKeyModel.prototype.setDeferred = function(b){
	this.setFlagState(ForeignKeyModel.Flag.DEFERRED, b);
};

ForeignKeyModel.prototype.isDeferred = function(){
	return (this.getFlags() & ForeignKeyModel.Flag.DEFERRED) != 0;
};

ForeignKeyModel.prototype.setMatchFull = function(b){
	this.setFlagState(ForeignKeyModel.Flag.MATCH_FULL, b);
};

ForeignKeyModel.prototype.isMatchFull = function(){
	return (this.getFlags() & ForeignKeyModel.Flag.MATCH_FULL) != 0;
};

$.extend(ForeignKeyModel.prototype, DBObjectModel);
