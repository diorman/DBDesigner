<?php ob_start(); ?>
	<div class="reverseengineer-dialog">
		<div class="hide-output">
			<div class="field-multiselection">
				<div class="layout-select">
					<label for="reverseengineer-dialog_available-tables" class="label"><?php echo $this->_('strtablesinschema') ?></label>
					<select id="reverseengineer-dialog_available-tables" multiple="multiple" size="15"></select>
				</div>
				<div class="layout-buttons">
					<input type="button" id="reverseengineer-dialog_remove-tables" class="update-tables" value="<<" />
					<input type="button" id="reverseengineer-dialog_add-tables" class="update-tables" value=">>" />
				</div>
				<div class="layout-select">
					<label for="reverseengineer-dialog_selected-tables" class="label"><?php echo $this->_('strselectedtables') ?></label>
					<select id="reverseengineer-dialog_selected-tables" multiple="multiple" size="15"></select>
				</div>
				<div class="clear"></div>
			</div>
		</div>
		<div id="reverseengineer-dialog_output" class="show-output output-text"></div>
		<div class="buttons-placeholder submit-buttons">
			<input type="button" id="reverseengineer-dialog_ok" class="hide-output" value="<?php echo $this->_('strok'); ?>" />
			<input type="button" id="reverseengineer-dialog_show-output" class="hide-output" value="<?php echo $this->_('stroutput'); ?>" />
			<input type="button" id="reverseengineer-dialog_hide-output" class="show-output" value="<?php echo $this->_('strhide'); ?>" />
			<input type="button" id="reverseengineer-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
		</div>
	</div>
<?php $templateManager['ReverseEngineerDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>