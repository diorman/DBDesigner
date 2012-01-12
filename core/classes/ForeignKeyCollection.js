
ForeignKeyCollection = function(){
	this._foreignKeys = [];
};

$.extend(ForeignKeyCollection.prototype, EventDispatcher);

ForeignKeyCollection.prototype.getForeignKeyByName = function(name){
	for(var i = 0, n = this._foreignKeys.length; i < n; i++){
		if(this._foreignKeys[i].getName() == name) return this._foreignKeys[i];
	}
	return null;
};

ForeignKeyCollection.prototype.add = function(foreignKey){
	if($.inArray(foreignKey, this._foreignKeys) == -1){
		this._foreignKeys.push(foreignKey);
		foreignKey.bind(ForeignKey.Event.ALTER_REQUEST, this.alterForeignKey, this);
		foreignKey.bind(DBObject.Event.DBOBJECT_ALTERED, this.onForeignKeyAltered, this);
		this.trigger(Collection.Event.COLLECTION_CHANGED, {foreignKeyAdded: foreignKey});
	}
};

ForeignKeyCollection.prototype.alterForeignKey = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_FOREIGNKEY, event.sender);
};

ForeignKeyCollection.prototype.getForeignKeys = function(){
	return [].concat(this._foreignKeys);
};

ForeignKeyCollection.prototype.onForeignKeyAltered = function(event){
	this.trigger(Collection.Event.COLLECTION_CHANGED, {foreignKeyAltered: event.sender});
};