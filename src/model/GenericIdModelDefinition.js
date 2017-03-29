
import { unique as hash } from 'shorthash';
import ModelDefinition from 'd2/lib/model/ModelDefinition';

class GenericIdModelDefinition extends ModelDefinition {
    create(data) {
        const { id } = data;
        data.id = `${hash(id)}00000000000`.substr(0, 11);
        return Object.assign(super.create(data), { __id: id });
    }
}

export default GenericIdModelDefinition;
