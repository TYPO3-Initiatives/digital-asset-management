import List from '@/components/List';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {CreateElement, VNode} from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {State} from 'vuex-class';

@Component
export default class StorageContentList extends List {
    @Prop()
    items!: Array<StorageInterface>;

    @State
    current: any;

    visibleColumns: Array<string> = ['name', 'storageName', 'storageOnline', 'storageType'];

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
