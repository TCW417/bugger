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
}

Bug.prototype.drawBug = function() {
  ctx.drawImage(this.image, this.xPos, this.yPos);
};

Bug.prototype.clearBug = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

Bug.prototype.moveBug = function(event) {
  this.clearBug();
  if(event.keyCode == "119" && this.yPos > 0) {
    this.yPos -= BUG_VELOCITY;
  }
  if(event.keyCode == "97" && this.xPos > 0) {
    this.xPos -= BUG_VELOCITY;
  }
  if(event.keyCode == "100" && this.xPos < (canvas.width - this.width)){
    this.xPos += BUG_VELOCITY;
  }
  if(event.keyCode == "115" && this.yPos < (canvas.height - 45)) {
    this.yPos += BUG_VELOCITY;
  }
  this.drawBug();
};

/**
 * OBSTACLES
 */
function Obstacle(src, h, w, startRow, movesRight) {
  this.image = new Image();
  this.image.src = 'assets/binary-9.png';
  this.width = w;
  this.height = h;
  this.movesRight = movesRight; // false if it moves left
  if (this.movesRight) {
    this.xPos =  -w; // put it off the left edge of screen
  } else {
    this.xPos = canvas.width + w;
  }
  this.yPos = canvas.height- this.height - startRow * 40;
  this.velocity = (movesRight ? 40 : -40);
}

Obstacle.prototype.drawObstacle = function() {
  ctx.drawImage(this.image, this.xPos, this.yPos);
};

Obstacle.prototype.moveObstacle = function() {
  this.xPos += this.velocity;
};

var obstacles = {
  0: '1001',
  1: '011101',
  2: '101110011',
  3: '11000111010100',
  4: '0110110011010011001101101'
}

var allObstacles = []; //Holds all obstacles on screen

allObstacles.push(new Obstacle('assets/binary-9.png', 39, 246, 1, true));


// Draw bug and game field on window load
window.onload = function() {
  player.drawBug();
};

function drawObstacles(e){
  for (var obj of allObstacles) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    obj.moveObstacle();
    obj.drawObstacle();
    player.drawBug();
  }
}

var intervalID = window.setInterval(drawObstacles, 500);



















/**
 * LOGIC
 */
var player = new Bug();
player.drawBug();
window.addEventListener('keypress', function(event) {
player.moveBug(event);
});

