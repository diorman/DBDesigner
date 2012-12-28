/**
 * 
 * Class to manage the component used to show table details
 * 
 */
ObjectDetail = function() {
	var model = new ObjectDetailModel();
	model.bind(DBDesigner.Event.PROPERTY_CHANGED, this.modelPropertyChanged, this);
	this.setModel(model);
	this.setUI(new ObjectDetailUI(this));
};
$.extend(ObjectDetail.prototype, Component);

/**
 * Sets the collapsed state of the panel 
 */
ObjectDetail.prototype.setCollapsed = function(b) {
	this.getModel().setCollapsed(b);
};

/**
 * Checks if the panel is collapsed
 */
ObjectDetail.prototype.isCollapsed = function() {
	return this.getModel().isCollapsed();
};

/**
 * Listener for model updates
 * @param event object with information related to the event triggered
 */
ObjectDetail.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'collapsed':
			ui.updatePanelState();
			this.trigger(ObjectDetail.Event.STATE_CHANGED, {isCollapsed: event.newValue});
			break;
		case 'table':
			ui.updateView(event.newValue);
			if(event.newValue != null){
				event.newValue.bind(DBObject.Event.DBOBJECT_ALTERED, this.onTablePropertyChanged, this);
				event.newValue.bind(DBObject.Event.DBOBJECT_DROPPED, this.onTableDropped, this);
				event.newValue.getColumnCollection().bind(Collection.Event.COLLECTION_CHANGED, this.onColumnCollectionChanged, this);
				event.newValue.getUniqueKeyCollection().bind(Collection.Event.COLLECTION_CHANGED, this.onUniqueKeyCollectionChanged, this);
				event.newValue.getForeignKeyCollection().bind(Collection.Event.COLLECTION_CHANGED, this.onForeignKeyCollectionChanged, this);
			}
			if(event.oldValue != null){
				event.oldValue.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onTablePropertyChanged, this);
				event.oldValue.unbind(DBObject.Event.DBOBJECT_DROPPED, this.onTableDropped, this);
				event.oldValue.getColumnCollection().unbind(Collection.Event.COLLECTION_CHANGED, this.onColumnCollectionChanged, this);
				event.oldValue.getUniqueKeyCollection().unbind(Collection.Event.COLLECTION_CHANGED, this.onUniqueKeyCollectionChanged, this);
				event.oldValue.getForeignKeyCollection().unbind(Collection.Event.COLLECTION_CHANGED, this.onForeignKeyCollectionChanged, this);
			}
			break;
	}
}

ObjectDetail.prototype.onColumnCollectionChanged = function(event){
	var column;
	var action;
	if(event.columnAdded){
		column = event.columnAdded;
		action = 'add';
	} else if(event.columnDropped){
		column = event.columnDropped;
		action = 'drop';
	} else if(event.columnAltered){
		column = event.columnAltered;
		action = 'alter';
	}
	this.getUI().updateSingleColumnView(column, action);
};

ObjectDetail.prototype.onUniqueKeyCollectionChanged = function(event){
	var uniqueKey;
	var action;
	if(event.uniqueKeyAdded){
		uniqueKey = event.uniqueKeyAdded;
		action = 'add';
	} else if(event.uniqueKeyDropped){
		uniqueKey= event.uniqueKeyDropped
		action = 'drop';
	} else if(event.uniqueKeyAltered){
		uniqueKey = event.uniqueKeyAltered;
		action = 'alter';
	}
	this.getUI().updateSingleUniqueKeyView(uniqueKey, action);
};

ObjectDetail.prototype.onForeignKeyCollectionChanged = function(event){
	var foreignKey;
	var action;
	if(event.foreignKeyAdded){
		foreignKey = event.foreignKeyAdded;
		action = 'add';
	} else if(event.foreignKeyDropped){
		foreignKey = event.foreignKeyDropped
		action = 'drop';
	} else if(event.foreignKeyAltered){
		foreignKey = event.foreignKeyAltered;
		action = 'alter';
	}
	this.getUI().updateSingleForeignKeyView(foreignKey, action);
};

