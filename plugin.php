<?php
require_once 'classes/Plugin.php';
require_once 'classes/ERDiagram.php';


class DBDesigner extends Plugin {

	/**
	 * Attributes
	 */
	protected $name;
	protected $lang;
	protected $conf;
	protected $version;

	/**
	 * Constructor
	 * Call parent constructor, passing the language that will be used.
	 * @param $language Current phpPgAdmin language. If it was not found in the plugin, English will be used.
	 */
	function __construct($language) {
		global $data;
		parent::__construct($language);
		$this->name = $this->conf['plugin_name'];
		$this->plugin_version = $this->conf['plugin_version'];
		if(!is_null($data)) { 
			ERDiagram::setup_drivers($this->conf['database'], $this->conf['schema'], $this->conf['table']);	
		}
		if(isset($_REQUEST['plugin']) && $_REQUEST['plugin'] == $this->name && (!isset($_REQUEST['action']) || empty($_REQUEST['action']))){
			//Set default action in case of empty action
			$_REQUEST['action'] = 'show_default';				
		}
	}

	/**
	 * Helper lang function. If the string requested is not declared within plugin's language,
	 * it tries to get it from the global language. If the two attempts fail, it returns a warning string
	 * 
	 * @global type $lang
	 * @param type $langkey
	 * @return string
	 */
	function _($langkey){
		global $lang;
		if(isset($this->lang[$langkey])) { return $this->lang[$langkey]; }
		elseif(isset($lang[$langkey])) { return $lang[$langkey]; }
		return '<b>Warning: String missing</b>';
	}
	
	/**
	 * Checks that the plugin's database has been created, otherwise it prints a message
	 * @global type $misc
	 */
	function check_installation(){
		if(!ERDiagram::is_setup()){
			global $misc;
			$misc->printHeader($this->_('strerdiagrams'));
			$misc->printBody();
			$misc->printTrail('schema');
			$misc->printMsg($this->_('strbadinstallation'));
			$misc->printFooter();
			exit;
		}
	}
	
	/**
	 * This method returns the functions that will hook in the phpPgAdmin core.
	 * To do include a function just put in the $hooks array the follwing code:
	 * 'hook' => array('function1', 'function2').
	 *
	 * Example:
	 * $hooks = array(
	 *	'toplinks' => array('add_plugin_toplinks'),
	 *	'tabs' => array('add_tab_entry'),
	 *  'action_buttons' => array('add_more_an_entry')
	 * );
	 *
	 * @return $hooks
	 */
	function get_hooks() {
		$hooks = array(
			'tabs' => array('add_plugin_tabs'),
			//'trail' => array('add_plugin_trail'),
			//'navlinks' => array('add_plugin_navlinks'),
			//'actionbuttons' => array('add_plugin_actionbuttons')
		);
		return $hooks;
	}

	/**
	 * This method returns the functions that will be used as actions.
	 * To do include a function that will be used as action, just put in the $actions array the follwing code:
	 *
	 * $actions = array(
	 *	'show_page',
	 *	'show_error',
	 * );
	 *
	 * @return $actions
	 */
	function get_actions() {
		if(!ERDiagram::is_setup()) return array('show_default', 'tree');
		
		$actions = array(
			'show_default',
			'show_create_edit',
			'show_diagram',
			'show_drop',
			'save',
			'tree',
			'drop',
			'open',
			'ajax_save',
			'ajax_execute_sql',
			'ajax_load_schema_structure',
			'ajax_keep_session_alive'
		);
		return $actions;
	}

	/**
	 * Add plugin in the tabs
	 * @param $plugin_functions_parameters
	 */
	function add_plugin_tabs(&$plugin_functions_parameters) {

		$tabs = &$plugin_functions_parameters['tabs'];

		switch ($plugin_functions_parameters['section']) {
			case 'schema':
				$tabs['show_default'] = array (
					'title' => $this->_('strerdiagrams'),
					'url' => 'plugin.php',
					'urlvars' => array(
						'subject' => 'server', 
						'database' => $_REQUEST['database'],
						'schema' => $_REQUEST['schema'],
						'action' => 'show_default', 
						'plugin' => $this->name),
					'hide' => false,
					'icon' => array('plugin' => $this->name, 'image' => 'ERDiagrams')
				);
				break;
		}
	}

