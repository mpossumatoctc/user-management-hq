import React from 'react';

import Filter from 'd2/lib/model/Filter';
import { getInstance as getD2 } from 'd2/lib/d2';

let d2;
if (!d2) {
    getD2().then(instance => d2 = instance);
}

class Synthetic {
    constructor(name, expression) {
        this.name = name;
        this.func = Synthetic.createFunction(expression);
    }

    bind(obj) {
        Object.defineProperty(obj, this.name, {
            get: this.func.bind(obj, d2, React)
        });
    }

    static createFunction(expression, thisArg) {
        // TODO: Lock me down!  context?
        const func = new Function('d2', 'React', `return ${expression};`);
        return (typeof thisArg !== 'undefined' ? func.bind(thisArg, d2, React) : func);
    }

    static createD2ModelFilter(filterDefinition, thisArg) {
        const filterValue = Synthetic.createFunction(filterDefinition.filterValue, thisArg || {})();
        const modelFilter = Object.assign(new Filter(), filterDefinition, { filterValue });
        return modelFilter;
    }
}

export default Synthetic;
