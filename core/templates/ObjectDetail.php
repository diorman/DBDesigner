<?php ob_start(); ?>
	<div class="object-detail">
		<div class="title-bar">
			<span class="title"></span>
			<a href="#" class="button collapse-button ui-state-default ui-corner-all" title="<?php echo $this->_('strcollapse').'/'.$this->_('strexpand'); ?>" ><span class="ui-icon ui-icon-circle-triangle-s"><?php echo $this->_('strcollapse').'/'.$this->_('strexpand'); ?></span></a>
		</div>
		<div class="object-detail-tabs hide">
			<ul>
				<li><a href="#od-tab-properties"><?php echo $this->_('strproperties'); ?></a></li>
				<li><a href="#od-tab-columns"><?php echo $this->_('strcolumns'); ?></a></li>
				<li><a href="#od-tab-foreignkeys"><?php echo $this->_('strforeignkeys'); ?></a></li>
				<li><a href="#od-tab-uniquekeys"><?php echo $this->_('struniquekeys'); ?></a></li>
			</ul>
			<div id="od-tab-properties">
				<dl>
					<dt><?php echo $this->_('strname'); ?></dt>
					<dd class="table-name"></dd>
					<dt><?php echo $this->_('stroptions'); ?></dt>
					<dd class="table-options"></dd>
					<dt><?php echo $this->_('strcomment'); ?></dt>
					<dd class="table-comment"></dd>
				</dl>
				<div class="buttons-placeholder">
					<input id="od-alter-table" type="button" value="<?php echo $this->_('stralter'); ?>" />
					<input id="od-drop-table" type="button" value="<?php echo $this->_('strdrop'); ?>" />
				</div>
			</div>
			<div id="od-tab-columns">
				<div class="buttons-placeholder">
					<input id="od-add-column" type="button" value="<?php echo $this->_('straddcolumn'); ?>" />
				</div>
				<div class="data-table-container">
					<table class="data-mgr">
						<thead>
							<tr>
								<th><?php echo $this->_('strname'); ?></th>
								<th><?php echo $this->_('strtype'); ?></th>
								<th class="check">PK</th>
								<th class="check">FK</th>
								<th class="check">UK</th>
								<th class="check">NN</th>
								<th><?php echo $this->_('strdefault'); ?></th>
								<th class="actions">&nbsp;</th>
							</tr>		
						</thead>
						<tbody></tbody>
					</table>
				</div>
			</div>
			<div id="od-tab-foreignkeys">
				<div class="buttons-placeholder">
					<input id="od-add-fk" type="button" value="<?php echo $this->_('straddfk'); ?>" />
				</div>
				<div class="data-table-container">
					<table class="data-mgr">
						<thead>
							<tr>
								<th><?php echo $this->_('strname'); ?></th>
								<th><?php echo $this->_('strreferences'); ?></th>
								<th><?php echo $this->_('strlocalcolumns'); ?></th>
								<th><?php echo $this->_('strreferencing'); ?></th>
								<th class="fixed-prop">ON UPDATE</th>
								<th class="fixed-prop">ON DELETE</th>
								<th class="fixed-prop">MATCH TYPE</th>
								<th><?php echo $this->_('stroptions'); ?></th>
								<th class="actions">&nbsp;</th>
							</tr>		
						</thead>
						<tbody></tbody>
					</table>
				</div>
			</div>
			<div id="od-tab-uniquekeys">
				<div class="buttons-placeholder">
					<input id="od-add-uniq" type="button" value="<?php echo $this->_('stradduniq'); ?>" />
				</div>
				<div class="data-table-container">
					<table class="data-mgr">
						<thead>
							<tr>
								<th><?php echo $this->_('strname'); ?></th>
								<th><?php echo $this->_('strcolumns'); ?></th>
								<th class="actions">&nbsp;</th>
							</tr>		
						</thead>
						<tbody></tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
<?php $templateManager['ObjectDetail'] = str_replace(array("\n", "\t"), '', ob_get_clean()); ?>