'use strict';

function GameOver () {}

//Get user's score out of local storage
GameOver.score = parseInt(localStorage.getItem('score')) || 0;

//Add score to html page
GameOver.scoreEl = document.getElementById('player-score');
GameOver.scoreEl.textContent = GameOver.score;