/************************************************************** 
 * This is JavaScript libary for golf score phonegap application
 * To get latest code, go to 
 * https://github.com/qunsheng/GolfScoreboard
 **************************************************************/ 
var WEBCLOUZ= WEBCLOUZ || {};
WEBCLOUZ.GOLF= WEBCLOUZ.GOLF || {};

/************************************************************** 
 * JavaScript module contains constant
 * Purpose: protect the variables against modification
 * Of special note:  you have to use the get() method on CONFIG
 **************************************************************/ 
WEBCLOUZ.GOLF.CONFIG = (function(config) {
	var private = {
		//
		// topics from controller to model
		//
		'START_GAME': 'startGame',
		'SUBMIT_HOLE': 'sumitHole',
		'PREV_HOLE': 'prevHole',
		'NEXT_HOLE': 'nextHole',
		'UPDATE_HOLE': 'updateHole',
		'GO_TO_HOLE': 'goToHole',
		//
		// topics from model to controller
		//
		'CURRENT_HOLE_INFO': 'currentHoleInfo',
		'SUMMARY_INFO': 'summaryInfo',
		'SCORE_CARD_INFO': 'scoreCardInfo',
		// event actions
		'CLICK_ACTION': 'click'
	};
	config.get = function (name) {
		// console.info("get config for name:",name);
		return private[name]; 
	};
	
	return config;

})(WEBCLOUZ.GOLF.CONFIG || {});
 
/************************************************************** 
 * HoleInfo constructor
 * Purpose: save golf hole information
 **************************************************************/ 
WEBCLOUZ.GOLF.HoleInfo = function () {

    this.name = ' ';
    this.number = 0;
    this.par = '4';
    this.drive = 'F';
    this.numToGreen = '2';
    this.numPutts = '2';
    this.less100ToGreen = 'N';
    this.penalties = 'N';
    this.totalNum = 0; // if totalNum > 0, then this hole is played
    this.score = 0;

    return this;
};

 
/************************************************************** 
 * GameSummary constructor
 * Purpose: calculate summary
 **************************************************************/ 
WEBCLOUZ.GOLF.GameSummary = function () {

	this.totalPar = 0;
    this.totalNum = 0;
    this.totalHolePlayed = 0;
    
    this.totalPutts = 0;
    this.totalDrive = 0;
    this.total100Less = 0;
    this.totalPenaltyHoles = 0;
    
    this.fairwayHit = 0;
    this.made100ToGreen = 0;
    
    this.score = 0; // totalNum - totalPar
    this.aveFairwayHit = 100; // fairwayHit/totalDrive
    this.avePuts = 0; // totalPutts/totalHolePlayed
    this.ave100ToGreen = 100; // made100ToGreen/total100Less
    this.avePenalty = 0; // totalPenaltyHoles/totalHolePlayed

    return this;
};

/************************************************************** 
 * PlayerInfo constructor
 * Purpose: save golf hole information
 **************************************************************/ 
WEBCLOUZ.GOLF.PlayerInfo = function () {
    this.name = ' ';
    this.tee = ' ';
    return this;
};

/************************************************************** 
 * JavaScript module WEBCLOUZ.GOLF.MODEL
 * Purpose: store all the game info
 * Of special note: loosed couple design, know nothing about view
 **************************************************************/ 
