'use strict';

function Bugger() {}

Bugger.TopPlayer = function(player, score) {
  this.player = player;
  this.score = score;
};

Bugger.restoreTopTenTable = function() {
  var top10 = JSON.parse(localStorage.getItem('topScores')) ||
  [new Bugger.TopPlayer('Tom', 1000),
    new Bugger.TopPlayer('Mom', 500),
    new Bugger.TopPlayer('Allie', 0),
    new Bugger.TopPlayer('Michele', 0),
    new Bugger.TopPlayer('Tracy', 500),
    new Bugger.TopPlayer('Andrew', 690),
    new Bugger.TopPlayer('Justin', 650),
    new Bugger.TopPlayer('Cameron', 200),
    new Bugger.TopPlayer('Cat', 100),
    new Bugger.TopPlayer('Tracy', 900)];
  return Bugger.sortObjArrayOnKey(top10, 'score', false);
};

Bugger.sortObjArrayOnKey = function(objArray, keyName, accending) {
  // This is a standard bubble sort
  var swap = function(i, j) {
    var temp = rtnArray[i];
    rtnArray[i] = rtnArray[j];
    rtnArray[j] = temp;
  };
  var test = function(a, b) {
    return (accending ? a > b : a < b);
  };
  var swapped, rtnArray = objArray.slice(0); // create a clone of the obj arracy
  do {
    swapped = false;
    for (var p = 0; p < rtnArray.length; p++) {
      if (rtnArray[p] && rtnArray[p+1] && test(rtnArray[p][keyName], rtnArray[p+1][keyName])) {
        swap(p, p+1);
        swapped = true;
      }
    }
  } while (swapped);
  return rtnArray;
};

// Clear content from Top 10 Scores Table
Bugger.clearTopTenTable = function() {
  // replace existing tbody and thead in table with new, blank elements
  var divEl = document.getElementById('scoreTableDiv');
  divEl.innerHTML = '';
};

Bugger.renderTopTenTable = function() {
  var divEl = document.getElementById('scoreTableDiv');
  var tableEl = document.createElement('table');
  for (var s of Bugger.topScores) {
    var trEl = document.createElement('tr');
    var tdEl = document.createElement('td');
    tdEl.textContent = s.player;
    trEl.appendChild(tdEl);
    tdEl = document.createElement('td');
    tdEl.textContent = s.score;
    trEl.appendChild(tdEl);
    tableEl.appendChild(trEl);
  }
  divEl.appendChild(tableEl);
};

Bugger.scoreIsTopTen = function(score) {
  Bugger.topScores = JSON.parse(localStorage.topScores);
  return score >= Bugger.topScores[Bugger.topScores.length-1].score;
};

Bugger.addTopTenScore = function(player, score) {
  Bugger.topScores = JSON.parse(localStorage.getItem('topScores')) || Bugger.restoreTopTenTable();
  Bugger.topScores.push({player, score});
  Bugger.topScores = Bugger.sortObjArrayOnKey(Bugger.topScores,'score',false);
  Bugger.topScores.pop();
  localStorage.topScores = JSON.stringify(Bugger.topScores);
};


//Variables
var BUG_VELOCITY = 44;
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

/**
 * BUG
 */
function Bug() {
  this.image = new Image();
  this.image.src = "http://via.placeholder.com/44x44";
  this.width = 44;
  this.height = 44;
  this.xPos = (canvas.width/2)-(this.width/2);
  this.yPos = canvas.height-45;
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
