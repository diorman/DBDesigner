
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

