
DBDesigner = function(){
	if(!Vector.checkSupport()){
        $('<p></p>').text(DBDesigner.lang.strnographics).appendTo('body');
        return;
    }
	
	this.setGlobalUIBehavior();
	this.setToolBar();
	this.setCanvas();
	this.setObjectDetail();
	this.setTableDialog();
	this.setColumnDialog();
	this.setForeignKeyDialog();
	this.setUniqueKeyDialog();
	this.setConfirmDialog();
	this.setAlertDialog();
	this.setForwardEngineerDialog();
	this.setReverseEngineerDialog();
};

DBDesigner.init = function(){
	DBDesigner.app = new DBDesigner();
	JSONLoader.load(DBDesigner.erdiagramStructure);
	DBDesigner.app.toolBar.setDisabled(false);
	Ajax.startSessionTimer();
};


DBDesigner.prototype.doAction = function(action, extra) {
	switch(action){
		case DBDesigner.Action.FORWARD_ENGINEER:
			this.forwardEngineerDialog.open();
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.REVERSE_ENGINEER:
			Ajax.sendRequest(Ajax.Action.LOAD_SCHEMA_STRUCTURE, null, function(response){
				var tables = response.data.tables || [];
				DBDesigner.app.reverseEngineerDialog.open(tables);
			});
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALIGN_TABLES:
			this.alignTables();
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ADD_TABLE:
			this.canvas.setCapturingPlacement(true);
			break;
		case DBDesigner.Action.SAVE:
			Ajax.sendRequest(Ajax.Action.SAVE);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ADD_COLUMN:
			this.columnDialog.createColumn(this.getTableCollection().getSelectedTables()[0]);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_COLUMN:
			this.columnDialog.editColumn(extra);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_TABLE:
			this.tableDialog.editTable(extra);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.SELECT:
			this.canvas.setCapturingPlacement(false);
			break;
		case DBDesigner.Action.ADD_FOREIGNKEY:
			this.foreignKeyDialog.createForeignKey(this.getTableCollection().getSelectedTables()[0]);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_FOREIGNKEY:
			this.foreignKeyDialog.editForeignKey(extra);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ADD_UNIQUEKEY:
			this.uniqueKeyDialog.createUniqueKey(this.getTableCollection().getSelectedTables()[0]);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_UNIQUEKEY:
			this.uniqueKeyDialog.editUniqueKey(extra);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.SHOW_TABLE_DETAIL:
			this.objectDetail.showTable(extra);
			break;
		case DBDesigner.Action.DROP_TABLE:
			var message, scope, method, selection, count;
			if(typeof extra == 'undefined') {
				selection = this.getTableCollection();
				count = selection.count();
				if(count == 1) {
					extra = selection.getSelectedTables()[0];
				} else {
					scope = selection;
					method = selection.dropSelectedTables;
					message = DBDesigner.lang.strconfdroptables.replace('%d', count);
				}
			}
			if(typeof extra != 'undefined') {
				scope = extra;
				method = extra.drop;
				message = DBDesigner.lang.strconfdroptable
					.replace(/&amp;quot;/g, '"')
					.replace('%s', extra.getName());
			}
			this.confirmDialog.show(message, DBDesigner.lang.strdrop, {
				scope: scope,
				method: method
			});
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.DROP_COLUMN:
			var message = DBDesigner.lang.strconfdropcolumn
				.replace(/&amp;quot;/g, '"')
				.replace('%s', extra.getName())
				.replace('%s', extra.getParent().getName());
			this.confirmDialog.show(message, DBDesigner.lang.strdrop, {
				scope: extra,
				method: extra.drop
			});
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.DROP_UNIQUEKEY:
			var message = DBDesigner.lang.strconfdropconstraint
				.replace(/&amp;quot;/g, '"')
				.replace('%s', extra.getName())
				.replace('%s', extra.getParent().getName());
			this.confirmDialog.show(message, DBDesigner.lang.strdrop, {
				scope: extra,
				method: extra.drop
			});
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.DROP_FOREIGNKEY:
			var message = DBDesigner.lang.strconfdropconstraint
				.replace(/&amp;quot;/g, '"')
				.replace('%s', extra.getName())
				.replace('%s', extra.getParent().getName());
			this.confirmDialog.show(message, DBDesigner.lang.strdrop, {
				scope: extra,
				method: extra.drop
			});
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
	}
};

/**
 * Initialize the toolbar
 */
DBDesigner.prototype.setToolBar = function(){
	this.toolBar = new ToolBar();
	this.toolBar.bind(ToolBar.Event.ACTION_CHANGED, this.toolBarActionChanged, this);
};

DBDesigner.prototype.toolBarActionChanged = function(event){
	this.doAction(event.action);
};

