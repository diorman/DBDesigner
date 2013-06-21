<?php

	$plugin_conf = array(
		'database' => 'phppgadmin',
		'schema' => 'dbdsgnr',
		'table' => 'erdiagrams',
		
		// Interval in seconds to call the server to prevent the session from expiring
		'keep_session_alive_interval' => 20,
		
		// If true, just diagrams owned by the current user will be listed
		'owned_diagrams_only' => FALSE,
	);
