import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter} from 'react-router-dom';
import {renderRoutes} from 'react-router-config';
import routers from './router';

ReactDOM.render(<HashRouter>{renderRoutes(routers)}</HashRouter>, document.getElementById('root'));

document.getElementById('loading').style.display = 'none';

if (module.hot) {
    module.hot.accept();
}
