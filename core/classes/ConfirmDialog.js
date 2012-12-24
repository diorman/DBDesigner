ConfirmDialog = function(){
	this.setUI(new ConfirmDialogUI(this));
};
$.extend(ConfirmDialog.prototype, Component);

ConfirmDialog.prototype.show = function(message, title, callback){
	this.setCallback(callback);
	this.getUI().show(message, title);
};

ConfirmDialog.prototype.setCallback = function(callback){
	if(callback == null) this._callback = null;
	else{
		this._callback = {
			scope: callback.scope,
			method: callback.method,
			params: callback.params
		};
	}
};

ConfirmDialog.prototype.getCallback = function(){
	if(typeof this._callback == 'undefined') return null;
	return this._callback;
};

ConfirmDialog.prototype.executeCallback = function(){
	var callback = this.getCallback();
	if(callback != null){
		if(!$.isArray(callback.params)) callback.params = [];
		callback.method.apply(callback.scope, callback.params);
	}
};

ConfirmDialog.prototype.clearReferences = function(){
	this.setCallback(null);
};

// *****************************************************************************

ConfirmDialogUI = function(controller){
	this.setTemplateID('ConfirmDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};
$.extend(ConfirmDialogUI.prototype, ComponentUI);

ConfirmDialogUI.prototype.show = function(message, title){
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

ConfirmDialogUI.prototype.close = function(){
	this.getDom().dialog('close');
};

ConfirmDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.bind('dialogclose', $.proxy(this.onDialogClose, this));
	dom.find('input').click($.proxy(this.onButtonClick, this));
};

ConfirmDialogUI.prototype.onButtonClick = function(event){
	if(event.target.id == 'confirm-dialog_yes'){
		this.getController().executeCallback();
	}
	this.getDom().dialog('close');
};

ConfirmDialogUI.prototype.onDialogClose = function(event){
	this.getController().clearReferences();
};

