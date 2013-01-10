ForwardEngineerDialog = function(){
	this.setUI(new ForwardEngineerDialogUI(this));
};
$.extend(ForwardEngineerDialog.prototype, Component);

ForwardEngineerDialog.prototype.open = function(){
	this.getUI().open();
};

// *****************************************************************************

ForwardEngineerDialogUI = function(controller){
	this.setTemplateID('ForwardEngineerDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({
		title: DBDesigner.lang.strforwardengineer,
		modal: true,
		autoOpen: false,
		resizable: false,
		width: 'auto'
	});
};
$.extend(ForwardEngineerDialogUI.prototype, ComponentUI);

ForwardEngineerDialogUI.prototype.open = function(message, title){
	var dom = this.getDom();
	dom.removeClass('show-output');
	dom.find('textarea').val('');
	dom.find('input[type="checkbox"]').prop('checked', false);
	dom.find('#fordwardengineer-dialog_cascadeprmt').prop('disabled', true);
	dom.dialog('open');
};

ForwardEngineerDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.on('click', 'input[type="button"]', $.proxy(this.onButtonClick, this));
	dom.find('#fordwardengineer-dialog_dropstmt').click(function(event){
		dom.find('#fordwardengineer-dialog_cascadeprmt')
			.prop({checked: this.checked, disabled: !this.checked });
	});
};

ForwardEngineerDialogUI.prototype.onButtonClick = function(event){
	switch(event.target.id) {
		case 'forwardengineer-dialog_show-output':
			this.getDom().addClass('show-output');
			break;
		case 'forwardengineer-dialog_hide-output':
			this.getDom().removeClass('show-output');
			break;
	}
};