EventDispatcher = {
	bind: function (eventName, eventListener, eventScope) {
		if(!this._eventListeners) {
			this._eventListeners = [];
			this._eventScopes = [];
		}
		if(!this._eventListeners[eventName]){
			this._eventListeners[eventName] = [];
			this._eventScopes[eventName] = [];
		}
		for(var i = 0; i < this._eventListeners[eventName].length; i++){
			if(this._eventScopes[eventName][i] === eventScope && this._eventListeners[eventName][i] === eventListener){
				return;
			}
		}
		this._eventListeners[eventName].push(eventListener);
		this._eventScopes[eventName].push(eventScope);
	},
	unbind: function (eventName, eventListener, eventScope){
		if(typeof this._eventScopes[eventName] == "undefined") return;
		for(var i = 0; i < this._eventListeners[eventName].length; i++){
			if(this._eventScopes[eventName][i] === eventScope && this._eventListeners[eventName][i] === eventListener){
				this._eventListeners[eventName].splice(i, 1);
				this._eventScopes[eventName].splice(i, 1);
				return;
			}
		}
	},
	trigger: function (eventName) {
		if(!this._eventListeners || !this._eventListeners[eventName]) return;
		var i;
		var event = {
			sender: this, 
			type: eventName
		};
		var listeners = [].concat(this._eventListeners[eventName]);
		var scopes = [].concat(this._eventScopes[eventName]);
		
		if(arguments.length > 1 && typeof arguments[1] == 'object') $.extend(event, arguments[1]);
		
		for (i in listeners){
			listeners[i].apply(scopes[i], [event]);
		}
	}
};
	

Component = {
	setModel: function(model){
		this._model = model;
		if(typeof this.modelPropertyChanged == 'function')
			this._model.bind(DBDesigner.Event.PROPERTY_CHANGED, this.modelPropertyChanged, this);
	},

	getModel: function(){
		if(typeof this._model == 'undefined') this._model = null;
		return this._model;
	},

	setUI: function(ui){
		this._ui = ui;
	},

	getUI: function(){
		if(typeof this._ui == 'undefined') this._ui = null;
		return this._ui; 
	}
};
$.extend(Component, EventDispatcher);
ComponentUI = {
	init: function(){
		var templateID = this.getTemplateID();
		if(templateID != null) this.setDom(DBDesigner.templateManager[templateID]);
		if(typeof this.bindEvents == 'function') this.bindEvents();
	},
	
	setTemplateID: function(templateID){
		this._templateID = templateID;
	},
	
	getTemplateID: function(){
		if(typeof this._templateID == 'undefined') this._templateID = null;
		return this._templateID;
	},
	
	setController: function(controller){
		this._controller = controller;
	},
	
	getController: function(){
		if(typeof this._controller == 'undefined') this._controller = null;
		return this._controller;
	},
	
	setDom: function(template){
		this._dom = $(template);
	},
	
	getDom: function(){
		if(typeof this._dom == 'undefined') this._dom = null;
		return this._dom;
	},
	
	find: function(selector){
		var dom = this.getDom();
		if(typeof dom == 'undefined') return $();
		return dom.find(selector);
	}
};

ComponentModel = function(){};
$.extend(ComponentUI, EventDispatcher);



Vector = {
    checkSupport: function(){
        if(document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")){
            Vector.type = Vector.SVG;
            Vector.createElement = function(tagName){
                return document.createElementNS("http://www.w3.org/2000/svg", tagName);
            };
            return true;
        }
		
		else if($.browser.msie) {
            Vector.type = Vector.VML;
            document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
            try {
                !document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                Vector.createElement = function(tagName) {
                    return document.createElement('<rvml:' + tagName + ' class="rvml">');
                };
            }catch (e) {
                Vector.createElement = function(tagName) {
                    return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
                };
            }
            return true;
        }
        return false;
    },
	
	getPoints: function(pointsX, pointsY){
		var s, i, p = "";
		if(Vector.type == Vector.VML) s = " ";
		else s = ",";
		for(i = 0; i < pointsX.length; i++){
			if(p != "") p += " ";
			p += pointsX[i] + s + pointsY[i];
		}
		return p;
	}
};



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
		case DBDesigner.Action.DROP_TABLE:
			var message, scope, method, selection, count;
			if(typeof extra == 'undefined') {
				selection = DBDesigner.app.getTableCollection();
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
		.on('hover', 'a.button', function(event){ 
			var $this = $(this);
			if(!$this.hasClass('ui-state-disabled')) $this.toggleClass('ui-state-hover'); 
		});
};

DBDesigner.prototype.setConfirmDialog = function(){
	this.confirmDialog = new ConfirmDialog();
};
/**
 *
 * Class to manage the toolbar of the designer
 *
 */
ToolBar = function() {
	var model = new ToolBarModel();
	model.bind(DBDesigner.Event.PROPERTY_CHANGED, this.modelPropertyChanged, this);
	
	this.setModel(model);
	this.setUI(new ToolBarUI(this));
};
$.extend(ToolBar.prototype, Component);

ToolBar.prototype.setAction = function(action) {
	this.getModel().setAction(action);
};

ToolBar.prototype.getAction = function() {
	return this.getModel().getAction();
};

ToolBar.prototype.setActionState = function(actionState) {
	this.getModel().setActionState(actionState);
};

ToolBar.prototype.getActionState = function() {
	return this.getModel().getActionState();
};

ToolBar.prototype.modelPropertyChanged = function(event) {
	if(event.property == 'action') {
		this.getUI().updateCurrentAction();
		this.trigger(ToolBar.Event.ACTION_CHANGED, {action: event.newValue});
	}
	else if(event.property == 'actionState') this.getUI().updateActionState();	
}


// *****************************************************************************


/**
 *
 * The Toolbar Model
 *
 */
ToolBarModel = function(){
	this.setAction(DBDesigner.Action.SELECT);
	this.setActionState({});
};
$.extend(ToolBarModel.prototype, EventDispatcher);


ToolBarModel.prototype.setAction = function(action) {
	var old = this.getAction();
	if(old != action){
		this._action = action;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'action', oldValue: old, newValue: action});	
	}
};

ToolBarModel.prototype.getAction = function() {
	if(typeof this._action == 'undefined') this._action = DBDesigner.Action.SELECT;
	return this._action;
};

ToolBarModel.prototype.setActionState = function(actionState) {
	this._actionState = $.extend({}, this.getActionState(), actionState);
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'actionState'});	
};

ToolBarModel.prototype.getActionState = function() {
	if(typeof this._actionState == 'undefined'){
		this._actionState = {};
		this._actionState[DBDesigner.Action.SELECT] = true;
		this._actionState[DBDesigner.Action.ADD_TABLE] = true;
		this._actionState[DBDesigner.Action.ADD_COLUMN] = false;
		this._actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
		this._actionState[DBDesigner.Action.ADD_UNIQUEKEY] = false;
		this._actionState[DBDesigner.Action.SAVE] = true;
		this._actionState[DBDesigner.Action.DROP_TABLE] = false;
	}
	return this._actionState;
};


// *****************************************************************************


/**
 *
 * Toolbar View
 *
 */

ToolBarUI = function(controller){
	this.setTemplateID('ToolBar');
	this.setController(controller);
	this.init();
	this.updateCurrentAction();
	this.updateActionState();
	this.getDom().appendTo('body');
};
$.extend(ToolBarUI.prototype, ComponentUI);

ToolBarUI.prototype.bindEvents = function(){
	this.getDom().find('a').bind({
		click: $.proxy(this.buttonPressed, this)
	});
};

ToolBarUI.prototype.buttonPressed = function(event) {
	event.preventDefault();
	
	var $target = $(event.currentTarget);
	var action = DBDesigner.Action.SELECT;
	
	if($target.is('.ui-state-active, .ui-state-disabled')) return;
	if($target.hasClass('add-table')) action = DBDesigner.Action.ADD_TABLE;
	if($target.hasClass('add-column')) action = DBDesigner.Action.ADD_COLUMN;
	if($target.hasClass('add-foreignkey')) action = DBDesigner.Action.ADD_FOREIGNKEY;
	if($target.hasClass('add-uniquekey')) action = DBDesigner.Action.ADD_UNIQUEKEY;
	if($target.hasClass('drop-table')) action = DBDesigner.Action.DROP_TABLE;
	if($target.hasClass('save')) action = DBDesigner.Action.SAVE;
	this.getController().setAction(action);
};

ToolBarUI.prototype.updateCurrentAction = function() {
	var model = this.getController().getModel();
	var dom = this.getDom();
	var sel = '.' + this.getCssClass(model.getAction());
	
	dom.find('a').removeClass('ui-state-active').filter(sel).addClass('ui-state-active');
	
};

ToolBarUI.prototype.updateActionState = function() {
	var model = this.getController().getModel();
	var dom = this.getDom();
	var sel = '';
	var actionState = model.getActionState();
	for(var action in actionState){
		sel = '.' + this.getCssClass(action);
		if(actionState[action] === false) dom.find(sel).addClass('ui-state-disabled');
		else dom.find(sel).removeClass('ui-state-disabled');
	}
};


ToolBarUI.prototype.getAction = function(cssClass){};
ToolBarUI.prototype.getCssClass = function(action) {
	switch(action){
		case DBDesigner.Action.ADD_TABLE:
			return 'add-table';
		case DBDesigner.Action.ADD_COLUMN:
			return 'add-column';
		case DBDesigner.Action.ADD_FOREIGNKEY:
			return 'add-foreignkey';
		case DBDesigner.Action.ADD_UNIQUEKEY:
			return 'add-uniquekey';
		case DBDesigner.Action.DROP_TABLE:
			return 'drop-table';
		case DBDesigner.Action.SAVE:
			return 'save';
		default:
			return 'select';
	}
};


/**
 *
 * Class to manage the component of the designer where tables are drawn
 * 
 */
Canvas = function() {
	var model = new CanvasModel();
	model.bind(DBDesigner.Event.PROPERTY_CHANGED, this.modelPropertyChanged, this);
	
	this.setModel(model);
	this.setUI(new CanvasUI(this));
};
$.extend(Canvas.prototype, Component);

/**
 * Sets the collapsed state of the canvas
 * @param b if true, the canvas is collapsed
 *			otherwise, the canvas is expanded
 *			
 */
Canvas.prototype.setCollapsed = function(b) {
	this.getModel().setCollapsed(b);
};

/**
 * Checks the collapsed state of the canvas
 * @return a boolean with the value of the property
 */
Canvas.prototype.isCollapsed = function() {
	return this.getModel().isCollapsed();
};

/**
 * Listener for model updates
 * @param event object with information related to the event triggered
 */
Canvas.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'capturingPlacement':
		case 'collapsed':
			ui.updateCanvasState();
			break;
	}	
};

/**
 * Sets the canvas to capture the next mousedown action to place a new object in it
 * @param b if true, enable the capture of the next mousedown action
 *			otherwise, disable the capture of the next mousedown action
 */
Canvas.prototype.setCapturingPlacement = function(b) {
	this.getModel().setCapturingPlacement(b);
};

/**
 * Checks the capture state of the canvas
 * @return a boolean with the value of the property
 */
Canvas.prototype.isCapturingPlacement = function() {
	return this.getModel().isCapturingPlacement();
};

Canvas.prototype.placementCaptured = function(position) {
	this.trigger(Canvas.Event.PLACEMENT_CAPTURED, {position: position});
};

// *****************************************************************************

/**
 *
 * Model for canvas component 
 * 
 */
CanvasModel = function() {
	
};
$.extend(CanvasModel.prototype, EventDispatcher);


/**
 * Sets the collapsed state of the canvas
 * @param b if true, the canvas is collapsed
 *			otherwise, the canvas is expanded
 *			
 */
CanvasModel.prototype.setCollapsed = function(b) {
	var oldState = this.isCollapsed();
	if(oldState != b){
		this._collapsed = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'collapsed', oldValue: oldState, newValue: b});
	}
};

/**
 * Checks the collapsed state of the canvas
 * @return a boolean with the value of the property
 */
CanvasModel.prototype.isCollapsed = function() {
	if(typeof this._collapsed == 'undefined') this._collapsed = false;
	return this._collapsed;
};

/**
 * Sets the canvas to capture the next mousedown action to place a new object in it
 * @param b if true, enable the capture of the next mousedown action
 *			otherwise, disable the capture of the next mousedown action
 */
CanvasModel.prototype.setCapturingPlacement = function(b) {
	var oldState = this.isCapturingPlacement();
	if(oldState != b){
		this._capturingPlacement = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'capturingPlacement', oldValue: oldState, newValue: b});
	}
	
};

/**
 * Checks the capture state of the canvas
 * @return a boolean with the value of the property
 */
CanvasModel.prototype.isCapturingPlacement = function() {
	if(typeof this._capturingPlacement == 'undefined') this._capturingPlacement = false;
	return this._capturingPlacement;
};

// *****************************************************************************

/**
 *
 * View for canvas component 
 * 
 */
CanvasUI = function(controller) {
	this.setTemplateID('Canvas');
	this.setController(controller);
	this.init();
	var dom = this.getDom();
	if(Vector.type == Vector.SVG){
		dom.append(Vector.createElement("svg"));
	}
	dom.appendTo('body').multiDraggableArea({filter: 'div.db-table'});
};
$.extend(CanvasUI.prototype, ComponentUI);

/**
 * Attaches events to html objects 
 */
CanvasUI.prototype.bindEvents = function() {
	this.getDom()
		.mousedown($.proxy(this.mousePressed, this))
		
		//db table
		.on('dblclick', 'div.db-table div.header', function(event){ 
			var table = $(this).parents('.db-table').data('dbobject');
			if(table instanceof Table) TableUI.prototype.onHeaderDblClicked.call(table.getUI(), event);
		})
		
		.on('click', 'div.db-table a.button', function(event){ 
			var table = $(this).parents('.db-table').data('dbobject');
			if(table instanceof Table) TableUI.prototype.onButtonPressed.call(table.getUI(), event);
		})
	
		//db column
		.on('dblclick', 'div.db-column', function(event){ 
			var column = $(this).data('dbobject');
			if(column instanceof Column) ColumnUI.prototype.onDblClick.call(column.getUI(), event);
		})
		
		.on('hover', 'div.db-column', function(event){ 
			var $this = $(this);
			$this.toggleClass('db-column-hover'); 
		})
		
		//db foreign keys
		.on('hover', 'polyline', function(event){ 
			var foreignKey = $(this).data('dbobject');
			if(foreignKey instanceof ForeignKey) ForeignKeyUI.prototype.onConnectorHover.call(foreignKey.getUI(), event);
		})
		
		.on('mousedown', 'polyline', function(event){ 
			var foreignKey = $(this).data('dbobject');
			if(foreignKey instanceof ForeignKey) ForeignKeyUI.prototype.onConnectorMouseDown.call(foreignKey.getUI(), event);
		})
		
		.on('dblclick', 'polyline', function(event){ 
			var foreignKey = $(this).data('dbobject');
			if(foreignKey instanceof ForeignKey) ForeignKeyUI.prototype.onConnectorDblclick.call(foreignKey.getUI(), event);
		});
		
};

/**
 * Event fired when is performed a mousedown action within the canvas element 
 */
