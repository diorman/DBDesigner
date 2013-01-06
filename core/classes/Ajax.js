
Ajax = {
	sendRequest: function(action){
		DBDesigner.app.setDisabled(true);
		switch(action){
			case Ajax.Action.SAVE:
				Message.show(DBDesigner.lang.strsaving, false);
				$.post('', {
					action: action,
					erdiagram_id: DBDesigner.erdiagramId,
					data: $.toJSON({
						version: '1.0',
						tables: DBDesigner.app.getTableCollection().serialize()
					})
				}, null, 'json').always(Ajax.manageResponse);
				break;
		}
	},
	manageResponse: function(data, status, jqxhr){
		if(status == 'success'){
			switch(data.action){
				case Ajax.Action.SAVE:
					Message.show(DBDesigner.lang.strerdiagramsaved, true);
					break;
			}
		} else {}
		DBDesigner.app.setDisabled(false);
	},
	
	Action: {
		SAVE: 'ajaxSave'
	}
};


