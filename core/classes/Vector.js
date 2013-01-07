
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


