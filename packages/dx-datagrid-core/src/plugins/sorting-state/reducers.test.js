import { 
    setColumnSorting
} from './reducers';

describe('SortingState reducers', () => {
    
    describe('#setColumnSorting', () => {

        test('can initiate sorting', () => {
            let sortings = [],
                payload = { columnName: 'test' },
                nextSortings = setColumnSorting(sortings, payload);
                
            expect(nextSortings).toEqual([ { column: 'test', direction: 'asc' } ]);
        });

        test('can initiate sorting with direction', () => {
            let sortings = [],
                payload = { columnName: 'test', direction: 'desc' },
                nextSortings = setColumnSorting(sortings, payload);
                
            expect(nextSortings).toEqual([ { column: 'test', direction: 'desc' } ]);
        });

        test('can toggle sorting', () => {
            let sortings = [ { column: 'test', direction: 'asc' } ],
                payload = { columnName: 'test' },
                nextSortings = setColumnSorting(sortings, payload);
                
            expect(nextSortings).toEqual([ { column: 'test', direction: 'desc' } ]);
        });

        test('should reset sorting if no keepOther is specified', () => {
            let sortings = [ { column: 'test', direction: 'asc' } ],
                payload = { columnName: 'test2' },
                nextSortings = setColumnSorting(sortings, payload);
                
            expect(nextSortings).toEqual([ { column: 'test2', direction: 'asc' } ]);
        });

        test('can initiate multi-column sorting by keepOther option', () => {
            let sortings = [ { column: 'test', direction: 'asc' } ],
                payload = { columnName: 'test2', keepOther: true },
                nextSortings = setColumnSorting(sortings, payload);
                
            expect(nextSortings).toEqual([ { column: 'test', direction: 'asc' }, { column: 'test2', direction: 'asc' } ]);
        });

        test('can toggle multi-column sorting', () => {
            let sortings = [ { column: 'test', direction: 'asc' }, { column: 'test2', direction: 'asc' } ],
                payload = { columnName: 'test', keepOther: true },
                nextSortings = setColumnSorting(sortings, payload);
                
            expect(nextSortings).toEqual([ { column: 'test', direction: 'desc' }, { column: 'test2', direction: 'asc' } ]);
        });

    });

});
