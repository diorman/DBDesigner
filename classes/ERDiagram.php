<?php

    /*
     * Class to manage er diagrams
     */

    //include_once './libraries/lib.inc.php';
    /*include_once './conf/dbdesigner.config.inc.php';*/

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
            if (DBDesignerConfig::ownedERDiagramsOnly) {
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
            $rs = $this->storeDriver->selectSet($sql);
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
            global $misc;
			
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
        public function updateERDiagramStructure($id, $structure){
            global $misc;
            $values = array(
                'data' => $structure
            );
            $filters = array(
                'pg_database' => $this->getObjectOID('database'),
                'pg_schema' => $this->getObjectOID('schema'),
                'erdiagram_id' => $id
            );
            return $this->storeDriver->update($this->storeTable, $values, $filters);
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

        function cleanJsonValue($value){
            return str_replace(array("\"", "\n"), array("\\\"", "\\n"), $value);
        }

        function cleanCDATA($value){
            return str_replace("]]>", "] ]>", $value);
        }

        public function getJsonFromXml($id, $doc = NULL){
            if($id != NULL){
                $sql = "SELECT data FROM {$this->storeTable} WHERE erdiagram_id = {$id}";
                $erdiagram = $this->storeDriver->selectSet($sql);
                if(empty($erdiagram->fields["data"])) return '{"tbls":[], "fks":[]}';
                $doc = new DOMDocument();
                $doc->loadXML(str_replace("&", "&amp;", $erdiagram->fields["data"]));
            }

            $json = '{"tbls":[';
            $tables = $doc->getElementsByTagName("tbl");
            for($i = 0, $tlen = $tables->length; $i < $tlen; $i++){
                $table = $tables->item($i);
                $json .= "{";
                foreach($table->attributes as $attName => $attNode){
                    $json .= '"'.$attName.'":"'.$attNode->value.'",';
                }
                $json .= '"nm":"'.$table->getElementsByTagName("nm")->item(0)->nodeValue.'",';
                $comment = $table->getElementsByTagName("cmt");
                if($comment->length > 0) $json .= '"cmt":"'.$this->cleanJsonValue($comment->item(0)->nodeValue).'",';


                //--------------------Columns---------------
                $columns = $table->getElementsByTagName("col");
                $json .= '"cols":[';
                for($c = 0, $clen = $columns->length; $c < $clen; $c++){
                    $column = $columns->item($c);
                    $json .= "{";
                    foreach($column->attributes as $attName => $attNode){
                        $json .= '"'.$attName.'":"'.$attNode->value.'",';
                    }
                    $json .= '"nm":"'.$column->getElementsByTagName("nm")->item(0)->nodeValue.'",';
                    $comment = $column->getElementsByTagName("cmt");
                    if($comment->length > 0) $json .= '"cmt":"'.$this->cleanJsonValue($comment->item(0)->nodeValue).'",';
                    $df = $column->getElementsByTagName("df");
                    if($df->length > 0) $json .= '"df":"'.$this->cleanJsonValue($df->item(0)->nodeValue).'",';
                    $json .= '"dt":"'.$this->cleanJsonValue($column->getElementsByTagName("dt")->item(0)->nodeValue).'"';
                    $json .= ($c + 1 < $clen)?"},":"}";
                }
                $json .= "]";
                //------------------------------------------

                $json .= ($i + 1 < $tlen)?"},":"}";
            }
            $json .= '],"fks":[';

            //------------------------ForeignKeys---------------
            $fks = $doc->getElementsByTagName("fk");
            for($i = 0, $flen = $fks->length; $i < $flen; $i++){
                $fk = $fks->item($i);
                $json .= "{";
                foreach($fk->attributes as $attName => $attNode){
                    $json .= '"'.$attName.'":"'.$attNode->value.'",';
                }
                $comment = $fk->getElementsByTagName("cmt");
                if($comment->length > 0) $json .= '"cmt":"'.$this->cleanJsonValue($comment->item(0)->nodeValue).'",';
                $keys = $fk->getElementsByTagName("key");
                $json .= '"keys":[';
                for($k = 0, $klen = $keys->length; $k < $klen; $k++){
                    $key = $keys->item($k);
                    $json .= '{"lcol":"'.$key->getAttribute("lcol").'","rcol":"'.$key->getAttribute("rcol").'"}';
                    if($k + 1 < $klen) $json .= ',';
                }
                $json .= '],"nm":"'.$fk->getElementsByTagName("nm")->item(0)->nodeValue.'"}';
                if($i + 1 < $flen) $json .= ',';
            }
            //---------------------------------------------------
            return $json.=']}';
        }

        public function getJsonFromSchema($id){
            $sql = "SELECT relname, oid, pg_catalog.obj_description(oid, 'pg_class') AS comment, CASE WHEN relhasoids THEN '0' ELSE '1' END AS woids
                FROM pg_catalog.pg_class 
                WHERE relkind='r' AND relnamespace={$this->getObjectOID('schema')}
                ORDER BY relname";
            $tables = $this->logicDriver->selectSet($sql);
            $doc = new DOMDocument("<dgrm></dgrm>");
            $tableCount = 0;
            while(!$tables->EOF){
                $xmlTable = $doc->createElement("tbl");
                $doc->appendChild($xmlTable);

                $xmlTable->setAttribute("id", "t_{$tables->fields["oid"]}");
                $xmlTable->setIdAttribute("id", TRUE);
                $xmlTable->setAttribute("i", $tableCount); // this is de id that javascript will use
                $xmlTable->setAttribute("woids", $tables->fields["woids"]);

                $xmlName = $doc->createElement("nm");
                $textNode = $doc->createTextNode($tables->fields["relname"]);
                $xmlName->appendChild($textNode);

                $xmlTable->appendChild($xmlName);

                if(!empty($tables->fields["comment"])){
                    $xmlComment = $doc->createElement("cmt");
                    $xmlCDATA = $doc->createCDATASection($this->cleanCDATA($tables->fields["comment"]));
                    $xmlComment->appendChild($xmlCDATA);
                    $xmlTable->appendChild($xmlComment);
                }

                $sql =
                    "SELECT a.attname AS name, CASE WHEN a.attnotnull THEN '1' ELSE '0' END AS nn, adef.adsrc AS df, a.attnum AS num,
                        pg_catalog.col_description(a.attrelid, a.attnum) AS comment, pg_catalog.format_type(a.atttypid, a.atttypmod) as type
                        FROM
                            pg_catalog.pg_attribute a LEFT JOIN pg_catalog.pg_attrdef adef
                            ON a.attrelid=adef.adrelid
                            AND a.attnum=adef.adnum
                        WHERE
                            a.attrelid = {$tables->fields["oid"]}
                            AND a.attnum > 0 AND NOT a.attisdropped
                        ORDER BY a.attnum";
                $columns = $this->logicDriver->selectSet($sql);
                $columnCount=0;
                while(!$columns->EOF){
                    $array = preg_match('/\[\]/', $columns->fields["type"])?"1":"0";
                    $len = preg_match('/\\(([0-9, ]*)\\)/', $columns->fields["type"], $matches)? $matches[1]: "";
                    $type = strtoupper(preg_replace('/\([0-9, ]*\)/', '', preg_replace('/\[\]/', '', $columns->fields["type"])));

                    if(preg_match('/^nextval/', strtolower($columns->fields["df"])) == TRUE && $columns->fields["nn"] == "1" && ($type == "INTEGER" || $type == "BIGINT")){
                        $columns->fields["df"] = "";
                        $type = ($type == "INTEGER")? "SERIAL" : "BIGSERIAL";
                    }

                    $xmlColumn = $doc->createElement("col");
                    $xmlTable->appendChild($xmlColumn);

                    $xmlColumn->setAttribute("id", "c_{$tables->fields["oid"]}_{$columns->fields["num"]}");
                    $xmlColumn->setIdAttribute("id", TRUE);
                    $xmlColumn->setAttribute("i", $columnCount);
                    $xmlColumn->setAttribute("nn", $columns->fields["nn"]);
                    $xmlColumn->setAttribute("array", $array);
                    $xmlColumn->setAttribute("len", $len);
                    $xmlColumn->setAttribute("pk", "0");
                    $xmlColumn->setAttribute("uk", "0");

                    $xmlName = $doc->createElement("nm");
                    $textNode = $doc->createTextNode($columns->fields["name"]);
                    $xmlName->appendChild($textNode);
                    $xmlColumn->appendChild($xmlName);

                    $xmlDataType = $doc->createElement("dt", $type);
                    $xmlColumn->appendChild($xmlDataType);

                    if(!empty($columns->fields["comment"])){
                        $xmlComment = $doc->createElement("cmt");
                        $xmlCDATA = $doc->createCDATASection($this->cleanCDATA($columns->fields["comment"]));
                        $xmlComment->appendChild($xmlCDATA);
                        $xmlColumn->appendChild($xmlComment);
                    }
                    if(!empty($columns->fields["df"])){
                        $xmlDefault = $doc->createElement("df");
                        $xmlCDATA = $doc->createCDATASection($this->cleanCDATA($columns->fields["df"]));
                        $xmlDefault->appendChild($xmlCDATA);
                        $xmlColumn->appendChild($xmlDefault);
                    }
                    $columnCount++;
                    $columns->MoveNext();
                }
                $tables->MoveNext();
                $tableCount++;
            }

            $sql =
                "SELECT conname, contype, CASE WHEN condeferrable THEN '1' ELSE '0' END AS d, CASE WHEN condeferred THEN '1' ELSE '0' END AS initd, conrelid,
                    confrelid, confupdtype, confdeltype, CASE WHEN confmatchtype = 'f' THEN '1' ELSE '0' END AS mf, conkey, confkey, pg_catalog.obj_description(oid, 'pg_constraint') AS comment
                FROM pg_catalog.pg_constraint
                WHERE contype IN ('f', 'p', 'u') AND connamespace={$this->getObjectOID("schema")}";
            $constraints = $this->logicDriver->selectSet($sql);
            while(!$constraints->EOF){
                $conkey = explode(",", str_replace(array("{", "}"), "", $constraints->fields["conkey"]));
                switch ($constraints->fields["contype"]){
                    case "f":
                        $xmlFk = $doc->createElement("fk");
                        $doc->appendChild($xmlFk);

                        $ownerTable = $doc->getElementById("t_{$constraints->fields["conrelid"]}");
                        $referencedTable = $doc->getElementById("t_{$constraints->fields["confrelid"]}");

                        $xmlFk->setAttribute("otbl", $ownerTable->getAttribute("i"));
                        $xmlFk->setAttribute("rtbl", $referencedTable->getAttribute("i"));
                        $xmlFk->setAttribute("d", $constraints->fields["d"]);
                        $xmlFk->setAttribute("initd", $constraints->fields["initd"]);
                        $xmlFk->setAttribute("ua", $constraints->fields["confupdtype"]);
                        $xmlFk->setAttribute("da", $constraints->fields["confdeltype"]);
                        $xmlFk->setAttribute("mf", $constraints->fields["mf"]);

                        $xmlName = $doc->createElement("nm");
                        $textNode = $doc->createTextNode($constraints->fields["conname"]);
                        $xmlName->appendChild($textNode);
                        $xmlFk->appendChild($xmlName);

                        if(!empty($constraints->fields["comment"])){
                            $xmlComment = $doc->createElement("cmt");
                            $xmlCDATA = $doc->createCDATASection($this->cleanCDATA($constraints->fields["comment"]));
                            $xmlComment->appendChild($xmlCDATA);
                            $xmlFk->appendChild($xmlComment);
                        }

                        $confkey = explode(",", str_replace(array("{", "}"), "", $constraints->fields["confkey"]));
                        for($i = 0, $n = sizeof($conkey); $i < $n; $i++){
                            $localColumn = $doc->getElementById("c_{$constraints->fields["conrelid"]}_{$conkey[$i]}");
                            $referencedColumn = $doc->getElementById("c_{$constraints->fields["confrelid"]}_{$confkey[$i]}");
                            
                            $xmlKey = $doc->createElement("key");
                            $xmlFk->appendChild($xmlKey);

                            $xmlKey->setAttribute("lcol", $localColumn->getAttribute("i"));
                            $xmlKey->setAttribute("rcol", $referencedColumn->getAttribute("i"));

                        }
                        break;
                    case "p":
                    case "u":
                        $attName = $constraints->fields["contype"]."k";
                        for($i = 0, $n = sizeof($conkey); $i < $n; $i++){
                            $column = $doc->getElementById("c_{$constraints->fields["conrelid"]}_{$conkey[$i]}");
                            if($column != null) {
                                $column->setAttribute($attName, "1");
                                //if($attName == "pk") $column->setAttribute("nn", "0");
                            }
                        }
                        break;
                }
                $constraints->MoveNext();
            }

            $tabs = $doc->getElementsByTagName("tbl");
            $cols = $doc->getElementsByTagName("col");
            foreach($tabs as $tab) $tab->removeAttribute("id");
            foreach($cols as $col) $col->removeAttribute("id");
            return $this->getJsonFromXml(NULL, $doc);
            //return $doc->saveXML();
        }
    }
