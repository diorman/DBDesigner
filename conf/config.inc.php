<?php

	$plugin_conf = array(
		'plugin_version' => '1.1',
		'plugin_name' => 'DBDesigner',
		
		'database' => 'phppgadmin',
		'schema' => 'dbdsgnr',
		'table' => 'erdiagrams',
		
		'jquery' => 'jquery-1.8.3.min.js',
		'jquery_ui' => 'jquery-ui-1.9.2.custom.min.js',
		'jquery_ui_theme' => 'jquery-ui-1.9.2.custom.min.css',
		'theme' => 'default_theme.css',
		
		// Interval in seconds to call the server to prevent the session from expiring
		'keep_session_alive_interval' => 20,
		
		// If true, just diagrams owned by the current user will be listed
		'owned_diagrams_only' => false,
	);