CanvasUI.prototype.mousePressed = function(event) {
	var dom = this.getDom();
	var offset = dom.offset();
	var innerCanvas = dom.find('div.inner-canvas');
	var controller = this.getController();
	
    if(event.which == 1 && event.pageX - offset.left < innerCanvas.width() && event.pageY - offset.top < innerCanvas.height()){
		if(controller.isCapturingPlacement()){
			event.stopImmediatePropagation();
			var position = {
                left: event.pageX + dom.scrollLeft() - offset.left,
                top: event.pageY + dom.scrollTop() - offset.top
            };
			controller.placementCaptured(position);
		}
		/*
		if(this.model.isAddingTable()){
            event.stopImmediatePropagation();
            var pos = {
                x: event.pageX + this.view.$container.scrollLeft() - this.view.$container.offset().left,
                y: event.pageY + this.view.$container.scrollTop() - this.view.$container.offset().top
            };
            this.model.setNewTablePosition(pos);
            this.model.dispatchEvent(CanvasEvent.NEW_TABLE_POSITION_SET);
        }*/
    }else{
		//Avoid start selection when clicking on scroll bars
        event.stopImmediatePropagation();
    }
};

/**
 * Updates the presentation of the canvas according to the model
 */
CanvasUI.prototype.updateCanvasState = function() {
	var controller = this.getController();
	var isCollapsed = controller.isCollapsed();
	var $canvas = this.getDom();
	var isCapturingPlacement = controller.isCapturingPlacement();
	
	if(isCollapsed && !$canvas.hasClass('canvas-collapsed')) {
		$canvas.addClass('canvas-collapsed');
	}
	else if(!isCollapsed && $canvas.hasClass('canvas-collapsed')) {
		$canvas.removeClass('canvas-collapsed');
	}
	
	if(isCapturingPlacement && $canvas.css('cursor') != 'crosshair'){
		$canvas.css('cursor', 'crosshair');
	}
	else if(!isCapturingPlacement && $canvas.css('cursor') != 'default'){
		$canvas.css('cursor', 'default');
	}
};/**
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
DBObjectDialog = {
	getDBObjectModel: function(){
		return this.getModel().getDBObjectModel();
	}
}
$.extend(DBObjectDialog, Component);

DBObjectDialogModel = {
	setAction: function(action){
		this._action = action;
	},
	getAction: function(){
		if(typeof this._action == 'undefined') this._action = null;
		return this._action;
	},
	setDBObjectModel: function(dbObjectModel){
		this._dbObjectModel = dbObjectModel;
	},
	getDBObjectModel: function(){
		if(typeof this._dbObjectModel == 'undefined') this._dbObjectModel = null;
		return this._dbObjectModel;
	}
};
$.extend(DBObjectDialogModel, EventDispatcher);



DBObjectDialogUI = {
	cleanErrors: function(){
		this.getDom().find('ul.error-list').empty().hide();
	},
	
	showError: function(message, field){
		message = (typeof field == 'undefined')? message : field + ': ' + message;
		$('<li></li>').text(message).appendTo(this.getDom().find('ul.error-list').show());
	},
	
	close: function(){
		this.getDom().dialog('close');
	},
	focus: function (){
		$(document.activeElement).blur();
		var $focusable = this.find('.focusable');
		window.setTimeout(function(){
			$focusable.focus();
		}, 250);
	},
	setKeyPressEvent: function(){
		var _this = this;
		this.getDom().keypress(function(event){
			var $eventTarget = $(event.target);
			if(event.keyCode == 13 && $eventTarget.is('input') && !$eventTarget.is('input[type="button"]')){
				_this.save();
			}
		});
	},
	setDialogCloseEvent: function(){
		var controller = this.getController(); 
		this.getDom().bind('dialogclose', function(event){
			if(controller.clearReferences){ controller.clearReferences(); }
			
			// Clear any reference to any model previously edited/created
			controller.getModel().setDBObjectModel(null);
		});
	}
};
$.extend(DBObjectDialogUI, ComponentUI);


TableDialog = function() {	
	this.setModel(new TableDialogModel());
	this.setUI(new TableDialogUI(this));
};

$.extend(TableDialog.prototype, DBObjectDialog);

TableDialog.prototype.createTable = function(position){
	var tableModel = new TableModel();
	var model = this.getModel();
	tableModel.setPosition(position);
	model.setDBObjectModel(tableModel);
	model.setAction(DBDesigner.Action.ADD_TABLE);
	this.getUI().open(DBDesigner.lang.strcreatetable);
};

TableDialog.prototype.editTable = function(table){
	var model = this.getModel();
	model.setDBObjectModel(table.getModel());
	model.setAction(DBDesigner.Action.ALTER_TABLE);
	this.getUI().open(DBDesigner.lang.straltertable);
};

TableDialog.prototype.saveTable = function(form){
	var model = this.getModel();
	var tableModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		if(action == DBDesigner.Action.ALTER_TABLE) tableModel.startEditing();
		
		tableModel.setName(form.name);
		tableModel.setWithoutOIDS(form.withoutOIDS);
		tableModel.setComment(form.comment);
		tableModel.setSelected(true);
		
		if(action == DBDesigner.Action.ADD_TABLE){
			var tableCollection = DBDesigner.app.getTableCollection();
			tableCollection.emptySelection();
			tableCollection.add(new Table(tableModel));
		}
		else tableModel.stopEditing();
		return true;
	}
	return false;
};

TableDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	if(form.name == '') {
		ui.showError(DBDesigner.lang.strtableneedsname, DBDesigner.lang.strname);
		isValid = false;
	}
	if(DBDesigner.app.getTableCollection().tableNameExists(form.name, this.getDBObjectModel())){
		ui.showError(DBDesigner.lang.strtableexists);
		isValid = false;
	}
	
	return isValid;
}

// *****************************************************************************

TableDialogModel = function() {
	
};

$.extend(TableDialogModel.prototype, DBObjectDialogModel);

// *****************************************************************************

TableDialogUI = function(controller) {
	this.setTemplateID('TableDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};

$.extend(TableDialogUI.prototype, DBObjectDialogUI);

TableDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('div.submit-buttons').on('click', 'input', $.proxy(this.submitButtonClicked, this));
	this.setDialogCloseEvent();
	this.setKeyPressEvent();
};


TableDialogUI.prototype.open = function(title){
	var tableModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(tableModel != null){
		$('#table-dialog_table-name').val(tableModel.getName());
		$('#table-dialog_withoutoids').prop('checked', tableModel.getWithoutOIDS());
		$('#table-dialog_table-comment').val(tableModel.getComment());
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
};

TableDialogUI.prototype.submitButtonClicked = function(event){
	if(event.target.id == 'table-dialog_cancel'){ this.close(); }
	else {
		var saveSuccess = this.save(false);
		if(event.target.id == 'table-dialog_save' && saveSuccess){ this.close(); }
		else if(event.target.id == 'table-dialog_save2' && saveSuccess){ 
			var controller = this.getController();
			var savedModel = controller.getModel().getDBObjectModel();
			var position = savedModel.getPosition();
			var size = savedModel.getSize();
			position.left += 10 + size.width;
			controller.createTable(position);
		}
	}
};

TableDialogUI.prototype.save = function(closeWindow){
	closeWindow = (typeof closeWindow == 'undefined')? true : closeWindow;
	this.cleanErrors();
	var form = {
		name: $.trim($('#table-dialog_table-name').val()),
		withoutOIDS: $('#table-dialog_withoutoids').prop('checked'),
		comment: $.trim($('#table-dialog_table-comment').val())
	};
	var saveSuccess = this.getController().saveTable(form);
	if(saveSuccess && closeWindow) this.close(); 
	return saveSuccess;
};
ColumnDialog = function() {	
	this.setModel(new ColumnDialogModel());
	this.setUI(new ColumnDialogUI(this));
};

$.extend(ColumnDialog.prototype, DBObjectDialog);

ColumnDialog.prototype.createColumn = function(table){
	var model = this.getModel();
	var columnModel = new ColumnModel();
	columnModel.setParent(table);
	model.setAction(DBDesigner.Action.ADD_COLUMN);
	model.setDBObjectModel(columnModel);
	this.getUI().open(DBDesigner.lang.straddcolumn);
};

ColumnDialog.prototype.editColumn = function(column){
	var model = this.getModel();
	model.setAction(DBDesigner.Action.ALTER_COLUMN);
	model.setDBObjectModel(column.getModel());
	this.getUI().open(DBDesigner.lang.straltercolumn);
};

ColumnDialog.prototype.saveColumn = function(form){
	var model = this.getModel();
	var columnModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		var flags = 0;
		
		if(action == DBDesigner.Action.ALTER_COLUMN) columnModel.startEditing();
		
		if(form.isArray) flags |= ColumnModel.Flag.ARRAY;
		if(form.isPrimaryKey) flags |= ColumnModel.Flag.PRIMARY_KEY;
		if(columnModel.isUniqueKey()) flags |= ColumnModel.Flag.UNIQUE_KEY;
		if(form.isNotnull) flags |= ColumnModel.Flag.NOTNULL;
		if(columnModel.isForeignKey()) flags |= ColumnModel.Flag.FOREIGN_KEY;
		
		
		columnModel.setName(form.name);
		columnModel.setType(form.type);
		columnModel.setLength(form.length);
		columnModel.setDefault(form.def);
		columnModel.setComment(form.comment);
		columnModel.setFlags(flags);
		
		
		if(action == DBDesigner.Action.ADD_COLUMN){
			var column = new Column(columnModel);
			columnModel.getParent().getColumnCollection().add(column);
		}
		else columnModel.stopEditing();
		return true;
	}
	return false;
};

ColumnDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var lowType = form.type.toLowerCase();
	var columnModel = this.getModel().getDBObjectModel();
	var columnCollection = columnModel.getParent().getColumnCollection();

	if(form.name == ''){
		ui.showError(DBDesigner.lang.strcolneedsname, DBDesigner.lang.strname);
		isValid = false;
	}
	else if(columnCollection.columnNameExists(form.name, columnModel)){
		ui.showError(DBDesigner.lang.strcolexists, DBDesigner.lang.strname);
		isValid = false;
	}
	if((lowType == 'numeric' && !/^(\d+(,\d+)?)?$/.test(form.length)) || (lowType != 'numeric' && !/^\d*$/.test(form.length))){
		ui.showError(DBDesigner.lang.strbadinteger, DBDesigner.lang.strlength);
		isValid = false;
	}
	else if(/^d+$/.test(form.length)) {
		//Remove left side 0's
		form.length = parseInt(form.length) + '';
		//add scale of 0
		if(lowType == 'numeric') form.length += ',0';
	}
	else if(lowType == 'numeric' && /^\d+,\d+$/.test(form.length)){
		var splitted = form.length.split(',');
		var precision = parseInt(splitted[0]);
		var scale = parseInt(splitted[1]);
		if(scale > precision){
			ui.showError(DBDesigner.lang.strbadnumericlength.replace('%d', scale).replace('%d', precision), DBDesigner.lang.strlength);
			isValid = false;
		}
		form.length = precision + ',' + scale;
	}
	return isValid;
}

// *****************************************************************************

ColumnDialogModel = function() {};

$.extend(ColumnDialogModel.prototype, DBObjectDialogModel);



// *****************************************************************************

ColumnDialogUI = function(controller) {
	this.setTemplateID('ColumnDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};

$.extend(ColumnDialogUI.prototype, DBObjectDialogUI);

ColumnDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('div.submit-buttons').on('click', 'input', $.proxy(this.submitButtonClicked, this));
	dom.find('#column-dialog_column-type').change($.proxy(this.dataTypeChanged, this));
	this.setDialogCloseEvent();
	this.setKeyPressEvent();
};


ColumnDialogUI.prototype.open = function(title){
	
	var columnModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(columnModel != null){
		$('#column-dialog_column-type').val(columnModel.getType()).prop('disabled', false).trigger('change');
		$('#column-dialog_column-name').val(columnModel.getName());
		$('#column-dialog_column-length').val(columnModel.getLength());
		$('#column-dialog_column-comment').val(columnModel.getComment());
		$('#column-dialog_column-array').prop({checked: columnModel.isArray(), disabled: false});
		$('#column-dialog_column-primarykey').prop('checked', columnModel.isPrimaryKey());
		$('#column-dialog_column-notnull').prop('checked', columnModel.isNotnull());
		$('#column-dialog_column-default').val(columnModel.getDefault());
		
		if(columnModel.isForeignKey()){
			$('#column-dialog_column-type').prop('disabled', true);
			$('#column-dialog_column-array').prop('disabled', true);
			$('#column-dialog_column-length').prop('disabled', true);
		}
		
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
	
};

ColumnDialogUI.prototype.submitButtonClicked = function(event){
	if(event.target.id == 'column-dialog_cancel') {this.close();}
	else{
		var saveSuccess = this.save(false);
		if(event.target.id == 'column-dialog_save' && saveSuccess) {this.close();}
		else if(event.target.id == 'column-dialog_save2' && saveSuccess) {
			var controller = this.getController();
			var table = controller.getModel().getDBObjectModel().getParent();
			controller.createColumn(table);
		}
	}
};

ColumnDialogUI.prototype.save = function(closeWindow){
	closeWindow = (typeof closeWindow == 'undefined')? true : closeWindow;
	this.cleanErrors();
	var form = {
		name: $.trim($('#column-dialog_column-name').val()),
		type: $.trim($('#column-dialog_column-type').val()),
		isArray: $('#column-dialog_column-array').prop('checked'),
		isPrimaryKey: $('#column-dialog_column-primarykey').prop('checked'),
		isNotnull: $('#column-dialog_column-notnull').prop('checked'),
		def: $.trim($('#column-dialog_column-default').val()),
		comment: $.trim($('#column-dialog_column-comment').val())
	};
	form.length = (this.typeHasPredefinedSize(form.type))? '': $.trim($('#column-dialog_column-length').val()).replace(/\s+/g, '');
	var saveSuccess = this.getController().saveColumn(form);
	if(saveSuccess && closeWindow) this.close();
	return saveSuccess;
};

ColumnDialogUI.prototype.dataTypeChanged = function(event){
	var sizePredefined = this.typeHasPredefinedSize($(event.currentTarget).val());
	var $input = $('#column-dialog_column-length').prop('disabled', sizePredefined);
	if(sizePredefined) $input.val('');
};

ColumnDialogUI.prototype.typeHasPredefinedSize = function(type){
	for(var i = 0, n = DBDesigner.dataTypes.length; i < n; i++){
		if(DBDesigner.dataTypes[i].typedef == type){
			return DBDesigner.dataTypes[i].size_predefined;
		}
	}
	return false;
};DBObject = {
	startEditing: function(){
		this.getModel().startEditing();
	},
	stopEditing: function(){
		this.getModel().stopEditing();
	},
	setName: function(name){
		this.getModel().setName(name);
	},
	getName: function(){
		return this.getModel().getName();
	},
	setComment: function(comment){
		this.getModel().setComment(comment);
	},
	getComment: function(){
		return this.getModel().getComment();
	},
	modelChanged: function(eventProperty, func, prmts){
		var i, addFunc = true;
		var isEditing = this.getModel().isEditing();
		if(!$.isArray(this._uvf)) this._uvf = [];
		if(!$.isArray(this._props)) this._props = [];
		if(typeof eventProperty == 'undefined') eventProperty = 'stopEditing';
		else this._props.push(eventProperty);
		if($.isFunction(func)){
			for(i = 0; i < this._uvf.length; i++){
				if(this._uvf[i].func == func) {
					addFunc = false;
					break;
				}
			}
			if(addFunc === true) this._uvf.push({func: func, prmts: prmts});
		}else if(func === true) this._modelHasChanges = true;
		if(!isEditing){
			var ui = this.getUI();
			var properties = [].concat(this._props);
			this._modelHasChanges = this._modelHasChanges || (this._uvf.length > 0);
			for(i = 0; i < this._uvf.length; i++) this._uvf[i].func.apply(ui, this._uvf[i].prmts);
			this._uvf = [];
			this._props = [];
			if(this._modelHasChanges === true) {
				this.trigger(DBObject.Event.DBOBJECT_ALTERED, {properties: properties});
				this._modelHasChanges = false;
			}
		}
	}
};
$.extend(DBObject, Component);

DBObjectModel = {
	isEditing: function(){
		if(typeof this._editing == 'undefined') this._editing = false;
		return this._editing;
	},
	startEditing: function(){
		this._editing = true;
	},
	stopEditing: function(){
		this._editing = false;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property:'stopEditing'});
	},
	setName: function(name){
		var oldName = this.getName();
		if(oldName != name){
			this._name = name;
			this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property:'name', oldValue:oldName, newValue: name});
		}
	},
	getName: function(){
		if(typeof this._name == 'undefined') this._name = '';
		return this._name;
	},
	setComment: function(comment){
		var oldComment = this.getComment();
		if(oldComment != comment){
			this._comment = comment;
			this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property:'comment', oldValue:oldComment, newValue: comment});
		}
	},
	getComment: function(){
		if(typeof this._comment == 'undefined') this._comment = '';
		return this._comment;
	},
	setFlagState: function(flag, state){
		var flags = this.getFlags();
		var flagIsOn = (flags & flag) != 0;
		if(flagIsOn ^ state){
			this._flags = state? flags | flag : flags ^ flag; 
			this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'flags', newValue: this._flags, oldValue: flags});
		}
	},
	setFlags: function(flags){
		var oldValue = this.getFlags();
		if(oldValue != flags){
			this._flags = flags;
			this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'flags', newValue: flags, oldValue: oldValue});
		}
	},
	getFlags: function(){
		if(typeof this._flags == 'undefined') this._flags = 0;
		return this._flags;
	}
};

$.extend(DBObjectModel, EventDispatcher);


Table = function() {
	//If the constructor gets a TableModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof TableModel) this.setModel(arguments[0]);
	else this.setModel(new TableModel());
	
	this.setUI(new TableUI(this));
};

$.extend(Table.prototype, DBObject);

Table.prototype.isSelected = function(){
	return this.getModel().isSelected();
};

Table.prototype.setSelected = function(b){
	this.getModel().setSelected(b);
	this.getUI().updateSelected(b);
};

Table.prototype.setPosition = function(position){
	this.getModel().setPosition(position);
};

Table.prototype.getPosition = function(){
	return this.getModel().getPosition();
};

Table.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'dropped':
			this.getUI().drop();
			this.trigger(DBObject.Event.DBOBJECT_DROPPED);
			break;
		case 'name':
			this.modelChanged(event.property, ui.updateName, [event.newValue]);
			break;
		case 'collapsed':
			ui.updateCollapsed(event.newValue);
			break;
		case 'selected':
			this.trigger(Table.Event.SELECTION_CHANGED, {tableIsSelected: event.newValue});
			break;
		case 'stopEditing':
			this.modelChanged();
			break;
		default:
			this.modelChanged(event.property, true);
			break;
	}	
};

Table.prototype.alterTable = function(){
	this.trigger(Table.Event.ALTER_REQUEST);
};

Table.prototype.getColumnCollection = function(){
	return this.getModel().getColumnCollection();
};

Table.prototype.getForeignKeyCollection = function(){
	return this.getModel().getForeignKeyCollection();
};

Table.prototype.getUniqueKeyCollection = function(){
	return this.getModel().getUniqueKeyCollection();
};

Table.prototype.refresh = function(){
	this.getUI().updateWidth();
};

Table.prototype.triggerViewBoxChanged = function(data){
	if(typeof data != 'object') data = {};
	this.trigger(Table.Event.VIEW_BOX_CHANGED, data);
};

Table.prototype.triggerDetailRequest = function(){
	this.trigger(Table.Event.DETAIL_REQUEST);
};

Table.prototype.getSize = function(){
	return this.getUI().getSize();
};

Table.prototype.getWithoutOIDS = function(){
	return this.getModel().getWithoutOIDS();
};

Table.prototype.drop = function(){
	this.getModel().drop();
};

Table.prototype.serialize = function(){
	return this.getModel().serialize();
};

// *****************************************************************************

TableModel = function() {
	
};

$.extend(TableModel.prototype, DBObjectModel);

TableModel.prototype.setPosition = function(position){
	this._position = $.extend(this.getPosition(), position);
};

TableModel.prototype.getPosition = function(){
	if(typeof this._position == 'undefined') this._position = {top:0, left:0}
	return $.extend({}, this._position);
};

TableModel.prototype.setWithoutOIDS = function(b){
	var oldValue = this.getWithoutOIDS();
	if(oldValue != b){
		this._withoutOIDS = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'options', oldValue: oldValue, newValue: b});
	}
}

TableModel.prototype.getWithoutOIDS = function(){
	if(typeof this._withoutOIDS == 'undefined') this._withoutOIDS = true;
	return this._withoutOIDS;
}

TableModel.prototype.isSelected = function(){
	if(typeof this._selected == 'undefined') this._selected = false;
	return this._selected;
};

TableModel.prototype.setSelected = function(b){
	var oldValue = this.isSelected();
	if(oldValue != b){
		this._selected = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selected', oldValue: oldValue, newValue: b});
	}
};

TableModel.prototype.isCollapsed = function(){
	if(typeof this._collapsed == 'undefined') this._collapsed = false;
	return this._collapsed;
};

TableModel.prototype.setCollapsed = function(b){
	var oldValue = this.isCollapsed();
	if(oldValue != b){
		this._collapsed = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'collapsed', oldValue: oldValue, newValue: b});
	}
};

TableModel.prototype.isSelected = function(){
	if(typeof this._selected == 'undefined') this._selected = false;
	return this._selected;
};

TableModel.prototype.setSelected = function(b){
	var oldValue = this.isSelected();
	if(oldValue != b){
		this._selected = b;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selected', oldValue: oldValue, newValue: b});
	}
};

TableModel.prototype.getColumnCollection = function(){
	if(typeof this._columnCollection == 'undefined') this._columnCollection = new ColumnCollection();
	return this._columnCollection;
};

TableModel.prototype.getForeignKeyCollection = function(){
	if(typeof this._foreignKeyCollection == 'undefined') this._foreignKeyCollection = new ForeignKeyCollection();
	return this._foreignKeyCollection;
};

TableModel.prototype.getUniqueKeyCollection = function(){
	if(typeof this._uniqueKeyCollection == 'undefined') this._uniqueKeyCollection = new UniqueKeyCollection();
	return this._uniqueKeyCollection;
};

TableModel.prototype.getSize = function(){
	if(typeof this._size == 'undefined') this._size = {width: 0, height: 0};
	return $.extend({}, this._size);
};

TableModel.prototype.setSize = function(size){
	this._size = $.extend(this.getSize(), size);
};

TableModel.prototype.drop = function(){
	var foreignKeys = this.getForeignKeyCollection().getForeignKeys();
	var uniqueKeys = this.getUniqueKeyCollection().getUniqueKeys();
	var i;
	//Remove constraints to delete references from foreign tables and list of constraints
	for(i = 0; i < foreignKeys.length; i++){ foreignKeys[i].drop(); }
	for(i = 0; i < uniqueKeys.length; i++){ uniqueKeys[i].drop(); }
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'dropped'});
};

TableModel.prototype.serialize = function(){
	return  {
		name: this.getName(),
		comment: this.getComment(),
		withoutOIDS: this.getWithoutOIDS(),
		collapsed: this.isCollapsed(),
		position: this.getPosition(),
		columns: this.getColumnCollection().serialize(),
		foreignKeys: this.getForeignKeyCollection().serialize(),
		uniqueKeys: this.getUniqueKeyCollection().serialize()
	};
};

// *****************************************************************************

TableUI = function(controller) {
	this.setTemplateID('Table');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('#canvas').data('dbobject', controller).multiDraggable({containment: 'parent'});
	this.updateView();
};

$.extend(TableUI.prototype, ComponentUI);

TableUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	var selectionChanged = $.proxy(this.selectionChanged, this);
	dom.bind({
		dragstart: $.proxy(this.onDragStart, this),
		dragstop: $.proxy(this.onDragStop, this),
		selectableselected: selectionChanged,
		selectableunselected: selectionChanged
	});
};

TableUI.prototype.updateView = function(){
	var model = this.getController().getModel();
	this.updatePosition(model.getPosition());
	this.updateName(model.getName());
	this.updateCollapsed(model.isCollapsed());
	this.updateSelected(model.isSelected());
};

TableUI.prototype.updatePosition = function(position){
	this.getDom().css({top: position.top + 'px', left: position.left + 'px'});
};

TableUI.prototype.updateName = function(name){
	this.find('div.header > span.title').text(name);
	this.updateWidth();
};

TableUI.prototype.onDragStart = function(){
	this.getController().triggerViewBoxChanged({dragging: true});
};

TableUI.prototype.onDragStop = function(){
	var $canvas = $('#canvas');
	var position = this.getDom().position();
	var controller = this.getController();
	position.left += $canvas.scrollLeft();
	position.top += $canvas.scrollTop();
	controller.setPosition(position);
	controller.triggerViewBoxChanged();
};

TableUI.prototype.onButtonPressed = function(event){
	var model = this.getController().getModel();
	var $button = $(event.currentTarget);
	if($button.is('a.collapse-button')){
		model.setCollapsed(!model.isCollapsed());
	}
	else if($button.is('a.properties-button')){
		this.getController().triggerDetailRequest();
	}
	event.preventDefault();
};

TableUI.prototype.onHeaderDblClicked = function(event){
	if($(event.target).is('div.header, span.title')){
		this.getController().alterTable();
	}
};

TableUI.prototype.updateWidth = function(){
	var controller = this.getController();
	var dom = this.getDom();
	var w = dom.find('div.header > span.title').outerWidth() + 54/*(buttons)*/;
	var model = controller.getModel();
	if(!model.isCollapsed()){
		dom.find('span.definition').each(function(){
			w = Math.max($(this).outerWidth() + 22, w);
		});
	}
	dom.css({width: w, minWidth: w});
	model.setSize(this.getSize());
	controller.triggerViewBoxChanged();
};

