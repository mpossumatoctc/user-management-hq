import DataTableComponent from './datatable.component';
import DetailsComponent from './details.component';
import MatrixViewComponent from './matrixview.component';
import ModelCollectionComponent from './modelcollection.component';
import TextComponent from './text.component';

import MaterialUi from 'material-ui/lib';

const components = Object.assign({}, MaterialUi, {
    DataTableComponent,
    DetailsComponent,
    MatrixViewComponent,
    ModelCollectionComponent,
    TextComponent
});

components.get = (name) => (name in components ? components[name] : name);

export default components;
