import { 
    setColumnFilter
} from './reducers';

describe('SortingState reducers', () => {
    
    describe('#setColumnFilter', () => {

        test('can set column filter', () => {
            let filters = [],
                payload = { columnName: 'column', value: 'value' },
                nextFilters = setColumnFilter(filters, payload);
            
            expect(nextFilters).toEqual([ { column: 'column', value: 'value' } ]);
        });

        test('can change column filter', () => {
            let filters = [ { column: 'column', value: 'value' } ],
                payload = { columnName: 'column', value: 'new value' },
                nextFilters = setColumnFilter(filters, payload);
            
            expect(nextFilters).toEqual([ { column: 'column', value: 'new value' } ]);
        });

        test('can add column filter', () => {
            let filters = [ { column: 'column1', value: 'value' } ],
                payload = { columnName: 'column2', value: 'new value' },
                nextFilters = setColumnFilter(filters, payload);
            
            expect(nextFilters).toEqual([
                { column: 'column1', value: 'value' },
                { column: 'column2', value: 'new value' }
            ]);
        });

        test('can remove column filter', () => {
            let filters = [ { column: 'column', value: 'value' } ],
                payload = { columnName: 'column', value: '' },
                nextFilters = setColumnFilter(filters, payload);
            
            expect(nextFilters).toEqual([ ]);
        });

    });

});