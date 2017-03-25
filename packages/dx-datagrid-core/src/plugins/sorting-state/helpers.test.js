import { 
    getColumnSortingDirection
} from './helpers';

describe('SortingState helpers', () => {
    
    describe('#getColumnSortingDirection', () => {

        test('returns sorting direction', () => {
            let sortings = [ { column: 'test', direction: 'testDirection' } ],
                direction = getColumnSortingDirection(sortings, 'test');
                
            expect(direction).toBe('testDirection');
        });

        test('returns false if a column is not sorted', () => {
            let sortings = [ ],
                direction = getColumnSortingDirection(sortings, 'test');
                
            expect(direction).toBe(false);
        });

    });

});
