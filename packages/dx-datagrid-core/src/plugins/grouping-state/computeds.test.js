import { 
    groupedRows,
    expandedGroupRows
} from './computeds';

describe('GroupingPlugin computeds', () => {
    
    describe('#groupedRows', () => {
        
        const rows = [
            { a: 1, b: 1 },
            { a: 1, b: 2 },
            { a: 2, b: 1 },
            { a: 2, b: 2 }
        ];

        test('can group by one column', () => {
            let groupings = [ { column: 'a' } ],
                grouped = groupedRows(rows, groupings);
                
            expect(grouped).toHaveLength(2);
            expect(grouped[0]).toMatchObject({
                key: '1',
                value: '1',
                type: 'groupRow',
                column: 'a',
                colspan: 0
            });
            expect(grouped[0].rows).toHaveLength(2);
            expect(grouped[0].rows[0]).toMatchObject(rows[0]);
            expect(grouped[0].rows[1]).toMatchObject(rows[1]);
        });

    });

    describe('#expandedGroupRows', () => {
        
        const groupedRows = [
            {
                type: 'groupRow',
                key: 'toExpand',
                rows: [
                    { a: 1 }
                ]
            },
            {
                type: 'groupRow',
                key: 'keepCollapsed',
                rows: [
                    { a: 1 }
                ]
            }
        ];

        test('can expand groups', () => {
            let expandedGroups = { 'toExpand': true },
                expanded = expandedGroupRows(groupedRows, expandedGroups);
                
            expect(expanded).toEqual([
                {
                    type: 'groupRow',
                    key: 'toExpand',
                    rows: [
                        { a: 1 }
                    ]
                },
                { a: 1 },
                {
                    type: 'groupRow',
                    key: 'keepCollapsed',
                    rows: [
                        { a: 1 }
                    ]
                }                
            ]);
        });

    });

});
