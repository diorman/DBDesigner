
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
		foreignKey.bind(DBObject.Event.DBOBJECT_DROPPED, this.onForeignKeyDropped, this);
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

ForeignKeyCollection.prototype.onForeignKeyDropped = function(event){
	this.remove(event.sender);
};

ForeignKeyCollection.prototype.remove = function(foreignKey){
	var index = $.inArray(foreignKey, this._foreignKeys);
	this._foreignKeys.splice(index);
	foreignKey.unbind(ForeignKey.Event.ALTER_REQUEST, this.alterForeignKey, this);
	foreignKey.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onForeignKeyAltered, this);
	foreignKey.unbind(DBObject.Event.DBOBJECT_DROPPED, this.onForeignKeyDropped, this);
	this.trigger(Collection.Event.COLLECTION_CHANGED, {foreignKeyDropped: foreignKey});
};

ForeignKeyCollection.prototype.serialize = function() {
	var foreignKeys = this.getForeignKeys();
	var collection = [];
	for(var i = 0; i < foreignKeys.length; i++) {
		collection.push(foreignKeys[i].serialize());
	}
	return collection;
};

ForeignKeyCollection.prototype.loadJSON = function(json, parent) {
	var referencedTable;
	var tableCollection = DBDesigner.app.getTableCollection();
	for(var i = 0; i < json.length; i++) {
		referencedTable = tableCollection.getTableByName(json[i].referencedTable);
		if(referencedTable != null){
			this.add(ForeignKey.createFromJSON(json[i], parent, referencedTable));
		}
	}
};