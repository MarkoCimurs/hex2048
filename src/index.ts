import { Directions, Grid } from "./grid";
import { Hexagon } from "./hexagon";
import { getRadiusFromUrl, sendPostRequest } from "./server";

const gameBoard = document.querySelector(".game-board");
const gameStatus = document.querySelector("#game-status");
const urlSelector: HTMLSelectElement = document.querySelector("#url-server");
const gridSizeSelector: HTMLInputElement = document.querySelector("#grid-size-selector");

let serverUrl: string = urlSelector.options[urlSelector.selectedIndex].value;
urlSelector.addEventListener("input", () => {
  serverUrl = urlSelector.options[urlSelector.selectedIndex].value;
});

gridSizeSelector.addEventListener("input", () => {
  gridSize = Number(gridSizeSelector.value);
  grid = new Grid(gridSize);
  startGame(grid);
});

let gridSize: number = getRadiusFromUrl() ? getRadiusFromUrl() : 2;
let grid: Grid = new Grid(gridSize);
startGame(grid);

window.addEventListener("keyup", (e)=> keyboardPresses(e))



async function startGame(grid: Grid) {
  await spawnHexagons(serverUrl, grid)
  gridToDom(grid);
}

function gridToDom(grid: Grid) {
  gameBoard.innerHTML = "";
  let radius = grid.radius;
  for (let i = -radius; i <= radius; i++) {
    const columnDiv = document.createElement("div");
    columnDiv.classList.add("column");

    let hexes: Hexagon[] = grid.getColumn(i);

    for (let j = 0; j < hexes.length; j++) {
      const div = document.createElement("div");
      div.setAttribute("data-x", `${hexes[j].x}`);
      div.setAttribute("data-y", `${hexes[j].y}`);
      div.setAttribute("data-z", `${hexes[j].z}`);
      div.setAttribute("data-value", `${hexes[j].value}`);
      div.innerHTML = `${hexes[j].value}`;
      columnDiv.appendChild(div);
    }
    gameBoard.appendChild(columnDiv);
  }

  if (!grid.gameOver) {
    gameStatus.innerHTML = "playing";
    gameBoard.setAttribute("data-status", "playing");
  } else {
    gameStatus.innerHTML = "game over";
    gameBoard.setAttribute("data-status", "game-over");
  }
}

async function spawnHexagons(url: string, grid: Grid) {
  const data = await sendPostRequest(url + (grid.radius+1).toString(), grid.nonEmptyTiles());
  data.forEach((hex: any) => {
    grid.setHex(hex);
  });
}

async function keyboardPresses(e: KeyboardEvent){
    switch(e.key){
        case "q":
            grid.slideGrid(Directions.nw)
        break;
        case "w":
            grid.slideGrid(Directions.n)
        break;
        case "e":
            grid.slideGrid(Directions.ne)
        break;
        case "a":
            grid.slideGrid(Directions.sw)
        break;
        case "s":
            grid.slideGrid(Directions.s)
        break;
        case "d":
            grid.slideGrid(Directions.se)
        break;
    }
    await spawnHexagons(serverUrl, grid);
    gridToDom(grid)
}