import { 
    setDetailRowExpanded
} from './reducers';

describe('DetailRow reducers', () => {
    
    describe('#setDetailRowExpanded', () => {

        test('can expand row by toggling', () => {
            let expandedRows = [],
                payload = { rowId: 1 },
                nextExpandedRows = setDetailRowExpanded(expandedRows, payload);

            expect(nextExpandedRows).toEqual([ 1 ]);
        });

        test('can collapse row by toggling', () => {
            let expandedRows = [ 1 ],
                payload = { rowId: 1 },
                nextExpandedRows = setDetailRowExpanded(expandedRows, payload);

            expect(nextExpandedRows).toEqual([]);
        });

        test('does not collapse if isExpanded is true', () => {
            let expandedRows = [ 1 ],
                payload = { rowId: 1, isExpanded: true },
                nextExpandedRows = setDetailRowExpanded(expandedRows, payload);

            expect(nextExpandedRows).toEqual([ 1 ]);

            nextExpandedRows = setDetailRowExpanded(expandedRows, payload);
            expect(nextExpandedRows).toEqual([ 1 ]);
        });

        test('doesn not expand if isExpanded is false', () => {
            let expandedRows = [],
                payload = { rowId: 1, isExpanded: false },
                nextExpandedRows = setDetailRowExpanded(expandedRows, payload);

            expect(nextExpandedRows).toEqual([]);

            nextExpandedRows = setDetailRowExpanded(expandedRows, payload);
            expect(nextExpandedRows).toEqual([]);
        });

    });

});