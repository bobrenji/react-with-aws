import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { StylesProvider } from '@material-ui/core';

import LandingPage from './components/Landing';
import Pricing from './components/Pricing';

export default () => {
  return (
    <div>
      <StylesProvider>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route exact path="/pricing" component={Pricing} />
          </Switch>
        </BrowserRouter>
      </StylesProvider>
    </div>
  );
};
