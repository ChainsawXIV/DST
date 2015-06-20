
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