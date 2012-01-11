DBObject = {
	startEditing: function(){
		this.getModel().startEditing();
	},
	stopEditing: function(){
		this.getModel().stopEditing();
	},
	setName: function(name){
		this.getModel().setName(name);
	},
	getName: function(){
		return this.getModel().getName();
	},
	setComment: function(comment){
		this.getModel().setComment(comment);
	},
	getComment: function(){
		return this.getModel().getComment();
	},
	modelChanged: function(eventProperty, func, prmts){
		var i, addFunc = true;
		var isEditing = this.getModel().isEditing();
		if(!$.isArray(this._uvf)) this._uvf = [];
		if(typeof eventProperty == 'undefined') eventProperty = 'stopEditing';
		if($.isFunction(func)){
			for(i = 0; i < this._uvf.length; i++){
				if(this._uvf[i].func == func) {
					addFunc = false;
					break;
				}
			}
			if(addFunc === true) this._uvf.push({func: func, prmts: prmts});
		}else if(func === true) this._modelHasChanges = true;
		if(!isEditing){
			var ui = this.getUI();
			this._modelHasChanges = this._modelHasChanges || (this._uvf.length > 0);
			for(i = 0; i < this._uvf.length; i++) this._uvf[i].func.apply(ui, this._uvf[i].prmts);
			this._uvf = [];
			if(this._modelHasChanges === true) {
				this.trigger(DBObject.Event.DBOBJECT_ALTERED, {property: eventProperty});
				this._modelHasChanges = false;
			}
		}
	}
};
$.extend(DBObject, Component);

DBObjectModel = {
	isEditing: function(){
		if(typeof this._editing == 'undefined') this._editing = false;
		return this._editing;
	},
	startEditing: function(){
		this._editing = true;
	},
	stopEditing: function(){
		this._editing = false;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property:'stopEditing'});
	},
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
	},
	setFlagState: function(flag, state){
		var flags = this.getFlags();
		var flagIsOn = (flags & flag) != 0;
		if(flagIsOn ^ state){
			this._flags = state? flags | flag : flags ^ flag; 
			this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'flags', newValue: this._flags, oldValue: flags});
		}
	},
	setFlags: function(flags){
		var oldValue = this.getFlags();
		if(oldValue != flags){
			this._flags = flags;
			this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'flags', newValue: flags, oldValue: oldValue});
		}
	},
	getFlags: function(){
		if(typeof this._flags == 'undefined') this._flags = 0;
		return this._flags;
	}
};

$.extend(DBObjectModel, EventDispatcher);

