'use strict';

//Variables
const BOX_SIZE = 40; //Dimesion of Grid Unit in px i.e. 40x40px
const TIME_LIMIT = 20; //Amount of time allowed to play game
const LIVES_REMAINING = 2; //Number of lives player gets before game over
const INIT_CONTINUE_LEVEL = 0; //Died on level with lives remaining
const INIT_CONTINUE_AFTER_TIMEOUT = 3; //Died on timout with lives remaining
const INIT_NEW_GAME = 1; //Flag indicating start of new game
const INIT_NEW_LEVEL = 2; //Flag indicating start of new level
const DBG_DRAW_OBSTACLES = true; //set to false to disable obstacles
const STARTING_LEVEL = 1; //set starting level. normally 1
const MAX_LEVEL = 10; //max game level
const MIN_OBS_LENGTH = 2; //minimum length of obstacles
var canvas = document.getElementById('myCanvas'); //Canvas HTML location
var ctx = canvas.getContext('2d'); //2 dimensional canvas rendering
ctx.font = '30px Arial'; //Text size and Font
ctx.fillStyle = '#00ff00'; //Text Color
Bug.level = STARTING_LEVEL; //Holds current level in range [1-9]
Bug.startGameSound = new Sound('sounds/accomplishment.wav');
Bug.bugSound = new Sound('sounds/movesound.wav');
Bug.endLevelSound = new Sound('sounds/end-level-victory.wav');
Bug.collisionSound = new Sound('sounds/bugdeath.wav');
Bug.ezSound = new Sound('sounds/jump01.wav');
Bug.timeOutSound = new Sound('sounds/loseSound.wav');


Bug.minCar = MIN_OBS_LENGTH; //Min number of cars/row
Bug.filenames = ['','','assets/green-52.png', //binary-80px
  'assets/green-109.png', //binary-120px
  'assets/green-167.png', //binary-160px
  'assets/green-195.png', //binary-200px
  'assets/green-225.png', //binary-240px
  'assets/green-280.png']; //binary-280px
Bug.ObsWidth = [40, 40, 52, 109, 167, 195, 225, 280];
Bug.maxSeparation = [11, 11, 10, 10, 10, 8, 8, 8, 7, 7];
Bug.minSeparation = [11, 11, 8, 6, 5, 4, 4, 4, 3, 3];
Bug.maxObsLength = [5, 5, 6, 6, 6, 6, 7, 7, 7, 7];
Bug.minObsLength = [5, 4, 4, 3, 3, 3, 3, 2, 2, 2];
Bug.maxVelocity = [3, 3, 4, 4, 5, 6, 7, 8, 9, 9];
Bug.minVelocity = [1, 2, 2, 2, 3, 3, 3, 4, 5, 6];

var ENDZONE_SLOTS = 3; //slots in level endzone
var ENDZONE_XPOS = [120, 320, 480];
Bug.inEndZone = 0; // counter of bugs in endzone
Bug.ezBugs = []; // array of bugs to display in endzone.
Bug.ezUpCounter = 0; // must be 1 to count as an endzone win
Bug.bugLives = []; // queue of bugs lives available to play.
Bug.pause = false;


/**
 * BUG Constructor - Create Bug Object
 */
function Bug() {
  this.image = new Image();
  this.image.src = 'assets/bug.png';
  this.width = BOX_SIZE;
  this.height = BOX_SIZE;
  this.xPos = (canvas.width/2) - (this.width);
  this.yPos = canvas.height - this.height;
}

Bug.prototype.bugRowNum = function() {
  return this.yPos/BOX_SIZE;
};

Bug.prototype.rightSide = function() {
  return this.xPos + this.width;
};

Bug.prototype.drawBug = function() {
  ctx.drawImage(this.image, this.xPos, this.yPos);
};

