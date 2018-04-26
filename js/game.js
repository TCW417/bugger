'use strict';

//Variables
var BOX_SIZE = 40; //Dimesion of Grid Unit in px i.e. 40x40px
var TIME_LIMIT = 30; //Amount of time allowed to play
var canvas = document.getElementById('myCanvas'); //Canvas HTML location
var ctx = canvas.getContext('2d'); //2 dimensional canvas rendering
ctx.font = '30px Arial'; //Text size and Font
ctx.fillStyle = '#00ff00'; //Text Color
Bug.level = 1; //Holds current level in range [1-9]
var MAX_LEVEL = 9;
Bug.minCar = 2; //Min number of cars/row
Bug.filenames = ['assets/binary-80px.png',
  'assets/binary-120px.png',
  'assets/binary-160px.png',
  'assets/binary-200px.png',
  'assets/binary-240px.png',
  'assets/binary-280px.png'];
Bug.maxSeparation = [8, 7, 6, 5, 5, 4, 4, 4, 4, 4];
Bug.minSeparation = [6, 5, 5, 4, 3, 3, 3, 2, 2, 2];
Bug.maxObsLength = [4, 4, 4, 5, 5, 5, 6, 6, 6, 6];
Bug.minObsLength = [4, 4, 3, 3, 3, 2, 2, 2, 2, 2];
Bug.maxVelocity = [5, 5, 6, 6, 6, 7, 7, 8, 9, 10];
Bug.minVelocity = [2, 2, 2, 3, 3, 4, 4, 4, 5, 6];

var ENDZONE_SLOTS = 3; //slots in level endzone
Bug.inEndZone = 0; // counter of bugs in endzone



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

Bug.prototype.clearBug = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

Bug.prototype.moveBug = function(event) {
  if(event.keyCode === 119 && this.yPos > 0) {
    this.yPos -= BOX_SIZE;
    this.image.src = 'assets/bug.png';
  }
  if(event.keyCode === 97 && this.xPos > 0) {
    this.xPos -= BOX_SIZE;
    this.image.src = 'assets/bug_left.png';
  }
  if(event.keyCode === 100 && this.xPos < (canvas.width - this.width)){
    this.xPos += BOX_SIZE;
    this.image.src = 'assets/bug_right.png';
  }
  if(event.keyCode === 115 && this.yPos < (canvas.height - 45)) {
    this.yPos += BOX_SIZE;
    this.image.src = 'assets/bug_down.png';
  }

  if(this.yPos === 0) {
    Bug.winState();
  }
};


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
  this.movesRight = movesRight; // false if it moves left
  if (this.movesRight) {
    this.xPos = -w; // put it off the left edge of screen
  } else {
    this.xPos = canvas.width;
  }
  this.startXpos = this.xPos;

  this.yPos = (startRow * BOX_SIZE);
  if (Bug.level > 3) {
    var v = this.randomVelocity();
    this.velocity = (movesRight ? v : -v);
  }
}

Obstacle.prototype.randomVelocity = function() {
  return Math.ceil(Math.random()*5);
};

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
      var v = this.randomVelocity();
      this.velocity = (this.movesRight ? v : -v);
    }
  }
};


/**
 * TRAINCAR Constructor - Creates new traincar object
 * @param {number} width - width in pixels
 * @param {number} xPos - starting x position
 * @param {number} velocity - rate that this object will move
 */
function Traincar(width, xPos, velocity) {
  this.width = width;
  this.xPos = xPos;
  this.velocity = velocity;
  this.filepath = Bug.filenames[this.width/BOX_SIZE - Bug.minCar];
}

/**
 * Generates a number within a range
 * @param {number} min - lowest possible return
 * @param {number} max- highest possible return
 * @return {number} random integer within range
 */
Bug.randInRange = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};


/**
 * Creates a train of obstacle objects
 * @return {array} Array containing car and the trailing offset
 */
Bug.buildMetaTrain = function() {
  var trainLength = 0;
  var car=[], space=[];
  var i = 0;
  do {
    car[i] = Bug.randInRange(Bug.minObsLength[Bug.level], Bug.maxObsLength[Bug.level]);
    space[i] = Bug.randInRange(Bug.minSeparation[Bug.level], Bug.maxSeparation[Bug.level]);
    trainLength += (car[i] + space[i]);
    i++;
  } while (trainLength <= canvas.width/Bug.BOX_SIZE);
  return [car, space];
};


/**
 * Creates a train of Obstacles
 * @param {boolean} movesRight - TRUE = Moves to right / FALSE = Moves to left
 * @return {array} train - train of obstacles
 */