	function show_default($msg = '') {
        global $misc;
		$this->check_installation();
		$misc->printHeader($this->_('strerdiagrams'));
		$misc->printBody();
        $misc->printTrail('schema');
		$misc->printTabs('schema','show_default');
        $misc->printMsg($msg);

        $diagrams = ERDiagram::get_list();

        $columns = array(
            'erdiagram' => array(
                'title' => $this->_('strerdiagram'),
                'field' => field('name'),
                'url' => "plugin.php?plugin={$this->name}&amp;action=show_diagram&amp;{$misc->href}&amp;",
                'vars'  => array('erdiagram_id' => 'erdiagram_id'),
            ),
            'owner' => array(
                'title' => $this->_('strowner'),
                'field' => field('owner_name'),
            ),
            'date_created' => array(
                'title' => $this->_('strcreated'),
                'field' => field('date_created'),
            ),
            'last_update' => array(
                'title' => $this->_('strlastupdate'),
                'field' => field('last_update'),
            ),
            'actions' => array(
                'title' => $this->_('stractions'),
            ),
            'comment' => array(
                'title' => $this->_('strcomment'),
                'field' => field('comment'),
            ),
        );

        $actions = array(
            'multiactions' => array(
                'keycols' => array('erdiagram_id' => 'erdiagram_id'),
                'url' => 'plugin.php?plugin='.$this->name,
            ),
            'edit' => array(
                'title' => $this->_('stredit'),
                'url'   => "plugin.php?plugin={$this->name}&amp;action=show_create_edit&amp;{$misc->href}&amp;",
                'vars'  => array('erdiagram_id' => 'erdiagram_id'),
            ),
            'drop' => array(
                'title' => $this->_('strdrop'),
                'url'   => "plugin.php?plugin={$this->name}&amp;action=show_drop&amp;{$misc->href}&amp;",
                'vars'  => array('erdiagram_id' => 'erdiagram_id'),
                'multiaction' => 'show_drop',
            ),
            'open' => array(
                'title' => $this->_('stropen'),
                'url'   => "plugin.php?plugin={$this->name}&amp;action=open&amp;{$misc->href}&amp;",
                'vars'  => array('erdiagram_id' => 'erdiagram_id'),
            ),
            'opennewtab' => array(
				'target' => '_blanck',
                'title' => $this->_('stropeninnewtab'),
                'url'   => "plugin.php?plugin={$this->name}&amp;action=open&amp;{$misc->href}&amp;",
                'vars'  => array('erdiagram_id' => 'erdiagram_id'),
            ),
        );
				
		
        $misc->printTable($diagrams, $columns, $actions, 'dbdesigner-dbdesigner', $this->_('strnoerdiagrams'));
		
		$navlinks = array (
			array (
				'attr'=> array (
					'href' => array (
						'url' => 'plugin.php',
						'urlvars' => array (
							'plugin' => $this->name, 
							'server' => field('server'),
							'database' => field('database'),
							'schema' => field('schema'),
							'action' => 'show_create_edit')
					)
				),
				'content' => $this->_('strcreateerdiagram') 
			)
		);
		$misc->printNavLinks($navlinks, 'dbdesigner-dbdesigner');
		
		$misc->printFooter();
	}
	
