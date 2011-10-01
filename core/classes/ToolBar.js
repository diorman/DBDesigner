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
	if(event.property == 'action') this.getUI().updateCurrentAction();
	else if(event.property == 'actionState') this.getUI().updateActionState();
	this.trigger(DBDesigner.Event.PROPERTY_CHANGED, event);	
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
	var _actionState = null;
	var old = this.getActionState();
	if(typeof this._actions == 'undefined'){
		_actionState = {};
		_actionState[DBDesigner.Action.SELECT] = true;
		_actionState[DBDesigner.Action.ADD_TABLE] = true;
		_actionState[DBDesigner.Action.ADD_COLUMN] = true;
		_actionState[DBDesigner.Action.ADD_FOREIGNKEY] = true
		_actionState[DBDesigner.Action.SAVE] = true;
		_actionState[DBDesigner.Action.DROP_TABLE] = false;
	}
	else _actionState = old;
	_actionState = $.extend(_actionState, actionState);
	if(_actionState != old){
		this._actionState = _actionState;
		this.trigger(DBDesigner.Event.PROPERTY_CHANGED, {property: 'actionState', oldValue: old, newValue: _actionState});	
	}
};

ToolBarModel.prototype.getActionState = function() {
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
		if(actionState[action] === false) dom.find(sel).addClass('ui-state-disabled').removeClass('ui-state-default');
		else dom.find(sel).addClass('ui-state-default').removeClass('ui-state-disabled');
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


