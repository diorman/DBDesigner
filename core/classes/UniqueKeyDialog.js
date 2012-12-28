
UniqueKeyDialog = function() {	
	this.setModel(new UniqueKeyDialogModel());
	this.setUI(new UniqueKeyDialogUI(this));
};

$.extend(UniqueKeyDialog.prototype, DBObjectDialog);

UniqueKeyDialog.prototype.createUniqueKey = function(table){
	var model = this.getModel();
	var uniqueKeyModel = new UniqueKeyModel;
	uniqueKeyModel.setParent(table);
	model.setAction(DBDesigner.Action.ADD_UNIQUEKEY);
	model.setDBObjectModel(uniqueKeyModel);
	this.getUI().open(DBDesigner.lang.stradduniq);
};

UniqueKeyDialog.prototype.editUniqueKey = function(uniqueKey){
	var model = this.getModel();
	model.setAction(DBDesigner.Action.ALTER_UNIQUEKEY);
	model.setDBObjectModel(uniqueKey.getModel());
	this.getUI().open(DBDesigner.lang.stralteruniq);
};

UniqueKeyDialog.prototype.saveUniqueKey = function(form){
	var model = this.getModel();
	var uniqueKeyModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		if(action == DBDesigner.Action.ALTER_UNIQUEKEY) uniqueKeyModel.startEditing();
		uniqueKeyModel.setColumns(form.columns);
		uniqueKeyModel.setComment(form.comment);
		if(form.name == '') uniqueKeyModel.chooseName();
		else uniqueKeyModel.setName(form.name);
		
		if(action == DBDesigner.Action.ADD_UNIQUEKEY){
			uniqueKeyModel.getParent().getUniqueKeyCollection().add(new UniqueKey(uniqueKeyModel));
		}
		else uniqueKeyModel.stopEditing();
		return true;
	}
	return false;
};

UniqueKeyDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var uniqueKeyModel = this.getDBObjectModel();

	if(form.name != '' && ConstraintHelper.constraintNameExists(form.name, uniqueKeyModel)){
		ui.showError(DBDesigner.lang.strconstraintexists, DBDesigner.lang.strname);
		isValid = false;
	}
	
	if(form.columns.length == 0){
		ui.showError(DBDesigner.lang.struniqneedscols, DBDesigner.lang.strcolumns);
		isValid = false;
	}
	return isValid;
};

UniqueKeyDialog.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'selectedColumns':
			ui.updateSelectedColumns(event.selectedColumns);
			ui.updateTableColumns();
			break;
	}
};

UniqueKeyDialog.prototype.getSelectedColumns = function(){
	return this.getModel().getSelectedColumns();
};

UniqueKeyDialog.prototype.setSelectedColumns = function(columns){
	this.getModel().setSelectedColumns(columns);
};

UniqueKeyDialog.prototype.getTableColumns = function(){
	return this.getModel().getTableColumns();
};

UniqueKeyDialog.prototype.addColumns = function(columns){
	this.getModel().addColumns(columns);
};

UniqueKeyDialog.prototype.removeColumns = function(columns){
	this.getModel().removeColumns(columns);
};

UniqueKeyDialog.prototype.clearReferences = function(){
	var model = this.getModel();
	model.setSelectedColumns(null);
};

// *****************************************************************************

UniqueKeyDialogModel = function() {
	
};
$.extend(UniqueKeyDialogModel.prototype, DBObjectDialogModel);

UniqueKeyDialogModel.prototype.getSelectedColumns = function(){
	if(typeof this._selectedColumns == 'undefined') this._selectedColumns = [];
	return this._selectedColumns;
};

UniqueKeyDialogModel.prototype.setSelectedColumns = function(selectedColumns){
	this._selectedColumns = selectedColumns;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: this._selectedColumns});
};

UniqueKeyDialogModel.prototype.addColumns = function(columns){
	var tableColumns = this.getTableColumns();
	var selectedColumns = this.getSelectedColumns();
	var column;
	var j;
	var throwEvent = false;
	for (var i = 0; i < columns.length; i++){
		for (j = 0; j < tableColumns.length; j++){
			if(tableColumns[j].getName() == columns[i]){
				selectedColumns.push(tableColumns[j]);
				throwEvent = true;
				break;
			}
		}
	}
	if(throwEvent)
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: this._selectedColumns});
};

