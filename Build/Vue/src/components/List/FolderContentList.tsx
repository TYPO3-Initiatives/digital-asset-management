import AllSelector from '@/components/AllSelector';
import List from '@/components/List';
import {CreateElement, VNode} from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {State} from 'vuex-class';

@Component
export default class FolderContentList extends List {
    @Prop()
    items: any;

    @State
    current: any;

    visibleColumns: Array<string> = ['name', 'mtimeDisplay', 'sizeDisplay', 'type', 'translations', 'references', 'permissions'];

    constructor(props: any) {
        super(props);
    }

    protected render(h: CreateElement): VNode {
        return super.render(h);
    }

    protected renderTable(list: Array<VNode>): VNode {
        const randomPart: string = this.getRandomString();
        return (
            <div class='component-datatable' role='group' aria-labelledby={'component-datatable-' + randomPart}>
                <table class='component-datatable-table'>
                    <caption class='component-datatable-caption' id={'component-datatable-' + randomPart}>
                        {this.current}
                    </caption>
                    <thead class='component-datatable-head'>
                    <tr>
                        <th data-type='checkbox' scope='col' role='columnheader'>
                            <AllSelector listOfIdentifiers={this.items.map((item: any) => {return item.identifier; })}/>
                        </th>
                        {this.getHeaderColumns()}
                    </tr>
                    </thead>
                    <tbody>
                    {list}
                    </tbody>
                </table>
            </div>
        );
    }
}
