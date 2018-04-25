'use strict';

//Variables
var BUG_VELOCITY = 40;
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
Bug.gameOver = false;

/**
 * BUG
 */
function Bug() {
  this.image = new Image();
  this.image.src = 'assets/bug.png';
  this.width = 40;
  this.height = 40;
  this.xPos = (canvas.width/2)-(this.width);
  this.yPos = canvas.height- this.height;
}

Bug.prototype.bugRowNum = function() {
  return this.yPos/BUG_VELOCITY;
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

//keypress event listener
Bug.prototype.moveBug = function(event) {
  // this.clearBug();
  if(Bug.gameOver) return;
  if(event.keyCode == '119' && this.yPos > 0) {
    this.yPos -= BUG_VELOCITY;
  }
  if(event.keyCode == '97' && this.xPos > 0) {
    this.xPos -= BUG_VELOCITY;
  }
  if(event.keyCode == '100' && this.xPos < (canvas.width - this.width)){
    this.xPos += BUG_VELOCITY;
  }
  if(event.keyCode == '115' && this.yPos < (canvas.height - 45)) {
    this.yPos += BUG_VELOCITY;
  }
  // this.drawBug();
  // console.log('The bug is on row ',this.bugRowNum());
};

/**
 * OBSTACLES
 */
function Obstacle(src, h, w, startRow, movesRight) {
  this.image = new Image();
  this.image.src = 'assets/binary-9 copy.png';
  // this.image.height = ;
  this.width = w;
  this.height = h;
  this.movesRight = movesRight; // false if it moves left
  if (this.movesRight) {
    this.xPos = -w; // put it off the left edge of screen
  } else {
    this.xPos = canvas.width;
  }
  this.startXpos = this.xPos;
  this.yPos = (startRow * 40) + 40;
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
  if(this.xPos >canvas.width||this.rightSide()<0) {
    this.xPos = this.startXpos;
    var v = this.randomVelocity();
    this.velocity = (this.movesRight ? v : -v);
  }
  this.drawObstacle();
};

function detectCollision() {
  var bugRow = Bug.player.bugRowNum();

  //oi = obstacle index
  var oi = bugRow-1;
  if (Bug.allObstacles[oi]) {
    var impactLeft = Bug.player.xPos >= Bug.allObstacles[oi].xPos && Bug.player.xPos <= Bug.allObstacles[oi].rightSide();
    var impactRight = Bug.player.rightSide() >= Bug.allObstacles[oi].xPos && Bug.player.rightSide() <= Bug.allObstacles[oi].rightSide();
    //if we get a valid row number, then we evaluate below if statement
    if (impactLeft||impactRight) {
      console.log('Impact! Bug.player', Bug.player.xPos,Bug.player.rightSide(),'obstacle', Bug.allObstacles[oi].xPos,Bug.allObstacles[oi].rightSide());
      // console.log('Same row!');
      return true;
    }
  }
  return false;
}

//interval timer handler
function drawObstacles(e){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var obj of Bug.allObstacles) {
    obj.moveObstacle();
    // obj.drawObstacle();
    Bug.player.drawBug();
  }
  if (detectCollision()) {
    gameOver();
  }
}

function gameOver() {
  console.log('GAME OVER. YOU LOSE.');
  Bug.gameOver = true;
  window.clearInterval(Bug.intervalID);
  window.removeEventListener('keypress', Bug.keypressListener);
}

Bug.keypressListener = function(event) {
  Bug.player.moveBug(event);
};


// Draw bug and game field on window load and play game!
window.onload = function() {
  Bug.allObstacles = []; //Holds all obstacles on screen
  for (var i = 0; i < 10; i++) {
    Bug.allObstacles.push(new Obstacle('assets/binary-9 copy.png', 36, 227, i, !!(i%2)));
  }
  Bug.player = new Bug();
  Bug.player.drawBug();
  //listener for keypresses
  window.addEventListener('keypress', Bug.keypressListener);
  // var intervalID = window.setInterval(drawObstacles, 500);
  Bug.intervalID = window.setInterval(drawObstacles, 33);
};
















/**
 * LOGIC
 */


