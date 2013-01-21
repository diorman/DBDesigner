DBDesigner.Action = {
	SELECT: 'actionselect',
	ADD_TABLE: 'actionaddtable',
	ALTER_TABLE: 'actionedittable',
	ADD_FOREIGNKEY: 'actionaddfk',
	ALTER_FOREIGNKEY: 'actionalterfk',
	ADD_UNIQUEKEY: 'actionadduniq',
	ALTER_UNIQUEKEY: 'actionalteruniq',
	ADD_COLUMN: 'actionaddcolumn',
	ALTER_COLUMN: 'actionaltercolumn',
	DROP_TABLE: 'actiondroptable',
	DROP_UNIQUEKEY: 'actiondropuniquekey',
	DROP_FOREIGNKEY: 'actiondropforeignkey',
	DROP_COLUMN: 'actiondropcolumn',
	SAVE: 'actionsave',
	SHOW_TABLE_DETAIL: 'actionshowtabledetail',
	ALIGN_TABLES: 'actionaligntables',
	FORWARD_ENGINEER: 'actionforwardengineer',
	REVERSE_ENGINEER: 'actionreverseengineer'
};

DBDesigner.Event = { PROPERTY_CHANGED: 'propertychanged' };

ToolBar.Event = {ACTION_CHANGED: 'toolbaractionchanged'};

DBObject.Event = { DBOBJECT_ALTERED: 'dbobjectaltered', DBOBJECT_DROPPED: 'dbobjectdropped' };

Table.Event = {
	SELECTION_CHANGED: 'tableselectionchanged', 
	ALTER_REQUEST: 'tablealterrequest',
	TABLE_ALTERED: 'tabletablealtered',
	VIEW_BOX_CHANGED: 'tableviewboxchanged',
	DETAIL_REQUEST: 'tabledetailrequest'
};

Canvas.Event = {PLACEMENT_CAPTURED: 'canvasplacementcaptured'};

ObjectDetail.Event = {STATE_CHANGED: 'objectdetailstatechanged'};

Column.Event = {
	COLUMN_TYPE_CHANGED: 'columntypechanged',
	ALTER_REQUEST: 'columnalterrequest',
	COLUMN_ALTERED: 'columnaltered'
};

ColumnModel.Flag = {
	ARRAY: 1,
	PRIMARY_KEY: 2,
	UNIQUE_KEY: 4,
	FOREIGN_KEY: 8,
	NOTNULL: 16
};

Collection = { Event: {COLLECTION_CHANGED: 'collectionchanged'}};

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
	MATCH_FULL: 4
};

ForeignKey.Event = {
	ALTER_REQUEST: 'foreignkeyalterforeignkey',
	FOREIGNKEY_ALTERED: 'foreignkeyaltered'
};

UniqueKey.Event = {
	ALTER_REQUEST: 'uniquekeyalterforeignkey',
	FOREIGNKEY_ALTERED: 'uniquekeyaltered'
};

ForeignKeyUI.TRIANGLE_SIZE = 7;

Vector.SVG = 'svg';
Vector.VML = 'vml';

Ajax.Action = {
	SAVE: 'ajax_save',
	EXECUTE_SQL: 'ajax_execute_sql',
	LOAD_SCHEMA_STRUCTURE: 'ajax_load_schema_structure',
	KEEP_SESSION_ALIVE: 'ajax_keep_session_alive'
};