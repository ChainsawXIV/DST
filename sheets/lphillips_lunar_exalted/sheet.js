// Global Storage
lphillips_lunar_exalted_context = {};

///////////////////////////////////////////////////
// Event Hooks /////////////////////////////////////
///////////////////////////////////////////////////

// Called immediately before the script fills the Span fields with data
function lphillips_lunar_exalted_dataPreLoad(opts){
	
	// Set the jeditable button
	aisleten.characters.jeditableSubmit = '<button class="jeditable_submit"><div class="jeditable_submit_text">&#10003;</div></button>';
	aisleten.characters.jeditablePlaceholder  = 'Click to edit';
	
}

// Called immediately after the script fills the Span fields with data, before jeditable attachement
function lphillips_lunar_exalted_dataPostLoad(opts){

	// Store global context for search by class name
	lphillips_lunar_exalted_context = document.getElementById(opts['containerId']);

	// Set additional options
	opts['imagePath'] = 'http://omnichron.net/external/op/src/lunar/';
	opts['context'] = document.getElementById(opts['containerId']);
	opts['debugThreshold'] = -1;
	
	//Convert interface elements
	lphillips_lunar_exalted_convertLists(opts);
	lphillips_lunar_exalted_convertPips(opts);
	lphillips_lunar_exalted_convertChecks(opts);
	lphillips_lunar_exalted_convertAreas(opts);

}

// Called immediately before the sheet's data is saved
function lphillips_lunar_exalted_dataPreSave(opts) {

	// Set additional options
	opts['context'] = document.getElementById(opts['containerId']);

	lphillips_lunar_exalted_unconvertPips(opts);
	lphillips_lunar_exalted_unconvertChecks(opts);	
	lphillips_lunar_exalted_unconvertAreas(opts);
	
}

///////////////////////////////////////////////////
// Pips Interface Control /////////////////////////////
///////////////////////////////////////////////////

