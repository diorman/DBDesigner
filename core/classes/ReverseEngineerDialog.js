ReverseEngineerDialog = function(){
	this.setUI(new ReverseEngineerDialogUI(this));
};
$.extend(ReverseEngineerDialog.prototype, Component);

ReverseEngineerDialog.prototype.open = function(tables){
	this.getUI().open(tables);
};

// *****************************************************************************

ReverseEngineerDialogUI = function(controller){
	this.setTemplateID('ReverseEngineerDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({
		title: DBDesigner.lang.strreverseengineer,
		modal: true,
		autoOpen: false,
		resizable: false,
		width: 'auto'
	});
};
$.extend(ReverseEngineerDialogUI.prototype, ComponentUI);

ReverseEngineerDialogUI.prototype.open = function(tables){
	var dom = this.getDom();
	var $html = $();
	var $option;
	for(var i = 0; i < tables.length; i++) {
		$option = $('<option></option>', {
			text: tables[i].name,
			value: tables[i].name,
			selected: 'selected',
			data: { jsontable: tables[i] }
		});
		$html = $html.add($option);
	}
	$('#reverseengineer-dialog_available-tables').html($html);
	$('#reverseengineer-dialog_output').empty();
	dom.removeClass('show-output')
		.find('.error-list').empty().hide();
	dom.dialog('open');
};

ReverseEngineerDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.on('click', 'input[type="button"]', $.proxy(this.onButtonClick, this));
	dom.on('dialogclose', function(event, ui) {
		$('#reverseengineer-dialog_available-tables, #reverseengineer-dialog_selected-tables').empty();
	});
};

ReverseEngineerDialogUI.prototype.onButtonClick = function(event){
	switch(event.target.id) {
		case 'reverseengineer-dialog_show-output':
			this.getDom().addClass('show-output');
			break;
		case 'reverseengineer-dialog_hide-output':
			this.getDom().removeClass('show-output');
			break;
		case 'reverseengineer-dialog_cancel':
			this.getDom().dialog('close');
			break;
		case 'reverseengineer-dialog_ok':
			var json = {tables: []};
			$('#reverseengineer-dialog_selected-tables').find('option:selected').each(function() {
				json.tables.push($(this).data('jsontable'));
			});
			if(json.tables.length == 0) {
				this.getDom().find('.error-list').html(
					'<li>' + DBDesigner.lang.stryouhavenotselectedanytable + '</li>'
				).show();
				break;
			}
			if(JSONLoader.load(json, true)){
				DBDesigner.app.alignTables();
				this.getDom().dialog('close');
			} else {
				var conflicts = JSONLoader.getConflicts();
				var html = '<p><b>' + DBDesigner.lang.strreverseengineerconflictmessage + '</b></p>';
				html += '<ul>';
				for(var i = 0; i < conflicts.tables.length; i++) {
					html += '<li>' + conflicts.tables[i] + '</li>';
				}
				html += '</ul>';
				$('#reverseengineer-dialog_output').html(html);
				this.getDom().addClass('show-output');
			}
			break;
		case 'reverseengineer-dialog_remove-tables':
			var targetID = '#reverseengineer-dialog_available-tables';
			var sourceID = '#reverseengineer-dialog_selected-tables';
		case 'reverseengineer-dialog_add-tables':
			if(!targetID && !sourceID) {
				var sourceID = '#reverseengineer-dialog_available-tables';
				var targetID = '#reverseengineer-dialog_selected-tables';
			}
			$(sourceID).find('option:selected').appendTo(targetID);
			break;
		case 'forwardengineer-dialog_generate':
			var dom = this.getDom();
			var sql = SqlGenerator.generate({
				selectedTablesOnly: $('#fordwardengineer-dialog_filter-selected-tables').prop('checked'),
				generateDropTable: $('#fordwardengineer-dialog_dropstmt').prop('checked'), 
				generateCascade: $('#fordwardengineer-dialog_cascadeprmt').prop('checked')
			});
			$('#forwardengineer-dialog_script').val(sql);
			break;
		case 'forwardengineer-dialog_execute':
			var sql = $.trim($('#forwardengineer-dialog_script').val());
			if(sql != ''){
				var dom = this.getDom();
				Ajax.sendRequest(Ajax.Action.EXECUTE_SQL, sql, function(response) {
					$('#forwardengineer-dialog_output').html(response.data);
					dom.addClass('show-output');
				});
			}
			break;
	}
};