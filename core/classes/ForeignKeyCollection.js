
ForeignKeyCollection = function(){
	this._foreignKeys = [];
};

ForeignKeyCollection.prototype.getForeignKeyByName = function(name){
	for(var i = 0, n = this._foreignKeys.length; i < n; i++){
		if(this._foreignKeys[i].getName() == name) return this._foreignKeys[i];
	}
	return null;
};

ForeignKeyCollection.prototype.add = function(foreignKey){
	if($.inArray(foreignKey, this._foreignKeys) == -1){
		this._foreignKeys.push(foreignKey);
		foreignKey.bind(ForeignKey.Event.ALTER_FOREIGNKEY, this.alterForeignKey, this);
		//column.bind(Column.Event.COLUMN_CHANGED, this.columnChanged, this);
	}
};

ForeignKeyCollection.prototype.alterForeignKey = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_FOREIGNKEY, event.sender);
};
/*
ForeignKeyCollection.prototype.alterColumn = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_COLUMN, event.column);
};
*/
/*
ForeignKeyCollection.prototype.columnChanged = function(event){
	event.column.getParent().refresh();
};
*/