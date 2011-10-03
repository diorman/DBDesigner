
TableDialog = function() {	
	this.setModel(new TableDialogModel());
	this.setUI(new TableDialogUI(this));
};

$.extend(TableDialog.prototype, Component);

TableDialog.prototype.createTable = function(position){
	var tableModel = new TableModel();
	var model = this.getModel();
	tableModel.setPosition(position);
	model.setTableModel(tableModel);
	model.setAction(DBDesigner.Action.ADD_TABLE);
	this.getUI().open(DBDesigner.lang.strcreatetable);
};

TableDialog.prototype.editTable = function(table){
	var model = this.getModel();
	model.setTableModel(table.getModel());
	model.setAction(DBDesigner.Action.EDIT_TABLE);
	this.getUI().open(DBDesigner.lang.straltertable);
};

TableDialog.prototype.saveTable = function(form){
	var model = this.getModel();
	var tableModel = model.getTableModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		tableModel.setName(form.name);
		tableModel.setWithoutOIDS(form.withoutOIDS);
		tableModel.setComment(form.comment);
		
		if(action == DBDesigner.Action.ADD_TABLE){
			DBDesigner.app.tableCollection.add(new Table(tableModel));
		}
		
		this.getUI().close();
	}
};

TableDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	if(form.name == '') {
		ui.showError(DBDesigner.lang.strtableneedsname);
		isValid = false;
	}
	var tableWithSameName = DBDesigner.app.tableCollection.getTableByName(form.name);
	if(tableWithSameName != null && tableWithSameName.getModel() != this.getTableModel()){
		ui.showError(DBDesigner.lang.strtableexists);
		isValid = false;
	}
	
	return isValid;
}

TableDialog.prototype.getTableModel = function(){
	return this.getModel().getTableModel();
};

// *****************************************************************************

TableDialogModel = function() {
	
};

$.extend(TableDialogModel.prototype, EventDispatcher);

TableDialogModel.prototype.setTableModel = function(tableModel){
	this._tableModel = tableModel;
};

TableDialogModel.prototype.getTableModel = function(){
	if(typeof this._tableModel == 'undefined') this._tableModel = null;
	return this._tableModel;
};

TableDialogModel.prototype.setAction = function(action){
	this._action = action;
};

TableDialogModel.prototype.getAction = function(){
	if(typeof this._action == 'undefined') this._action = DBDesigner.Action.ADD_TABLE;
	return this._action;
};




// *****************************************************************************

TableDialogUI = function(controller) {
	this.setTemplateID('TableDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};

$.extend(TableDialogUI.prototype, ComponentUI);

TableDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('#table-dialog_cancel').click($.proxy(this.close, this));
	dom.find('#table-dialog_save').click($.proxy(this.save, this));
};


TableDialogUI.prototype.open = function(title){
	var tableModel = this.getController().getTableModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(tableModel != null){
		$('#table-dialog_table-name').val(tableModel.getName());
		$('#table-dialog_withoutoids').prop('checked', tableModel.getWithoutOIDS());
		$('#table-dialog_table-comment').val(tableModel.getComment());
		dom.dialog('open').dialog('option', 'title', title);
		window.setTimeout(function(){dom.find('.focusable').focus()}, 200);
	}
};

TableDialogUI.prototype.close = function(){
	this.getDom().dialog('close');
};

TableDialogUI.prototype.save = function(){
	this.cleanErrors();
	
	var form = {
		name: $.trim($('#table-dialog_table-name').val()),
		withoutOIDS: $('#table-dialog_withoutoids').prop('checked'),
		comment: $.trim($('#table-dialog_table-comment').val())
	};
	this.getController().saveTable(form);
};

TableDialogUI.prototype.showError = function(message){
	$('<li></li>').text(message).appendTo(this.getDom().find('ul.error-list').show());
};

TableDialogUI.prototype.cleanErrors = function(){
	this.getDom().find('ul.error-list').empty().hide();
};