import { 
    _pureHelper
} from './helpers';

describe('Plugin helpers', () => {
    
    describe('#_pureHelper', () => {

        test('should work', () => {
            expect(_pureHelper()).toBeUndefined();
        });

    });

});