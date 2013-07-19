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
		}	
		console.info(model.holes);
	};
	model.publishCurrentHoleInfo = function () {
		console.info("model publishCurrentHoleInfo", model.holes[model.currentHole]);
		$.publish(GOLF_CONFIG.get('CURRENT_HOLE_INFO') , [model.holes[model.currentHole]]);
	};
	model.updateHoleInfo = function(hole){
		console.info("model updae hole info:",hole);
	};
	return model;
}(GOLF_MODEL || {}));


GOLF_MODEL.init();


/************************************************************** 
 * JavaScript module GOLF_CONTROLER
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
		$('#letsPlay').bind(GOLF_CONFIG .get('CLICK_ACTION'), function(){
			console.info("letsPlay clicked");
		
			controller.startGame();
		});
		
				
		// 		
		// bind nextHole click event
		//
		
		$('#nextHole').bind(GOLF_CONFIG .get('CLICK_ACTION'), function(){
			controller.requestNextHoleInfo();	
		});
						
		// 		
		// bind holeLinks click event
		//
		
		$('#holeLinks a').each(function(){
			//console.info("find link", this);
			$(this).bind(GOLF_CONFIG .get('CLICK_ACTION'), function(e){
				 console.info("hole links clicked: ", e.target.id);
				 $.publish(GOLF_CONFIG.get('GO_TO_HOLE') , [e.target.id]);
			});
		});
		
								
		// 		
		// bind first9 click event
		//
				
		$('#first9List li a').each(function(){
			console.info("find first 9 link", this);
			$(this).bind(GOLF_CONFIG .get('CLICK_ACTION'), function(e){
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
		console.info("controller display hole: "+ hole.number );
		//
		// set img
		//
		var imgString = 'images/h'+ hole.number  + '.png';
		$("#holeImg").attr("src", imgString);
		
		//
		// set all fields
		//
	};
	controller.requestNextHoleInfo = function(){
		console.info("controller requestNextHoleInfo " );
		controller.updateCurrentHole();
		$.publish(GOLF_CONFIG.get('NEXT_HOLE') , []);
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
		hole.penalties = $('#penalties').val();
		$.publish(GOLF_CONFIG.get('UPDATE_HOLE') , [hole]);
	};
	return controller;
}(GOLF_CONTROLER || {}));


GOLF_CONTROLER.init();



