
ForeignKeyDialog = function() {	
	this.setModel(new ForeignKeyDialogModel());
	this.setUI(new ForeignKeyDialogUI(this));
};

$.extend(ForeignKeyDialog.prototype, DBObjectDialog);

ForeignKeyDialog.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'referencedTable':
			ui.updateForeignColumns();
			break;
		case 'selectedColumns':
			ui.updateSelectedColumns(event.selectedColumns);
			ui.updateLocalColumns();
			ui.updateForeignColumns();
			break;
	}
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, event);	
};

ForeignKeyDialog.prototype.createForeignKey= function(table){
	var model = this.getModel();
	var foreignKeyModel = new ForeignKeyModel();
	foreignKeyModel.setParent(table);
	model.setAction(DBDesigner.Action.ADD_FOREIGNKEY);
	model.setDBObjectModel(foreignKeyModel);
	this.getUI().open(DBDesigner.lang.straddfk);
};

ForeignKeyDialog.prototype.editForeignKey = function(foreignKey){
	var model = this.getModel();
	model.setAction(DBDesigner.Action.ALTER_FOREIGNKEY);
	model.setDBObjectModel(foreignKey.getModel());
	this.getUI().open(DBDesigner.lang.stralterforeignkey);
};

ForeignKeyDialog.prototype.saveForeignKey = function(form){
	var model = this.getModel();
	var foreignKeyModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		if(action == DBDesigner.Action.ALTER_FOREIGNKEY) foreignKeyModel.startEditing();
		
		foreignKeyModel.setComment(form.comment);
		foreignKeyModel.setForeignKeyFlags({
			deferrable: form.isDeferrable,
			deferred: form.isDeferred,
			matchFull: form.isMatchFull
		});
		foreignKeyModel.setDeleteAction(form.onDelete);
		foreignKeyModel.setUpdateAction(form.onUpdate);
		foreignKeyModel.setColumns(form.columns);
		foreignKeyModel.setReferencedTable(form.referencedTable);
		if(form.name == '') foreignKeyModel.chooseName();
		else foreignKeyModel.setName(form.name);
		
		if(action == DBDesigner.Action.ADD_FOREIGNKEY){
			var foreignKey = new ForeignKey(foreignKeyModel);
			foreignKeyModel.getParent().getForeignKeyCollection().add(foreignKey);
		} else foreignKeyModel.stopEditing();
		
		return true;
	}
	return false;
};

ForeignKeyDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var foreignKeyModel = this.getDBObjectModel();

	if(form.name != '' && ConstraintHelper.constraintNameExists(form.name, foreignKeyModel)){
		ui.showError(DBDesigner.lang.strconstraintexists, DBDesigner.lang.strname);
		isValid = false;
	}
	
	if(form.columns.length == 0){
		ui.showError(DBDesigner.lang.strfkneedscols, DBDesigner.lang.strcolumns);
		isValid = false;
	}
	return isValid;
};

ForeignKeyDialog.prototype.setReferencedTable = function(table){
	this.getModel().setReferencedTable(table);
};

ForeignKeyDialog.prototype.getReferencedTable = function(){
	return this.getModel().getReferencedTable();
};

ForeignKeyDialog.prototype.getLocalColumns = function(){
	return this.getModel().getLocalColumns();
};

ForeignKeyDialog.prototype.getForeignColumns = function(){
	return this.getModel().getForeignColumns();
};

ForeignKeyDialog.prototype.setSelectedColumns = function(selectedColumns){
	this.getModel().setSelectedColumns(selectedColumns);
};

ForeignKeyDialog.prototype.addSelectedColumns = function(localColumnName, referencedColumnName){
	this.getModel().addSelectedColumns(localColumnName, referencedColumnName);
};

ForeignKeyDialog.prototype.removeSelectedColumns = function(index){
	this.getModel().removeSelectedColumns(index);
};

ForeignKeyDialog.prototype.getSelectedColumns = function(){
	return this.getModel().getSelectedColumns();
};

ForeignKeyDialog.prototype.clearReferences = function(){
	var model = this.getModel();
	model.setSelectedColumns(null);
	model.setReferencedTable(null);
};

// *****************************************************************************

ForeignKeyDialogModel = function() {
	
};