TableUI.prototype.updateCollapsed = function(b){
	var dom = this.getDom();
	var hasClass = dom.hasClass('db-table-collapsed');
	if(b && !hasClass){
		dom.addClass('db-table-collapsed')
			.find('a.collapse-button span')
			.removeClass('ui-icon-circle-triangle-s')
			.addClass('ui-icon-circle-triangle-e');
	}
	else if(!b && hasClass){
		dom.removeClass('db-table-collapsed')
			.find('a.collapse-button span')
			.removeClass('ui-icon-circle-triangle-e')
			.addClass('ui-icon-circle-triangle-s');
	}
	this.updateWidth();
};

TableUI.prototype.updateSelected = function(b){
	var dom = this.getDom();
	var hasClass = dom.hasClass('ui-selected');
	if(b && !hasClass) dom.addClass('ui-selected');
	else if(!b && hasClass) dom.removeClass('ui-selected');
};

TableUI.prototype.selectionChanged = function(event){
	var selected = event.type == 'selectableselected';
	this.getController().getModel().setSelected(selected);
};

TableUI.prototype.getSize = function(){
	var dom = this.getDom();
	var size = {
		width: dom.outerWidth(),
		height: dom.outerHeight()
	}
	return size;
};

TableUI.prototype.drop = function(){
	this.getDom().remove();
};
Column = function() {
	//If the constructor gets a ColumnModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof ColumnModel) this.setModel(arguments[0]);
	else this.setModel(new ColumnModel());
	
	this.setUI(new ColumnUI(this));
};

$.extend(Column.prototype, DBObject);

Column.prototype.modelPropertyChanged = function(event){
	switch(event.property){
		case 'dropped':
			this.getUI().drop();
			this.trigger(DBObject.Event.DBOBJECT_DROPPED);
			break;
		case 'parent':
			this.getUI().updateParent();
			break;
		case 'stopEditing':
			this.modelChanged();
			break;
		default:
			this.modelChanged(event.property, this.getUI().updateView);
			break;
	}
};

Column.prototype.alterColumn = function(){
	this.trigger(Column.Event.ALTER_REQUEST);
};

Column.prototype.isPrimaryKey = function(){
	return this.getModel().isPrimaryKey();
};

Column.prototype.isUniqueKey = function(){
	return this.getModel().isUniqueKey();
};

Column.prototype.isArray = function(){
	return this.getModel().isArray();
};

Column.prototype.setHighLight = function(b){
	this.getUI().setHighLight(b);
};

Column.prototype.setForeignKey = function(b){
	this.getModel().setForeignKey(b);
};

Column.prototype.setUniqueKey = function(b){
	this.getModel().setUniqueKey(b);
};

Column.prototype.setLength = function(length){
	this.getModel().setLength(length);
};

Column.prototype.setType = function(type){
	this.getModel().setType(type);
};

Column.prototype.setArray = function(b){
	this.getModel().setArray(b);
};

Column.prototype.getType = function(){
	return this.getModel().getType();
};

Column.prototype.getLength = function(){
	return this.getModel().getLength();
};

Column.prototype.move = function(dir){
	this.getUI().move(dir);
};

Column.prototype.drop = function(){
	this.getModel().drop();
};

Column.prototype.getParent = function(){
	return this.getModel().getParent();
};

Column.prototype.getName = function(){
	return this.getModel().getName();
};

Column.prototype.serialize = function(){
	return this.getModel().serialize();
};

// *****************************************************************************



ColumnModel = function(){};
$.extend(ColumnModel.prototype, DBObjectModel);

ColumnModel.prototype.setType = function(type){
	var oldValue = this.getType();
	if(oldValue != type){
		this._type = type;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'type', newValue: type, oldValue: oldValue});
	}
};
ColumnModel.prototype.getType = function(){
	if(typeof this._type == 'undefined') this._type = 'SERIAL';
	return this._type;
};

ColumnModel.prototype.getFullType = function(){
	var type = this.getType();
	var isArray = this.isArray();
	var length = this.getLength();
	if(length != '') type += '(' + length + ')';
	if(isArray) type += '[]';
	return type;
};

ColumnModel.prototype.setLength = function(length){
	var oldValue = this.getLength();
	if(oldValue != length){
		this._length = length;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'length', newValue: length, oldValue: oldValue});
	}
};

ColumnModel.prototype.getLength = function(){
	if(typeof this._length == 'undefined') this._length = '';
	return this._length;
};

ColumnModel.prototype.setDefault = function(def){
	var oldValue = this.getDefault();
	if(oldValue != def){
		this._default = def;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'default', newValue: def, oldValue: oldValue});
	}
};

ColumnModel.prototype.getDefault = function(){
	if(typeof this._default == 'undefined') this._default = '';
	return this._default;
};

ColumnModel.prototype.setArray = function(b){
	this.setFlagState(ColumnModel.Flag.ARRAY, b);
};

ColumnModel.prototype.isArray = function(){
	return (this.getFlags() & ColumnModel.Flag.ARRAY) != 0;
};

ColumnModel.prototype.setPrimaryKey = function(b){
	this.setFlagState(ColumnModel.Flag.PRIMARY_KEY, b);
};

