
DBDesigner = function(data){
	
	
	this.setToolBar();
	this.setCanvas();
	this.setObjectDetail();
	this.setTableDialog();
	this.setTableCollection();
	this.setGlobalUIBehavior();
	
	//this.toolBar.setAction(globals.Action.ADD_TABLE);
	
};

/**
 * Initialize the toolbar
 */
DBDesigner.prototype.setToolBar = function(){
	this.toolBar = new ToolBar();
	this.toolBar.bind(DBDesigner.Event.PROPERTY_CHANGED, this.actionChanged, this);
	/*var a = {};
	a[DBDesigner.Action.SELECT] = true;
	this.toolBar.setActionState(a);*/
};

/**
 * Listener for changes on toolbar's properties
 */
DBDesigner.prototype.actionChanged = function(event){
	if(event.property == 'action'){
		switch(event.newValue){
			case DBDesigner.Action.ADD_TABLE:
				this.canvas.setCapturingPlacement(true);
				break;
			case DBDesigner.Action.SELECT:
				this.canvas.setCapturingPlacement(false);
				break;
		}
	}
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
	this.toolBar.setAction(DBDesigner.Action.SELECT);
	this.tableDialog.createTable({top:event.top, left:event.left});
};


/**
 * Initialize the objectdetail
 */
DBDesigner.prototype.setObjectDetail = function(){
	this.objectDetail = new ObjectDetail();
	this.objectDetail.bind(DBDesigner.Event.PROPERTY_CHANGED, this.objectDetailChanged, this);
	this.objectDetail.setCollapsed(true);
};

/**
 * Listener for changes on objectDetail's properties
 */
DBDesigner.prototype.objectDetailChanged = function(event){
	switch(event.property){
		case 'collapsed':
			this.canvas.setCollapsed(!event.newValue);
			break;
	}
};

DBDesigner.prototype.setTableDialog = function() {
	this.tableDialog = new TableDialog();
};

DBDesigner.prototype.setTableCollection = function() {
	this.tableCollection = new TableCollection();
};

DBDesigner.prototype.setGlobalUIBehavior = function(){
	$('a.button').live('hover', function(event){ 
		var $this = $(this);
		if(!$this.hasClass('ui-state-disabled')) $this.toggleClass('ui-state-hover'); 
	});
};







DBDesigner.init = function(){
	DBDesigner.app = new DBDesigner();
};