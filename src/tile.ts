import { Cordinates } from "./grid";

export class Tile {
  currPos: Cordinates;
  previousPos: Cordinates | null = null;
  mergedFrom: Tile[] = null;
  value: number;

  constructor(postion: Cordinates, value: number) {
    this.currPos = { ...postion };
    this.value = value;
  }

  savePosition() {
    this.previousPos = { ...this.currPos };
  }

  updatePosition(position: Cordinates) {
    this.currPos = { ...position };
  }
}
