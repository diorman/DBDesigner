
Ajax = {
	sendRequest: function(action, extraData, callback){
		DBDesigner.app.setDisabled(true);
		
		var alwaysCallback = callback? function(response, status, jqxhr) {
			Ajax.manageResponse(response, status, jqxhr);
			callback(response, status, jqxhr);
		} : Ajax.manageResponse;
		
		switch(action){
			case Ajax.Action.SAVE:
				Message.show(DBDesigner.lang.strsaving, false);
				$.post('', {
					action: action,
					erdiagram_id: DBDesigner.erdiagramId,
					data: $.toJSON({
						version: DBDesigner.version,
						tables: DBDesigner.app.getTableCollection().serialize()
					})
				}, null, 'json').always(alwaysCallback);
				break;
			case Ajax.Action.EXECUTE_SQL:
				Message.show(DBDesigner.lang.strexecutingsql, false);
				$.post('', {
					action: action,
					sql: extraData
				}, null, 'json').always(alwaysCallback);
				break;
		}
	},
	manageResponse: function(response, status, jqxhr){
		if(status == 'success'){
			switch(response.action){
				case Ajax.Action.SAVE:
					Message.show(DBDesigner.lang.strerdiagramsaved, true);
					break;
				case Ajax.Action.EXECUTE_SQL:
					Message.close(true);
					break;
			}
		} else {}
		DBDesigner.app.setDisabled(false);
	},
	
	Action: {
		SAVE: 'ajaxSave',
		EXECUTE_SQL: 'ajaxExecuteSQL'
	}
};


