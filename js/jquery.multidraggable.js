
(function($){
	var plugin = {
		onStart: function(event, ui){
			if(event.ctrlKey) return false;
			var pos1 = ui.position;
			plugin.group = $(this).css('z-index', '40').siblings('div.ui-selected').css('z-index', '30');
			plugin.group.each(function(){
				var $this = $(this);
				var pos2 = $this.position();
				$this.data('dragdiff', {top: pos1.top - pos2.top, left: pos1.left - pos2.left});
				$this.trigger('dragstart');
			});
		},
		onStop: function(event, ui){
			plugin.group.removeData('dragdiff').trigger('dragstop').add(this).css('z-index', '');
			plugin.group = $();
		},
		onDrag: function(event, ui){
			var diff = null;
			plugin.group.each(function(){
				var $this = $(this);
				diff = $this.data('dragdiff');
				$this.css({
					top: (ui.position.top - diff.top > 0? ui.position.top - diff.top : 0),
					left: (ui.position.left - diff.left > 0? ui.position.left - diff.left : 0)
				});
			});
		},
		mousedown: function(event){
			var $this = $(this);
			if(!event.ctrlKey && !$this.hasClass('ui-selected')){
				$this.addClass('ui-selected').trigger('selectableselected')
				.siblings('.ui-selected').removeClass('ui-selected').trigger('selectableunselected');
			}
		},
		click: function(event){
			var $this = $(this);
			if(event.ctrlKey) {
				if($this.hasClass('ui-selected')) {
					$this.removeClass('ui-selected').trigger('selectableunselected');
				} 
				else {
					$this.addClass('ui-selected').trigger('selectableselected');
				}
			}else if($this.hasClass('ui-selected')){
				$this.siblings('.ui-selected').removeClass('ui-selected').trigger('selectableunselected');
			}
		},
		group: $(),
		
		selectionChange: function(event, ui){
			var div = (event.type == 'selectableselected')? ui.selected : ui.unselected ;
			$(div).trigger(event.type);
		}
	};
	$.fn.extend({
        multiDraggable: function(options) {
			options.drag = plugin.onDrag;
			options.stop = plugin.onStop;
			options.start = plugin.onStart;
			this.draggable(options).mousedown(plugin.mousedown).click(plugin.click);
			return this;
        },
		
		multiDraggableArea: function(options) {
			options.selected = plugin.selectionChange;
			options.unselected = plugin.selectionChange;
			this.selectable(options);
			return this;
		}
    });
})(jQuery);


