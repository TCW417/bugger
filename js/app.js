'use strict';

function Bugger() {}

Bugger.TopPlayer = function(player, score) {
  this.player = player;
  this.score = score;
};

Bugger.topScores = [
  new Bugger.TopPlayer('Tom', 1000),
  new Bugger.TopPlayer('Mom', 500),
  new Bugger.TopPlayer('Allie', 0),
  new Bugger.TopPlayer('Michele', 0),
  new Bugger.TopPlayer('Tracy', 500),
  new Bugger.TopPlayer('Andrew', 690),
  new Bugger.TopPlayer('Justin', 650),
  new Bugger.TopPlayer('Cameron', 200),
  new Bugger.TopPlayer('Cat', 100),
  new Bugger.TopPlayer('Tracy', 900)
];

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
  Bugger.topScores = JSON.parse(localStorage.topScores);
  Bugger.topScores.push({player, score});
  Bugger.topScores = Bugger.sortObjArrayOnKey(Bugger.topScores,'score',false);
  Bugger.topScores.pop();
  localStorage.topScores = JSON.stringify(Bugger.topScores);
};

console.log('pre sort',Bugger.topScores);
Bugger.topScores = Bugger.sortObjArrayOnKey(Bugger.topScores,'score', false);
console.log('post sort', Bugger.topScores);

localStorage.setItem('MyName','Tracy');
// localStorage.topScores = JSON.stringify(Bugger.topScores);
localStorage.setItem('topScores', JSON.stringify(Bugger.topScores));

var testArray = JSON.parse(localStorage.getItem('topScores'));
console.log(testArray);
console.log(localStorage.MyName);

// Bugger.clearTopTenTable();
// Bugger.renderTopTenTable();

console.log('test 50',Bugger.scoreIsTopTen(50));
Bugger.addTopTenScore('Freddy', 50);
console.log('after adding Freddy',Bugger.topScores);

