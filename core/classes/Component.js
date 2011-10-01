
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