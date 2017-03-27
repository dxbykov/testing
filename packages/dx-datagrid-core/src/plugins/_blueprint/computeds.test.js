import { 
    _pureComputed
} from './computeds';

describe('Plugin computeds', () => {
    
    describe('#_pureComputed', () => {

        test('should work', () => {
            let arg1 = [],
                computed = _pureComputed(arg1);
                
            expect(computed).toBeUndefined();
        });

    });

});