	function show_create_edit($msg = ''){
		global $data, $misc;
		$diagram = ERDiagram::load_from_request();

		$misc->printHeader($this->_('strerdiagrams'));
		$misc->printBody();
        $misc->printTrail('schema');
		$misc->printTabs('schema','show_default');
		$misc->printTitle(($diagram->id == 0)? $this->_('strcreateerdiagram'): $this->_('strediterdiagram'));
        $misc->printMsg($msg);

        //Due owner always have privileges, he is removed from select controls
		$temp = array_merge($diagram->roles_with_privileges, array($diagram->owner));
		
        //Get users/groups wich are and are not a part of users/groups with privileges for the current diagram
        $users1 = ERDiagram::get_users("*", $temp);
        $users2 = ERDiagram::get_users($diagram->roles_with_privileges, $diagram->owner);
        $groups1 = ERDiagram::get_groups("*", $diagram->roles_with_privileges);
        $groups2 = ERDiagram::get_groups($diagram->roles_with_privileges);?>
		
		<script src="plugins/<?php echo $this->name; ?>/js/erdiagrams.js" type="text/javascript"></script>
		<form action="plugin.php?plugin=<?php echo $this->name; ?>" method="post" onsubmit="ERDiagram.selectAllGranted();">
			<table style="width:100%">
				<tr>
					<th class="data left required">
						<label for="diagramName"><?php echo htmlspecialchars($this->_('strname')) ?></label>
					</th>
					<td class="data1">
						<input id="diagramName" name="diagram[name]" size="32" maxlength="<?php echo $data->_maxNameLen; ?>" value="<?php echo htmlspecialchars($diagram->name) ?>" />
					</td>
				</tr>
				<tr>
					<th class="data left">
						<label for="diagramComment"><?php echo $this->_('strcomment') ?></label>
					</th>
					<td class="data1">
						<textarea id="diagramComment" name="diagram[comment]" rows="3" cols="32"><?php echo htmlspecialchars($diagram->comment)?></textarea>
					</td>
				</tr>
				
				<tr>
					<th class="data left" colspan="2" style="text-align:center;"><?php echo $this->_('strprivileges'); ?></th>
				</tr>
				<tr>
					<th class="data left"><?php echo $this->_('strowner'); ?></th>
					<td class="data1"><?php echo htmlspecialchars($diagram->ownerName); ?></td>
				</tr>
				
				
				<tr>
					<th class="data left"><label for="diagramGroups"><?php echo $this->_('strgroups'); ?></label></th>
					<td class="data1">
						<table>
							<tr>
								<td class="data1">
									<select id="diagramGroups" style="width:150px;" multiple="multiple" size="10">
										<?php while (!$groups1->EOF): ?>
											<option value="<?php echo htmlspecialchars($groups1->fields['grosysid']); ?>">
												<?php echo htmlspecialchars($groups1->fields['groname']); ?>
											</option>
											<?php $groups1->moveNext(); ?>
										<?php endwhile; ?>
									</select>
								</td>
								<td class="data1">
									<a href="#" onclick="return ERDiagram.swapSelectedOptions('diagramGroups','diagramGrantedGroups')" title="<?php echo $this->_('strgrant'); ?>">&Gg;</a>
									<br />
									<a href="#" onclick="return ERDiagram.swapSelectedOptions('diagramGrantedGroups','diagramGroups')" title="<?php echo $this->_('strrevoke'); ?>">&Ll;</a>
								</td>
								<td class="data1">
									<select id="diagramGrantedGroups" name="diagram[granted_groups][]" style="width:150px;" multiple="multiple" size="10">
										<?php while (!$groups2->EOF): ?>
											<option value="<?php echo htmlspecialchars($groups2->fields['grosysid']); ?>">
												<?php echo htmlspecialchars($groups2->fields['groname']); ?>
											</option>
											<?php $groups2->moveNext(); ?>
										<?php endwhile; ?>
									</select>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				
				<tr>
					<th class="data left"><label for="diagramUsers"><?php echo $this->_('strusers'); ?></label></th>
					<td class="data1">
						<table>
							<tr>
								<td class="data1">
									<select id="diagramUsers" style="width:150px;" multiple="multiple" size="10">
										<?php while (!$users1->EOF): ?>
											<option value="<?php echo htmlspecialchars($users1->fields['usesysid']); ?>">
												<?php echo htmlspecialchars($users1->fields['usename']); ?>
											</option>
											<?php $users1->moveNext(); ?>
										<?php endwhile; ?>
									</select>
								</td>
								<td class="data1">
									<a href="#" onclick="return ERDiagram.swapSelectedOptions('diagramUsers','diagramGrantedUsers')" title="<?php echo $this->_('strgrant'); ?>">&Gg;</a>
									<br />
									<a href="#" onclick="return ERDiagram.swapSelectedOptions('diagramGrantedUsers','diagramUsers')" title="<?php echo $this->_('strrevoke'); ?>">&Ll;</a>
								</td>
								<td class="data1">
									<select id="diagramGrantedUsers" name="diagram[granted_users][]" style="width:150px;" multiple="multiple" size="10">
										<?php while (!$users2->EOF): ?>
											<option value="<?php echo htmlspecialchars($users2->fields['usesysid']); ?>">
												<?php echo htmlspecialchars($users2->fields['usename']); ?>
											</option>
											<?php $users2->moveNext(); ?>
										<?php endwhile; ?>
									</select>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			
			
			<?php echo $misc->form; ?>
			<input type="hidden" name="diagram[id]" value="<?php echo htmlspecialchars($diagram->id);?>" />
			<input type="hidden" name="action" value="save" />
			<div>
				<input type="submit" name="create" value="<?php echo ($diagram->id == 0)? $this->_('strcreate'): $this->_('stralter'); ?>" />
				<input type="submit" name="cancel" value="<?php echo $this->_('strcancel');?>" />
			</div>
		</form>
		
		<?php
		$misc->printFooter();
	}
	
