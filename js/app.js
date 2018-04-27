'use strict';

function Bugger() {}

Bugger.TopPlayer = function(player, score) {
  this.player = player;
  this.score = score;
};

Bugger.restoreTopTenTableData = function() {
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

// test score against top ten scores table
Bugger.scoreIsTopTen = function(score) {
  Bugger.topScores = Bugger.restoreTopTenTableData();
  return score > Bugger.topScores[Bugger.topScores.length-1].score;
};

Bugger.loadNewPage = function(pageName){
  //get current location
  var url = window.location.href;
  var lastSlash = url.lastIndexOf('/');
  url = url.slice(0, lastSlash+1) + pageName;
  console.log(url);
  window.location.href = url;
};

Bugger.fx = {
  jump: 'sounds/jump01.wav',
  coinDrop: 'sounds/coin-dropping.wav',
  levelVictory: 'sounds/end-level-victory.wav',
  bugMakesIt: 'sounds/accomplishment.wav',
  bugDeath: 'sounds/bugdeath.wav',
  loseSound: 'sounds/loseSound.wav',
  loseVoice: 'sounds/loseVoice.mp3'
};
