
TableDialog = function() {	
	this.setModel(new TableDialogModel());
	this.setUI(new TableDialogUI(this));
};

$.extend(TableDialog.prototype, DBObjectDialog);

TableDialog.prototype.createTable = function(position){
	var tableModel = new TableModel();
	var model = this.getModel();
	tableModel.setPosition(position);
	model.setDBObjectModel(tableModel);
	model.setAction(DBDesigner.Action.ADD_TABLE);
	this.getUI().open(DBDesigner.lang.strcreatetable);
};

TableDialog.prototype.editTable = function(table){
	var model = this.getModel();
	model.setDBObjectModel(table.getModel());
	model.setAction(DBDesigner.Action.ALTER_TABLE);
	this.getUI().open(DBDesigner.lang.straltertable);
};

TableDialog.prototype.saveTable = function(form){
	var model = this.getModel();
	var tableModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		if(action == DBDesigner.Action.ALTER_TABLE) tableModel.startEditing();
		
		tableModel.setName(form.name);
		tableModel.setWithoutOIDS(form.withoutOIDS);
		tableModel.setComment(form.comment);
		tableModel.setSelected(true);
		
		if(action == DBDesigner.Action.ADD_TABLE){
			var tableCollection = DBDesigner.app.getTableCollection();
			tableCollection.emptySelection();
			tableCollection.add(new Table(tableModel));
		}
		else tableModel.stopEditing();
		return true;
	}
	return false;
};

TableDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	if(form.name == '') {
		ui.showError(DBDesigner.lang.strtableneedsname, DBDesigner.lang.strname);
		isValid = false;
	}
	if(DBDesigner.app.getTableCollection().tableNameExists(form.name, this.getDBObjectModel())){
		ui.showError(DBDesigner.lang.strtableexists);
		isValid = false;
	}
	
	return isValid;
}

// *****************************************************************************

TableDialogModel = function() {
	
};

$.extend(TableDialogModel.prototype, DBObjectDialogModel);

// *****************************************************************************

TableDialogUI = function(controller) {
	this.setTemplateID('TableDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};

$.extend(TableDialogUI.prototype, DBObjectDialogUI);

TableDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('div.submit-buttons').on('click', 'input', $.proxy(this.submitButtonClicked, this));
	this.setDialogCloseEvent();
	this.setKeyPressEvent();
};


TableDialogUI.prototype.open = function(title){
	var tableModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(tableModel != null){
		$('#table-dialog_table-name').val(tableModel.getName());
		$('#table-dialog_withoutoids').prop('checked', tableModel.getWithoutOIDS());
		$('#table-dialog_table-comment').val(tableModel.getComment());
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
};

TableDialogUI.prototype.submitButtonClicked = function(event){
	if(event.target.id == 'table-dialog_cancel'){ this.close(); }
	else {
		var saveSuccess = this.save(false);
		if(event.target.id == 'table-dialog_save' && saveSuccess){ this.close(); }
		else if(event.target.id == 'table-dialog_save2' && saveSuccess){ 
			var controller = this.getController();
			var savedModel = controller.getModel().getDBObjectModel();
			var position = savedModel.getPosition();
			var size = savedModel.getSize();
			position.left += 10 + size.width;
			controller.createTable(position);
		}
	}
};

TableDialogUI.prototype.save = function(closeWindow){
	closeWindow = (typeof closeWindow == 'undefined')? true : closeWindow;
	this.cleanErrors();
	var form = {
		name: $.trim($('#table-dialog_table-name').val()),
		withoutOIDS: $('#table-dialog_withoutoids').prop('checked'),
		comment: $.trim($('#table-dialog_table-comment').val())
	};
	var saveSuccess = this.getController().saveTable(form);
	if(saveSuccess && closeWindow) this.close(); 
	return saveSuccess;
};