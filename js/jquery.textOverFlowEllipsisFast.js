/**
 * MIT License
 * copyright 2014 https://github.com/j6k1
 */
(function($) {
	var escape_map = {
		"<" : "&lt;",
		">" : "&gt;",
		"&" : "&amp;",
		'"' : "&quot;",
		"'" : "&#039"
	};
	
	var unescape_map = {};
	
	for(var key in escape_map) if (escape_map.hasOwnProperty(key)) unescape_map[escape_map[key]] = key;
	
	function escape (html) {
		return html.replace(/[<>&"']/g, function (m) {
			return escape_map[m];
		});
	}
	
	function unescape (html) {
		return html.replace(/&lt;|&gt;|&amp;|&quot;|&#039;/g,  function (m) {
			return unescape_map[m];
		});
	}
	
	function init ($target) {
		// オリジナルの文章を取得・保持する
	 	if((/<(\w+)([^>]*)?>([\s\S]*?)<\/\1>/i).test($target.html())) return;
		$target.attr('data-original', escape($target.html()));
	}
	
	function execute ($target) {
		if(!$target.attr('data-original')) return;
		
	 	var suffix = $target.attr('data-suffix') || "...";
	 	var height = $target.attr('data-max-height') || $target.height();
		
	 	var options = {
	 		suffix: suffix,
            height: Number(height)
	 	};

		var orginalHtml = unescape($target.attr('data-original'));
		// 対象の要素を、高さにautoを指定し非表示で複製する
		var $clone = $target.clone();
		
		$target.css('height', height + "px");
        
		$clone.html(orginalHtml)
			.css({
				'display' : 'none',
				'position' : 'absolute',
				'overflow' : 'visible',
				'max-height': 'none',
				'height': 'auto'
			})
			.width($target.width());

		// 複製した要素を一旦追加
		$target.after($clone);
			
		var i,start,end,pivot,pos;
		
		if((pos = $target.attr("data-truncate-position")))
		{
			$clone.html(orginalHtml.substr(0, Number(pos)) + suffix);
			if(Number($clone.height()) === Number(options.height)) return;
		}
		
		function truncate (pivot, $clone) {
			var html = orginalHtml.substr(0, pivot);
			var rtrim_html = html.replace(/^([\s\S]*)((<.*?)|(&[^;]+))$/, function (m, m1) {
				return m1;
			});
			
			if(rtrim_html != html) pivot -= rtrim_html.length - html.length;
			html = rtrim_html;
			
			$clone.html(html + options.suffix);
			
			return pivot;
		}
		
		// 指定した高さ以内になる最大文字数を2分探索で探す
		for(start = 0, end = orginalHtml.length, pivot = Math.floor((start + end) / 2);
			pivot > 0 && start !==  pivot && end !== pivot ; pivot = Math.floor((start + end) / 2)) {
			pivot = truncate(pivot, $clone);
			
			if($clone.height() > options.height)
			{
				end = (pivot > start) ? pivot : start;
			}
			else
			{
				start = (pivot < end) ? pivot : end;
			}
		}
		
		while($clone.height() > options.height)
		{
			pivot--;
			pivot = truncate(pivot, $clone);
		}
		
		$target.attr("data-truncate-position", pivot);
		
		// 文章を入れ替えて、複製した要素を削除する
		$target.html($clone.html());
		$clone.remove();
	}
	
	$.textOverFlowElipsis = function () {
		$(".text-overflow-ellipsis").each(function(index) {
			var $target = $(this);
			
			if($targets.indexOf($target) != -1) return;

			init($target);

			execute($target);
				
			$targets.push($target);
		});
	};
	
    var $targets = [];

	$(document).ready(function () {
		$.textOverFlowElipsis();
		// ウィンドウリサイズに追従する
		var timerId = null;
		$(window).resize(function() {
			if (timerId) {
				clearTimeout(timerId);
			}

			timerId = setTimeout(function() {
				for(var i in $targets)
				{
					if($targets[i].hasClass("text-overflow-ellipsis-responsive")) execute($targets[i]);
				}
			}, 0);
		});
	});
})(jQuery);