	function save(){
		if(isset($_POST['cancel'])) $this->show_default();
		else {
			$diagram = ERDiagram::load_from_request();
			if(empty ($diagram->name)) $this->show_create_edit($this->_('strerdiagramneedsname'));
			else {
				$success_msg = ($diagram->id == 0)? $this->_('strerdiagramcreated') : $this->_('strerdiagramaltered');
				$fail_msg = ($diagram->id == 0)? $this->_('strerdiagramcreatedbad'): $this->_('strerdiagramalteredbad');
				
				$status = $diagram->save();
				if ($status == 0){
					global $_reload_browser;
					$_reload_browser = true;
					$this->show_default($success_msg);
				}else
					$this->show_create_edit($fail_msg);
			}
		}
	}
	
	function show_diagram(){
		global $data, $misc;
		$diagram = ERDiagram::load_from_request();
		
		if(is_null($diagram) || $diagram->id === 0){
			$this->show_default ();
			exit;
		}

		$misc->printHeader($this->_('strerdiagrams'));
		$misc->printBody();
        $misc->printTrail('schema');
		$misc->printTabs('schema','show_default');
		$misc->printTitle($this->_('strerdiagramproperties'));

        //Due owner always have privileges, he is removed from select controls
		$temp = array_merge($diagram->roles_with_privileges, array($diagram->owner));
		
        //Get users/groups wich are and are not a part of users/groups with privileges for the current diagram
        $users1 = ERDiagram::get_users("*", $temp);
        $users2 = ERDiagram::get_users($diagram->roles_with_privileges, $diagram->owner);
        $groups1 = ERDiagram::get_groups("*", $diagram->roles_with_privileges);
        $groups2 = ERDiagram::get_groups($diagram->roles_with_privileges);
		?>
		
		<table>
			<tr>
				<th class="data left">
					<?php echo htmlspecialchars($this->_('strname')) ?>
				</th>
				<td class="data1">
					<?php echo htmlspecialchars($diagram->name) ?>
				</td>
			</tr>
			<tr>
				<th class="data left">
					<?php echo htmlspecialchars($this->_('strcreated')) ?>
				</th>
				<td class="data1">
					<?php echo htmlspecialchars($diagram->dateCreated) ?>
				</td>
			</tr>
			<tr>
				<th class="data left">
					<?php echo htmlspecialchars($this->_('strlastupdate')) ?>
				</th>
				<td class="data1">
					<?php echo htmlspecialchars($diagram->lastUpdate) ?>
				</td>
			</tr>
			<tr>
				<th class="data left">
					<?php echo $this->_('strcomment') ?>
				</th>
				<td class="data1">
					<?php echo htmlspecialchars($diagram->comment)?>
				</td>
			</tr>

			<tr>
				<th class="data left" colspan="2" style="text-align:center;"><?php echo $this->_('strprivileges'); ?></th>
			</tr>
			<tr>
				<th class="data left"><?php echo $this->_('strowner') ?></th>
				<td class="data1"><?php echo htmlspecialchars($diagram->ownerName); ?></td>
			</tr>


			<tr>
				<th class="data left"><?php echo $this->_('strgroups'); ?></th>
				<td class="data1">
					<?php while (!$groups2->EOF){
						echo htmlspecialchars($groups2->fields['groname']);
						$groups2->moveNext();
						if(!$groups2->EOF) echo ', ';
					}?>
				</td>
			</tr>

			<tr>
				<th class="data left"><?php echo $this->_('strusers'); ?></th>
				<td class="data1">
					<?php while (!$users2->EOF){
						echo htmlspecialchars($users2->fields['usename']);
						$users2->moveNext();
						if(!$users2->EOF) echo ', ';
					}?>
				</td>
			</tr>
		</table>
		
		<?php
		
		$navlinks = array (
			array (
				'attr'=> array (
					'href' => array (
						'url' => 'plugin.php',
						'urlvars' => array (
							'plugin' => $this->name, 
							'server' => field('server'),
							'database' => field('database'),
							'schema' => field('schema'),
							'erdiagram_id' => $diagram->id,
							'action' => 'show_create_edit'
						)
					)
				),
				'content' => $this->_('stredit') 
			),
			array (
				'attr'=> array (
					'href' => array (
						'url' => 'plugin.php',
						'urlvars' => array (
							'plugin' => $this->name, 
							'server' => field('server'),
							'database' => field('database'),
							'schema' => field('schema'),
							'confirm'=> 'true',
							'action' => 'drop'
						)
					)
				),
				'content' => $this->_('strdrop') 
			),
			array (
				'attr'=> array (
					'href' => array (
						'url' => 'plugin.php',
						'urlvars' => array (
							'plugin' => $this->name, 
							'server' => field('server'),
							'database' => field('database'),
							'schema' => field('schema'),
							'action' => 'open',
							'erdiagram_id' => $diagram->id
						)
					)
				),
				'content' => $this->_('stropen') 
			),
			array (
				'attr'=> array (
					'target' => '_blanck',
					'href' => array (
						'url' => 'plugin.php',
						'urlvars' => array (
							'plugin' => $this->name, 
							'server' => field('server'),
							'database' => field('database'),
							'schema' => field('schema'),
							'action' => 'open',
							'erdiagram_id' => $diagram->id
						)
					)
				),
				'content' => $this->_('stropeninnewtab') 
			),
		);
		$misc->printNavLinks($navlinks, 'dbdesigner-dbdesigner');
		
		$misc->printFooter();
	}
	
