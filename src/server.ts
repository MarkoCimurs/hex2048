import axios from "axios";

export async function sendPostRequest(url: string, payload: any) {
  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export function getRadiusFromUrl(): number | undefined{
  const url = document.location.href;
  const urlParts = url.split("/#test");
  const radius = urlParts && urlParts[1] && parseInt(urlParts[1]);
  return radius;
}