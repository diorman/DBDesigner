EventDispatcher = {
    bind: function (eventName, eventListener, eventScope) {
        if(!this._eventListeners) {this._eventListeners = [];this._eventScopes = [];}
        if(!this._eventListeners[eventName]){this._eventListeners[eventName] = [];this._eventScopes[eventName] = [];}
        for(var i = 0; i < this._eventListeners[eventName].length; i++){
            if(this._eventScopes[eventName][i] == eventScope && this._eventListeners[eventName][i] == eventListener){
                return;
            }
        }
        this._eventListeners[eventName].push(eventListener);
        this._eventScopes[eventName].push(eventScope);
    },
    unbind: function (eventName, eventListener, eventScope){
        if(typeof this._eventScopes[eventName] == "undefined") return;
        for(var i = 0; i < this._eventListeners[eventName].length; i++){
            if(this._eventScopes[eventName][i] == eventScope && this._eventListeners[eventName][i] == eventListener){
                this._eventListeners[eventName].splice(i, 1);
                this._eventScopes[eventName].splice(i, 1);
                return;
            }
        }
    },
    trigger: function (eventName) {
        if(!this._eventListeners) return;
        var i;
		var event = {sender: this, type: eventName};
		
		if(arguments.length > 1 && typeof arguments[1] == 'object') $.extend(event, arguments[1]);
		
        for (i in this._eventListeners[eventName]){
            this._eventListeners[eventName][i].apply(this._eventScopes[eventName][i], [event]);
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
	this.setTableCollection();
	this.setToolBar();
	this.setCanvas();
	this.setObjectDetail();
	this.setTableDialog();
	this.setColumnDialog();
	this.setForeignKeyDialog();
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
			DBDesigner.app.columnDialog.createColumn(this.tableCollection.getSelectedTables()[0]);
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
			DBDesigner.app.foreignKeyDialog.createForeignKey(this.tableCollection.getSelectedTables()[0]);
			this.toolBar.setAction(DBDesigner.Action.SELECT);
			break;
		case DBDesigner.Action.ALTER_FOREIGNKEY:
			DBDesigner.app.foreignKeyDialog.editForeignKey(extra);
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

DBDesigner.prototype.setTableCollection = function() {
	this.tableCollection = new TableCollection();
	this.tableCollection.bind(Table.Event.SELECTION_CHANGED, this.tableSelectionChanged, this);
	//this.tableCollection.bind(Table.Event.ALTER_TABLE, this.alterTable, this);
};

DBDesigner.prototype.tableSelectionChanged = function(event){
	var actionState = {};
	switch(this.tableCollection.count()){
		case 0:
			actionState[DBDesigner.Action.ADD_COLUMN] = false;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
			actionState[DBDesigner.Action.DROP_TABLE] = false;
			break;
		case 1:
			actionState[DBDesigner.Action.ADD_COLUMN] = true;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = true;
			actionState[DBDesigner.Action.DROP_TABLE] = true;
			break;
		default:
			actionState[DBDesigner.Action.ADD_COLUMN] = false;
			actionState[DBDesigner.Action.ADD_FOREIGNKEY] = false;
			actionState[DBDesigner.Action.DROP_TABLE] = true;
			break;
	}
	DBDesigner.app.toolBar.setActionState(actionState);
};

DBDesigner.prototype.alterTable = function(event){
	this.tableDialog.editTable(event.table);
};


DBDesigner.prototype.setGlobalUIBehavior = function(){
	$('a.button').live('hover', function(event){ 
		var $this = $(this);
		if(!$this.hasClass('ui-state-disabled')) $this.toggleClass('ui-state-hover'); 
	});
	
	$('div.db-column').live('hover', function(event){ 
		var $this = $(this);
		$this.toggleClass('db-column-hover'); 
	});
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
	this.getDom().mousedown($.proxy(this.mousePressed, this));
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
	}
}

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
	this.getDom().appendTo('body');
};
$.extend(ObjectDetailUI.prototype, ComponentUI);

/**
 * Attaches events to html objects 
 */
ObjectDetailUI.prototype.bindEvents = function() {
	this.find('a.collapse-button').bind({
		click: $.proxy(this.panelStateChange, this)
	});
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
		var $focusable = this.find('.focusable');
		window.setTimeout(function(){$focusable.focus()}, 200);
	},
	setKeyPressEvent: function(){
		//console.log(event);
		var _this = this;
		this.getDom().keypress(function(event){
			var $eventTarget = $(event.target);
			if(event.charCode == 13 && $eventTarget.is('input') && !$eventTarget.is('input[type="button"]')){
				_this.save();
			}
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
	model.setAction(DBDesigner.Action.EDIT_TABLE);
	this.getUI().open(DBDesigner.lang.straltertable);
};

TableDialog.prototype.saveTable = function(form){
	var model = this.getModel();
	var tableModel = model.getDBObjectModel();
	var action = model.getAction();
	
	if(this.validateForm(form)){
		tableModel.setName(form.name);
		tableModel.setWithoutOIDS(form.withoutOIDS);
		tableModel.setComment(form.comment);
		tableModel.setSelected(true);
		
		if(action == DBDesigner.Action.ADD_TABLE){
			DBDesigner.app.tableCollection.emptySelection();
			DBDesigner.app.tableCollection.add(new Table(tableModel));
		}
		
		this.getUI().close();
	}
};

TableDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	if(form.name == '') {
		ui.showError(DBDesigner.lang.strtableneedsname, DBDesigner.lang.strname);
		isValid = false;
	}
	var tableWithSameName = DBDesigner.app.tableCollection.getTableByName(form.name);
	if(tableWithSameName != null && tableWithSameName.getModel() != this.getDBObjectModel()){
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
	dom.find('#table-dialog_cancel').click($.proxy(this.close, this));
	dom.find('#table-dialog_save').click($.proxy(this.save, this));
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

TableDialogUI.prototype.save = function(){
	this.cleanErrors();
	
	var form = {
		name: $.trim($('#table-dialog_table-name').val()),
		withoutOIDS: $('#table-dialog_withoutoids').prop('checked'),
		comment: $.trim($('#table-dialog_table-comment').val())
	};
	this.getController().saveTable(form);
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
		if(form.isArray) flags |= ColumnModel.Flag.ARRAY;
		if(form.isPrimaryKey) flags |= ColumnModel.Flag.PRIMARY_KEY;
		if(form.isUniqueKey) flags |= ColumnModel.Flag.UNIQUE_KEY;
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
		
		this.getUI().close();
	}
};

ColumnDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var lowType = form.type.toLowerCase();
	var columnModel = this.getModel().getDBObjectModel();
	var columnCollection = columnModel.getParent().getColumnCollection();
	var columnWithSameName = columnCollection.getColumnByName(form.name);

	if(form.name == ''){
		ui.showError(DBDesigner.lang.strcolneedsname, DBDesigner.lang.strname);
		isValid = false;
	}
	else if(columnWithSameName != null && columnWithSameName.getModel() != columnModel){
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

ColumnDialogModel = function() {
	
};

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
	dom.find('#column-dialog_cancel').click($.proxy(this.close, this));
	dom.find('#column-dialog_save').click($.proxy(this.save, this));
	dom.find('#column-dialog_column-type').change($.proxy(this.dataTypeChanged, this));
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
		$('#column-dialog_column-uniquekey').prop('checked', columnModel.isUniqueKey());
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

ColumnDialogUI.prototype.save = function(){
	this.cleanErrors();
	
	var form = {
		name: $.trim($('#column-dialog_column-name').val()),
		type: $('#column-dialog_column-type').val(),
		isArray: $('#column-dialog_column-array').prop('checked'),
		isPrimaryKey: $('#column-dialog_column-primarykey').prop('checked'),
		isUniqueKey: $('#column-dialog_column-uniquekey').prop('checked'),
		isNotnull: $('#column-dialog_column-notnull').prop('checked'),
		def: $.trim($('#column-dialog_column-default').val()),
		comment: $.trim($('#column-dialog_column-comment').val())
	};
	form.length = (this.typeHasPredefinedSize(form.type))? '': $.trim($('#column-dialog_column-length').val()).replace(/\s+/g, '');
	this.getController().saveColumn(form);
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
};DBObjectModel = {
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

$.extend(Table.prototype, Component);

Table.prototype.getName = function(){
	return this.getModel().getName();
};

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
		case 'name':
			ui.updateName(event.newValue);
			break;
		case 'collapsed':
			ui.updateCollapsed(event.newValue);
			break;
		case 'selected':
			this.trigger(Table.Event.SELECTION_CHANGED, {tableIsSelected: event.newValue});
			break;
	}
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, event);	
};

Table.prototype.alterTable = function(){
	this.trigger(Table.Event.ALTER_TABLE, {table: this});
};

Table.prototype.getColumnCollection = function(){
	return this.getModel().getColumnCollection();
};

Table.prototype.getForeignKeyCollection = function(){
	return this.getModel().getForeignKeyCollection();
};

Table.prototype.refresh = function(){
	this.getUI().updateWidth();
};

Table.prototype.triggerViewBoxChanged = function(data){
	if(typeof data != 'object') data = {};
	this.trigger(Table.Event.VIEW_BOX_CHANGED, data);
};

Table.prototype.getSize = function(){
	return this.getUI().getSize();
};

// *****************************************************************************

TableModel = function() {
	
};

$.extend(TableModel.prototype, DBObjectModel);

TableModel.prototype.setPosition = function(position){
	var oldPosition = this.getPosition();
	if(oldPosition.top != position.top || oldPosition.left != position.left){
		$.extend(this._position, position);
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'position', oldValue: oldPosition, newValue: position});
	}
};