ObjectDetail.prototype.onTablePropertyChanged = function(event){
	if(event.properties && $.partOf(event.properties, ['name', 'comment', 'options'])){
		this.getUI().updateTableView(event.sender);
	}
};

ObjectDetail.prototype.onTableDropped = function(event){
	var model = this.getModel();
	model.setTable(null);
	model.setCollapsed(true);
};

ObjectDetail.prototype.showTable = function(table){
	var model = this.getModel();
	model.setTable(table);
	model.setCollapsed(false);
};

ObjectDetail.prototype.addDBObject = function(type){
	switch(type){
		case 'column':
			DBDesigner.app.doAction(DBDesigner.Action.ADD_COLUMN, this.getModel().getTable());
			break;
		case 'fk':
			DBDesigner.app.doAction(DBDesigner.Action.ADD_FOREIGNKEY, this.getModel().getTable());
			break;
		case 'uk':
			DBDesigner.app.doAction(DBDesigner.Action.ADD_UNIQUEKEY, this.getModel().getTable());
			break;
	}
};

ObjectDetail.prototype.alterDBObject = function(dbobject){
	if(typeof dbobject == 'undefined') dbobject = this.getModel().getTable();
	if(dbobject instanceof Table) DBDesigner.app.doAction(DBDesigner.Action.ALTER_TABLE, dbobject);
	else if(dbobject instanceof Column) DBDesigner.app.doAction(DBDesigner.Action.ALTER_COLUMN, dbobject);
	else if(dbobject instanceof ForeignKey) DBDesigner.app.doAction(DBDesigner.Action.ALTER_FOREIGNKEY, dbobject);
	else if(dbobject instanceof UniqueKey) DBDesigner.app.doAction(DBDesigner.Action.ALTER_UNIQUEKEY, dbobject);
};

ObjectDetail.prototype.dropDBObject = function(dbobject){
	if(typeof dbobject == 'undefined') dbobject = this.getModel().getTable();
	if(dbobject instanceof Table) DBDesigner.app.doAction(DBDesigner.Action.DROP_TABLE, dbobject);
	else if(dbobject instanceof Column) DBDesigner.app.doAction(DBDesigner.Action.DROP_COLUMN, dbobject);
	else if(dbobject instanceof ForeignKey) DBDesigner.app.doAction(DBDesigner.Action.DROP_FOREIGNKEY, dbobject);
	else if(dbobject instanceof UniqueKey) DBDesigner.app.doAction(DBDesigner.Action.DROP_UNIQUEKEY, dbobject);
};

ObjectDetail.prototype.moveColumn = function(column, dir){
	return this.getModel().getTable().getColumnCollection().moveColumn(column, dir);
};

// *****************************************************************************

/**
 *
 * The ObjectDetail Model
 * 
 */
ObjectDetailModel = function(){};
$.extend(ObjectDetailModel.prototype, EventDispatcher);

/**
 * Checks if the panel is collapsed
 */
ObjectDetailModel.prototype.isCollapsed = function() {
	if(typeof this._collapsed == 'undefined') this._collapsed = false;
	return this._collapsed;
};

/**
 * Sets the collapsed state of the panel
 * @param b if true, the panel is collapsed
 *			otherwise, the panel is expanded
 */
ObjectDetailModel.prototype.setCollapsed = function(b) {
	var oldState = this.isCollapsed();
	if(!b && this.getTable() == null) return; //there's nothing to show, so it can't be uncollapsed 
	if(oldState != b){
		this._collapsed = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'collapsed', oldValue: oldState, newValue: b});
	}
};

ObjectDetailModel.prototype.getTable = function() {
	if(typeof this._table == 'undefined') this._table = null;
	return this._table;
};

ObjectDetailModel.prototype.setTable = function(table) {
	var oldTable = this.getTable();
	if(oldTable != table){
		this._table = table;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'table', oldValue: oldTable, newValue: table});
	}
};


