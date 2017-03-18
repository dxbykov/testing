import { mutableMutator } from './mutable-mutator';

describe('immutableMutator', () => {
    
    //TODO

    test('#set', () => {
        expect(mutableMutator.set).not.toBeUndefined();
    });

    test('#splice', () => {
        expect(mutableMutator.splice).not.toBeUndefined();
    });

});
