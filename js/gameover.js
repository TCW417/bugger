'use strict';

function GameOver () {}

GameOver.relaunchGame = function() {
  GameOver.form = document.getElementById('playAgain');
  GameOver.form.removeEventListener('click', GameOver.relaunchGame);
  Bugger.loadNewPage('bugger.html');
};

//Get user's score out of local storage
GameOver.score = parseInt(localStorage.getItem('score')) || 995;

//Add score to html page
GameOver.scoreEl = document.getElementById('player-score');
GameOver.scoreEl.textContent = GameOver.score;

//Listen for submit button click
GameOver.form = document.getElementById('playAgain');
GameOver.form.addEventListener('click', GameOver.relaunchGame);