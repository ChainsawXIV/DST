
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