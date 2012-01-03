
ColumnCollection = function(){
	this._columns = [];
};

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
	}
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