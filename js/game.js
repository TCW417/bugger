'use strict';

//Variables
var BUG_VELOCITY = 40;
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
Bug.gameOver = false;

Bug.level = 9;

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
    // this.image.src = 'assets/bug.png'
  }
  if(event.keyCode == '97' && this.xPos > 0) {
    this.xPos -= BUG_VELOCITY;
    this.image.src = 'assets/bug_left.png';
  }
  if(event.keyCode == '100' && this.xPos < (canvas.width - this.width)){
    this.xPos += BUG_VELOCITY;
    this.image.src = 'assets/bug_right.png'
  }
  if(event.keyCode == '115' && this.yPos < (canvas.height - 45)) {
    this.yPos += BUG_VELOCITY;
    this.image.src = 'assets/bug_down.png'
  }
  console.log('bug at',this.xPos,this.rightSide())
  console.log('The bug is on row ',this.bugRowNum());
};

/**
 * OBSTACLES
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
  this.yPos = (startRow * 40);// + 40;
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
  if(this.xPos >canvas.width||this.rightSide()<0) {
    this.xPos = this.startXpos;
    if (Bug.level > 3) {
      var v = this.randomVelocity();
      this.velocity = (this.movesRight ? v : -v);
    }
  }
  this.drawObstacle();
};

Bug.buildObstacleEndZone = function() {
  // construct home row of obstacles. These are fixed (zero velocity)
  // with gaps where the bug can tuck in.

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

Bug.buildObstacleRow = function(rowNum) {
  console.log('row',rowNum);
  var trains = Bug.buildObsTrain(!!(rowNum%2));
  for (var t = 0; t < trains.length; t++) {
    Bug.allObstacles[rowNum][t] = (new Obstacle(
      trains[t].filepath, 36, trains[t].width, rowNum, !!(rowNum%2)));
    Bug.allObstacles[rowNum][t].velocity = trains[t].velocity;
    Bug.allObstacles[rowNum][t].xPos = trains[t].xPos;
    // console.log('B.O.R Row',rowNum,'obs',Bug.allObstacles[rowNum][t]);
  }
};

function detectCollision() {
  var bugRow = Bug.player.bugRowNum();
  //oi = obstacle index
  var oi = bugRow; // -1
  if (Bug.allObstacles[oi]) {
    for (var i = 0; i < Bug.allObstacles[oi].length; i++) {
      var impactLeft = Bug.player.xPos >= Bug.allObstacles[oi][i].xPos && Bug.player.xPos <= Bug.allObstacles[oi][i].rightSide();
      var impactRight = Bug.player.rightSide() >= Bug.allObstacles[oi][i].xPos && Bug.player.rightSide() <= Bug.allObstacles[oi][i].rightSide();
      //if we get a valid row number, then we evaluate below if statement
      if (impactLeft||impactRight) {
        console.log('bugRow',bugRow);
        console.log('Impact! Bug.player', Bug.player.xPos,Bug.player.rightSide(),'obstacle', Bug.allObstacles[oi][i].xPos,Bug.allObstacles[oi][i].rightSide());
        return true;
      }
    }
  }
  return false;
}

//interval timer handler
Bug.drawObstacles = function(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < Bug.allObstacles.length; i++) {
    for (var j = 0; j < Bug.allObstacles[i].length; j++) {
      Bug.allObstacles[i][j].moveObstacle();
    }
  }
  Bug.player.drawBug();
  if (detectCollision()) {
    Bug.handleCollision();
  }
};

Bug.handleCollision = function() {
  console.log('GAME OVER. YOU LOSE.');
  Bug.gameOver = true;
  window.clearInterval(Bug.frameRateID);
  window.removeEventListener('keypress', Bug.keypressListener);
};

Bug.keypressListener = function(event) {
  Bug.player.moveBug(event);
};

Bug.minCar = 2;
Bug.maxCar = 6;
Bug.minSpace = 3;
Bug.maxUnits = canvas.width/BUG_VELOCITY;
Bug.maxSpaceTable = [ 14, 13, 12, 11, 10, 9, 8, 7, 6 ];
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

Bug.randInRange = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

Bug.randTrainCar = function(lvl){
  return Math.floor(Math.random()*(Bug.maxObsLength[lvl]-Bug.minObsLength[lvl]+1)+Bug.minObsLength[lvl]);
};

Bug.randSpace = function(minSpace, maxSpace){
  return Math.floor(Math.random()*(maxSpace-minSpace+1)+minSpace);
};

Bug.buildMetaTrain = function() {
  var trainLength = 0;
  var car=[], space=[];
  var i = 0;
  do {
    car[i] = Bug.randInRange(Bug.minObsLength[Bug.level], Bug.maxObsLength[Bug.level]);
    space[i] = Bug.randInRange(Bug.minSeparation[Bug.level], Bug.maxSeparation[Bug.level]);
    trainLength += (car[i] + space[i]);
    i++;
  } while (trainLength <= canvas.width/Bug.BUG_VELOCITY);
  return [car, space];
};

Bug.randomVelocity = function() {
  return Math.ceil(Math.random()*5);
};

Bug.Traincar = function(width, xPos, velocity){
  this.width = width;
  this.xPos = xPos;
  this.velocity = velocity;
  this.filepath = Bug.filenames[this.width/BUG_VELOCITY - Bug.minCar];
};

Bug.buildObsTrain = function(movesRight) {
  var xPos = (movesRight ? 0 : 640) + (Bug.randInRange(50,200)*(movesRight?1:-1));
  var metaTrain = Bug.buildMetaTrain();
  var car = metaTrain[0];
  var space = metaTrain[1];
  var train = [];
  var v = Bug.randInRange(Bug.minVelocity[Bug.level], Bug.maxVelocity[Bug.level]) * (movesRight ? 1 : -1);
  for (var k = 0; k < car.length; k++) {
    train[k] = new Bug.Traincar(car[k]*BUG_VELOCITY, xPos, v);
    xPos += ((train[k].width + space[k]*BUG_VELOCITY) * (movesRight ? 1 : -1));
  }
  console.log(car, space, train);
  return train;
};

// Draw bug and game field on window load and play game!
window.onload = function() {
  Bug.allObstacles = []; //; Bug.allObstacles[0]=[]; //Holds all obstacles on screen
  Bug.buildObstacleEndZone();
  for (var i = 1; i < 11; i++) {
    Bug.allObstacles.push([]);
    Bug.buildObstacleRow(i);
  }
  Bug.player = new Bug();
  Bug.drawObstacles();
  // Bug.player.drawBug();
  //listener for keypresses
  window.addEventListener('keypress', Bug.keypressListener);
  // var intervalID = window.setInterval(drawObstacles, 500);
  Bug.frameRateID = window.setInterval(Bug.drawObstacles, 33);

  Bug.buildObsTrain(false);
  Bug.buildObsTrain(true);
};


