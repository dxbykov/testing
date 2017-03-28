import { 
    setCurrentPage
} from './reducers';

describe('PagingState reducers', () => {
    
    describe('#setCurrentPage', () => {

        test('should work', () => {
            let state = 0,
                payload = { page: 1 },
                nextState = setCurrentPage(state, payload);

            expect(nextState).toBe(1);
        });

    });

});