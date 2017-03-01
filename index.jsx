import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//import { Local } from './demo/local'
import { Local } from './demo/local'
import { Remote } from './demo/remote'
import { LegoDemo } from './demo/lego'
import { MagicDemo } from './demo/magic'

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

// Render your table
ReactDOM.render(
  <App/>,
  document.getElementById('app')
);