// Applies a bunch of pips functionality to the specified element
function lphillips_lunar_exalted_pips(oElement,opts){

	// Store options
	oElement.setAttribute('optsImagePath',opts['imagePath']);
	oElement.setAttribute('optsIsEditable',opts['isEditable']);
	oElement.setAttribute('optsDebugThreshold',opts['debugThreshold']);

	// Gets the range of the element from its class name
	oElement.range = function(){
	
		// Get the range from the element's class name
		var iRange = this.className.match(/pipsRange_[\d]+/)[0].substring(10);

		// Default if needed, and return
		if (iRange != 3 && iRange != 5 && iRange != 7 && iRange != 10){
			this.error(1,"Invalid range specification in Pips Element (Element Class: " + this.className + ")");
			return 10;
		}
		else return iRange;
		
	};
	
	// Gets the field value from the embedded image or the text
	oElement.value = function(){
	
		// Get the value from the image if there is one
		if (this.getElementsByTagName('img').length){
			var sPath = this.getElementsByTagName('img')[0].src;
			var iValue = parseInt(sPath.substring(sPath.length - 9,sPath.length - 7),10);
		}
		
		// If there's no image, get the value from the text
		else{
			var iValue = parseInt(this.innerHTML);
			if (this.innerHTML == '') iValue = 0;
		}
		
		// Check the value for bad data, default if needed, and return
		if (isNaN(iValue) || iValue > this.range() || iValue < 0){
			this.error(1,"Invalid value for Pips Element (Element Class: " + this.className + ")");
			return 0;
		}
		else return iValue;
		
	};
	
	// Converts the associated span element's contents to a pips image
	oElement.showPips = function(){
		
		// Get the image path from options or default
		if (this.getAttribute('optsImagePath')) var sPath = this.getAttribute('optsImagePath');
		else{
			this.error(2,'No imagePath specified in options for pips element (Element Class: ' + this.className + ')');
			sPath = 'dynamic_sheets/exalted/0.1/images/';
		}
		
		// Skip fields with a value of -1
		if (this.value() == -1) return;

		// Replace the contents with the appropriate pips image
		this.innerHTML = '<img src="' + sPath + 'pips-' + this.padDigits(this.value(),2) + '-' + this.padDigits(this.range(),2) + '.png" />';
		
		// Activate the pips
		this.activate();		
	
	};
	
	// Converts the associated span element's contents to a text value
	oElement.showValue = function(){
	
		// Replace the contents with the appropriate value string
		this.innerHTML = this.value();
	
	};
	
	// Assigns clickability to a pips image element
	oElement.activate = function(){
	
		// Don't actualy activate anything if we're not in edit mode
		if (this.getAttribute('optsIsEditable') != 'true') return;

		// Activate the element's pips interface
		this.onclick = this.click;
		
		// Set the element's alt text
		this.title = 'Click to set value';
		
		// Set the cursor for the item
		this.style.cursor = 'pointer';

	};
	
	// Click event handler for the pips interface
	oElement.click = function(e){
	
		// Provide cross-browser support for the event information
		var oEvent;
		if (window.event) oEvent = window.event;
		else oEvent = e;
		
		// Set the pixel thresholds for each pip
		var totalPips = this.padDigits(this.range(),2);
		var aThresholds;
		aThresholds = [0,15,30,45,60,78,94,108,123,138];
		
		// Get the pips image that was clicked as a pips object
		var oImage = this.getElementsByTagName('img')[0];

		// Walk up the offset parent tree to get the true click coords
		var oTemp = oImage;
		var iX = oTemp.offsetLeft;
		if (oTemp.offsetParent){
			while (oTemp = oTemp.offsetParent){
				iX += oTemp.offsetLeft;
			} 
		}
		
		// Determine which pip the click was on and change the image
		var iClickX = oEvent.clientX - iX;		
		for (var iScore = this.range(); iScore >= 0; iScore--){
			if (iClickX > aThresholds[iScore]){

				// If the user clicks the current score, they probably want to reduce by one
				if ((iScore + 1) == this.value()){
					oImage.src = oImage.src.substring(0,oImage.src.length - 9) + this.padDigits(iScore,2) + "-" + this.padDigits(this.range(),2) + ".png";							
				}
				else{
					oImage.src = oImage.src.substring(0,oImage.src.length - 9) + this.padDigits(iScore + 1,2) + "-" + this.padDigits(this.range(),2) + ".png";
				}

				// Once the image has been set, we're done
				return;
				// Call the onUpdate event
				this.onUpdate();				
			}
		}		
	};

	// Error handling function - alerts on errors if bug reporting is on
	oElement.error = function(iImportance,sText){
		if (this.getAttribute('optsDebugThreshold')) var iThreshold = this.getAttribute('optsDebugThreshold');
		else iThreshold = 0;
		if (iImportance < iThreshold){
			alert(sText);
		}
	}

	// Converts a number to a string with prepended zeros to the specified character length
	oElement.padDigits = function(iNumber,iDigits){
		var sNumber = iNumber.toString();
		var sTemp = '';
		if (iDigits > sNumber.length){
				for (var i = 0; i < (iDigits - sNumber.length); i++){
						sTemp += '0';
				}
		}
		return sTemp + sNumber;
	} 

	// On Update event function, typicaly overriden
	oElement.onUpdate = function(){
	
	}	
	
	// Return the pips element for ease of refference
	return oElement;
	
}

// Converts all properly classed spans in the context to pips elements
function lphillips_lunar_exalted_convertPips(opts){

	// Get all the spans in the context, whatever it may be
	if (opts['context']) var aSpans = opts['context'].getElementsByTagName('span');
	else var aSpans = document.getElementsByTagName('span');
	
	// Convert all the potential values in the context to pips
	var pTemp = {};
	for (var i = 0; i < aSpans.length; i++){
		if (aSpans[i].className.match(/pips/)){
			pTemp = lphillips_lunar_exalted_pips(aSpans[i],opts);
			pTemp.showPips();
		}
	}
	
}

// Converts all the pips in the context back to thier basic values for saving
function lphillips_lunar_exalted_unconvertPips(opts) {

	// Get the working context
	if (opts['context']) var aSpans = opts['context'].getElementsByTagName('span');
	else var aSpans = document.getElementsByTagName('span');
	
	// Flip all the pips in the context back to values
	for(var i = 0; i < aSpans.length; i++){
		if(aSpans[i].className.match(/pips/)){
			aSpans[i].showValue();
		}
	}	
	
}

