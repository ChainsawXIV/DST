// Global Options
csx_opts = {
	'setupCallback': function(item){CoD_setup(item);},
	'uiContainer': function(){return document;},
	'defaultFieldValue':'Click to edit',
	'imagePath':'https://chainsawxiv.github.io/DST/common/images/',
	'preloadFiles':[
		'add.png',
		'add_hover.png',
		'balance.png',
		'balance_hover.png',
		'bold_active.png',
		'bold_hover.png',
		'bullet.png',
		'crunch.png',
		'crunch_hover.png',
		'equipment.png',
		'equipment_hover.png',
		'fb_back_bottom.png',
		'fb_back_main.png',
		'fb_back_top.png',
		'fluff.png',
		'fluff_hover.png',
		'grab.png',
		'grab_hover.png',
		'indent.png',
		'indent_active.png',
		'indent_hover.png',
		'italic.png',
		'italic_active.png',
		'italic_hover.png',
		'magic.png',
		'magic_hover.png',
		'tip.png',
		'tip_hover.png',
		'trash.png',
		'trash_active.png',
		'trash_hover.png',
		'underline.png',
		'underline_active.png',
		'underline_hover.png',
		'solar/pip_off.png',
		'solar/pip_off_hover.png',
		'solar/pip_on.png',
		'solar/pip_on_hover.png',
		'solar/tab01_active.png',
		'solar/tab01_inactive.png',
		'solar/tab02_active.png',
		'solar/tab02_inactive.png',
		'solar/tab03_active.png',
		'solar/tab03_inactive.png',
		'solar/tab04_active.png',
		'solar/tab04_inactive.png',
		'solar/check_off.png',
		'solar/check_off_hover.png',
		'solar/check_on.png',
		'solar/check_on_hover.png',
	],
};

// Master Startup
function CoD_dataPostLoad(data){

	
	csx_opts.defaultContext = document.getElementById(data.containerId);	
	csx_opts.uiContainer = csx_opts.defaultContext.querySelector('.uicontainer');
	csx_opts.isEditable = data.isEditable;
	data['context'] = document.getElementById(data['containerId']);
	data['debugThreshold'] = -1;
	
	CoD_convertBoxes(data);

	// Include the shared script file
	var includes = document.createElement('script');
	includes.type = 'text/javascript';
	includes.src = 'https://chainsawxiv.github.io/DST/common/js/csx_exalted_common.js?v=dev001';
	includes.onload = function(){

		// Fix container properties
		csx_firstParentWithClass(csx_opts.defaultContext,'dynamic_sheet_container').style.overflow = 'visible';
		//csx_firstParentWithClass(csx_opts.defaultContext,'main-content-container').style.minWidth = '853px';
		
		// Set up the editing interface
		csx_opts.setupCallback();
		
	};
	document.body.appendChild(includes);
	
	// Preload rollover images 
	// Deferred to prevent blocking
	window.setTimeout(function(){
		if (document.images){
			for (var i = 0; i < csx_opts.preloadFiles.length; i++){
				var img = new Image();
				img.src = csx_opts.imagePath + csx_opts.preloadFiles[i];
			}
		}
	},500);
	
}

// Setup After Script Load
function CoD_setup(context){

	// Provide default context
	if (context == undefined)
		context = csx_opts.defaultContext;
	
	// Do setup for interfaces
	csx_pips(context);
	csx_check(context);
	csx_edit(context);
	csx_tip(context);
	csx_list(context);
	csx_tab(context);

}

// Shutdown Before Save
function CoD_dataPreSave(opts){
	
	// Set additional options
	opts['context'] = document.getElementById(opts['containerId']);

	CoD_unconvertBoxes(opts);

	// Default the context if not set
	var context = csx_opts.defaultContext;

	// Bake everything down to its field values
	var pips = context.querySelectorAll('.pips');
	for (var i = 0; i < pips.length; i++){
		if (pips[i].parentNode.className.match(/proto/))
			continue;
		pips[i].unrender();
	}
	
	var checks = context.querySelectorAll('.check');
	for (var i = 0; i < checks.length; i++)
		checks[i].unrender();

	var edits = context.querySelectorAll('.dsf:not(.readonly),.edit');
	for (var i = 0; i < edits.length; i++)
		edits[i].unrender();

	var lists = context.querySelectorAll('.list');
	for (var i = 0; i < lists.length; i++)
		lists[i].unrender();		
		
}
///////////////////////////////////////////////////
// Box Interface Control ////////////////////////
///////////////////////////////////////////////////

