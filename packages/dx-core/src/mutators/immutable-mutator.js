export const immutableMutator = {
    set: (target, prop, value) => {
        if(target[prop] !== value) {
            return Object.assign({}, target, { [prop]: value });
        }
        return target;
    },
    splice: (target, start, deleteCount, itemsToInsert) => {
        let result = target.slice();
        result.splice(start, deleteCount, itemsToInsert);
        return result;
    }
};