///////////////////////////////////////////////////
// List Interface Control /////////////////////////////
///////////////////////////////////////////////////

// Applies a bunch of list functionality to the specified element
function lphillips_lunar_exalted_list(oElement,opts){

	// Store options
	oElement.setAttribute('optsContainerId',opts['containerId']);
	oElement.setAttribute('optsIsEditable',opts['isEditable']);
	oElement.setAttribute('optsDebugThreshold',opts['debugThreshold']);
	
	// Parses the number of columns the list has from its class name
	oElement.columns = function(){
		
		// Get the column count from the element's class name
		var iColumns = this.className.match(/listColumns_[\d]+/)[0].substring(12);

		// Default if needed, and return
		if (isNaN(iColumns) || iColumns < 1){
			this.error(1,"Invalid column count specification in List Element (Element Class: " + this.className + ")");
			return 1;
		}
		else return iColumns;	
	
	};
	
	// Gets the list's list item template from the element based on class
	oElement.template = function(){
	
		// The template is the first div in the list with the "template" class
		var aDivs = this.getElementsByTagName('div');
		for (var i = 0; i < aDivs.length; i++){
			if (aDivs[i].className.match(/template/)) return aDivs[i];
		}

		// Create a semi-persistant default row template if needed
		if (!this.defaultTemplate){
			this.defaultTemplate = document.createElement('div');
			this.defaultTemplate.innerHTML = '<span class="dsf"></span>';
		}

		// If we got here, there wasn't a template in the list, default and return
		this.error(1,"No template row found in List Element (Element Class: " + this.className + ")");
		return this.defaultTemplate;
	
	};

	// Gets an array of the fields in the template row
	oElement.fields = function(){
	
		// This is easy assuming all the fields are span tags, and all the spans are fields
		return this.template().getElementsByTagName('span');
		
	}
	
	// Gets an array of the rows in the list, excluding the template
	oElement.rows = function(){

		// Initialize the list of rows
		var aRows = new Array();
	
		// Getting the divs in the list the hard way to avoid nested divs making the cut
		var aElements = this.childNodes;
		var aDivs = new Array();
		var iCounter = 0;
		for (var n = 0; n < aElements.length; n++){
			if (aElements[n].tagName == 'DIV'){
				aDivs[iCounter] = aElements[n];
				iCounter++;
			}
		}

		// If we have multiple columns, then get the rows from inside each one
		if (this.columns() > 1){
			var aTemp = new Array();
			for (var x = 0; x < aDivs.length; x++){
				if (!aDivs[x].className.match(/template/)){
					aTemp = aDivs[x].getElementsByTagName('div');
					for (var y = 0; y < aTemp.length; y++){
						aRows[aRows.length] = aTemp[y];
					}
				}
			}
		}
		
		// Otherwise just get them all from the main div
		else{
			for (var i = 1; i < aDivs.length; i++){
				aRows[aRows.length] = aDivs[i];
			}		
		}

		// Return the array of rows
		// This may have been dissacoiated by the splices, not sure  yet
		return aRows;
	
	}
	
	// Generates a structure containing the list's data from the save object
	oElement.loadData = function(){
		
		// Pattern match on the first field for simplicity's sake
		var iCounter = 0;
		var oData = {};

		// Get the fields in order (doesn't allow missing fileds)
		var sClassPattern = this.fields()[0].className.match(/dsf_[\w\d]+/)[0].substring(4);
		while (dynamic_sheet_attrs[sClassPattern + this.padDigits(iCounter,2)] != undefined){
			oData[iCounter] = new Array();
			for (var i = 0; i < this.fields().length; i++){
				oData[iCounter][i] = dynamic_sheet_attrs[this.fields()[i].className.match(/dsf_[\w\d]+/)[0].substring(4) + this.padDigits(iCounter,2)];
			}
			iCounter++;
		}
		
		// Write the length
		oData.length = iCounter;
		
		// Write the completed data structure to the object
		this.data = oData;

	}
		
	// Generates a structure contianing the list's data form the list itself
	oElement.parseData = function(){
	
		// Go through each row of each field and populate the structure
		var oData = {};
		oData.length = 0;
		for (var i = 0; i < this.rows().length; i++){
			oData[i] = new Array();
			for (var n = 0; n < this.fields().length; n++){
				oData[i][n] = this.rows()[i].getElementsByTagName('span')[n].innerHTML				
			}
			oData.length = i + 1;
		}
		
		// Write the completed data structure to the object
		this.data = oData;
	}
	
	// Renders out the code for the list and puts it into the list element
	oElement.render = function(){
	
		var sTemp = '';
		var iCurrentColumn = 1;
		var iBreak = 0;
		var sClass = '';

		// Add the first column opener if multiple columns, and calc first col break
		if (this.columns() > 1){
			sTemp = '\n<div class="column column_spacing">';
			iBreak += Math.floor(this.data.length / this.columns()) - 1;
			if (iCurrentColumn <= (this.data.length % this.columns())) iBreak++;
		}

		// Accumulate the list code for each row
		for (var i = 0; i < this.data.length; i++){

			// Populate and class the fields
			for (var n = 0; n < this.fields().length; n++){
				this.fields()[n].className = this.fields()[n].className.replace(/dsf_[\w\d]+/,this.fields()[n].className.match(/dsf_[\w\d]+/)[0] + this.padDigits(i,2));
				this.fields()[n].innerHTML = this.data[i][n];
			}
			
			// Add the list item to the code
			sTemp += this.template().innerHTML;
			
			// Reset the template if it was used					
			for (var x = 0; x < this.fields().length; x++){
				sClass = this.fields()[x].className.match(/dsf_[\w\d]+/)[0];
				this.fields()[x].className = this.fields()[x].className.replace(/dsf_[\w\d]+/,sClass.substring(0,sClass.length - 2));
				this.fields()[x].innerHTML = '';
			}
			
			// Add column breaks where needed
			if (this.columns() > 1 && (i == iBreak)){

				// Add the column opener for the last column
				if (iCurrentColumn == (this.columns() - 1)) sTemp += '</div>\n<div class="column">';
				// Add the final column's column closer
				else if (i == (this.data.length - 1)) sTemp += '</div>';
				// Add the column openers for other columns
				else sTemp += '</div>\n<div class="column column_spacing">';
								
				// Update the column break and current column
				iCurrentColumn++;
				iBreak += Math.floor(this.data.length / this.columns());
				if (iCurrentColumn <= (this.data.length % this.columns())) iBreak++;
			
			}
		}		
		
		// Prepend the template to the list code
		sTemp = '<div class="template">' + this.template().innerHTML + '</div>' + sTemp;
			
		// Purge jquery expandos in explorer
		sTemp = sTemp.replace(/jQuery[\d]+="[\d]+"/g,'');
			
		// Put the code in the list
		this.innerHTML = sTemp;
		
		// Activate the interface if in edit mode
		if (this.getAttribute('optsIsEditable') == 'true'){
			
			// Look through all the anchor elements in the list and activate by class name
			var aButtons = this.getElementsByTagName('a');
			for (var y = 0; y < aButtons.length;y++){
				if(aButtons[y].className.match(/listDelete/)) aButtons[y].onclick = this.deleteItem;
				else if(aButtons[y].className.match(/listPromote/)) aButtons[y].onclick = this.promoteItem;
				else if(aButtons[y].className.match(/listDemote/)) aButtons[y].onclick = this.demoteItem;
			}					
		}
		// Hide them if not
		else{
		
			// Look through all the anchor elements in the list and hide by class name
			var oContext = document.getElementById(this.getAttribute('optsContainerId'));
			if (oContext) var aButtons = oContext.getElementsByTagName('a');
			else{
				this.error(2,'No context specified in options for list element (Element Class: ' + this.className + ')');
				var aButtons = document.getElementsByTagName('a');
			}
			
			for (var y = 0; y < aButtons.length; y++){
				if(aButtons[y].className.match(/interface/)) aButtons[y].style.display = 'none';
			}
			
		}
		
		// Triger the list's onUpdate event
		this.onUpdate();
	
	};
	
	// Adds an blank element to the list
	oElement.addItem = function(){
	
		// Get the latest data from the list
		this.parseData();

		// Add a new row to the data, full of blank values
		var aRow = new Array();
		for (var i = 0; i < this.fields().length; i++){
			aRow[i] = '';
		}
		this.data[this.data.length] = aRow;
		this.data.length++;
		
		// Re-render the list
		this.render();
		
	};

	// Deletes the specified element from the list
	oElement.deleteItem = function(){
	
		// Activate the list the item belongs to
		var oItem = this.parentNode;
		if (oItem.parentNode.className.match(/list/)) var lList = oItem.parentNode;
		else var lList = oItem.parentNode.parentNode;

		// Stop here if we're editing things
		if (oItem.innerHTML.match(/input/)) return;
		
		// Delete the item from the DOM
		oItem.parentNode.removeChild(oItem);
		
		// Refresh the list to renew numbering
		lList.parseData();
		lList.render();
	
	};
	
	// Moves the specified element up the list one place
	oElement.promoteItem = function(){
	
		// Activate the list the item belongs to
		var oItem = this.parentNode;
		if (oItem.parentNode.className.match(/list/)) var lList = oItem.parentNode;
		else var lList = oItem.parentNode.parentNode;
		
		// Stop here if we're editing things
		if (oItem.innerHTML.match(/input/)) return;
		
		// Get the latest data from the list
		lList.parseData();
		
		// Figure out what row number was clicked
		var sFieldClass = oItem.getElementsByTagName('span')[0].className.match(/dsf_[\w\d]+/)[0];
		var sIndexString = sFieldClass.substring(sFieldClass.length - 2).replace(/^[0]+/,'');
		var iIndex = parseInt(sIndexString);
		
		// Stop right here if the clicked item is already at the top
		if (iIndex == 0) return;
		
		// Swap the row data with the one above it
		var aRowA = lList.data[iIndex];
		var aRowB = lList.data[iIndex - 1];			
		lList.data[iIndex] = aRowB;
		lList.data[iIndex - 1] = aRowA;
		
		// Re-render the data
		lList.render();
	
	};
	
	// Moves the specified element down the list one place
	oElement.demoteItem = function(){
	
		// Activate the list the item belongs to
		var oItem = this.parentNode;
		if (oItem.parentNode.className.match(/list/)) var lList = oItem.parentNode;
		else var lList = oItem.parentNode.parentNode;
		
		// Stop here if we're editing things
		if (oItem.innerHTML.match(/input/)) return;
		
		// Get the latest data from the list
		lList.parseData();
		
		// Figure out what row number was clicked
		var sFieldClass = oItem.getElementsByTagName('span')[0].className.match(/dsf_[\w\d]+/)[0];
		var sIndexString = sFieldClass.substring(sFieldClass.length - 2).replace(/^[0]+/,'');
		var iIndex = parseInt(sIndexString);
		
		// Stop right here if the clicked item is alreayd on the bottom
		if (iIndex == (lList.data.length - 1)) return;
		
		// Swap the row data with the one below it
		var aRowA = lList.data[iIndex];
		var aRowB = lList.data[iIndex + 1];			
		lList.data[iIndex] = aRowB;
		lList.data[iIndex + 1] = aRowA;
		
		// Re-render the data
		lList.render();
		
	};

	// Error handling function - alerts on errors if bug reporting is on
	oElement.error = function(iImportance,sText){
		if (this.getAttribute('optsDebugThreshold')) var iThreshold = this.getAttribute('optsDebugThreshold');
		else iThreshold = 0;
		if (iImportance < iThreshold){
			alert(sText);
		}
	}

	// Converts a number to a string with prepended zeros to the specified character length
	oElement.padDigits = function(iNumber,iDigits){
		var sNumber = iNumber.toString();
		var sTemp = '';
		if (iDigits > sNumber.length){
				for (var i = 0; i < (iDigits - sNumber.length); i++){
						sTemp += '0';
				}
		}
		return sTemp + sNumber;
	} 
	
	// On Update event function, typicaly overriden
	oElement.onUpdate = function(){
	
	}
	
	// Return the origenal element now that it's fully equipped
	return oElement;
	
}

