'use strict';

//Variables
var BOX_SIZE = 40; //Dimesion of Grid Unit in px i.e. 40x40px
var TIME_LIMIT = 10; //Amount of time allowed to play game
var canvas = document.getElementById('myCanvas'); //Canvas HTML location
var ctx = canvas.getContext('2d'); //2 dimensional canvas rendering
ctx.font = "30px Arial";
ctx.fillStyle = '#00ff00';
Bug.gameOver = false; //Game State



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
  if(Bug.gameOver) return;
  if(event.keyCode == '119' && this.yPos > 0) {
    this.yPos -= BOX_SIZE;
    this.image.src = 'assets/bug.png'
  }
  if(event.keyCode == '97' && this.xPos > 0) {
    this.xPos -= BOX_SIZE;
    this.image.src = 'assets/bug_left.png';
  }
  if(event.keyCode == '100' && this.xPos < (canvas.width - this.width)){
    this.xPos += BOX_SIZE;
    this.image.src = 'assets/bug_right.png'
  }
  if(event.keyCode == '115' && this.yPos < (canvas.height - 45)) {
    this.yPos += BOX_SIZE;
    this.image.src = 'assets/bug_down.png'
  }
  console.log('bug at',this.xPos,this.rightSide())
  console.log('The bug is on row ',this.bugRowNum());

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
  var v = this.randomVelocity();
  this.velocity = (movesRight ? v : -v);
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
    var v = this.randomVelocity();
    this.velocity = (this.movesRight ? v : -v);
  }
};



/**
 * Constructs top-most row of Obstacle Objects
 * @return none
 */
Bug.buildObstacleEndZone = function() {
  // construct home row of obstacles. These are fixed (zero velocity)
  // with gaps where the bug can tuck in.

  Bug.allObstacles.push([]);
  Bug.allObstacles[0].push(new Obstacle('assets/binary-118px.png',36,118,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/binary-156px.png',36,156,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/binary-116px.png',36,116,0,true));
  Bug.allObstacles[0].push(new Obstacle('assets/binary-118px.png',36,118,0,true));
  // Bug.allObstacles[0].push(new Obstacle('assets/binary-75px.png',36,75,0,true));
  Bug.allObstacles[0][0].xPos = 0; // + 118+44 = 160
  Bug.allObstacles[0][1].xPos = 162; //162; //+160+40 = 360
  Bug.allObstacles[0][2].xPos = 362; //+120+40 = 520
  Bug.allObstacles[0][3].xPos = 522; //+75+50 = 580
  // Bug.allObstacles[0][4].xPos = 580;
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
  Bug.allObstacles[rowNum][0] = (new Obstacle('assets/binary-9 copy.png', 36, 227, rowNum, !!(rowNum%2)));
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
 * TODO - ADD GAME HUD
 * Render Game - Draws All Objects to Canvas on Interval Timer
 */
Bug.renderGame = function(){
  ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear Canvas
  for (var i = 0; i < Bug.allObstacles.length; i++) { //Move and Draw Obstacles
    for (var j = 0; j < Bug.allObstacles[i].length; j++) {
      Bug.allObstacles[i][j].moveObstacle();
      Bug.allObstacles[i][j].drawObstacle();
    }
  }
  ctx.fillText('Time:' + Bug.clock, 15, 475); //Draw countdown clock
  Bug.player.drawBug(); //Draw Bug

  if (Bug.detectCollision()) { //Detect Collisions
    Bug.loseState();
  }
};


/**
 * This is where losing-specific things happen
 */
Bug.loseState = function() {
  Bug.gameOver = true;
  console.log('GAME OVER. YOU LOSE.');
  Bug.stopGame();
};

/**
 * This is where winning-specific things happen
 */
Bug.winState = function() {
  console.log('You got into Production!');
  Bug.stopGame();
}


/**
 * END OF GAME BEHAVIORS
 */
Bug.stopGame = function() {
  Bug.renderGame();
  window.clearInterval(Bug.frameRateID); //Stop Screen Rendering
  window.clearInterval(Bug.clockRate); //Stop Timer
}


/**
 * Update Countdown Clock
 * @return {number} Bug.clock - Number of seconds left in gameplay
 */
Bug.clockTime = function() {
  Bug.clock--;
  if (Bug.clock === 0) {
    console.log('Ran out of time');
    Bug.loseState();
  }
  return Bug.clock;
}


/**
 * LOCIC  - Runs on page load
 */
window.onload = function() {  
  Bug.clock = TIME_LIMIT;
  Bug.keypressListener = function(event) {
    Bug.player.moveBug(event);
  };
  Bug.allObstacles = []; //; Bug.allObstacles[0]=[]; //Holds all obstacles on screen
  Bug.buildObstacleEndZone();
  for (var i = 1; i < 11; i++) {
    Bug.allObstacles.push([]);
    Bug.buildObstacleRow(i);
  }
  Bug.player = new Bug();
  Bug.renderGame();
  window.addEventListener('keypress', Bug.keypressListener); //Event Listener for KEY PRESSES
  Bug.clockRate = window.setInterval(Bug.clockTime, 1000); //Clock Interval Timer
  Bug.frameRateID = window.setInterval(Bug.renderGame, 33); //Render Frame Rate
};