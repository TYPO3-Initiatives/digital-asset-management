import {Prop, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import ListItem from '@/components/ListItem';
import {SortingFields, SortingOrder} from '@/enums/Sorting';
import {Mutations} from '@/enums/Mutations';
import RandomService from '@/services/RandomService';

export default abstract class List extends Vue {
    @Mutation(Mutations.CHANGE_SORTING)
    changeSorting: any;

    @Mutation(Mutations.CHANGE_SORTORDER)
    changeSortOrder: any;

    @Prop()
    items: any;

    @State
    current: any;

    @State
    sorting: any;

    visibleColumns: Array<string> = [
        'name',
        'mtimeDisplay',
        'sizeDisplay',
        'type',
        'translations',
        'references',
        'permissions',
    ];

    protected abstract renderTable(list: Array<VNode>): VNode;

    protected render(h: CreateElement): VNode {
        const list = this.items.map(this.generateListItem, this);
        return this.renderTable(list);
    }

    protected getRandomString(): string {
        return RandomService.getRandomString();
    }

    protected getHeaderColumns(): Array<VNode> {
        const headerColumns: Array<VNode> = [];

        for (let field in this.visibleColumns) {
            if (this.visibleColumns.hasOwnProperty(field)) {
                headerColumns.push(this.renderHeaderColumn(this.visibleColumns[field]));
            }
        }

        return headerColumns;
    }

    private renderHeaderColumn(field: string, icon?: string): VNode {
        const sortingOrder = this.sorting.order;
        const sortInfo = TYPO3.lang['List.table.header.sort_info']
          .replace('{field}', TYPO3.lang['List.table.header.' + field])
          .replace('{order}', sortingOrder === SortingOrder.ASC
            ? TYPO3.lang['List.table.header.descending']
            : TYPO3.lang['List.table.header.ascending']);
        const sortText: any = (
            <span class='component-datatable-sorting-label component-visually-hidden'>{sortInfo}</span>
        );
        const iconMarkup: any = (icon) ? (
          <span class='component-datatable-columnheader-icon' role='presentation'>
            {icon}
          </span>
        ) : '';
        const sortField = field.replace('Display', '');
        const ariaSortLabel = this.sorting.field === sortField
          ? (
            sortingOrder === SortingOrder.ASC
              ? TYPO3.lang['List.table.header.ascending']
              : TYPO3.lang['List.table.header.descending']
          )
          : TYPO3.lang['List.table.header.none'];
        let isSortingField = Object.values(SortingFields).includes(sortField);
        return (
            <th data-type='title' scope='col' role='columnheader'
                aria-sort={ariaSortLabel}>
                <span class='component-datatable-columnheader'>
                    {iconMarkup}
                    <span class='component-datatable-columnheader-text'>
                        {TYPO3.lang['List.table.header.' + field]}
                    </span>
                </span>
                <button class='component-datatable-sorting' v-show={isSortingField} onClick={() => {
                  if (this.sorting.field !== field) {
                    this.changeSorting(sortField);
                  }
                  this.changeSortOrder(sortingOrder === SortingOrder.ASC ? SortingOrder.DESC : SortingOrder.ASC);
                }}>
                    <span class='component-datatable-sorting-icon' role='presentation'></span>
                    {sortText}
                </button>
            </th>
        );
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
