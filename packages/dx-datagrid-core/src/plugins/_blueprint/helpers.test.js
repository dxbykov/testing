import { 
    _pureHelper
} from './helpers';

describe('Plugin helpers', () => {
    
    describe('#_pureHelper', () => {

        test('should work', () => {
            let arg1 = [],
                value = _pureHelper(arg1);
                
            expect(value).toBeUndefined();
        });

    });

});