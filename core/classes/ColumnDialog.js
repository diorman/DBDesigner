
ColumnDialog = function() {	
	this.setModel(new ColumnDialogModel());
	this.setUI(new ColumnDialogUI(this));
};

$.extend(ColumnDialog.prototype, DBObjectDialog);

ColumnDialog.prototype.createColumn = function(table){
	var model = this.getModel();
	var columnModel = new ColumnModel();
	columnModel.setParent(table);
	model.setAction(DBDesigner.Action.ADD_COLUMN);
	model.setDBObjectModel(columnModel);
	this.getUI().open(DBDesigner.lang.straddcolumn);
};

ColumnDialog.prototype.editColumn = function(column){
	var model = this.getModel();
	model.setAction(DBDesigner.Action.ALTER_COLUMN);
	model.setDBObjectModel(column.getModel());
	this.getUI().open(DBDesigner.lang.straltercolumn);
};

ColumnDialog.prototype.saveColumn = function(form){
	var model = this.getModel();
	var columnModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){

		if(action == DBDesigner.Action.ALTER_COLUMN) columnModel.startEditing();
		
		columnModel.setName(form.name);
		columnModel.setType(form.type);
		columnModel.setLength(form.length);
		columnModel.setDefault(form.def);
		columnModel.setComment(form.comment);
		columnModel.setColumnFlags({
			array: form.isArray,
			primaryKey: form.isPrimaryKey,
			uniqueKey: columnModel.isUniqueKey(),
			notNull: form.isNotNull,
			foreignKey: columnModel.isForeignKey()
		});
		
		
		if(action == DBDesigner.Action.ADD_COLUMN){
			var column = new Column(columnModel);
			columnModel.getParent().getColumnCollection().add(column);
		}
		else columnModel.stopEditing();
		return true;
	}
	return false;
};

ColumnDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var lowType = form.type.toLowerCase();
	var columnModel = this.getModel().getDBObjectModel();
	var columnCollection = columnModel.getParent().getColumnCollection();

	if(form.name == ''){
		ui.showError(DBDesigner.lang.strcolneedsname, DBDesigner.lang.strname);
		isValid = false;
	}
	else if(columnCollection.columnNameExists(form.name, columnModel)){
		ui.showError(DBDesigner.lang.strcolexists, DBDesigner.lang.strname);
		isValid = false;
	}
	if((lowType == 'numeric' && !/^(\d+(,\d+)?)?$/.test(form.length)) || (lowType != 'numeric' && !/^\d*$/.test(form.length))){
		ui.showError(DBDesigner.lang.strbadinteger, DBDesigner.lang.strlength);
		isValid = false;
	}
	else if(/^d+$/.test(form.length)) {
		//Remove left side 0's
		form.length = parseInt(form.length) + '';
		//add scale of 0
		if(lowType == 'numeric') form.length += ',0';
	}
	else if(lowType == 'numeric' && /^\d+,\d+$/.test(form.length)){
		var splitted = form.length.split(',');
		var precision = parseInt(splitted[0]);
		var scale = parseInt(splitted[1]);
		if(scale > precision){
			ui.showError(DBDesigner.lang.strbadnumericlength.replace('%d', scale).replace('%d', precision), DBDesigner.lang.strlength);
			isValid = false;
		}
		form.length = precision + ',' + scale;
	}
	return isValid;
}

// *****************************************************************************

ColumnDialogModel = function() {};

$.extend(ColumnDialogModel.prototype, DBObjectDialogModel);



// *****************************************************************************

ColumnDialogUI = function(controller) {
	this.setTemplateID('ColumnDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};

$.extend(ColumnDialogUI.prototype, DBObjectDialogUI);

ColumnDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('div.submit-buttons').on('click', 'input', $.proxy(this.submitButtonClicked, this));
	dom.find('#column-dialog_column-type').change($.proxy(this.dataTypeChanged, this));
	this.setDialogCloseEvent();
	this.setKeyPressEvent();
};


ColumnDialogUI.prototype.open = function(title){
	
	var columnModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(columnModel != null){
		$('#column-dialog_column-type').val(columnModel.getType()).prop('disabled', false).trigger('change');
		$('#column-dialog_column-name').val(columnModel.getName());
		$('#column-dialog_column-length').val(columnModel.getLength());
		$('#column-dialog_column-comment').val(columnModel.getComment());
		$('#column-dialog_column-array').prop({checked: columnModel.isArray(), disabled: false});
		$('#column-dialog_column-primarykey').prop('checked', columnModel.isPrimaryKey());
		$('#column-dialog_column-notnull').prop('checked', columnModel.isNotNull());
		$('#column-dialog_column-default').val(columnModel.getDefault());
		
		if(columnModel.isForeignKey()){
			$('#column-dialog_column-type').prop('disabled', true);
			$('#column-dialog_column-array').prop('disabled', true);
			$('#column-dialog_column-length').prop('disabled', true);
		}
		
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
	
};

ColumnDialogUI.prototype.submitButtonClicked = function(event){
	if(event.target.id == 'column-dialog_cancel') {this.close();}
	else{
		var saveSuccess = this.save(false);
		if(event.target.id == 'column-dialog_save' && saveSuccess) {this.close();}
		else if(event.target.id == 'column-dialog_save2' && saveSuccess) {
			var controller = this.getController();
			var table = controller.getModel().getDBObjectModel().getParent();
			controller.createColumn(table);
		}
	}
};

ColumnDialogUI.prototype.save = function(closeWindow){
	closeWindow = (typeof closeWindow == 'undefined')? true : closeWindow;
	this.cleanErrors();
	var form = {
		name: $.trim($('#column-dialog_column-name').val()),
		type: $.trim($('#column-dialog_column-type').val()),
		isArray: $('#column-dialog_column-array').prop('checked'),
		isPrimaryKey: $('#column-dialog_column-primarykey').prop('checked'),
		isNotNull: $('#column-dialog_column-notnull').prop('checked'),
		def: $.trim($('#column-dialog_column-default').val()),
		comment: $.trim($('#column-dialog_column-comment').val())
	};
	form.length = (this.typeHasPredefinedSize(form.type))? '': $.trim($('#column-dialog_column-length').val()).replace(/\s+/g, '');
	var saveSuccess = this.getController().saveColumn(form);
	if(saveSuccess && closeWindow) this.close();
	return saveSuccess;
};

ColumnDialogUI.prototype.dataTypeChanged = function(event){
	var sizePredefined = this.typeHasPredefinedSize($(event.currentTarget).val());
	var $input = $('#column-dialog_column-length').prop('disabled', sizePredefined);
	if(sizePredefined) $input.val('');
};

ColumnDialogUI.prototype.typeHasPredefinedSize = function(type){
	for(var i = 0, n = DBDesigner.dataTypes.length; i < n; i++){
		if(DBDesigner.dataTypes[i].typedef == type){
			return DBDesigner.dataTypes[i].size_predefined;
		}
	}
	return false;
};