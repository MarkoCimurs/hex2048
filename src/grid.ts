import { Tile } from "./tile";


export enum Directions {
  n = "n",
  s = "s",
  nw = "nw",
  ne = "ne",
  sw = "sw",
  se = "se",
}
export interface Cordinates {
  x: number;
  y: number;
  z: number;
}
enum Sort {
  descending = 1,
  ascending = -1,
}

export class Grid {
  radius: number;
  hexagonCordinates: Cordinates[];
  tiles: Tile[] = [];
  traversalOrder: Map<string, Cordinates[][]>;
  gameOver: boolean = false;
  directionValues: {[key: string] : Cordinates} = {
    n: { x: 0, y: 1, z: -1 },
    s: { x: 0, y: -1, z: 1 },
    nw: { x: -1, y: 1, z: 0 },
    ne: { x: 1, y: 0, z: -1 },
    sw: { x: -1, y: 0, z: 1 },
    se: { x: 1, y: -1, z: 0 },
  };

  constructor(radius: number) {
    this.radius = radius;
    this.hexagonCordinates = this.createHexGrid(radius);
    this.traversalOrder = this.createTraversalMap();
  }

  public getColumn(index: number): Cordinates[] {
    return this.sortCordinatesByPos(
      this.hexagonCordinates.filter((hex) => hex.x === index),
      Sort.ascending,
      Sort.ascending,
      Sort.ascending
    );
  }

  public nonEmptyTiles(): string {
    return JSON.stringify(this.tiles.map((tile) => ({ ...tile.currPos, value: tile.value })));
  }

  public getTile(cordinates: Cordinates): Tile | null {
    return this.tiles.find(
      (tile) =>
        (tile.currPos.x == cordinates.x &&
          tile.currPos.y == cordinates.y &&
          tile.currPos.z == cordinates.z) ||
          null
    );
  }

  public createTile({ x, y, z, value }: { x: number; y: number; z: number; value: number }): void {
    if (this.gameOver || !this.isWithinBounds({ x, y, z }) || !this.hasATileMoved()) return;
    this.tiles.push(new Tile({ x, y, z }, value));
  }

  private hasATileMoved(): boolean {
    if (this.tiles.length == 0) return true;
    return this.tiles.some((tile) => {
      if (!tile.previousPos) return false;
      if (tile.mergedFrom !== null) return true;
      return (
        tile.currPos.x != tile.previousPos.x ||
        tile.currPos.y != tile.previousPos.y ||
        tile.currPos.z != tile.previousPos.z
      );
    });
  }

  private createHexGrid(radius: number): Cordinates[] {
    const hexagons: Cordinates[] = [];
    for (let q = -radius; q <= radius; q++) {
      const rowStart = Math.max(-radius, -q - radius);
      const rowEnd = Math.min(radius, -q + radius);
      for (let r = rowStart; r <= rowEnd; r++) {
        hexagons.push({ x: q, y: r, z: -q - r });
      }
    }
    return hexagons;
  }

  private isGameOver(): boolean {
    const isGameWon = this.tiles.some((tile) => tile.value === 2048);
    const isGameLost =
      this.isGridFull() && this.tiles.every((tile) => this.hasMathcingNeighbour(tile) === false);
    return isGameLost || isGameWon ? true : false;
  }

  private hasMathcingNeighbour(tile: Tile): boolean {
    return Object.entries(this.directionValues).some(([key, neighborCord]) => {
      const neighborTile = this.getTile(this.sumCordinates(tile.currPos, neighborCord));
      return neighborTile ? tile.value === neighborTile.value : false;
    });
  }

  private isGridFull(): boolean {
    return this.hexagonCordinates.every((cordinate) => this.getTile(cordinate));
  }

  private deleteTileByRef(tile: Tile): void {
    const index = this.tiles.indexOf(tile);
    if (index !== -1) {
      this.tiles.splice(index, 1);
    }
  }

