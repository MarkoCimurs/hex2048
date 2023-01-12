import { createGameBoard, keyboardPresses, renderTileContainer } from "./dom";
import { Grid } from "./grid";
import { getRadiusFromUrl, spawnTiles } from "./server";


const gameBoard: HTMLElement = document.querySelector(".game-board");
const tileContainer: HTMLElement = document.querySelector(".tile-container");
const gameStatus: HTMLElement = document.querySelector("#game-status");
const gridSizeSelector: HTMLInputElement =document.querySelector("#grid-size-selector");
const urlSelector: HTMLSelectElement = document.querySelector("#url-server");

let serverURL: string = urlSelector.options[urlSelector.selectedIndex].value;
let gridSize: number = getRadiusFromUrl() ? getRadiusFromUrl() : 2;
let grid = new Grid(gridSize);

startGame();

window.addEventListener("keyup", (e) => keyboardPresses(grid,e, serverURL, tileContainer, gameStatus));


gridSizeSelector.addEventListener("input", () => {
  gridSize = Number(gridSizeSelector.value);
  grid = new Grid(gridSize);
  startGame();
});

urlSelector.addEventListener("input", () => {
  serverURL = urlSelector.options[urlSelector.selectedIndex].value;
});

async function startGame(){
    await spawnTiles(serverURL, grid);
    createGameBoard(grid, gameBoard);
    renderTileContainer(grid, tileContainer)
}