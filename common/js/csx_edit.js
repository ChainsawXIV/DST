
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
			this.addEventListener('change', this.update, false);
			this.allowBlur = true;
			
		}
		
		// Select content and show edit interface on focus
		field.activate = function(e){
		
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