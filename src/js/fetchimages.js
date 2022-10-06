import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const RESPONSE_OK = 200;

const searchParams = {
  key: '30410400-df54a4fa47e0d802e49478434',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  page: 1,
  per_page: 9,
};

export default async function fetchImages(name) {
  searchParams.q = name;
  const response = await axios.get(BASE_URL, { params: searchParams });
  if (response.status !== RESPONSE_OK) {
    throw new Error(response.status);
  }
  return response.data.hits;
}
