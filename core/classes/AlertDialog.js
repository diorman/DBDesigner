AlertDialog = function(){
	this.setUI(new AlertDialogUI(this));
};
$.extend(AlertDialog.prototype, Component);

AlertDialog.prototype.show = function(message, title, callback){
	this.setCallback(callback);
	this.getUI().show(message, title);
};

AlertDialog.prototype.setCallback = function(callback){
	if(callback == null) this._callback = null;
	else{
		this._callback = {
			scope: callback.scope,
			method: callback.method,
			params: callback.params
		};
	}
};

AlertDialog.prototype.getCallback = function(){
	if(typeof this._callback == 'undefined') return null;
	return this._callback;
};

AlertDialog.prototype.executeCallback = function(){
	var callback = this.getCallback();
	if(callback != null){
		if(!$.isArray(callback.params)) callback.params = [];
		callback.method.apply(callback.scope, callback.params);
	}
};

AlertDialog.prototype.clearReferences = function(){
	this.setCallback(null);
};

// *****************************************************************************

AlertDialogUI = function(controller){
	this.setTemplateID('AlertDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, resizable: false, width: 'auto'});
};
$.extend(AlertDialogUI.prototype, ComponentUI);

AlertDialogUI.prototype.show = function(message, title){
	var dom = this.getDom();
	var paragraphs = message.split('\n');
	var $html = $();
	for(var i = 0; i < paragraphs.length; i++){
		$html = $html.add($('<p></p>').text(paragraphs[i]));
	}
	dom.find('div.content').html($html);
	dom.dialog('option','title', title);
	dom.dialog('open');
};

AlertDialogUI.prototype.close = function(){
	this.getDom().dialog('close');
};

AlertDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.bind('dialogclose', $.proxy(this.onDialogClose, this));
	dom.find('input').click($.proxy(this.onButtonClick, this));
};

AlertDialogUI.prototype.onButtonClick = function(event){
	this.getController().executeCallback();
	this.getDom().dialog('close');
};

AlertDialogUI.prototype.onDialogClose = function(event){
	this.getController().clearReferences();
};

