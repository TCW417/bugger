'use strict';

//window.location.href = "http://new.website.com/that/you/want_to_go_to.html";

function TopTen () {}

TopTen.loadScoresPage = function(){
  //get current location
  var url = window.location.href;
  var lastSlash = url.lastIndexOf('/');
  url = url.slice(0, lastSlash+1) + 'scores.html';
  console.log(url);
  window.location.href = url;
};

TopTen.getPlayerName = function(e) {
  e.preventDefault();
  console.log('button clicked');
  
  var formEl = e.target;
  if (formEl.name === 'submit') {
    // stop listening
    formEl = document.getElementById('getPlayer');
    formEl.removeEventListener('click', TopTen.getPlayerName);

    //Save player name for next time
    var playerName = document.getElementById('player').value;
    localStorage.setItem('player', JSON.stringify(playerName));
    Bugger.addTopTenScore(playerName, TopTen.score);

    // load top ten scores page
    TopTen.loadScoresPage();
  }
};

//Get user's score out of local storage
TopTen.score = parseInt(localStorage.getItem('score')) || 995;

//Add score to html page
TopTen.scoreEl = document.getElementById('player-score');
TopTen.scoreEl.textContent = TopTen.score;

//Get last user's name and offer it as value of text input
TopTen.player = JSON.parse(localStorage.getItem('player')) || '';
TopTen.playerEl = document.getElementById('player');
TopTen.playerEl.setAttribute('value', TopTen.player);

//Listen for submit button click
TopTen.form = document.getElementById('getPlayer');
TopTen.form.addEventListener('click', TopTen.getPlayerName);
// TopTen.form.addEventListener('click', function(){console.log('form clicked');});