ColumnModel.prototype.isPrimaryKey = function(){
	return (this.getFlags() & ColumnModel.Flag.PRIMARY_KEY) != 0;
};

ColumnModel.prototype.setForeignKey = function(b){
	if(typeof this._foreignKeyCount == 'undefined') this._foreignKeyCount = 0;
	this._foreignKeyCount += b? 1 : -1;
	if((this._foreignKeyCount == 0 && !b) || (this._foreignKeyCount == 1 && b)){
		this.setFlagState(ColumnModel.Flag.FOREIGN_KEY, b);
	}
};

ColumnModel.prototype.isForeignKey = function(){
	return (this.getFlags() & ColumnModel.Flag.FOREIGN_KEY) != 0;
};

ColumnModel.prototype.setUniqueKey = function(b){
	if(typeof this._uniqueKeyCount == 'undefined') this._uniqueKeyCount = 0;
	this._uniqueKeyCount += b? 1 : -1;
	if((this._uniqueKeyCount == 0 && !b) || (this._uniqueKeyCount == 1 && b)){
		this.setFlagState(ColumnModel.Flag.UNIQUE_KEY, b);
	}
};

ColumnModel.prototype.isUniqueKey = function(){
	return (this.getFlags() & ColumnModel.Flag.UNIQUE_KEY) != 0;
};

ColumnModel.prototype.setNotnull = function(b){
	this.setFlagState(ColumnModel.Flag.NOTNULL, b);
};

ColumnModel.prototype.isNotnull = function(){
	return (this.getFlags() & ColumnModel.Flag.NOTNULL) != 0;
};

ColumnModel.prototype.setParent = function(table){
	this._parent = table;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'parent', newValue: table, oldValue: null});
};

ColumnModel.prototype.getParent = function(){
	if(typeof this._parent == 'undefined') this._parent = null;
	return this._parent;
};

ColumnModel.prototype.drop = function(){
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'dropped'});
};

ColumnModel.prototype.serialize = function(){
	return {
		name: this.getName(),
		comment: this.getName(),
		type: this.getType(),
		array: this.isArray(),
		primaryKey: this.isPrimaryKey(),
		notNull: this.isNotnull(),
		defaultDef: this.getDefault()
	};
};

// *****************************************************************************

ColumnUI = function(controller){
	this.setTemplateID('Column');
	this.setController(controller);
	this.init();
	this.getDom().data('dbobject', controller);
	this.updateView();
	this.updateParent();
};
$.extend(ColumnUI.prototype, ComponentUI);

ColumnUI.prototype.updateView = function(){
	var model = this.getController().getModel();
	var dom = this.getDom();
	var $keys = dom.find('span.keys');
	var def = model.getName() + ' : ' + model.getFullType();
	
	dom.find('span.definition').text(def);
	if(model.isPrimaryKey() && model.isForeignKey()) $keys.attr('class', 'keys pk-fk');
	else if(model.isUniqueKey() && model.isForeignKey()) $keys.attr('class', 'keys uk-fk');
	else if(model.isPrimaryKey()) $keys.attr('class', 'keys pk');
	else if(model.isUniqueKey()) $keys.attr('class', 'keys uk');
	else if(model.isForeignKey()) $keys.attr('class', 'keys fk');
	else $keys.attr('class', 'keys');
	
	if(model.isNotnull() || model.isPrimaryKey()) dom.addClass('notnull');
	else dom.removeClass('notnull');
	model.getParent().refresh();
};

ColumnUI.prototype.updateParent = function(){
	var table = this.getController().getModel().getParent();
	if(table != null) this.getDom().appendTo(table.getUI().find('div.column-container'));
	table.refresh();
};

ColumnUI.prototype.onDblClick = function(){
	this.getController().alterColumn();
};

ColumnUI.prototype.bindEvents = function(){};

ColumnUI.prototype.setHighLight = function(b){
	var dom = this.getDom();
	if(b) dom.addClass('db-column-highlight');
	else dom.removeClass('db-column-highlight');
};

ColumnUI.prototype.move = function(dir){
	var dom = this.getDom();
	if(dir == 'up') dom.insertBefore(dom.prev());
	else dom.insertAfter(dom.next());
};

ColumnUI.prototype.drop = function() {
	this.getDom().remove();
	this.getController().getModel().getParent().refresh();
};

TableCollection = function(){
	this._tables = [];
	this._selectedTables = [];
};
$.extend(TableCollection.prototype, EventDispatcher);

TableCollection.prototype.getTableByName = function(name){
	for(var i = 0, n = this._tables.length; i < n; i++){
		if(this._tables[i].getName() == name) return this._tables[i];
	}
	return null;
};

TableCollection.prototype.add = function(table){
	if(table.isSelected()) this.addToSelection(table);
	if($.inArray(table, this._tables) == -1) this._tables.push(table);
	
	table.bind(Table.Event.SELECTION_CHANGED, this.tableSelectionChanged, this);
	table.bind(Table.Event.ALTER_REQUEST, this.alterTable, this);
	table.bind(Table.Event.DETAIL_REQUEST, this.detailRequest, this);
	table.bind(DBObject.Event.DBOBJECT_DROPPED, this.onTableDropped, this);
	this.trigger(Collection.Event.COLLECTION_CHANGED, {tableAdded: table});
};

TableCollection.prototype.onTableDropped = function(event){
	this.remove(event.sender);
};

TableCollection.prototype.remove = function(table){
	var index = $.inArray(table, this._tables);
	this._tables.splice(index, 1);
	this.removeFromSelection(table);
	
	table.unbind(Table.Event.SELECTION_CHANGED, this.tableSelectionChanged, this);
	table.unbind(Table.Event.ALTER_REQUEST, this.alterTable, this);
	table.unbind(Table.Event.DETAIL_REQUEST, this.detailRequest, this);
	table.unbind(DBObject.Event.DBOBJECT_DROPPED, this.onTableDropped, this);
	this.trigger(Collection.Event.COLLECTION_CHANGED, {tableDropped: table});
};

TableCollection.prototype.addToSelection = function(table){
	if($.inArray(table, this._selectedTables) == -1) {
		this._selectedTables.push(table);
		if(this._selectedTables.length == 1 || this._selectedTables.length == 2)
			this.trigger(Table.Event.SELECTION_CHANGED);
	}
};

TableCollection.prototype.removeFromSelection = function(table){
	var index = $.inArray(table, this._selectedTables);
	if(index >= 0) {
		this._selectedTables.splice(index, 1);
		if(this._selectedTables.length == 1 || this._selectedTables.length == 0)
			this.trigger(Table.Event.SELECTION_CHANGED);
	}
};

TableCollection.prototype.tableSelectionChanged = function(event){
	if(event.tableIsSelected) this.addToSelection(event.sender);
	else this.removeFromSelection(event.sender);
};

TableCollection.prototype.emptySelection = function(){
	var tables = this.getSelectedTables();
	for(var i = 0, n = tables.length; i < n; i++){
		tables[i].setSelected(false);
	}
};

TableCollection.prototype.count = function(){
	return this._selectedTables.length;
};

TableCollection.prototype.alterTable = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_TABLE, event.sender);
};

TableCollection.prototype.getSelectedTables = function(){
	return [].concat(this._selectedTables);
};

TableCollection.prototype.getTables = function(){
	return [].concat(this._tables);
};

TableCollection.prototype.getTableNames = function(){
	var tNames = [];
	for(var i = 0, n = this._tables.length; i < n; i++){
		tNames.push(this._tables[i].getName());
	}
	tNames.sort();
	return tNames;
};

TableCollection.prototype.detailRequest = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.SHOW_TABLE_DETAIL, event.sender);
};

TableCollection.prototype.tableNameExists = function(name, tableModel){
	var tableWithSameName = this.getTableByName(name);
	if(tableWithSameName != null && tableWithSameName.getModel() != tableModel) return true;
	return false;
};

TableCollection.prototype.dropSelectedTables = function(){
	var tables = this.getSelectedTables();
	for(var i = 0; i < tables.length; i++){
		tables[i].drop();
	}
};

TableCollection.prototype.serialize = function() {
	var tables = this.getTables();
	var collection = [];
	for(var i = 0; i < tables.length; i++) {
		collection.push(tables[i].serialize());
	}
	return collection;
};ConstraintHelper = {
	constraintNameExists: function (name, constraintModel){
		var constraintList = DBDesigner.app.getConstraintList();
		var constraint = null;
		var instanceClass = constraintModel.constructor;
		//if(this.constructor == ForeignKeyCollection) instanceClass = ForeignKey;
		//else if(this.constructor == UniqueKeyCollection) instanceClass = UniqueKey;
		for(var i = 0; i < constraintList.length; i++){
			if(constraintList[i].getName() == name && constraintList[i].getModel() instanceof instanceClass){
				constraint = constraintList[i];
				break;
			}
		}
		if(constraint != null && constraint.getModel() != constraintModel) return true;
		return false;
	},
	buildConstraintName: function(name1, name2, label){
		var name = '';
		var overhead = 0;
		var name1chars = name1.length;
		var name2chars = 0;
		var availchars = 63;
		if(name2){
			name2chars = name2.length;
			overhead++;
		}
		if(label) overhead += label.length + 1;
		availchars -= 1 + overhead;
		
		while (name1chars + name2chars > availchars) {
			if (name1chars > name2chars) name1chars--;
			else name2chars--;
		}
		name = name1.substr(0, name1chars);
		if(name2) name += '_' + name2.substr(0, name2chars);
		if(label) name += '_' + label;
		return name;
	}
};



ColumnCollection = function(){
	this._columns = [];
};

$.extend(ColumnCollection.prototype, EventDispatcher);

ColumnCollection.prototype.getColumnByName = function(name){
	for(var i = 0, n = this._columns.length; i < n; i++){
		if(this._columns[i].getName() == name) return this._columns[i];
	}
	return null;
};

ColumnCollection.prototype.add = function(column){
	if($.inArray(column, this._columns) == -1){
		this._columns.push(column);
		column.bind(Column.Event.ALTER_REQUEST, this.alterColumn, this);
		column.bind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnAltered, this);
		column.bind(DBObject.Event.DBOBJECT_DROPPED, this.onColumnDropped, this);
		this.trigger(Collection.Event.COLLECTION_CHANGED, {columnAdded: column});
	}
};

ColumnCollection.prototype.remove = function(column){
	var index = $.inArray(column, this._columns);
	this._columns.splice(index, 1);
	column.unbind(Column.Event.ALTER_REQUEST, this.alterColumn, this);
	column.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnAltered, this);
	column.unbind(DBObject.Event.DBOBJECT_DROPPED, this.onColumnDropped, this);
	this.trigger(Collection.Event.COLLECTION_CHANGED, {columnDropped: column});
};

ColumnCollection.prototype.onColumnAltered = function(event){
	this.trigger(Collection.Event.COLLECTION_CHANGED, {columnAltered: event.sender});
};

ColumnCollection.prototype.onColumnDropped = function(event){
	this.remove(event.sender);
};

ColumnCollection.prototype.alterColumn = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_COLUMN, event.sender);
};


ColumnCollection.prototype.getColumnNames = function(){
	var cNames = [];
	for(var i = 0, n = this._columns.length; i < n; i++){
		cNames.push(this._columns[i].getName());
	}
	cNames.sort();
	return cNames;
};

ColumnCollection.prototype.getColumns = function(){
	return [].concat(this._columns);
};

ColumnCollection.prototype.getReferenceableColumns = function(){
	var columns = [];
	for(var i = 0, n = this._columns.length; i < n; i++){
		if(this._columns[i].isPrimaryKey() || this._columns[i].isUniqueKey()){
			columns.push(this._columns[i]);
		}
	}
	return columns;
};

ColumnCollection.prototype.getReferenceableColumnNames = function(){
	var columns = this.getReferenceableColumns();
	var cNames = [];
	for(var i = 0, n = columns.length; i < n; i++){
		cNames.push(columns[i].getName());
	}
	return cNames;
};

ColumnCollection.prototype.moveColumn = function(column, dir){
	var aux;
	var columns = this._columns;
	var index = $.inArray(column, columns);
	if(index == -1) return false;
	var ret = false;
	
	if(index > 0 && dir == 'up'){
		columns[index] = columns[index - 1];
		columns[index - 1] = column;
		column.move(dir);
		ret = true;
	} else if(index < columns.length - 1 && dir == 'down'){
		columns[index] = columns[index + 1];
		columns[index + 1] = column;
		column.move(dir);
		ret = true;
	}
	
	return ret;
};

ColumnCollection.prototype.columnNameExists = function(name, columnModel){
	var columnWithSameName = this.getColumnByName(name);
	if(columnWithSameName != null && columnWithSameName.getModel() != columnModel) return true;
	return false;
};

ColumnCollection.prototype.serialize = function() {
	var columns = this.getColumns();
	var collection = [];
	for(var i = 0; i < columns.length; i++) {
		collection.push(columns[i].serialize());
	}
	return collection;
};
ForeignKeyCollection = function(){
	this._foreignKeys = [];
};

$.extend(ForeignKeyCollection.prototype, EventDispatcher);

ForeignKeyCollection.prototype.getForeignKeyByName = function(name){
	for(var i = 0, n = this._foreignKeys.length; i < n; i++){
		if(this._foreignKeys[i].getName() == name) return this._foreignKeys[i];
	}
	return null;
};

ForeignKeyCollection.prototype.add = function(foreignKey){
	if($.inArray(foreignKey, this._foreignKeys) == -1){
		this._foreignKeys.push(foreignKey);
		DBDesigner.app.getConstraintList().push(foreignKey);
		foreignKey.bind(ForeignKey.Event.ALTER_REQUEST, this.alterForeignKey, this);
		foreignKey.bind(DBObject.Event.DBOBJECT_ALTERED, this.onForeignKeyAltered, this);
		foreignKey.bind(DBObject.Event.DBOBJECT_DROPPED, this.onForeignKeyDropped, this);
		this.trigger(Collection.Event.COLLECTION_CHANGED, {foreignKeyAdded: foreignKey});
	}
};

ForeignKeyCollection.prototype.alterForeignKey = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_FOREIGNKEY, event.sender);
};

ForeignKeyCollection.prototype.getForeignKeys = function(){
	return [].concat(this._foreignKeys);
};

ForeignKeyCollection.prototype.onForeignKeyAltered = function(event){
	this.trigger(Collection.Event.COLLECTION_CHANGED, {foreignKeyAltered: event.sender});
};

ForeignKeyCollection.prototype.onForeignKeyDropped = function(event){
	this.remove(event.sender);
};

ForeignKeyCollection.prototype.remove = function(foreignKey){
	var constraintList = DBDesigner.app.getConstraintList();
	var index1 = $.inArray(foreignKey, this._foreignKeys);
	var index2 = $.inArray(foreignKey, constraintList);
	this._foreignKeys.splice(index1, 1);
	constraintList.splice(index2, 1);
	foreignKey.unbind(ForeignKey.Event.ALTER_REQUEST, this.alterForeignKey, this);
	foreignKey.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onForeignKeyAltered, this);
	foreignKey.unbind(DBObject.Event.DBOBJECT_DROPPED, this.onForeignKeyDropped, this);
	this.trigger(Collection.Event.COLLECTION_CHANGED, {foreignKeyDropped: foreignKey});
};

