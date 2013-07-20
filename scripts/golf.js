/************************************************************** 
 * This is JavaScript libary for golf score phonegap application
 * To get latest code, go to 
 * https://github.com/qunsheng/GolfScoreboard
 **************************************************************/ 

/************************************************************** 
 * JavaScript module contains constant
 * Purpose: protect the variables against modification
 * Of special note:  you have to use the get() method on CONFIG
 **************************************************************/ 
var GOLF_CONFIG = (function(config) {
	var private = {
		//
		// topics from controller to model
		//
		'START_GAME': 'startGame',
		'PREV_HOLE': 'prevHole',
		'NEXT_HOLE': 'nextHole',
		'UPDATE_HOLE': 'updateHole',
		'GO_TO_HOLE': 'goToHole',
		// topics from model to controller
		'CURRENT_HOLE_INFO': 'currentHoleInfo',
		'CLICK_ACTION': 'click'
	};
	config.get = function (name) {
		// console.info("get config for name:",name);
		return private[name]; 
	};
	
	return config;

})(GOLF_CONFIG || {});
 
/************************************************************** 
 * HoleInfo object
 * Purpose: save golf hole information
 **************************************************************/ 
var HoleInfo = function () {

    this.name = ' ';
    this.number = 0;
    this.par = -1;
    this.drive = ' ';
    this.numToGreen = -1;
    this.numPutts = -1;
    this.less100ToGreen = null;
    this.penalties = 'N';
    this.totalNum = -1; // if totalNum > 0, then this hole is played

    return this;
};

 
/************************************************************** 
 * GameSummary object
 * Purpose: calculate summary
 **************************************************************/ 
var GameSummary = function () {

    this.score = 0;
    this.totalStrokers = 0;
    this.totalHolePlayed = 0;
    this.aveFairwayHit = 0; //%
    this.totalPutts = 0;
    this.avePuts = 0; //%
    this.ave100ToGreen = 0; //%
    this.avePenalty = 0;

    return this;
};

/************************************************************** 
 * PlayerInfo object
 * Purpose: save golf hole information
 **************************************************************/ 
var PlayerInfo = function () {

    this.name = ' ';
    this.tee = ' ';

    return this;
};


/************************************************************** 
 * JavaScript module GOLF_MODEL
 * Purpose: store all the game info
 * Of special note: loosed couple design, know nothing about view
 **************************************************************/ 
