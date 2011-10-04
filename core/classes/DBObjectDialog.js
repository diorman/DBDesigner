
DBObjectDialog = {
	getDBObjectModel: function(){
		return this.getModel().getDBObjectModel();
	}
}
$.extend(DBObjectDialog, Component);

DBObjectDialogModel = {
	setAction: function(action){
		this._action = action;
	},
	getAction: function(){
		if(typeof this._action == 'undefined') this._action = null;
		return this._action;
	},
	setDBObjectModel: function(dbObjectModel){
		this._dbObjectModel = dbObjectModel;
	},
	getDBObjectModel: function(){
		if(typeof this._dbObjectModel == 'undefined') this._dbObjectModel = null;
		return this._dbObjectModel;
	}
};
$.extend(DBObjectDialogModel, EventDispatcher);



DBObjectDialogUI = {
	cleanErrors: function(){
		this.getDom().find('ul.error-list').empty().hide();
	},
	
	showError: function(message, field){
		$('<li></li>').text(field + ': ' + message).appendTo(this.getDom().find('ul.error-list').show());
	},
	
	close: function(){
		this.getDom().dialog('close');
	},
	focus: function (){
		var $focusable = this.find('.focusable');
		window.setTimeout(function(){$focusable.focus()}, 200);
	}
};
$.extend(DBObjectDialogUI, ComponentUI);

