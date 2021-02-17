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
			
			// Move the bar back to the holding area
			csx_opts.uiContainer.appendChild(this);
			
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
			if ( this.innerHTML == '' ){
				if ( this.className.match( 'checkDefaultOn' ) )
					value = 1;
				else
					value = 0;
			}
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
			
			var listData = [];
			if ( dataString ){
				try{
					var listData = JSON.parse(dataString);				
				}
				catch( error ){
					console.error( "Unable to parse save blob for " + listName );
				}
			}

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
						var fieldValue = fields[fieldIndex].innerHTML.replace(/&/g,'&amp;').replace(/"/g,'&qq;');
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
			dataString = dataString.replace(/</g,'&lt;');
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
					if (fieldName in data){
						var fieldValue = data[fieldName].replace(/&qq;/g,'"').replace(/&amp;/g,'&');
						fields[fieldIndex].innerHTML = fieldValue;
					}
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
				textFields[fieldIndex].addEventListener('touchstart', function(e){
					this.parentNode.draggable = false;
					this.addEventListener('touchend', function(e){
						this.parentNode.draggable = true;
					}, false);
					this.addEventListener('touchleave', function(e){
						this.parentNode.draggable = true;
					}, false);
				}, false);
			}
			
			// Designate to higher scope when mousing a drag handle
			var dragHandle = item.querySelector('.handle');
			dragHandle.title = 'Drag to rearrange list';
			dragHandle.addEventListener('mousedown', function(e){
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
			dragHandle.addEventListener('touchstart', function(e){
				onHandle = true;
				var handle = this;
				
				this.touchend = function(e){
					onHandle = false;
					handle.clearEvents();
				}
				this.addEventListener('touchend', this.touchend, false);
				
				this.touchleave = function(e){
					this.handleTimeout = window.setTimeout(function(){
						onHandle = false;
						handle.clearEvents();
					},5);
				}
				this.addEventListener('touchleave', this.touchleave, false);
				
				this.touchenter = function(e){
					window.clearTimeout(handle.handleTimeout);
				}
				this.addEventListener('touchenter', this.touchenter, false);
				
				this.clearEvents = function(){
					this.removeEventListener('touchend',this.touchend);
					this.removeEventListener('touchleave',this.touchleave);
					this.removeEventListener('touchenter',this.touchenter);
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