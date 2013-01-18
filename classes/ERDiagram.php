<?php

    /*
     * Class to manage er diagrams
     */

    class ERDiagram{
        private static $setup = FALSE;

		//store vars are used to get info about diagrams
        private static $store_driver;
        private static $store_database;
        private static $store_schema;
        private static $store_table;

        //logic vars are used to get info about objects in the current schema
        private static $logic_driver;
        private static $logic_database;
        private static $logic_schema;

		public $id;
		public $name;
        public $pg_database;
        public $pg_schema;
        public $roles_with_privileges;
		public $comment;
		public $date_created;
		public $last_update;
		public $data;
		public $owner_name;
		public $owner;
		

        /* Constructor */
		public function __construct() {
			global $misc;
			$server_info = $misc->getServerInfo();
			$this->id = 0;
			$this->name = '';
			$this->pg_database = ERDiagram::get_object_oid('database');
			$this->pg_schema = ERDiagram::get_object_oid('schema');
			$this->roles_with_privileges = array();
			$this->comment = '';
			$this->date_created = null;
			$this->last_update = null;
			$this->data = '';
			$this->owner_name = $server_info['username'];
			$this->owner = ERDiagram::get_object_oid('role', $this->owner_name);
		}
		
		public static function load_from_request(){
			$diagram = NULL;
			
			if(empty ($_POST) && isset($_GET['erdiagram_id'])){
				$diagram = ERDiagram::load($_GET['erdiagram_id']);
			}
			
			else{
				$diagram = new ERDiagram();
				
				if (isset($_POST['diagram']['id'])) $diagram->id = $_POST['diagram']['id'];
		
				if (isset($_POST['diagram']['name'])) $diagram->name = $_POST['diagram']['name'];

				if (isset($_POST['diagram']['granted_groups'])) 
					$diagram->roles_with_privileges = array_merge($diagram->roles_with_privileges, $_POST['diagram']['granted_groups']);

				if (isset($_POST['diagram']['granted_users'])) 
					$diagram->roles_with_privileges = array_merge($diagram->roles_with_privileges, $_POST['diagram']['granted_users']);

				if (isset($_POST['diagram']['comment'])) $diagram->comment = $_POST['diagram']['comment'];	
			}
			
			return $diagram;
		}
		
		
		public static function is_setup(){
			return ERDiagram::$setup;
		}
		
        public static function setup_drivers($database, $schema, $table){
			if(ERDiagram::$setup) return TRUE;
            global $misc;
			ERDiagram::$store_database = $database;
            ERDiagram::$store_schema = $schema;
            ERDiagram::$store_table = $table;
            $status = ERDiagram::check_database_and_schema();
            if($status){
                ERDiagram::$logic_database = isset($_REQUEST['database'])? $_REQUEST['database'] : '';
                ERDiagram::$logic_schema = isset($_REQUEST['schema'])?$_REQUEST['schema'] : '';
                ERDiagram::$logic_driver = $misc->getDatabaseAccessor(ERDiagram::$logic_database);
            }
			ERDiagram::$setup = $status;
			return $status;
        }

        /**
         * Checks to see if the diagrams database and schema exists
         * @return TRUE Success
         * @return FALSE Fail
         */
        public static function check_database_and_schema(){
            global $data, $misc;
            $rs = $data->getDatabase(ERDiagram::$store_database);
            if ($rs->recordCount() != 1) return FALSE;

            // Create a new database access object.
            ERDiagram::$store_driver = $misc->getDatabaseAccessor(ERDiagram::$store_database);
            
            $sql = "SELECT nspname FROM pg_catalog.pg_namespace WHERE nspname='".pg_escape_string(ERDiagram::$store_schema)."'";
            $rs = ERDiagram::$store_driver->selectSet($sql);
            if($rs->recordCount() != 1) return FALSE;
            ERDiagram::$store_driver->setSchema(ERDiagram::$store_schema);
            return TRUE;
        }

		public static function load($id){
            $columns = "
				erdiagram_id,
				name,
				comment,
				roles_with_privileges,
				owner,
				date_created,
				last_update,
				pg_schema,
				pg_database,
				data,
                (SELECT usename FROM pg_catalog.pg_user WHERE usesysid = owner) AS owner_name";
            $tables = ERDiagram::$store_table;
            $filters = 'pg_database = '.ERDiagram::get_object_oid('database').
				' AND pg_schema = '.ERDiagram::get_object_oid('schema').
				' AND erdiagram_id = '.pg_escape_string($id);
            $sql = "SELECT {$columns} FROM {$tables} WHERE {$filters} ORDER BY name";
            $rs = ERDiagram::$store_driver->selectSet($sql);
			if($rs->recordCount() != 1) return NULL;
            
			$roles = str_replace(array('{','}'), '', $rs->fields('roles_with_privileges'));
			
			$diagram = new ERDiagram();
			$diagram->id = $rs->fields('erdiagram_id');
			$diagram->name = $rs->fields('name');
			$diagram->comment = $rs->fields('comment');
			$diagram->roles_with_privileges = empty ($roles)? array():explode(',', $roles);
			$diagram->owner = $rs->fields('owner');
			$diagram->date_created = $rs->fields('date_created');
			$diagram->last_update = $rs->fields('last_update');
			$diagram->pg_schema = $rs->fields('pg_schema');
			$diagram->pg_database = $rs->fields('pg_database');
			$diagram->data = $rs->fields('data');
			$diagram->owner_name = $rs->fields('owner_name');

			return $diagram;
			
		}
		
        /**
         * Finds diagrams logically stored in the current schema (logic)
         * @param $id (optional) The ID of the diagram to get just one
         * @return ADORecordSet
         */
        public static function get_list($owned_diagrams_only){
            global $misc;

            $columns = "
				erdiagram_id,
				name,
				comment,
				roles_with_privileges,
				owner,
				date_created,
				last_update,
				pg_schema,
				pg_database,
				data,
                (SELECT usename FROM pg_catalog.pg_user WHERE usesysid = owner) AS owner_name";
            $tables = ERDiagram::$store_table;
            $filters = 'pg_database = '.ERDiagram::get_object_oid('database').' AND pg_schema = '.ERDiagram::get_object_oid('schema');
            if ($owned_diagrams_only) {
                $server_info = $misc->getServerInfo();
                $filters .= " AND owner = (SELECT usesysid FROM pg_catalog.pg_user WHERE usename = '{$server_info['username']}')";
            }
            $sql = "SELECT {$columns} FROM {$tables} WHERE {$filters} ORDER BY name";
            return ERDiagram::$store_driver->selectSet($sql);
        }

        /**
         * Gets the oid of a particular object stored in the current schema (logic)
         * @param $type The type of the object
         * @param $name (not needed for database and schema) The name of the object
         * @return oid Success
         * @return -1 No object found
         */
        public static function get_object_oid($type, $name = ''){
            switch($type){
                case 'database':
                    $sql = "SELECT oid FROM pg_catalog.pg_database WHERE datname = current_database()";
                    break;
                case 'schema':
                    $sql = "SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = '".pg_escape_string(ERDiagram::$logic_schema)."'";
                    break;
                case 'role':
                    $sql = "SELECT usesysid AS oid FROM pg_catalog.pg_user WHERE usename = '".pg_escape_string($name)."'";
                    break;
            }
			
            $rs = ERDiagram::$logic_driver->selectSet($sql);
            if($rs->recordCount() != 1) return -1;
            return $rs->fields['oid'];
        }

        /**
         *
         * Verifies if a user has privileges to open a diagram
         * @param $diagram_id The identifier of the diagram
         * @param $username The name of the user who wants to access
         * @return TRUE user has privileges
         */
		/*
        public static function user_has_privileges($diagram_id, $username){
            $erdiagram = $this->getERDiagrams($diagram_id);
            $roles_with_privileges = $erdiagram->fields['roles_with_privileges'];
            $owner = $erdiagram->fields['owner'];
            $sql = "
                SELECT usename, usesysid
                FROM pg_catalog.pg_user
                WHERE usename = '{$username}'
                AND (usesysid = ANY('{$roles_with_privileges}') OR usesysid = {$owner})
                UNION
                SELECT usename, usesysid
                FROM pg_catalog.pg_user, pg_catalog.pg_group
                WHERE usename = '{$username}'
				AND usesysid = ANY (grolist)
				AND grosysid = ANY('{$roles_with_privileges}')";
            $rs = ERDiagram::$store_driver->selectSet($sql);
            if($rs->recordCount() > 0) return TRUE;
            return FALSE;
        }*/

        /**
         * Gets users from the database with some filters
         * @param $in (optional) A postgresql array(ie '{1,2,3}' also could be '1,2,3')
         *      of users oids to filter the research. '*' meant filter does not apply
         * @param $notin (optional) A postgresql array(ie '{1,2,3}' also could be '1,2,3')
         *      of users oids to exclude from the research. '' meant filter does not apply
         * @return ADORecordSet
         */
        public static function get_users($in = '*', $notin = ''){
            $filter = '';
			if(is_array($in)) $in = implode(',', $in);
			if(is_array($notin)) $notin = implode(',', $notin);
            if($in != '*') {
                if(strpos($in, '{') !== 0) $in = "{{$in}}";
                if(!empty ($in)) $filter = "usesysid = ANY ('{$in}')";
                else return new ADORecordSet_empty();
            }
            if(!empty ($notin)){
                if(strpos($notin, '{') !== 0) $notin = "{{$notin}}";
                if(!empty($filter)) $filter .= ' AND ';
                $filter .= "usesysid != ALL ('{$notin}')";
            }
            $sql = 'SELECT usename, usesysid FROM pg_catalog.pg_user';
            if (!empty ($filter)) $sql .= " WHERE {$filter}";
            return ERDiagram::$store_driver->selectSet($sql);
        }

        /**
         * Gets groups from the database with some filters
         * @param $in (optional) A postgresql array(ie '{1,2,3}' also could be '1,2,3')
         *      of groups oids to filter the research. '*' meant filter does not apply
         * @param $notin (optional) A postgresql array(ie '{1,2,3}' also could be '1,2,3')
         *      of groups oids to exclude from the research. '' meant filter does not apply
         * @return ADORecordSet
         */
        public static function get_groups($in = '*', $notin = ''){
            $filter = '';
			if(is_array($in)) $in = implode(',', $in);
			if(is_array($notin)) $notin = implode(',', $notin);
            if($in != '*') {
                if(strpos($in, '{') !== 0) $in = "{{$in}}";
                if(!empty ($in)) $filter = "grosysid = ANY ('{$in}')";
                else return new ADORecordSet_empty();
            }
            if(!empty ($notin)){
                if(strpos($notin, '{') !== 0) $notin = "{{$notin}}";
                if(!empty($filter)) $filter .= " AND ";
                $filter .= "grosysid != ALL ('{$notin}')";
            }
            $sql = "SELECT groname, grosysid FROM pg_catalog.pg_group";
            if (!empty ($filter)) $sql .= " WHERE {$filter}";
            return ERDiagram::$store_driver->selectSet($sql);
        }

        /**
         * Creates a ER diagram
         * @param $name The name of the diagram
         * @param $comment The comment on the report
         * @param $roles_with_privileges A postgresql array with the oids of users and groups with privileges
         * @param $owner the Owner of the diagram
         * @return 0 Success
         */
        public function save(){
			
			if($this->id == 0){
				$values = array(
					'name' => pg_escape_string($this->name),
					'comment' => pg_escape_string($this->comment),
					'owner' => pg_escape_string($this->owner),
					'pg_database' => pg_escape_string($this->pg_database),
					'pg_schema' => pg_escape_string($this->pg_schema),
					'roles_with_privileges' => "{".implode(",", $this->roles_with_privileges)."}"
				);
				return ERDiagram::$store_driver->insert(ERDiagram::$store_table, $values);
			}
			else{
				$values = array(
					'name' => pg_escape_string($this->name),
					'comment' => pg_escape_string($this->comment),
					'roles_with_privileges' => "{".implode(",", $this->roles_with_privileges)."}"
				);
				$filters = array(
					'pg_database' => $this->pg_database,
					'pg_schema' => $this->pg_schema,
					'erdiagram_id' => $this->id
				);
				return ERDiagram::$store_driver->update(ERDiagram::$store_table, $values, $filters);
			}
        }


        /**
         * Update the ER diagram structure
         * @param $id The indentifier of the diagram
         * @param $structure The structure to save
         * @return 0 Success
         */
        public static function update_diagram_structure($id, $structure){
			$values = array(
                'data' => $structure
            );
            $filters = array(
                'pg_database' => ERDiagram::get_object_oid('database'),
                'pg_schema' => ERDiagram::get_object_oid('schema'),
                'erdiagram_id' => $id
            );
            return ERDiagram::$store_driver->update(ERDiagram::$store_table, $values, $filters);
        }

        /**
         * Drops a ER diagram
         * @param $id The indentifier of the diagram
         * @return 0 Success
         */
        public function drop(){
            $filters = array(
                'erdiagram_id' => $this->id
            );
            return ERDiagram::$store_driver->delete(ERDiagram::$store_table, $filters);
        }

		public static function load_current_schema() {		 
            $schema_oid = ERDiagram::get_object_oid('schema');
			$sql =	'SELECT "table"."oid" AS "tableOID", "table"."relname" AS "tableName", COALESCE("pg_catalog"."obj_description"("table"."oid", \'pg_class\'), \'\') AS "tableComment", NOT "table"."relhasoids" AS "tableWithoutOIDS",
					"column"."attnum" AS "columnNum", "column"."attname" AS "columnName", "column"."attnotnull" AS "columnNotNull", COALESCE("columnDef"."adsrc", \'\') AS "columnDefaultDef", COALESCE("pg_catalog"."col_description"("column"."attrelid", "column"."attnum"), \'\') AS "columnComment", UPPER("pg_catalog"."format_type"("column"."atttypid", "column"."atttypmod")) as "columnType"
					FROM "pg_catalog"."pg_class" AS "table"
					LEFT JOIN "pg_catalog"."pg_attribute" AS "column" ON "table"."oid" = "column"."attrelid" AND "column"."attnum" > 0 AND NOT "column"."attisdropped"
					LEFT JOIN "pg_catalog"."pg_attrdef" AS "columnDef" ON "column"."attrelid" = "columnDef"."adrelid" AND "column"."attnum" = "columnDef"."adnum"
					WHERE "relkind"=\'r\' AND "relnamespace" = '.$schema_oid.'
					ORDER BY "table"."oid", "column"."attnum"';
            $rs = ERDiagram::$logic_driver->selectSet($sql);
            $tables = array();
			$indexed_tables = array();
			$indexed_columns = array();
			$table = null;
			$column = null;
			if(is_object($rs)) {
				while(!$rs->EOF){
					if(is_null($table) || $table->name != $rs->fields['tableName']) {
						$table = new stdClass();
						$table->name = $rs->fields['tableName'];
						$table->withoutOIDS = $rs->fields['tableWithoutOIDS'] == 't';
						$table->comment = $rs->fields['tableComment'];
						$table->columns = array();
						$table->uniqueKeys = array();
						$table->foreignKeys = array();
						$tables[] = $table;
						$indexed_tables[(int)$rs->fields['tableOID']] = $table;
					}
					if(!is_null($rs->fields['columnNum'])) {
						$column = new stdClass();
						$column->name = $rs->fields['columnName'];
						$column->comment = $rs->fields['columnComment'];
						$column->defaultDef = $rs->fields['columnDefaultDef'];
						$column->notNull = $rs->fields['columnNotNull'] == 't';
						$column->array = preg_match('/\[\]/', $rs->fields['columnType']) === 1;
						$column->length = preg_match('/\\(([0-9, ]*)\\)/', $rs->fields['columnType'], $matches)? $matches[1] : '';
						$column->type = preg_replace('/\([0-9, ]*\)/', '', preg_replace('/\[\]/', '', $rs->fields["columnType"]));
						$column->primaryKey = false;
						
						if(preg_match('/^nextval/', strtolower($column->defaultDef)) && $column->notNull && ($column->type == "INTEGER" || $column->type == "BIGINT")){
							$column->defaultDef = '';
							$column->type = ($column->type == 'INTEGER')? 'SERIAL' : 'BIGSERIAL';
						}
						
						$table->columns[] = $column;
						$indexed_columns[(int)$rs->fields['tableOID']][(int)$rs->fields['columnNum']] = $column;
					}
					$rs->MoveNext();
				}
			}
			
			$sql =
                'SELECT "conname", "contype", "condeferrable", "condeferred", "conrelid",
                "confrelid", "confupdtype", "confdeltype", "confmatchtype", "conkey", "confkey",
				COALESCE("pg_catalog"."obj_description"("oid", \'pg_constraint\'), \'\') AS "comment"
                FROM "pg_catalog"."pg_constraint"
                WHERE "contype" IN (\'f\', \'p\', \'u\') AND connamespace = '.$schema_oid;
            
			$rs = ERDiagram::$logic_driver->selectSet($sql);
			
			if(is_object($rs)) {
				while(!$rs->EOF){
					$table_oid = (int)$rs->fields['conrelid'];
					$conkey = explode(',', str_replace(array('{', '}'), '', $rs->fields['conkey']));
					$constraint = new stdClass();
					$constraint->name = $rs->fields['conname'];
					$constraint->comment = $rs->fields['comment'];
					$constraint->columns = array();
					switch($rs->fields["contype"]) {
						case 'f':
							$confkey = explode(',', str_replace(array('{', '}'), '', $rs->fields['confkey']));
							$ftableOID = (int)$rs->fields['confrelid'];
							foreach($conkey as $i => $key) {
								$constraint->columns[] = array(
									'localColumn' => $indexed_columns[$table_oid][(int)$key]->name,
									'foreignColumn' => $indexed_columns[$ftableOID][(int)$confkey[$i]]->name 
								);
							}
							$constraint->deleteAction = $rs->fields['confdeltype'];
							$constraint->updateAction = $rs->fields['confupdtype'];
							$constraint->deferred = $rs->fields['condeferred'];
							$constraint->deferrable = $rs->fields['condeferrable'];
							$constraint->matchFull = $rs->fields['confmatchtype'] == 'f';
							$constraint->referencedTable = $indexed_tables[$ftableOID]->name;
							
							$indexed_tables[$table_oid]->foreignKeys[] = $constraint;
							break;
						case 'p':
							foreach($conkey as $key) {
								$indexed_columns[$table_oid][(int)$key]->primaryKey = true;
							}
							break;
						case 'u':
							$constraint->columns = array();
							foreach($conkey as $key) {
								$constraint->columns[] = $indexed_columns[$table_oid][(int)$key]->name;
							}
							$indexed_tables[$table_oid]->uniqueKeys[] = $constraint;
							break;
					}
					$rs->MoveNext();
				}
			}
			return array('tables' => $tables);
        }
		
		public function get_structure(){
			if(empty($this->data)){ return 'null'; } 
			return $this->data;
		}
    }
