UniqueKeyCollection = function(){
	this._uniqueKeys = [];
};

$.extend(UniqueKeyCollection.prototype, EventDispatcher);

UniqueKeyCollection.prototype.getUniqueKeyByName = function(name){
	for(var i = 0, n = this._uniqueKeys.length; i < n; i++){
		if(this._uniqueKeys[i].getName() == name) return this._uniqueKeys[i];
	}
	return null;
};

UniqueKeyCollection.prototype.add = function(uniqueKey){
	if($.inArray(uniqueKey, this._uniqueKeys) == -1){
		this._uniqueKeys.push(uniqueKey);
		uniqueKey.bind(UniqueKey.Event.ALTER_REQUEST, this.alterUniqueKey, this);
		uniqueKey.bind(DBObject.Event.DBOBJECT_ALTERED, this.onUniqueKeyAltered, this);
		this.trigger(Collection.Event.COLLECTION_CHANGED, {uniqueKeyAdded: uniqueKey});
	}
};

UniqueKeyCollection.prototype.getUniqueKeys = function(){
	return [].concat(this._uniqueKeys);
};

UniqueKeyCollection.prototype.onUniqueKeyAltered = function(event){
	this.trigger(Collection.Event.COLLECTION_CHANGED, {uniqueKeyAltered: event.sender});
};

UniqueKeyCollection.prototype.alterUniqueKey = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_UNIQUEKEY, event.sender);
};