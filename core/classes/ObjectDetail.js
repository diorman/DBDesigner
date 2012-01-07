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
			event.newValue.bind(DBObject.Event.DBOBJECT_ALTERED, this.onTablePropertyChanged, this);
			if(event.oldValue != null){
				event.oldValue.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onTablePropertyChanged, this);
			}
			break;
	}
}

ObjectDetail.prototype.onTablePropertyChanged = function(event){
	if(event.property == 'name' || event.property == 'comment' || event.property == 'options' || event.property == 'stopEditing'){
		console.log(event.property);
		this.getUI().updateTableView(event.sender);
	}
};

ObjectDetail.prototype.showTable = function(table){
	var model = this.getModel();
	model.setTable(table);
	model.setCollapsed(false);
};

ObjectDetail.prototype.alterTable = function(){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_TABLE, this.getModel().getTable());
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
	dom.find('#od-alter-table').click($.proxy(this.onAlterTableClick, this));
	dom.delegate('table.data-mgr tr', 'hover', this.onTrHover);
	dom.delegate('table.data-mgr tr', 'click', $.proxy(this.onTrClick, this));
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
	var columns = columnCollection.getColumns();
	var $tr;
	var $rows = $();
	var columnModel;
	var comment;
	var htmlChecked = '<span class="ui-icon ui-icon-check">'+ DBDesigner.lang.stryes +'</span>';
	for(var i = 0; i < columns.length; i++){
		columnModel = columns[i].getModel();
		comment = columnModel.getComment();
		$tr = $('<tr></tr>').data('oindex', 'c-' + i);
		$('<td></td>').text(columnModel.getName()).appendTo($tr);
		$('<td></td>').text(columnModel.getFullType()).appendTo($tr);
		$('<td></td>').html(columnModel.isPrimaryKey()?htmlChecked:'&nbsp;').appendTo($tr);
		$('<td></td>').html(columnModel.isForeignKey()?htmlChecked:'&nbsp;').appendTo($tr);
		$('<td></td>').html(columnModel.isUniqueKey()?htmlChecked:'&nbsp;').appendTo($tr);
		$('<td></td>').html(columnModel.isNotnull()?htmlChecked:'&nbsp;').appendTo($tr);
		$('<td></td>').text(columnModel.getDefault()).appendTo($tr);
		if(comment != '') $tr.attr('title', DBDesigner.lang.strcomment + ': ' + columnModel.getComment())
		$rows = $rows.add($tr);
	}
	$('#od-tab-columns').find('tbody').html($rows);
};

ObjectDetailUI.prototype.updateForeignKeyView = function(foreignKeyCollection){
	
};

ObjectDetailUI.prototype.onAlterTableClick = function(event){
	this.getController().alterTable();
};

ObjectDetailUI.prototype.onTrHover = function(event){
	var $this = $(this);
	if(event.type == 'mouseenter' && !$this.hasClass('ui-state-active')){
		$this.addClass('ui-state-hover');
	}else if(event.type == 'mouseleave'){
		$this.removeClass('ui-state-hover');
	}
};

ObjectDetailUI.prototype.onTrClick = function(event){
	var $tr = $(event.currentTarget);
	$tr.parent().find('tr.ui-state-active').removeClass('ui-state-active');
	$tr.addClass('ui-state-active');
	console.log($tr.data('oindex'));
};