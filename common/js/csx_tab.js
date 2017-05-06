
// Page Tab Control

function csx_tab(context){

	// Default the context if not set
	if (!context) context = document;
	
	// Convert each tab
	var tabs = context.querySelectorAll('.tab');
	for (var i = 0; i < tabs.length; i++){
		var tab = tabs[i];
		
		// Gets the name of the page associated with the tab
		tab.page = function(){
		
			// Return the cached value if it exists
			if(this.pageCache != null)
				return this.pageCache;
		
			// Get the value from the text content, cache, and return
			var value = this.className.match(/tab_([\w]+)/)[1];
			this.pageCache = value;
			return value;
			
		};
		
		// Register the click event
		tab.addEventListener('click', function(){
			this.click();
		}, false);

		// Click event handler for the tabs interface
		tab.click = function(){
			var pageName = this.page();
			this.activate(pageName);
		};
		
		// Switch the active tab and sheet page
		tab.activate = function(pageName){
		
			var storageKey = window.location.hostname + window.location.pathname + "#lastPage"
		
			// Remember the active tab across sessions
			if(localStorage)
				localStorage[storageKey] = pageName;
			
			// Clear active class from current tab and page
			var activeTab = context.querySelectorAll('.tab.active');
			for (var i = 0; i < activeTab.length; i++)
				activeTab[i].className = activeTab[i].className.replace(/[\s]*active/g,'');
			
			var activePage = context.querySelectorAll('.page.active');
			for (var i = 0; i < activePage.length; i++)
				activePage[i].className = activePage[i].className.replace(/[\s]*active/g,'');
			
			// Make the proper page and tab active
			activeTab = context.querySelector('.tab.tab_' + pageName);
			activeTab.className += ' active';
			
			activePage = context.querySelector('.page.page_' + pageName);
			activePage.className += ' active';
		};
		
		// Go back to the most recent tab if available
		if(localStorage){
			if(localStorage[storageKey])
				tab.activate(localStorage[storageKey]);
			else
				tab.activate('crunch');
		}
		else
			tab.activate('crunch');
	}

}