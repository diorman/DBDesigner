UniqueKey = function(){
	//If the constructor gets a UniqueKeyModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof UniqueKeyModel) this.setModel(arguments[0]);
	else this.setModel(new ForeignKeyModel());
};
$.extend(UniqueKey.prototype, DBObject);

UniqueKey.prototype.modelPropertyChanged = function(event) {
	switch(event.property){
		case 'stopEditing':
			this.modelChanged();
			break;
		default:
			this.modelChanged(event.property, true);
			break;
	}	
};

UniqueKey.prototype.getParent = function(){
	return this.getModel().getParent();
};

UniqueKey.prototype.drop = function(){
	this.getModel().drop();
	this.getParent().getUniqueKeyCollection().remove(this);
};

// *****************************************************************************

UniqueKeyModel = function(){};
$.extend(UniqueKeyModel.prototype, DBObjectModel);

UniqueKeyModel.prototype.setParent = function(table){
	this._parent = table;
};
UniqueKeyModel.prototype.getParent = function(){
	if(typeof this._parent == 'undefined') this._parent = null;
	return this._parent;
};
UniqueKeyModel.prototype.getColumns = function(){
	if(typeof this._columns == 'undefined') this._columns = [];
	return [].concat(this._columns);
};
UniqueKeyModel.prototype.setColumns = function(columns){
	var oldColumns = this.getColumns();
	var i;
	var throwEvent = false;
	for(i = 0; i < oldColumns.length; i++){
		if($.inArray(oldColumns[i], columns) == -1){
			oldColumns[i].setUniqueKey(false);
			oldColumns[i].unbind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnChanged, this);
			throwEvent = true;
		}
	}
	for(i = 0; i < columns.length; i++){
		if($.inArray(columns[i], oldColumns) == -1){
			columns[i].setUniqueKey(true);
			columns[i].bind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnChanged, this);
			throwEvent = true;
		}
	}
	this._columns = columns;
	if(throwEvent)this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'columns', oldValue: oldColumns, newValue: columns});
};

UniqueKeyModel.prototype.onColumnChanged = function(event){
	if($.inArray('name', event.properties) != -1){
		// this is just to notify the object detail view in case the parent table is selected
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'columnChanged'});
	}
};

UniqueKeyModel.prototype.chooseName = function(){
	var label = 'key';
	var name1 = this.getParent().getName();
	var name2 = '';
	var count = 0;
	var name;
	var columns = this.getColumns();
	for(var i = 0; i < columns.length; i++){
		name2 = name2 == ''? columns[i].getName() : name2 + '_' + columns[i].getName();
	}
	do{
		if(count > 0) label = 'key' + count;
		name = ConstraintHelper.buildConstraintName(name1, name2, label);
		count++;
	} while(ConstraintHelper.constraintNameExists(name, this));
	this.setName(name);
};

UniqueKeyModel.prototype.drop = function(){
	var columns = this.getColumns();
	for(var i = 0; i < columns.length; i++){
		columns[i].setUniqueKey(false);
		columns[i].unbind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnChanged, this);
	}
};