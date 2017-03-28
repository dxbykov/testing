import { 
    setRowSelection,
    toggleSelectAll
} from './reducers';

describe('SelectionState reducers', () => {
    
    describe('#setRowSelection', () => {

        test('can select row by toggling', () => {
            let selection = [],
                payload = { rowId: 1 },
                nextSelection = setRowSelection(selection, payload);

            expect(nextSelection).toEqual([ 1 ]);
        });

        test('can deselect row by toggling', () => {
            let selection = [ 1 ],
                payload = { rowId: 1 },
                nextSelection = setRowSelection(selection, payload);

            expect(nextSelection).toEqual([]);
        });

        test('does not deselect if isSelected is true', () => {
            let selection = [ 1 ],
                payload = { rowId: 1, isSelected: true },
                nextSelection = setRowSelection(selection, payload);

            expect(nextSelection).toEqual([ 1 ]);

            nextSelection = setRowSelection(selection, payload);
            expect(nextSelection).toEqual([ 1 ]);
        });

        test('does not select if isSelected is false', () => {
            let selection = [],
                payload = { rowId: 1, isSelected: false },
                nextSelection = setRowSelection(selection, payload);

            expect(nextSelection).toEqual([]);

            nextSelection = setRowSelection(selection, payload);
            expect(nextSelection).toEqual([]);
        });

    });

    describe('#toggleSelectAll', () => {

        test('can select all', () => {
            let selection = [],
                payload = { rows: [ 1, 2 ], getRowId: row => row },
                nextSelection = toggleSelectAll(selection, payload);

            expect(nextSelection).toEqual([ 1, 2 ]);
        });

    });

});