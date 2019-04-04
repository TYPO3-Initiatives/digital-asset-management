import {Prop, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import {State} from 'vuex-class';
import ListItem from '@/components/ListItem';

export default abstract class List extends Vue {
    @Prop()
    items: any;

    @State
    current: any;

    visibleColumns: Array<string> = ['name', 'mtimeDisplay', 'sizeDisplay', 'type', 'translations', 'references', 'permissions'];

    protected abstract renderTable(list: Array<VNode>): VNode;

    protected render(h: CreateElement): VNode {
        const list = this.items.map(this.generateListItem, this);
        return this.renderTable(list);
    }

    protected getHeaderColumns(): Array<VNode> {
        const headerColumns: Array<VNode> = [];
        for (let field in this.visibleColumns) {
            if (this.visibleColumns.hasOwnProperty(field)) {
                headerColumns.push(<th>{TYPO3.lang['List.table.header.' + this.visibleColumns[field]]}</th>);
            }
        }

        return headerColumns;
    }

    private generateListItem(item: any): VNode {
        return (
            <ListItem
                identifier={item.identifier}
                item={item}
                visibleColumns={this.visibleColumns}
            />
        );
    }
}
