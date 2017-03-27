import { 
    _pureComputed
} from './computeds';

describe('Plugin computeds', () => {
    
    describe('#_pureComputed', () => {

        test('should work', () => {
            expect(_pureComputed()).toBeUndefined();
        });

    });

});
