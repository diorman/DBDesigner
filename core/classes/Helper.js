(function($){	
	$.partOf = function(array, subArray){
		for(var i = 0, n = array.length; i < n; i++)
			if($.inArray(array[i], subArray) != -1) return true;
		return false;
	};
	$.parseBool = function(value) {
		switch(typeof value) {
			case 'number': return (value == 1? true : false);
			case 'string':
				switch(value.toLowerCase()){
					case "true": case "yes": case "1": return true;
					case "false": case "no": case "0": case null: return false;
					default: return Boolean(value);
				}
			case 'boolean': return value;
			default: return false;
		}
	};
})(jQuery);


