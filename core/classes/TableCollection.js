
TableCollection = function(){
	this._tables = [];
	this._selectedTables = [];
};
$.extend(TableCollection.prototype, EventDispatcher);

TableCollection.prototype.getTableByName = function(name){
	for(var i = 0, n = this._tables.length; i < n; i++){
		if(this._tables[i].getName() == name) return this._tables[i];
	}
	return null;
};

TableCollection.prototype.add = function(table){
	if(table.isSelected()) this.addToSelection(table);
	if($.inArray(table, this._tables) == -1) this._tables.push(table);
	
	table.bind(Table.Event.SELECTION_CHANGED, this.tableSelectionChanged, this);
	table.bind(Table.Event.ALTER_REQUEST, this.alterTable, this);
	table.bind(Table.Event.DETAIL_REQUEST, this.detailRequest, this);
};

TableCollection.prototype.addToSelection = function(table){
	if($.inArray(table, this._selectedTables) == -1) {
		this._selectedTables.push(table);
		if(this._selectedTables.length == 1 || this._selectedTables.length == 2)
			this.trigger(Table.Event.SELECTION_CHANGED);
	}
};

TableCollection.prototype.removeFromSelection = function(table){
	var index = $.inArray(table, this._selectedTables);
	if(index >= 0) {
		this._selectedTables.splice(index, 1);
		if(this._selectedTables.length == 1 || this._selectedTables.length == 0)
			this.trigger(Table.Event.SELECTION_CHANGED);
	}
};

TableCollection.prototype.tableSelectionChanged = function(event){
	if(event.tableIsSelected) this.addToSelection(event.sender);
	else this.removeFromSelection(event.sender);
};

TableCollection.prototype.emptySelection = function(){
	var tables = this.getSelectedTables();
	for(var i = 0, n = tables.length; i < n; i++){
		tables[i].setSelected(false);
	}
};

TableCollection.prototype.count = function(){
	return this._selectedTables.length;
};

TableCollection.prototype.alterTable = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_TABLE, event.sender);
};

TableCollection.prototype.getSelectedTables = function(){
	return [].concat(this._selectedTables);
};

TableCollection.prototype.getTables = function(){
	return [].concat(this._tables);
};

TableCollection.prototype.getTableNames = function(){
	var tNames = [];
	for(var i = 0, n = this._tables.length; i < n; i++){
		tNames.push(this._tables[i].getName());
	}
	tNames.sort();
	return tNames;
};

TableCollection.prototype.detailRequest = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.SHOW_TABLE_DETAIL, event.sender);
};

TableCollection.prototype.tableNameExists = function(name, tableModel){
	var tableWithSameName = this.getTableByName(name);
	if(tableWithSameName != null && tableWithSameName.getModel() != tableModel) return true;
	return false;
};