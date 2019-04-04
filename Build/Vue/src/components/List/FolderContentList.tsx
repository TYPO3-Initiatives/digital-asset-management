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
        return (
            <table class='table table-striped table-hover'>
                <thead>
                <th><AllSelector listOfIdentifiers={this.items.map((item: any) => {return item.identifier; })}/></th>
                {this.getHeaderColumns()}
                </thead>
                <tbody>{list}</tbody>
            </table>
        );
    }
}