// *****************************************************************************


/**
 *
 * The ObjectDetail View
 * 
 */
ObjectDetailUI = function(controller) {
	this.setTemplateID('ObjectDetail');
	this.setController(controller);
	this.init();
	var dom = this.getDom();
	dom.find('div.object-detail-tabs').tabs();
	dom.appendTo('body');
};
$.extend(ObjectDetailUI.prototype, ComponentUI);

/**
 * Attaches events to html objects 
 */
ObjectDetailUI.prototype.bindEvents = function() {
	var dom = this.getDom();
	dom.find('a.collapse-button').bind({
		click: $.proxy(this.panelStateChange, this)
	});
	dom.find('input[type="button"]').click($.proxy(this.onInputButtonClick, this));
	dom.on('hover', 'table.data-mgr tbody tr', this.onTrHover);
	dom.on('click', 'a.action-btn', $.proxy(this.onActionButtonClick, this));
};

/**
 * Evet fired when the collapse button is clicked
 * @param event object with information related to the event triggered
 */
ObjectDetailUI.prototype.panelStateChange = function(event) {
	event.preventDefault();
	var controller = this.getController();
	controller.setCollapsed(!controller.isCollapsed());
};

/**
 * Updates the presentation of the panel according to its state
 */
ObjectDetailUI.prototype.updatePanelState = function() {
	var isCollapsed = this.getController().isCollapsed();
	var $panel = this.getDom();
	if(isCollapsed && !$panel.hasClass('object-detail-collapsed')) {
		$panel.addClass('object-detail-collapsed')
			.find('a.collapse-button span')
			.removeClass('ui-icon-circle-triangle-s')
			.addClass('ui-icon-circle-triangle-e');
	}
	else if(!isCollapsed && $panel.hasClass('object-detail-collapsed')) {
		$panel.removeClass('object-detail-collapsed')
			.find('a.collapse-button span')
			.removeClass('ui-icon-circle-triangle-e')
			.addClass('ui-icon-circle-triangle-s');
	}
};

ObjectDetailUI.prototype.updateView = function(table){
	this.updateTableView(table);
	if(table != null){
		this.updateColumnsView(table.getColumnCollection());
		this.updateForeignKeyView(table.getForeignKeyCollection());
		this.updateUniqueKeyView(table.getUniqueKeyCollection());
	} else {
		$('#od-tab-columns').find('tbody').empty();
		$('#od-tab-uniqueKeys').find('tbody').empty();
		$('#od-tab-foreignKeys').find('tbody').empty();
	}
};

ObjectDetailUI.prototype.updateTableView = function(table){
	var dom = this.getDom();
	if(table != null){
		var $tabProp = $('#od-tab-properties');
		dom.find('span.title').text('.::::::::::  ' + table.getName() + '  ::::::::::.');
		dom.find('div.object-detail-tabs').show();
		$tabProp.find('dd.table-name').text(table.getName());
		$tabProp.find('dd.table-comment').text(table.getComment());
		if(table.getWithoutOIDS()) $tabProp.find('dd.table-options').text('WITHOUT OIDS');
		else $tabProp.find('dd.table-options').empty();
	} else {
		dom.find('span.title').empty();
		dom.find('div.object-detail-tabs').hide();
	}
};

ObjectDetailUI.prototype.updateColumnsView = function(columnCollection){
	$('#od-tab-columns').find('tbody').html(this.populateColumnHtmlData(columnCollection));
};

ObjectDetailUI.prototype.updateSingleColumnView = function(column, action){
	switch(action){
		case 'add':
			$('#od-tab-columns').find('tbody').append(this.populateColumnHtmlData(column));
			break;
		case 'drop':
			this.findColumnRow(column).remove();
			break;
		case 'alter':
			this.populateColumnHtmlData(column, this.findColumnRow(column));
			break;
	}
};

