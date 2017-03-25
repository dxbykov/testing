import { 
    sortedRows
} from './computeds';

describe('SortingState computeds', () => {
    
    describe('#sortedRows', () => {

        const rows = [
            { a: 2, b: 2 },
            { a: 1, b: 1 },
            { a: 2, b: 1 },
            { a: 1, b: 2 }
        ];

        test('does not mutate rows if no sortings specified', () => {
            let sortings = [ ],
                sorted = sortedRows(rows, sortings);
                
            expect(sorted).toBe(rows);
        });

        test('can sort ascending by one column', () => {
            let sortings = [ { column: 'a', direction: 'asc' } ],
                sorted = sortedRows(rows, sortings);
                
            expect(sorted).toEqual([
                { a: 1, b: 1 },
                { a: 1, b: 2 },
                { a: 2, b: 2 },
                { a: 2, b: 1 }
            ]);
        });

        test('can sort descending by one column', () => {
            let sortings = [ { column: 'a', direction: 'desc' } ],
                sorted = sortedRows(rows, sortings);
                
            expect(sorted).toEqual([
                { a: 2, b: 2 },
                { a: 2, b: 1 },
                { a: 1, b: 1 },
                { a: 1, b: 2 }
            ]);
        });

        test('can sort by several columns', () => {
            let sortings = [ { column: 'a', direction: 'asc' }, { column: 'b', direction: 'asc' } ],
                sorted = sortedRows(rows, sortings);
                
            expect(sorted).toEqual([
                { a: 1, b: 1 },
                { a: 1, b: 2 },
                { a: 2, b: 1 },
                { a: 2, b: 2 }
            ]);
        });

        test('can sort by several columns with different directions', () => {
            let sortings = [ { column: 'a', direction: 'asc' }, { column: 'b', direction: 'desc' } ],
                sorted = sortedRows(rows, sortings);
                
            expect(sorted).toEqual([
                { a: 1, b: 2 },
                { a: 1, b: 1 },
                { a: 2, b: 2 },
                { a: 2, b: 1 }
            ]);
        });

    });

});
