<?php ob_start(); ?>
	<div class="fordwardengineer-dialog">
		<div class="hide-output">
			<div class="field-check">
				<label class="label" for="fordwardengineer-dialog_filter-selected-tables"><?php echo $this->_('stronlyselectedtables'); ?></label>
				<input type="checkbox" id="fordwardengineer-dialog_filter-selected-tables" />
				<div class="clear"></div>
			</div>

			<div class="field-check">
				<label class="label" for="fordwardengineer-dialog_dropstmt"><?php echo $this->_('strgeneratedropstmt'); ?></label>
				<input type="checkbox" id="fordwardengineer-dialog_dropstmt" />
				<div class="clear"></div>
			</div>

			<div class="field-check">
				<label class="label" for="fordwardengineer-dialog_cascadeprmt"><?php echo $this->_('strgeneratecascadeprmt'); ?></label>
				<input type="checkbox" id="fordwardengineer-dialog_cascadeprmt" />
				<div class="clear"></div>
			</div>
			<div class="field-textarea">
				<textarea id="forwardengineer-dialog_script" class="hide-output" ></textarea>
				<div class="clear"></div>
			</div>
		</div>
		<div id="forwardengineer-dialog_output" class="show-output output-text"></div>
		<div class="buttons-placeholder">
			<input type="button" id="forwardengineer-dialog_generate" class="hide-output" value="<?php echo $this->_('strgenerate'); ?>" />
			<input type="button" id="forwardengineer-dialog_execute" class="hide-output" value="<?php echo $this->_('strexecute'); ?>" />
			<input type="button" id="forwardengineer-dialog_show-output" class="hide-output" value="<?php echo $this->_('stroutput'); ?>" />
			<input type="button" id="forwardengineer-dialog_hide-output" class="show-output" value="<?php echo $this->_('strhide'); ?>" />
			<input type="button" id="forwardengineer-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
		</div>
	</div>
<?php $template_manager['ForwardEngineerDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>