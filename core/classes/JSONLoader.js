
JSONLoader = {
	load: function(json){
		if(json != null && json.tables){
			var collisions = JSONLoader._findCollisions(json);
			if(collisions === false) {
				DBDesigner.app.getTableCollection().loadJSON(json.tables);
			} else {
				//console.log(collisions);
			}
		}
	},
	
	_findCollisions: function(json) {
		var i;
		var collisionFound = false;
		var collection = DBDesigner.app.getTableCollection();
		var collisions = {
			tables: [],
			uniqueKeys: [],
			foreignKeys: []
		}
		for(i = 0; i < json.tables.length; i++) {
			if(collection.getTableByName(json.tables[i].name) != null) {
				collisionFound = true;
				collisions.tables.push(json.tables[i].name);
			}
		}
		if(collisionFound) return collisions;
		return false;
	}
};