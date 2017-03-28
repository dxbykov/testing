import { 
    expandedDetailRows
} from './computeds';

describe('DetailRow computeds', () => {
    
    describe('#expandedDetailRows', () => {

        test('should work', () => {
            let rows = [ { id: 1 }, { id: 2 } ],
                expandedDetails = [ 2 ],
                expandedRows = expandedDetailRows(rows, expandedDetails);
                
            expect(expandedRows).toEqual([
                { id: 1 },
                { id: 2 },
                {
                    type: 'detailRow',
                    id: 'detailRow_2',
                    for: { id: 2 },
                    colspan: 0,
                    height: 'auto' 
                }
            ]);
        });

    });

});
