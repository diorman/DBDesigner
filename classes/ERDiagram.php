<?php

    /*
     * Class to manage er diagrams
     */

    class ERDiagram{
        private static $settedUp = FALSE;

		//store vars are used to get info about diagrams
        private static $storeDriver;
        private static $storeDatabase;
        private static $storeSchema;
        private static $storeTable;

        //logic vars are used to get info about objects in the current schema
        private static $logicDriver;
        private static $logicDatabase;
        private static $logicSchema;

		public $id;
		public $name;
        public $pgDatabase;
        public $pgSchema;
        public $rolesWithPrivileges;
		public $comment;
		public $dateCreated;
		public $lastUpdate;
		public $data;
		public $ownerName;
		public $owner;
		

        /* Constructor */
		public function __construct() {
			global $misc;
			$server_info = $misc->getServerInfo();
			$this->id = 0;
			$this->name = '';
			$this->pgDatabase = ERDiagram::getObjectOID('database');
			$this->pgSchema = ERDiagram::getObjectOID('schema');
			$this->rolesWithPrivileges = array();
			$this->comment = '';
			$this->dateCreated = '';
			$this->lastUpdate = '';
			$this->data = '';
			$this->ownerName = $server_info['username'];
			$this->owner = ERDiagram::getObjectOID('role', $this->ownerName);
		}
		
		public static function loadFromRequest(){
			$diagram = NULL;
			
			if(empty ($_POST) && isset($_GET['erdiagram_id'])){
				$diagram = ERDiagram::load($_GET['erdiagram_id']);
			}
			
			else{
				$diagram = new ERDiagram();
				
				if (isset($_POST['diagram']['id'])) $diagram->id = $_POST['diagram']['id'];
		
				if (isset($_POST['diagram']['name'])) $diagram->name = $_POST['diagram']['name'];

				if (isset($_POST['diagram']['granted_groups'])) 
					$diagram->rolesWithPrivileges = array_merge($diagram->rolesWithPrivileges, $_POST['diagram']['granted_groups']);

				if (isset($_POST['diagram']['granted_users'])) 
					$diagram->rolesWithPrivileges = array_merge($diagram->rolesWithPrivileges, $_POST['diagram']['granted_users']);

				if (isset($_POST['diagram']['comment'])) $diagram->comment = $_POST['diagram']['comment'];	
			}
			
			return $diagram;
		}
		
		
		public static function isSettedUp(){
			return ERDiagram::$settedUp;
		}
		
        public static function setUpDrivers(){
			if(ERDiagram::$settedUp) return TRUE;
            global $misc;
			ERDiagram::$storeDatabase = DBDesignerConfig::database;
            ERDiagram::$storeSchema = DBDesignerConfig::schema;
            ERDiagram::$storeTable = DBDesignerConfig::table;
            $status = ERDiagram::checkDatabaseAndSchema();
            if($status){
                ERDiagram::$logicDatabase = isset($_REQUEST['database'])? $_REQUEST['database'] : '';
                ERDiagram::$logicSchema = isset($_REQUEST['schema'])?$_REQUEST['schema'] : '';
                ERDiagram::$logicDriver = $misc->getDatabaseAccessor(ERDiagram::$logicDatabase);
            }
			ERDiagram::$settedUp = $status;
			return $status;
        }

        /**
         * Checks to see if the diagrams database and schema exists
         * @return TRUE Success
         * @return FALSE Fail
         */
        public static function checkDatabaseAndSchema(){
            global $data, $misc;
            $rs = $data->getDatabase(ERDiagram::$storeDatabase);
            if ($rs->recordCount() != 1) return FALSE;

            // Create a new database access object.
            ERDiagram::$storeDriver = $misc->getDatabaseAccessor(ERDiagram::$storeDatabase);
            
            $sql = "SELECT nspname FROM pg_catalog.pg_namespace WHERE nspname='".pg_escape_string(ERDiagram::$storeSchema)."'";
            $rs = ERDiagram::$storeDriver->selectSet($sql);
            if($rs->recordCount() != 1) return FALSE;
            ERDiagram::$storeDriver->setSchema(ERDiagram::$storeSchema);
            return TRUE;
        }

		public static function load($id){
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
            $tables = ERDiagram::$storeTable;
            $filters = 'pg_database = '.ERDiagram::getObjectOID('database').
				' AND pg_schema = '.ERDiagram::getObjectOID('schema').
				' AND erdiagram_id = '.pg_escape_string($id);
            $sql = "SELECT {$columns} FROM {$tables} WHERE {$filters} ORDER BY name";
            $rs = ERDiagram::$storeDriver->selectSet($sql);
			if($rs->recordCount() != 1) return NULL;
            
			$roles = str_replace(array('{','}'), '', $rs->fields('roles_with_privileges'));
			
			$diagram = new ERDiagram();
			$diagram->id = $rs->fields('erdiagram_id');
			$diagram->name = $rs->fields('name');
			$diagram->comment = $rs->fields('comment');
			$diagram->rolesWithPrivileges = empty ($roles)? array():explode(',', $roles);
			$diagram->owner = $rs->fields('owner');
			$diagram->dateCreated = $rs->fields('date_created');
			$diagram->lastUpdate = $rs->fields('last_update');
			$diagram->pgSchema = $rs->fields('pg_schema');
			$diagram->pgDatabase = $rs->fields('pg_database');
			$diagram->data = $rs->fields('data');
			$diagram->ownerName = $rs->fields('owner_name');

			return $diagram;
			
		}
		
        /**
         * Finds diagrams logically stored in the current schema (logic)
         * @param $id (optional) The ID of the diagram to get just one
         * @return ADORecordSet
         */
        public static function getList(){
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
            $tables = ERDiagram::$storeTable;
            $filters = 'pg_database = '.ERDiagram::getObjectOID('database').' AND pg_schema = '.ERDiagram::getObjectOID('schema');
            if (DBDesignerConfig::showOwnedERDiagramsOnly) {
                $server_info = $misc->getServerInfo();
                $filters .= " AND owner = (SELECT usesysid FROM pg_catalog.pg_user WHERE usename = '{$server_info['username']}')";
            }
            $sql = "SELECT {$columns} FROM {$tables} WHERE {$filters} ORDER BY name";
            return ERDiagram::$storeDriver->selectSet($sql);
        }

        /**
         * Gets the oid of a particular object stored in the current schema (logic)
         * @param $type The type of the object
         * @param $name (not needed for database and schema) The name of the object
         * @return oid Success
         * @return -1 No object found
         */
        public static function getObjectOID($type, $name = ''){
            switch($type){
                case 'database':
                    $sql = "SELECT oid FROM pg_catalog.pg_database WHERE datname = current_database()";
                    break;
                case 'schema':
                    $sql = "SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = '".pg_escape_string(ERDiagram::$logicSchema)."'";
                    break;
                case 'role':
                    $sql = "SELECT usesysid AS oid FROM pg_catalog.pg_user WHERE usename = '".pg_escape_string($name)."'";
                    break;
            }
			
            $rs = ERDiagram::$logicDriver->selectSet($sql);
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
        public static function userHasPrivileges($diagram_id, $username){
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
            $rs = ERDiagram::$storeDriver->selectSet($sql);
            if($rs->recordCount() > 0) return TRUE;
            return FALSE;
        }

        /**
         * Gets users from the database with some filters
         * @param $in (optional) A postgresql array(ie '{1,2,3}' also could be '1,2,3')
         *      of users oids to filter the research. '*' meant filter does not apply
         * @param $notin (optional) A postgresql array(ie '{1,2,3}' also could be '1,2,3')
         *      of users oids to exclude from the research. '' meant filter does not apply
         * @return ADORecordSet
         */
        public static function getUsers($in = '*', $notin = ''){
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
            return ERDiagram::$storeDriver->selectSet($sql);
        }

        /**
         * Gets groups from the database with some filters
         * @param $in (optional) A postgresql array(ie '{1,2,3}' also could be '1,2,3')
         *      of groups oids to filter the research. '*' meant filter does not apply
         * @param $notin (optional) A postgresql array(ie '{1,2,3}' also could be '1,2,3')
         *      of groups oids to exclude from the research. '' meant filter does not apply
         * @return ADORecordSet
         */
        public static function getGroups($in = '*', $notin = ''){
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
            return ERDiagram::$storeDriver->selectSet($sql);
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
					'pg_database' => pg_escape_string($this->pgDatabase),
					'pg_schema' => pg_escape_string($this->pgSchema),
					'roles_with_privileges' => "{".implode(",", $this->rolesWithPrivileges)."}"
				);
				return ERDiagram::$storeDriver->insert(ERDiagram::$storeTable, $values);
			}
			else{
				$values = array(
					'name' => pg_escape_string($this->name),
					'comment' => pg_escape_string($this->comment),
					'roles_with_privileges' => "{".implode(",", $this->rolesWithPrivileges)."}"
				);
				$filters = array(
					'pg_database' => $this->pgDatabase,
					'pg_schema' => $this->pgSchema,
					'erdiagram_id' => $this->id
				);
				return ERDiagram::$storeDriver->update(ERDiagram::$storeTable, $values, $filters);
			}
        }


        /**
         * Update the ER diagram structure
         * @param $id The indentifier of the diagram
         * @param $structure The structure to save
         * @return 0 Success
         */
        public static function updateERDiagramStructure($id, $structure){
			$values = array(
                'data' => $structure
            );
            $filters = array(
                'pg_database' => ERDiagram::getObjectOID('database'),
                'pg_schema' => ERDiagram::getObjectOID('schema'),
                'erdiagram_id' => $id
            );
            return ERDiagram::$storeDriver->update(ERDiagram::$storeTable, $values, $filters);
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
            return ERDiagram::$storeDriver->delete(ERDiagram::$storeTable, $filters);
        }

		public static function loadCurrentSchema() {		 
            $schemaOID = ERDiagram::getObjectOID('schema');
			$sql =	'SELECT "table"."oid" AS "tableOID", "table"."relname" AS "tableName", COALESCE("pg_catalog"."obj_description"("table"."oid", \'pg_class\'), \'\') AS "tableComment", NOT "table"."relhasoids" AS "tableWithoutOIDS",
					"column"."attnum" AS "columnNum", "column"."attname" AS "columnName", "column"."attnotnull" AS "columnNotNull", COALESCE("columnDef"."adsrc", \'\') AS "columnDefaultDef", COALESCE("pg_catalog"."col_description"("column"."attrelid", "column"."attnum"), \'\') AS "columnComment", UPPER("pg_catalog"."format_type"("column"."atttypid", "column"."atttypmod")) as "columnType"
					FROM "pg_catalog"."pg_class" AS "table"
					LEFT JOIN "pg_catalog"."pg_attribute" AS "column" ON "table"."oid" = "column"."attrelid" AND "column"."attnum" > 0 AND NOT "column"."attisdropped"
					LEFT JOIN "pg_catalog"."pg_attrdef" AS "columnDef" ON "column"."attrelid" = "columnDef"."adrelid" AND "column"."attnum" = "columnDef"."adnum"
					WHERE "relkind"=\'r\' AND "relnamespace" = '.$schemaOID.'
					ORDER BY "table"."oid", "column"."attnum"';
            $rs = ERDiagram::$logicDriver->selectSet($sql);
            $tables = array();
			$indexedTables = array();
			$indexedColumns = array();
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
						$indexedTables[(int)$rs->fields['tableOID']] = $table;
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
						$indexedColumns[(int)$rs->fields['tableOID']][(int)$rs->fields['columnNum']] = $column;
					}
					$rs->MoveNext();
				}
			}
			
			$sql =
                'SELECT "conname", "contype", "condeferrable", "condeferred", "conrelid",
                "confrelid", "confupdtype", "confdeltype", "confmatchtype", "conkey", "confkey",
				COALESCE("pg_catalog"."obj_description"("oid", \'pg_constraint\'), \'\') AS "comment"
                FROM "pg_catalog"."pg_constraint"
                WHERE "contype" IN (\'f\', \'p\', \'u\') AND connamespace = '.$schemaOID;
            
			$rs = ERDiagram::$logicDriver->selectSet($sql);
			
			if(is_object($rs)) {
				while(!$rs->EOF){
					$tableOID = (int)$rs->fields['conrelid'];
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
									'localColumn' => $indexedColumns[$tableOID][(int)$key]->name,
									'foreignColumn' => $indexedColumns[$ftableOID][(int)$confkey[$i]]->name 
								);
							}
							$constraint->deleteAction = $rs->fields['confdeltype'];
							$constraint->updateAction = $rs->fields['confupdtype'];
							$constraint->deferred = $rs->fields['condeferred'];
							$constraint->deferrable = $rs->fields['condeferrable'];
							$constraint->matchFull = $rs->fields['confmatchtype'] == 'f';
							$constraint->referencedTable = $indexedTables[$ftableOID]->name;
							
							$indexedTables[$tableOID]->foreignKeys[] = $constraint;
							break;
						case 'p':
							foreach($conkey as $key) {
								$indexedColumns[$tableOID][(int)$key]->primaryKey = true;
							}
							break;
						case 'u':
							$constraint->columns = array();
							foreach($conkey as $key) {
								$constraint->columns[] = $indexedColumns[$tableOID][(int)$key]->name;
							}
							$indexedTables[$tableOID]->uniqueKeys[] = $constraint;
							break;
					}
					$rs->MoveNext();
				}
			}
			return array('tables' => $tables);
        }
		
		public function getStructure(){
			if(empty($this->data)){ return 'null'; } 
			return $this->data;
		}
    }