ForeignKeyCollection.prototype.serialize = function() {
	var foreignKeys = this.getForeignKeys();
	var collection = [];
	for(var i = 0; i < foreignKeys.length; i++) {
		collection.push(foreignKeys[i].serialize());
	}
	return collection;
};ForeignKey = function() {
	//If the constructor gets a ForeignKeyModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof ForeignKeyModel) {
		var model = arguments[0];
		var parent = model.getParent();
		this.setModel(model);
		parent.bind(Table.Event.VIEW_BOX_CHANGED, this.onTableViewBoxChanged, this);
		model.trigger(DBDesigner.Event.PROPERTY_CHANGED, {
			property: 'referencedTable',
			oldValue: null,
			newValue: model.getReferencedTable()
		});
	}
	else this.setModel(new ForeignKeyModel());
	
	this.setUI(new ForeignKeyUI(this));
};

$.extend(ForeignKey.prototype, DBObject);

ForeignKey.prototype.getParent = function(){
	return this.getModel().getParent();
};

ForeignKey.prototype.getReferencedTable = function(){
	return this.getModel().getReferencedTable();
};

ForeignKey.prototype.setHighLight = function(b){
	var columns = this.getModel().getColumns();
	for(var i = 0; i < columns.length; i++){
		columns[i].localColumn.setHighLight(b);
		columns[i].foreignColumn.setHighLight(b);
	}
};
ForeignKey.prototype.modelPropertyChanged = function(event){
	switch(event.property){
		case 'dropped':
			var parent = this.getParent();
			var referencedTable = this.getReferencedTable();
			parent.unbind(Table.Event.VIEW_BOX_CHANGED, this.onTableViewBoxChanged, this);
			referencedTable.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onReferencedTableAltered, this);
			if(parent != referencedTable){
				referencedTable.unbind(Table.Event.VIEW_BOX_CHANGED, this.onTableViewBoxChanged, this);
			}
			this.getUI().drop();
			this.trigger(DBObject.Event.DBOBJECT_DROPPED);
			break;
		case 'stopEditing':
			this.modelChanged();
			break;
		
		case 'referencedTable':
			var parent = this.getParent();
			if(event.oldValue != null) {
				event.oldValue.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onReferencedTableAltered, this);
				if(parent != event.oldValue) {
					event.oldValue.unbind(Table.Event.VIEW_BOX_CHANGED, this.onTableViewBoxChanged, this);
				}
				this.getUI().updateView();
			}
			event.newValue.bind(DBObject.Event.DBOBJECT_ALTERED, this.onReferencedTableAltered, this);
			if(parent != event.newValue){
				event.newValue.bind(Table.Event.VIEW_BOX_CHANGED, this.onTableViewBoxChanged, this);
			}
			break;
		default:
			this.modelChanged(event.property, true);
			break;
	}
};
ForeignKey.prototype.onTableViewBoxChanged = function(event){
	var ui = this.getUI();
	if(event.dragging){
		ui.hide();
	}else{
		ui.updateView();
	}
};

ForeignKey.prototype.onReferencedTableAltered = function(event){
	if(event.properties && $.inArray('name', event.properties) != -1){
		//Notify the collection that something has changed if referenced table's name has changed
		this.trigger(DBObject.Event.DBOBJECT_ALTERED);
	}
};

ForeignKey.prototype.alterForeignKey = function(){
	this.trigger(ForeignKey.Event.ALTER_REQUEST);
};

ForeignKey.prototype.drop = function(){
	this.getModel().drop();
};

ForeignKey.prototype.serialize = function(){
	return this.getModel().serialize();
};

// *****************************************************************************

ForeignKeyModel = function(){};
$.extend(ForeignKeyModel.prototype, DBObjectModel);

ForeignKeyModel.prototype.setParent = function(table){
	this._parent = table;
};

ForeignKeyModel.prototype.getParent = function(){
	if(typeof this._parent == 'undefined') this._parent = null;
	return this._parent;
};

ForeignKeyModel.prototype.setReferencedTable = function(table){
	var oldTable = this.getReferencedTable();
	if(oldTable != table){
		if(oldTable != null){
			oldTable.unbind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
		}
		if(table != null && table != this.getParent()){
			table.bind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
		}
		this._referencedTable = table;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'referencedTable', oldValue: oldTable, newValue: table});
	}
};

ForeignKeyModel.prototype.getReferencedTable = function(){
	if(typeof this._referencedTable == 'undefined') this._referencedTable = null;
	return this._referencedTable;
};

ForeignKeyModel.prototype.getUpdateAction = function(){
	if(typeof this._updateAction == 'undefined') this._updateAction = ForeignKeyModel.Action.NO_ACTION;
	return this._updateAction;
};
ForeignKeyModel.prototype.setUpdateAction = function(action){
	var oldValue = this.getUpdateAction();
	if(oldValue != action){
		this._updateAction = action;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'updateAction', oldValue: oldValue, newValue: action});
	}
};
ForeignKeyModel.prototype.getDeleteAction = function(){
	if(typeof this._deleteAction == 'undefined') this._deleteAction = ForeignKeyModel.Action.NO_ACTION;
	return this._deleteAction;
};
ForeignKeyModel.prototype.setDeleteAction = function(action){
	var oldValue = this.getDeleteAction();
	if(oldValue != action){
		this._deleteAction = action;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'deleteAction', oldValue: oldValue, newValue: action});
	}
};

ForeignKeyModel.prototype.getActionString = function(eventType){
	var action;
	if(eventType == 'update') action = this.getUpdateAction();
	else if(eventType == 'delete') action = this.getDeleteAction();
	switch(action){
		case ForeignKeyModel.Action.RESTRICT:return 'RESTRICT';
		case ForeignKeyModel.Action.CASCADE:return 'CASCADE';
		case ForeignKeyModel.Action.SET_NULL:return 'SET NULL';
		case ForeignKeyModel.Action.SET_DEFAULT:return 'SET DEFAULT';
		case ForeignKeyModel.Action.NO_ACTION:return 'NO ACTION';
	}
};

ForeignKeyModel.prototype.getColumns = function(){
	if(typeof this._columns == 'undefined') this._columns = [];
	return [].concat(this._columns);
};

ForeignKeyModel.prototype.setColumns = function(columns){
	var oldColumns = this.getColumns();
	var i;
	var oldLocalColumns = [];
	var oldForeignColumns = [];
	var newLocalColumns = [];
	var newForeignColumns = [];
	var throwEvent = false;
	
	this._columns = columns;
	
	for(i = 0; i < oldColumns.length; i++){
		oldLocalColumns.push(oldColumns[i].localColumn);
		oldForeignColumns.push(oldColumns[i].foreignColumn);
	}
	for(i = 0; i < columns.length; i++){
		// [1] Manage local columns added
		if($.inArray(columns[i].localColumn, oldLocalColumns) == -1){
			columns[i].localColumn.setForeignKey(true);
			columns[i].localColumn.bind(DBObject.Event.DBOBJECT_ALTERED, this.onLocalColumnAltered, this);
			columns[i].localColumn.bind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
			throwEvent = true;
		}
		// [2] Manage foreign columns added
		if($.inArray(columns[i].foreignColumn, oldForeignColumns) == -1){
			columns[i].foreignColumn.bind(DBObject.Event.DBOBJECT_ALTERED, this.onForeignColumnAltered, this);
			columns[i].foreignColumn.bind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
			this.onForeignColumnAltered({properties: ['length'], sender: columns[i].foreignColumn});
			throwEvent = true;
		}
		newLocalColumns.push(columns[i].localColumn);
		newForeignColumns.push(columns[i].foreignColumn);
	}
	for(i = 0; i < oldColumns.length; i++){
		//[3] Manage local columns removed
		if($.inArray(oldLocalColumns[i], newLocalColumns) == -1){
			oldLocalColumns[i].setForeignKey(false);
			oldLocalColumns[i].unbind(DBObject.Event.DBOBJECT_ALTERED, this.onLocalColumnAltered, this);
			oldLocalColumns[i].unbind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
			throwEvent = true;
		}
		//[4] Manage foreign columns removed
		if($.inArray(oldForeignColumns[i], newForeignColumns) == -1){
			oldForeignColumns[i].unbind(DBObject.Event.DBOBJECT_ALTERED, this.onForeignColumnAltered, this);
			oldForeignColumns[i].unbind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
			throwEvent = true;
		}
	}
	if(throwEvent) this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'columns', oldValue: oldColumns, newValue: columns});
};

ForeignKeyModel.prototype.onForeignColumnAltered = function(event){
	if(event.isDropRequest){
		this.drop();
	}
	else if(event.properties && $.inArray('name', event.properties) != -1){
		// If the name of the column could change, then notify the controller that something has changed
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'columnChanged'});
	}
	else if(event.properties && $.partOf(event.properties, ['length', 'type', 'flags'])){
		var columns = this.getColumns();
		for(var i = 0; i < columns.length; i++){
			if(columns[i].foreignColumn == event.sender){
				if(columns[i].foreignColumn != columns[i].localColumn){
					var type = columns[i].foreignColumn.getType();
					if(type == 'SERIAL') type = 'INTEGER';
					else if(type == 'BIGSERIAL') type = 'BIGINT';
					columns[i].localColumn.startEditing();
					columns[i].localColumn.setArray(columns[i].foreignColumn.isArray());
					columns[i].localColumn.setLength(columns[i].foreignColumn.getLength());
					columns[i].localColumn.setType(type);
					columns[i].localColumn.stopEditing();
				}
				break;
			}
		}
	}
};

ForeignKeyModel.prototype.onLocalColumnAltered = function(event){
	if(event.isDropRequest){
		this.drop();
	}
	else if(event.properties && $.inArray('name', event.properties) != -1){
		// If the name of the column changed, notify the controller that something has changed
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'columnChanged'});
	}
};

ForeignKeyModel.prototype.setDeferrable = function(b){
	this.setFlagState(ForeignKeyModel.Flag.DEFERRABLE, b);
};

ForeignKeyModel.prototype.isDeferrable = function(){
	return (this.getFlags() & ForeignKeyModel.Flag.DEFERRABLE) != 0;
};

ForeignKeyModel.prototype.setDeferred = function(b){
	this.setFlagState(ForeignKeyModel.Flag.DEFERRED, b);
};

ForeignKeyModel.prototype.isDeferred = function(){
	return (this.getFlags() & ForeignKeyModel.Flag.DEFERRED) != 0;
};

ForeignKeyModel.prototype.setMatchFull = function(b){
	this.setFlagState(ForeignKeyModel.Flag.MATCH_FULL, b);
};

ForeignKeyModel.prototype.isMatchFull = function(){
	return (this.getFlags() & ForeignKeyModel.Flag.MATCH_FULL) != 0;
};

ForeignKeyModel.prototype.getMatchType = function(){
	return this.isMatchFull()? 'FULL':'SIMPLE';
};

ForeignKeyModel.prototype.getConstraintOptions = function(){
	if(!this.isDeferrable()) return 'NOT DEFERRABLE';
	else {
		if(this.isDeferred()) return 'DEFERRABLE INITIALLY DEFERRED';
		else return 'DEFERRABLE INITIALLY IMMEDIATE';
	}
};

ForeignKeyModel.prototype.chooseName = function(){
	var label = 'fkey';
	var name1 = this.getParent().getName();
	var name2 = this.getColumns()[0].localColumn.getName();
	var count = 0;
	var name;
	do{
		if(count > 0) label = 'fkey' + count;
		name = ConstraintHelper.buildConstraintName(name1, name2, label);
		count++;
	} while(ConstraintHelper.constraintNameExists(name, this));
	this.setName(name);
};

ForeignKeyModel.prototype.drop = function(){
	var columns = this.getColumns();
	var referencedTable = this.getReferencedTable();
	var parent = this.getParent();
	for(var i = 0; i < columns.length; i++){
		columns[i].localColumn.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onLocalColumnAltered, this);
		columns[i].localColumn.unbind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
		columns[i].foreignColumn.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onForeignColumnAltered, this);
		columns[i].foreignColumn.unbind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
		columns[i].localColumn.setForeignKey(false);
	}
	if(parent != referencedTable){
		referencedTable.unbind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
	}
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'dropped'});
};

ForeignKeyModel.prototype.serialize = function(){
	var columns = this.getColumns();
	var columnNames = [];
	for(var i = 0; i < columns.length; i++) {
		columnNames.push({
			localColumn: columns[i].localColumn.getName(),
			foreignColumn: columns[i].foreignColumn.getName()
		});
	}
	
	return {
		name: this.getName(),
		comment: this.getComment(),
		referencedTable: this.getReferencedTable(),
		updateAction: this.getUpdateAction(),
		deleteAction: this.getDeleteAction(),
		matchFull: this.isMatchFull(),
		deferrable: this.isDeferrable(),
		deferred: this.isDeferred(),
		columns: columnNames
	};
};

// *****************************************************************************

ForeignKeyUI = function(controller){
	this.setController(controller);
	this.updateView();
};
$.extend(ForeignKeyUI.prototype, ComponentUI);

ForeignKeyUI.prototype.updateView = function(){
	var controller = this.getController();
	var parent = controller.getParent();
	var referencedTable = controller.getReferencedTable();
	var pointsX = [], pointsY = [];
	
	if(parent == referencedTable){
		var pos = parent.getPosition();
        var size = 30;
        pointsX = [
			pos.left - Math.floor(size/2),
			pos.left + Math.floor(size/2),
			pos.left + Math.floor(size/2),
			pos.left - Math.floor(size/2),
			pos.left - Math.floor(size/2)
		];
        pointsY = [
			pos.top - Math.floor(size/2),
			pos.top - Math.floor(size/2),
			pos.top + Math.floor(size/2),
			pos.top + Math.floor(size/2),
			pos.top - Math.floor(size/2)
		];
		this.drawDiamond({left: pos.left + Math.floor(size/2), top: pos.top});
	}
	else {
		var parentSize = parent.getSize();
		var parentPos = parent.getPosition();
		var referencedTableSize = referencedTable.getSize();
		var referencedTablePos = referencedTable.getPosition();
        var p1 = {
			left: Math.floor(parentSize.width/2) + Math.floor(parentPos.left),
			top: Math.floor(parentSize.height/2) + parentPos.top
		};
		var p2 = {
			left: Math.floor(referencedTableSize.width/2) + referencedTablePos.left,
			top: Math.floor(referencedTableSize.height/2) + referencedTablePos.top
		};
		var i1 = this.intersect(referencedTableSize, referencedTablePos, p1, p2);
		var i2 = this.intersect(parentSize,parentPos, p1, p2);
        if(i1 && i2){
            if(i1.s == 'v' && i2.s == 'v'){
                var X = Math.floor((i2.left - i1.left) / 2);
                //points = i1.x + ',' + i1.y + ' ' + (i1.x + X) + ',' + i1.y + ' ' + (i1.x + X) + ',' + i2.y  + ' ' + i2.x + ',' + i2.y;
                pointsX = [i1.left, (i1.left + X), /*(i1.x + X),*/ i2.left];
                pointsY = [i1.top, i2.top, /*i2.y,*/ i2.top];
            }
            else if(i1.s == 'h' && i2.s == 'h'){
                var Y = (i2.top - i1.top) / 2;
                //points = i1.x + ',' + i1.y + ' ' + i1.x + ',' + (i1.y + Y) + ' ' + i2.x + ',' + (i1.y + Y) + ' ' + i2.x + ',' + i2.y;
                pointsX = [i1.left, i2.left/*, i2.x*/, i2.left];
                pointsY = [i1.top, (i1.top + Y)/*, (i1.y + Y)*/, i2.top];
            }
            else if(i1.s != i2.s){
                if(i1.s == 'v'){
                    pointsX = [i1.left, i2.left, i2.left];
                    pointsY = [i1.top, i1.top, i2.top];
                }
                else {
                    pointsX = [i1.left, i1.left, i2.left];
                    pointsY = [i1.top, i2.top, i2.top];
                }
            }
            this.drawDiamond(i2);
			this.drawSvgHelper(p1);
        }
	}
	this.drawConnector(pointsX, pointsY);
	
	if(Vector.type == Vector.SVG) {
		var svgParent = $('#canvas').find('svg').get(0);
        var svgBox = svgParent.getBBox();
		var w = svgBox.x + svgBox.width + 2;
		var h = svgBox.y + svgBox.height + 2;
		svgParent.setAttribute('width', w);
		svgParent.setAttribute('height', h);
    }
};


