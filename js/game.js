'use strict';

//Variables
var BUG_VELOCITY = 40;
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

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
  this.rightSide = this.xPos + this.width; // this is right side; left side is xPos
}

Bug.prototype.bugRowNum = function() {
  return this.yPos/BUG_VELOCITY;
};

Bug.prototype.drawBug = function() {
  ctx.drawImage(this.image, this.xPos, this.yPos);
};

Bug.prototype.clearBug = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

Bug.prototype.moveBug = function(event) {
  // this.clearBug();
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
  this.rightSide = this.xPos + this.width;
  this.drawBug();
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
  this.rightSide = this.xPos + this.width;
  // this.velocity = (movesRight ? 40 : -40);
  this.velocity = (movesRight ? 3 : -3);
}

Obstacle.prototype.drawObstacle = function() {
  ctx.drawImage(this.image, this.xPos, this.yPos);
};

Obstacle.prototype.moveObstacle = function() {
  this.xPos += this.velocity;
  this.rightSide = this.xPos + this.width;
  if(this.xPos >canvas.width||this.rightSide<0) {
    this.xPos = this.startXpos;
  }
  this.drawObstacle();
};

var obstacles = {
  0: '1001',
  1: '011101',
  2: '101110011',
  3: '11000111010100',
  4: '0110110011010011001101101'
};

var allObstacles = []; //Holds all obstacles on screen
for (var i = 0; i < 10; i++) {
  allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, i, !!(i%2)));

}

// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 1, true));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 2, false));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 3, true));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 4, false));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 5, true));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 6, false));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 7, true));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 8, false));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 9, true));
// allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 10, false));

// Draw bug and game field on window load
window.onload = function() {
  player.drawBug();
};

function detectCollision() {
  var bugRow = player.bugRowNum();

  //oi = obstacle index
  var oi = bugRow-1;
  if (allObstacles[oi]) {
    var impactLeft = player.xPos >= allObstacles[oi].xPos && player.xPos <= allObstacles[oi].rightSide;
    var impactRight = player.rightSide >= allObstacles[oi].xPos && player.rightSide <= allObstacles[oi].rightSide;
    //if we get a valid row number, then we evaluate below if statement
    if (impactLeft||impactRight) {
      console.log('Impact!');
      // console.log('Same row!');
      return true;
    }
  }
  return false;
}



function drawObstacles(e){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var obj of allObstacles) {
    obj.moveObstacle();
    // obj.drawObstacle();
    player.drawBug();
    if (detectCollision()) {

    }
  }
}

// var intervalID = window.setInterval(drawObstacles, 500);
var intervalID = window.setInterval(drawObstacles, 33);



















/**
 * LOGIC
 */
var player = new Bug();
player.drawBug();
window.addEventListener('keypress', function(event) {
  player.moveBug(event);
});

