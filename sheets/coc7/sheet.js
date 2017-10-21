/*
 * This is the javascript specific to the coc7 DST
 */


function coc7_dataPreLoad(options) {
  // Called just before the data is loaded.
  // alert("dataPreLoad");
}

function coc7_dataPostLoad(options) {
  // Called just after the data is loaded.
  // alert("dataPostLoad");
  coc7_recalculateAllAbilityBonuses() 
  coc7_recalculateDerivedStats()
}

function coc7_dataChange(options) {
  // Called immediately after a data value is changed.
  // alert("dataChange. " + options['fieldName'] + " = " + options['fieldValue']);
  coc7_recalculateDerivedStats()
}

function coc7_dataPreSave(options) {
  // Called just before the data is saved to the server.
  // alert("dataPreSave");
}

// You can define your own variables...just make sure to namespace them!
var coc7_abilities = [
  "str",
  "dex",
  "con",
  "siz",
  "app",
  "int",
  "pow",
  "edu"
];

function coc7_recalculateAllAbilityBonuses() {
  for(var i = 0; i < coc7_abilities.length; i++) {
    coc7_recalculateAbilityBonus(coc7_abilities[i]);
  }
}

function coc7_recalculateAbilityBonus(ability) {
  var score = jQuery('.dsf_' + ability).html();
  
  var mod = coc7_abilityHalf(score);
  jQuery('.dsf_' + ability + '_half').html(mod);
  
  var mod = coc7_abilityFifth(score);
  jQuery('.dsf_' + ability + '_fifth').html(mod);
}

function coc7_abilityHalf(score) {
  return Math.floor(parseInt(score) / 2.0);
}

function coc7_abilityFifth(score) {
  return Math.floor(parseInt(score) / 5.0);
}

function coc7_recalculateDerivedStats() {
  //Common variables
  var str = parseInt(jQuery('.dsf_str').html());
  var pow = parseInt(jQuery('.dsf_pow').html());
  var siz = parseInt(jQuery('.dsf_siz').html());
  var con = parseInt(jQuery('.dsf_con').html());
  var dex = parseInt(jQuery('.dsf_dex').html());

  //Magic value
  var magic = coc7_abilityFifth(pow)
    jQuery('.dsf_magicMax').html(magic);
	
  //Sanity values
  var mythos = parseInt(jQuery('.dsf_cthulhuMythos').html());
  if (isNaN(mythos)){
	  mythos = 0
  }
  jQuery('.dsf_sanityMax').html(100-mythos);
	
  //Hit Point values
  jQuery('.dsf_hpMax').html(Math.floor((siz + con)/ 10.0));
  
//Build and damage bonus values
  var strPlusSiz = str + siz
  var build = -2
  var damageBonus = ''
  
  if (strPlusSiz >= 2 && strPlusSiz <= 64){
	  build = -2
	  damageBonus = '-2'
  } else if (strPlusSiz >= 65 && strPlusSiz <= 84){
	  build = -1
	  damageBonus = -1
  } else if (strPlusSiz >= 85 && strPlusSiz <= 124){
	  build = 0
	  damageBonus = 0
  } else if (strPlusSiz >= 125 && strPlusSiz <= 164){
	  build = 1
	  damageBonus = '+1D4'
  } else if (strPlusSiz >= 164 && strPlusSiz <= 204){
	  build = 2
	  damageBonus = '+1D6'
  }
  jQuery('.dsf_build').html(build);
  jQuery('.dsf_damageBonus').html(damageBonus);
  
// Dodge value for Combat Section.
// Also sets Dodge Skill to zero if not a number or not defined.
  var dodge = parseInt(jQuery('.dsf_dodge').html());
  if (isNaN(dodge)){
	  dodge = 0
	  jQuery('.dsf_dodge').html(dodge);
  }
  jQuery('.dsf_dodge2').html(dodge);
  
// Determining Move Rate
  var move = 8;
  var age = parseInt(jQuery('.dsf_age').html());
  if (dex < siz && str < siz){
	  move = 7;
  } else if (dex > siz && str > siz){
	  move = 9;
  }
  if (age >= 40){
  move = move - ((Math.floor((age)/ 10.0))-3);
  } 
  jQuery('.dsf_move').html(move);
}