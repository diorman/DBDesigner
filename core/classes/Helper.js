(function($){	
	$.partOf = function(array, subArray){
		for(var i = 0, n = array.length; i < n; i++)
			if($.inArray(array[i], subArray) != -1) return true;
		return false;
	};
})(jQuery);


