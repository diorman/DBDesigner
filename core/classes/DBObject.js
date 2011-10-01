DBObject = {
	setName: function(name){
		var oldName = this.getName();
		if(oldName != name){
			this._name = name;
			this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property:'name', oldValue:oldName, newValue: name});
		}
	},
	getName: function(){
		if(typeof this._name == 'undefined') this._name = '';
		return this._name;
	},
	setComment: function(comment){
		var oldComment = this.getComment();
		if(oldComment != comment){
			this._comment = comment;
			this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property:'comment', oldValue:oldComment, newValue: comment});
		}
	},
	getComment: function(){
		if(typeof this._comment == 'undefined') this._comment = '';
		return this._comment;
	}
};

$.extend(DBObject, EventDispatcher);

