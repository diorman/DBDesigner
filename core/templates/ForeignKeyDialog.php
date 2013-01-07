<?php ob_start(); ?>
	<div class="foreignkey-dialog">
		<ul class="error-list hide"></ul>
		
		<div class="tabs">
		
			<ul>
				<li><a href="#foreignkey-dialog_properties-tab">Properties</a></li>
				<li><a href="#foreignkey-dialog_columns-tab">Columns</a></li>
			</ul>
		
			<div id="foreignkey-dialog_properties-tab">
			
				<div class="field-text">
					<label class="label" for="foreignkey-dialog_foreignkey-name"><?php echo $this->_('strname'); ?></label>
					<input class="focusable" type="text" id="foreignkey-dialog_foreignkey-name" maxlength="<?php echo $data->_maxNameLen; ?>" />
					<div class="clear"></div>
				</div>
				<div class="field-select">
					<label class="label" for="foreignkey-dialog_foreignkey-references"><?php echo $this->_('strreferences'); ?></label>
					<select id="foreignkey-dialog_foreignkey-references"></select>
					<div class="clear"></div>
				</div>
				<div class="field-select">
					<label class="label" for="foreignkey-dialog_foreignkey-updateaction">ON UPDATE</label>
					<select id="foreignkey-dialog_foreignkey-updateaction">
						<option value="a">NO ACTION</option>
						<option value="r">RESTRICT</option>
						<option value="c">CASCADE</option>
						<option value="n">SET NULL</option>
						<option value="d">SET DEFAULT</option>
					</select>
					<div class="clear"></div>
				</div>
				<div class="field-select">
					<label class="label" for="foreignkey-dialog_foreignkey-deleteaction">ON DELETE</label>
					<select id="foreignkey-dialog_foreignkey-deleteaction">
						<option value="a">NO ACTION</option>
						<option value="r">RESTRICT</option>
						<option value="c">CASCADE</option>
						<option value="n">SET NULL</option>
						<option value="d">SET DEFAULT</option>
					</select>
					<div class="clear"></div>
				</div>
				<div class="field-check">
					<label class="label" for="foreignkey-dialog_foreignkey-matchfull">MATCH FULL</label>
					<input type="checkbox" id="foreignkey-dialog_foreignkey-matchfull" />
					<div class="clear"></div>
				</div>
				<div class="field-check">
					<label class="label" for="foreignkey-dialog_foreignkey-deferrable">DEFERRABLE</label>
					<input type="checkbox" id="foreignkey-dialog_foreignkey-deferrable" />
					<div class="clear"></div>
				</div>
				<div class="field-check">
					<label class="label" for="foreignkey-dialog_foreignkey-deferred">DEFERRED</label>
					<input type="checkbox" id="foreignkey-dialog_foreignkey-deferred" />
					<div class="clear"></div>
				</div>
				<div class="field-textarea">
					<label class="label" for="foreignkey-dialog_foreignkey-comment"><?php echo $this->_('strcomment'); ?></label>
					<textarea id="foreignkey-dialog_foreignkey-comment"></textarea>
					<div class="clear"></div>
				</div>
			</div>
			<div id="foreignkey-dialog_columns-tab">

				<table>
					<thead>
						<tr>
							<th><?php echo $this->_('strlocalcolumn'); ?></th>
							<th><?php echo $this->_('strreferencing'); ?></th>
							<th class="remove">&nbsp;</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>

				<div class="field-select">
					<label class="label" for="foreignkey-dialog_foreignkey-localcolumn"><?php echo $this->_('strlocalcolumn'); ?></label>
					<select id="foreignkey-dialog_foreignkey-localcolumn"></select>
					<div class="clear"></div>
				</div>
				<div class="field-select">
					<label class="label" for="foreignkey-dialog_foreignkey-referencedcolumn"><?php echo $this->_('strreferencing'); ?></label>
					<select id="foreignkey-dialog_foreignkey-referencedcolumn"></select>
					<div class="clear"></div>
				</div>
				<div class="buttons-placeholder">
					<input type="button" id="foreignkey-dialog_addcolumns" value="<?php echo $this->_('stradd'); ?>" />
				</div>
			</div>
		</div>
		<div class="buttons-placeholder submit-buttons">
			<input type="button" id="foreignkey-dialog_save" value="<?php echo $this->_('strsave'); ?>" />
			<input type="button" id="foreignkey-dialog_save2" value="<?php echo $this->_('strsaveandnew'); ?>" />
			<input type="button" id="foreignkey-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
		</div>
	</div>
<?php $templateManager['ForeignKeyDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>