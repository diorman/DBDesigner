DBDesigner.Action = {
	SELECT: 'actionselect',
	ADD_TABLE: 'actionaddtable',
	ALTER_TABLE: 'actionedittable',
	ADD_FOREIGNKEY: 'actionaddfk',
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
	ALTER_COLUMN: 'columnaltercolumn'
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
	MATCH_FULL: 3
};

ForeignKeyUI.TRIANGLE_SIZE = 7;

Vector.SVG = 'svg';
Vector.VML = 'vml';