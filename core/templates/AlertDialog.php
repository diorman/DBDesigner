<?php ob_start(); ?>
	<div class="alert-dialog">
		<div class="content"></div>
		<div class="buttons-placeholder">
			<input type="button" id="alert-dialog_ok" value="<?php echo $this->_('strok'); ?>" />
		</div>
	</div>
<?php $templateManager['AlertDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>