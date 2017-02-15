import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Local } from './demo/local'
import { Remote } from './demo/remote'
import { LegoDemo } from './demo/lego'

class App extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="container">
                <h1>Lego</h1>
                <LegoDemo/>
            </div>
        );
    }
};

// Render your table
ReactDOM.render(
  <App/>,
  document.getElementById('app')
);