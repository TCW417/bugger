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
  this.image.src = "assets/bug.png";
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
var obstacles = {
  0: '1001',
  1: '011101',
  2: '101110011',
  3: '11000111010100',
  4: '0110110011010011001101101'
}

var allObstacles = []; //Holds all obstacles on screen

function Obstacle() {

}






















/**
 * LOGIC
 */
var player = new Bug();
player.drawBug();
window.addEventListener('keypress', function(event) {
player.moveBug(event);
});