var GOLF_MODEL = (function (model) {
	model.course = '';
	model.player = null;
	model.holes = null;
	model.summary = null;
	model.currentHole = 0;
	model.init = function (){
		
		//
		// model subscribe topics
		//
		
		$.subscribe(GOLF_CONFIG .get('START_GAME'), function(course, player) {
			model.setGameInfo(course, player);
			model.currentHole = 0;
			model.publishCurrentHoleInfo();
		});

		
		$.subscribe(GOLF_CONFIG .get('GO_TO_HOLE'), function(holeNumber) {
			
			model.currentHole = parseInt(holeNumber)-1;
			console.info("current hole is: "+model.currentHole)
			model.publishCurrentHoleInfo();
		});

		$.subscribe(GOLF_CONFIG .get('NEXT_HOLE'), function() {
			if(model.currentHole <17){
				model.currentHole = model.currentHole + 1;
				model.publishCurrentHoleInfo();
			}else {
				console.info("last hole...");
			}

		});

		$.subscribe(GOLF_CONFIG .get('PREV_HOLE'), function() {
			if(model.currentHole >0){
				model.currentHole = model.currentHole - 1;
				model.publishCurrentHoleInfo();
			}else {
				console.info("first hole...");
			}

		});


		$.subscribe(GOLF_CONFIG .get('UPDATE_HOLE'), function(hole) {
			console.info("model update hole ", hole);
			model.updateHoleInfo(hole);
		});

	};
	model.setGameInfo = function (course, player) {
		console.info("model setGameInfo, course:", course, ", player:", player);
		if(model.holes == null){
			// reset value first time
			model.holes = [];
			for(var i=0; i<18; i++){
				model.holes[i] = new HoleInfo ();
				model.holes[i].number = (i+1);
				model.holes[i].name = "Hole " +(i+1);
				
			}
			model.summary = new GameSummary();
		}	
		console.info(model.holes);
	};
	model.publishCurrentHoleInfo = function () {
		console.info("model publishCurrentHoleInfo", model.holes[model.currentHole]);
		$.publish(GOLF_CONFIG.get('CURRENT_HOLE_INFO') , [model.holes[model.currentHole]]);
	};
	model.updateHoleInfo = function(hole){
		
		console.info("model updae hole info:",hole);
		
		model.holes[model.currentHole].par = hole.par;
		
		model.holes[model.currentHole].drive = hole.drive;
		
		model.holes[model.currentHole].numToGreen = hole.numToGreen;
		
		model.holes[model.currentHole].numPutts = hole.numPutts;
		
		model.holes[model.currentHole].less100ToGreen = hole.less100ToGreen;
		
		model.holes[model.currentHole].penalties = hole.penalties;
		
		model.holes[model.currentHole].par = hole.par;
		
		if(hole.numToGreen >0 && model.holes[model.currentHole].numPutts > 0){
			model.holes[model.currentHole].totalNum = parseInt(hole.numToGreen)+parseInt(hole.numPutts);
			model.calSummary();
		}

		console.info("model updae hole info:",model.holes[model.currentHole]);
		
	};
	model.calSummary = function(){
		console.info("calculate summary");
	};
	return model;
}(GOLF_MODEL || {}));


GOLF_MODEL.init();


/************************************************************** 
 * JavaScript module: GOLF_CONTROLER
 * Purpose: responsible for updating views
 * Of special note: loosed couple design, know nothing about model
 **************************************************************/ 
