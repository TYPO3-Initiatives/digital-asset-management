import {Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';
import Tile from '@/components/Tile';
import Component from 'vue-class-component';
import ListItem from '@/components/ListItem';
import AllSelector from '@/components/AllSelector';

@Component
export default class List extends Vue {
    @Prop()
    items: any;

    @Prop()
    click!: Function;

    @State
    current: any;

    visibleColumns: Array<string> = ['name', 'mtimeDisplay', 'sizeDisplay', 'type', 'translations', 'references', 'permissions'];

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        const list = this.items.map(this.generateListItem, this);
        const headerColumns: Array<VNode> = [];
        for (let field in this.visibleColumns) {
            if (this.visibleColumns.hasOwnProperty(field)) {
                headerColumns.push(<th>{TYPO3.lang['List.table.header.' + this.visibleColumns[field]]}</th>);
            }
        }

        return (
            <table class='table table-striped table-hover'>
                <thead>
                    <th><AllSelector listOfIdentifiers={this.items.map((item: any) => {return item.identifier; })}/></th>
                    {headerColumns}
                </thead>
                <tbody>{list}</tbody>
            </table>
        );
    }

    private generateListItem(item: any): VNode {
        return (
            <ListItem
                identifier={item.identifier}
                item={item}
                click={this.click}
                visibleColumns={this.visibleColumns}
            />
        );
    }
}