ObjectDetailUI.prototype.findColumnRow = function(column){
	var $tds = $('#od-tab-columns').find('tbody').find('td.data');
	var $td;
	for(var i = 0; i < $tds.length; i++){
		$td = $tds.eq(i);
		if($td.data('dbobject') == column){
			return $td.parent();
		}
	}
	return null;
};

ObjectDetailUI.prototype.populateColumnHtmlData = function(columnData, $tr){
	var columnModel;
	var comment;
	var htmlChecked = '<span class="ui-icon ui-icon-check">'+ DBDesigner.lang.stryes +'</span>';
	var htmlActions = '<a href="#" class="action-btn" title="'+ DBDesigner.lang.stralter +'"><span class="ui-icon ui-icon-pencil">'+ DBDesigner.lang.stralter +'</span></a>'+
		'<a href="#" class="action-btn" title="'+ DBDesigner.lang.strdrop +'"><span class="ui-icon ui-icon-trash">'+ DBDesigner.lang.strdrop +'</span></a>'+
		'<a href="#" class="action-btn" title="'+ DBDesigner.lang.strmoveup +'"><span class="ui-icon ui-icon-circle-arrow-n">'+ DBDesigner.lang.strmoveup +'</span></a>'+
		'<a href="#" class="action-btn" title="'+ DBDesigner.lang.strmovedown +'"><span class="ui-icon ui-icon-circle-arrow-s">'+ DBDesigner.lang.strmovedown +'</span></a>';
	if(columnData instanceof ColumnCollection) {
		var $rows = $();
		var columns = columnData.getColumns();
		for(var i = 0; i < columns.length; i++){
			columnModel = columns[i].getModel();
			comment = columnModel.getComment();
			$tr = $('<tr></tr>');
			$('<td></td>').text(columnModel.getName()).appendTo($tr);
			$('<td></td>').text(columnModel.getFullType()).appendTo($tr);
			$('<td></td>').html(columnModel.isPrimaryKey()?htmlChecked:'&nbsp;').appendTo($tr);
			$('<td></td>').html(columnModel.isForeignKey()?htmlChecked:'&nbsp;').appendTo($tr);
			$('<td></td>').html(columnModel.isUniqueKey()?htmlChecked:'&nbsp;').appendTo($tr);
			$('<td></td>').html(columnModel.isNotnull()?htmlChecked:'&nbsp;').appendTo($tr);
			$('<td></td>').text(columnModel.getDefault()).appendTo($tr);
			$('<td class="data"></td>').data('dbobject', columns[i]).html(htmlActions).appendTo($tr);
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
			$rows = $rows.add($tr);
		}
		return $rows;
	}else {
		columnModel = columnData.getModel();
		comment = columnModel.getComment();
		if(columnData instanceof Column && typeof $tr == 'undefined'){
			$tr = $('<tr></tr>');
			$('<td></td>').text(columnModel.getName()).appendTo($tr);
			$('<td></td>').text(columnModel.getFullType()).appendTo($tr);
			$('<td></td>').html(columnModel.isPrimaryKey()?htmlChecked:'&nbsp;').appendTo($tr);
			$('<td></td>').html(columnModel.isForeignKey()?htmlChecked:'&nbsp;').appendTo($tr);
			$('<td></td>').html(columnModel.isUniqueKey()?htmlChecked:'&nbsp;').appendTo($tr);
			$('<td></td>').html(columnModel.isNotnull()?htmlChecked:'&nbsp;').appendTo($tr);
			$('<td></td>').text(columnModel.getDefault()).appendTo($tr);
			$('<td class="data"></td>').data('dbobject', columnData).html(htmlActions).appendTo($tr);
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
		}else if(columnData instanceof Column && typeof $tr != 'undefined'){
			var $tds = $tr.find('td');
			$tds.eq(0).text(columnModel.getName());
			$tds.eq(1).text(columnModel.getFullType());
			$tds.eq(2).html(columnModel.isPrimaryKey()?htmlChecked:'&nbsp;');
			$tds.eq(3).html(columnModel.isForeignKey()?htmlChecked:'&nbsp;');
			$tds.eq(4).html(columnModel.isUniqueKey()?htmlChecked:'&nbsp;');
			$tds.eq(5).html(columnModel.isNotnull()?htmlChecked:'&nbsp;');
			$tds.eq(6).text(columnModel.getDefault());
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
			else $tr.removeAttr('title');
		}
	}
	return $tr;
};