// Applies a bunch of pips functionality to the specified element
function CoD_box(oElement,opts){

	// Store options
	oElement.setAttribute('optsImagePath',opts['imagePath']);
	oElement.setAttribute('optsIsEditable',opts['isEditable']);
	oElement.setAttribute('optsDebugThreshold',opts['debugThreshold']);
	
	// Parses the title from the class name
	oElement.getTitle = function(){
		
		// Get the column count from the element's class name
		var sTitle = this.className.match(/title_[\w\d\s]+/);
		if (sTitle) sTitle = sTitle[0].substring(6);
		return sTitle;
	
	};
	
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
		if (sValue != '3' && sValue != '2' && sValue != '1' && sValue != '0'){
			this.error(1,"Invalid value for Box Element (Element Class: " + this.className + ")");
			return 0;
		}
		else return sValue;
		
	};
	
	// Converts the associated span element's contents to a pips image
	oElement.showBox = function(){
		
		// Get the image path from options or default
		if (this.getAttribute('optsImagePath')) var sPath = this.getAttribute('optsImagePath');
		else{
			this.error(2,'No imagePath specified in options for Checks element (Element Class: ' + this.className + ')');
			sPath = 'http://omnichron.net/external/op/src/vampire/';
		}
		
		// Replace the contents with the appropriate check image
		if (this.value() == "2") this.innerHTML = '<img src="https://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574212/box-2.png" />' ;
		if (this.value() == "3") this.innerHTML = '<img src="https://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574214/box-3.png" />' ;
		if (this.value() == "0") this.innerHTML = '<img src="https://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574202/box-0.png" />' ;
		if (this.value() == "1") this.innerHTML = '<img src="https://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574210/box-1.png" />' ;
		
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
		this.title = this.getTitle();
		if (!this.title) this.title = 'Click to set value';
		
		// Set the cursor for the item
		this.style.cursor = 'pointer';

	};
	
	// Click event handler for the pips interface
	oElement.click = function(){
	
		// Get the pips image that was clicked as a pips object
		var oImage = this.getElementsByTagName('img')[0];
		
		
		// Determine which pip the click was on and change the image
		if (this.value() == "1") {
			oImage.src = "https://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574212/box-2.png";
			//oLevel.value +=1;
		}
		else if (this.value()== "2") {
			oImage.src = "https://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574214/box-3.png";
			//oLevel.value +=1;
		}
		else if (this.value()== "3") {
			oImage.src = "https://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574202/box-0.png";
			//oLevel.value = 0;
		}
		else if (this.value() == "0") {
			oImage.src = "https://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574210/box-1.png";
			//this.value +=1;
		}
		//else oImage.src = "http://db4sgowjqfwig.cloudfront.net/campaigns/14253/assets/574184/box-0.png";
		
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
function CoD_convertBoxes(opts){

	// Get all the spans in the context, whatever it may be
	if (opts['context']) var aSpans = opts['context'].getElementsByTagName('span');
	else var aSpans = document.getElementsByTagName('span');
	
	// Convert all the potential values in the context to pips
	var pTemp = {};
	for (var i = 0; i < aSpans.length; i++){
		if (aSpans[i].className.match(/box/)){
			pTemp = CoD_box(aSpans[i],opts);
			pTemp.showBox();
		}
	}
	
}

// Converts all the pips in the context back to thier basic values for saving
function CoD_unconvertBoxes(opts) {

	// Get the working context
	if (opts['context']) var aSpans = opts['context'].getElementsByTagName('span');
	else var aSpans = document.getElementsByTagName('span');
	
	// Flip all the pips in the context back to values
	for(var i = 0; i < aSpans.length; i++){
		if(aSpans[i].className.match(/box/)){
			aSpans[i].showValue();
		}
	}	
	
}