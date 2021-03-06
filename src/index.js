// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { NotificationContainer } from 'react-notifications';

import * as serviceWorker from '@utils/serviceWorker';
import Routers from '@config/routing';
import store from '@store';

import '@assets/style/main.scss';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Routers />
      <NotificationContainer />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
serviceWorker.unregister();