ObjectDetailUI.prototype.updateUniqueKeyView = function(uniqueKeyCollection){
	$('#od-tab-uniquekeys').find('tbody').html(this.populateUniqueKeyHtmlData(uniqueKeyCollection));
};

ObjectDetailUI.prototype.updateSingleUniqueKeyView = function(uniqueKey, action){
	switch(action){
		case 'add':
			$('#od-tab-uniquekeys').find('tbody').append(this.populateUniqueKeyHtmlData(uniqueKey));
			break;
		case 'drop':
			this.findUniqueKeyRow(uniqueKey).remove();
			break;
		case 'alter':
			this.populateUniqueKeyHtmlData(uniqueKey, this.findUniqueKeyRow(uniqueKey));
			break;
	}
};

ObjectDetailUI.prototype.findUniqueKeyRow = function(uniqueKey){
	var $tds = $('#od-tab-uniquekeys').find('tbody').find('td.data');
	var $td;
	for(var i = 0; i < $tds.length; i++){
		$td = $tds.eq(i);
		if($td.data('dbobject') == uniqueKey){
			return $td.parent();
		}
	}
	return null;
};

ObjectDetailUI.prototype.populateUniqueKeyHtmlData = function(uniqueKeyData, $tr){
	var j;
	var uniqueKeyModel;
	var comment;
	var name;
	var columns;
	var columnNames;
	var emptyName = '<span style="color:red;font-weight: bold">'+ DBDesigner.lang.strempty +'</span>';
	var htmlActions = '<a href="#" class="action-btn" title="'+ DBDesigner.lang.stralter +'"><span class="ui-icon ui-icon-pencil">'+ DBDesigner.lang.stralter +'</span></a>'+
		'<a href="#" class="action-btn" title="'+ DBDesigner.lang.strdrop +'"><span class="ui-icon ui-icon-trash">'+ DBDesigner.lang.strdrop +'</span></a>';
	if(uniqueKeyData instanceof UniqueKeyCollection) {
		var $rows = $();
		var uniqueKeys = uniqueKeyData.getUniqueKeys();
		for(var i = 0; i < uniqueKeys.length; i++){
			uniqueKeyModel = uniqueKeys[i].getModel();
			comment = uniqueKeyModel.getComment();
			name = uniqueKeyModel.getName();
			columnNames = [];
			columns = uniqueKeyModel.getColumns();
			for(j = 0; j < columns.length; j++) columnNames.push(columns[j].getName());
			$tr = $('<tr></tr>');
			if(name != '') $('<td></td>').text(name).appendTo($tr);
			else $('<td></td>').html(emptyName).appendTo($tr);
			$('<td></td>').text(columnNames.join(', ')).appendTo($tr);
			$('<td class="data"></td>').data('dbobject', uniqueKeys[i]).html(htmlActions).appendTo($tr);
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
			$rows = $rows.add($tr);
		}
		return $rows;
	}else { 
		uniqueKeyModel = uniqueKeyData.getModel();
		comment = uniqueKeyModel.getComment();
		name = uniqueKeyModel.getName();
		columnNames = [];
		columns = uniqueKeyModel.getColumns();
		for(j = 0; j < columns.length; j++) columnNames.push(columns[j].getName());
		if(uniqueKeyData instanceof UniqueKey && typeof $tr == 'undefined'){
			$tr = $('<tr></tr>');
			if(name != '') $('<td></td>').text(name).appendTo($tr);
			else $('<td></td>').html(emptyName).appendTo($tr);
			$('<td></td>').text(columnNames.join(', ')).appendTo($tr);
			$('<td class="data"></td>').data('dbobject', uniqueKeyData).html(htmlActions).appendTo($tr);
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
		}else if(uniqueKeyData instanceof UniqueKey && typeof $tr != 'undefined'){
			var $tds = $tr.find('td');
			if(name != '') $tds.eq(0).text(name);
			else $tds.eq(0).html(emptyName);
			$tds.eq(1).text(columnNames.join(', '));
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
			else $tr.removeAttr('title');
		}
	}
	return $tr;
};


