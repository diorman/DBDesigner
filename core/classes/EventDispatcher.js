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