// Converts all properly classed divs in the context to lists
function lphillips_lunar_exalted_convertLists(opts){

	// Find all the divs on the page with "list" in their class name
	if (opts['context']) var aDivs = opts['context'].getElementsByTagName('div');
	else var aDivs = document.getElementsByTagName('div');
	
	var lTemp = {};
	for (var i = 0; i < aDivs.length; i++){
		if (aDivs[i].className.match(/list/)){
		
			// Convert each element to a full featured list object
			lTemp = lphillips_lunar_exalted_list(aDivs[i],opts);		
			
			// Populate the list from the data variable
			lTemp.loadData();
			lTemp.render();
			
			// Assign the onUpdate function
			lTemp.onUpdate = function(){
			
				lphillips_lunar_exalted_convertPips(opts);
				aisleten.characters.bindAllFields(opts['slug'],opts['containerId']);
				//dst_devkit.bindDynamicAttributes();
			
			}
		}
	}	
	
}

///////////////////////////////////////////////////
// Text Area Edit Control ////////////////////////////
///////////////////////////////////////////////////

// Core Textarea Class
function lphillips_lunar_exalted_area(oElement,opts){

	// Store options
	oElement.setAttribute('optsIsEditable',opts['isEditable']);
	oElement.setAttribute('optsDebugThreshold',opts['debugThreshold']);
	
	// Attaches edit events to area text
	oElement.activate = function(){
		
		// Don't activate the element if we're not in edit mode
		if (this.getAttribute('optsIsEditable') != 'true') return;

		// Activate the element
		oElement.onclick = this.edit;
		
		// Add default value
		if (this.innerHTML == '') this.innerHTML = 'Click to edit';
		
		// Set the element's alt text
		this.title = 'Click to edit';
		
		// Set the cursor for the item
		this.style.cursor = 'pointer';
		
	};
	
	// Converts the element to an editable area
	oElement.edit = function(){
	
		// Abort click function if we just clicked submit
		if(this.getAttribute('eventLock') == 'locked'){
			this.setAttribute('eventLock',null);
			return;
		}

		// Disable click functionality
		this.onclick = null;
		
		// Set pointer
		this.style.cursor = 'text';
		
		// Remove default
		if (this.innerHTML == 'Click to edit') this.innerHTML = '';
		
		// Convert <br /> tags to line breaks
		var sText = this.innerHTML.replace(/<br>/g,'\n');
		
		// Convert content into form with button
		this.innerHTML = '<textarea class="area" style="width:' + (this.offsetWidth - 23) + 'px;height:' + (this.offsetHeight - 6) + 'px;">' + sText + '</textarea>';
		this.innerHTML += '<button class="submit_button area_submit" onClick="this.parentNode.submit();"><div class="area_submit_text">&#10003;</div></button>';

	};
	
	// Converts the edit box back into regular text form
	oElement.submit = function(){

		// Get the data from the edit box
		var sContent = this.getElementsByTagName('textarea')[0].value.replace(/\n/g,'<br>');
		
		// Remove the form elements
		this.innerHTML = sContent;
		
		// Lock out the click event until we're done
		this.setAttribute('eventLock','locked');	
		
		// Set pointer
		this.style.cursor = 'pointer';
		
		// Reattach the click functionality
		this.onclick = this.edit;
		
	};
	
	// Error handling function - alerts on errors if bug reporting is on
	oElement.error = function(iImportance,sText){
		if (this.getAttribute('optsDebugThreshold')) var iThreshold = this.getAttribute('debugThreshold');
		else iThreshold = 0;
		if (iImportance < iThreshold){
			alert(sText);
		}
	}
	
	// Return the element for ease of refference
	return oElement;
	
}

