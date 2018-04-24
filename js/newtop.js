'use strict';

function NewTop () {}

NewTop.addNewTopScore = function(player, score) {
  NewTop.topScores = JSON.parse(localStorage.getItem('topScores')) || Bugger.restoreTopTenTableData();
  NewTop.topScores.push({player, score});
  NewTop.topScores =  Bugger.sortObjArrayOnKey(NewTop.topScores,'score',false);
  NewTop.topScores.pop();
  localStorage.topScores = JSON.stringify(NewTop.topScores);
};

NewTop.getPlayerName = function(e) {
  e.preventDefault();

  var formEl = e.target;
  if (formEl.name === 'submit') {
    // stop listening
    formEl = document.getElementById('getPlayer');
    formEl.removeEventListener('click', NewTop.getPlayerName);

    //Save player name for next time
    var playerName = document.getElementById('player').value;
    localStorage.setItem('player', JSON.stringify(playerName));
    NewTop.addNewTopScore(playerName, NewTop.score);

    // load top ten scores page
    Bugger.loadNewPage('scores.html');
  }
};

//Get user's score out of local storage
NewTop.score = parseInt(localStorage.getItem('score')) || 995;

//Add score to html page
NewTop.scoreEl = document.getElementById('player-score');
NewTop.scoreEl.textContent = NewTop.score;

//Get last user's name and offer it as value of text input
NewTop.player = JSON.parse(localStorage.getItem('player')) || '';
NewTop.playerEl = document.getElementById('player');
NewTop.playerEl.setAttribute('value', NewTop.player);

//Listen for submit button click
NewTop.form = document.getElementById('getPlayer');
NewTop.form.addEventListener('click', NewTop.getPlayerName);