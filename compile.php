<?php

include_once 'conf/dbdesigner.config.inc.php';


function concat($o, $fs){
	$content = '';
	foreach ($fs as $f) { $content .= file_get_contents($f); }
	file_put_contents($o, $content);
}

function concatCSS($c) {
	$o = 'css/dbdesigner.css';
	$fs = array(
		'css/reset.css',
		'css/'.DBDesignerConfig::jqueryUiTheme,
		'css/'.DBDesignerConfig::theme
	);
	if($c) {
		echo "Compiling Stylesheet\n";
		exec('java -jar compilers/closure-stylesheets.jar '.implode(' ', $fs).' > '.$o);
	}else {
		echo "Generating Stylesheet\n";
		concat($o, $fs);
	}
}
function concatJS($c) {
	$o = 'js/dbdesigner.js';
	$fs = array(

		//jquery & plugins
		'js/'.DBDesignerConfig::jquery,
		'js/'.DBDesignerConfig::jqueryUi,
		'js/jquery.json-2.4.min.js',
		'js/jquery.multidraggable.js',

		//classes
		'core/classes/Ajax.js',
		'core/classes/JSONLoader.js',
		'core/classes/EventDispatcher.js',
		'core/classes/Component.js',
		'core/classes/ComponentUI.js',
		'core/classes/ComponentModel.js',
		'core/classes/Vector.js',
		'core/classes/DBDesigner.js',
		'core/classes/ToolBar.js',
		'core/classes/Canvas.js',
		'core/classes/ObjectDetail.js',
		'core/classes/DBObjectDialog.js',
		'core/classes/TableDialog.js',
		'core/classes/ColumnDialog.js',
		'core/classes/DBObject.js',
		'core/classes/Table.js',
		'core/classes/Column.js',
		'core/classes/TableCollection.js',
		'core/classes/ConstraintHelper.js',
		'core/classes/ColumnCollection.js',
		'core/classes/ForeignKeyCollection.js',
		'core/classes/ForeignKey.js',
		'core/classes/ForeignKeyDialog.js',
		'core/classes/UniqueKeyCollection.js',
		'core/classes/UniqueKey.js',
		'core/classes/UniqueKeyDialog.js',
		'core/classes/Const.js',
		'core/classes/Helper.js',
		'core/classes/ConfirmDialog.js'
	);
	if($c) {
		echo "Compiling Javascript\n";
		exec('java -jar compilers/compiler.jar --js '. implode(' ', $fs).' > '.$o);
	}else {
		echo "Generating Javascript\n";
		concat($o, $fs);
	}
}

$css = false;
$js = false;

foreach($argv as $a) {
	switch ($a){
		case '-js': if(!$js) { concatJS(false); $js = true; } break;
		case '-jsc': if(!$js) { concatJS(true); $js = true; } break;
		case '-css': if(!$css) { concatCSS(false); $css = true; } break;
		case '-cssc': if(!$css) { concatCSS(true); $css = true; } break;
	}
}

if(!$css && !$js) {
	concatCSS(false);
	concatJS(false);
}

?>