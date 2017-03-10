import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

const dragStart = (state, action) => {
    return action.payload.data;
};

const dragEnd = (state, action) => {
    return null;
};

export default asPluginComponent(() => {
    return {
        actionCreators: {
            dragStart: (original, host) => ({ data }) => ({ type: 'OBJECT_DRAG_START', payload: { data } }),
            dragEnd: (original, host) => () => ({ type: 'OBJECT_DRAG_END' }),
        },
        reducers: {
            draggingObject: () => createReducer(null, {
                'OBJECT_DRAG_START': dragStart,
                'OBJECT_DRAG_END': dragEnd
            })
        }
    };
});