// Converts all properly classed divs in the context to lists
function lphillips_lunar_exalted_convertAreas(opts){

	// Find all the spans on the page with "area" in their class name
	if (opts['context']) var aSpans = opts['context'].getElementsByTagName('span');
	else var aSpans = document.getElementsByTagName('span');
	
	var taTemp = {};
	for (var i = 0; i < aSpans.length; i++){
		if (aSpans[i].className.match(/area/)){
		
			// Convert each element to a full featured list object
			taTemp = lphillips_lunar_exalted_area(aSpans[i],opts);
			taTemp.activate();

		}
	}	
	
}

// Sets the necesary class name on areas for themt o be saved
function lphillips_lunar_exalted_unconvertAreas(opts){

	// Find all the spans on the page with "area" in their class name
	if (opts['context']) var aSpans = opts['context'].getElementsByTagName('span');
	else var aSpans = document.getElementsByTagName('span');
	
	// Add the necesary save key to the class name
	// Also close out any active edit boxes
	for (var i = 0; i < aSpans.length; i++){
		if (aSpans[i].className.match(/area/)){
			if (aSpans[i].innerHTML.match(/textarea/)) aSpans[i].submit();
			if (aSpans[i].innerHTML == 'Click to edit') aSpans[i].innerHTML = '';
		}
	}	
}