/**
 * Initialize the canvas
 */
DBDesigner.prototype.setCanvas = function(){
	this.canvas = new Canvas();
	this.canvas.bind(Canvas.Event.PLACEMENT_CAPTURED, this.canvasPlacementCaptured, this);
};

DBDesigner.prototype.canvasPlacementCaptured = function(event){
	//this.tableDialog.getUI().getDom().dialog('open');
	if(DBDesigner.Action.ADD_TABLE){
		this.toolBar.setAction(DBDesigner.Action.SELECT);
		this.tableDialog.createTable(event.position);
	}
};


/**
 * Initialize the objectdetail
 */
DBDesigner.prototype.setObjectDetail = function(){
	this.objectDetail = new ObjectDetail();
	this.objectDetail.bind(ObjectDetail.Event.STATE_CHANGED, this.objectDetailStateChanged, this);
	this.objectDetail.setCollapsed(true);
};

DBDesigner.prototype.objectDetailStateChanged = function(event){
	this.canvas.setCollapsed(!event.isCollapsed);
};


DBDesigner.prototype.setTableDialog = function() {
	this.tableDialog = new TableDialog();
};

DBDesigner.prototype.setColumnDialog = function() {
	this.columnDialog = new ColumnDialog();
};

DBDesigner.prototype.setForeignKeyDialog = function() {
	this.foreignKeyDialog = new ForeignKeyDialog();
};

DBDesigner.prototype.setUniqueKeyDialog = function() {
	this.uniqueKeyDialog = new UniqueKeyDialog();
};

DBDesigner.prototype.getTableCollection = function() {
	if(typeof this._tableCollection == 'undefined'){
		this._tableCollection = new TableCollection();
		this._tableCollection.bind(Table.Event.SELECTION_CHANGED, this.tableSelectionChanged, this);
	}
	return this._tableCollection;
};

DBDesigner.prototype.tableSelectionChanged = function(event){
	var actionState = {};
	switch(this.getTableCollection().count()){
		case 0:
			actionState[DBDesigner.Action.ADD_COLUMN] = false;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
			actionState[DBDesigner.Action.ADD_UNIQUEKEY] = false;
			actionState[DBDesigner.Action.DROP_TABLE] = false;
			break;
		case 1:
			actionState[DBDesigner.Action.ADD_COLUMN] = true;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = true;
			actionState[DBDesigner.Action.ADD_UNIQUEKEY] = true;
			actionState[DBDesigner.Action.DROP_TABLE] = true;
			break;
		default:
			actionState[DBDesigner.Action.ADD_COLUMN] = false;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
			actionState[DBDesigner.Action.ADD_UNIQUEKEY] = false;
			actionState[DBDesigner.Action.DROP_TABLE] = true;
			break;
	}
	this.toolBar.setActionState(actionState);
};

DBDesigner.prototype.alterTable = function(event){
	this.tableDialog.editTable(event.table);
};


DBDesigner.prototype.setGlobalUIBehavior = function(){
	$('body')
		.tooltip({track: true})
		.on('hover', 'a.button', function(event){ 
			var $this = $(this);
			if(!$this.hasClass('ui-state-disabled')) $this.toggleClass('ui-state-hover'); 
		});
};

DBDesigner.prototype.setConfirmDialog = function(){
	this.confirmDialog = new ConfirmDialog();
};

DBDesigner.prototype.setAlertDialog = function(){
	this.alertDialog = new AlertDialog();
};

DBDesigner.prototype.setForwardEngineerDialog = function(){
	this.forwardEngineerDialog = new ForwardEngineerDialog();
};

DBDesigner.prototype.setReverseEngineerDialog = function(){
	this.reverseEngineerDialog = new ReverseEngineerDialog();
};

DBDesigner.prototype.setDisabled = function(b){
	if(b) {
		if(!this._$overlay) { this._$overlay = $('<div class="ui-widget-overlay"></div>'); }
		$('body').append(this._$overlay);
	} else if(this._$overlay) { this._$overlay.detach(); }
	this.toolBar.setDisabled(b);
};

DBDesigner.prototype.alignTables = function() {
    var canvasSize = this.canvas.getSize();
	var margin = {x: 20, y: 20};
	var tableSize;
	var left, top, max = 0;
	var tables = this.getTableCollection().getTables();
    left = margin.x;
    top = margin.y;
    for(var i = 0; i < tables.length; i++){
        tableSize = tables[i].getSize();
        if (top + tableSize.height > canvasSize.height && top != margin.y) {
            left += margin.x + max;
            top = margin.y;
            max = 0;
        }
        tables[i].setPosition({top: top, left: left});
        top += margin.y + tableSize.height;
        if (tableSize.width > max) max = tableSize.width;
    }
};