ForeignKeyUI.prototype.intersect = function (tsize, tpos, _c, _d){
     //  Fail if either line segment is zero-length.
    var distAB, theCos, theSin, newX, a, b, ABpos, _i, c, d;
    var vertices = [
        {left: tpos.left, top: tpos.top},
        {left: tpos.left + tsize.width, top: tpos.top},
        {left: tpos.left + tsize.width, top: tpos.top + tsize.height},
        {left: tpos.left, top: tpos.top + tsize.height}
    ];
    for(var i = 0; i < 4; i++){
        _i = (i < 3)? i+1 : 0;
        a = {left: vertices[i].left, top: vertices[i].top};
        b = {left: vertices[_i].left, top: vertices[_i].top};
        c = {left: _c.left, top: _c.top};
        d = {left: _d.left, top: _d.top};
        if (a.left==b.left && a.top==b.top || c.left==d.left && c.top==d.top) continue;
        //  Fail if the segments share an end-point.
        if (a.left==c.left && a.top==c.top || b.left==c.left && b.top==c.top ||  a.left==d.left && a.top==d.top || b.left==d.left && b.top==d.top) continue;
        //  (1) Translate the system so that point A is on the origin.
        b.left-=a.left;b.top-=a.top;
        c.left-=a.left;c.top-=a.top;
        d.left-=a.left;d.top-=a.top;
        //  Discover the length of segment A-B.
        distAB=Math.sqrt(b.left*b.left+b.top*b.top);
        //  (2) Rotate the system so that point B is on the positive X axis.
        theCos=b.left/distAB;
        theSin=b.top/distAB;
        newX=c.left*theCos+c.top*theSin;
        c.top=c.top*theCos-c.left*theSin;c.left=newX;
        newX=d.left*theCos+d.top*theSin;
        d.top=d.top*theCos-d.left*theSin;d.left=newX;
        //  Fail if segment C-D doesn't cross line A-B.
        if (c.top<0. && d.top<0. || c.top>=0. && d.top>=0.) continue;
        //  (3) Discover the position of the intersection point along line A-B.
        ABpos=d.left+(c.left-d.left)*d.top/(d.top-c.top);
        //  Fail if segment C-D crosses line A-B outside of segment A-B.
        if (ABpos<0. || ABpos>distAB) continue;
        //  (4) Apply the discovered position to line A-B in the original coordinate system.
        var obj = {left: Math.round(a.left+ABpos*theCos), top: Math.round(a.top+ABpos*theSin), s: ((i%2 == 0)? 'h': 'v')};
        if(obj.s == "v"){
            if(tpos.top + tsize.height < obj.top + ForeignKeyUI.TRIANGLE_SIZE)
                obj.top = tpos.top + tsize.height - ForeignKeyUI.TRIANGLE_SIZE;
            else if(tpos.top > obj.top - ForeignKeyUI.TRIANGLE_SIZE)
                obj.top = tpos.top + ForeignKeyUI.TRIANGLE_SIZE;
        }else{
            if(tpos.left + tsize.width < obj.left + ForeignKeyUI.TRIANGLE_SIZE)
                obj.left = tpos.left + tsize.width - ForeignKeyUI.TRIANGLE_SIZE;
            else if(tpos.left > obj.left - ForeignKeyUI.TRIANGLE_SIZE)
                obj.left = tpos.left + ForeignKeyUI.TRIANGLE_SIZE;
        }
        return obj;
    }
};

ForeignKeyUI.prototype.getSvgHelper = function(){
	if(Vector.type == Vector.VML) return null;
	else if(typeof this._svgHelper == 'undefined'){
		this._svgHelper = Vector.createElement("circle");
		$('#canvas').find('svg').append(this._svgHelper);
	}
	return this._svgHelper;
};

ForeignKeyUI.prototype.drawSvgHelper = function(point){
	if(Vector.type == Vector.SVG){
		var svgHelper = this.getSvgHelper();
		svgHelper.setAttribute('cx', point.left + 'px');
		svgHelper.setAttribute('cy', point.top + 'px');
		svgHelper.setAttribute('r', '2px');
	}
};

ForeignKeyUI.prototype.getConnector = function(){
	if(typeof this._connector == 'undefined'){
		this._connector = Vector.createElement('polyline');
		this._connector.style.cursor = 'pointer';
		if(Vector.type == Vector.SVG){
			this._connector.setAttribute('stroke', 'black');
			this._connector.setAttribute('stroke-width', '2');
			this._connector.setAttribute('fill', 'transparent');
			$('#canvas').find('svg').append(this._connector);
		}else{
			this._connector.stroke = 'true';
			this._connector.strokecolor = 'black';
			this._connector.strokeweight = '2';
			this._connector.style.position = 'absolute';
			this._connector.filled = false;
			$('#canvas').append(this._connector);
		}
		$(this._connector).data('dbobject', this.getController());
	}
	return this._connector;
};

ForeignKeyUI.prototype.drawConnector = function(pointsX, pointsY){
	var points = Vector.getPoints(pointsX, pointsY);
	if(Vector.type == Vector.SVG) {
		this.getConnector().setAttribute('points', points);
	}else{
		this.getConnector().points.value = points;
	}
};

ForeignKeyUI.prototype.getDiamond = function(){
	if(typeof this._diamond == 'undefined'){
		if(Vector.type == Vector.SVG){
			this._diamond = Vector.createElement('polygon');
			this._diamond.setAttribute('fill', 'black');
			$('#canvas').find('svg').append(this._diamond);
		}else{
			this._diamond = Vector.createElement('shape');
			this._diamond.stroke = false;
			this._diamond.fillcolor = 'black';
			this._diamond.coordorigin = '0 0';
			this._diamond.coordsize = '10 10';
			this._diamond.style.position = 'absolute';
			this._diamond.path='m 0,5 l 5,0,10,5,5,10 x e';
			this._diamond.style.width = (ForeignKeyUI.TRIANGLE_SIZE * 2) + 'px';
			this._diamond.style.height = (ForeignKeyUI.TRIANGLE_SIZE * 2) + 'px';
			$('#canvas').append(this._diamond);
		}
	}
	return this._diamond;
};

ForeignKeyUI.prototype.drawDiamond = function(point){
	var diamond = this.getDiamond();
	if(Vector.type == Vector.VML){
        diamond.style.left = (point.left - ForeignKeyUI.TRIANGLE_SIZE) + 'px';
        diamond.style.top = (point.top - ForeignKeyUI.TRIANGLE_SIZE) + 'px';
        diamond.style.display = 'inline';
    }
    else{
        var points =
            (point.left - ForeignKeyUI.TRIANGLE_SIZE)+ ',' +
            point.top + ' ' +
            point.left + ',' +
            (point.top - ForeignKeyUI.TRIANGLE_SIZE) + ' ' +
            (point.left + ForeignKeyUI.TRIANGLE_SIZE)+ ',' +
            point.top + ' ' +
            point.left + ',' +
            (point.top + ForeignKeyUI.TRIANGLE_SIZE);
        diamond.setAttribute('points', points);
    }
};

ForeignKeyUI.prototype.hide = function(){
	if(Vector.type == Vector.SVG){
        this.getConnector().setAttribute('points', '');
        this.getDiamond().setAttribute('points', '');
        this.getSvgHelper().setAttribute('r', '0px');
    }else{
        this.getConnector().points.value = 'null';
        this.getDiamond().style.display = 'none';
    }
};

ForeignKeyUI.prototype.onConnectorHover = function(event){
	var diamond;
	if(event.type == 'mouseenter'){
		if(Vector.type == Vector.SVG){
			this.getConnector().setAttribute('stroke', '#E59700');
			this.getDiamond().setAttribute('fill', '#E59700');
		}else{
			diamond = this.getDiamond();
			diamond.fillcolor = '#E59700';
			diamond.strokecolor = '#E59700';
			this.getConnector().strokecolor = '#E59700';
		}
		this.getController().setHighLight(true);
	}else{
		if(Vector.type == Vector.SVG){
			this.getConnector().setAttribute('stroke', 'black');
			this.getDiamond().setAttribute('fill', 'black');
		}else{
			diamond = this.getDiamond();
			diamond.fillcolor = 'black';
			diamond.strokecolor = 'black';
			this.getConnector().strokecolor = 'black';
		}
		this.getController().setHighLight(false);
	}
};

ForeignKeyUI.prototype.onConnectorMouseDown = function(event){
	event.stopPropagation();
};

ForeignKeyUI.prototype.onConnectorDblclick = function(event){
	this.getController().alterForeignKey();
};

ForeignKeyUI.prototype.drop = function(){
	$(this.getConnector()).remove();
	$(this.getDiamond()).remove();
	if(Vector.type == Vector.SVG) $(this.getSvgHelper()).remove();
};
ForeignKeyDialog = function() {	
	this.setModel(new ForeignKeyDialogModel());
	this.setUI(new ForeignKeyDialogUI(this));
};

$.extend(ForeignKeyDialog.prototype, DBObjectDialog);

ForeignKeyDialog.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'referencedTable':
			ui.updateForeignColumns();
			break;
		case 'selectedColumns':
			ui.updateSelectedColumns(event.selectedColumns);
			ui.updateLocalColumns();
			ui.updateForeignColumns();
			break;
	}
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, event);	
};

ForeignKeyDialog.prototype.createForeignKey= function(table){
	var model = this.getModel();
	var foreignKeyModel = new ForeignKeyModel();
	foreignKeyModel.setParent(table);
	model.setAction(DBDesigner.Action.ADD_FOREIGNKEY);
	model.setDBObjectModel(foreignKeyModel);
	this.getUI().open(DBDesigner.lang.straddfk);
};

ForeignKeyDialog.prototype.editForeignKey = function(foreignKey){
	var model = this.getModel();
	model.setAction(DBDesigner.Action.ALTER_FOREIGNKEY);
	model.setDBObjectModel(foreignKey.getModel());
	this.getUI().open(DBDesigner.lang.stralterforeignkey);
};

ForeignKeyDialog.prototype.saveForeignKey = function(form){
	var model = this.getModel();
	var foreignKeyModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		var flags = 0;
		if(action == DBDesigner.Action.ALTER_FOREIGNKEY) foreignKeyModel.startEditing();
		if(form.isDeferrable) flags |= ForeignKeyModel.Flag.DEFERRABLE;
		if(form.isDeferred) flags |= ForeignKeyModel.Flag.DEFERRED;
		if(form.isMatchFull) flags |= ForeignKeyModel.Flag.MATCH_FULL;
		
		foreignKeyModel.setComment(form.comment);
		foreignKeyModel.setFlags(flags);
		foreignKeyModel.setDeleteAction(form.onDelete);
		foreignKeyModel.setUpdateAction(form.onUpdate);
		foreignKeyModel.setColumns(form.columns);
		foreignKeyModel.setReferencedTable(form.referencedTable);
		if(form.name == '') foreignKeyModel.chooseName();
		else foreignKeyModel.setName(form.name);
		
		if(action == DBDesigner.Action.ADD_FOREIGNKEY){
			var foreignKey = new ForeignKey(foreignKeyModel);
			foreignKeyModel.getParent().getForeignKeyCollection().add(foreignKey);
		} else foreignKeyModel.stopEditing();
		
		return true;
	}
	return false;
};

ForeignKeyDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var foreignKeyModel = this.getDBObjectModel();

	if(form.name != '' && ConstraintHelper.constraintNameExists(form.name, foreignKeyModel)){
		ui.showError(DBDesigner.lang.strconstraintexists, DBDesigner.lang.strname);
		isValid = false;
	}
	
	if(form.columns.length == 0){
		ui.showError(DBDesigner.lang.strfkneedscols, DBDesigner.lang.strcolumns);
		isValid = false;
	}
	return isValid;
};

ForeignKeyDialog.prototype.setReferencedTable = function(table){
	this.getModel().setReferencedTable(table);
};

ForeignKeyDialog.prototype.getReferencedTable = function(){
	return this.getModel().getReferencedTable();
};

ForeignKeyDialog.prototype.getLocalColumns = function(){
	return this.getModel().getLocalColumns();
};

ForeignKeyDialog.prototype.getForeignColumns = function(){
	return this.getModel().getForeignColumns();
};

ForeignKeyDialog.prototype.setSelectedColumns = function(selectedColumns){
	this.getModel().setSelectedColumns(selectedColumns);
};

ForeignKeyDialog.prototype.addSelectedColumns = function(localColumnName, referencedColumnName){
	this.getModel().addSelectedColumns(localColumnName, referencedColumnName);
};

ForeignKeyDialog.prototype.removeSelectedColumns = function(index){
	this.getModel().removeSelectedColumns(index);
};

ForeignKeyDialog.prototype.getSelectedColumns = function(){
	return this.getModel().getSelectedColumns();
};

ForeignKeyDialog.prototype.clearReferences = function(){
	var model = this.getModel();
	model.setSelectedColumns(null);
	model.setReferencedTable(null);
};

// *****************************************************************************

ForeignKeyDialogModel = function() {
	
};

$.extend(ForeignKeyDialogModel.prototype, DBObjectDialogModel);

ForeignKeyDialogModel.prototype.setReferencedTable = function(table){
	this._referencedTable = table;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'referencedTable', newValue: table});
};

ForeignKeyDialogModel.prototype.getReferencedTable = function(){
	if(typeof this._referencedTable == 'undefined') this._referencedTable = null;
	return this._referencedTable;
};

ForeignKeyDialogModel.prototype.getLocalColumns = function(){
	var columns = [];
	var dbobject = this.getDBObjectModel();
	if(dbobject != null){
		var localColumns = dbobject.getParent().getColumnCollection().getColumns();
		var localSelectedColumns = this.getLocalSelectedColumns();
		for (var i = 0; i < localColumns.length; i++){
			if($.inArray(localColumns[i], localSelectedColumns) == -1){
				columns.push(localColumns[i]);
			}
		}
	}
	return columns;
};

ForeignKeyDialogModel.prototype.getForeignColumns = function(){
	var referencedTable = this.getReferencedTable();
	var columns = []
	if(referencedTable != null){
		var foreignSelectedColumns = this.getForeignSelectedColumns();
		var foreignColumns = referencedTable.getColumnCollection().getReferenceableColumns();
		for (var i = 0; i < foreignColumns.length; i++){
			if($.inArray(foreignColumns[i], foreignSelectedColumns) == -1){
				columns.push(foreignColumns[i]);
			}
		}
	}
	return columns;
};

ForeignKeyDialogModel.prototype.getLocalSelectedColumns = function(){
	var selectedColumns = this.getSelectedColumns();
	var columns = [];
	if($.isArray(selectedColumns)){
		for(var i = 0; i < selectedColumns.length; i++)
			columns.push(selectedColumns[i].localColumn);
	}
	return columns;
};