///////////////////////////////////////////////////
// Check Interface Control ///////////////////////////
///////////////////////////////////////////////////

// Applies a bunch of pips functionality to the specified element
function lphillips_lunar_exalted_check(oElement,opts){

	// Store options
	oElement.setAttribute('optsImagePath',opts['imagePath']);
	oElement.setAttribute('optsIsEditable',opts['isEditable']);
	oElement.setAttribute('optsDebugThreshold',opts['debugThreshold']);
	
	// Gets the field value from the embedded image or the text
	oElement.value = function(){
	
		// Get the value from the image if there is one
		if (this.getElementsByTagName('img').length){
			var sPath = this.getElementsByTagName('img')[0].src;
			var sValue = sPath.substring(sPath.length - 5,sPath.length - 4);
		}
		
		// If there's no image, get the value from the text
		else{
			var sValue = this.innerHTML;
			if (this.innerHTML == '') sValue = '0';
		}
		
		// Check the value for bad data, default if needed, and return
		if (sValue != '1' && sValue != '0'){
			this.error(1,"Invalid value for Check Element (Element Class: " + this.className + ")");
			return 0;
		}
		else return sValue;
		
	};
	
	// Converts the associated span element's contents to a pips image
	oElement.showCheck = function(){
		
		// Get the image path from options or default
		if (this.getAttribute('optsImagePath')) var sPath = this.getAttribute('optsImagePath');
		else{
			this.error(2,'No imagePath specified in options for Checks element (Element Class: ' + this.className + ')');
			sPath = 'dynamic_sheets/exalted/0.1/images/';
		}
		
		// Replace the contents with the appropriate check image
		this.innerHTML = '<img src="' + sPath + 'check-' + this.value() + '.png" />';
		
		// Activate the check
		this.activate();		
	
	};
	
	// Converts the associated span element's contents to a text value
	oElement.showValue = function(){
	
		// Replace the contents with the appropriate value string
		this.innerHTML = this.value();
	
	};
	
	// Assigns clickability to a pips image element
	oElement.activate = function(){
	
		// Don't actualy activate anything if we're not in edit mode
		if (this.getAttribute('optsIsEditable') != 'true') return;

		// Activate the element's pips interface
		this.onclick = this.click;
		
		// Set the element's alt text
		this.title = 'Click to set value';
		
		// Set the cursor for the item
		this.style.cursor = 'pointer';

	};
	
	// Click event handler for the pips interface
	oElement.click = function(){
	
		// Get the pips image that was clicked as a pips object
		var oImage = this.getElementsByTagName('img')[0];
		
		// Determine which pip the click was on and change the image
		if (this.value() == "1") oImage.src = oImage.src.substring(0,oImage.src.length - 5) + "0.png";							
		else oImage.src = oImage.src.substring(0,oImage.src.length - 5) + "1.png";
		
		// Call the onUpdate event
		this.onUpdate();
		
	};

	// Error handling function - alerts on errors if bug reporting is on
	oElement.error = function(iImportance,sText){
		if (this.getAttribute('optsDebugThreshold')) var iThreshold = this.getAttribute('optsDebugThreshold');
		else iThreshold = 0;
		if (iImportance < iThreshold){
			alert(sText);
		}
	}

	// On Update event function, typicaly overriden
	oElement.onUpdate = function(){
	
	}	
	
	// Return the pips element for ease of refference
	return oElement;
	
}

