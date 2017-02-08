import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Local } from './demo/local'
import { Remote } from './demo/remote'

class App extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="container">
                <h1>Local demo</h1>
                <Local/>
                <h1>Remote demo</h1>
                <Remote/>
            </div>
        );
    }
};

// Render your table
ReactDOM.render(
  <App/>,
  document.getElementById('app')
);