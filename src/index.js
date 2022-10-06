import fetchImages from './js/fetchimages';
import SimpleLightbox from 'simplelightbox';
import galleryTemplate from './templates/gallery.hbs';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchFormRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');

searchFormRef.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  galleryRef.innerHTML = '';
  const searchQuery = event.currentTarget.elements.searchQuery;
  fetchImages(searchQuery.value)
    .then(renderGallery)
    .catch(error => console.log(error));
}

function renderGallery(fetchResult) {
  galleryRef.insertAdjacentHTML('beforeend', galleryTemplate(fetchResult));
}

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  captionClass: 'custom-caption',
});