$.extend(ForeignKeyDialogModel.prototype, DBObjectDialogModel);

ForeignKeyDialogModel.prototype.setReferencedTable = function(table){
	this._referencedTable = table;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'referencedTable', newValue: table});
};

ForeignKeyDialogModel.prototype.getReferencedTable = function(){
	if(typeof this._referencedTable == 'undefined') this._referencedTable = null;
	return this._referencedTable;
};

ForeignKeyDialogModel.prototype.getLocalColumns = function(){
	var columns = [];
	var dbobject = this.getDBObjectModel();
	if(dbobject != null){
		var localColumns = dbobject.getParent().getColumnCollection().getColumns();
		var localSelectedColumns = this.getLocalSelectedColumns();
		for (var i = 0; i < localColumns.length; i++){
			if($.inArray(localColumns[i], localSelectedColumns) == -1){
				columns.push(localColumns[i]);
			}
		}
	}
	return columns;
};

ForeignKeyDialogModel.prototype.getForeignColumns = function(){
	var referencedTable = this.getReferencedTable();
	var columns = []
	if(referencedTable != null){
		var foreignSelectedColumns = this.getForeignSelectedColumns();
		var foreignColumns = referencedTable.getColumnCollection().getReferenceableColumns();
		for (var i = 0; i < foreignColumns.length; i++){
			if($.inArray(foreignColumns[i], foreignSelectedColumns) == -1){
				columns.push(foreignColumns[i]);
			}
		}
	}
	return columns;
};

ForeignKeyDialogModel.prototype.getLocalSelectedColumns = function(){
	var selectedColumns = this.getSelectedColumns();
	var columns = [];
	if($.isArray(selectedColumns)){
		for(var i = 0; i < selectedColumns.length; i++)
			columns.push(selectedColumns[i].localColumn);
	}
	return columns;
};

ForeignKeyDialogModel.prototype.getForeignSelectedColumns = function(){
	var selectedColumns = this.getSelectedColumns();
	var columns = [];
	if($.isArray(selectedColumns)){
		for(var i = 0; i < selectedColumns.length; i++)
			columns.push(selectedColumns[i].foreignColumn);
	}
	return columns;
};

ForeignKeyDialogModel.prototype.getSelectedColumns = function(){
	if(typeof this._selectedColumns == 'undefined') this._selectedColumns = [];
	return this._selectedColumns;
};

ForeignKeyDialogModel.prototype.setSelectedColumns = function(selectedColumns){
	this._selectedColumns = selectedColumns;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: this._selectedColumns});
};

ForeignKeyDialogModel.prototype.addSelectedColumns = function(localColumnName, referencedColumnName){
	var localColumn = this.getDBObjectModel().getParent().getColumnCollection().getColumnByName(localColumnName);
	var foreignColumn = this.getReferencedTable().getColumnCollection().getColumnByName(referencedColumnName);
	if(localColumn != null && foreignColumn != null){
		var selectedColumns = this.getSelectedColumns();
		selectedColumns.push({localColumn:localColumn, foreignColumn: foreignColumn});
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: selectedColumns});
	}
};

ForeignKeyDialogModel.prototype.removeSelectedColumns = function(index){
	var selectedColumns = this.getSelectedColumns();
	if(index >= 0 && index < selectedColumns.length){
		selectedColumns.splice(index, 1);
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: selectedColumns});
	}
};



// *****************************************************************************

ForeignKeyDialogUI = function(controller) {
	this.setTemplateID('ForeignKeyDialog');
	this.setController(controller);
	this.init();
	var dom = this.getDom();
	dom.appendTo('body').dialog({modal: true, autoOpen: false, resizable: false, width: 'auto'});
	dom.find('div.tabs').tabs();
};

$.extend(ForeignKeyDialogUI.prototype, DBObjectDialogUI);

ForeignKeyDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('div.submit-buttons').on('click', 'input', $.proxy(this.submitButtonClicked, this));
	dom.find('#foreignkey-dialog_foreignkey-references').change($.proxy(this.referencedTableChanged, this));
	dom.find('#foreignkey-dialog_foreignkey-deferrable').click(this.deferrableChange);
	dom.find('#foreignkey-dialog_addcolumns').click($.proxy(this.addSelectedColumns, this));
	dom.find('#foreignkey-dialog_columns-tab').on('click', 'a.remove', $.proxy(this.removeSelectedColumns, this));
	this.setKeyPressEvent();
	this.setDialogCloseEvent();
};


