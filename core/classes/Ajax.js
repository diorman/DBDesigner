
Ajax = {
	_sessionTimerID: null,
	
	startSessionTimer: function() {
		Ajax._sessionTimerID = window.setTimeout(
			function() {
				Ajax.sendRequest(Ajax.Action.KEEP_SESSION_ALIVE);
			}, 10000
		);
	},
	
	stopSessionTimer: function() {
		if(Ajax._sessionTimerID != null) {
			window.clearTimeout(Ajax._sessionTimerID);
		}
	},
	
	sendRequest: function(action, extraData, callback){
		Ajax.stopSessionTimer();
		
		if(Ajax.Action.KEEP_SESSION_ALIVE != action) {
			DBDesigner.app.setDisabled(true);
		}
		
		var alwaysCallback = callback? function(response, status, jqxhr) {
			Ajax.manageResponse(response, status, jqxhr);
			if(status == 'success') { callback(response, status, jqxhr); }
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
				
			case Ajax.Action.LOAD_SCHEMA_STRUCTURE:
				Message.show(DBDesigner.lang.strloadingschema, false);
				$.get('', {
					action: action,
					server: DBDesigner.server,
					database: DBDesigner.databaseName,
					schema: DBDesigner.schemaName,
					plugin: 'DBDesigner'
				}, null, 'json').always(alwaysCallback);
				break;
				
			case Ajax.Action.KEEP_SESSION_ALIVE:
				$.get('', {
					action: action,
					server: DBDesigner.server,
					database: DBDesigner.databaseName,
					schema: DBDesigner.schemaName,
					plugin: 'DBDesigner'
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
				case Ajax.Action.LOAD_SCHEMA_STRUCTURE:
					Message.close(true);
					break;
			}
			Ajax.startSessionTimer();
		} else {
			Message.close(true);
			DBDesigner.app.alertDialog.show(
				DBDesigner.lang.strunexpectedserverresponse,
				DBDesigner.lang.strservererror,
				{ method: Ajax.startSessionTimer, scope: window } 
			);
		}
		DBDesigner.app.setDisabled(false);
	},
	
	Action: {
		SAVE: 'ajaxSave',
		EXECUTE_SQL: 'ajaxExecuteSQL',
		LOAD_SCHEMA_STRUCTURE: 'ajaxLoadSchemaStructure',
		KEEP_SESSION_ALIVE: 'ajaxKeepSessionAlive'
	}
};