ObjectDetailUI.prototype.updateForeignKeyView = function(foreignKeyCollection){
	$('#od-tab-foreignkeys').find('tbody').html(this.populateForeignKeyHtmlData(foreignKeyCollection));
};

ObjectDetailUI.prototype.updateSingleForeignKeyView = function(foreignKey, action){
	switch(action){
		case 'add':
			$('#od-tab-foreignkeys').find('tbody').append(this.populateForeignKeyHtmlData(foreignKey));
			break;
		case 'drop':
			this.findForeignKeyRow(foreignKey).remove();
			break;
		case 'alter':
			this.populateForeignKeyHtmlData(foreignKey, this.findForeignKeyRow(foreignKey));
			break;
	}
};

ObjectDetailUI.prototype.findForeignKeyRow = function(foreignKey){
	var $tds = $('#od-tab-foreignkeys').find('tbody').find('td.data');
	var $td;
	for(var i = 0; i < $tds.length; i++){
		$td = $tds.eq(i);
		if($td.data('dbobject') == foreignKey){
			return $td.parent();
		}
	}
	return null;
};

ObjectDetailUI.prototype.populateForeignKeyHtmlData = function(foreignKeyData, $tr){
	var j;
	var foreignKeyModel;
	var comment;
	var name;
	var columns;
	var localColumnNames;
	var foreignColumnNames;
	var emptyName = '<span style="color:red;font-weight: bold">'+ DBDesigner.lang.strempty +'</span>';
	var htmlActions = '<a href="#" class="action-btn" title="'+ DBDesigner.lang.stralter +'"><span class="ui-icon ui-icon-pencil">'+ DBDesigner.lang.stralter +'</span></a>'+
		'<a href="#" class="action-btn" title="'+ DBDesigner.lang.strdrop +'"><span class="ui-icon ui-icon-trash">'+ DBDesigner.lang.strdrop +'</span></a>';
	if(foreignKeyData instanceof ForeignKeyCollection) {
		var $rows = $();
		var foreignKeys = foreignKeyData.getForeignKeys();
		for(var i = 0; i < foreignKeys.length; i++){
			foreignKeyModel = foreignKeys[i].getModel();
			comment = foreignKeyModel.getComment();
			name = foreignKeyModel.getName();
			localColumnNames = [];
			foreignColumnNames = [];
			columns = foreignKeyModel.getColumns();
			for(j = 0; j < columns.length; j++) {
				localColumnNames.push(columns[j].localColumn.getName());
				foreignColumnNames.push(columns[j].foreignColumn.getName());
			}
			$tr = $('<tr></tr>');
			if(name != '') $('<td></td>').text(name).appendTo($tr);
			else $('<td></td>').html(emptyName).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getReferencedTable().getName()).appendTo($tr);
			$('<td></td>').text(localColumnNames.join(', ')).appendTo($tr);
			$('<td></td>').text(foreignColumnNames.join(', ')).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getActionString('update')).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getActionString('delete')).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getMatchType()).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getConstraintOptions()).appendTo($tr);
			$('<td class="data"></td>').data('dbobject', foreignKeys[i]).html(htmlActions).appendTo($tr);
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
			$rows = $rows.add($tr);
		}
		return $rows;
	}
	else {
		foreignKeyModel = foreignKeyData.getModel();
		comment = foreignKeyModel.getComment();
		name = foreignKeyModel.getName();
		localColumnNames = [];
		foreignColumnNames = [];
		columns = foreignKeyModel.getColumns();
		for(j = 0; j < columns.length; j++) {
			localColumnNames.push(columns[j].localColumn.getName());
			foreignColumnNames.push(columns[j].foreignColumn.getName());
		}
		if(foreignKeyData instanceof ForeignKey && typeof $tr == 'undefined'){
			$tr = $('<tr></tr>');
			if(name != '') $('<td></td>').text(name).appendTo($tr);
			else $('<td></td>').html(emptyName).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getReferencedTable().getName()).appendTo($tr);
			$('<td></td>').text(localColumnNames.join(', ')).appendTo($tr);
			$('<td></td>').text(foreignColumnNames.join(', ')).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getActionString('update')).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getActionString('delete')).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getMatchType()).appendTo($tr);
			$('<td></td>').text(foreignKeyModel.getConstraintOptions()).appendTo($tr);
			$('<td class="data"></td>').data('dbobject', foreignKeyData).html(htmlActions).appendTo($tr);
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
		}else if(foreignKeyData instanceof ForeignKey && typeof $tr != 'undefined'){
			var $tds = $tr.find('td');
			if(name != '') $tds.eq(0).text(name);
			else $tds.eq(0).html(emptyName);
			$tds.eq(1).text(foreignKeyModel.getReferencedTable().getName());
			$tds.eq(2).text(localColumnNames.join(', '));
			$tds.eq(3).text(foreignColumnNames.join(', '));
			$tds.eq(4).text(foreignKeyModel.getActionString('update'));
			$tds.eq(5).text(foreignKeyModel.getActionString('delete'));
			$tds.eq(6).text(foreignKeyModel.getMatchType());
			$tds.eq(7).text(foreignKeyModel.getConstraintOptions());
			if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + comment);
			else $tr.removeAttr('title');
		}
	}
	return $tr;
};

