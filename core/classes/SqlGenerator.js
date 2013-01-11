
SqlGenerator = {
	generate: function(options) {
		var tableCollection = DBDesigner.app.getTableCollection();
		var tables = options.selectedTablesOnly? tableCollection.getSelectedTables() : tableCollection.getTables();
		var i, j, k;
		var sql = '', sqlFK = '';
		var columns;
		var comment;
		var columnName, columnDefault, columnSQL;
		var constraintName, constraints, constraintColumns;
		var tablePK, tableSQL, tableName, tableComments;
		var foreignColumns, localColumns, referencedTableName;
		
		for(i = 0; i < tables.length; i++) {
			tableName = SqlGenerator._quote(DBDesigner.schemaName) + '.' + SqlGenerator._quote(tables[i].getName());
			sql += '\n-- -----------------------------------\n-- ' + tableName + '\n-- -----------------------------------\n\n'
			if(options.generateDropTable) { 
				sql += 'DROP TABLE IF EXISTS ' + tableName;
				if(options.generateCascade) { sql += ' CASCADE'; }
				sql += ';\n';
			}
			sql += "CREATE TABLE " + tableName + " (\n";
			
			tablePK = [];
			tableSQL = [];
			tableComments = [];
			comment = SqlGenerator._escape(tables[i].getComment());
			if(comment != '') { 
				tableComments.push('COMMENT ON TABLE ' + tableName + ' IS \'' + comment + '\';');
			}
			
			// Columns
			columns = tables[i].getColumnCollection().getColumns();
			for(j = 0; j < columns.length; j++){
				columnName = SqlGenerator._quote(columns[j].getName());
				columnDefault = columns[j].getDefault();
				comment = SqlGenerator._escape(columns[j].getComment());
				columnSQL = '\t' + columnName + ' ' + columns[j].getFullType();
				if(columns[j].isNotNull()) columnSQL += ' NOT NULL';
				if(columnDefault != '') columnSQL += ' DEFAULT ' + columnDefault;
				if(columns[j].isPrimaryKey()) tablePK.push(columnName);
				if(comment != "") { tableComments.push('COMMENT ON COLUMN ' + tableName + '.' + columnName + ' IS \'' + comment + '\';')};
				tableSQL.push(columnSQL);
			}
			// Primary Key
			if(tablePK.length > 0) {
				tableSQL.push('\tPRIMARY KEY ( ' + tablePK.join(', ') + ' )');
			}
			
			// Unique Keys
			constraints = tables[i].getUniqueKeyCollection().getUniqueKeys();
			for(j = 0; j < constraints.length; j++) {
				constraintName = SqlGenerator._quote(constraints[j].getName());
				comment = SqlGenerator._escape(constraints[j].getComment());
				constraintColumns = SqlGenerator._quote(constraints[j].getColumns());
				if(comment != '') {
					tableComments.push('COMMENT ON CONSTRAINT ' + constraintName + ' ON ' + tableName + ' IS \'' + comment + '\';');
				}
				tableSQL.push('\tCONSTRAINT ' + constraintName + ' UNIQUE ( ' + constraintColumns.join(', ') + ' )');
			}
			sql += tableSQL.join(',\n');
			sql += '\n)\nWITH ( OIDS=' + (!tables[i].getWithoutOIDS()).toString().toUpperCase() + ' );\n'
			
			if(tableComments.length > 0) {
				sql += tableComments.join('\n') + '\n';
			}
			
			// Foreign Keys
			constraints = tables[i].getForeignKeyCollection().getForeignKeys();
			for(j = 0; j < constraints.length; j++){
				constraintName = SqlGenerator._quote(constraints[j].getName());
				constraintColumns = constraints[j].getColumns();
				referencedTableName = SqlGenerator._quote(DBDesigner.schemaName) + '.' + SqlGenerator._quote(constraints[j].getReferencedTable().getName());
				foreignColumns = [];
				localColumns = [];
				for(k = 0; k < constraintColumns.length; k++) {
					foreignColumns.push(SqlGenerator._quote(constraintColumns[k].foreignColumn.getName()));
					localColumns.push(SqlGenerator._quote(constraintColumns[k].localColumn.getName()));
				}

				sqlFK += 
					'\nALTER TABLE ' + tableName + '\n' +
					'\tADD CONSTRAINT ' + constraintName + ' FOREIGN KEY ( ' + localColumns.join(', ') + ' ) ' +
					'REFERENCES ' + referencedTableName + ' ( ' + foreignColumns.join(', ') + ' )\n' +
					(constraints[j].isMatchFull() ? '\tMATCH FULL ' : '\t') +
					'ON DELETE ' + constraints[j].getActionString('delete') + ' ON UPDATE ' + constraints[j].getActionString('update') +
					(constraints[j].isDeferrable() ? '\n\tDEFERRABLE ' + (constraints[j].isDeferred()? 'INITIALLY DEFERRED' : '') : '') + ';\n';
				comment = SqlGenerator._escape(constraints[j].getComment());
				if(comment != '') {
					sqlFK += 'COMMENT ON CONSTRAINT ' + constraintName + " ON " + tableName + " IS '" + comment + "';\n";
				}
			}	
		}	
		if(sqlFK != '') {
			sql += '\n-- -----------------------------------\n-- Foreign Keys\n-- -----------------------------------\n' + sqlFK;
		}
		return sql;
	},
	_quote: function(str) {
		if($.isArray(str)) {
			var ret = [];
			for(var i = 0; i < str.length; i++) {
				ret.push('"' + str[i].toString().replace(/"/g,'""') + '"');
			}
			return ret;
		}
		return '"' + str.toString().replace(/"/g,'""') + '"';
	},
	_escape: function(str) {
		return str.replace(/'/g,"''");
	}
};