var GOLF_CONTROLER = (function (controller) {
	
	controller.init = function (){
		console.info("golf controller init...");
			
		//
		// subscribe all the topics
		//
		
		$.subscribe(GOLF_CONFIG.get('CURRENT_HOLE_INFO'), function(hole) {
			controller.displayHole(hole);
		});
				
		//
		// bind letsPlay click event
		//
		$('#letsPlay').bind(GOLF_CONFIG.get('CLICK_ACTION'), function(){
			console.info("letsPlay clicked");
		
			controller.startGame();
		});
		
				
		// 		
		// bind nextHole click event
		//
		
		$('#nextHole').bind(GOLF_CONFIG.get('CLICK_ACTION'), function(){
			controller.requestNextHoleInfo();	
		});
						
		// 		
		// bind prevHole click event
		//
		
		$('#prevHole').bind(GOLF_CONFIG.get('CLICK_ACTION'), function(){
			controller.requestPrevHoleInfo();	
		});
						
		// 		
		// bind holeLinks click event
		//
		
		$('#holeLinks a').each(function(){
			//console.info("find link", this);
			$(this).bind(GOLF_CONFIG.get('CLICK_ACTION'), function(e){
				 console.info("hole links clicked: ", e.target.id);
				 $.publish(GOLF_CONFIG.get('GO_TO_HOLE') , [e.target.id]);
			});
		});
		
								
		// 		
		// bind first9 click event
		//
				
		$('#first9List li a').each(function(){
			console.info("find first 9 link", this);
			$(this).bind(GOLF_CONFIG.get('CLICK_ACTION'), function(e){
				 console.info("hole links clicked: ", e.target);
				 $.publish(GOLF_CONFIG.get('GO_TO_HOLE') , [e.target.id]);
			});
		});
		
										
		// 		
		// bind back 9 click event
		//
				
		$('#back9List li a').each(function(){
			console.info("find back9List link", this);
			$(this).bind(GOLF_CONFIG.get('CLICK_ACTION'), function(e){
				 console.info("hole links clicked: ", e.target);
				 $.publish(GOLF_CONFIG.get('GO_TO_HOLE') , [e.target.id]);
			});
		});
		
	};
	
	controller.startGame = function () {
		console.info("start game...");
		var course = $('#course').val();
		var player = new PlayerInfo();
		player.name = $('#playername').val();
		player.tee = $('input[name=tee-choice]:checked').val();
		console.info("player: ", player);
		$.publish(GOLF_CONFIG.get('START_GAME') , [course, player]);
	};
	controller.displayHole = function (hole) {
		console.info("controller display hole", hole);
		//
		// set img
		//
		var imgString = 'images/h'+ hole.number  + '.png';
		$("#holeImg").attr("src", imgString);
				
		//
		// set par field
		//
		
		$('#par-choice-3').attr("checked", false).checkboxradio("refresh");			
		$('#par-choice-4').attr("checked", false).checkboxradio("refresh");			
		$('#par-choice-5').attr("checked", false).checkboxradio("refresh");			
		$('#par-choice-6').attr("checked", false).checkboxradio("refresh");

		switch(hole.par){
			
			case "3":
				$('input[name=par-choice]').filter('[value="3"]').next().click();
			break;
			
			case "4":
				$('input[name=par-choice]').filter('[value="4"]').next().click();
			break;
			
			case "5":
				$('input[name=par-choice]').filter('[value="5"]').next().click();
			break;
			
			case "6":
				$('input[name=par-choice]').filter('[value="6"]').next().click();
			break;
			
	
		}
		$('input[name=par-choice]').checkboxradio("refresh");
		
		
				
		//
		// set drive field
		//
		
		$('#drive-choice-fairway').attr("checked", false).checkboxradio("refresh");			
		$('#drive-choice-left').attr("checked", false).checkboxradio("refresh");			
		$('#drive-choice-right').attr("checked", false).checkboxradio("refresh");			

		switch(hole.drive){
			
			case "F":
				$('input[name=drive-choice]').filter('[value="F"]').next().click();
			break;
			
			case "L":
				$('input[name=drive-choice]').filter('[value="L"]').next().click();
			break;
			
			case "R":
				$('input[name=drive-choice]').filter('[value="R"]').next().click();
			break;

		}
		$('input[name=drive-choice]').checkboxradio("refresh");
		
		
						
		//
		// set strokes to green field
		//
		
		$('#to-green-choice-1').attr("checked", false).checkboxradio("refresh");			
		$('#to-green-choice-2').attr("checked", false).checkboxradio("refresh");			
		$('#to-green-choice-3').attr("checked", false).checkboxradio("refresh");			
		$('#to-green-choice-4').attr("checked", false).checkboxradio("refresh");

		$('#to-green-choice-5').attr("checked", false).checkboxradio("refresh");			
		$('#to-green-choice-6').attr("checked", false).checkboxradio("refresh");			


		switch(hole.numToGreen){
						
			case "1":
				$('input[name=to-green-choice]').filter('[value="1"]').next().click();
			break;
						
			case "2":
				$('input[name=to-green-choice]').filter('[value="2"]').next().click();
			break;
			
			case "3":
				$('input[name=to-green-choice]').filter('[value="3"]').next().click();
			break;
			
			case "4":
				$('input[name=to-green-choice]').filter('[value="4"]').next().click();
			break;
			
			case "5":
				$('input[name=to-green-choice]').filter('[value="5"]').next().click();
			break;
			
			case "6":
				$('input[name=to-green-choice]').filter('[value="6"]').next().click();
			break;
			
	
		}
		$('input[name=to-green-choice]').checkboxradio("refresh");
		
		
	
						
		//
		// set putts field
		//
				
		$('#putts-choice-0').attr("checked", false).checkboxradio("refresh");	
		$('#putts-choice-1').attr("checked", false).checkboxradio("refresh");			
		$('#putts-choice-2').attr("checked", false).checkboxradio("refresh");			
		$('#putts-choice-3').attr("checked", false).checkboxradio("refresh");			
		$('#putts-choice-4').attr("checked", false).checkboxradio("refresh");

		$('#putts-choice-5').attr("checked", false).checkboxradio("refresh");			
		$('#putts-choice-6').attr("checked", false).checkboxradio("refresh");			


		switch(hole.numPutts){
										
			case "0":
				$('input[name=putts-choice]').filter('[value="0"]').next().click();
			break;
					
			case "1":
				$('input[name=putts-choice]').filter('[value="1"]').next().click();
			break;
						
			case "2":
				$('input[name=putts-choice]').filter('[value="2"]').next().click();
			break;
			
			case "3":
				$('input[name=putts-choice]').filter('[value="3"]').next().click();
			break;
			
			case "4":
				$('input[name=putts-choice]').filter('[value="4"]').next().click();
			break;
			
			case "5":
				$('input[name=putts-choice]').filter('[value="5"]').next().click();
			break;
			
			case "6":
				$('input[name=putts-choice]').filter('[value="6"]').next().click();
			break;
			
	
		}
		$('input[name=putts-choice]').checkboxradio("refresh");
				
				
		//
		// set less100ToGreen field
		//
		
		$('#100-to-green-choice-s').attr("checked", false).checkboxradio("refresh");			
		$('#100-to-green-choice-fs').attr("checked", false).checkboxradio("refresh");			
		$('#100-to-green-choice-fo').attr("checked", false).checkboxradio("refresh");			

		switch(hole.less100ToGreen){
			
			case "S":
				$('input[name=100-to-green-choice]').filter('[value="S"]').next().click();
			break;
			
			case "FS":
				$('input[name=100-to-green-choice]').filter('[value="FS"]').next().click();
			break;
			
			case "FO":
				$('input[name=100-to-green-choice]').filter('[value="FO"]').next().click();
			break;

		}
		$('input[name=100-to-green-choice]').checkboxradio("refresh");
		
						
		//
		// set penalties field
		//
		
		$('#penalties-choice-y').attr("checked", false).checkboxradio("refresh");			
		$('#penalties-choice-n').attr("checked", false).checkboxradio("refresh");			
		
		switch(hole.penalties){
			
			case "Y":
				$('input[name=penalties-choice]').filter('[value="Y"]').next().click();
			break;
			
			case "N":
				$('input[name=penalties-choice]').filter('[value="N"]').next().click();
			break;
		
		}
		$('input[name=penalties-choice]').checkboxradio("refresh");
		
		
	};
	
	controller.requestNextHoleInfo = function(){
		console.info("controller requestNextHoleInfo " );
		controller.updateCurrentHole();
		$.publish(GOLF_CONFIG.get('NEXT_HOLE') , []);
	};
	
	controller.requestPrevHoleInfo = function(){
		console.info("controller requestPrevHoleInfo " );
		controller.updateCurrentHole();
		$.publish(GOLF_CONFIG.get('PREV_HOLE') , []);
	};
	
	controller.updateCurrentHole = function(){
		console.info("controller requestNextHoleInfo " );
		var hole = new HoleInfo ();
		// fill in the hole info from screen
		hole.par = $('input[name=par-choice]:checked').val();
		hole.drive =  $('input[name=drive-choice]:checked').val();
		hole.numToGreen =  $('input[name=to-green-choice]:checked').val();
		hole.numPutts = $('input[name=putts-choice]:checked').val();
		hole.less100ToGreen=  $('input[name=100-to-green-choice]:checked').val();
		//hole.penalties = $('#penalties').val();
		hole.penalties = $('input[name=penalties-choice]:checked').val();
		$.publish(GOLF_CONFIG.get('UPDATE_HOLE') , [hole]);
	};
	return controller;
}(GOLF_CONTROLER || {}));


GOLF_CONTROLER.init();