TableModel.prototype.getPosition = function(){
	if(typeof this._position == 'undefined') this._position = {top:0, left:0}
	return $.extend({}, this._position);
};

TableModel.prototype.setWithoutOIDS = function(b){
	this._withoutOIDS = b;
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

// *****************************************************************************

TableUI = function(controller) {
	this.setTemplateID('Table');
	this.setController(controller);
	this.init();
	this.getDom().appendTo('#canvas').multiDraggable({containment: 'parent'});
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
	dom.find('a.button').click($.proxy(this.onButtonPressed, this));
	dom.find('div.header').dblclick($.proxy(this.onHeaderDblClicked, this));
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
	if(!controller.getModel().isCollapsed()){
		dom.find('span.definition').each(function(){
			w = Math.max($(this).outerWidth() + 22, w);
		});
	}
	dom.css({width: w, minWidth: w});
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
Column = function() {
	//If the constructor gets a ColumnModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof ColumnModel) this.setModel(arguments[0]);
	else this.setModel(new ColumnModel());
	
	this.setUI(new ColumnUI(this));
};

$.extend(Column.prototype, Component);

Column.prototype.getName = function(){
	return this.getModel().getName();
};

Column.prototype.modelPropertyChanged = function(event){
	switch(event.property){
		case 'parent':
			this.getUI().updateParent();
			break;
		case 'type':
		case 'length': 
		case 'flags':this.trigger(Column.Event.COLUMN_TYPE_CHANGED);
		default:
			this.getUI().updateView();
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
	if(this._foreignKeyCount == 0 || this._foreignKeyCount == 1){
		this.setFlagState(ColumnModel.Flag.FOREIGN_KEY, b);
	}
};

ColumnModel.prototype.isForeignKey = function(){
	return (this.getFlags() & ColumnModel.Flag.FOREIGN_KEY) != 0;
};

ColumnModel.prototype.setUniqueKey = function(b){
	this.setFlagState(ColumnModel.Flag.UNIQUE_KEY, b);
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

// *****************************************************************************

ColumnUI = function(controller){
	this.setTemplateID('Column');
	this.setController(controller);
	this.init();
	this.updateView();
	this.updateParent();
};
$.extend(ColumnUI.prototype, ComponentUI);

ColumnUI.prototype.updateView = function(){
	var model = this.getController().getModel();
	var dom = this.getDom();
	var $keys = dom.find('span.keys');
	var def = model.getName() + ' : ' + model.getType();
	var length = model.getLength();
	if(length != '') def += '(' + length + ')';
	if(model.isArray()) def += '[]';
	
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

ColumnUI.prototype.bindEvents = function(){
	this.getDom().dblclick($.proxy(this.onDblClick, this));
};

ColumnUI.prototype.setHighLight = function(b){
	var dom = this.getDom();
	if(b) dom.addClass('db-column-highlight');
	else dom.removeClass('db-column-highlight');
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
	table.bind(Table.Event.ALTER_TABLE, this.alterTable, this);
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
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_TABLE, event.table);
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
ColumnCollection = function(){
	this._columns = [];
};

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
	}
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
ForeignKeyCollection = function(){
	this._foreignKeys = [];
};

ForeignKeyCollection.prototype.getForeignKeyByName = function(name){
	for(var i = 0, n = this._foreignKeys.length; i < n; i++){
		if(this._foreignKeys[i].getName() == name) return this._foreignKeys[i];
	}
	return null;
};

ForeignKeyCollection.prototype.add = function(foreignKey){
	if($.inArray(foreignKey, this._foreignKeys) == -1){
		this._foreignKeys.push(foreignKey);
		foreignKey.bind(ForeignKey.Event.ALTER_FOREIGNKEY, this.alterForeignKey, this);
		//column.bind(Column.Event.COLUMN_CHANGED, this.columnChanged, this);
	}
};

ForeignKeyCollection.prototype.alterForeignKey = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_FOREIGNKEY, event.sender);
};
/*
ForeignKeyCollection.prototype.alterColumn = function(event){
	DBDesigner.app.doAction(DBDesigner.Action.ALTER_COLUMN, event.column);
};
*/
/*
ForeignKeyCollection.prototype.columnChanged = function(event){
	event.column.getParent().refresh();
};
*/ForeignKey = function() {
	//If the constructor gets a ColumnModel object as first parameter, it is set as the model
	//otherwise a new model is created
	
	if(arguments.length > 0 && arguments[0] instanceof ForeignKeyModel) {
		var model = arguments[0];
		var parent = model.getParent();
		var referencedTable = model.getReferencedTable();
		this.setModel(model);
		
		parent.bind(Table.Event.VIEW_BOX_CHANGED, this.onTableViewBoxChanged, this);
		if(parent != referencedTable){
			referencedTable.bind(Table.Event.VIEW_BOX_CHANGED, this.onTableViewBoxChanged, this);
		}
	}
	else this.setModel(new ForeignKeyModel());
	
	this.setUI(new ForeignKeyUI(this));
};

$.extend(ForeignKey.prototype, Component);

ForeignKey.prototype.getName = function(){
	return this.getModel().getName();
};

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
/*
ForeignKey.prototype.modelPropertyChanged = function(event){
	console.log(event);
	switch(event.property){
		case 'parent':
		case 'referencedTable':
			if(this.getParent() != this.getReferencedTable()){
				event.table.bind(Table.Event.VIEW_BOX_CHANGED, $.proxy(this.onTableViewBoxChanged, this));
			}
			//this.getUI().updateParent();
			break;
	}
};
*/
ForeignKey.prototype.onTableViewBoxChanged = function(event){
	var ui = this.getUI();
	if(event.dragging){
		ui.hide();
	}else{
		ui.updateView();
	}
};

ForeignKey.prototype.alterForeignKey = function(){
	this.trigger(ForeignKey.Event.ALTER_FOREIGNKEY);
};

// *****************************************************************************

ForeignKeyModel = function(){};


ForeignKeyModel.prototype.setParent = function(table){
	this._parent = table;
	//this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'parent', table: table});
};

ForeignKeyModel.prototype.getParent = function(){
	if(typeof this._parent == 'undefined') this._parent = null;
	return this._parent;
};

ForeignKeyModel.prototype.setReferencedTable = function(table){
	this._referencedTable = table;
	//this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'referencedTable', table: table});
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
	this._updateAction = action;
};
ForeignKeyModel.prototype.getDeleteAction = function(){
	if(typeof this._deleteAction == 'undefined') this._deleteAction = ForeignKeyModel.Action.NO_ACTION;
	return this._deleteAction;
};
ForeignKeyModel.prototype.setDeleteAction = function(action){
	this._updateAction = action;
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
	
	this._columns = columns;
	
	for(i = 0; i < oldColumns.length; i++){
		oldLocalColumns.push(oldColumns[i].localColumn);
		oldForeignColumns.push(oldColumns[i].foreignColumn);
	}
	for(i = 0; i < columns.length; i++){
		if($.inArray(columns[i].localColumn, oldLocalColumns) == -1){
			columns[i].localColumn.setForeignKey(true);
		}
		if($.inArray(columns[i].foreignColumn, oldForeignColumns) == -1){
			columns[i].foreignColumn.bind(Column.Event.COLUMN_TYPE_CHANGED, this.onForeignColumnTypeChanged, this);
			columns[i].foreignColumn.trigger(Column.Event.COLUMN_TYPE_CHANGED);
		}
		newLocalColumns.push(columns[i].localColumn);
		newForeignColumns.push(columns[i].foreignColumn);
	}
	for(i = 0; i < oldColumns.length; i++){
		if($.inArray(oldLocalColumns[i], newLocalColumns) == -1){
			oldLocalColumns[i].setForeignKey(false);
		}
		if($.inArray(oldForeignColumns[i], newForeignColumns) == -1){
			oldForeignColumns[i].unbind(Column.Event.COLUMN_TYPE_CHANGED, this.onForeignColumnTypeChanged, this);
		}
	}
};

ForeignKeyModel.prototype.onForeignColumnTypeChanged = function(event){
	var columns = this.getColumns();
	for(var i = 0; i < columns.length; i++){
		if(columns[i].foreignColumn == event.sender){
			var type = columns[i].foreignColumn.getType();
			if(type == 'SERIAL') type = 'INTEGER';
			else if(type == 'BIGSERIAL') type = 'BIGINT';
			columns[i].localColumn.setArray(columns[i].foreignColumn.isArray());
			columns[i].localColumn.setLength(columns[i].foreignColumn.getLength());
			columns[i].localColumn.setType(type);
			break;
		}
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

$.extend(ForeignKeyModel.prototype, DBObjectModel);

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

		if(Vector.type == Vector.SVG){
			this._connector.setAttribute('stroke', 'black');
			this._connector.setAttribute('stroke-width', '2');
			this._connector.setAttribute('fill', 'transparent');
			$('#canvas').find('svg').append(this._connector);
		}else{
			this._connector.stroke = 'true';
			this._connector.strokecolor = 'black';
			this._connector.strokeweight = '2';
			$('#canvas').append(this._connector);
		}
		/*$(this._connector).bind({
			hover: $.proxy(this.onConnectorHover, this),
			dblclick: $.proxy(this.onConnectorDblclick, this)
		});*/
		$(this._connector).bind({
			hover: $.proxy(this.onConnectorHover, this),
			mousedown: this.onConnectorMouseDown,
			dblclick: $.proxy(this.onConnectorDblclick, this)
		});
	}
	return this._connector;
};

ForeignKeyUI.prototype.drawConnector = function(pointsX, pointsY){
	var points = Vector.getPoints(pointsX, pointsY);
	if(Vector.type == Vector.SVG) {
		this.getConnector().setAttribute('points', points);
	}else{
		
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
			this._diamond.stroke = 'false';
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
	if(event.type == 'mouseenter'){
		if(Vector.type == Vector.SVG){
			this.getConnector().setAttribute('stroke', '#E59700');
			this.getDiamond().setAttribute('fill', '#E59700');
		}
		this.getController().setHighLight(true);
	}else{
		if(Vector.type == Vector.SVG){
			this.getConnector().setAttribute('stroke', 'black');
			this.getDiamond().setAttribute('fill', 'black');
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
		if(form.isDeferrable) flags |= ForeignKeyModel.Flag.DEFERRABLE;
		if(form.isDeferred) flags |= ForeignKeyModel.Flag.DEFERRED;
		if(form.isMatchFull) flags |= ForeignKeyModel.Flag.MATCH_FULL;
		
		foreignKeyModel.setName(form.name);
		foreignKeyModel.setComment(form.comment);
		foreignKeyModel.setFlags(flags);
		foreignKeyModel.setColumns(form.columns);
		foreignKeyModel.setReferencedTable(form.referencedTable);
		
		if(action == DBDesigner.Action.ADD_FOREIGNKEY){
			var foreignKey = new ForeignKey(foreignKeyModel);
			foreignKeyModel.getParent().getForeignKeyCollection().add(foreignKey);
		}
		
		this.getUI().close();
	}
	
};

ForeignKeyDialog.prototype.validateForm = function(form){
	var isValid = true;
	var ui = this.getUI();
	var foreignKeyModel = this.getDBObjectModel();
	var foreignKeyCollection = foreignKeyModel.getParent().getForeignKeyCollection();
	var foreignKeyWithSameName = (form.name != '')? foreignKeyCollection.getForeignKeyByName(form.name) : null;
	
	if(foreignKeyWithSameName != null && foreignKeyWithSameName.getModel() != foreignKeyModel){
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
	var localColumns = this.getDBObjectModel().getParent().getColumnCollection().getColumns();
	var localSelectedColumns = this.getLocalSelectedColumns();
	var columns = [];
	for (var i = 0; i < localColumns.length; i++){
		if($.inArray(localColumns[i], localSelectedColumns) == -1){
			columns.push(localColumns[i]);
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
	for(var i = 0; i < selectedColumns.length; i++)
		columns.push(selectedColumns[i].localColumn);
	return columns;
};

ForeignKeyDialogModel.prototype.getForeignSelectedColumns = function(){
	var selectedColumns = this.getSelectedColumns();
	var columns = [];
	for(var i = 0; i < selectedColumns.length; i++)
		columns.push(selectedColumns[i].foreignColumn);
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
	dom.find('#foreignkey-dialog_cancel').click($.proxy(this.close, this));
	dom.find('#foreignkey-dialog_save').click($.proxy(this.save, this));
	dom.find('#foreignkey-dialog_foreignkey-references').change($.proxy(this.referencedTableChanged, this));
	dom.find('#foreignkey-dialog_foreignkey-deferrable').click(this.deferrableChange);
	dom.find('#foreignkey-dialog_addcolumns').click($.proxy(this.addSelectedColumns, this));
	dom.find('#foreignkey-dialog_columns-tab').delegate('a.remove', 'click', $.proxy(this.removeSelectedColumns, this));
	this.setKeyPressEvent();
};


ForeignKeyDialogUI.prototype.open = function(title){
	
	var foreignKeyModel = this.getController().getDBObjectModel();
	var dom = this.getDom();
	var controller = this.getController();
	
	this.cleanErrors();
	
	if(foreignKeyModel != null){
		$('#foreignkey-dialog_foreignkey-name').val(foreignKeyModel.getName());
		$('#foreignkey-dialog_foreignkey-updateaction').prop('checked', foreignKeyModel.getUpdateAction());
		$('#foreignkey-dialog_foreignkey-deleteaction').prop('checked', foreignKeyModel.getDeleteAction());
		$('#foreignkey-dialog_foreignkey-matchfull').prop('checked', foreignKeyModel.isMatchFull());
		$('#foreignkey-dialog_foreignkey-deferrable').prop('checked', foreignKeyModel.isDeferrable());
		$('#foreignkey-dialog_foreignkey-comment').val(foreignKeyModel.getComment());
		
		if(foreignKeyModel.isDeferrable())$('#foreignkey-dialog_foreignkey-deferred').prop('checked', foreignKeyModel.isDeferred()).prop('disabled', false);
		else $('#foreignkey-dialog_foreignkey-deferred').prop('checked', false).prop('disabled', true);
		
		/** Update tables **/
		var tNames = DBDesigner.app.tableCollection.getTableNames();
		var $options = $();
		var $option;
		var i = 0;
		var tName = '';
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
		
		/** Update local columns **/
		this.updateLocalColumns();
		/*
		$options = $();
		var cNames = foreignKeyModel.getParent().getColumnCollection().getColumnNames();
		for (i = 0; i < cNames.length; i++){
			$option = $('<option></option>').attr('value', cNames[i]).text(cNames[i]);
			$options = $options.add($option);
		}
		if($options.length > 0) $('#foreignkey-dialog_foreignkey-localcolumn').html($options);
		else $('#foreignkey-dialog_foreignkey-localcolumn').empty();*/
		
		/*$('#column-dialog_column-type').val(columnModel.getType()).trigger('change');
		$('#column-dialog_column-name').val(columnModel.getName());
		$('#column-dialog_column-length').val(columnModel.getLength());
		$('#column-dialog_column-comment').val(columnModel.getComment());
		$('#column-dialog_column-array').prop('checked', columnModel.isArray());
		$('#column-dialog_column-primarykey').prop('checked', columnModel.isPrimaryKey());
		$('#column-dialog_column-uniquekey').prop('checked', columnModel.isUniqueKey());
		$('#column-dialog_column-notnull').prop('checked', columnModel.isNotnull());
		$('#column-dialog_column-default').val(columnModel.getDefault());*/
		dom.find('div.tabs').tabs('select', 0);
		dom.dialog('open').dialog('option', 'title', title);
		this.focus();
	}
	
};

ForeignKeyDialogUI.prototype.save = function(){
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
	this.getController().saveForeignKey(form);
};

ForeignKeyDialogUI.prototype.referencedTableChanged = function(event){
	var table = DBDesigner.app.tableCollection.getTableByName($(event.currentTarget).val());
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
	this.getController().addSelectedColumns(localColumnName, foreignColumnName);
};

ForeignKeyDialogUI.prototype.updateSelectedColumns = function(selectedColumns){
	var $tbody = $('#foreignkey-dialog_columns-tab').find('tbody');
	if(selectedColumns.length == 0){
		$tbody.html('<tr><td colspan="3">' + DBDesigner.lang.strfkneedscols + '</td></tr>');
	}else{
		var $tableContent = $();
		var $tableRow;
		var $tableCell;
		var $deleteButton;
		for(var i = 0; i < selectedColumns.length; i++){
			
			//$tableRow = $('<tr><td><a class="remove" data-index="'+ i +'" href="#" title="'+DBDesigner.lang.strremove+'">x</a></td></tr>');
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
};

ForeignKeyDialogUI.prototype.removeSelectedColumns = function(event){
	event.preventDefault();
	this.getController().removeSelectedColumns($(event.target).data('index'));
	//console.log($(event.target).data('index'));
};DBDesigner.Action = {
	SELECT: 'actionselect',
	ADD_TABLE: 'actionaddtable',
	ALTER_TABLE: 'actionedittable',
	ADD_FOREIGNKEY: 'actionaddfk',
	ALTER_FOREIGNKEY: 'actionalterfk',
	ADD_COLUMN: 'actionaddcolumn',
	ALTER_COLUMN: 'actionaltercolumn',
	DROP_TABLE: 'actiondroptable',
	SAVE: 'save'
};

DBDesigner.Event = { PROPERTY_CHANGED: 'propertychanged' };

ToolBar.Event = {ACTION_CHANGED: 'toolbaractionchanged'};

Table.Event = {
	SELECTION_CHANGED: 'tableselectionchanged', 
	ALTER_TABLE: 'tablealtertable',
	VIEW_BOX_CHANGED: 'tableviewboxchanged'
};

Canvas.Event = {PLACEMENT_CAPTURED: 'canvasplacementcaptured'};

ObjectDetail.Event = {STATE_CHANGED: 'objectdetailstatechanged'};

Column.Event = {
	COLUMN_TYPE_CHANGED: 'columntypechanged',
	ALTER_REQUEST: 'columnalterrequest'
};

ColumnModel.Flag = {
	ARRAY: 1,
	PRIMARY_KEY: 2,
	UNIQUE_KEY: 4,
	FOREIGN_KEY: 8,
	NOTNULL: 16
};

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
	ALTER_FOREIGNKEY: 'foreignkeyalterforeignkey'
};

ForeignKeyUI.TRIANGLE_SIZE = 7;

Vector.SVG = 'svg';
Vector.VML = 'vml';