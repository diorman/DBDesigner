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
		<div class="buttons-placeholder">
			<input type="button" id="table-dialog_save" value="<?php echo $this->_('strsave'); ?>" />
			<input type="button" id="table-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
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

<?php /******************** Column Dialog Template **/ ?>
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
				<?php foreach($this->getDataTypes(FALSE) as $dataType): ?>
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
			<label class="label" for="column-dialog_column-uniquekey"><?php echo $this->_('struniquekey'); ?></label>
			<input type="checkbox" id="column-dialog_column-uniquekey" />
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
		<div class="buttons-placeholder">
			<input type="button" id="column-dialog_save" value="<?php echo $this->_('strsave'); ?>" />
			<input type="button" id="column-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
		</div>
	</div>
<?php $templateManager['ColumnDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>


<?php /******************** Column Template **/ ?>
<?php $templateManager['Column'] = '<div class="db-column"><span class="keys"></span><span class="definition"></span></div>'; ?>

<?php /******************** Column Dialog Template **/ ?>
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
		<div class="buttons-placeholder">
			<input type="button" id="foreignkey-dialog_save" value="<?php echo $this->_('strsave'); ?>" />
			<input type="button" id="foreignkey-dialog_cancel" value="<?php echo $this->_('strcancel'); ?>" />
		</div>
	</div>
<?php $templateManager['ForeignKeyDialog'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>