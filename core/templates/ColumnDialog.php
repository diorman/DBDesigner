<?php ob_start(); ?>
	<div class="column-dialog">
		<ul class="error-list hide"></ul>
		<div class="field-text required">
			<label class="label" for="column-dialog_column-name"><?php echo $this->_('strname'); ?></label>
			<input class="focusable" type="text" id="column-dialog_column-name" maxlength="<?php echo $data->_maxNameLen; ?>" />
			<div class="clear"></div>
		</div>
		<div class="field-select required">
			<label class="label" for="column-dialog_column-type"><?php echo $this->_('strtype'); ?></label>
			<select type="text" id="column-dialog_column-type">
				<?php foreach($this->get_data_types(FALSE) as $dataType): ?>
					<option value="<?php echo htmlspecialchars($dataType['typedef']) ?>"><?php echo htmlspecialchars($dataType['typedef']) ?></option>
				<?php endforeach; ?>
			</select>
			<div class="clear"></div>
		</div>
		<div class="field-text">
			<label class="label" for="column-dialog_column-length"><?php echo $this->_('strlength'); ?></label>
			<input type="text" id="column-dialog_column-length" />
			<div class="clear"></div>
		</div>
		
		<div class="field-check">
			<label class="label" for="column-dialog_column-array"><?php echo $this->_('strarray'); ?></label>
			<input type="checkbox" id="column-dialog_column-array" />
			<div class="clear"></div>
		</div>
		
		<div class="field-check">
			<label class="label" for="column-dialog_column-primarykey"><?php echo $this->_('strprimarykey'); ?></label>
			<input type="checkbox" id="column-dialog_column-primarykey" />
			<div class="clear"></div>
		</div>
		
		<div class="field-check">
			<label class="label" for="column-dialog_column-notnull"><?php echo $this->_('strnotnull'); ?></label>
			<input type="checkbox" id="column-dialog_column-notnull" />
			<div class="clear"></div>
		</div>
		
		
		<div class="field-text">
			<label class="label" for="column-dialog_column-default"><?php echo $this->_('strdefault'); ?></label>
			<input type="text" id="column-dialog_column-default" />
			<div class="clear"></div>
		</div>
		<div class="field-textarea">
			<label class="label" for="column-dialog_column-comment"><?php echo $this->_('strcomment'); ?></label>
			<textarea id="column-dialog_column-comment"></textarea>
			<div class="clear"></div>
		</div>
		<div class="buttons-placeholder submit-buttons">
			<input type="button" id="column-dialog_save" value="<?php echo $this->_('strsave'); ?>" />
			<input type="button" id="column-dialog_save2" value="<?php echo $this->_('strsaveandnew'); ?>" />
			<input type="button" id="column-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
		</div>
	</div>
<?php $template_manager['ColumnDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>