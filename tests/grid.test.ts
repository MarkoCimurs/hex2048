import { Grid, Cordinates } from "../src/grid";
import {Tile} from "../src/tile"

describe("Testing Grid", () => {
  describe("Properly creates hex grid", () => {
    it("Creating a grid of radius 1", () => {
      const grid = new Grid(1);

      expect(grid.hexagonCordinates).toEqual(
        expect.arrayContaining([
          { x: -1, y: 0, z: 1 },
          { x: -1, y: 1, z: 0 },
          { x: 0, y: -1, z: 1 },
          { x: 0, y: 0, z: -0 },
          { x: 0, y: 1, z: -1 },
          { x: 1, y: -1, z: 0 },
          { x: 1, y: 0, z: -1 },
        ])
      );
    });
  });

  describe("Check if tiles are added properly", () => {
    it('Adding tile at x:0, y:0, z:0', () => {
        const grid = new Grid(1);
        grid.createTile({x: 0, y:0, z:0, value: 4})
        expect(grid.tiles).toContainEqual({
            currPos: {x: 0, y: 0, z: 0} as Cordinates,
            previousPos: null,
            mergedFrom: null,
            value: 4
        } as Tile)

        expect(grid.tiles.length).toEqual(1)
    })

    it('Should not be able to add tile out of bounds', () => {
        const grid = new Grid(1);
        grid.createTile({x: 2, y:0, z:-2, value: 4})
        expect(grid.tiles.length).toEqual(0)
    })

    it('Should not be able to add tile when hexagon is already taken', () => {
      const grid = new Grid(1);
      grid.createTile({x: 0, y:0, z:0, value: 4})
      grid.createTile({x: 0, y:0, z:0, value: 2})
      expect(grid.tiles).toContainEqual({
          currPos: {x: 0, y: 0, z: 0} as Cordinates,
          previousPos: null,
          mergedFrom: null,
          value: 4
      } as Tile)

      expect(grid.tiles.length).toEqual(1)
  })
  })
});
