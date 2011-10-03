<?php /******************** Tool Bar Template **/ ?> 
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

<?php /******************** Canvas Template **/ ?>
<?php $templateManager['Canvas'] = '<div id="canvas" class="canvas"><div class="inner-canvas"></div></div>'; ?>

<?php /******************** Object Detail Template **/ ?>
<?php ob_start(); ?>
	<div class="object-detail">
		<div class="title-bar">
			<span class="title"></span>
			<a href="#" class="button collapse-button ui-state-default ui-corner-all" title="<?php echo $this->_('strcollapse').'/'.$this->_('strexpand'); ?>" ><span class="ui-icon ui-icon-circle-triangle-s"><?php echo $this->_('strcollapse').'/'.$this->_('strexpand'); ?></span></a>
		</div>
		<div class="object-detail-tabs hide">
			<ul></ul>
		</div>
	</div>
<?php $templateManager['ObjectDetail'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>

<?php /******************** Table Dialog Template **/ ?>
<?php ob_start(); ?>
	<div class="table-dialog">
		<ul class="error-list hide"></ul>
		<div class="field-text table-name">
			<label class="label required" for="table-dialog_table-name"><?php echo $this->_('strname'); ?></label>
			<input class="focusable" type="text" id="table-dialog_table-name" maxlength="<?php echo $data->_maxNameLen; ?>" />
			<div class="clear"></div>
		</div>
		<div class="field-check table-option">
			<span class="label"><?php echo $this->_('stroptions'); ?></span>
			<label for="table-dialog_withoutoids">WITHOUT OIDS</label>
			<input type="checkbox" id="table-dialog_withoutoids" checked="checked" />
			<div class="clear"></div>
		</div>
		<div class="field-textarea table-comment">
			<label class="label" for="table-dialog_table-comment"><?php echo $this->_('strcomment'); ?></label>
			<textarea id="table-dialog_table-comment"></textarea>
			<div class="clear"></div>
		</div>
		<div class="buttons-placeholder">
			<input type="button" id="table-dialog_save" value="Save" />
			<input type="button" id="table-dialog_cancel" value="Cancel" />
		</div>
	</div>
<?php $templateManager['TableDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>

<?php /******************** Table Template **/ ?>
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
<?php $templateManager['Table'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>
