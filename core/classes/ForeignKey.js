ForeignKey = function() {
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
	this.trigger(ForeignKey.Event.ALTER_REQUEST);
};

// *****************************************************************************

ForeignKeyModel = function(){};


ForeignKeyModel.prototype.setParent = function(table){
	this._parent = table;
};

ForeignKeyModel.prototype.getParent = function(){
	if(typeof this._parent == 'undefined') this._parent = null;
	return this._parent;
};

ForeignKeyModel.prototype.setReferencedTable = function(table){
	this._referencedTable = table;
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
			columns[i].localColumn.startEditing();
			columns[i].localColumn.setArray(columns[i].foreignColumn.isArray());
			columns[i].localColumn.setLength(columns[i].foreignColumn.getLength());
			columns[i].localColumn.setType(type);
			columns[i].localColumn.stopEditing();
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