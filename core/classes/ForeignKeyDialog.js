
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
	model.setAction(DBDesigner.Action.ALTER_COLUMN);
	model.setDBObjectModel(column.getModel());
	this.getUI().open(DBDesigner.lang.straltercolumn);
};

ForeignKeyDialog.prototype.saveForeignKey = function(form){
	var model = this.getModel();
	var foreignKeyModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		var flags = 0;
		if(form.isDeferrable) flags |= ForeignKeyModel.Flag.DEFERRABLE;
		if(form.isDeferred) flags |= ForeignKeyModel.Flag.DEFERRED;
		if(form.isMatchFull) flags |= ForeignKeyModel.Flag.MATCH_FULL;
		
		foreignKeyModel.setName(form.name);
		foreignKeyModel.setComment(form.comment);
		foreignKeyModel.setFlags(flags);
		foreignKeyModel.setColumns(form.columns);
		foreignKeyModel.setReferencedTable(form.referencedTable);
		
		if(action == DBDesigner.Action.ADD_FOREIGNKEY){
			var foreignKey = new ForeignKey(foreignKeyModel);
			foreignKeyModel.getParent().getForeignKeyCollection().add(foreignKey);
		}
		
		this.getUI().close();
	}
	
};

ForeignKeyDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var foreignKeyModel = this.getDBObjectModel();
	var foreignKeyCollection = foreignKeyModel.getParent().getForeignKeyCollection();
	var foreignKeyWithSameName = (form.name != '')? foreignKeyCollection.getForeignKeyByName(form.name) : null;
	
	if(foreignKeyWithSameName != null && foreignKeyWithSameName.getModel() != foreignKeyModel){
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
	var localColumns = this.getDBObjectModel().getParent().getColumnCollection().getColumns();
	var localSelectedColumns = this.getLocalSelectedColumns();
	var columns = [];
	for (var i = 0; i < localColumns.length; i++){
		if($.inArray(localColumns[i], localSelectedColumns) == -1){
			columns.push(localColumns[i]);
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
	for(var i = 0; i < selectedColumns.length; i++)
		columns.push(selectedColumns[i].localColumn);
	return columns;
};

ForeignKeyDialogModel.prototype.getForeignSelectedColumns = function(){
	var selectedColumns = this.getSelectedColumns();
	var columns = [];
	for(var i = 0; i < selectedColumns.length; i++)
		columns.push(selectedColumns[i].foreignColumn);
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
	dom.appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
	dom.find('div.tabs').tabs();
};

$.extend(ForeignKeyDialogUI.prototype, DBObjectDialogUI);

ForeignKeyDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('#foreignkey-dialog_cancel').click($.proxy(this.close, this));
	dom.find('#foreignkey-dialog_save').click($.proxy(this.save, this));
	dom.find('#foreignkey-dialog_foreignkey-references').change($.proxy(this.referencedTableChanged, this));
	dom.find('#foreignkey-dialog_foreignkey-deferrable').click(this.deferrableChange);
	dom.find('#foreignkey-dialog_addcolumns').click($.proxy(this.addSelectedColumns, this));
	dom.find('#foreignkey-dialog_columns-tab').delegate('a.remove', 'click', $.proxy(this.removeSelectedColumns, this));
	this.setKeyPressEvent();
};


ForeignKeyDialogUI.prototype.open = function(title){
	
	var foreignKeyModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(foreignKeyModel != null){
		$('#foreignkey-dialog_foreignkey-name').val(foreignKeyModel.getName());
		$('#foreignkey-dialog_foreignkey-updateaction').prop('checked', foreignKeyModel.getUpdateAction());
		$('#foreignkey-dialog_foreignkey-deleteaction').prop('checked', foreignKeyModel.getDeleteAction());
		$('#foreignkey-dialog_foreignkey-matchfull').prop('checked', foreignKeyModel.isMatchFull());
		$('#foreignkey-dialog_foreignkey-deferrable').prop('checked', foreignKeyModel.isDeferrable());
		$('#foreignkey-dialog_foreignkey-comment').val(foreignKeyModel.getComment());
		
		if(foreignKeyModel.isDeferrable())$('#foreignkey-dialog_foreignkey-deferred').prop('checked', foreignKeyModel.isDeferred()).prop('disabled', false);
		else $('#foreignkey-dialog_foreignkey-deferred').prop('checked', false).prop('disabled', true);
		
		/** Update tables **/
		var tables = DBDesigner.app.tableCollection.getTables();
		var $options = $();
		var $option;
		var i = 0;
		var tName = '';
		for (i = 0; i < tables.length; i++){
			tName = tables[i].getName();
			$option = $('<option></option>').attr('value', tName).text(tName);
			$options = $options.add($option);
		}
		if($options.length > 0) $('#foreignkey-dialog_foreignkey-references').html($options).trigger('change');
		else $('#foreignkey-dialog_foreignkey-references').empty().trigger('change');
		
		
		this.getController().setSelectedColumns(foreignKeyModel.getColumns());
		
		/** Update local columns **/
		this.updateLocalColumns();
		/*
		$options = $();
		var cNames = foreignKeyModel.getParent().getColumnCollection().getColumnNames();
		for (i = 0; i < cNames.length; i++){
			$option = $('<option></option>').attr('value', cNames[i]).text(cNames[i]);
			$options = $options.add($option);
		}
		if($options.length > 0) $('#foreignkey-dialog_foreignkey-localcolumn').html($options);
		else $('#foreignkey-dialog_foreignkey-localcolumn').empty();*/
		
		/*$('#column-dialog_column-type').val(columnModel.getType()).trigger('change');
		$('#column-dialog_column-name').val(columnModel.getName());
		$('#column-dialog_column-length').val(columnModel.getLength());
		$('#column-dialog_column-comment').val(columnModel.getComment());
		$('#column-dialog_column-array').prop('checked', columnModel.isArray());
		$('#column-dialog_column-primarykey').prop('checked', columnModel.isPrimaryKey());
		$('#column-dialog_column-uniquekey').prop('checked', columnModel.isUniqueKey());
		$('#column-dialog_column-notnull').prop('checked', columnModel.isNotnull());
		$('#column-dialog_column-default').val(columnModel.getDefault());*/
		dom.find('div.tabs').tabs('select', 0);
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
	
};

ForeignKeyDialogUI.prototype.save = function(){
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
	this.getController().saveForeignKey(form);
};

ForeignKeyDialogUI.prototype.referencedTableChanged = function(event){
	var table = DBDesigner.app.tableCollection.getTableByName($(event.currentTarget).val());
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
	this.getController().addSelectedColumns(localColumnName, foreignColumnName);
};

ForeignKeyDialogUI.prototype.updateSelectedColumns = function(selectedColumns){
	var $tbody = $('#foreignkey-dialog_columns-tab').find('tbody');
	if(selectedColumns.length == 0){
		$tbody.html('<tr><td colspan="3">' + DBDesigner.lang.strfkneedscols + '</td></tr>');
	}else{
		var $tableContent = $();
		var $tableRow;
		var $tableCell;
		var $deleteButton;
		for(var i = 0; i < selectedColumns.length; i++){
			
			//$tableRow = $('<tr><td><a class="remove" data-index="'+ i +'" href="#" title="'+DBDesigner.lang.strremove+'">x</a></td></tr>');
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
};

ForeignKeyDialogUI.prototype.removeSelectedColumns = function(event){
	event.preventDefault();
	this.getController().removeSelectedColumns($(event.target).data('index'));
	//console.log($(event.target).data('index'));
};