WEBCLOUZ.GOLF.MODEL = (function (model) {
	model.course = '';
	model.player = null;
	model.holes = null;
	model.summary = null;
	model.currentHole = 0;
	//
	// init
	//
	model.init = function (){
		
		//
		// model subscribe topics
		//
		
		$.subscribe(WEBCLOUZ.GOLF.CONFIG .get('START_GAME'), function(course, player) {
			model.setGameInfo(course, player);
			model.currentHole = 0;
			model.publishCurrentHoleInfo();
		});

		
		$.subscribe(WEBCLOUZ.GOLF.CONFIG .get('GO_TO_HOLE'), function(holeNumber) {
			
			model.currentHole = parseInt(holeNumber)-1;
			console.info("current hole is: "+model.currentHole)
			model.publishCurrentHoleInfo();
		});

		$.subscribe(WEBCLOUZ.GOLF.CONFIG .get('NEXT_HOLE'), function() {
			if(model.currentHole <17){
				model.currentHole = model.currentHole + 1;
				model.publishCurrentHoleInfo();
			}else {
				console.info("last hole...");
			}

		});

		$.subscribe(WEBCLOUZ.GOLF.CONFIG .get('PREV_HOLE'), function() {
			if(model.currentHole >0){
				model.currentHole = model.currentHole - 1;
				model.publishCurrentHoleInfo();
			}else {
				console.info("first hole...");
			}

		});

		$.subscribe(WEBCLOUZ.GOLF.CONFIG .get('SUBMIT_HOLE'), function() {
			model.publishCurrentHoleInfo();
		});


		$.subscribe(WEBCLOUZ.GOLF.CONFIG .get('UPDATE_HOLE'), function(hole) {
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
				model.holes[i] = new WEBCLOUZ.GOLF.HoleInfo ();
				model.holes[i].number = (i+1);
				model.holes[i].name = "Hole " +(i+1);
				
			}
			model.summary = new WEBCLOUZ.GOLF.GameSummary();
		}	
		console.info(model.holes);
	};
	model.publishCurrentHoleInfo = function () {
		console.info("model publishCurrentHoleInfo", model.holes[model.currentHole]);
		$.publish(WEBCLOUZ.GOLF.CONFIG.get('CURRENT_HOLE_INFO') , [model.holes[model.currentHole]]);
	};
	model.publishScoreCardInfo = function(hole){
		console.info("model publishScoreCardInfo", hole);
		$.publish(WEBCLOUZ.GOLF.CONFIG.get('SCORE_CARD_INFO') , [hole]);
	};
	model.publishSummaryInfo = function () {
		console.info("publish summary info");
		$.publish(WEBCLOUZ.GOLF.CONFIG.get('SUMMARY_INFO') , [model.summary]);
	};
	model.updateHoleInfo = function(hole){
		
		console.info("model updae hole info:",hole);
		var holeNumber = parseInt(hole.number);
		
		console.info("model updae hole info:"+holeNumber);
		var currentIndex = holeNumber -1;
		
		model.holes[currentIndex].par = hole.par;
		
		model.holes[currentIndex].drive = hole.drive;
		
		model.holes[currentIndex].numToGreen = hole.numToGreen;
		
		model.holes[currentIndex].numPutts = hole.numPutts;
		
		model.holes[currentIndex].less100ToGreen = hole.less100ToGreen;
		
		model.holes[currentIndex].penalties = hole.penalties;
		
		model.holes[currentIndex].par = hole.par;
		
		model.holes[currentIndex].totalNum = parseInt(hole.numToGreen)+parseInt(hole.numPutts);
		model.holes[currentIndex].score =model.holes[model.currentHole].totalNum - parseInt( hole.par);
		
		console.info("model updae hole info:",model.holes[currentIndex]);
		model.publishScoreCardInfo(model.holes[currentIndex]);
		model.calSummary();

		
	};
	model.calSummary = function(){

		console.info("================ calculate summary" );
		model.summary.totalPar = 0;
		model.summary.totalNum = 0;
		model.summary.totalHolePlayed = 0;
			
		model.summary.totalPutts = 0;		
		model.summary.totalDrive = 0;		
		model.summary.total100Less = 0;		
		
		model.summary.totalPenaltyHoles = 0;
		model.summary.fairwayHit = 0;
		model.summary.made100ToGreen = 0;
		
		for(var i=0; i<18; i++){
			console.info("check hole : "+i+ " based on totalNum: "+ model.holes[i].totalNum );
			if(model.holes[i].totalNum > 0){
				console.info("hole played: "+i);
				model.summary.totalPar += parseInt(model.holes[i].par);
				model.summary.totalHolePlayed ++;
				model.summary.totalNum +=model.holes[i].totalNum ;
				model.summary.totalPutts += parseInt(model.holes[i].numPutts);
				
				if(model.holes[i].drive == "S"){
					model.summary.totalDrive ++;
					model.summary.fairwayHit ++;
				} else if (model.holes[i].drive == "L" || model.holes[i].drive == "R" ){
					model.summary.totalDrive ++;
				}
				
				if(model.holes[i].less100ToGreen == "S"){
					model.summary.total100Less ++;
					model.summary.made100ToGreen ++;
				} else if (model.holes[i].less100ToGreen == "FS" || model.holes[i].less100ToGreen == "FO" ){
					model.summary.total100Less ++;
				}
				
				if(model.holes[i].penalties  == "Y"){
					model.summary.totalPenaltyHoles ++;
				}
			}	
		}

		model.summary.score = model.summary.totalNum - model.summary.totalPar;
		if(model.summary.totalDrive >0){
			model.summary.aveFairwayHit =  (model.summary.fairwayHit/model.summary.totalDrive) *100;
		}
		if(model.summary.totalHolePlayed > 0){
			model.summary.avePuts = model.summary.totalPutts/model.summary.totalHolePlayed ;
			
			model.summary.avePenalty = (model.summary.totalPenaltyHoles/model.summary.totalHolePlayed ) *100;	
		}
		if(model.summary.total100Less > 0){
			model.summary.ave100ToGreen = (model.summary.made100ToGreen/model.summary.total100Less ) *100;
		}else {
			model.summary.ave100ToGreen =100;
		}

		console.info("calculate summary",model.summary );
		model.publishSummaryInfo();
	};
	return model;
}(WEBCLOUZ.GOLF.MODEL || {}));