ObjectDetailUI.prototype.findForeignKeyRow = function(foreignKey){
	var $tds = $('#od-tab-foreignkeys').find('tbody').find('td.data');
	var $td;
	for(var i = 0; i < $tds.length; i++){
		$td = $tds.eq(i);
		if($td.data('dbobject') == foreignKey){
			return $td.parent();
		}
	}
	return null;
};


ObjectDetailUI.prototype.onInputButtonClick = function(event){
	switch(event.target.id){
		case 'od-alter-table':
			this.getController().alterDBObject();
			break;
		case 'od-drop-table':
			this.getController().dropDBObject();
			break;
		case 'od-add-column':
			this.getController().addDBObject('column');
			break;
		case 'od-add-fk':
			this.getController().addDBObject('fk');
			break;
		case 'od-add-uniq':
			this.getController().addDBObject('uk');
			break;
	}
};

ObjectDetailUI.prototype.onTrHover = function(event){
	var $this = $(this);
	if(event.type == 'mouseenter'){
		$this.addClass('ui-state-hover');
	}else if(event.type == 'mouseleave'){
		$this.removeClass('ui-state-hover');
	}
};

ObjectDetailUI.prototype.onActionButtonClick = function(event){
	event.preventDefault();
	var $button = $(event.currentTarget);
	var cssClass = $button.find('span').attr('class');
	var dbobject = $button.parent().data('dbobject');
	var $tr;
	switch(cssClass){
		case 'ui-icon ui-icon-pencil':
			this.getController().alterDBObject(dbobject);
			break;
		case 'ui-icon ui-icon-circle-arrow-n':
			if(this.getController().moveColumn(dbobject, 'up')){
				$tr = $button.parents('tr:first');
				$tr.insertBefore($tr.prev());
			}
			break;
		case 'ui-icon ui-icon-circle-arrow-s':
			if(this.getController().moveColumn(dbobject, 'down')){
				$tr = $button.parents('tr:first');
				$tr.insertAfter($tr.next());
			}
			break;
		case 'ui-icon ui-icon-trash':
			this.getController().dropDBObject(dbobject);
			break;
	}
};