Bug.prototype.moveBug = function(event) {
  if(Bug.pause) return;
  if(Bug.gameOver) return;


  if(event.keyCode === 38 && this.yPos > BOX_SIZE) { //119
    //Bug is not in top row, go ahead an dmove it up
    this.yPos -= BOX_SIZE;
    this.image.src = 'assets/bug.png';
    Bug.ezUpCounter = 0;
    Bug.bugSound.play();
  }
  if(event.keyCode === 38 && this.yPos === BOX_SIZE && ENDZONE_XPOS.includes(this.xPos) && !Bug.ezUpCounter) { //119
    //Bug moving up from beneath endzone and is in front of opening
    if (!Bug.ezSlotIsFilled(this.xPos)) {
      //Bug is in front of an open slot but hasn't moved into it
      Bug.ezUpCounter++;
    }
  } else if (event.keyCode === 38 && Bug.ezUpCounter && !Bug.ezSlotIsFilled(this.xPos)) { //119
    //Bug moving up into open endzone slot.
    console.log('made it home!');
    this.image.src = 'assets/bug.png';
    Bug.fillEndzoneSlot(this.xPos);
    this.yPos = 0;
  }

  if(event.keyCode === 37 && this.xPos > 0) { //97
    this.xPos -= BOX_SIZE;
    this.image.src = 'assets/bug_left.png';
    Bug.ezUpCounter = (ENDZONE_XPOS.includes(this.xPos) ? 1 : 0 );
    Bug.bugSound.play();
  }

  if(event.keyCode === 39 && this.xPos < (canvas.width - this.width)){ //100
    this.xPos += BOX_SIZE;
    this.image.src = 'assets/bug_right.png';
    Bug.ezUpCounter = (ENDZONE_XPOS.includes(this.xPos) ? 1 : 0 );
    Bug.bugSound.play();
  }

  if(event.keyCode === 40 && this.yPos < (canvas.height - BOX_SIZE)) { //115
    this.yPos += BOX_SIZE;
    this.image.src = 'assets/bug_down.png';
    Bug.ezUpCounter = 0;
    Bug.bugSound.play();
  }

  if(this.yPos === 0) {
    Bug.winState();
  }
};

/**
 * Sound Constructor
 */
function Sound(src) {
  this.sound = document.createElement('audio');
  this.sound.src = src;
  this.sound.setAttribute('preload', 'auto');
  this.sound.setAttribute('controls', 'none');
  this.sound.style.display = 'none';
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  };
  this.stop = function() {
    this.sound.pause();
  };
}


/**
 * OBSTACLE constructor - Creates World Obstacles
 * @param {string} src - Url of object image
 * @param {number} h - Height of image in px
 * @param {number} w - Width of image in px
 * @param {number} startRow - Row number of this Obstacle Object
 * @param {boolean} movesRight - Image moves to RIGHT if TRUE/ LEFT if FALSE
 */
function Obstacle(src, h, w, startRow, movesRight) {
  this.image = new Image();
  this.image.src = src;
  this.width = w;
  this.height = h;
  this.movesRight = movesRight; //False if it moves left
  if (this.movesRight) {
    this.xPos = -w; //Put it off the left edge of screen
  } else {
    this.xPos = canvas.width;
  }
  this.startXpos = this.xPos;

  this.yPos = (startRow * BOX_SIZE);
  if (Bug.level > 3) {
    var l = Bug.level - 1;
    var v = Bug.randInRange(Bug.minVelocity[l],Bug.maxVelocity[l], false);
    // var v = this.randomVelocity();
    this.velocity = (this.movesRight ? v : -v);
  }
}

// Obstacle.prototype.randomVelocity = function() {
//   return Math.ceil(Math.random()*6);
// };

Obstacle.prototype.drawObstacle = function() {
  ctx.drawImage(this.image, this.xPos, this.yPos);
};

Obstacle.prototype.rightSide = function() {
  return this.xPos + this.width;
};

Obstacle.prototype.moveObstacle = function() {
  this.xPos += this.velocity;
  if(this.xPos > canvas.width || this.rightSide()<0) {
    this.xPos = this.startXpos;
    if (Bug.level > 3) {
      var l = Bug.level - 1;
      var v = Bug.randInRange(Bug.minVelocity[l],Bug.maxVelocity[l], false);
      // var v = this.randomVelocity();
      this.velocity = (this.movesRight ? v : -v);
    }
  }
};


