
ColumnCollection = function(){
	this._columns = [];
};

$.extend(ColumnCollection.prototype, EventDispatcher);

ColumnCollection.prototype.getColumnByName = function(name){
	for(var i = 0, n = this._columns.length; i < n; i++){
		if(this._columns[i].getName() == name) return this._columns[i];
	}
	return null;
};

ColumnCollection.prototype.add = function(column){
	if($.inArray(column, this._columns) == -1){
		this._columns.push(column);
		column.bind(Column.Event.ALTER_REQUEST, this.alterColumn, this);
		column.bind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnAltered, this);
		this.trigger(Collection.Event.COLLECTION_CHANGED, {columnAdded: column});
	}
};

ColumnCollection.prototype.remove = function(column){
	var index = $.inArray(column, this._columns);
	this._columns.splice(index, 1);
	column.unbind(Column.Event.ALTER_REQUEST, this.alterColumn, this);
	column.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnAltered, this);
	this.trigger(Collection.Event.COLLECTION_CHANGED, {columnDropped: column});
};

ColumnCollection.prototype.onColumnAltered = function(event){
	this.trigger(Collection.Event.COLLECTION_CHANGED, {columnAltered: event.sender});
};

ColumnCollection.prototype.alterColumn = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_COLUMN, event.sender);
};


ColumnCollection.prototype.getColumnNames = function(){
	var cNames = [];
	for(var i = 0, n = this._columns.length; i < n; i++){
		cNames.push(this._columns[i].getName());
	}
	cNames.sort();
	return cNames;
};

ColumnCollection.prototype.getColumns = function(){
	return [].concat(this._columns);
};

ColumnCollection.prototype.getReferenceableColumns = function(){
	var columns = [];
	for(var i = 0, n = this._columns.length; i < n; i++){
		if(this._columns[i].isPrimaryKey() || this._columns[i].isUniqueKey()){
			columns.push(this._columns[i]);
		}
	}
	return columns;
};

ColumnCollection.prototype.getReferenceableColumnNames = function(){
	var columns = this.getReferenceableColumns();
	var cNames = [];
	for(var i = 0, n = columns.length; i < n; i++){
		cNames.push(columns[i].getName());
	}
	return cNames;
};

ColumnCollection.prototype.moveColumn = function(column, dir){
	var aux;
	var columns = this._columns;
	var index = $.inArray(column, columns);
	if(index == -1) return false;
	var ret = false;
	
	if(index > 0 && dir == 'up'){
		columns[index] = columns[index - 1];
		columns[index - 1] = column;
		column.move(dir);
		ret = true;
	} else if(index < columns.length - 1 && dir == 'down'){
		columns[index] = columns[index + 1];
		columns[index + 1] = column;
		column.move(dir);
		ret = true;
	}
	
	return ret;
};

ColumnCollection.prototype.columnNameExists = function(name, columnModel){
	var columnWithSameName = this.getColumnByName(name);
	if(columnWithSameName != null && columnWithSameName.getModel() != columnModel) return true;
	return false;
};