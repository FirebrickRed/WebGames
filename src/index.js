import Phaser from 'phaser';
// import './helloworld';
// import './tutorial';
import { createDineAtNiteGame } from './DineAtNite/index';
import { createTopDownShooter } from './TopdownShooter';

const homePage = document.getElementById('homePage');
let currentGamePlaying;

const games = [
  { name: 'Dine at Nite', url: 'dineatnite', createGame: createDineAtNiteGame, description: 'Diner dash inspired game', howToPlay: 'Place customers at seats, take their orders, bring customers their food, and the bring them the check.', knownBugs: ['Game breaks after game over screen', 'dirty dishes prevents clicking on table', 'Clicking on cusomters doesn\'t work on the right most customer all the time', 'When picking up ticket every customer on screen goes into sitWait animation'] },
  { name: 'Topdown Shooter', url: 'topdownshooter', createGame: createTopDownShooter, description: 'top down shooter, work in progress', howToPlay: 'click things?', knownBugs: [] }
];

function showPage(pageId) {
  const pages = document.getElementsByClassName('page');
  for(let i = 0; i < pages.length; i++) {
    pages[i].style.display = 'none';
  }
  if(document.getElementById(pageId)) {
    document.getElementById(pageId).style.display = 'block';
  }
}

function loadSubPage(subPageId) {
  console.log('in loadsubpage: ', subPageId);
  let gameToLoad = games.find(game => game.url === subPageId);
  currentGamePlaying = gameToLoad.createGame();
  document.getElementById('gameName').textContent = gameToLoad.name;
  document.getElementById('gameHowToPlay').textContent = gameToLoad.howToPlay;
  document.getElementById('gameBugs').appendChild(arrayToUl(gameToLoad.knownBugs));
}

const gameList = document.getElementById('gameList');

games.forEach(game => {
  const listItem = document.createElement('li');
  const link = document.createElement('a');

  link.textContent = game.name;
  link.href = `#gamePage/${game.url}`;

  listItem.appendChild(link);
  gameList.appendChild(listItem);
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  
  if(currentGamePlaying) {
    currentGamePlaying.destroy(true);
    currentGamePlaying = null;
  }

  if(hash.startsWith('gamePage/')) {
    const subPageId = hash.substring('gamePage/'.length);
    showPage('gamePage');
    loadSubPage(subPageId);
  } else {
    showPage(hash || 'homePage');
  }
});

const hash = window.location.hash.slice(1);
if(hash.startsWith('gamePage/')) {
  const subPageId = hash.substring('gamePage/'.length);
  showPage('gamePage');
  loadSubPage(subPageId);
} else {
  showPage(hash || 'homePage');
}

function arrayToUl(array) {
  let ul = document.createElement('ul');
  array.forEach(element => {
    const li = document.createElement('li');
    li.textContent = element
    // li.appendChild(document.createTextNode(element))
    ul.appendChild(li);
  });
  return ul;
}

/*

Games to Make: 
Cake Mania
Candy crush like Pizza game
Marble popper
Cat cafe like game but cat customers, maybe other animals as well
Cooking game that teaches you how to make irl things
Idle Games
Sheep Sheerer
Fishing
Barista
Snake
Minesweeper
card games

Katie will design houses for the house

Grocheries (Click on a department and play minigames in that department)
  Alternatively could be store manager, You start off small with like one department
  and then can either be gaining money or losing money and as you gain money you
  can spend it to expand your store and get more department minigames
*/