ForeignKeyDialogModel.prototype.getForeignSelectedColumns = function(){
	var selectedColumns = this.getSelectedColumns();
	var columns = [];
	if($.isArray(selectedColumns)){
		for(var i = 0; i < selectedColumns.length; i++)
			columns.push(selectedColumns[i].foreignColumn);
	}
	return columns;
};

ForeignKeyDialogModel.prototype.getSelectedColumns = function(){
	if(typeof this._selectedColumns == 'undefined') this._selectedColumns = [];
	return this._selectedColumns;
};

ForeignKeyDialogModel.prototype.setSelectedColumns = function(selectedColumns){
	this._selectedColumns = selectedColumns;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: this._selectedColumns});
};

ForeignKeyDialogModel.prototype.addSelectedColumns = function(localColumnName, referencedColumnName){
	var localColumn = this.getDBObjectModel().getParent().getColumnCollection().getColumnByName(localColumnName);
	var foreignColumn = this.getReferencedTable().getColumnCollection().getColumnByName(referencedColumnName);
	if(localColumn != null && foreignColumn != null){
		var selectedColumns = this.getSelectedColumns();
		selectedColumns.push({localColumn:localColumn, foreignColumn: foreignColumn});
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: selectedColumns});
	}
};

ForeignKeyDialogModel.prototype.removeSelectedColumns = function(index){
	var selectedColumns = this.getSelectedColumns();
	if(index >= 0 && index < selectedColumns.length){
		selectedColumns.splice(index, 1);
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: selectedColumns});
	}
};



// *****************************************************************************

ForeignKeyDialogUI = function(controller) {
	this.setTemplateID('ForeignKeyDialog');
	this.setController(controller);
	this.init();
	var dom = this.getDom();
	dom.appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
	dom.find('div.tabs').tabs();
};

$.extend(ForeignKeyDialogUI.prototype, DBObjectDialogUI);

ForeignKeyDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('div.submit-buttons').on('click', 'input', $.proxy(this.submitButtonClicked, this));
	dom.find('#foreignkey-dialog_foreignkey-references').change($.proxy(this.referencedTableChanged, this));
	dom.find('#foreignkey-dialog_foreignkey-deferrable').click(this.deferrableChange);
	dom.find('#foreignkey-dialog_addcolumns').click($.proxy(this.addSelectedColumns, this));
	dom.find('#foreignkey-dialog_columns-tab').on('click', 'a.remove', $.proxy(this.removeSelectedColumns, this));
	this.setKeyPressEvent();
	this.setDialogCloseEvent();
};


ForeignKeyDialogUI.prototype.open = function(title){
	
	var foreignKeyModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	var controller = this.getController();
	
	this.cleanErrors();
	
	if(foreignKeyModel != null){
		$('#foreignkey-dialog_foreignkey-name').val(foreignKeyModel.getName());
		$('#foreignkey-dialog_foreignkey-updateaction').val(foreignKeyModel.getUpdateAction());
		$('#foreignkey-dialog_foreignkey-deleteaction').val(foreignKeyModel.getDeleteAction());
		$('#foreignkey-dialog_foreignkey-matchfull').prop('checked', foreignKeyModel.isMatchFull());
		$('#foreignkey-dialog_foreignkey-deferrable').prop('checked', foreignKeyModel.isDeferrable());
		$('#foreignkey-dialog_foreignkey-comment').val(foreignKeyModel.getComment());
		
		if(foreignKeyModel.isDeferrable())$('#foreignkey-dialog_foreignkey-deferred').prop('checked', foreignKeyModel.isDeferred()).prop('disabled', false);
		else $('#foreignkey-dialog_foreignkey-deferred').prop('checked', false).prop('disabled', true);
		
		/** Update tables **/
		var tNames = DBDesigner.app.getTableCollection().getTableNames();
		var $options = $();
		var $option;
		var i = 0;
		var $referencedTable = $('#foreignkey-dialog_foreignkey-references');
		for (i = 0; i < tNames.length; i++){
			$option = $('<option></option>').attr('value', tNames[i]).text(tNames[i]);
			$options = $options.add($option);
		}
		if($options.length > 0) $referencedTable.html($options);
		else $referencedTable.empty();
		
		if(controller.getModel().getAction() == DBDesigner.Action.ALTER_FOREIGNKEY){
			$referencedTable.val(foreignKeyModel.getReferencedTable().getName()).prop('disabled', true);
		}else {
			$referencedTable.prop('disabled', false);
		}
		$referencedTable.trigger('change');
		controller.setSelectedColumns(foreignKeyModel.getColumns());
		this.updateLocalColumns();
		dom.find('div.tabs').tabs('select', 0);
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
	
};

ForeignKeyDialogUI.prototype.save = function(closeWindow){
	closeWindow = (typeof closeWindow == 'undefined')? true : closeWindow;
	this.cleanErrors();
	var form = {
		name: $.trim($('#foreignkey-dialog_foreignkey-name').val()),
		referencedTable: this.getController().getReferencedTable(),
		onUpdate: $('#foreignkey-dialog_foreignkey-updateaction').val(),
		onDelete: $('#foreignkey-dialog_foreignkey-deleteaction').val(),
		isMatchFull: $('#foreignkey-dialog_foreignkey-matchfull').prop('checked'),
		isDeferrable: $('#foreignkey-dialog_foreignkey-deferrable').prop('checked'),
		isDeferred: $('#foreignkey-dialog_foreignkey-deferred').prop('checked'),
		comment: $.trim($('#foreignkey-dialog_foreignkey-comment').val()),
		columns: this.getController().getSelectedColumns()
	};
	var saveSuccess = this.getController().saveForeignKey(form);
	if(saveSuccess && closeWindow) this.close();
	return saveSuccess;
};

ForeignKeyDialogUI.prototype.referencedTableChanged = function(event){
	var table = DBDesigner.app.getTableCollection().getTableByName($(event.currentTarget).val());
	this.getController().setReferencedTable(table);
};

ForeignKeyDialogUI.prototype.typeHasPredefinedSize = function(type){
	for(var i = 0, n = DBDesigner.dataTypes.length; i < n; i++){
		if(DBDesigner.dataTypes[i].typedef == type){
			return DBDesigner.dataTypes[i].size_predefined;
		}
	}
	return false;
};

ForeignKeyDialogUI.prototype.deferrableChange = function(event){
	if(this.checked) $('#foreignkey-dialog_foreignkey-deferred').prop('disabled', false);
	else $('#foreignkey-dialog_foreignkey-deferred').prop('disabled', true).prop('checked', false);
};

ForeignKeyDialogUI.prototype.updateLocalColumns = function(){
	var columns = this.getController().getLocalColumns();
	var $options = $();
	var cName;
	var $option;
	for(var i = 0; i < columns.length; i++){
		cName = columns[i].getName();
		$option = $('<option></option>').attr('value', cName).text(cName);
		$options = $options.add($option);
	}
	if($options.length > 0) {
		$('#foreignkey-dialog_foreignkey-localcolumn').html($options);
		if(this.getController().getForeignColumns().length > 0)
			$('#foreignkey-dialog_addcolumns').prop('disabled', false);
	}
	else {
		$('#foreignkey-dialog_foreignkey-localcolumn').empty();
		$('#foreignkey-dialog_addcolumns').prop('disabled', true);
	}
};

ForeignKeyDialogUI.prototype.updateForeignColumns = function(){
	var columns = this.getController().getForeignColumns();
	var $options = $();
	var cName;
	var $option;
	for(var i = 0; i < columns.length; i++){
		cName = columns[i].getName();
		$option = $('<option></option>').attr('value', cName).text(cName);
		$options = $options.add($option);
	}
	if($options.length > 0) {
		$('#foreignkey-dialog_foreignkey-referencedcolumn').html($options);
		if(this.getController().getLocalColumns().length > 0)
			$('#foreignkey-dialog_addcolumns').prop('disabled', false);
	}
	else {
		$('#foreignkey-dialog_foreignkey-referencedcolumn').empty();
		$('#foreignkey-dialog_addcolumns').prop('disabled', true);
	}
};

ForeignKeyDialogUI.prototype.addSelectedColumns = function(){
	var localColumnName = $('#foreignkey-dialog_foreignkey-localcolumn').val();
	var foreignColumnName = $('#foreignkey-dialog_foreignkey-referencedcolumn').val();
	var controller = this.getController();
	controller.addSelectedColumns(localColumnName, foreignColumnName);
	if(controller.getSelectedColumns().length > 0) $('#foreignkey-dialog_foreignkey-references').prop('disabled', true);
};

ForeignKeyDialogUI.prototype.updateSelectedColumns = function(selectedColumns){
	if($.isArray(selectedColumns)){
		var $tbody = $('#foreignkey-dialog_columns-tab').find('tbody');
		if(selectedColumns.length == 0){
			$tbody.html('<tr><td colspan="3">' + DBDesigner.lang.strfkneedscols + '</td></tr>');
		}else{
			var $tableContent = $();
			var $tableRow;
			var $tableCell;
			var $deleteButton;
			for(var i = 0; i < selectedColumns.length; i++){
				$tableRow = $('<tr></tr>');

				$tableCell = $('<td></td>').text(selectedColumns[i].localColumn.getName());
				$tableRow.append($tableCell);

				$tableCell = $('<td></td>').text(selectedColumns[i].foreignColumn.getName());
				$tableRow.append($tableCell);

				$deleteButton = $('<a>X</a>').attr({href: '#', title: DBDesigner.lang.strremove, 'class': 'remove'}).data('index', i);
				$tableCell = $('<td></td>').append($deleteButton);
				$tableRow.append($tableCell);

				$tableContent = $tableContent.add($tableRow);
			}
			$tbody.html($tableContent);
		}
	}
};

ForeignKeyDialogUI.prototype.removeSelectedColumns = function(event){
	event.preventDefault();
	var controller = this.getController();
	controller.removeSelectedColumns($(event.target).data('index'));
	if(controller.getSelectedColumns().length == 0) $('#foreignkey-dialog_foreignkey-references').prop('disabled', false);
};

ForeignKeyDialogUI.prototype.submitButtonClicked = function(event){
	if(event.target.id == 'foreignkey-dialog_cancel') {this.close();}
	else{
		var saveSuccess = this.save(false);
		if(event.target.id == 'foreignkey-dialog_save' && saveSuccess) {this.close();}
		else if(event.target.id == 'foreignkey-dialog_save2' && saveSuccess) {
			var controller = this.getController();
			var table = controller.getModel().getDBObjectModel().getParent();
			controller.createForeignKey(table);
		}
	}
};UniqueKeyCollection = function(){
	this._uniqueKeys = [];
};

$.extend(UniqueKeyCollection.prototype, EventDispatcher);

UniqueKeyCollection.prototype.getUniqueKeyByName = function(name){
	for(var i = 0, n = this._uniqueKeys.length; i < n; i++){
		if(this._uniqueKeys[i].getName() == name) return this._uniqueKeys[i];
	}
	return null;
};

UniqueKeyCollection.prototype.add = function(uniqueKey){
	if($.inArray(uniqueKey, this._uniqueKeys) == -1){
		this._uniqueKeys.push(uniqueKey);
		DBDesigner.app.getConstraintList().push(uniqueKey);
		uniqueKey.bind(UniqueKey.Event.ALTER_REQUEST, this.alterUniqueKey, this);
		uniqueKey.bind(DBObject.Event.DBOBJECT_ALTERED, this.onUniqueKeyAltered, this);
		uniqueKey.bind(DBObject.Event.DBOBJECT_DROPPED, this.onUniqueKeyDropped, this);
		this.trigger(Collection.Event.COLLECTION_CHANGED, {uniqueKeyAdded: uniqueKey});
	}
};

UniqueKeyCollection.prototype.getUniqueKeys = function(){
	return [].concat(this._uniqueKeys);
};

UniqueKeyCollection.prototype.onUniqueKeyAltered = function(event){
	this.trigger(Collection.Event.COLLECTION_CHANGED, {uniqueKeyAltered: event.sender});
};

UniqueKeyCollection.prototype.onUniqueKeyDropped = function(event){
	this.remove(event.sender);
};

UniqueKeyCollection.prototype.alterUniqueKey = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_UNIQUEKEY, event.sender);
};

UniqueKeyCollection.prototype.remove = function(uniqueKey){
	var constraintList = DBDesigner.app.getConstraintList();
	var index1 = $.inArray(uniqueKey, this._uniqueKeys);
	var index2 = $.inArray(uniqueKey, constraintList);
	this._uniqueKeys.splice(index1, 1);
	constraintList.splice(index2, 1);
	uniqueKey.unbind(UniqueKey.Event.ALTER_REQUEST, this.alterUniqueKey, this);
	uniqueKey.unbind(DBObject.Event.DBOBJECT_ALTERED, this.onUniqueKeyAltered, this);
	uniqueKey.unbind(DBObject.Event.DBOBJECT_DROPPED, this.onUniqueKeyDropped, this);
	this.trigger(Collection.Event.COLLECTION_CHANGED, {uniqueKeyDropped: uniqueKey});
};

UniqueKeyCollection.prototype.serialize = function() {
	var uniqueKeys = this.getUniqueKeys();
	var collection = [];
	for(var i = 0; i < uniqueKeys.length; i++) {
		collection.push(uniqueKeys[i].serialize());
	}
	return collection;
};UniqueKey = function(){
	//If the constructor gets a UniqueKeyModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof UniqueKeyModel) this.setModel(arguments[0]);
	else this.setModel(new ForeignKeyModel());
};
$.extend(UniqueKey.prototype, DBObject);

UniqueKey.prototype.modelPropertyChanged = function(event) {
	switch(event.property){
		case 'dropped':
			this.trigger(DBObject.Event.DBOBJECT_DROPPED);
			break;
		case 'stopEditing':
			this.modelChanged();
			break;
		default:
			this.modelChanged(event.property, true);
			break;
	}	
};

UniqueKey.prototype.getParent = function(){
	return this.getModel().getParent();
};

UniqueKey.prototype.drop = function(){
	this.getModel().drop();
};

UniqueKey.prototype.serialize = function(){
	return this.getModel().serialize();
};

// *****************************************************************************

UniqueKeyModel = function(){};
$.extend(UniqueKeyModel.prototype, DBObjectModel);

UniqueKeyModel.prototype.setParent = function(table){
	this._parent = table;
};
UniqueKeyModel.prototype.getParent = function(){
	if(typeof this._parent == 'undefined') this._parent = null;
	return this._parent;
};
UniqueKeyModel.prototype.getColumns = function(){
	if(typeof this._columns == 'undefined') this._columns = [];
	return [].concat(this._columns);
};
UniqueKeyModel.prototype.setColumns = function(columns){
	var oldColumns = this.getColumns();
	var i;
	var throwEvent = false;
	for(i = 0; i < oldColumns.length; i++){
		if($.inArray(oldColumns[i], columns) == -1){
			oldColumns[i].setUniqueKey(false);
			oldColumns[i].unbind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnChanged, this);
			oldColumns[i].unbind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
			throwEvent = true;
		}
	}
	for(i = 0; i < columns.length; i++){
		if($.inArray(columns[i], oldColumns) == -1){
			columns[i].setUniqueKey(true);
			columns[i].bind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnChanged, this);
			columns[i].bind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
			throwEvent = true;
		}
	}
	this._columns = columns;
	if(throwEvent)this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'columns', oldValue: oldColumns, newValue: columns});
};

