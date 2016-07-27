export const REQUEST_PAGES = 'REQUEST_PAGES';
export const RECEIVE_PAGES = 'RECEIVE_PAGES';
export const INVALIDATE_PAGES = 'INVALIDATE_PAGES';

export const REQUEST_PAGE_DETAILS = 'REQUEST_PAGE_DETAILS';
export const RECEIVE_PAGE_DETAILS = 'RECEIVE_PAGE_DETAILS';

export const SET_DETAIL_PAGE = 'SET_DETAIL_PAGE';
export const UNSET_DETAIL_PAGE = 'UNSET_DETAIL_PAGE';

export const SET_BOOKMARK = 'SET_BOOKMARK';
export const UNSET_BOOKMARK = 'UNSET_BOOKMARK';

import { Promise } from 'es6-promise';
import { fetchRandomPages, getInfoByPageID, hydrateDetailPageImages } from '../utils/Wikipedia_API.js';

export function requestPages() {
  return (dispatch) => {
    const action = {
      type: REQUEST_PAGES
    };

    dispatch(action);
    getPages()
      .then((json) => dispatch(receivePages(json)));
  }
}

export function receivePages(pages) {
  return {
    type: RECEIVE_PAGES,
    receivedAt: Date.now(),
    pages: pages
  }
}

export function invalidatePages() {
  return (dispatch) => {
    const action = {
      type: INVALIDATE_PAGES,
      receivedAt: Date.now()
    };

    dispatch(action);
    localStorage.setItem('pages', "");
    dispatch(requestPages());
  }
}

export function getPages() {
  return new Promise((resolve) => {
    const pagesSerialized = localStorage.getItem('pages');

    if(!pagesSerialized) {
      return fetchRandomPages()
      .then((pages) => {
        const serialize = JSON.stringify(pages);
        localStorage.setItem('pages', serialize);
        return resolve(pages);
      });
    }

    const pages = JSON.parse(pagesSerialized);
    return resolve(pages);
  });
}

export function requestPageDetails(pageID) {
  return (dispatch) => {
    const action = {
      type: REQUEST_PAGE_DETAILS,
      pageID: pageID
    };

    dispatch(action);

    // TODO: add localstorage caching here
    getPageDetails(pageID)
      .then((wikiPages) => {
          let currDetailPage = wikiPages[pageID];
          let images = currDetailPage.images;

          if(!images) {
              dispatchUpdates(wikiPages, currDetailPage)
          } else {
            return fetchImageDataAndUpdateState();
          }

          // Fetches the image URLs and dispatches to render the PageDetail view.
          function fetchImageDataAndUpdateState() {

            const titleList = images.reduce((newList, img) => [...newList, img.title], []);

            hydrateDetailPageImages(titleList, currDetailPage).then(function(detailPage) {

              // Update wiki page from our in memory list
              wikiPages[pageID] = detailPage;

              // Dispatch our pages list update and set data for the current detail view
              dispatchUpdates(wikiPages, wikiPages[pageID]);

            }).catch((e) => {
              console.error('Failed to hydrate image info on details page', e);
              dispatchUpdates(wikiPages, wikiPages[pageID]);
            });
          }

          function dispatchUpdates(wikiPages, currDetailPage) {
            dispatch(receivePageDetails(wikiPages));
            dispatch(setDetailPage(currDetailPage));
          }
        }
      );
  }
}

export function setDetailPage(currPage) {
  return (dispatch) => {
    const action = {
      type: SET_DETAIL_PAGE,
      currDetailPage: currPage
    }

    dispatch(action);
  }
}

export function unsetDetailPage() {
  return (dispatch) => {
    const action = {
      type: UNSET_DETAIL_PAGE
    }

    dispatch(action);
  }
}

export function receivePageDetails(details) {
  return (dispatch) => {
    const action = {
      type: RECEIVE_PAGE_DETAILS,
      receivedAt: Date.now(),
      pageDetails: details
    };

    dispatch(action);
  }
}

export function getPageDetails(id) {
  return new Promise((resolve) => {
    const detailsSerialized = localStorage.getItem('pageDetails');
    let detailsContainer = JSON.parse(detailsSerialized) || {};
    const missing = !detailsContainer[id];

    if(missing) {
      return getInfoByPageID(id)
      .then((details) => {
        detailsContainer[id] = details;

        const serialize = JSON.stringify(detailsContainer);

        localStorage.setItem('pageDetails', serialize);

        return resolve(detailsContainer);
      });
    }

    detailsContainer = JSON.parse(detailsSerialized);
    return resolve(detailsContainer);
  });
}

export function setBookmark(newPage) {
  return (dispatch) => {
    const action = {
      type: SET_BOOKMARK,
      newBookmark: newPage
    };

    dispatch(action);
  }
}

export function unsetBookmark(page) {
  return (dispatch) => {
    const action = {
      type: UNSET_BOOKMARK,
      page,
    };

    dispatch(action);
  }
}