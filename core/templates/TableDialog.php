<?php ob_start(); ?>
	<div class="table-dialog">
		<ul class="error-list hide"></ul>
		<div class="field-text required">
			<label class="label" for="table-dialog_table-name"><?php echo $this->_('strname'); ?></label>
			<input class="focusable" type="text" id="table-dialog_table-name" maxlength="<?php echo $data->_maxNameLen; ?>" />
			<div class="clear"></div>
		</div>
		<div class="field-check">
			<span class="label"><?php echo $this->_('stroptions'); ?></span>
			<label for="table-dialog_withoutoids">WITHOUT OIDS</label>
			<input type="checkbox" id="table-dialog_withoutoids" checked="checked" />
			<div class="clear"></div>
		</div>
		<div class="field-textarea">
			<label class="label" for="table-dialog_table-comment"><?php echo $this->_('strcomment'); ?></label>
			<textarea id="table-dialog_table-comment"></textarea>
			<div class="clear"></div>
		</div>
		<div class="buttons-placeholder submit-buttons">
			<input type="button" id="table-dialog_save" value="<?php echo $this->_('strsave'); ?>" />
			<input type="button" id="table-dialog_save2" value="<?php echo $this->_('strsaveandnew'); ?>" />
			<input type="button" id="table-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
		</div>
	</div>
<?php $templateManager['TableDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>