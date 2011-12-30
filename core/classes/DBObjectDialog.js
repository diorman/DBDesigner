
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
		message = (typeof field == 'undefined')? message : field + ': ' + message;
		$('<li></li>').text(message).appendTo(this.getDom().find('ul.error-list').show());
	},
	
	close: function(){
		this.getDom().dialog('close');
	},
	focus: function (){
		var $focusable = this.find('.focusable');
		window.setTimeout(function(){$focusable.focus()}, 200);
	},
	setKeyPressEvent: function(){
		//console.log(event);
		var _this = this;
		this.getDom().keypress(function(event){
			var $eventTarget = $(event.target);
			if(event.charCode == 13 && $eventTarget.is('input') && !$eventTarget.is('input[type="button"]')){
				_this.save();
			}
		});
	}
};
$.extend(DBObjectDialogUI, ComponentUI);

