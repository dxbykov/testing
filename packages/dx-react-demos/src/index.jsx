import React from 'react';
import ReactDOM from 'react-dom';

import { MagicDemo } from './magic'

class App extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div>
                <h1>Magic</h1>
                <MagicDemo/>
            </div>
        );
    }
};

ReactDOM.render(
  <App/>,
  document.getElementById('app')
);