// Converts all properly classed spans in the context to pips elements
function lphillips_lunar_exalted_convertChecks(opts){

	// Get all the spans in the context, whatever it may be
	if (opts['context']) var aSpans = opts['context'].getElementsByTagName('span');
	else var aSpans = document.getElementsByTagName('span');
	
	// Convert all the potential values in the context to pips
	var pTemp = {};
	for (var i = 0; i < aSpans.length; i++){
		if (aSpans[i].className.match(/check/)){
			pTemp = lphillips_lunar_exalted_check(aSpans[i],opts);
			pTemp.showCheck();
		}
	}
	
}

// Converts all the pips in the context back to thier basic values for saving
function lphillips_lunar_exalted_unconvertChecks(opts) {

	// Get the working context
	if (opts['context']) var aSpans = opts['context'].getElementsByTagName('span');
	else var aSpans = document.getElementsByTagName('span');
	
	// Flip all the pips in the context back to values
	for(var i = 0; i < aSpans.length; i++){
		if(aSpans[i].className.match(/check/)){
			aSpans[i].showValue();
		}
	}	
	
}

///////////////////////////////////////////////////
// General Utility Functions //////////////////////////
///////////////////////////////////////////////////

// Gets an array of elements with a particular class from the context
function lphillips_lunar_exalted_getElementsByClassName(sClassName,sElementType){

	// Provide default element type
	if (!sElementType) sElementType = 'div';

	var aList = new Array();
	var aDivs = lphillips_lunar_exalted_context.getElementsByTagName(sElementType);
	for (var i = 0; i < aDivs.length; i++){
		if (aDivs[i].className.match(sClassName)) aList[aList.length] = aDivs[i];
	}
	return aList;
	
}