ForeignKeyDialogUI.prototype.open = function(title){
	
	var foreignKeyModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	var controller = this.getController();
	
	this.cleanErrors();
	
	if(foreignKeyModel != null){
		$('#foreignkey-dialog_foreignkey-name').val(foreignKeyModel.getName());
		$('#foreignkey-dialog_foreignkey-updateaction').val(foreignKeyModel.getUpdateAction());
		$('#foreignkey-dialog_foreignkey-deleteaction').val(foreignKeyModel.getDeleteAction());
		$('#foreignkey-dialog_foreignkey-matchfull').prop('checked', foreignKeyModel.isMatchFull());
		$('#foreignkey-dialog_foreignkey-deferrable').prop('checked', foreignKeyModel.isDeferrable());
		$('#foreignkey-dialog_foreignkey-comment').val(foreignKeyModel.getComment());
		
		if(foreignKeyModel.isDeferrable())$('#foreignkey-dialog_foreignkey-deferred').prop('checked', foreignKeyModel.isDeferred()).prop('disabled', false);
		else $('#foreignkey-dialog_foreignkey-deferred').prop('checked', false).prop('disabled', true);
		
		/** Update tables **/
		var tNames = DBDesigner.app.getTableCollection().getTableNames();
		var $options = $();
		var $option;
		var i = 0;
		var $referencedTable = $('#foreignkey-dialog_foreignkey-references');
		for (i = 0; i < tNames.length; i++){
			$option = $('<option></option>').attr('value', tNames[i]).text(tNames[i]);
			$options = $options.add($option);
		}
		if($options.length > 0) $referencedTable.html($options);
		else $referencedTable.empty();
		
		if(controller.getModel().getAction() == DBDesigner.Action.ALTER_FOREIGNKEY){
			$referencedTable.val(foreignKeyModel.getReferencedTable().getName()).prop('disabled', true);
		}else {
			$referencedTable.prop('disabled', false);
		}
		$referencedTable.trigger('change');
		controller.setSelectedColumns(foreignKeyModel.getColumns());
		this.updateLocalColumns();
		dom.find('div.tabs').tabs('option', 'active', 0);
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
	
};

ForeignKeyDialogUI.prototype.save = function(closeWindow){
	closeWindow = (typeof closeWindow == 'undefined')? true : closeWindow;
	this.cleanErrors();
	var form = {
		name: $.trim($('#foreignkey-dialog_foreignkey-name').val()),
		referencedTable: this.getController().getReferencedTable(),
		onUpdate: $('#foreignkey-dialog_foreignkey-updateaction').val(),
		onDelete: $('#foreignkey-dialog_foreignkey-deleteaction').val(),
		isMatchFull: $('#foreignkey-dialog_foreignkey-matchfull').prop('checked'),
		isDeferrable: $('#foreignkey-dialog_foreignkey-deferrable').prop('checked'),
		isDeferred: $('#foreignkey-dialog_foreignkey-deferred').prop('checked'),
		comment: $.trim($('#foreignkey-dialog_foreignkey-comment').val()),
		columns: this.getController().getSelectedColumns()
	};
	var saveSuccess = this.getController().saveForeignKey(form);
	if(saveSuccess && closeWindow) this.close();
	return saveSuccess;
};

ForeignKeyDialogUI.prototype.referencedTableChanged = function(event){
	var table = DBDesigner.app.getTableCollection().getTableByName($(event.currentTarget).val());
	this.getController().setReferencedTable(table);
};

ForeignKeyDialogUI.prototype.typeHasPredefinedSize = function(type){
	for(var i = 0, n = DBDesigner.dataTypes.length; i < n; i++){
		if(DBDesigner.dataTypes[i].typedef == type){
			return DBDesigner.dataTypes[i].size_predefined;
		}
	}
	return false;
};

ForeignKeyDialogUI.prototype.deferrableChange = function(event){
	if(this.checked) $('#foreignkey-dialog_foreignkey-deferred').prop('disabled', false);
	else $('#foreignkey-dialog_foreignkey-deferred').prop('disabled', true).prop('checked', false);
};

ForeignKeyDialogUI.prototype.updateLocalColumns = function(){
	var columns = this.getController().getLocalColumns();
	var $options = $();
	var cName;
	var $option;
	for(var i = 0; i < columns.length; i++){
		cName = columns[i].getName();
		$option = $('<option></option>').attr('value', cName).text(cName);
		$options = $options.add($option);
	}
	if($options.length > 0) {
		$('#foreignkey-dialog_foreignkey-localcolumn').html($options);
		if(this.getController().getForeignColumns().length > 0)
			$('#foreignkey-dialog_addcolumns').prop('disabled', false);
	}
	else {
		$('#foreignkey-dialog_foreignkey-localcolumn').empty();
		$('#foreignkey-dialog_addcolumns').prop('disabled', true);
	}
};

ForeignKeyDialogUI.prototype.updateForeignColumns = function(){
	var columns = this.getController().getForeignColumns();
	var $options = $();
	var cName;
	var $option;
	for(var i = 0; i < columns.length; i++){
		cName = columns[i].getName();
		$option = $('<option></option>').attr('value', cName).text(cName);
		$options = $options.add($option);
	}
	if($options.length > 0) {
		$('#foreignkey-dialog_foreignkey-referencedcolumn').html($options);
		if(this.getController().getLocalColumns().length > 0)
			$('#foreignkey-dialog_addcolumns').prop('disabled', false);
	}
	else {
		$('#foreignkey-dialog_foreignkey-referencedcolumn').empty();
		$('#foreignkey-dialog_addcolumns').prop('disabled', true);
	}
};

ForeignKeyDialogUI.prototype.addSelectedColumns = function(){
	var localColumnName = $('#foreignkey-dialog_foreignkey-localcolumn').val();
	var foreignColumnName = $('#foreignkey-dialog_foreignkey-referencedcolumn').val();
	var controller = this.getController();
	controller.addSelectedColumns(localColumnName, foreignColumnName);
	if(controller.getSelectedColumns().length > 0) $('#foreignkey-dialog_foreignkey-references').prop('disabled', true);
};

ForeignKeyDialogUI.prototype.updateSelectedColumns = function(selectedColumns){
	if($.isArray(selectedColumns)){
		var $tbody = $('#foreignkey-dialog_columns-tab').find('tbody');
		if(selectedColumns.length == 0){
			$tbody.html('<tr><td colspan="3">' + DBDesigner.lang.strfkneedscols + '</td></tr>');
		}else{
			var $tableContent = $();
			var $tableRow;
			var $tableCell;
			var $deleteButton;
			for(var i = 0; i < selectedColumns.length; i++){
				$tableRow = $('<tr></tr>');

				$tableCell = $('<td></td>').text(selectedColumns[i].localColumn.getName());
				$tableRow.append($tableCell);

				$tableCell = $('<td></td>').text(selectedColumns[i].foreignColumn.getName());
				$tableRow.append($tableCell);

				$deleteButton = $('<a>X</a>').attr({href: '#', title: DBDesigner.lang.strremove, 'class': 'remove'}).data('index', i);
				$tableCell = $('<td></td>').append($deleteButton);
				$tableRow.append($tableCell);

				$tableContent = $tableContent.add($tableRow);
			}
			$tbody.html($tableContent);
		}
	}
};

ForeignKeyDialogUI.prototype.removeSelectedColumns = function(event){
	event.preventDefault();
	var controller = this.getController();
	controller.removeSelectedColumns($(event.target).data('index'));
	if(controller.getSelectedColumns().length == 0) $('#foreignkey-dialog_foreignkey-references').prop('disabled', false);
};

ForeignKeyDialogUI.prototype.submitButtonClicked = function(event){
	if(event.target.id == 'foreignkey-dialog_cancel') {this.close();}
	else{
		var saveSuccess = this.save(false);
		if(event.target.id == 'foreignkey-dialog_save' && saveSuccess) {this.close();}
		else if(event.target.id == 'foreignkey-dialog_save2' && saveSuccess) {
			var controller = this.getController();
			var table = controller.getModel().getDBObjectModel().getParent();
			controller.createForeignKey(table);
		}
	}
};
