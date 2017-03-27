import { 
    groupByColumn
} from './reducers';

describe('GroupingState reducers', () => {
    
    describe('#groupByColumn', () => {

        test('can group by column', () => {
            let grouping = [],
                payload = { columnName: 'test' },
                nextGrouping = groupByColumn(grouping, payload);

            expect(nextGrouping).toEqual([
                { column: 'test' }
            ]);
        });

        test('can ungroup by column', () => {
            let grouping = [ { column: 'test' } ],
                payload = { columnName: 'test' },
                nextGrouping = groupByColumn(grouping, payload);

            expect(nextGrouping).toEqual([]);
        });

        test('can group by several columns', () => {
            let grouping = [ { column: 'column1' } ],
                payload = { columnName: 'column2' },
                nextGrouping = groupByColumn(grouping, payload);

            expect(nextGrouping).toEqual([
                { column: 'column1' },
                { column: 'column2' }
            ]);
        });

        test('can group by column with a group index', () => {
            let grouping = [ { column: 'column1' } ],
                payload = { columnName: 'column2', groupIndex: 0 },
                nextGrouping = groupByColumn(grouping, payload);

            expect(nextGrouping).toEqual([
                { column: 'column2' },
                { column: 'column1' }
            ]);
        });


    });

});