/**
 * TRAINCAR Constructor - Creates new traincar object
 * @param {number} width - width in pixels
 * @param {number} xPos - starting x position
 * @param {number} velocity - rate that this object will move
 * @param {string} file - path name of object image file
 */
function Traincar(width, xPos, velocity, file) {
  this.width = width;
  this.xPos = xPos;
  this.velocity = velocity;
  this.filepath = file;
}

/**
 * Generates a number within a range
 * @param {number} min - lowest possible return
 * @param {number} max- highest possible return
 * @return {number} random integer within range
 */
Bug.randInRange = function(min, max, zeroInRange) {
  var z = (zeroInRange ? 0 : 1);
  return Math.floor(Math.random() * (max - min + z) + min);
};


/**
 * Creates a train of obstacle objects
 * @return {array} Array containing car and the trailing offset
 */
Bug.buildMetaTrain = function() {
  var trainLength = 0;
  var car=[], space=[];
  var l = Bug.level - 1;
  var i = 0;
  car[i] = Bug.randInRange(Bug.minObsLength[l], Bug.maxObsLength[l],false);
  space[i] = Bug.randInRange(Bug.minSeparation[l], Bug.maxSeparation[l], false);
  trainLength = car[i] + space[i];
  while (trainLength < canvas.width/BOX_SIZE) {
    i++;
    car[i] = Bug.randInRange(Bug.minObsLength[l], Bug.maxObsLength[l],false);
    if (trainLength + car[i] > canvas.width/BOX_SIZE) {car.pop; break;}
    trainLength += car[i];
    space[i] = Bug.randInRange(Bug.minSeparation[l], Bug.maxSeparation[l], false);
    if (trainLength + space[i] > canvas.width/BOX_SIZE) {space.pop;break;}
    trainLength += space[i];
  }
  return [car, space];
};


/**
 * Creates a train of Obstacles
 * @param {boolean} movesRight - TRUE = Moves to right / FALSE = Moves to left
 * @return {array} train - train of obstacles
 */
Bug.buildObsTrain = function(movesRight) {
  var l = Bug.level - 1;
  var xPos = (movesRight ? 0 : 640) + (Bug.randInRange(50,200, false)*(movesRight?1:-1));
  var metaTrain = Bug.buildMetaTrain();
  var car = metaTrain[0];
  var space = metaTrain[1];
  var train = [];
  var v = Bug.randInRange(Bug.minVelocity[l], Bug.maxVelocity[l], false) * (movesRight ? 1 : -1);
  for (var k = 0; k < car.length; k++) {
    train[k] = new Traincar(Bug.ObsWidth[car[k]], xPos, v, Bug.filenames[car[k]]);
    xPos += ((train[k].width + space[k]*BOX_SIZE) * (movesRight ? 1 : -1));
  }
  return train;
};


/**
 * Constructs top-most row of Obstacle Objects
 * @return none
 */