UniqueKeyModel.prototype.onColumnChanged = function(event){
	if(event.properties && $.inArray('name', event.properties) != -1){
		// this is just to notify the object detail view in case the parent table is selected
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'columnChanged'});
	}
};

UniqueKeyModel.prototype.chooseName = function(){
	var label = 'key';
	var name1 = this.getParent().getName();
	var name2 = '';
	var count = 0;
	var name;
	var columns = this.getColumns();
	for(var i = 0; i < columns.length; i++){
		name2 = name2 == ''? columns[i].getName() : name2 + '_' + columns[i].getName();
	}
	do{
		if(count > 0) label = 'key' + count;
		name = ConstraintHelper.buildConstraintName(name1, name2, label);
		count++;
	} while(ConstraintHelper.constraintNameExists(name, this));
	this.setName(name);
};

UniqueKeyModel.prototype.drop = function(){
	var columns = this.getColumns();
	for(var i = 0; i < columns.length; i++){
		columns[i].setUniqueKey(false);
		columns[i].unbind(DBObject.Event.DBOBJECT_ALTERED, this.onColumnChanged, this);
		columns[i].unbind(DBObject.Event.DBOBJECT_DROPPED, this.drop, this);
	}
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'dropped'});
};

UniqueKeyModel.prototype.serialize = function(){
	var columns = this.getColumns();
	var columnNames = [];
	for(var i = 0; i < columns.length; i++) {
		columnNames.push(columns[i].getName());
	}
	return {
		name: this.getName(),
		comment: this.getComment(),
		columns: columnNames
	};
};
UniqueKeyDialog = function() {	
	this.setModel(new UniqueKeyDialogModel());
	this.setUI(new UniqueKeyDialogUI(this));
};

$.extend(UniqueKeyDialog.prototype, DBObjectDialog);

UniqueKeyDialog.prototype.createUniqueKey = function(table){
	var model = this.getModel();
	var uniqueKeyModel = new UniqueKeyModel;
	uniqueKeyModel.setParent(table);
	model.setAction(DBDesigner.Action.ADD_UNIQUEKEY);
	model.setDBObjectModel(uniqueKeyModel);
	this.getUI().open(DBDesigner.lang.stradduniq);
};

UniqueKeyDialog.prototype.editUniqueKey = function(uniqueKey){
	var model = this.getModel();
	model.setAction(DBDesigner.Action.ALTER_UNIQUEKEY);
	model.setDBObjectModel(uniqueKey.getModel());
	this.getUI().open(DBDesigner.lang.stralteruniq);
};

UniqueKeyDialog.prototype.saveUniqueKey = function(form){
	var model = this.getModel();
	var uniqueKeyModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		if(action == DBDesigner.Action.ALTER_UNIQUEKEY) uniqueKeyModel.startEditing();
		uniqueKeyModel.setColumns(form.columns);
		uniqueKeyModel.setComment(form.comment);
		if(form.name == '') uniqueKeyModel.chooseName();
		else uniqueKeyModel.setName(form.name);
		
		if(action == DBDesigner.Action.ADD_UNIQUEKEY){
			uniqueKeyModel.getParent().getUniqueKeyCollection().add(new UniqueKey(uniqueKeyModel));
		}
		else uniqueKeyModel.stopEditing();
		return true;
	}
	return false;
};

UniqueKeyDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var uniqueKeyModel = this.getDBObjectModel();

	if(form.name != '' && ConstraintHelper.constraintNameExists(form.name, uniqueKeyModel)){
		ui.showError(DBDesigner.lang.strconstraintexists, DBDesigner.lang.strname);
		isValid = false;
	}
	
	if(form.columns.length == 0){
		ui.showError(DBDesigner.lang.struniqneedscols, DBDesigner.lang.strcolumns);
		isValid = false;
	}
	return isValid;
};

UniqueKeyDialog.prototype.modelPropertyChanged = function(event) {
	var ui = this.getUI();
	switch(event.property){
		case 'selectedColumns':
			ui.updateSelectedColumns(event.selectedColumns);
			ui.updateTableColumns();
			break;
	}
};

UniqueKeyDialog.prototype.getSelectedColumns = function(){
	return this.getModel().getSelectedColumns();
};

UniqueKeyDialog.prototype.setSelectedColumns = function(columns){
	this.getModel().setSelectedColumns(columns);
};

UniqueKeyDialog.prototype.getTableColumns = function(){
	return this.getModel().getTableColumns();
};

UniqueKeyDialog.prototype.addColumns = function(columns){
	this.getModel().addColumns(columns);
};

UniqueKeyDialog.prototype.removeColumns = function(columns){
	this.getModel().removeColumns(columns);
};

UniqueKeyDialog.prototype.clearReferences = function(){
	var model = this.getModel();
	model.setSelectedColumns(null);
};

// *****************************************************************************

UniqueKeyDialogModel = function() {
	
};
$.extend(UniqueKeyDialogModel.prototype, DBObjectDialogModel);

UniqueKeyDialogModel.prototype.getSelectedColumns = function(){
	if(typeof this._selectedColumns == 'undefined') this._selectedColumns = [];
	return this._selectedColumns;
};

UniqueKeyDialogModel.prototype.setSelectedColumns = function(selectedColumns){
	this._selectedColumns = selectedColumns;
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: this._selectedColumns});
};

UniqueKeyDialogModel.prototype.addColumns = function(columns){
	var tableColumns = this.getTableColumns();
	var selectedColumns = this.getSelectedColumns();
	var column;
	var j;
	var throwEvent = false;
	for (var i = 0; i < columns.length; i++){
		for (j = 0; j < tableColumns.length; j++){
			if(tableColumns[j].getName() == columns[i]){
				selectedColumns.push(tableColumns[j]);
				throwEvent = true;
				break;
			}
		}
	}
	if(throwEvent)
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: this._selectedColumns});
};

UniqueKeyDialogModel.prototype.removeColumns = function(columns){
	var selectedColumns = this.getSelectedColumns();
	var column;
	var j;
	var throwEvent = false;
	for (var i = 0; i < columns.length; i++){
		for (j = 0; j < selectedColumns.length; j++){
			if(selectedColumns[j].getName() == columns[i]){
				selectedColumns.splice(j, 1);
				throwEvent = true;
				break;
			}
		}
	}
	if(throwEvent)
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'selectedColumns', selectedColumns: this._selectedColumns});
};

UniqueKeyDialogModel.prototype.getTableColumns = function(){
	var retColumns = [];
	var dbobjectModel = this.getDBObjectModel();
	if(dbobjectModel != null){
		var selectedColumns = this.getSelectedColumns();
		var allColumns = dbobjectModel.getParent().getColumnCollection().getColumns();
		for(var i = 0; i < allColumns.length; i++){
			if($.inArray(allColumns[i], selectedColumns) == -1){
				retColumns.push(allColumns[i]);
			}
		}
	}
	return retColumns;
};


// *****************************************************************************

UniqueKeyDialogUI = function(controller) {
	this.setTemplateID('UniqueKeyDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};

$.extend(UniqueKeyDialogUI.prototype, DBObjectDialogUI);

UniqueKeyDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.find('input.update-columns').click($.proxy(this.updateColumns, this));
	dom.find('div.submit-buttons').on('click', 'input', $.proxy(this.submitButtonClicked, this));
	this.setDialogCloseEvent();
	this.setKeyPressEvent();
};


UniqueKeyDialogUI.prototype.open = function(title){
	var uniqueKeyModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	
	this.cleanErrors();
	
	if(uniqueKeyModel != null){
		$('#uniquekey-dialog_table-name').val(uniqueKeyModel.getName());
		$('#uniquekey-dialog_uniquekey-comment').val(uniqueKeyModel.getComment());
		this.getController().setSelectedColumns(uniqueKeyModel.getColumns());
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
};

UniqueKeyDialogUI.prototype.save = function(closeWindow){
	closeWindow = (typeof closeWindow == 'undefined')? true : closeWindow;
	this.cleanErrors();
	
	var form = {
		name: $.trim($('#uniquekey-dialog_table-name').val()),
		comment: $.trim($('#uniquekey-dialog_uniquekey-comment').val()),
		columns: this.getController().getSelectedColumns()
	};
	var saveSuccess = this.getController().saveUniqueKey(form);
	if(saveSuccess && closeWindow) this.close();
	return saveSuccess;
};

UniqueKeyDialogUI.prototype.updateSelectedColumns = function(){
	this.updateSelect(this.getController().getSelectedColumns(), '#uniquekey-dialog_selected-columns');
};

UniqueKeyDialogUI.prototype.updateTableColumns = function(){
	this.updateSelect(this.getController().getTableColumns(), '#uniquekey-dialog_available-columns');
};

UniqueKeyDialogUI.prototype.updateSelect = function(columns, selectSelector){
	var $options = $();
	var $option;
	var columnName;
	if($.isArray(columns) && columns.length > 0){
		for(var i = 0; i < columns.length; i++){
			columnName = columns[i].getName();
			$option = $('<option></option>').val(columnName).text(columnName);
			$options = $options.add($option);
		}
		$(selectSelector).html($options);
	}
	else $(selectSelector).empty();
};

UniqueKeyDialogUI.prototype.updateColumns = function(event){
	var columns;
	if(event.target.id == 'uniquekey-dialog_add-columns'){
		columns = $('#uniquekey-dialog_available-columns').val();
		if($.isArray(columns)) this.getController().addColumns(columns);
	} else if(event.target.id == 'uniquekey-dialog_remove-columns'){
		columns = $('#uniquekey-dialog_selected-columns').val();
		if($.isArray(columns)) this.getController().removeColumns(columns);
	}
};

UniqueKeyDialogUI.prototype.submitButtonClicked = function(event){
	if(event.target.id == 'uniquekey-dialog_cancel') {this.close();}
	else{
		var saveSuccess = this.save(false);
		if(event.target.id == 'uniquekey-dialog_save' && saveSuccess) {this.close();}
		else if(event.target.id == 'uniquekey-dialog_save2' && saveSuccess) {
			var controller = this.getController();
			var table = controller.getModel().getDBObjectModel().getParent();
			controller.createUniqueKey(table);
		}
	}
};
DBDesigner.Action = {
	SELECT: 'actionselect',
	ADD_TABLE: 'actionaddtable',
	ALTER_TABLE: 'actionedittable',
	ADD_FOREIGNKEY: 'actionaddfk',
	ALTER_FOREIGNKEY: 'actionalterfk',
	ADD_UNIQUEKEY: 'actionadduniq',
	ALTER_UNIQUEKEY: 'actionalteruniq',
	ADD_COLUMN: 'actionaddcolumn',
	ALTER_COLUMN: 'actionaltercolumn',
	DROP_TABLE: 'actiondroptable',
	DROP_UNIQUEKEY: 'actiondropuniquekey',
	DROP_FOREIGNKEY: 'actiondropforeignkey',
	DROP_COLUMN: 'actiondropcolumn',
	SAVE: 'actionsave',
	SHOW_TABLE_DETAIL: 'actionshowtabledetail' 
};

DBDesigner.Event = { PROPERTY_CHANGED: 'propertychanged' };

ToolBar.Event = {ACTION_CHANGED: 'toolbaractionchanged'};

DBObject.Event = { DBOBJECT_ALTERED: 'dbobjectaltered', DBOBJECT_DROPPED: 'dbobjectdropped' };

Table.Event = {
	SELECTION_CHANGED: 'tableselectionchanged', 
	ALTER_REQUEST: 'tablealterrequest',
	TABLE_ALTERED: 'tabletablealtered',
	VIEW_BOX_CHANGED: 'tableviewboxchanged',
	DETAIL_REQUEST: 'tabledetailrequest'
};

Canvas.Event = {PLACEMENT_CAPTURED: 'canvasplacementcaptured'};

ObjectDetail.Event = {STATE_CHANGED: 'objectdetailstatechanged'};

Column.Event = {
	COLUMN_TYPE_CHANGED: 'columntypechanged',
	ALTER_REQUEST: 'columnalterrequest',
	COLUMN_ALTERED: 'columnaltered'
};

ColumnModel.Flag = {
	ARRAY: 1,
	PRIMARY_KEY: 2,
	UNIQUE_KEY: 4,
	FOREIGN_KEY: 8,
	NOTNULL: 16
};

Collection = { Event: {COLLECTION_CHANGED: 'collectionchanged'}};

ForeignKeyModel.Action = {
	NO_ACTION: 'a',
	RESTRICT: 'r',
	CASCADE: 'c',
	SET_NULL: 'n',
	SET_DEFAULT: 'd'
};

ForeignKeyModel.Flag = {
	DEFERRABLE: 1,
	DEFERRED: 2,
	MATCH_FULL: 4
};

ForeignKey.Event = {
	ALTER_REQUEST: 'foreignkeyalterforeignkey',
	FOREIGNKEY_ALTERED: 'foreignkeyaltered'
};

UniqueKey.Event = {
	ALTER_REQUEST: 'uniquekeyalterforeignkey',
	FOREIGNKEY_ALTERED: 'uniquekeyaltered'
};

ForeignKeyUI.TRIANGLE_SIZE = 7;

Vector.SVG = 'svg';
Vector.VML = 'vml';(function($){	
	$.partOf = function(array, subArray){
		for(var i = 0, n = array.length; i < n; i++)
			if($.inArray(array[i], subArray) != -1) return true;
		return false;
	};
})(jQuery);


ConfirmDialog = function(){
	this.setUI(new ConfirmDialogUI(this));
};
$.extend(ConfirmDialog.prototype, Component);

ConfirmDialog.prototype.show = function(message, title, callback){
	this.setCallback(callback);
	this.getUI().show(message, title);
};

ConfirmDialog.prototype.setCallback = function(callback){
	if(callback == null) this._callback = null;
	else{
		this._callback = {
			scope: callback.scope,
			method: callback.method,
			params: callback.params
		};
	}
};

ConfirmDialog.prototype.getCallback = function(){
	if(typeof this._callback == 'undefined') return null;
	return this._callback;
};

ConfirmDialog.prototype.executeCallback = function(){
	var callback = this.getCallback();
	if(callback != null){
		if(!$.isArray(callback.params)) callback.params = [];
		callback.method.apply(callback.scope, callback.params);
	}
};

ConfirmDialog.prototype.clearReferences = function(){
	this.setCallback(null);
};

// *****************************************************************************

ConfirmDialogUI = function(controller){
	this.setTemplateID('ConfirmDialog');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('body').dialog({modal: true, autoOpen: false, width: 'auto'});
};
$.extend(ConfirmDialogUI.prototype, ComponentUI);

ConfirmDialogUI.prototype.show = function(message, title){
	var dom = this.getDom();
	var paragraphs = message.split('\n');
	var $html = $();
	for(var i = 0; i < paragraphs.length; i++){
		$html = $html.add($('<p></p>').text(paragraphs[i]));
	}
	dom.find('div.content').html($html);
	dom.dialog('option','title', title);
	dom.dialog('open');
};

ConfirmDialogUI.prototype.close = function(){
	this.getDom().dialog('close');
};

ConfirmDialogUI.prototype.bindEvents = function(){
	var dom = this.getDom();
	dom.bind('dialogclose', $.proxy(this.onDialogClose, this));
	dom.find('input').click($.proxy(this.onButtonClick, this));
};

ConfirmDialogUI.prototype.onButtonClick = function(event){
	if(event.target.id == 'confirm-dialog_yes'){
		this.getController().executeCallback();
	}
	this.getDom().dialog('close');
};

ConfirmDialogUI.prototype.onDialogClose = function(event){
	this.getController().clearReferences();
};

