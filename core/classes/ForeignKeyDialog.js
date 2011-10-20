
ForeignKeyDialog = function() {	
	this.setModel(new ForeignKeyDialogModel());
	this.setUI(new ForeignKeyDialogUI(this));
};

$.extend(ForeignKeyDialog.prototype, DBObjectDialog);

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
	var columnModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		var flags = 0;
		if(form.isArray) flags |= ColumnModel.flag.ARRAY;
		if(form.isPrimaryKey) flags |= ColumnModel.flag.PRIMARY_KEY;
		if(form.isUniqueKey) flags |= ColumnModel.flag.UNIQUE_KEY;
		if(form.isNotnull) flags |= ColumnModel.flag.NOTNULL;
		if(columnModel.isForeignKey()) flags |= ColumnModel.flag.FOREIGN_KEY;
		
		
		columnModel.setName(form.name);
		columnModel.setType(form.type);
		columnModel.setLength(form.length);
		columnModel.setDefault(form.def);
		columnModel.setComment(form.comment);
		columnModel.setFlags(flags);
		
		
		if(action == DBDesigner.Action.ADD_COLUMN){
			var column = new Column(columnModel);
			columnModel.getParent().getColumnCollection().add(column);
		}
		
		this.getUI().close();
	}
};

ForeignKeyDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();

	return isValid;
}


// *****************************************************************************

ForeignKeyDialogModel = function() {
	
};

$.extend(ForeignKeyDialogModel.prototype, DBObjectDialogModel);



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
	//dom.find('#column-dialog_cancel').click($.proxy(this.close, this));
	//dom.find('#column-dialog_save').click($.proxy(this.save, this));
	dom.find('#foreignkey-dialog_foreignkey-references').change($.proxy(this.referencedTableChanged, this));
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
		$('#foreignkey-dialog_foreignkey-deferred').prop('checked', foreignKeyModel.isDeferred());
		$('#foreignkey-dialog_foreignkey-comment').val(foreignKeyModel.getComment());
		
		/** Update tables **/
		var tNames = DBDesigner.app.tableCollection.getTableNames();
		var $options = $();
		var $option;
		var i = 0;
		for (i = 0; i < tNames.length; i++){
			$option = $('<option></option>').attr('value', tNames[i]).text(tNames[i]);
			$options = $options.add($option);
		}
		if($options.length > 0) $('#foreignkey-dialog_foreignkey-references').html($options).trigger('change');
		else $('#foreignkey-dialog_foreignkey-references').empty().trigger('change');
		
		/** Update local columns **/
		$options = $();
		var cNames = foreignKeyModel.getParent().getColumnCollection().getColumnNames();
		for (i = 0; i < cNames.length; i++){
			$option = $('<option></option>').attr('value', cNames[i]).text(cNames[i]);
			$options = $options.add($option);
		}
		if($options.length > 0) $('#foreignkey-dialog_foreignkey-localcolumn').html($options);
		else $('#foreignkey-dialog_foreignkey-localcolumn').empty();
		
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
		name: $.trim($('#column-dialog_column-name').val()),
		type: $('#column-dialog_column-type').val(),
		isArray: $('#column-dialog_column-array').prop('checked'),
		isPrimaryKey: $('#column-dialog_column-primarykey').prop('checked'),
		isUniqueKey: $('#column-dialog_column-uniquekey').prop('checked'),
		isNotnull: $('#column-dialog_column-notnull').prop('checked'),
		def: $.trim($('#column-dialog_column-default').val()),
		comment: $.trim($('#column-dialog_column-comment').val())
	};
	form.length = (this.typeHasPredefinedSize(form.type))? '': $.trim($('#column-dialog_column-length').val()).replace(/\s+/g, '');
	this.getController().saveColumn(form);
};

ForeignKeyDialogUI.prototype.referencedTableChanged = function(event){
	var table = DBDesigner.app.tableCollection.getTableByName($(event.currentTarget).val());
	if(table != null){	
		var cNames = table.getColumnCollection().getReferenceableColumnNames();
		var $options = $();
		var $option;
		for (var i = 0; i < cNames.length; i++){
			$option = $('<option></option>').attr('value', cNames[i]).text(cNames[i]);
			$options = $options.add($option);
		}
		if($options.length > 0) $('#foreignkey-dialog_foreignkey-referencedcolumn').html($options);
		else $('#foreignkey-dialog_foreignkey-referencedcolumn').empty();
	}
};

ForeignKeyDialogUI.prototype.typeHasPredefinedSize = function(type){
	for(var i = 0, n = DBDesigner.dataTypes.length; i < n; i++){
		if(DBDesigner.dataTypes[i].typedef == type){
			return DBDesigner.dataTypes[i].size_predefined;
		}
	}
	return false;
};