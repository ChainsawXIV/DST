function csx_firstParentWithClass(node,className){
	while (node.parentNode){
		node = node.parentNode;
		if (node.className){
			if (node.className.match(className))
				return node;
		}
	}
	return false;
}
// General Editing Control

function csx_edit(context){

	function escape(string){
		//string = string.replace(/\\/g,'\\\&#92;');
		//string = string.replace(/"/g,'\\\&quot;');
		string = string.replace(/</g,'&lt;');
		return string;
	}
	
	function unescape(string){
		string = string.replace(/&lt;/g,'<');
		string = string.replace(/&gt;/g,'>');
		//string = string.replace(/\\"/g,'"');
		//string = string.replace(/\&quot;/g,'"');
		//string = string.replace(/\&#92;/g,'\\');
		return string;
	}

	// Just unescape if not editing
	if (!csx_opts.isEditable){
		var editFields = context.querySelectorAll('.dsf:not(.readonly),.edit:not(.readonly)');
		for (var i = 0; i < editFields.length; i++)
			editFields[i].innerHTML = unescape(editFields[i].innerHTML);
		return;
	}
	
	// Default the context if not set
	if (!context) context = document;
	
	// Returns the formatting bar or performs setup
	var formatBar = csx_opts.defaultContext.querySelector('.formatBar');
	if (!formatBar.eventsAttached){
	
		// Apply button functions
		formatBar.down = function(){
			this.parentNode.editNode.allowBlur = false;
		}
		
		formatBar.bold = function(){
			// Try catch hackery to handle bug in FF (Bug 889940)
			try{
				document.execCommand('bold',false,null);
			}catch(ex){}
			if(this.up) this.up();
			else this.parentNode.up();
		}
		
		formatBar.italic = function(){
			// Try catch hackery to handle bug in FF (Bug 889940)
			try{
				document.execCommand('italic',false,null);
			}catch(ex){}
			if(this.up) this.up();
			else this.parentNode.up();
		}
		
		formatBar.underline = function(){
			// Try catch hackery to handle bug in FF (Bug 889940)
			try{
				document.execCommand('underline',false,null);
			}catch(ex){}
			if(this.up) this.up();
			else this.parentNode.up();
		}
		
		formatBar.indent = function(){
			// Try catch hackery to handle bug in FF (Bug 889940)
			try{
				document.execCommand('insertUnorderedList',false,null);
			}catch(ex){}
			if(this.up) this.up();
			else this.parentNode.up();
		}
		
		formatBar.up = function(){
			this.editNode.focus();
			this.editNode.allowBlur = true;
		}
		
		// Map keybaoard shortcuts
		formatBar.keydown = function(e){
		
			// Genericize event data
			e = e || window.event;
			
			// Suppress line break insertion if needed
			if (e.keyCode == 13 && this.className.match(/singlerow/)){
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
			
			// Suppress normal browser shortcuts
			if (e.ctrlKey || e.metaKey){
				if (e.keyCode == 66){
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				else if (e.keyCode == 73){					
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				else if (e.keyCode == 85){
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				else if (e.keyCode == 9){
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			}
			
		}
		
		formatBar.keyup = function(e){

			// Genericize event data
			e = e || window.event;
			
			// Handle the shortcuts for formatting
			if (e.ctrlKey || e.metaKey){
				if (e.keyCode == 66){
					this.formatBar.bold();
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				else if (e.keyCode == 73){					
					this.formatBar.italic();
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				else if (e.keyCode == 85){
					this.formatBar.underline();
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
				else if (e.keyCode == 9){
					this.formatBar.indent();
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			}
		}
		
		// Assign show and hide behavior
		formatBar.show = function(field){
		
			// Set the field being edited
			this.editNode = field;
			
			// Insert and display the bar
			field.parentNode.insertBefore(this,field);
			this.style.display = 'block';
			
			// Position the bar below and centered
			this.style.left = (field.offsetLeft + (field.offsetWidth / 2) - (this.offsetWidth / 2)) + 'px';
			this.style.top = (field.offsetTop - (this.offsetHeight)) + 'px';
			
			// Enable keyboard shortcuts
			field.addEventListener('keyup', this.keyup, false);
			field.addEventListener('keydown', this.keydown, false);
			
		}
		
		formatBar.hide = function(){
		
			// Hide the bar
			this.style.display = 'none';
			
			// Disable keyboard shortcuts
			this.editNode.removeEventListener('keyup', this.keyup, false);
			this.editNode.removeEventListener('keydown', this.keydown, false);
			
		}
		
		// Add button events
		var boldButton = formatBar.querySelector('.boldButton');
		boldButton.addEventListener('mousedown', formatBar.down, false);
		boldButton.addEventListener('click', formatBar.bold, false);

		var italicButton = formatBar.querySelector('.italicButton');
		italicButton.addEventListener('mousedown', formatBar.down, false);
		italicButton.addEventListener('click', formatBar.italic, false);

		var underlineButton = formatBar.querySelector('.underlineButton');
		underlineButton.addEventListener('mousedown', formatBar.down, false);
		underlineButton.addEventListener('click', formatBar.underline, false);
		
		var indentButton = formatBar.querySelector('.indentButton');
		indentButton.addEventListener('mousedown', formatBar.down, false);
		indentButton.addEventListener('click', formatBar.indent, false);
		
		// Mark the format bar as ready
		formatBar.eventsAttached = true;
		
	}
	
	// Convert each editable field
	var editFields = context.querySelectorAll('.dsf,.edit');
	for (var i = 0; i < editFields.length; i++){
	
		var baseField = editFields[i];
		
		// Don't do anything to read only fields
		if (baseField.className.match(/readonly/))
			continue;
			
		// Replace the field span with a div if it's not
		// Here instead of render so events attach to the new div
		var field = baseField;
		if (baseField.tagName == 'SPAN'){
			var field = document.createElement('div');
			field.className = baseField.className;
			field.innerHTML = baseField.innerHTML;
			field.style.left = baseField.style.left;
			field.style.top = baseField.style.top;
			field.style.width = baseField.style.width;
			field.style.textAlign = baseField.style.textAlign;
			field.old_value = '';
			baseField.parentNode.insertBefore(field,baseField);
			baseField.parentNode.removeChild(baseField);
		}
		
		// Set the default text value for blank fields
		if (baseField.attributes['defaultString']){
			field.defaultValue = baseField.attributes['defaultString'].value;
			field.setAttribute('defaultString',baseField.attributes['defaultString'].value);
		}
		else
			field.defaultValue = csx_opts.defaultFieldValue;
		
		// Returns the text edited into the field
		field.value = function(){
			
			// Return nothing if the field is defaulted
			if (this.innerHTML == this.defaultValue)
				return '';
			// Otherwise return the actual content
			else
				return this.innerHTML;
			
		}
		
		// Populates editable fields with default values
		field.render = function(){
		
			this.innerHTML = unescape(this.innerHTML);
		
			// Set default value if the field is blank
			if (this.innerHTML == csx_opts.defaultFieldValue || this.innerHTML == '')
				this.innerHTML = this.defaultValue;

			// Activate the field for editing
			this.enable();
		
		}
		
		// Strips the default value away if needed
		field.unrender = function(){
			
			if (this.innerHTML == this.defaultValue)
				this.innerHTML = '';
				
			// Replace this with a span if it's not
			if (this.tagName != 'SPAN'){
				var span = document.createElement('span');
				span.className = this.className;
				span.innerHTML = escape(this.innerHTML);
				this.parentNode.insertBefore(span,this);
				this.parentNode.removeChild(this);
			}
			
		}
		
		// Attaches required events and sets values
		field.enable = function(){
		
			// Set title and cursor mode
			this.title = 'Click and type to edit';

			// Make the content editable
			this.contentEditable = true; // *** This is hella slow in FF for some reason

			// Assign the required events to the field
			this.addEventListener('focus', this.activate, false);
			this.addEventListener('blur', this.deactivate, false);
			this.allowBlur = true;
			
		}
		
		// Select content and show edit interface on focus
		field.activate = function(e){
			this.old_value = this.innerHTML;

			// Display the formatting toolbar
			this.formatBar.show(this);
			
			// Shade the field
			this.className += ' activeField';

			// Select all the text in the field for editing
			if(this.allowBlur){
				var el = this;
				requestAnimationFrame(function() {
					el.select();
				});
			}
			
			// Disable the element's title
			this.titleStore = this.title;
			this.title = '';
			
		}
		
		// Called when the field loses focus, hide editing interface
		field.deactivate = function(){
		
			if(!this.allowBlur)
				return;
				
			// Hide the formatting toolbar
			this.formatBar.hide();
			
			// Default the text if empty
			if(this.innerHTML == '' || this.innerHTML == '<br>')
				this.innerHTML = this.defaultValue;
			
			// Unshade the field
			this.className = this.className.replace(/ activeField/g,'');
			
			// Enable the element's title
			this.title = this.titleStore;
			
			if(this.old_value != this.innerHTML){
				this.update();
			}
		}
		
		// Called when the content changes, typically overridden
		field.update = function(){
		
		}
		
		// Selects all the text in the field
		field.select = function(){
		
			var range = document.createRange();
			range.selectNodeContents(this);
			var selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
			
		}
		
		// Create ref to format bar
		field.formatBar = formatBar;

		// Ready the field for use
		field.render();
		
	}
	
}
// Dynamic List Control

function csx_list(context, addItemCallback){
	
	// Default the context if not set
	if (!context) context = document;

    // Initialize globals
    var mover = null;
    var onHandle = false;

	// Generic utility digit padding function
	function padDigits(value, digits){
		value = value.toString();
		while (value.length < digits)
			value = '0' + value;
			
		return value;
	}
	
	// Utility function to get an element's page height
	function getOffset(element){
		var offsetX = 0;
		var offsetY = 0;
		while (element && !isNaN(element.offsetTop)){
			//offsetX += element.offsetLeft - element.scrollLeft;
			//offsetY += element.offsetTop - element.scrollTop;
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
			element = element.offsetParent;
		}
		return {'x':offsetX,'y':offsetY};
	}
	
	// Utility function for finding the owning list
	function getOwningList(node){
		while (node.parentNode){
			node = node.parentNode;
			if (node.className){
				if (node.className.match(/list_/))
					return node;
			}
		}
		return false;
	}
	
	// Utility function to find the owning page
	function getOwningPage(node){
		while (node.parentNode){
			node = node.parentNode;
			if (node.className){
				if (node.className.match(/page_/))
					return node;
			}
		}
		return false;
	}
	
    // Convert each list
	var lists = context.querySelectorAll('.list');
	for (var listIndex = 0; listIndex < lists.length; listIndex++){

		// Handling for scripted columnation
		lists[listIndex].columns = lists[listIndex].querySelectorAll('.column');
		lists[listIndex].autoBalance = function(){return false;};
		for (var i = 0; i < lists[listIndex].columns.length; i++)
			lists[listIndex].columns[i].colNum = i;
		
		// Handle loading and conversion of old data format
		lists[listIndex].load = function(){

			// Get and parse the data from the new-type storage field
			var listName = this.className.match(/list_([\w\d_]+)/)[1];
			var dataString = this.querySelector('.dsf_' + listName).innerHTML;
			
			// Manually clean up all the unhandled string escaping
			dataString = dataString.replace(/"\\/g,'\"');
			dataString = dataString.replace(/=\"\"/g,'=\"\"');
			dataString = dataString.replace(/&lt;/g,'<');
			dataString = dataString.replace(/&gt;/g,'>');
			dataString = dataString.replace(/<[/]*span[^>]*>/g,'');
			dataString = dataString.replace(/<[/]*font[^>]*>/g,'');
			dataString = dataString.replace(/<b[^>r]*>/g,'<b>');	
			
			var listData = (dataString) ? JSON.parse(dataString) : [];

			// Add on to the end any data stored in the old way
			var oldStructure = this.querySelector('.oldfields').innerHTML;
			if (oldStructure){
				var oldLists = JSON.parse(oldStructure);
				
				// Harvest data for each list to be merged in
				for (var oldListIndex = 0; oldListIndex < oldLists.length; oldListIndex++){
					var oldFields = oldLists[oldListIndex];
					var oldItemIndex = 0;
					
					// Search the saved data for items coresponding to the list's first field
					while (dynamic_sheet_attrs[oldFields[Object.keys(oldFields)[0]] + '_' + padDigits(oldItemIndex,2)] != undefined){
						var newItemData = {};
						
						// Get the data for each field once an item is found
						for (var newFieldName in oldFields){
							var oldFieldName  = oldFields[newFieldName] + '_' + padDigits(oldItemIndex,2);
							newItemData[newFieldName] = dynamic_sheet_attrs[oldFieldName];
							// Clean up busticated data from old implementation
							if(newItemData[newFieldName] == undefined || newItemData[newFieldName] == 'undefined')
								newItemData[newFieldName] = '';
						}
						
						// Add the new item to the complete item array
						listData[listData.length] = newItemData;
						oldItemIndex++;
					}
				}
			}
		
			// If saved data exists then clear and render
			if (listData.length){
				this.clear();
				this.render(listData);
			}
			
		}
		
		// Core function to clear the list of pre-existing data
		lists[listIndex].clear = function(){
			var items = this.querySelectorAll('li.item');
			for (var itemIndex = 0; itemIndex < items.length; itemIndex++){
				if (!items[itemIndex].className.match(/proto/)){
					this.removeChild(items[itemIndex]);
				}
			}
		}
	
		// Core function to load list data from JSON string
		lists[listIndex].render = function(listData){
			
			// Add the contents of the object to the list
			var rebalance = false;
			for (var itemIndex = 0; itemIndex < listData.length; itemIndex++){
				// Rebalance after render if missing any column specifications
				if (listData[itemIndex].column == undefined)
					rebalance = true;
				this.addItem(listData[itemIndex]);
			}
			if (rebalance && this.columns.length)
				this.balanceColumns();
			
		}
		
		// Core function to extract and save list data
		lists[listIndex].unrender = function(){
			
			// Walk the list harvesting data into an object
			var listData = [];
			var items = this.querySelectorAll('li.item');
			for (var itemIndex = 0; itemIndex < items.length; itemIndex++){
				if (!items[itemIndex].className.match(/proto/)){
					var itemData = {};
					var fields = items[itemIndex].querySelectorAll('.dslf');
					for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++){
						var fieldName = fields[fieldIndex].className.match(/dslf_([\w\d_]+)/)[1];
						var fieldValue = fields[fieldIndex].innerHTML;
						itemData[fieldName] = fieldValue;
					}
					if (this.columns.length)
						itemData.column = items[itemIndex].parentNode.colNum;
					listData[listData.length] = itemData;
				}
			}
			
			// Stringify the object and put it to the save field
			var listName = this.className.match(/list_([\w\d_]+)/)[1];
			var dataString = JSON.stringify(listData);
			this.querySelector('.dsf_' + listName).innerHTML = dataString;
			
		}

		// Callback function for post-add processing
		if (csx_opts.setupCallback)
			lists[listIndex].itemAdded = csx_opts.setupCallback;
		else
			lists[listIndex].itemAdded = function(){};
		
		// Core function to add an item to the list
		lists[listIndex].addItem = function(data){
			
			// Clone the embeded prototype as a basis
			var proto = this.querySelector('.proto');
			var newItem = proto.cloneNode(true);
			
			// Initialize the new item
			newItem.className = newItem.className.replace(/proto/g,'');
			
			// Inject any provided data into the item
			if (data){
				var fields = newItem.querySelectorAll('.dslf');
				for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++){
					var fieldName = fields[fieldIndex].className.match(/dslf_([\w\d_]+)/)[1];
					if (fieldName in data)
						fields[fieldIndex].innerHTML = data[fieldName];
				}
			}
			
			// Place and enable the new item
			if (this.columns.length){
				if (data){
					if (data.column != undefined){
						// Put it in the right column if specified
						this.columns[data.column].appendChild(newItem);
					}
					else{
						// ERROR CASE: default to last column
						this.lastColumn.appendChild(newItem);
					}
				}
				else{
					// Put new items in the lat column
					this.lastColumn.appendChild(newItem);
				}
			}
			else{
				// Put it right in the list if there are no columns
				this.appendChild(newItem);
			}
			
			this.makeDragable(newItem);
			this.itemAdded(newItem);
			
			// Autobalance the list if enabled
			if (this.autoBalance())
				this.balanceColumns();
		
		}

		// Core function to make an item dragable
		lists[listIndex].makeDragable = function(item){
			item.draggable = true;
			
			// Prevent drag when interacting with editable text
			var textFields = item.querySelectorAll('[contentEditable=true]');
			for (var fieldIndex = 0; fieldIndex < textFields.length; fieldIndex++){
				textFields[fieldIndex].addEventListener('mousedown', function(e){
					this.parentNode.draggable = false;
					this.addEventListener('mouseup', function(e){
						this.parentNode.draggable = true;
					}, false);
					this.addEventListener('mouseout', function(e){
						this.parentNode.draggable = true;
					}, false);
				}, false);
			}
			
			// Designate to higher scope when mousing a drag handle
			var dragHandle = item.querySelector('.handle');
			dragHandle.title = 'Drag to rearrange list';
			dragHandle.addEventListener('mousedown', function (e) {
				onHandle = true;
				var handle = this;
				
				this.mouseup = function(e){
					onHandle = false;
					handle.clearEvents();
				}
				this.addEventListener('mouseup', this.mouseup, false);
				
				this.mouseout = function(e){
					this.handleTimeout = window.setTimeout(function(){
						onHandle = false;
						handle.clearEvents();
					},5);
				}
				this.addEventListener('mouseout', this.mouseout, false);
				
				this.mouseover = function(e){
					window.clearTimeout(handle.handleTimeout);
				}
				this.addEventListener('mouseover', this.mouseover, false);
				
				this.clearEvents = function(){
					this.removeEventListener('mouseup',this.mouseup);
					this.removeEventListener('mouseout',this.mouseout);
					this.removeEventListener('mouseover',this.mouseover);
				};
				
			}, false);
			
			// Apply event listener for when draging begins
			item.addEventListener('dragstart', function (e) {
				// Do nothing unless we're grabbing the handle
				if (onHandle) {
				
					// Declare the action being taken
					e.dataTransfer.effectAllowed = 'move';
					e.dataTransfer.setData('Text', this.id);
					
					// Flag the item in motion up in scope
					mover = this;
				
					// Apply styling class to the thing moving
					this.className += ' source';
					
					// Put the parent in the context
					var parentList = getOwningList(this);
					
					// Highlight all the trash drops
					var trash = document.querySelectorAll('.trash');
					for (var trashIdx = 0; trashIdx < trash.length; trashIdx++){
						trash[trashIdx].className += ' active';
					}
					
					// Disable all contentEditables in the list
					var edits = parentList.querySelectorAll('[contentEditable=true]');
					for(var fieldIndex = 0; fieldIndex < edits.length; fieldIndex++)
						edits[fieldIndex].contentEditable = false;
					
					// Apply the cleanup event handler
					this.addEventListener('dragend', function (e) {
					
						// Mark us as off the drag handle
						onHandle = false;
						
						// Remove grab handle events
						this.querySelector('.handle').clearEvents();
						
						// Remove events from the rest of the list
						var listItems = parentList.querySelectorAll('li.item');
						for (var itemIndex = 0; itemIndex < listItems.length; itemIndex++){
							var li = listItems[itemIndex];
							li.removeEventListener('dragenter', li.dragenterFunc, false);
							li.removeEventListener('dragover', li.dragoverFunc, false);
							li.removeEventListener('dragleave', li.dragleaveFunc, false);
							li.removeEventListener('drop', li.dropFunc, false);
						}

						// Strip styling classes
						this.className = this.className.replace(/[\s]*source/g,'');
						
						// Un-highlight all the trash drops
						var trash = document.querySelectorAll('.trash');
						for (var trashIdx = 0; trashIdx < trash.length; trashIdx++){
							trash[trashIdx].className = trash[trashIdx].className.replace(/[\s]*active/g,'');
						}
						
						// Remove this event handler
						this.ondragend = false;
						
						// Autobalance the list if enabled
						if (parentList.autoBalance())
							parentList.balanceColumns();
						
						// Reenable editing by the power of closures
						for(var fieldIndex = 0; fieldIndex < edits.length; fieldIndex++)
							edits[fieldIndex].contentEditable = true;
					}, false);
					
					var listItems = getOwningList(this).querySelectorAll('li.item');
					for (var itemIndex = 0; itemIndex < listItems.length; itemIndex++){
					
						var li = listItems[itemIndex];
					
						// Style potential drop targets as they're moved over
						li.dragUpdateFunc = function (e) {
							// Prevent response from the origenal item in the list
							if(this == mover) return false;
							
							// Apply styling class to potential drop targets
							var offset = getOffset(this);
							var verticalPosition = (e.pageY - offset.y) / this.offsetHeight;
							if (verticalPosition < 0.5){
								this.className = this.className.replace(/[\s]*over-below/g,'');
								this.className += ' over-above';
							}
							else{
								this.className = this.className.replace(/[\s]*over-above/g,'');
								this.className += ' over-below';
							}
							return false;
						};
						li.dragenterFunc = function (e) {
							this.dragUpdateFunc(e);
						}
						li.addEventListener('dragenter', li.dragenterFunc, false);
						li.dragoverFunc = function (e) {
							// Cancel removal of styling class after leaving an element
							// if it was internal to the draggable item itself
							window.clearTimeout(this.leaveTimer);
							
							// Update the styling for above / below insertion
							this.dragUpdateFunc(e);
							
							// Cancel the default behavior of the drag
							if (e.preventDefault) e.preventDefault();
							return false;
						};
						li.addEventListener('dragover', li.dragoverFunc, false);
						li.dragleaveFunc = function (e) {
							// Schedule styling class cleanup if not canceled
							var leaveTarget = this;
							this.leaveTimer = window.setTimeout(function(){
								leaveTarget.className = leaveTarget.className.replace(/[\s]*over-above/g,'');
								leaveTarget.className = leaveTarget.className.replace(/[\s]*over-below/g,'');
							}, 5);
						};
						li.addEventListener('dragleave', li.dragleaveFunc, false);
						
						// Apply event listeners for dropping the item
						li.dropFunc = function (e) {
							// Prevent response if dropping on itself
							if (this == mover) return;
							
							// Insert the moved item above or below the target
							var offset = getOffset(this);
							var verticalPosition = (e.pageY - offset.y) / this.offsetHeight;
							if (verticalPosition < 0.5)
								this.parentNode.insertBefore(mover,this);
							else{
								if (this.nextSibling)
									this.parentNode.insertBefore(mover,this.nextSibling);
								else
									this.parentNode.appendChild(mover);
							}
							
							// Remove the styling class from the target
							this.className = this.className.replace(/[\s]*over-above/g,'');
							this.className = this.className.replace(/[\s]*over-below/g,'');
							
							// Stop the default events from occuring
							if (e.stopPropagation) e.stopPropagation();
							return false;
						};
						li.addEventListener('drop', li.dropFunc, false);
					
					}
					
				}
				else {
					e.preventDefault();
				}
			}, false);
		
		};
		
		// Only set up columns if there's more than one
		if (lists[listIndex].columns.length){
		
			// Shortcut to the last column
			lists[listIndex].lastColumn = lists[listIndex].columns[lists[listIndex].columns.length - 1];

			// Calculate the pixel height of the list's content
			lists[listIndex].contentHeight = function(){
				var items = this.querySelectorAll('li.item:not(.proto)');
				var height = 0;
				for (var i = 0; i < items.length; i++)
					height += items[i].offsetHeight;
				return height;
			}
			
			// Distribute list items between columns
			lists[listIndex].balanceColumns = function(){
				var items = this.querySelectorAll('li.item:not(.proto)');
				var colHeight = 0;
				var currentCol = 0;

				// Determine the ideal column height
				var idealHeight = this.contentHeight() / this.columns.length;
					
				// Tally up the height of the items
				for (var i = 0; i < items.length; i++){
					if (colHeight >= idealHeight){
						colHeight = 0;
						currentCol++;
					}
					this.columns[currentCol].appendChild(items[i]);
					colHeight += items[i].offsetHeight;
				}
				
			}
			
		}
		
		// Apply dragability to each item on the list
		if (csx_opts.isEditable){
			var items = lists[listIndex].querySelectorAll('li.item');
			for (var itemIndex = 0; itemIndex < items.length; itemIndex++)
				lists[listIndex].makeDragable(items[itemIndex]);
		}
			
		// Load any existing saved data
		lists[listIndex].load();
		
	}
	
	// Convert each add button
	var addButtons = context.querySelectorAll('.add');
	for (var addIndex = 0; addIndex < addButtons.length; addIndex++){
		
		var button = addButtons[addIndex];
		var listName = button.className.match(/addto_([\w\d]+)/)[1];
		
		if (!button.title)
			button.title = 'Add list item';

		button.listOwner = context.querySelector('.list_' + listName);
		button.addEventListener('mouseup', function (e) {
			this.listOwner.addItem();
		});
		
	}
	
	// Convert each balance button
	var balanceButtons = context.querySelectorAll('.balance');
	for (var balanceIndex = 0; balanceIndex < balanceButtons.length; balanceIndex++){
	
		var button = balanceButtons[balanceIndex];
		var listName = button.className.match(/balance_([\w]+)/)[1];
		
		if (!button.title)
			button.title = 'Balance list columns';
		
		button.listOwner = context.querySelector('.list_' + listName);
		button.addEventListener('mouseup', function (e) {
			this.listOwner.balanceColumns();
		});
	
	}
	
	// Hook up each auto-balance toggle
	var autoButtons = context.querySelectorAll('.autobalance');
	for (var autoIndex = 0; autoIndex < autoButtons.length; autoIndex++){
		
		var button = autoButtons[autoIndex];
		var listName = button.className.match(/autobalance_([\w]+)/)[1];
		var listOwner = context.querySelector('.list_' + listName);
		listOwner.autoBalanceToggle = autoButtons[autoIndex];
		listOwner.autoBalance = function(){
			if (this.autoBalanceToggle.value() == 1)
				return true;
			else
				return false;
		}

		button.title = 'Auto-balance columns';
		
	}
	
	// Convert each trash drop
	var trashBins = context.querySelectorAll('.trash');
	for (var trashIndex = 0; trashIndex < trashBins.length; trashIndex++){
	
		// Set up the trash drop point
		var trash = trashBins[trashIndex];
		trash.title = 'Drag here to delete';

		// Style the trash drop point as the item moves over it
		trash.addEventListener('dragenter', function (e) {
			this.className += ' over';
			return false;
		}, false);
		trash.addEventListener('dragover', function (e) {
			// Cancel removal of styling class after leaving an element
			// if it was internal to the draggable item itself
			window.clearTimeout(this.leaveTimer);
			
			// Cancel the default behavior of the drag
			if (e.preventDefault) e.preventDefault();
			return false;
		}, false);
		trash.addEventListener('dragleave', function () {
			// Schedule styling class cleanup if not canceled
			var leaveTarget = this;
			this.leaveTimer = window.setTimeout(function(){
				leaveTarget.className = leaveTarget.className.replace(/[\s]*over/g,'');
			}, 5);
		}, false);
		
		// Remove the item being moved if dropped in the trash
		trash.addEventListener('drop', function (e) {
			// Remove the moving item itself
			mover.parentNode.removeChild(mover);
			
			// Remove the styling class from the trash
			this.className = this.className.replace(/[\s]*over/g,'');
			
			// Stop the default events from occuring
			if (e.stopPropagation) e.stopPropagation();
			return false;
		}, false);
	
	}
}
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
		
			// Default the page name if the named one doesn't exist
			var tab = context.querySelector('.tab.tab_' + pageName);
			if(!tab)
				pageName = 'crunch';
		
			// Remember the active tab across sessions
			var storageKey = window.location.hostname + window.location.pathname + "#lastPage"
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
			var storageKey = window.location.hostname + window.location.pathname + "#lastPage"
			if(localStorage[storageKey])
				tab.activate(localStorage[storageKey]);
			else
				tab.activate('crunch');
		}
		else
			tab.activate('crunch');
	}

}
// Tooltip Control

function csx_tip(context){

	// Default the context if not set
	if (!context) context = document;
	
	// Create the tool tip element of needed
	var tipBox = csx_opts.uiContainer.querySelector('.tipBox');
	if (!tipBox.eventsAttached){
		
		// Hide the tip box when it loses focus
		tipBox.querySelector('.tipArea').addEventListener('blur', function(e){
			this.parentNode.parentNode.activeField.hide();
		}, false);	
		
		// Flag the tip box as having been configured
		tipBox.eventsAttached = true;
		
	}
	
	// Convert each tip field
	var tipFields = context.querySelectorAll('.tip');
	for (var i = 0; i < tipFields.length; i++){
		
		tipFields[i].show = function(e){
			
			// Provide a quick connection to the tip field
			tipBox.activeField = this;
			
			// Initialize the floater and contents
			var tipArea = tipBox.querySelector('.tipArea');
			if (this.innerHTML != '')
				tipArea.innerHTML = this.innerHTML;
			else
				tipArea.innerHTML = csx_opts.defaultFieldValue;
			tipArea.allowBlur = true;

			// Reveal the floater and focus
			tipBox.style.display = 'block';
			tipArea.focus();
			
			// Highlight the item
			this.parentNode.className += ' highlight';
			
			// Position the tip near the mouse
			this.move(e);
		}
		
		tipFields[i].move = function(e){
		
			// Get wrapper offset
			var wrapper = tipBox.parentNode.parentNode;
			var element = wrapper;
			var containerX = 0;
			var containerY = 0;
			while (element.offsetParent){
				containerX += element.offsetLeft;
				containerY += element.offsetTop;
				element = element.offsetParent;
			}
		
			// Calculate the tip's new position
			var posX = Math.min(wrapper.offsetWidth - tipBox.offsetWidth, (e.pageX - containerX) + 30);
			var posY = (e.pageY - containerY) + 30;
			
			// Position the box
			tipBox.style.left = posX + 'px';
			tipBox.style.top = posY + 'px';
			
		}
		
		tipFields[i].hide = function(e){
		
			// Stop here if focus was lost to the edit controls
			var tipArea = tipBox.querySelector('.tipArea');
			if(!tipArea.allowBlur)
				return;
				
			// Write the tip box content back to the tip field
			if (tipArea.innerHTML != csx_opts.defaultFieldValue)
				tipBox.activeField.innerHTML = tipArea.innerHTML;
			// Don't store the default value
			else
				tipBox.activeField.innerHTML = '';
			
			// Remove the highlight
			this.parentNode.className = this.parentNode.className.replace(/ highlight/g,'');
			
			// Hide the tip box
			tipBox.style.display = 'none';
			
		}
		
		// Enable click to edit in sheet editing mode
		if (csx_opts.isEditable){
		
			// On hover show edit prompt
			tipFields[i].title = "Click to edit tool tip";
			
			// On click open editing interface
			tipFields[i].addEventListener('click', function(e){
				this.show(e);
			}, false);			
		
		}
		// Use mouse over and track mouse for view mode
		else{
		
			// Assign a link down to the tip
			tipFields[i].parentNode.tooltip = tipFields[i];
		
			// Only show tool tips if they have content
			if (tipFields[i].innerHTML != ''){
			
				// On enter show the tip
				tipFields[i].parentNode.addEventListener('mouseover', function(e){
					this.tooltip.show(e);
				}, false);
				
				// On move move the tip
				tipFields[i].parentNode.addEventListener('mousemove', function(e){
					this.tooltip.move(e);
				}, false);
				
				// On leave hide the tip
				tipFields[i].parentNode.addEventListener('mouseout', function(e){
					this.tooltip.hide(e);
				}, false);
				
			}
		}
	
	}

}
// DDI Character Builder File Importer

csx_ddi_schema = {
	"dsf_passive_perception_skill":"Perception",
	"dsf_passive_perception":"Passive Perception",
	"dsf_passive_insight_skill":"Insight",
	"dsf_passive_insight":"Passive Insight",
	"dsf_speed_armor":"Speed.Armor",
	"dsf_speed_base":"Base Speed",
	"dsf_speed":"Speed",
	"dsf_action_points":"_BaseActionPoints",
	"dsf_will_ten_plus_half":"Ten Plus Half Level",
	"dsf_will_ability":"Will Ability Modifier",
	"dsf_will_class":"Will Defense Class Bonus",
	"dsf_will_feat":"Will.Feat",
	"dsf_will_enhancement":"Will.Enhancement",
	"dsf_will":"Will",
	"dsf_reflex_ten_plus_half":"Ten Plus Half Level",
	"dsf_reflex_ability":"Reflex Ability Modifier",
	"dsf_reflex_class":"Reflex Defense Class Bonus",
	"dsf_reflex_feat":"Reflex.Feat",
	"dsf_reflex_enhancement":"Reflex.Enhancement",
	"dsf_reflex_misc_a":"Reflex.Shield",
	"dsf_reflex":"Reflex",
	"dsf_fortitude_ten_plus_half":"Ten Plus Half Level",
	"dsf_fortitude_ability":"Fortitude Ability Modifier",
	"dsf_fortitude_class":"Fortitude Defense Class Bonus",
	"dsf_fortitude_feat":"Fortitude.Feat",
	"dsf_fortitude_enhancement":"Fortitude.Enhancement",
	"dsf_fortitude":"Fortitude",
	"dsf_ac_ten_plus_half":"Ten Plus Half Level",
	"dsf_ac_ability":"AC Ability Modifier",
	"dsf_ac_class":"AC Defense Class Bonus",
	"dsf_ac_feat":"AC.Feat",
	"dsf_ac_enhancement":"Armor Enhancement Bonus",
	"dsf_ac_misc_a":"AC.Shield",
	"dsf_ac":"AC",
	"dsf_thievery_ability_plus_half":"Dexterity Plus Half Level",
	"dsf_thievery_training":"Thievery Trained",
	"dsf_thievery_armor":"Armor Penalty",
	"dsf_thievery_misc":"Thievery Misc",
	"dsf_thievery":"Thievery",
	"dsf_streetwise_ability_plus_half":"Charisma Plus Half Level",
	"dsf_streetwise_training":"Streetwise Trained",
	"dsf_streetwise_misc":"Streetwise Misc",
	"dsf_streetwise":"Streetwise",
	"dsf_stealth_ability_plus_half":"Dexterity Plus Half Level",
	"dsf_stealth_training":"Stealth Trained",
	"dsf_stealth_armor":"Armor Penalty",
	"dsf_stealth_misc":"Stealth Misc",
	"dsf_stealth":"Stealth",
	"dsf_religion_ability_plus_half":"Intelligence Plus Half Level",
	"dsf_religion_training":"Religion Trained",
	"dsf_religion_misc":"Religion Misc",
	"dsf_religion":"Religion",
	"dsf_perception_ability_plus_half":"Wisdom Plus Half Level",
	"dsf_perception_training":"Perception Trained",
	"dsf_perception_misc":"Perception Misc",
	"dsf_perception":"Perception",
	"dsf_nature_ability_plus_half":"Wisdom Plus Half Level",
	"dsf_nature_training":"Nature Trained",
	"dsf_nature_misc":"Nature Misc",
	"dsf_nature":"Nature",
	"dsf_intimidate_ability_plus_half":"Charisma Plus Half Level",
	"dsf_intimidate_training":"Intimidate Trained",
	"dsf_intimidate_misc":"Intimidate Misc",
	"dsf_intimidate":"Intimidate",
	"dsf_insight_ability_plus_half":"Wisdom Plus Half Level",
	"dsf_insight_training":"Insight Trained",
	"dsf_insight_misc":"Insight Misc",
	"dsf_insight":"Insight",
	"dsf_history_ability_plus_half":"Intelligence Plus Half Level",
	"dsf_history_training":"History Trained",
	"dsf_history_misc":"History Misc",
	"dsf_history":"History",
	"dsf_heal_ability_plus_half":"Wisdom Plus Half Level",
	"dsf_heal_training":"Heal Trained",
	"dsf_heal_misc":"Heal Misc",
	"dsf_heal":"Heal",
	"dsf_endurance_ability_plus_half":"Constitution Plus Half Level",
	"dsf_endurance_training":"Endurance Trained",
	"dsf_endurance_armor":"Armor Penalty",
	"dsf_endurance_misc":"Endurance Misc",
	"dsf_endurance":"Endurance",
	"dsf_dungeoneering_ability_plus_half":"Wisdom Plus Half Level",
	"dsf_dungeoneering_training":"Dungeoneering Trained",
	"dsf_dungeoneering_misc":"Dungeoneering Misc",
	"dsf_dungeoneering":"Dungeoneering",
	"dsf_diplomacy_ability_plus_half":"Charisma Plus Half Level",
	"dsf_diplomacy_training":"Diplomacy Trained",
	"dsf_diplomacy_misc":"Diplomacy Misc",
	"dsf_diplomacy":"Diplomacy",
	"dsf_bluff_ability_plus_half":"Charisma Plus Half Level",
	"dsf_bluff_training":"Bluff Trained",
	"dsf_bluff_misc":"Bluff Misc",
	"dsf_bluff":"Bluff",
	"dsf_athletics_ability_plus_half":"Strength Plus Half Level",
	"dsf_athletics_training":"Athletics Trained",
	"dsf_athletics_armor":"Armor Penalty",
	"dsf_athletics_misc":"Athletics Misc",
	"dsf_athletics":"Athletics",
	"dsf_arcana_ability_plus_half":"Intelligence Plus Half Level",
	"dsf_arcana_training":"Arcana Trained",
	"dsf_arcana_misc":"Arcana Misc",
	"dsf_arcana":"Arcana",
	"dsf_acrobatics_ability_plus_half":"Dexterity Plus Half Level",
	"dsf_acrobatics_training":"Acrobatics Trained",
	"dsf_acrobatics_armor":"Armor Penalty",
	"dsf_acrobatics_misc":"Acrobatics Misc",
	"dsf_acrobatics":"Acrobatics",
	"dsf_surges":"Healing Surges",
	"dsf_surge_value":"Surge Value",
	"dsf_bloodied":"Bloodied Value",
	"dsf_hit_points":"Hit Points",
	"dsf_charisma_mod":"Charisma modifier",
	"dsf_charisma_mod_plus_half":"Charisma Plus Half Level",
	"dsf_charisma":"Charisma",
	"dsf_wisdom_mod":"Wisdom modifier",
	"dsf_wisdom_mod_plus_half":"Wisdom Plus Half Level",
	"dsf_wisdom":"Wisdom",
	"dsf_intelligence_mod":"Intelligence modifier",
	"dsf_intelligence_mod_plus_half":"Intelligence Plus Half Level",
	"dsf_intelligence":"Intelligence",
	"dsf_dexterity_mod":"Dexterity modifier",
	"dsf_dexterity_mod_plus_half":"Dexterity Plus Half Level",
	"dsf_dexterity":"Dexterity",
	"dsf_constitution_mod":"Constitution modifier",
	"dsf_constitution_mod_plus_half":"Constitution Plus Half Level",
	"dsf_constitution":"Constitution",
	"dsf_strength_mod":"Strength modifier",
	"dsf_strength_mod_plus_half":"Strength Plus Half Level",
	"dsf_strength":"Strength",
	"dsf_initiative_dex":"Dexterity modifier",
	"dsf_initiative_half":"HALF-LEVEL",
	"dsf_initiative_misc":"Initiative Misc",
	"dsf_initiative":"Initiative",
	"dsf_affiliation":"Company",
	"dsf_deity":"Deity",
	"dsf_alignment":"Alignment",
	"dsf_weight":"Weight",
	"dsf_height":"Height",
	"dsf_gender":"Gender",
	"dsf_age":"Age",
	"dsf_size":"Size",
	"dsf_race":"Race",
	"dsf_xp":"Experience",
	"dsf_epic_destiny":"Epic Destiny",
	"dsf_paragon_path":"Paragon Path",
	"dsf_class":"Class",
	"dsf_level":"Level",
	"dsf_dailyPowers":{
		"source":"Daily Powers",
		"fields":{
			"mod":"name"
		}
	},
	"dsf_encounterPowers":{
		"source":"Encounter Powers",
		"fields":{
			"mod":"name"
		}
	},
	"dsf_atwillPowers":{
		"source":"At-Will Powers",
		"fields":{
			"mod":"name"
		}
	},
	"dsf_senses":{
		"source":"Vision",
		"fields":{
			"mod":"name"
		}
	},
	"dsf_languages":{
		"source":"Language",
		"fields":{
			"mod":"name"
		}
	},
	"dsf_feats":{
		"source":"Feat",
		"fields":{
			"link":"url",
			"mod":"name"
		}
	},
	"dsf_classFeature":{
		"source":"Class Feature",
		"fields":{
			"top":"desc",
			"mod":"name"
		}
	},
	"dsf_raceFeature":{
		"source":"Racial Trait",
		"fields":{
			"tip":"desc",
			"mod":"name"
		}
	}
};

function csx_importFile(){

	// Abort if no file was selected
	var file = document.querySelector( '.import_browser' ).files[ 0 ];
	if ( file == null )
		return;
		
	// Warn the user about overwrite and confirm
	document.querySelector( '.import_confirm' ).style.display = 'none';
	var proceed = window.confirm( 'Importing a character will overwrite most of the fields on the character sheet. Are you sure you want to continue?' );
	if ( !proceed ){
		document.querySelector( '.import_browser' ).value = null;
		return;
	}
		
	// Read the file provided
	var reader = new FileReader();
	reader.onload = function( e ){
		
		// Convert file contents to data
		var data = null;
		var parser = new DOMParser();
		data = parser.parseFromString( e.target.result, "text/xml" );
		
		// Digest the data into a broker directory
		var directory = {};

		// Add Aliases to the directory
		var aliases = data.getElementsByTagName( 'alias' );
		for ( var i = 0; i < aliases.length; i++ ){
			var name = aliases[ i ].getAttribute( 'name' );
			directory[ name ] = {};
			directory[ name ].node = aliases[ i ].parentNode;
			directory[ name ].value = aliases[ i ].parentNode.getAttribute( 'value' );
			directory[ name ].mods = {};
			var statadds = aliases[ i ].parentNode.getElementsByTagName( 'statadd' );
			for ( var n = 0; n < statadds.length; n++ ){
				var value = statadds[ n ].getAttribute( 'value' );
				var type = statadds[ n ].getAttribute( 'type' );
				if ( !value || !type )
					continue;
				if ( directory[ name ].mods[ type ] ){
					if ( value > directory[ name ].mods[ type ] ){
						directory[ name ].mods[ type ] = value;
					}
				}
				else{
					directory[ name ].mods[ type ] = value;
				}
			}
		}
		
		// Add Details to the directory
		var details = data.getElementsByTagName( 'Details' )[ 0 ].childNodes;
		for ( var i = 0; i < details.length; i++ ){
			var name = details[ i ].tagName;
			if ( !directory[ name ] && name ){
				directory[ name ] = {};
				directory[ name ].value = csx_clean( details[ i ].textContent );
			}
		}
		
		// Add RulesElements to the directory
		var elements = data.getElementsByTagName( 'RulesElementTally' )[0].getElementsByTagName( 'RulesElement' );
		for ( var i = 0; i < elements.length; i++ ){
			var type = elements[ i ].getAttribute( 'type' );
			var name = elements[ i ].getAttribute( 'name' );
			if ( type && name ){
				if ( !directory[ type ] )
					directory[ type ] = {};
				if ( !directory[ type ].entries )
					directory[ type ].entries = [];
					
				var entry = {};
				entry.node = elements[ i ];
				entry.name = name;
				entry.url = elements[ i ].getAttribute( 'url' );
				var specific = elements[ i ].getElementsByTagName( 'specific' )[0];
				if ( specific )
					entry.desc = csx_clean( specific.textContent );
				directory[ type ].entries.push( entry );
				directory[ type ].value = name;
			}
		}
		
		// Add Power details to the directory
		directory[ 'Daily Powers' ] = {};
		directory[ 'Daily Powers' ][ 'entries' ] = [];
		directory[ 'Encounter Powers' ] = {};
		directory[ 'Encounter Powers' ][ 'entries' ] = [];
		directory[ 'At-Will Powers' ] = {};
		directory[ 'At-Will Powers' ][ 'entries' ] = [];
		
		var powers = data.getElementsByTagName( 'Power' );
		for ( var i = 0; i < powers.length; i++ ){
			var usage = csx_clean( powers[ i ].getElementsByTagName( 'specific' )[0].textContent );
			if ( usage.match( /Encounter/ ) )
				usage = 'Encounter';
			else if ( usage.match( /Daily/ ) )
				usage = 'Daily';
			else if ( usage.match( /At-Will/ ) )
				usage = 'At-Will';
			else
				continue;
				
			var name = powers[ i ].getAttribute( 'name' );
			
			directory[ usage + ' Powers' ].entries.push( { "name":name, "usage":usage, "node":powers[ i ] } );
		}
		
		// Make sure things we'll do math on are numbers
		directory[ 'Strength modifier' ].value = parseInt( directory[ 'Strength modifier' ].value );
		directory[ 'Constitution modifier' ].value = parseInt( directory[ 'Constitution modifier' ].value );
		directory[ 'Dexterity modifier' ].value = parseInt( directory[ 'Dexterity modifier' ].value );
		directory[ 'Intelligence modifier' ].value = parseInt( directory[ 'Intelligence modifier' ].value );
		directory[ 'Wisdom modifier' ].value = parseInt( directory[ 'Wisdom modifier' ].value );
		directory[ 'Charisma modifier' ].value = parseInt( directory[ 'Charisma modifier' ].value );
		directory[ 'HALF-LEVEL' ].value = parseInt( directory[ 'HALF-LEVEL' ].value );
		directory[ 'Hit Points' ].value = parseInt( directory[ 'Hit Points' ].value );
		directory[ 'AC' ].mods[ 'Armor' ] = parseInt( directory[ 'AC' ].mods[ 'Armor' ] );

		// Handle one-offs and special cases
		directory[ 'Base Speed' ] = {};
		directory[ 'Base Speed' ].value = directory[ 'Speed' ].node.getElementsByTagName( 'statadd' )[0].getAttribute( 'value' );
		
		directory[ 'Strength Plus Half Level' ] = { "value":directory[ 'Strength modifier' ].value + directory[ 'HALF-LEVEL' ].value };
		directory[ 'Constitution Plus Half Level' ] = { "value":directory[ 'Constitution modifier' ].value + directory[ 'HALF-LEVEL' ].value };
		directory[ 'Dexterity Plus Half Level' ] = { "value":directory[ 'Dexterity modifier' ].value + directory[ 'HALF-LEVEL' ].value };
		directory[ 'Intelligence Plus Half Level' ] = { "value":directory[ 'Intelligence modifier' ].value + directory[ 'HALF-LEVEL' ].value };
		directory[ 'Wisdom Plus Half Level' ] = { "value":directory[ 'Wisdom modifier' ].value + directory[ 'HALF-LEVEL' ].value };
		directory[ 'Charisma Plus Half Level' ] = { "value":directory[ 'Charisma modifier' ].value + directory[ 'HALF-LEVEL' ].value };
		directory[ 'Ten Plus Half Level' ] = { "value":directory[ 'HALF-LEVEL' ].value + 10 };
		
		directory[ 'AC Ability Modifier' ] = { "value":Math.max( directory[ 'Dexterity modifier' ].value, directory[ 'AC' ].mods[ 'Armor' ] ) };
		directory[ 'Fortitude Ability Modifier' ] = { "value":Math.max( directory[ 'Strength modifier' ].value, directory[ 'Constitution modifier' ].value ) };
		directory[ 'Reflex Ability Modifier' ] = { "value":Math.max( directory[ 'Dexterity modifier' ].value, directory[ 'Intelligence modifier' ].value ) };
		directory[ 'Will Ability Modifier' ] = { "value":Math.max( directory[ 'Wisdom modifier' ].value, directory[ 'Charisma modifier' ].value ) };
		
		directory[ 'Surge Value' ] = { "value":Math.round( directory[ 'Hit Points' ].value / 4 ) };
		directory[ 'Bloodied Value' ] = { "value":Math.round( directory[ 'Hit Points' ].value / 2 ) };
		
		// Send the digested data off to be useful
		csx_applyData( directory );
		
	}
	reader.readAsText( file );
}

function csx_applyData( directory ){

	var fields = csx_opts.defaultContext.querySelectorAll( '.dsf' );
	for ( var i = 0; i < fields.length; i++ ){
		
		var name = fields[ i ].className.match( /dsf_[\w\d_]+/ )[0];
		if ( !name )
			continue;
		
		var key = csx_ddi_schema[ name ];
		if ( !key )
			continue;

		if ( typeof key == 'object' ){
			var source = directory[ key.source ];
			if ( !source )
				continue;
			
			var data = [];
			for ( var n = 0; n < source.entries.length; n++ ){
				var entry = {};
				for ( var field in key.fields ){
					entry[ field ] = source.entries[ n ][ key.fields[ field ] ];
				}
				data.push( entry );
			}
			
			fields[ i ].innerHTML = JSON.stringify( data );
			fields[ i ].parentNode.load();
		}
		else{
			var mod = false;
			if ( key.match( /\.[\w\s\d]+$/ ) )
				mod = key.replace( /^[\w\s\d]+\./, '' );
			
			key = key.replace( /\.[\w\s\d]+$/, '' );
			
			var source = directory[ key ];
			if ( !source )
				continue;
			
			var value = source.value;
			if ( mod ){
				if ( source.mods ){
					value = source.mods[ mod ];
					if ( !value )
						continue;
				}
				else
					continue;
			}
			
			if ( parseInt( value ) == 0 )
				continue;
			
			fields[ i ].innerHTML = value;
		}
		
	}
	
	// Call the callback for UI purposes
	document.querySelector( '.import_browser' ).value = null;
	csx_importDone();
	
}

function csx_clean( string ){

	return string.replace( /^[\s]+/,'').replace( /[\s]+$/,'' );

}

function csx_importDone(){
	document.querySelector( '.import_confirm' ).style.display = 'inline-block';
}