Bug.buildObstacleEndZone = function() {
  Bug.allObstacles.push([]);
  Bug.allObstacles[0].push(new Obstacle('assets/pcb-118.png',36,118,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/pcb-156.png',36,156,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/pcb-116.png',36,116,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/pcb-118.png',36,118,0,true));
  Bug.allObstacles[0][0].xPos = 0; // + 118+44 = 160
  Bug.allObstacles[0][1].xPos = 162; //162; //+160+40 = 360
  Bug.allObstacles[0][2].xPos = 362; //+120+40 = 520
  Bug.allObstacles[0][3].xPos = 522; //+75+50 = 580
  for (var i = 0; i < Bug.allObstacles[0].length; i++) {
    Bug.allObstacles[0][i].velocity = 0;
    Bug.allObstacles[0][i].yPos = 0;
  }
};


/**
 * Build all rows between ENDZONE and HOME ROW
 * @param {number} rowNum - Number assigned to Object rows
 */
Bug.buildObstacleRow = function(rowNum) {
  var trains = Bug.buildObsTrain(!!(rowNum%2));
  for (var t = 0; t < trains.length; t++) {
    Bug.allObstacles[rowNum][t] = (new Obstacle(
      trains[t].filepath, 36, trains[t].width, rowNum, !!(rowNum%2)));
    Bug.allObstacles[rowNum][t].xPos = trains[t].xPos;
    if (Bug.level <= 3) {
      Bug.allObstacles[rowNum][t].velocity = trains[t].velocity;
    }
  }
};


/**
 * Detect if Bug object contacts with any Obstacle object
 * @return {boolean}  - TRUE if obejcts collide / FALSE if they do not
 */
Bug.detectCollision = function() {
  var bugRow = Bug.player.bugRowNum(); //Retrieve Row that Bug is currently on
  if (Bug.allObstacles[bugRow]) {

    for (var i = 0; i < Bug.allObstacles[bugRow].length; i++) {
      var impactLeft = Bug.player.xPos >= Bug.allObstacles[bugRow][i].xPos && Bug.player.xPos <= Bug.allObstacles[bugRow][i].rightSide();
      var impactRight = Bug.player.rightSide() >= Bug.allObstacles[bugRow][i].xPos && Bug.player.rightSide() <= Bug.allObstacles[bugRow][i].rightSide();
      if (impactLeft||impactRight) {
        Bug.collisionSound.play();
        return true;
      }
    }
  }
  return false;
};


/**
 * Calls for objects to be rendered and tests for collisions
 */
Bug.renderGame = function(){
  Bug.createFrame(); //Render Objects
  if(Bug.detectCollision()) { //Detect Collision
    Bug.loseState();
  }
};


/**
 * Displays Objects to Canvas
 */
Bug.createFrame = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear Canvas
  for (var i = 0; i < Bug.allObstacles.length; i++) { //Move and Draw Obstacles
    for (var j = 0; j < Bug.allObstacles[i].length; j++) {
      Bug.allObstacles[i][j].moveObstacle();
      Bug.allObstacles[i][j].drawObstacle();
    }
  }
  for (i = 0; i < Bug.ezBugs.length; i++) {
    Bug.ezBugs[i].drawBug();
  }
  for (i = 0; i < Bug.bugLives.length; i++) {
    Bug.bugLives[i].drawBug();
  }
  ctx.fillText('Time:' + Bug.clock + ' Level: ' + Bug.level, 15, 475); //Draw countdown clock
  Bug.player.drawBug(); //Draw Bug
};


/**
 * Calculate and Display Score to Canvas
 * @return {number} totalScore - Player Score
 */
Bug.displayScore = function() {
  var totalScore = parseInt(JSON.parse(localStorage.getItem('score')) || 0);
  console.log('local storage opening score', totalScore);
  var rowsCompleted = (Bug.level-1)*30 + Bug.inEndZone*10 +
    (11 - Bug.player.yPos/BOX_SIZE);
  var rowScore = 10 * rowsCompleted; // 10 points per row completed

  // bonus for each bug parked in the end zone
  var finalRowBonus = ((Bug.level-1)*3 + Bug.inEndZone) * 100;
  console.log('final rows completed',finalRowBonus/100);
  //Bonus for time left on clock
  var timeBonus = 0;
  if (Bug.inEndZone > 0) {
    timeBonus = Bug.clock*10;
  }

  totalScore += rowScore + finalRowBonus + timeBonus;
  localStorage.setItem('score',JSON.stringify(totalScore));

  if (!Bug.gameOver) {
  // If Bug.gameOver is false then we're between levels
    ctx.font = '40px courier';
    ctx.clearRect(1, canvas.height/2 - 80, 640, 200);
    ctx.fillText('LEVEL ' + Bug.level + ' COMPLETE',150, canvas.height/2 - 50);
    ctx.fillText('You got ' + totalScore + ' points!', 75, canvas.height/2);
    ctx.fillText('Ready for the next level? Just wait...', 20, canvas.height/2 + 70);
    ctx.font = '30px Arial';
  }
  return totalScore;
};


Bug.fillEndzoneSlot = function(xPos){
  var ezSlot = ENDZONE_XPOS.indexOf(xPos);
  console.log('filling endzone slot',ezSlot);
  Bug.ezBugs[Bug.inEndZone] = new Bug();
  Bug.ezBugs[Bug.inEndZone].velocity = 0;
  Bug.ezBugs[Bug.inEndZone].xPos = xPos;
  Bug.ezBugs[Bug.inEndZone].yPos = 0;
};

Bug.ezSlotIsFilled = function(xPos) {
  for (var i of Bug.ezBugs) {
    if (i.xPos === xPos) return true;
  }
};

/**
 * This is where winning-specific things happen
 */
Bug.winState = function() {

  Bug.clock = TIME_LIMIT; // Reset Timer
  Bug.inEndZone++; //Increment bugs in endzone
  Bug.ezSound.play();
  Bug.startGameInitLevel = INIT_CONTINUE_LEVEL; //Causes ezBugs and obstacles to stay
  Bug.stopGame(); //Clears Intervals
  Bug.createFrame(); //Renders one more frame after game cease puts bug in endzone

  if (Bug.inEndZone === ENDZONE_SLOTS) { //Entered when level is complete
    Bug.endLevelSound.play();
    Bug.displayScore();
    Bug.level++; //Increases Level
    Bug.inEndZone = 0; //Resets bugs in endzone
    Bug.ezBugs = []; //Resets array bugs in endzone
    Bug.startGameInitLevel = INIT_NEW_LEVEL; //Clear bugs from en

  }
  if (Bug.level > MAX_LEVEL) { //Entered after you beat level 9
    console.log('winState: MAX LEVEL ACHIEVED!!!');
    Bug.level = MAX_LEVEL; //for now...
    Bug.startGameInitLevel = INIT_NEW_LEVEL;
  }

  // delay a bit then start next level
  window.setTimeout(Bug.startGame,2000);
  // Bug.startGame(Bug.startGameInitLevel);
};

Bug.loadNewTopPage = function() {
  Bugger.loadNewPage('newtop.html');
};

Bug.loadGameOverPage = function() {
  Bugger.loadNewPage('gameover.html');
};

/**
 * This is where losing-specific things happen
 */
Bug.loseState = function() {
  if (Bug.bugLives.pop()) { // then we still have lives to play
    Bug.stopGame(); //Clear intervals
    Bug.createFrame();
    if (Bug.clock === 0) { // died on timeout
      Bug.timeOutSound.play();
      Bug.startGameInitLevel = INIT_CONTINUE_AFTER_TIMEOUT;
    } else {
      Bug.startGameInitLevel = INIT_CONTINUE_LEVEL;
    }
    Bug.clock = TIME_LIMIT; //Reset Clock
    console.log('loseState: ',Bug.bugLives.length,'Lives remaining');
    window.setTimeout(Bug.startGame, 1000);
  } else { // out of lives. Game Over.
    Bug.gameOver = true;
    console.log('GAME OVER Triggered');
    Bug.stopGame();
    Bug.createFrame();
    var score = Bug.displayScore();
    Bug.level = STARTING_LEVEL;
    // Bug.pauseGame();
    if (Bugger.scoreIsTopTen(score)) {
      window.setTimeout(Bug.loadNewTopPage,2000);
    } else {
      window.setTimeout(Bug.loadGameOverPage,2000);
    }
  }
};

Bug.timeoutSplashScreenMsg = function() {
  var startY = 200;
  //var lineHeight = 55;
  Bug.createFrame();
  ctx.font = '40px courier';
  //ctx.clearRect(15, startY-5, 55, 590);
  ctx.clearRect(15,155,625,75);
  ctx.fillText('Your Bug ran out of time!',30, startY);
  ctx.font = '30px Arial';
  Bug.pauseGame();
};

Bug.startupSplashScreenMsg = function() {
  var startY = 120;
  var lineHeight = 55;
  Bug.createFrame();
  ctx.font = '40px courier';
  ctx.clearRect(85, 125, 100, 100);
  ctx.fillText('WELCOME TO BUGGER!',110, startY);
  ctx.fillText('Arrow keys move Bug', 95, startY + lineHeight);
  ctx.fillText('Spacebar pauses game', 80, startY + lineHeight*2);
  ctx.fillText('Good Luck!', 200, startY + 25 +lineHeight*3);
  ctx.font = '30px Arial';
  Bug.pauseGame();
  Bug.startGameSound.play();
};

/**
 * END OF GAME BEHAVIORS
 */
Bug.stopGame = function() {
  Bug.frameRateID = window.clearInterval(Bug.frameRateID); //Stop Screen Rendering
  Bug.clockRate = window.clearInterval(Bug.clockRate); //Stop Timer
  Bug.pressListener = window.removeEventListener('keydown', Bug.keyDirect);

};


/**
 * Update Clock
 * @return {number} clock - Number of seconds left in gameplay
 */
Bug.clockTime = function() {
  Bug.clock--;
  if (Bug.clock === 0) {
    console.log('Ran out of time');
    Bug.loseState();
  }
  return Bug.clock;
};


/**
 * Pauses the game Bug.pause == false
 */
Bug.pauseGame = function(){
  if(!Bug.pause) {
    Bug.clockRate = window.clearInterval(Bug.clockRate);
    Bug.frameRateID = window.clearInterval(Bug.frameRateID);
    ctx.clearRect(135, 375, 370, 50);
    ctx.fillText('Press SPACE to continue', 150, 410);
    Bug.pause = true;
  } else {
    Bug.clockRate = window.setInterval(Bug.clockTime, 1000);
    Bug.frameRateID = window.setInterval(Bug.renderGame, 33);
    Bug.pause = false;
  }
};

/**
 * LOGIC  - Runs on page load
 */
Bug.startGame = function() {
  var initFlag = Bug.startGameInitLevel;
  if (initFlag === INIT_NEW_LEVEL || initFlag === INIT_NEW_GAME) { //Happens on new game OR new level
    Bug.clock = TIME_LIMIT;
    Bug.gameOver = false;

    Bug.allObstacles = []; //Holds all obstacles on screen
    Bug.buildObstacleEndZone();
    if (DBG_DRAW_OBSTACLES) {
      for (var i = 1; i < 11; i++) {
        Bug.allObstacles.push([]);
        Bug.buildObstacleRow(i);
      }
    }
  }


  if (initFlag === INIT_NEW_GAME){ //Only happens on new game
    for (i = 0; i < LIVES_REMAINING; i++) { //Generating Lives remaining icon
      Bug.bugLives[i] = new Bug(); //Instantiate new bug
      Bug.bugLives[i].velocity = 0; //Don't move.
      Bug.bugLives[i].yPos = 440;
      Bug.bugLives[i].xPos = 580 - (i * 40);
    }
    localStorage.removeItem('score'); //Clear local storage
  }


  Bug.player = new Bug(); //Instantiate Bug Object
  Bug.renderGame(); //Create frame / Test for collisions

  Bug.pressListener = window.addEventListener('keydown', Bug.keyDirect);
  Bug.clockRate = window.setInterval(Bug.clockTime, 1000); //Clock Interval Timer
  Bug.frameRateID = window.setInterval(Bug.renderGame, 33); //Render Frame Rate

  switch (initFlag) {
  case INIT_NEW_GAME:
    Bug.startupSplashScreenMsg();
    break;
  case INIT_CONTINUE_AFTER_TIMEOUT:
    Bug.timeoutSplashScreenMsg();
    break;
  }
};

Bug.keyDirect = function(event) {
  event.preventDefault();
  if(event.keyCode === 32) {
    event.preventDefault();
    Bug.pauseGame();
  } else {
    Bug.player.moveBug(event);
  }
};

window.onload = function() {
  Bug.startGameInitLevel = INIT_NEW_GAME;
  Bug.startGame();
};