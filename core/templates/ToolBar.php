<?php ob_start(); ?>
	<div class="tool-bar">
		<ul>
			<li>
				<a href="#" class="button select ui-state-default ui-corner-all" title="<?php echo $this->_('strselect'); ?>"><span><?php echo $this->_('strselect'); ?></span></a>
			</li>
			<li>
				<a href="#" class="button add-table ui-state-default ui-corner-all" title="<?php echo $this->_('strcreatetable'); ?>"><span><?php echo $this->_('strcreatetable'); ?></span></a>
			</li>
			<li>
				<a href="#" class="button add-column ui-state-default ui-corner-all" title="<?php echo $this->_('straddcolumn'); ?>"><span><?php echo $this->_('straddcolumn'); ?></span></a>
			</li>
			<li>
				<a href="#" class="button add-foreignkey ui-state-default ui-corner-all" title="<?php echo $this->_('straddfk'); ?>"><span><?php echo $this->_('straddfk'); ?></span></a>
			</li>
			<li>
				<a href="#" class="button add-uniquekey ui-state-default ui-corner-all" title="<?php echo $this->_('stradduniq'); ?>"><span><?php echo $this->_('stradduniq'); ?></span></a>
			</li>
			<li>
				<a href="#" class="button save ui-state-default ui-corner-all" title="<?php echo $this->_('strsave'); ?>"><span><?php echo $this->_('strsave'); ?></span></a>
			</li>
			<li>	
				<a href="#" class="button reverse-engineer ui-state-default ui-corner-all" title="<?php echo $this->_('strreverseengineer'); ?>"><span><?php echo $this->_('strreverseengineer'); ?></span></a>
			</li>
			<li>
				<a href="#" class="button forward-engineer ui-state-default ui-corner-all" title="<?php echo $this->_('strforwardengineer'); ?>"><span><?php echo $this->_('strforwardengineer'); ?></span></a>
			</li>
			<li>
				<a href="#" class="button drop-table ui-state-default ui-corner-all" title="<?php echo $this->_('strdrop'); ?>"><span><?php echo $this->_('strdrop'); ?></span></a>
			</li>
			<li>
				<a href="#" class="button align-tables ui-state-default ui-corner-all" title="<?php echo $this->_('straligntables'); ?>"><span><?php echo $this->_('straligntables'); ?></span></a>
			</li>
		</ul>
		<div class="clear"></div>
	</div>
<?php $templateManager['ToolBar'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>