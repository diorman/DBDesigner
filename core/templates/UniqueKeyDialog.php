<?php ob_start(); ?>
	<div class="uniquekey-dialog">
		<ul class="error-list hide"></ul>
		<div class="field-text">
			<label class="label" for="uniquekey-dialog_uniquekey-name"><?php echo $this->_('strname'); ?></label>
			<input class="focusable" type="text" id="uniquekey-dialog_table-name" maxlength="<?php echo $data->_maxNameLen; ?>" />
			<div class="clear"></div>
		</div>
		<div class="field-multiselection">
			<div class="layout-select">
				<label for="uniquekey-dialog_available-columns" class="label"><?php echo $this->_('strtablecolumnlist') ?></label>
				<select id="uniquekey-dialog_available-columns" multiple="multiple" size="10"></select>
			</div>
			<div class="layout-buttons">
				<input type="button" id="uniquekey-dialog_remove-columns" class="update-columns" value="<<" />
				<input type="button" id="uniquekey-dialog_add-columns" class="update-columns" value=">>" />
			</div>
			<div class="layout-select">
				<label for="uniquekey-dialog_selected-columns" class="label"><?php echo $this->_('strindexcolumnlist') ?></label>
				<select id="uniquekey-dialog_selected-columns" multiple="multiple" size="10"></select>
			</div>
			<div class="clear"></div>
		</div>
		<div class="field-textarea">
			<label class="label" for="uniquekey-dialog_uniquekey-comment"><?php echo $this->_('strcomment'); ?></label>
			<textarea id="uniquekey-dialog_uniquekey-comment"></textarea>
			<div class="clear"></div>
		</div>
		<div class="buttons-placeholder submit-buttons">
			<input type="button" id="uniquekey-dialog_save" value="<?php echo $this->_('strsave'); ?>" />
			<input type="button" id="uniquekey-dialog_save2" value="<?php echo $this->_('strsaveandnew'); ?>" />
			<input type="button" id="uniquekey-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
		</div>
	</div>
<?php $templateManager['UniqueKeyDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>