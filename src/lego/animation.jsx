import React from 'react';
import { Motion, spring } from 'react-motion';

const springify = styles => {
    let result = {};

    Object.keys(styles).forEach(prop => {
        result[prop] = spring(styles[prop]);
    });

    return result;
};

export class Transition extends React.PureComponent {
    constructor(props) {
        super();
        this.state = { prevState: undefined };
    }
    componentWillReceiveProps(nextProps) {
        if(this.isStateChanged(nextProps.state, this.props.state)) {
            this.setState({
                prevState: this.props.state
            });
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return this.isStateChanged(nextProps.state, this.props.state);
    }
    isStateChanged(nextState, prevState) {
        if(this.props.isStateChanged)
            return this.props.isStateChanged(nextState, prevState);

        return nextState !== prevState;
    }
    render() {
        let transition = this.props.getTransition(this.state.prevState, this.props.state);
        return <Motion
            defaultStyle={transition.from}
            style={springify(transition.to)}>
            {(animatedProps) => {
                const renderedChildren = this.props.children(animatedProps);
                return renderedChildren && React.Children.only(renderedChildren);
            }}
        </Motion>
    }
}
Transition.propTypes = {
    state: React.PropTypes.object.isRequired,
    getTransition: React.PropTypes.func.isRequired,
    isStateChanged: React.PropTypes.func
};

