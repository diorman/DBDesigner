ConstraintHelper = {
	constraintNameExists: function (name, constraintModel){
		var constraintList = DBDesigner.app.getConstraintList();
		var constraint = null;
		//var instanceClass;
		var instanceClass = constraintModel.constructor;
		/*if(typeof constraintModel == 'undefined') {
			instanceClass = constraintModel.constructor;
		}*/
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