// Tab switching function
function lphillips_lunar_exalted_tabClick(oTab,sPageClass){
	
	// Abort if already on the selected tab
	var oPage = lphillips_lunar_exalted_getElementsByClassName('page_' + sPageClass)[0];
	if (oPage.style.display != 'none') return;
	
	// Set the length of the shorter page to match the longer page
	var oPages = lphillips_lunar_exalted_getElementsByClassName('main');
	var iHeight = 0;
	for (var i = 0; i < oPages.length; i++){
		if (oPages[i].offsetHeight > iHeight) iHeight = oPages[i].offsetHeight;
	}
	for (var n = 0; n < oPages.length; n++){
		oPages[n].style.minHeight = (iHeight - 140) + 'px';
	}
	
	// Corelate the 'type' fields on the two pages
	var aTypes = lphillips_lunar_exalted_getElementsByClassName('dsf_type','span');
	if (sPageClass == 'sheet'){
		aTypes[0].innerHTML = aTypes[1].innerHTML;
	}
	else{
		aTypes[1].innerHTML = aTypes[0].innerHTML;	
	}
	
	// Show the proper pages and tabs
	if (sPageClass == 'sheet'){
		oTab.parentNode.style.backgroundImage = "url(http://omnichron.net/external/op/src/lunar/brass-tab-left.png)";
		lphillips_lunar_exalted_getElementsByClassName('page_sheet')[0].style.display = 'block';
		lphillips_lunar_exalted_getElementsByClassName('page_bio')[0].style.display = 'none';
	}
	else{
		oTab.parentNode.style.backgroundImage = "url(http://omnichron.net/external/op/src/lunar/brass-tab-right.png)";
		lphillips_lunar_exalted_getElementsByClassName('page_bio')[0].style.display = 'block';
		lphillips_lunar_exalted_getElementsByClassName('page_sheet')[0].style.display = 'none';
	}
	
}

