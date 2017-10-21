// Global Options
csx_opts = {
	'setupCallback': function(item){chainsawxiv_dd4e_simple_setup(item);},
	'uiContainer': function(){return document;},
	'defaultFieldValue':'',
	'imagePath':'https://chainsawxiv.github.io/DST/common/images/',
	'preloadFiles':[
		'add.png',
		'add_hover.png',
		'balance.png',
		'balance_hover.png',
		'bold_active.png',
		'bold_hover.png',
		'bullet.png',
		'fb_back_bottom.png',
		'fb_back_main.png',
		'fb_back_top.png',
		'grab.png',
		'grab_hover.png',
		'indent.png',
		'indent_active.png',
		'indent_hover.png',
		'italic.png',
		'italic_active.png',
		'italic_hover.png',
		'tip.png',
		'tip_hover.png',
		'trash.png',
		'trash_active.png',
		'trash_hover.png',
		'underline.png',
		'underline_active.png',
		'underline_hover.png'
	],
};

// Pre-Load Configuration
function chainsawxiv_dd4e_simple_dataPreLoad(opts){
	aisleten.characters.jeditablePlaceholder = csx_opts.defaultFieldValue;
}

// Master Startup
function chainsawxiv_dd4e_simple_dataPostLoad(data){

	csx_opts.defaultContext = document.getElementById(data.containerId);	
	csx_opts.uiContainer = csx_opts.defaultContext.querySelector('.uicontainer');
	csx_opts.isEditable = data.isEditable;

	// Force user off of management page when not editing
	if (!csx_opts.isEditable && localStorage[ 'lastPage' ] == 'manage' )
		localStorage[ 'lastPage' ] = 'crunch';

	// Include the shared script file
	var includes = document.createElement('script');
	includes.type = 'text/javascript';
	includes.src = 'https://chainsawxiv.github.io/DST/common/js/csx_dd4e_common.js';
	includes.onload = function(){

		// Fix container properties
		csx_firstParentWithClass(csx_opts.defaultContext,'dynamic_sheet_container').style.overflow = 'visible';
		
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
function chainsawxiv_dd4e_simple_setup(context){

	// Provide default context
	if (context == undefined)
		context = csx_opts.defaultContext;
	
	// Do setup for interfaces
	csx_edit(context);
	csx_tip(context);
	csx_list(context);
	csx_tab(context);

}

// Shutdown Before Save
function chainsawxiv_dd4e_simple_dataPreSave(){

	// Default the context if not set
	var context = csx_opts.defaultContext;

	// Bake everything down to its field values
	var edits = context.querySelectorAll('.dsf:not(.readonly),.edit');
	for (var i = 0; i < edits.length; i++)
		edits[i].unrender();

	var lists = context.querySelectorAll('.list');
	for (var i = 0; i < lists.length; i++)
		lists[i].unrender();		
		
}