	function tree() {
        global $misc, $data;

		$diagrams = new ADORecordSet_empty();
		$attrs = array();
		
        if(ERDiagram::isSettedUp()){
            $diagrams = ERDiagram::get_list($this->conf['owned_diagrams_only']);

            $reqvars = $misc->getRequestVars();

            $attrs = array(
                'text'   => field('name'),
                'icon' => array('plugin' => $this->name, 'image' => 'ERDiagram'),
                'toolTip'=> field('comment'),
                'action' => url('plugin.php',
                    array(
						'plugin' => $this->name,
                        'action' => 'show_diagram',
                        'erdiagram_id' => field('erdiagram_id')
                    ),
                    $reqvars
                ),
            );
        }
        $misc->printTreeXML($diagrams, $attrs);
        exit;
    }
	
	function show_drop(){
		global $misc;
		
		if (empty($_REQUEST['erdiagram_id']) && empty($_REQUEST['ma'])) {
			$this->show_default($this->_('strspecifyerdiagramtodrop'));
            exit;
        }
		
		
		$misc->printHeader($this->_('strerdiagrams'));
		$misc->printBody();
		$misc->printTrail('schema');
		$misc->printTabs('schema','show_default');
		$misc->printTitle($this->_('strdroperdiagram'));
		
		echo '<form action="plugin.php?plugin='.$this->name.'" method="post">';
		
		
		if (isset($_REQUEST['ma'])) {
			foreach($_REQUEST['ma'] as $v) {
				$a = unserialize(htmlspecialchars_decode($v, ENT_QUOTES));
				$diagram = ERDiagram::load($a['erdiagram_id']);
				if(!is_null($diagram)){
					echo '<p>'.sprintf($this->_('strconfdroperdiagram'), $misc->printVal($diagram->name)).'</p>';
					printf('<input type="hidden" name="erdiagram_id[]" value="%s" />', htmlspecialchars($a['erdiagram_id']));
				}
			}
		}
		else {

			$diagram = ERDiagram::load($_REQUEST['erdiagram_id']);
			if(!is_null($diagram)){
				echo '<p>'.sprintf($this->_('strconfdroperdiagram'), $misc->printVal($diagram->name)).'</p>';
				printf('<input type="hidden" name="erdiagram_id" value="%s" />', htmlspecialchars($_REQUEST['erdiagram_id']));
			}
		}// END if multi drop

		echo '<input type="hidden" name="action" value="drop" />';
		echo $misc->form;

		echo '<input type="submit" name="drop" value="'.$this->_('strdrop').'" />';
		echo '<input type="submit" name="cancel" value="'.$this->_('strcancel').'" />';
		echo '</form>';
		
		
	}
	
	
	function drop(){
		$msg = '';
		if(!isset($_POST['cancel'])) {
			if (is_array($_REQUEST['erdiagram_id'])) {
                foreach($_REQUEST['erdiagram_id'] as $id) {
                    $diagram = ERDiagram::load($id);
					if(!is_null($diagram)) {
						$status = $diagram->drop();
						if ($status == 0){
							$_reload_browser = true;
							$msg.= sprintf('%s: %s<br />', htmlentities($diagram->name), $this->_('strerdiagramdropped'));
						}else
							$msg.= sprintf('%s: %s<br />', htmlentities($diagram->name), $this->_('strerdiagramdroppedbad'));
					}
                }
            } else {
				$diagram = new ERDiagram();
				$diagram->id = $_POST['erdiagram_id'];
                $status = $diagram->drop();
                if ($status == 0) {
                    $_reload_browser = true;
					$msg = $this->_('strerdiagramdropped');
                }
                else
                    $msg = $this->_('strerdiagramdroppedbad');
            }
		}
		$this->show_default($msg);
	}
	
