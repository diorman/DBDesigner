<?php ob_start(); ?>
	<div class="confirm-dialog">
		<div class="content"></div>
		<div class="buttons-placeholder">
			<input type="button" id="confirm-dialog_yes" value="<?php echo $this->_('stryes'); ?>" />
			<input type="button" id="confirm-dialog_no" value="<?php echo $this->_('strno'); ?>" />
		</div>
	</div>
<?php $template_manager['ConfirmDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>