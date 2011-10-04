
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
		column.bind(Column.Event.ALTER_COLUMN, this.alterColumn, this);
		column.bind(Column.Event.COLUMN_CHANGED, this.columnChanged, this);
	}
};

ColumnCollection.prototype.alterColumn = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_COLUMN, event.column);
};

ColumnCollection.prototype.columnChanged = function(event){
	event.column.getParent().refresh();
};
