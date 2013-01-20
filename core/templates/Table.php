<?php ob_start(); ?>
	<div class="db-table ui-corner-all">
		<div class="header">
			<span class="title"></span>
			<a href="#" class="button collapse-button ui-state-default ui-corner-all" title="<?php echo $this->_('strcollapse').'/'.$this->_('strexpand'); ?>"><span class="ui-icon ui-icon-circle-triangle-s" ><?php echo $this->_('strcollapse').'/'.$this->_('strexpand'); ?></span></a>
			<a href="#" class="button properties-button ui-state-default ui-corner-all" title="<?php echo $this->_('strproperties'); ?>"><span class="ui-icon ui-icon-wrench"><?php echo $this->_('strproperties'); ?></span></a>
		</div>
		<div class="column-container">
		</div>
	</div>
<?php $template_manager['Table'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>