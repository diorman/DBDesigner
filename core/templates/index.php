<?php 
	include_once 'ToolBar.php';
	include_once 'ObjectDetail.php';
	include_once 'TableDialog.php';
	include_once 'Table.php';
	include_once 'ColumnDialog.php';
	include_once 'ForeignKeyDialog.php';
	include_once 'UniqueKeyDialog.php';
	include_once 'AlertDialog.php';
	include_once 'ConfirmDialog.php';
	include_once 'ForwardEngineerDialog.php';
	include_once 'ReverseEngineerDialog.php';
	
	$template_manager['Column'] = '<div class="db-column"><span class="keys"></span><span class="definition"></span></div>';
	$template_manager['Canvas'] = '<div id="canvas" class="canvas"><div class="inner-canvas"></div></div>';
?>