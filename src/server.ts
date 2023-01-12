import axios from "axios";
import { Grid } from "./grid";

export async function sendPostRequest(url: string, payload: any) {
  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function getRadiusFromUrl(): number | undefined {
  const url = document.location.href;
  const urlParts = url.split("/#test");
  const radius = urlParts && urlParts[1] && parseInt(urlParts[1]);
  return radius;
}

export async function spawnTiles(url: string, grid: Grid) {
  const data = await sendPostRequest(url + (grid.radius + 1).toString(), grid.nonEmptyTiles());
  data.forEach((tileData: any) => grid.createTile(tileData));
}
