import { Cordinates, Directions, Grid } from "./grid";
import { spawnTiles } from "./server";
import { Tile } from "./tile";

export function createGameBoard(grid: Grid, gameBoard: HTMLElement) {
  gameBoard.innerHTML = "";

  for (let i = -grid.radius; i <= grid.radius; i++) {
    const columnDiv = document.createElement("div");
    columnDiv.classList.add("column");

    let columnCordinates: Cordinates[] = grid.getColumn(i);

    for (let j = 0; j < columnCordinates.length; j++) {
      const div = document.createElement("div");

      div.setAttribute("data-x", `${columnCordinates[j].x}`);
      div.setAttribute("data-y", `${columnCordinates[j].y}`);
      div.setAttribute("data-z", `${columnCordinates[j].z}`);
      div.setAttribute("data-value", `${0}`);

      div.classList.add("grid-cell");
      columnDiv.appendChild(div);
    }

    gameBoard.appendChild(columnDiv);
  }
}

export function updateDataAtributes(grid: Grid) {
  grid.hexagonCordinates.forEach((cordinate) => {
    const div = getDivByCordinates(cordinate);
    const tile = grid.getTile(cordinate);
    div.setAttribute("data-value", `${tile ? tile.value : 0}`);
  });
}

export function getDivByCordinates(cordinate: Cordinates) {
  const div: HTMLElement = document.querySelector(
    `[data-x="${cordinate.x}"][data-y="${cordinate.y}"][data-z="${cordinate.z}"]`
  );
  return div;
}

export function getDivCordinates(div: HTMLElement) {
  return {
    x: div.offsetLeft,
    y: div.offsetTop,
  };
}

export function updateGameStatus(grid: Grid, gameStatus: HTMLElement) {
  if (!grid.gameOver) {
    gameStatus.innerHTML = "playing";
    gameStatus.setAttribute("data-status", "playing");
  } else {
    gameStatus.innerHTML = "game over";
    gameStatus.setAttribute("data-status", "game-over");
  }
}

export function renderTileContainer(grid: Grid, tileContainer: HTMLElement) {
  tileContainer.innerHTML = "";
  grid.tiles.forEach((tile) => renderTile(tile, tileContainer));
}

export async function renderTile(tile: Tile, tileContainer: HTMLElement) {
  const currPosDiv = getDivCordinates(getDivByCordinates(tile.currPos));

  const div = document.createElement("div");
  div.classList.add("tile");

  if (tile.previousPos) {
    let previousPosDiv = getDivCordinates(getDivByCordinates(tile.previousPos));
    div.style.left = `${previousPosDiv.x}px`;
    div.style.top = `${previousPosDiv.y}px`;

    window.requestAnimationFrame(() => {
      div.style.left = `${currPosDiv.x}px`;
      div.style.top = `${currPosDiv.y}px`;
    });
  } else if (tile.mergedFrom) {
    div.style.left = `${currPosDiv.x}px`;
    div.style.top = `${currPosDiv.y}px`;
    div.classList.add("merge");

    tile.mergedFrom.forEach((tile) => {
      renderTile(tile, tileContainer);
    });
  } else {
    div.style.left = `${currPosDiv.x}px`;
    div.style.top = `${currPosDiv.y}px`;
    div.classList.add("spawn");
  }
  
  div.classList.add(`tile-${tile.value}`);
  div.innerHTML = `${tile.value}`;
  
  tileContainer.appendChild(div);
}

export async function keyboardPresses(
  grid: Grid,
  e: KeyboardEvent,
  url: string,
  tileContainer: HTMLElement,
  gameStatus: HTMLElement
) {
  switch (e.key) {
    case "q":
      grid.slideGrid(Directions.nw);
      break;
    case "w":
      grid.slideGrid(Directions.n);
      break;
    case "e":
      grid.slideGrid(Directions.ne);
      break;
    case "a":
      grid.slideGrid(Directions.sw);
      break;
    case "s":
      grid.slideGrid(Directions.s);
      break;
    case "d":
      grid.slideGrid(Directions.se);
      break;
    default:
      return;
  }

  
  await spawnTiles(url, grid);
  renderTileContainer(grid, tileContainer);
  updateGameStatus(grid, gameStatus);
}
