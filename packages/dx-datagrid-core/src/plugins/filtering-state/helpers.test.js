import { 
    getColumnFilterValue
} from './helpers';

describe('FilteringPlugin helpers', () => {
    
    describe('#getColumnFilterValue', () => {

        test('returns an empty string if no filters specified', () => {
            let filters = [],
                value = getColumnFilterValue(filters, 'test');
                
            expect(value).toBe('');
        });

        test('returns a filter value by column name', () => {
            let filters = [ { column: 'a', value: 'test' } ],
                value = getColumnFilterValue(filters, 'a');
                
            expect(value).toBe('test');
        });

    });

});