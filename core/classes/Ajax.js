
Ajax = {
	sendRequest: function(requestAction, data){
		$.post('', {
			action: requestAction,
			erdiagram_id: DBDesigner.erdiagramId,
			data: data
		}, null, 'json')
			.always(Ajax.manageResponse);
	},
	manageResponse: function(data, status, jqxhr){
		if(status == 'success'){
			switch(data.action){
				case Ajax.Action.SAVE:
					alert('Saved!');
					break;
			}
		} else {
			
		}
	},
	
	Action: {
		SAVE: 'ajaxSave'
	}
};


