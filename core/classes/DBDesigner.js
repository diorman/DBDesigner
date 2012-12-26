
DBDesigner = function(data){
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
	//this.toolBar.setAction(globals.Action.ADD_TABLE);
	
};

DBDesigner.init = function(){
	DBDesigner.app = new DBDesigner();
};


DBDesigner.prototype.doAction = function(action, extra) {
	switch(action){	
		case DBDesigner.Action.ADD_TABLE:
			DBDesigner.app.canvas.setCapturingPlacement(true);
			break;
		case DBDesigner.Action.ADD_COLUMN:
			DBDesigner.app.columnDialog.createColumn(this.getTableCollection().getSelectedTables()[0]);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_COLUMN:
			DBDesigner.app.columnDialog.editColumn(extra);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_TABLE:
			DBDesigner.app.tableDialog.editTable(extra);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.SELECT:
			DBDesigner.app.canvas.setCapturingPlacement(false);
			break;
		case DBDesigner.Action.ADD_FOREIGNKEY:
			DBDesigner.app.foreignKeyDialog.createForeignKey(this.getTableCollection().getSelectedTables()[0]);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_FOREIGNKEY:
			DBDesigner.app.foreignKeyDialog.editForeignKey(extra);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ADD_UNIQUEKEY:
			DBDesigner.app.uniqueKeyDialog.createUniqueKey(this.getTableCollection().getSelectedTables()[0]);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_UNIQUEKEY:
			DBDesigner.app.uniqueKeyDialog.editUniqueKey(extra);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.SHOW_TABLE_DETAIL:
			this.objectDetail.showTable(extra);
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

DBDesigner.prototype.getConstraintList = function(){
	if(typeof this._constraintList == 'undefined') this._constraintList = [];
	return this._constraintList;
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
	DBDesigner.app.toolBar.setActionState(actionState);
};

DBDesigner.prototype.alterTable = function(event){
	this.tableDialog.editTable(event.table);
};


DBDesigner.prototype.setGlobalUIBehavior = function(){
	$('body')
		.delegate('a.button', 'hover', function(event){ 
			var $this = $(this);
			if(!$this.hasClass('ui-state-disabled')) $this.toggleClass('ui-state-hover'); 
		});
};

DBDesigner.prototype.setConfirmDialog = function(){
	this.confirmDialog = new ConfirmDialog();
};