Bug.buildObsTrain = function(movesRight) {
  var xPos = (movesRight ? 0 : 640) + (Bug.randInRange(50,200)*(movesRight?1:-1));
  var metaTrain = Bug.buildMetaTrain();
  var car = metaTrain[0];
  var space = metaTrain[1];
  var train = [];
  var v = Bug.randInRange(Bug.minVelocity[Bug.level], Bug.maxVelocity[Bug.level]) * (movesRight ? 1 : -1);
  for (var k = 0; k < car.length; k++) {
    train[k] = new Traincar(car[k]*BOX_SIZE, xPos, v);
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
  Bug.allObstacles[0].push(new Obstacle('assets/binary-118px.png',36,118,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/binary-156px.png',36,156,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/binary-116px.png',36,116,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/binary-118px.png',36,118,0,true));
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
 * @param {*} rowNum - Number assigned to Object rows
 */
Bug.buildObstacleRow = function(rowNum) {
  console.log('row',rowNum);
  var trains = Bug.buildObsTrain(!!(rowNum%2));
  for (var t = 0; t < trains.length; t++) {
    Bug.allObstacles[rowNum][t] = (new Obstacle(
      trains[t].filepath, 36, trains[t].width, rowNum, !!(rowNum%2)));
    Bug.allObstacles[rowNum][t].velocity = trains[t].velocity;
    Bug.allObstacles[rowNum][t].xPos = trains[t].xPos;
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
  if(Bug.detectCollision()) { //Detect Collisions
    Bug.loseState();
    Bug.createFrame();
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
  ctx.fillText('Time:' + Bug.clock, 15, 475); //Draw countdown clock
  Bug.player.drawBug(); //Draw Bug
};


/**
 * Calculate and Display Score to Canvas
 * @return {number} totalScore - Player Score
 */
Bug.displayScore = function() {
  var rowScore = 100*(11 - Bug.player.yPos/BOX_SIZE);
  var finalRowBonus = 0;
  if (Bug.player.yPos/BOX_SIZE === 0) {
    finalRowBonus = 500;
  }
  var timeBonus = Bug.clock*10;
  var totalScore = rowScore + finalRowBonus + timeBonus;
  ctx.fillText('Score: ' + totalScore, canvas.width/2, canvas.height/2);
  return totalScore;
};


/**
 * Update Countdown Clock
 * @return {number} Bug.clock - Number of seconds left in gameplay
 */
Bug.clockTime = function() {
  Bug.clock--;
  if (Bug.clock === 0) {
    console.log('Time End Lose State Triggered');
    Bug.loseState();
  }
  return Bug.clock;
};


/**
 * This is where winning-specific things happen
 */
Bug.winState = function() {
  console.log('You got into Production!');
  Bug.stopGame();
  Bug.inEndZone++; // increment bugs in endzone
  if (Bug.inEndZone === ENDZONE_SLOTS) {
    console.log('winState: end of level');
    Bug.level++;
    Bug.inEndZone = 0;
    Bug.createFrame(); //renders one more frame after game cease
    Bug.displayScore();
    // delay a bit then start next level
  }
  console.log('starting next level...');
  setTimeout(Bug.startgame, 5000);
};

/**
 * This is where losing-specific things happen
 */
Bug.loseState = function() {
  Bug.gameOver = true;
  console.log('Lose State Triggered');
  Bug.stopGame();
  Bug.createFrame();
  Bug.displayScore();
};


/**
 * END OF GAME BEHAVIORS
 */
Bug.stopGame = function() {
  console.log('Stop Game Triggered');
  window.removeEventListener('keypress', Bug.keypressListener); //Remove Key listener
  window.clearInterval(Bug.frameRateID); //Stop Screen Rendering
  window.clearInterval(Bug.clockRate); //Stop Timer
};


Bug.startGame = window.onload; // alias for the onload function

/**
 * LOGIC  - Runs on page load
 */
window.onload = function() {
  Bug.clock = TIME_LIMIT;
  Bug.keypressListener = function(event) {
    Bug.player.moveBug(event);
  };
  Bug.allObstacles = []; //Holds all obstacles on screen
  Bug.buildObstacleEndZone();
  for (var i = 1; i < 11; i++) {
    Bug.allObstacles.push([]);
    Bug.buildObstacleRow(i);
  }
  Bug.player = new Bug(); //Instantiate Bug Object
  window.addEventListener('keypress', Bug.keypressListener); //Event Listener for KEY PRESSES
  Bug.clockRate = window.setInterval(Bug.clockTime, 1000); //Clock Interval Timer
  Bug.frameRateID = window.setInterval(Bug.renderGame, 33); //Render Frame Rate
};