  private mergeTiles(tile1: Tile, tile2: Tile): Tile | null {
    if (tile1.value !== tile2.value) {
      return null;
    }

    tile1.updatePosition(tile2.currPos);
    const mergedTile = new Tile(tile1.currPos, tile1.value * 2);

    const tile1Clone = Object.assign({}, tile1);
    const tile2Clone = Object.assign({}, tile2);
    mergedTile.mergedFrom = [tile1Clone, tile2Clone];

    this.deleteTileByRef(tile1);
    this.deleteTileByRef(tile2);

    this.tiles.push(mergedTile);

    return mergedTile;
  }

  private prepareTiles(): void {
    this.tiles.forEach((tile) => {
      tile.mergedFrom = null;
      tile.savePosition();
    });
  }

  private getDirectionValue(direction: Directions): Cordinates {
    return this.directionValues[direction];
  }

  public slideGrid(direction: Directions): void {
    this.prepareTiles();

    const traversalOrder = this.traversalOrder.get(direction);
    const directionValue: Cordinates = this.getDirectionValue(direction);
    traversalOrder.forEach((cordinateArr) => {
      cordinateArr.forEach((cordinate) => {
        this.slideTile(this.getTile(cordinate), directionValue);
      });
    });
    this.gameOver = this.isGameOver();
  }

  private slideTile(tile: Tile, directionValue: Cordinates): void {
    if (!tile) return;

    let nextPos: Cordinates = this.sumCordinates(tile.currPos, directionValue);
    let nextTile: Tile;

    while (this.isWithinBounds(nextPos)) {
      nextTile = this.getTile(nextPos);
      if (nextTile == null) {
        tile.updatePosition(nextPos);
      } else if (nextTile.value == tile.value && nextTile.mergedFrom == null) {
        this.mergeTiles(tile, nextTile);
      } else break;
      nextPos = this.sumCordinates(nextPos, directionValue);
    }
  }

  private isWithinBounds(cordinate: Cordinates): boolean {
    return Object.values(cordinate).every((c) => Math.abs(c) <= this.radius);
  }

  private sumCordinates(a: Cordinates, b: Cordinates): Cordinates {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    };
  }

  private sortCordinatesByPos(
    hexArr: Cordinates[],
    xSort: Sort,
    ySort: Sort,
    zSort: Sort
  ): Cordinates[] {
    return [...hexArr].sort(
      (hex1, hex2) =>
        (hex1.x - hex2.x) * xSort || (hex1.y - hex2.y) * ySort || (hex1.z - hex2.z) * zSort
    );
  }

  private getAllXasis() {
    let result: Cordinates[][] = [];
    for (let i = -this.radius; i <= this.radius; i++) {
      let arr: Cordinates[] = this.hexagonCordinates.filter((hexagon) => hexagon.x === i);
      arr = this.sortCordinatesByPos(arr, Sort.ascending, Sort.ascending, Sort.ascending);
      result.push(arr);
    }
    return result;
  }

  private getAllYasis() {
    let result: Cordinates[][] = [];
    for (let i = -this.radius; i <= this.radius; i++) {
      let arr: Cordinates[] = this.hexagonCordinates.filter((hexagon) => hexagon.y === i);
      arr = this.sortCordinatesByPos(arr, Sort.ascending, Sort.descending, Sort.ascending);
      result.push(arr);
    }
    return result;
  }

  private getAllZasis() {
    let result: Cordinates[][] = [];
    for (let i = -this.radius; i <= this.radius; i++) {
      let arr: Cordinates[] = this.hexagonCordinates.filter((hexagon) => hexagon.z === i);
      arr = this.sortCordinatesByPos(arr, Sort.ascending, Sort.descending, Sort.ascending);
      result.push(arr);
    }
    return result;
  }

  private createTraversalMap(): Map<string, Cordinates[][]> {
    const map = new Map();
    map.set("n", this.getAllXasis());
    map.set(
      "s",
      this.getAllXasis().map((arr) => arr.reverse())
    );
    map.set(
      "sw",
      this.getAllYasis().map((arr) => arr.reverse())
    );
    map.set("ne", this.getAllYasis());
    map.set(
      "nw",
      this.getAllZasis().map((arr) => arr.reverse())
    );
    map.set("se", this.getAllZasis());

    return map;
  }
}
