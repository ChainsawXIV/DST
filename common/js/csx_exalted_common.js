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
// Checks Interface Control

function csx_check(context){

	// Default the context if not set
	if (!context) context = document;
	
	// Convert each check field
	var checkFields = context.querySelectorAll('.check');
	for (var i = 0; i < checkFields.length; i++){

		var field = checkFields[i];
		
		// Gets the field value from the embedded image or the text
		field.value = function(){
		
			// Return the cached value if it exists
			if(this.valueCache != null)
				return this.valueCache;
		
			// Get the value from the text content, cache, and return
			var value = parseInt(this.innerHTML);
			if (this.innerHTML == '') value = 0;
			this.valueCache = value;
			return value;
			
		};
		
		// Converts the associated span element's contents to a pips image
		field.render = function(){
		
			// Replace the contents with the appropriate check image
			var status = (this.value()) ? 'checkOn' : 'checkOff';
			var mark = document.createElement('div');
			mark.className = 'checkMark ' + status;
			var border = document.createElement('div');
			border.className = 'checkBorder';
			this.innerHTML = '';
			mark.appendChild(border);
			this.appendChild(mark);
			
			// Activate the check
			this.activate();		
		
		};
		
		// Converts the associated span element's contents to a text value
		field.unrender = function(){
		
			// Replace the contents with the appropriate value string
			this.innerHTML = this.value();
		
		};
		
		// Assigns clickability to a pips image element
		field.activate = function(){
		
			// Only enable if editing
			if (!csx_opts.isEditable)
				return;

			// Activate the element's pips interface
			this.addEventListener('click', this.click, false);
			
			// Set the element's alt text
			if (!this.title)
				this.title = 'Click to toggle';

		};
		
		// Click event handler for the pips interface
		field.click = function(){
		
			// Flip the value of the field
			if(this.value() == 1)
				this.valueCache = 0;
			else
				this.valueCache = 1;
		
			// Rerender the field
			this.render();
			
			// Call the onUpdate event
			this.onUpdate();
			
		};

		// On Update event function, typicaly overriden
		field.onUpdate = function(){
		
		}
		
		// Render the field
		field.render();
		
	}
	
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
// Pips Interface Control

function csx_pips(context){

	// Default the context if not set
	if (!context) context = document;
	
	// Create the pips context menu if needed
	var pipsMenu = csx_opts.uiContainer.querySelector('#pipsMenu');
	if (!pipsMenu){
		pipsMenu = document.createElement('menu');
		pipsMenu.id = 'pipsMenu';
		pipsMenu.setAttribute('type','context');
		
		var showHide = document.createElement('menuitem');
		showHide.label = 'Hide Pips';
		showHide.onclick = function(){
			var targetField = this.parentNode.currentField;

			if (targetField.value().match(/[\s]*hidden/)){
				targetField.valueCache = targetField.value().replace(/[\s]*hidden/g,'');
				targetField.style.opacity = '1.0';
			}
			else{
				targetField.valueCache += ' hidden';
				targetField.style.opacity = '0.1';
			}
			targetField.innerHTML = '';
			targetField.render();
		}
		
		pipsMenu.appendChild(showHide);
		csx_opts.uiContainer.appendChild(pipsMenu);
	}

	// Convert each pips field
	var pipsFields = context.querySelectorAll('.pips');
	for (var i = 0; i < pipsFields.length; i++){
	
		var field = pipsFields[i];
		
		// Skip list item prototype fields
		if (field.parentNode.className.match(/proto/))
			continue;
		
		// Set the pixel threshold for each pip
		field.pipThresholds = [0,14,28,42,56,73,87,101,115,129,146,160];
		field.pipWidth = 15.0;
		field.pipRadius = 6.0;
		field.pipStrokeColor = '#000'; //'#19110E';
		field.pipStrokeThickness = 0.6;
		
		// Set context menu if needed
		if (csx_opts.isEditable &&  field.className.match(/pips_canHide/)){
			field.setAttribute('contextmenu','pipsMenu');
			field.addEventListener('mousedown', function(){
				this.rmousedown();
			}, false);
		}
		
		// Gets the total number of possible pips for the field
		field.range = function(){
		
			// Return cached value if it exists
			if(this.rangeCache != null)
				return this.rangeCache;
		
			// Get the range from the class, cache, and return
			var range = this.className.match(/pipsRange_[\d]+/)[0].substring(10);
			this.rangeCache = range;
			return range;
			
		};
		
		// Gets the current field value from text or image
		field.value = function(){
		
			// Return the cached value if it exists
			if(this.valueCache != null)
				return this.valueCache.toString();
			
			// Get the value from the text content, cache, and return
			var value = this.innerHTML;

			// Catch and fix rare cases of HTML being saved instead of a number
			if(isNaN(value)){
				var pips = this.querySelectorAll( '.pipOn' );
				if(pips)
					value = pips.length;
				else
					value = 0;
			}
		
			if (this.innerHTML == '') value = 0;
			this.valueCache = value;
			return value.toString();
			
		};
		
		// Converts the content to their visual representation
		field.render = function(){

			// Skip hidden fields
			var allowEdit = true;
			if (this.value()){
				if (this.value().match(/[\s]*hidden/)){
					allowEdit = false;
					if (csx_opts.isEditable)
						this.style.opacity = '0.1';
					else{
						this.innerHTML = '';
						return;
					}
				}
			}
			
			// Skip fields with a value of -1
			var intVal = parseInt(this.value());
			if (intVal == -1)
				return;
				
			// Replace the contents with the appropriate pips
			var border = document.createElement('div');
			border.className = 'pipBorder';
			
			this.innerHTML = '';
			for (var i = this.range() - 1; i >= 0; i--){
				var pip = document.createElement('div');
					pip.value = this.range() - i;
					pip.className = 'pip';
					pip.className += (pip.value <= intVal) ? ' pipOn' : ' pipOff';
					pip.style.right = this.pipThresholds[i] + 'px';
					pip.appendChild(border.cloneNode(false));
					
				if (allowEdit && csx_opts.isEditable){
					pip.addEventListener('click', function(){this.parentNode.click(this.value);}, false);
				}
				
				this.appendChild(pip);
				
			}

			// Activate the pips
			if (allowEdit && csx_opts.isEditable){
				this.title = 'Click to set value';
				this.style.cursor = 'pointer';
			}
		
		};
		
		// Converts the value back from image to text
		field.unrender = function(){
		
			// Replace the contents with the appropriate value string
			this.innerHTML = this.value();
		
		};
		
		// Click event handler for the pips interface
		field.click = function(clickedValue){
			
			// If the user clicks the current score, they probably want to reduce by one
			if (clickedValue == this.value())
				this.valueCache = clickedValue - 1;
			else
				this.valueCache = clickedValue;
	
			// Rerender the pips
			this.render();
					
			// Invoke the update event handler
			this.update();
					
			// Then we're done
			return;
					
		};

		// Right mouse down handler for menu control
		field.rmousedown = function(e){
			pipsMenu.currentField = this;
			if (this.value().match(/[\s]*hidden/))
				pipsMenu.querySelector('menuitem').label = 'Show Pips';
			else
				pipsMenu.querySelector('menuitem').label = 'Hide Pips';
		}
		
		// Padds a value with leading zeros to length
		field.pad = function(value,digits){

			value = value.toString();
			while (value.length < digits)
				value = '0' + value;
				
			return value;
			
		} 

		// On Update event function, typicaly overriden
		field.update = function(){
		
		}	
		
		// Convert the field value to pips display
		field.render();
				
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