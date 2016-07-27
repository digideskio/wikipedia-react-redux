import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/App';
import HomePage from './components/HomePage';
import PageDetail from './containers/PageDetailContainer';
import NotFoundPage from './components/NotFoundPage';
import Bookmarks from './containers/Bookmarks';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage}/>
    <Route path="/page/:pageID" component={PageDetail}/>
    <Route path="/bookmarks" component={Bookmarks}/>
    <Route path="*" component={NotFoundPage}/>
  </Route>
);
