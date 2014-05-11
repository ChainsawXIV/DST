
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