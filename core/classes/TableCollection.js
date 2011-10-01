
TableCollection = function(){
	this._tables = [];
	this._selectedTables = [];
};

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
};

TableCollection.prototype.addToSelection = function(table){
	if($.inArray(table, this._selectedTables) == -1) this._selectedTables.push(table);
};

TableCollection.prototype.removeFromSelection = function(table){
	var index = $.inArray(table, this._selectedTables);
	if(index >= 0) this._selectedTables.splice(index, 1);
};

TableCollection.prototype.tableSelectionChanged = function(event){
	var l = this._selectedTables.length;
	if(event.tableIsSelected) this.addToSelection(event.sender);
	else this.removeFromSelection(event.sender);
	
	var l2 = this._selectedTables.length;
	
	if(l != l2){
		var actionState = {};
		switch(l2){
			case 0:
				actionState[DBDesigner.Action.ADD_COLUMN] = false;
				actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
				actionState[DBDesigner.Action.DROP_TABLE] = false;
				break;
			case 1:
				actionState[DBDesigner.Action.ADD_COLUMN] = true;
				actionState[DBDesigner.Action.ADD_FOREIGNKEY] = true;
				actionState[DBDesigner.Action.DROP_TABLE] = true;
				break;
			default:
				actionState[DBDesigner.Action.ADD_COLUMN] = false;
				actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
				actionState[DBDesigner.Action.DROP_TABLE] = true;
				break;
		}
		
		DBDesigner.app.toolBar.setActionState(actionState);
	}
};


