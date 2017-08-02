(function () {
		
	var pid;
	var pgtype;
	var category = '';
	var subcategory = '';
	var search = '';
	var pathInfo = document.currentScript.src.split('?');
	var test = '';
	
	if (pathInfo.length > 1) {
		var pathParams = pathInfo[1].split('&');
		jQuery.each(pathParams, function (idx, item) {
			var paramInfo = item.split('=');

			if (paramInfo[0] == 'category') {
				category = paramInfo[1];
			} else if (paramInfo[0] == 'subcategory') {
				subcategory = paramInfo[1];
			} else if (paramInfo[0] == 'pgtype') {
				pgtype = paramInfo[1];
			} else if (paramInfo[0] == 'pid') {
				pid = paramInfo[1];
			} else if (paramInfo[0] == 'search') {
				search = paramInfo[1].replace('+', ' ');
			} else if (paramInfo[0] == 'test') {
				test = paramInfo[1];
			}
		});
	}
	
	googletag.cmd.push(function() {
try {
		var getBreakpoint = function () {
			var sizes = {
					'mobile'  : 0, 
					'tablet'  : 641,
					'desktop' : 1024 
				}
				, breakpoint;
	
			jQuery.each(sizes, function (name, minWidth) {
				if (jQuery(window).width() > minWidth) {
					breakpoint = name
				}
			});
			return breakpoint;
		};
	
		var dfp_ad_data = dfp_ad_object.length > 0 ? dfp_ad_object[0] : {};
		
		var networkCode = dfp_ad_data.account_id;
		
		var breakpoint = getBreakpoint();
	
		jQuery.each(dfp_ad_data.positions, function (idx, item) {
			var adInfo = item.ad_name.split('_')
				, position = adInfo.splice(-1, 1)
				, slotName = networkCode.concat(adInfo.join('_'))
					
			if (category) {
				slotName = slotName.replace('category', category);
			}
			
		try {
			if (position == 'oop') {
				googletag.defineOutOfPageSlot(slotName, item.position_tag)
					.addService(googletag.pubads())
					.setTargeting("pos", "oop");
			} else if (position == 'top') {
				var topMapping = googletag.sizeMapping()
					.addSize([1024, 0], item.ad_sizes.desktop)
					.addSize([641, 0], item.ad_sizes.tablet)
					.addSize([0, 0], item.ad_sizes.mobile)
					.build();
	
				googletag.defineSlot(slotName, item.ad_sizes[breakpoint], item.position_tag)
				   .defineSizeMapping(topMapping)
				   .addService(googletag.pubads())
				   .setTargeting("pos", position);
			} else if (['inline1', 'inline2', 'bottom'].indexOf(position) != -1) {
				var bottomMapping = googletag.sizeMapping()
					.addSize([641, 0], item.ad_sizes.tablet)
					.addSize([0, 0], item.ad_sizes.mobile)
					.build();
				
				googletag.defineSlot(slotName, item.ad_sizes[breakpoint], item.position_tag)
					.defineSizeMapping(bottomMapping)
					.addService(googletag.pubads())
					.setTargeting("pos", position);
			} else {
				googletag.defineSlot(slotName, item.ad_sizes[breakpoint], item.position_tag)
					.addService(googletag.pubads())
					.setTargeting("pos", position);
			}
			
		} catch (e) {
			console.log('d', e);
		}
			
		});
	
		googletag.pubads().setTargeting("pid", pid);
		googletag.pubads().setTargeting("pgtype", pgtype);
		
		if (category) {
			googletag.pubads().setTargeting("category", category.toLowerCase());
		}
		if (subcategory) {
			googletag.pubads().setTargeting("subcat", subcategory.toLowerCase());
		}
		
		if (search) {
			googletag.pubads().setTargeting("search", search);
		}
	    
		googletag.pubads().setTargeting("breakpoint", breakpoint);
		
		if (test) {
			googletag.pubads().setTargeting("test", test);
		}
		
		googletag.pubads().enableSingleRequest();
		googletag.enableServices();
} catch (e) {
	console.log(e)
}
	});
	
	

})();