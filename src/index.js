import { Notify } from 'notiflix/build/notiflix-notify-aio';
import FetchImagesService from './js/fetchimages';
import SimpleLightbox from 'simplelightbox';
import galleryTemplate from './templates/gallery.hbs';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const NOTIFY_TIMEOUT = 5000; //ms
let isSubmitPressed = false;

const fetchImagesService = new FetchImagesService();

const searchFormRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');
const sentinelRef = document.querySelector('#sentinel');

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  captionClass: 'custom-caption',
});

searchFormRef.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  isSubmitPressed = true;
  event.preventDefault();
  clearGallery();
  const inputQuery = event.currentTarget.elements.searchQuery.value.trim();
  fetchImagesService.query = inputQuery;
  fetchImagesService.resetPage();
  if (inputQuery === '') {
    return;
  }
  fetchImagesService
    .fetchImages()
    .then(onFetchResult)
    .then(renderGallery)
    .catch(error => console.log(error));
}

async function onFetchResult(fetchResult) {
  if (fetchResult.total === 0) {
    Notify.warning(
      `Sorry, there are no images matching your search query. Please try again.`,
      {
        timeout: NOTIFY_TIMEOUT,
      }
    );
    throw new Error('There are no images matching search query');
  }
  if (fetchImagesService.page === 1 && fetchResult.total !== 0) {
    Notify.success(`Hooray! We found ${fetchImagesService.total} images`, {
      timeout: NOTIFY_TIMEOUT,
    });
  } else if (fetchImagesService.fetchedImages <= fetchImagesService.total) {
    Notify.success(
      `Fetched ${fetchImagesService.fetchedImages} images from ${fetchImagesService.total} total found`,
      {
        timeout: NOTIFY_TIMEOUT,
      }
    );
  }

  return fetchResult.hits;
}

function renderGallery(fetchResult) {
  galleryRef.insertAdjacentHTML('beforeend', galleryTemplate(fetchResult));
  fetchImagesService.incrementPage();
  isSubmitPressed = false;

  lightbox.refresh();
}

function clearGallery() {
  galleryRef.innerHTML = '';
}

const onEntry = entries => {
  entries.forEach(entry => {
    if (
      entry.isIntersecting &&
      !isSubmitPressed &&
      fetchImagesService.query !== ''
    ) {
      if (fetchImagesService.fetchedImages === fetchImagesService.total) {
        Notify.info(
          `We're sorry, but you've reached the end of search results.`,
          {
            timeout: NOTIFY_TIMEOUT,
          }
        );
      } else if (fetchImagesService.fetchedImages < fetchImagesService.total) {
        fetchImagesService
          .fetchImages()
          .then(onFetchResult)
          .then(renderGallery)
          .catch(error => console.log(error));
      }
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '150px',
});

observer.observe(sentinelRef);