	function open(){
		global $misc, $_no_bottom_link, $data;
		$scripts = '';
		
		$diagram = ERDiagram::load_from_request();
		if(is_null($diagram) || $diagram->id === 0) {
			$this->show_default();
			exit;
		}
		
		$scripts .= '<link rel="stylesheet" type="text/css" href="plugins/' . $this->name . '/css/dbdesigner.css" />';
		$scripts .= '<script type="text/javascript" src="plugins/' . $this->name . '/js/dbdesigner.js"></script>';
		
		ob_start(); ?>
			<script type="text/javascript">
				//<!--//--><![CDATA[//><!--
				DBDesigner.lang = <?php echo $this->get_js_language(); ?>;
				DBDesigner.maxNameLength = "<?php echo $data->_maxNameLen; ?>";
				DBDesigner.dataTypes = <?php echo $this->get_data_types(); ?>;
				DBDesigner.server = "<?php echo $_REQUEST["server"]; ?>";
				DBDesigner.database = "<?php echo $diagram->pg_database; ?>";
				DBDesigner.schema = "<?php echo $diagram->pg_schema; ?>";
				DBDesigner.erdiagramId = "<?php echo $diagram->id; ?>";
				DBDesigner.templateManager = <?php echo $this->get_template_manager(); ?>;
				DBDesigner.erdiagramStructure = <?php echo $diagram->get_structure(); ?>;
				DBDesigner.version = "<?php echo $this->version; ?>";
				DBDesigner.schemaName = "<?php echo $_GET['schema']; ?>";
				DBDesigner.databaseName = "<?php echo $_GET['database']; ?>";
				DBDesigner.pluginName = "<?php echo $this->name; ?>";
				DBDesigner.keepSessionAliveInterval = <?php echo $this->conf['keep_session_alive_interval']; ?>;
				
				//Disable the default stylesheet
				$(function(){
					$('head link[rel="stylesheet"][href$="global.css"]').prop('disabled', true);
					DBDesigner.init();
					$('#loading-msg').remove();
				});
				//--><!]]>
			</script>
		<?php $scripts .= ob_get_clean();
		
		$_no_bottom_link = TRUE;
		$misc->printHeader(htmlspecialchars($diagram->name), $scripts);
		$misc->printBody();
		echo "<noscript>{$this->_('strerdiagramnoscript')}</noscript>";
		echo '<p id="loading-msg">'.$this->_('strloading').'</p>';
		$misc->printFooter();
	}
	
