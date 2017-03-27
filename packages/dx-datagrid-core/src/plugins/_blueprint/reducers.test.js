import { 
    _pureReducer
} from './reducers';

describe('Plugin reducers', () => {
    
    describe('#_pureReducer', () => {

        test('should work', () => {
            expect(_pureReducer()).toBeUndefined();
        });

    });

});