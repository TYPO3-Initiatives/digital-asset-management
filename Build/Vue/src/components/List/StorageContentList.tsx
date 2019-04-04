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
        return (
            <table class='table table-striped table-hover'>
                <thead>
                {this.getHeaderColumns()}
                </thead>
                <tbody>{list}</tbody>
            </table>
        );
    }
}
