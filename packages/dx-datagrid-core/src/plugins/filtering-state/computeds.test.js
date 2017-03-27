import { 
    filteredRows
} from './computeds';

describe('FilteringState computeds', () => {
    
    describe('#filteredRows', () => {

        const rows = [
            { a: 1, b: 1 },
            { a: 1, b: 2 },
            { a: 2, b: 1 },
            { a: 2, b: 2 }
        ];

        test('should not touch rows if no filters specified', () => {
            let filters = [],
                filtered = filteredRows(rows, filters);
                
            expect(filtered).toBe(rows);
        });

        test('can filter by one field', () => {
            let filters = [ { column: 'a', value: 1 } ],
                filtered = filteredRows(rows, filters);
                
            expect(filtered).toEqual([
                { a: 1, b: 1 },
                { a: 1, b: 2 }
            ]);
        });

        test('can filter by several fields', () => {
            let filters = [ { column: 'a', value: 1 }, { column: 'b', value: 2 } ],
                filtered = filteredRows(rows, filters);
                
            expect(filtered).toEqual([
                { a: 1, b: 2 }
            ]);
        });

    });

});
