
//console.info("begin run golf js...");
/************************************************************** 
 * JavaScript module contains constant
 * Purpose: protect the variables against modification
 * Of special note:  you have to use the get() method on CONFIG
 **************************************************************/ 
var CONFIG = (function(my) {
	var private = {
		'START_GAME': 'game/start',
		'CLICK_ACTION': 'click'
	};
	my.get = function (name) {
		// console.info("get config for name:",name);
		return private[name]; 
	};
	
	return my;

})(CONFIG || {});

// console.info('CLICK_ACTION', CONFIG.get('CLICK_ACTION'));  
// console.info('START_GAME', CONFIG.get('START_GAME')); 
           
// var clickAction = 'click';
// var startGameTopic = 'game/start';

 
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
 * JavaScript module GOLFDB
 * Purpose: store all the game info
 * Of special note: loosed couple design, know nothing about view
 **************************************************************/ 
var GOLFDB = (function (my) {
	console.info("golf db...");
	my.course = '';
	my.player = null;
	my.holes = null;
	my.init = function (){
		console.info("GOLFDB.init（）");
		//
		// subscribe all the topics
		//
		$.subscribe(CONFIG.get('START_GAME'), function(course, player) {
			my.startGame(course, player);
		});
	};
	my.startGame = function (course, player) {
		console.info("start game, course:", course, ", player:", player);
		if(my.holes == null){
			// reset value first time
			my.holes = [];
			for(var i=0; i<18; i++){
				my.holes[i] = new HoleInfo ();
				my.holes[i].number = (i+1);
				my.holes[i].name = "Hole " +(i+1);
				
			}
		}

		console.info(my.holes);
	};
	
	return my;
}(GOLFDB || {}));


GOLFDB.init();


/************************************************************** 
 * JavaScript module GOLFVIEW
 * Purpose: responsible for updating views
 * Of special note: loosed couple design, know nothing about model
 **************************************************************/ 
var GOLFVIEW = (function (my) {
	console.info("golf view...");
	my.init = function (){
		console.info("GOLFVIEW.init（）");
		// bind ui click event
		$('#letsPlay').bind(CONFIG.get('CLICK_ACTION'), function(){
			console.info("click");
		
			GOLFVIEW.startGame();
		});
	};
	my.startGame = function () {
		console.info("start game...");
		var course = $('#course').val();
		var player = new PlayerInfo();
		player.name = $('#playername').val();
		player.tee = $('input[name=tee-choice]:checked').val();
		console.info("player: ", player);
		$.publish(CONFIG.get('START_GAME') , [course, player]);
	};
	

	return my;
}(GOLFVIEW || {}));


GOLFVIEW.init();