	function get_template_manager(){
		global $data;
		$template_manager = array();
		require_once 'core/templates/index.php';
		return $this->json_encode($template_manager);
	}
	
	
	function get_data_types($json = TRUE){
        global $data;
        $types = $data->getTypes(true, false, true);
        $types_for_js = array();
        foreach ($data->extraTypes as $v) {
            $types_for_js[strtolower($v)] = 1;
        }
        while (!$types->EOF) {
            $typname = $types->fields['typname'];
            $types_for_js[$typname] = 1;
            $types->moveNext();
        }
        $predefined_size_types = array_intersect($data->predefined_size_types,array_keys($types_for_js));
        $unpredefined_size_types = array_diff(array_keys($types_for_js), $predefined_size_types);
        foreach($predefined_size_types as $value) {
			$escaped_types[] = array('typedef' => strtoupper($value), 'size_predefined' => TRUE);
        }
        foreach($unpredefined_size_types as $value) {
			$escaped_types[] = array('typedef' => strtoupper($value), 'size_predefined' => FALSE);
        }
		sort($escaped_types);
		
		if($json) return $this->json_encode($escaped_types);
		return $escaped_types;
    }
	
	function get_js_language(){
		$lang_keys = array(
			'stryes',
			'strname',
			'strok',
			'strremove',
			'stroptions',
			'strcomment',
			'strcancel',
			'strcreate',
			'strcreatetable',
			'strtableneedsname',
			'straddcolumn',
			'straddpk',
			'straddfk',
			'stradduniq',
			'straddcheck',
			'strsave',
			'strdrop',
			'strtype',
			'strprimarykey',
			'struniquekey',
			'strnotnull',
			'strlength',
			'strdefault',
			'stradd',
			'strproperties',
			'stralter',
			'strcolneedsname',
			'strcolumns',	
			'strreferences',		
			'strconfdroptable',	
			'strconfdropcolumn',	
			'strlogin',
			'strfkneedscols',
			'strdelete',
			'strarray',
			'straltertable',
			'straltercolumn',
			'stralterforeignkey',
			'strtableexists',
			'strcolexists',
			'strsort',
			'strinvalididentifier',
			'strforeignkeys',
			'strlocal',
			'strreferenced',
			'strreferencing',
			'strlocalcolumn',
			'strconfdroptables',
			'strconfdropconstraint',
			'strdropobject',
			'strsavingchanges',
			'strloadingschema',
			'strloggingout',
			'strajaxerrormsg',
			'strreverseengineer',
			'strforwardengineer',
			'strconstraintexists',
			'strswitchuser',
			'straligntables',
			'strconstraintneedsname',
			'strbadinteger',
			'strbadnumericlength',
			'strnographics',
			'strmoveup',
			'strmovedown',
			'struniqneedscols',
			'stralteruniq',
			'strempty',
			'strsaving',
			'strerdiagramsaved',
			'strexecutingsql',
			'strloadingschema',
			'strreverseengineerconflictmessage',
			'stryouhavenotselectedanytable',
			'strunexpectedserverresponse',
			'strservererror'
		);
		
		$js_lang = array();
		foreach ($lang_keys as $key){
			$js_lang[$key] = htmlspecialchars(html_entity_decode($this->_($key), ENT_NOQUOTES, $this->_('appcharset')));
		}
		return $this->json_encode($js_lang);
	}
	
	function json_encode($data){
		if(!function_exists('json_encode')){
			require_once 'classes/JSON.php';
			$value = new Services_JSON();
			return $value->encode($data);
		}
		return json_encode($data);
	}
	
	function jsonDecode($data){
		if(!function_exists('json_decode')){
			require_once 'classes/JSON.php';
			$value = new Services_JSON();
			return $value->decode($data);
		}
		return json_decode($data);
	}
	
	function ajaxSave(){
		$diagram_id = intval($_POST['erdiagram_id']);
		$ret = ERDiagram::update_diagram_structure($diagram_id, $_POST['data']);
		$this->send_ajax_response($ret);
	}
	
	function ajaxExecuteSQL(){
		global $data;
		ob_start();
		$data->conn->setFetchMode(ADODB_FETCH_NUM);
		$rs = $data->conn->Execute($_POST['sql']);
		if(is_object($rs)) {
			echo "<p>{$this->_('strsqlexecuted')}</p>\n";
		}
		$this->send_ajax_response(ob_get_clean());
	}
	
	function ajaxLoadSchemaStructure(){
		$schema = ERDiagram::load_current_schema();
		$this->send_ajax_response($schema);
	}
	
	function ajaxKeepSessionAlive(){
		$this->send_ajax_response();
	}

	function send_ajax_response($data = NULL){
		$response = new stdClass();
		$response->action = $_REQUEST['action'];
		if(!is_null($data)){ $response->data = $data; }
		echo $this->json_encode($response);
	}
}
