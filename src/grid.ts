import { Hexagon } from "./hexagon";

export enum Directions {
  n = "n",
  s = "s",
  nw = "nw",
  ne = "ne",
  sw = "sw",
  se = "se",
}

enum Sort {
  descending = 1,
  ascending = -1,
}

export class Grid {
  radius: number;
  hexagons: Hexagon[];
  traversalIndexes: Map<string, number[][]>;
  gameOver: boolean = false;

  constructor(radius: number) {
    this.radius = radius;
    this.hexagons = this.createHexGrid(radius);
    this.traversalIndexes = this.createTraversalMap();
  }

  private createHexGrid(radius: number): Hexagon[] {
    const hexagons: Hexagon[] = [];
    for (let q = -radius; q <= radius; q++) {
      const rowStart = Math.max(-radius, -q - radius);
      const rowEnd = Math.min(radius, -q + radius);
      for (let r = rowStart; r <= rowEnd; r++) {
        hexagons.push(new Hexagon(q, r, -q - r, 0));
      }
    }
    return hexagons;
  }

  public setHex({ x, y, z, value }: { x: number; y: number; z: number; value: number }): void {
    if (this.gameOver) return;
    const hex = this.hexagons.find((hex) => hex.x == x && hex.y == y && hex.z == z);
    hex.value = value;
  }

  public getColumn(index: number): Hexagon[] {
    return this.sortHexagonsByPos(
      this.hexagons.filter((hex) => hex.x === index),
      Sort.ascending,
      Sort.ascending,
      Sort.ascending
    );
  }

  public slideGrid(direction: Directions) {
    if (this.gameOver) return;

    const arrays = this.traversalIndexes.get(direction);
    arrays.forEach((arr) => {
      let values = this.getValues(arr);
      values = this.sum2048Values(values);
      this.setValuesToIndex(arr, values);
    });

    this.gameOver = this.isGameOver();
  }

  public nonEmptyTiles(): string {
    return JSON.stringify(this.hexagons.filter((hex) => hex.value !== 0));
  }

  public isGameOver(): boolean {
    const isGameWon = this.hexagons.some((hex) => hex.value === 2048);
    const isGameLost = this.isGridFull() && this.hexagons.every((hex) => this.haskMathcingNeigbour(hex) === false);
    return isGameLost || isGameWon ? true : false;
  }

  private getHexByCordinates({ x, y, z }: { x: number; y: number; z: number }): Hexagon {
    return this.hexagons.find((hex) => hex.x == x && hex.y == y && hex.z == z) || null;
  }

  private haskMathcingNeigbour(hexagon: Hexagon): boolean {
    const neighbors = {
      n: { x: 0, y: 1, z: -1 },
      s: { x: 0, y: -1, z: 1 },
      nw: { x: -1, y: 1, z: 0 },
      ne: { x: 1, y: 0, z: -1 },
      sw: { x: -1, y: 0, z: 1 },
      se: { x: 1, y: -1, z: 0 },
    };

    return Object.entries(neighbors).some(([key, neighborCord]) => {
      const {x,y,z}= neighborCord;
      const neighbor = this.getHexByCordinates({x: hexagon.x + x, y: hexagon.y + y, z: hexagon.z + z});
      return neighbor ? hexagon.value === neighbor.value : false;
    });
  }

  private isGridFull(): boolean {
    return this.hexagons.every((hex) => hex.value !== 0);
  }

  private sortHexagonsByPos(hexArr: Hexagon[], xSort: Sort, ySort: Sort, zSort: Sort): Hexagon[] {
    return [...hexArr].sort(
      (hex1, hex2) =>
        (hex1.x - hex2.x) * xSort || (hex1.y - hex2.y) * ySort || (hex1.z - hex2.z) * zSort
    );
  }

  private getAllXasis(): number[][] {
    let result: number[][] = [];
    for (let i = -this.radius; i <= this.radius; i++) {
      let arr: Hexagon[] = this.hexagons.filter((hexagon) => hexagon.x === i);
      arr = this.sortHexagonsByPos(arr, Sort.ascending, Sort.ascending, Sort.ascending);

      const indexes = arr.map((hex: Hexagon) => {
        return this.hexagons.indexOf(hex);
      });

      result.push(indexes);
    }
    return result;
  }

  private getAllYasis(): number[][] {
    let result: number[][] = [];
    for (let i = -this.radius; i <= this.radius; i++) {
      let arr: Hexagon[] = this.hexagons.filter((hexagon) => hexagon.y === i);
      arr = this.sortHexagonsByPos(arr, Sort.ascending, Sort.descending, Sort.ascending);

      const indexes = arr.map((hex: Hexagon) => {
        return this.hexagons.indexOf(hex);
      });
      result.push(indexes);
    }
    return result;
  }

  private getAllZasis(): number[][] {
    let result: number[][] = [];
    for (let i = -this.radius; i <= this.radius; i++) {
      let arr: Hexagon[] = this.hexagons.filter((hexagon) => hexagon.z === i);
      arr = this.sortHexagonsByPos(arr, Sort.ascending, Sort.descending, Sort.ascending);

      const indexes = arr.map((hex: Hexagon) => {
        return this.hexagons.indexOf(hex);
      });
      result.push(indexes);
    }
    return result;
  }

  private createTraversalMap(): Map<string, number[][]> {
    const map = new Map();
    map.set(
      "n",
      this.getAllXasis().map((arr) => arr.reverse())
    );
    map.set("s", this.getAllXasis());
    map.set("sw", this.getAllYasis());
    map.set(
      "ne",
      this.getAllYasis().map((arr) => arr.reverse())
    );
    map.set("nw", this.getAllZasis());
    map.set(
      "se",
      this.getAllZasis().map((arr) => arr.reverse())
    );
    return map;
  }

  private addZerosToStart<T>(arr: T[], n: number): T[] {
    return [...Array(n).fill(0), ...arr];
  }

  private sum2048Values(numbers: number[]): number[] {
    let result: number[] = [];
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] === numbers[i + 1]) {
        result.push(numbers[i] * 2);
        i++;
      } else {
        result.push(numbers[i]);
      }
    }
    result = result.filter((number) => number !== 0);
    return this.addZerosToStart(result, numbers.length - result.length);
  }

  private getValues(indexArr: number[]): number[] {
    return indexArr.map((index) => this.hexagons[index].value);
  }

  private setValuesToIndex(indexArr: number[], valueArr: number[]): void {
    if (indexArr.length !== valueArr.length) return;

    indexArr.forEach((index, valueIdx) => {
      this.hexagons[index].value = valueArr[valueIdx];
    });
  }
}