WEBCLOUZ.GOLF.MODEL.init();


/************************************************************** 
 * JavaScript module: WEBCLOU.GOLF.CONTROLER
 * Purpose: responsible for updating views
 * Of special note: loosed couple design, know nothing about model
 **************************************************************/ 
WEBCLOUZ.GOLF.CONTROLER = (function (controller) {
	
	controller.init = function (){
		console.info("golf controller init...");
			
		//
		// subscribe all the topics
		//
		
		$.subscribe(WEBCLOUZ.GOLF.CONFIG.get('CURRENT_HOLE_INFO'), function(hole) {
			controller.displayHole(hole);
		});
							
		$.subscribe(WEBCLOUZ.GOLF.CONFIG.get('SUMMARY_INFO'), function(summary) {
			controller.displaySummary(summary);
		});
				
		$.subscribe(WEBCLOUZ.GOLF.CONFIG.get('SCORE_CARD_INFO'), function(hole) {
			controller.displayScoreCard(hole);
		});
			
		//
		// bind letsPlay click event
		//
		$('#letsPlay').bind(WEBCLOUZ.GOLF.CONFIG.get('CLICK_ACTION'), function(){
			console.info("letsPlay clicked");
		
			controller.startGame();
		});
		
				
		// 		
		// bind nextHole click event
		//
		
		$('#nextHole').bind(WEBCLOUZ.GOLF.CONFIG.get('CLICK_ACTION'), function(){
			controller.requestNextHoleInfo();	
		});
						
		// 		
		// bind prevHole click event
		//
		
		$('#prevHole').bind(WEBCLOUZ.GOLF.CONFIG.get('CLICK_ACTION'), function(){
			controller.requestPrevHoleInfo();	
		});
			
									
		// 		
		// bind submitHole click event
		//
		
		$('#submitHole').bind(WEBCLOUZ.GOLF.CONFIG.get('CLICK_ACTION'), function(){
			controller.requestCurrentHoleInfo();	
		});
							
		// 		
		// bind holeLinks click event
		//
		
		$('#holeLinks a').each(function(){
			//console.info("find link", this);
			$(this).bind(WEBCLOUZ.GOLF.CONFIG.get('CLICK_ACTION'), function(e){
				 //console.info("hole links clicked: ", e.target.id);
				 $.publish(WEBCLOUZ.GOLF.CONFIG.get('GO_TO_HOLE') , [e.target.id]);
			});
		});
		
								
		// 		
		// bind first9 click event
		//
				
		$('#first9List li a').each(function(){
			//console.info("find first 9 link", this);
			$(this).bind(WEBCLOUZ.GOLF.CONFIG.get('CLICK_ACTION'), function(e){
				 //console.info("hole links clicked: ", e.target);
				 $.publish(WEBCLOUZ.GOLF.CONFIG.get('GO_TO_HOLE') , [e.target.id]);
			});
		});
		
										
		// 		
		// bind back 9 click event
		//
				
		$('#back9List li a').each(function(){
			console.info("find back9List link", this);
			$(this).bind(WEBCLOUZ.GOLF.CONFIG.get('CLICK_ACTION'), function(e){
				 console.info("hole links clicked: ", e.target);
				 $.publish(WEBCLOUZ.GOLF.CONFIG.get('GO_TO_HOLE') , [e.target.id]);
			});
		});
		
	};
	
	controller.startGame = function () {
		console.info("start game...");
		var course = $('#course').val();
		var player = new WEBCLOUZ.GOLF.PlayerInfo();
		player.name = $('#playername').val();
		player.tee = $('input[name=tee-choice]:checked').val();
		console.info("player: ", player);
		$.publish(WEBCLOUZ.GOLF.CONFIG.get('START_GAME') , [course, player]);
	};
	controller.displayHole = function (hole) {
		console.info("controller display hole", hole);
		$("#currentHoleNumber").val(hole.number);
		//
		// set img
		//
		var imgString = 'images/h'+ hole.number  + '.png';
		$("#holeImg").attr("src", imgString);
		
		var scoreString = null;
		if(parseInt(hole.score) <= 0)	{
			scoreString = " + "+hole.score;
		} else {
			scoreString = " - "+hole.score;
		}
		$('#holeScore').text(scoreString);
		$('#holeTotal').text(hole.totalNum);
			
		//
		// set par field
		//

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
				
		//
		// set drive field
		//

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

						
		//
		// set strokes to green field
		//

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
			
		//
		// set putts field
		//

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
			
				
		//
		// set less100ToGreen field
		//

		switch(hole.less100ToGreen){
			
			case "N":
				$('input[name=100-to-green-choice]').filter('[value="N"]').next().click();
			break;
			
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
						
		//
		// set penalties field
		//

		switch(hole.penalties){		
			case "Y":
				$('input[name=penalties-choice]').filter('[value="Y"]').next().click();
			break;
			
			case "N":
				$('input[name=penalties-choice]').filter('[value="N"]').next().click();
			break;
		}


	};
	controller.displayScoreCard= function(hole){
		//
		// display first 9 and back 9 info
		//
		
		$("#"+ hole.number+"HoleTotal").html(hole.totalNum);
		$("#"+ hole.number+"HolePar").html(hole.par);
	};
	controller.displaySummary = function(summary){
		//
		// display summary info
		//
		$("#totalHolePlayedSum").html(summary.totalHolePlayed);
		$("#totalParSum").html(summary.totalPar);
		$("#totalNumSum").html(summary.totalNum);
		$("#scoreSum").html(summary.score);
		$("#totalPuttsSum").html(summary.totalPutts);	
		$("#avePutsSum").html(summary.avePuts);	
		$("#aveFairwayHitSum").html("%" + summary.aveFairwayHit);		
		$("#ave100ToGreenSum").html("%" + summary.ave100ToGreen  );		
		$("#avePenaltySum").html("%" + summary.avePenalty);
	};
	controller.requestNextHoleInfo = function(){
		console.info("controller requestNextHoleInfo " );
		controller.updateCurrentHole();
		$.publish(WEBCLOUZ.GOLF.CONFIG.get('NEXT_HOLE') , []);
	};
	controller.requestPrevHoleInfo = function(){
		console.info("controller requestPrevHoleInfo " );
		controller.updateCurrentHole();
		$.publish(WEBCLOUZ.GOLF.CONFIG.get('PREV_HOLE') , []);
	};
	controller.requestCurrentHoleInfo = function(){
		controller.updateCurrentHole();
		$.publish(WEBCLOUZ.GOLF.CONFIG.get('SUBMIT_HOLE') , []);
	};
	controller.updateCurrentHole = function(){
		//console.info("controller updateCurrentHole... " );
		var hole = new WEBCLOUZ.GOLF.HoleInfo ();
		
		// fill in the hole info from screen
		hole.number = $("#currentHoleNumber").val();
		
		hole.par = $('input[name=par-choice]:checked').val();
		hole.drive =  $('input[name=drive-choice]:checked').val();
		hole.numToGreen =  $('input[name=to-green-choice]:checked').val();
		hole.numPutts = $('input[name=putts-choice]:checked').val();
		hole.less100ToGreen=  $('input[name=100-to-green-choice]:checked').val();
		//hole.penalties = $('#penalties').val();
		hole.penalties = $('input[name=penalties-choice]:checked').val();
		
		console.info("controller updateCurrentHole", hole );
		$.publish(WEBCLOUZ.GOLF.CONFIG.get('UPDATE_HOLE') , [hole]);
	};
	return controller;
}(WEBCLOUZ.GOLF.CONTROLER || {}));

WEBCLOUZ.GOLF.CONTROLER.init();
