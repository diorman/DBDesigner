
Message = {
	show: function(msg, closeable){
		Message.clearTimer();
		if(!Message._$box){ 
			Message._$box = $('<div class="message-box ui-corner-all"></div>').click(Message.close);
		}
		Message._$box.text(msg).data('closeable', closeable).appendTo('body');
		Message._$box.css('margin-left', (-1 * Math.round(Message._$box.width() / 2)) + 'px');
		if(closeable){
			Message._timer = window.setTimeout(Message.close, 5000);
		}
	},
	close: function(){
		if(Message._$box && Message._$box.data('closeable') === true ){
			Message.clearTimer();
			Message._$box.detach();
		}
	},
	clearTimer: function(){
		if(Message._timer) { window.clearTimeout(Message._timer); Message._timer = null; }
	}
};

