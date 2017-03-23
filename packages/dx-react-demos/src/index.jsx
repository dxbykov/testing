import React from 'react';
import ReactDOM from 'react-dom';

import { FullFeaturedControlledDemo } from './full-featured-controlled.jsx';
import { FullFeaturedUncontrolledDemo } from './full-featured-uncontrolled.jsx';
import { UncontrolledVirtualDemo } from './uncontrolled-virtual.jsx';
import './index.css';

class App extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div>
                <h1>Demo Index</h1>
                
                <FullFeaturedControlledDemo />
                <FullFeaturedUncontrolledDemo />
                <UncontrolledVirtualDemo />
            </div>
        );
    }
};

ReactDOM.render(
  <App/>,
  document.getElementById('app')
);