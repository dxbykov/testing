export const mutableMutator = {
    set: (target, prop, value) => {
        return target[prop] = value;
    },
    splice: (target, start, deleteCount, itemsToInsert) => {
        target.splice(start, deleteCount, itemsToInsert);
        return target;
    }
};
