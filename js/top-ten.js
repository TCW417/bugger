'use strict';

function TopTen(){}

// Clear content from Top 10 Scores Table
TopTen.clearTopTenTable = function() {
  // replace existing tbody and thead in table with new, blank elements
  var divEl = document.getElementById('scoreTableDiv');
  divEl.innerHTML = '';
};

TopTen.renderTopTenTable = function() {
  TopTen.topScores = Bugger.restoreTopTenTableData();
  var divEl = document.getElementById('scoreTableDiv');
  var tableEl = document.createElement('table');
  for (var s of TopTen.topScores) {
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


TopTen.clearTopTenTable();
TopTen.renderTopTenTable();
