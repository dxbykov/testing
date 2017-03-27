import { 
    _pureReducer
} from './reducers';

describe('Plugin reducers', () => {
    
    describe('#_pureReducer', () => {

        test('should work', () => {
            let state = [],
                payload = { columnName: 'test' },
                nextState = _pureReducer(state, payload);

            expect(nextState).toBeUndefined();
        });

    });

});