UniqueKeyDialogModel.prototype.removeColumns = function(columns){
	var selectedColumns = this.getSelectedColumns();
	var column;
	var j;
	var throwEvent = false;
	for (var i = 0; i < columns.length; i++){
		for (j = 0; j < selectedColumns.length; j++){
			if(selectedColumns[j].getName() == columns[i]){
				selectedColumns.splice(j, 1);
				throwEvent = true;
				break;
			}
		}
	}
	if(throwEvent)
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: this._selectedColumns});
};

UniqueKeyDialogModel.prototype.getTableColumns = function(){
	var retColumns = [];
	var dbobjectModel = this.getDBObjectModel();
	if(dbobjectModel != null){
		var selectedColumns = this.getSelectedColumns();
		var allColumns = dbobjectModel.getParent().getColumnCollection().getColumns();
		for(var i = 0; i < allColumns.length; i++){
			if($.inArray(allColumns[i], selectedColumns) == -1){
				retColumns.push(allColumns[i]);
			}
		}
	}
	return retColumns;
};


// *****************************************************************************

UniqueKeyDialogUI = function(controller) {
	this.setTemplateID('UniqueKeyDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};

$.extend(UniqueKeyDialogUI.prototype, DBObjectDialogUI);

UniqueKeyDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('input.update-columns').click($.proxy(this.updateColumns, this));
	dom.find('div.submit-buttons').on('click', 'input', $.proxy(this.submitButtonClicked, this));
	this.setDialogCloseEvent();
	this.setKeyPressEvent();
};


UniqueKeyDialogUI.prototype.open = function(title){
	var uniqueKeyModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(uniqueKeyModel != null){
		$('#uniquekey-dialog_table-name').val(uniqueKeyModel.getName());
		$('#uniquekey-dialog_uniquekey-comment').val(uniqueKeyModel.getComment());
		this.getController().setSelectedColumns(uniqueKeyModel.getColumns());
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
};

UniqueKeyDialogUI.prototype.save = function(closeWindow){
	closeWindow = (typeof closeWindow == 'undefined')? true : closeWindow;
	this.cleanErrors();
	
	var form = {
		name: $.trim($('#uniquekey-dialog_table-name').val()),
		comment: $.trim($('#uniquekey-dialog_uniquekey-comment').val()),
		columns: this.getController().getSelectedColumns()
	};
	var saveSuccess = this.getController().saveUniqueKey(form);
	if(saveSuccess && closeWindow) this.close();
	return saveSuccess;
};

UniqueKeyDialogUI.prototype.updateSelectedColumns = function(){
	this.updateSelect(this.getController().getSelectedColumns(), '#uniquekey-dialog_selected-columns');
};

UniqueKeyDialogUI.prototype.updateTableColumns = function(){
	this.updateSelect(this.getController().getTableColumns(), '#uniquekey-dialog_available-columns');
};

UniqueKeyDialogUI.prototype.updateSelect = function(columns, selectSelector){
	var $options = $();
	var $option;
	var columnName;
	if($.isArray(columns) && columns.length > 0){
		for(var i = 0; i < columns.length; i++){
			columnName = columns[i].getName();
			$option = $('<option></option>').val(columnName).text(columnName);
			$options = $options.add($option);
		}
		$(selectSelector).html($options);
	}
	else $(selectSelector).empty();
};

UniqueKeyDialogUI.prototype.updateColumns = function(event){
	var columns;
	if(event.target.id == 'uniquekey-dialog_add-columns'){
		columns = $('#uniquekey-dialog_available-columns').val();
		if($.isArray(columns)) this.getController().addColumns(columns);
	} else if(event.target.id == 'uniquekey-dialog_remove-columns'){
		columns = $('#uniquekey-dialog_selected-columns').val();
		if($.isArray(columns)) this.getController().removeColumns(columns);
	}
};

UniqueKeyDialogUI.prototype.submitButtonClicked = function(event){
	if(event.target.id == 'uniquekey-dialog_cancel') {this.close();}
	else{
		var saveSuccess = this.save(false);
		if(event.target.id == 'uniquekey-dialog_save' && saveSuccess) {this.close();}
		else if(event.target.id == 'uniquekey-dialog_save2' && saveSuccess) {
			var controller = this.getController();
			var table = controller.getModel().getDBObjectModel().getParent();
			controller.createUniqueKey(table);
		}
	}
};
