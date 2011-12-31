<?php
require_once 'classes/Plugin.php';
require_once 'plugins/DBDesigner/classes/ERDiagram.php';
require_once 'plugins/DBDesigner/conf/dbdesigner.config.inc.php';


class DBDesigner extends Plugin {

	/**
	 * Attributes
	 */
	protected $name = 'DBDesigner';
	protected $lang;

	/**
	 * Constructor
	 * Call parent constructor, passing the language that will be used.
	 * @param $language Current phpPgAdmin language. If it was not found in the plugin, English will be used.
	 */
	function __construct($language) {
		global $data, $lang, $misc;
		
		if(!is_null($data)) ERDiagram::setUpDrivers();
		parent::__construct($language);
		
		
		if(isset($_REQUEST['plugin']) && $_REQUEST['plugin'] == $this->name && (!isset($_REQUEST['action']) || empty($_REQUEST['action']))){
			//Set default action in case of empty action
			$_REQUEST['action'] = 'showDefault';				
		}
	}

	
	function _($langkey){
		global $lang;
		if(isset($this->lang[$langkey])) return $this->lang[$langkey];
		return $lang[$langkey];
	}
	
	function checkInstallation(){
		if(!ERDiagram::isSettedUp()){
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
		if(!ERDiagram::isSettedUp()) return array('showDefault', 'tree');
		
		$actions = array(
			'showDefault',
			'showCreateEdit',
			'showDiagram',
			'showDrop',
			'save',
			'tree',
			'drop',
			'open',
		);
		return $actions;
	}

	/**
	 * Add plugin in the tabs
	 * @param $plugin_functions_parameters
	 */
	function add_plugin_tabs(&$plugin_functions_parameters) {
		global $misc;

		$tabs = &$plugin_functions_parameters['tabs'];

		switch ($plugin_functions_parameters['section']) {
			case 'schema':
				$tabs['showDefault'] = array (
					'title' => $this->_('strerdiagrams'),
					'url' => 'plugin.php',
					'urlvars' => array(
						'subject' => 'server', 
						'database' => $_REQUEST['database'],
						'schema' => $_REQUEST['schema'],
						'action' => 'showDefault', 
						'plugin' => $this->name),
					'hide' => false,
					'icon' => array('plugin' => 'DBDesigner', 'image' => 'ERDiagrams')
				);
				break;
		}
	}

	function showDefault($msg = '') {
        global $misc;
		$this->checkInstallation();
		$misc->printHeader($this->_('strerdiagrams'));
		$misc->printBody();
        $misc->printTrail('schema');
		$misc->printTabs('schema','showDefault');
        $misc->printMsg($msg);

        $diagrams = ERDiagram::getList();

        $columns = array(
            'erdiagram' => array(
                'title' => $this->_('strerdiagram'),
                'field' => field('name'),
                'url' => "plugin.php?plugin={$this->name}&amp;action=showDiagram&amp;{$misc->href}&amp;",
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
                'url'   => "plugin.php?plugin={$this->name}&amp;action=showCreateEdit&amp;{$misc->href}&amp;",
                'vars'  => array('erdiagram_id' => 'erdiagram_id'),
            ),
            'drop' => array(
                'title' => $this->_('strdrop'),
                'url'   => "plugin.php?plugin={$this->name}&amp;action=showDrop&amp;{$misc->href}&amp;",
                'vars'  => array('erdiagram_id' => 'erdiagram_id'),
                'multiaction' => 'showDrop',
            ),
            'open' => array(
                'title' => $this->_('stropen'),
                'url'   => "plugin.php?plugin={$this->name}&amp;action=open&amp;{$misc->href}&amp;",
                'vars'  => array('erdiagram_id' => 'erdiagram_id'),
            ),
            'opennewwindow' => array(
                'title' => $this->_('stropeninnewwindow'),
                'url'   => "plugin.php?plugin={$this->name}&amp;action=open&amp;new_window=true&amp;{$misc->href}&amp;",
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
							'action' => 'showCreateEdit')
					)
				),
				'content' => $this->_('strcreateerdiagram') 
			)
		);
		$misc->printNavLinks($navlinks, 'dbdesigner-dbdesigner');
		
		$misc->printFooter();
	}
	
	function showCreateEdit($msg = ''){
		global $data, $misc;
		$diagram = ERDiagram::loadFromRequest();
		
		if(is_null($diagram)){
			$this->showDefault ();
			exit;
		}

		$misc->printHeader($this->_('strerdiagrams'));
		$misc->printBody();
        $misc->printTrail('schema');
		$misc->printTabs('schema','showDefault');
		$misc->printTitle(($diagram->id == 0)? $this->_('strcreateerdiagram'): $this->_('strediterdiagram'));
        $misc->printMsg($msg);

        //Due owner always have privileges, he is removed from select controls
		$temp = array_merge($diagram->rolesWithPrivileges, array($diagram->owner));
		
        //Get users/groups wich are and are not a part of users/groups with privileges for the current diagram
        $users1 = ERDiagram::getUsers("*", $temp);
        $users2 = ERDiagram::getUsers($diagram->rolesWithPrivileges, $diagram->owner);
        $groups1 = ERDiagram::getGroups("*", $diagram->rolesWithPrivileges);
        $groups2 = ERDiagram::getGroups($diagram->rolesWithPrivileges);?>
		
		<script src="plugins/DBDesigner/js/erdiagrams.js" type="text/javascript"></script>
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
		if(isset($_POST['cancel'])) $this->showDefault();
		else {
			$diagram = ERDiagram::loadFromRequest();
			if(empty ($diagram->name)) $this->showCreateEdit($this->_('strerdiagramneedsname'));
			else {
				$success_msg = ($diagram->id == 0)? $this->_('strerdiagramcreated') : $this->_('strerdiagramaltered');
				$fail_msg = ($diagram->id == 0)? $this->_('strerdiagramcreatedbad'): $this->_('strerdiagramalteredbad');
				
				$status = $diagram->save();
				if ($status == 0){
					global $_reload_browser;
					$_reload_browser = true;
					$this->showDefault($success_msg);
				}else
					$this->showCreateEdit($fail_msg);
			}
		}
	}
	
	function showDiagram(){
		global $data, $misc;
		$diagram = ERDiagram::loadFromRequest();
		
		if(is_null($diagram)){
			$this->showDefault ();
			exit;
		}

		$misc->printHeader($this->_('strerdiagrams'));
		$misc->printBody();
        $misc->printTrail('schema');
		$misc->printTabs('schema','showDefault');
		$misc->printTitle($this->_('strerdiagramproperties'));

        //Due owner always have privileges, he is removed from select controls
		$temp = array_merge($diagram->rolesWithPrivileges, array($diagram->owner));
		
        //Get users/groups wich are and are not a part of users/groups with privileges for the current diagram
        $users1 = ERDiagram::getUsers("*", $temp);
        $users2 = ERDiagram::getUsers($diagram->rolesWithPrivileges, $diagram->owner);
        $groups1 = ERDiagram::getGroups("*", $diagram->rolesWithPrivileges);
        $groups2 = ERDiagram::getGroups($diagram->rolesWithPrivileges);
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
							'action' => 'showCreateEdit'
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
							'action' => 'open'
						)
					)
				),
				'content' => $this->_('stropen') 
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
							'new_window' => 'true',
							'action' => 'open'
						)
					)
				),
				'content' => $this->_('stropeninnewwindow') 
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
            $diagrams = ERDiagram::getList();

            $reqvars = $misc->getRequestVars();

            $attrs = array(
                'text'   => field('name'),
                'icon' => array('plugin' => 'DBDesigner', 'image' => 'ERDiagram'),
                'toolTip'=> field('comment'),
                'action' => url('plugin.php',
                    array(
						'plugin' => $this->name,
                        'action' => 'showDiagram',
                        'erdiagram_id' => field('erdiagram_id')
                    ),
                    $reqvars
                ),
            );
        }
        $misc->printTreeXML($diagrams, $attrs);
        exit;
    }
	
	function showDrop(){
		global $misc;
		
		if (empty($_REQUEST['erdiagram_id']) && empty($_REQUEST['ma'])) {
			$this->showDefault($this->_('strspecifyerdiagramtodrop'));
            exit;
        }
		
		
		$misc->printHeader($this->_('strerdiagrams'));
		$misc->printBody();
		$misc->printTrail('schema');
		$misc->printTabs('schema','showDefault');
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
		$this->showDefault($msg);
	}
	
	function open(){
		global $misc, $_no_bottom_link, $data;
		$scripts = '';
		
		$diagram = ERDiagram::loadFromRequest();
		if(is_null($diagram)) {
			$this->showDefault();
			exit;
		}
		
		$templateManager = $this->getTemplateManager();
		
		$scripts .= '<link rel="stylesheet" type="text/css" href="plugins/DBDesigner/css/reset.css" />';
		$scripts .= '<link rel="stylesheet" type="text/css" href="'.DBDesignerConfig::jqueryUiTheme.'" />';
		$scripts .= '<link rel="stylesheet" type="text/css" href="'.DBDesignerConfig::theme.'" />';
		
		$scripts .= '<script type="text/javascript" src="'.DBDesignerConfig::jquery.'"></script>';
		$scripts .= '<script type="text/javascript" src="'.DBDesignerConfig::jqueryUi.'"></script>';
		$scripts .= '<script type="text/javascript" src="plugins/DBDesigner/js/jquery.multidraggable.js"></script>';
		$scripts .= '<script type="text/javascript" src="'.DBDesignerConfig::dbdesignerJS.'"></script>';
		
		ob_start(); ?>
			<script type="text/javascript">
				//<!--//--><![CDATA[//><!--
				DBDesigner.lang = <?php echo $this->getJSLanguage(); ?>;
				DBDesigner.maxNameLength = "<?php echo $data->_maxNameLen; ?>";
				DBDesigner.dataTypes = <?php echo $this->getDataTypes(); ?>;
				DBDesigner.server = "<?php echo $_REQUEST["server"]; ?>";
				DBDesigner.database = "<?php echo $diagram->pgDatabase; ?>";
				DBDesigner.schema = "<?php echo $diagram->pgSchema; ?>";
				DBDesigner.erdiagramId = "<?php echo $diagram->id; ?>";
				DBDesigner.templateManager = <?php echo $templateManager; ?>;
				
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
	
	function getTemplateManager(){
		global $data;
		$templateManager = array();
		require_once 'plugins/DBDesigner/core/templateManager.php';
		return $this->jsonEncode($templateManager );
	}
	
	
	function getDataTypes($json = TRUE){
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
        $escaped_predef_types = array(); // the JS escaped array elements
        foreach($predefined_size_types as $value) {
			$escaped_types[] = array('typedef' => strtoupper($value), 'size_predefined' => TRUE);
        }
        foreach($unpredefined_size_types as $value) {
			$escaped_types[] = array('typedef' => strtoupper($value), 'size_predefined' => FALSE);
        }
		sort($escaped_types);
		
		if($json) return $this->jsonEncode($escaped_types);
		return $escaped_types;
    }
	
	function getJSLanguage(){
		$lang_keys = array(
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
			'strconfdropforeignkey',
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
			'strnographics'
		);
		
		$js_lang = array();
		foreach ($lang_keys as $key){
			$js_lang[$key] = htmlspecialchars(html_entity_decode($this->_($key), ENT_NOQUOTES, $this->_('appcharset')));
		}
		return $this->jsonEncode($js_lang);
	}
	
	function jsonEncode($data){
		if(!function_exists('json_encode')){
			require_once 'plugins/DBDesigner/classes/JSON.php';
			$value = new Services_JSON();
			return $value->encode($data);
		}
		return json_encode($data);
	}
	
	function jsonDecode($data){
		if(!function_exists('json_decode')){
			require_once 'plugins/DBDesigner/classes/JSON.php';
			$value = new Services_JSON();
			return $value->decode($data);
		}
		return json_decode($data);
	}
}
