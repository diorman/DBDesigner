
JSONLoader = {
	_conflicts: null,
	
	load: function(json, selectTables){
		if(json != null && json.tables){
			var conflicts = JSONLoader._findConflicts(json);
			if(!conflicts) {
				DBDesigner.app.getTableCollection().loadJSON(json.tables, selectTables);
				return true;
			}
		}
		return false;
	},
	getConflicts: function(){ return JSONLoader._conflicts; },
	
	_findConflicts: function(json) {
		var i;
		var conflictFound = false;
		var collection = DBDesigner.app.getTableCollection();
		var conflicts = {
			tables: [],
			uniqueKeys: [],
			foreignKeys: []
		}
		JSONLoader._conflicts = null;
		for(i = 0; i < json.tables.length; i++) {
			if(collection.getTableByName(json.tables[i].name) != null) {
				conflictFound = true;
				conflicts.tables.push(json.tables[i].name);
			}
		}
		if(conflictFound) {
			JSONLoader._collisions = conflicts;
			return true;
		}
		return false;
	}
};