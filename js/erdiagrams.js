
var ERDiagram = { 
	/**
	 * Swaps options between two selects to grant and revoke privileges to users and groups
	 * @param source_select The select where the options are selected
	 * @param target_select The select wich will get selected options from source_select
	 */
	swapSelectedOptions: function (source_select, target_select) {
	
		var source = document.getElementById(source_select);

		if(source.selectedIndex < 0) return false;

		var target = document.getElementById(target_select);

		var option;
		for (i = source.length-1; i >= 0; i--) {
			if(source.options[i].selected){
				option = source.options[i];
				source.remove(i);
				try {
					target.add(option, null); // standards compliant; doesn't work in IE
				}
				catch(ex) {
					target.add(option); // IE only
				}
			}
		}
		return false;
	},

	selectAllGranted: function(){
		var groups = document.getElementById('diagramGrantedGroups');
		var users = document.getElementById('diagramGrantedUsers');
		var i = 0;
		for(i = 0; i < groups.length; i++) groups.options[i].selected = true;
		for(i = 0; i < users.length; i++) users.options[i].selected = true;
	}, 


	openDesigner: function (diagramID, vars){
		vars += "&erdiagram_id=" + diagramID;
		var dbDesginer = window.open(
			"dbdesigner.php?" + vars,
			"diagram" + diagramID,
			"width=800, height=600, status=0, directories=0, hotkeys=0, location=0, menubar=0, personalbar=0, resizable=1, scrollbars=1, toolbar=0"
		);
		if(window.focus) dbDesginer.focus();
	}
}
