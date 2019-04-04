import {Prop, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import ListItem from '@/components/ListItem';
import {SortingFields, SortingOrder} from '@/enums/Sorting';
import {Mutations} from '@/enums/Mutations';

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

    visibleColumns: Array<string> = ['name', 'mtimeDisplay', 'sizeDisplay', 'type', 'translations', 'references', 'permissions'];

    protected abstract renderTable(list: Array<VNode>): VNode;

    protected render(h: CreateElement): VNode {
        const list = this.items.map(this.generateListItem, this);
        return this.renderTable(list);
    }

    protected getRandomString(): string {
        return Math.random().toString(36).substring(7);
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
        const sortIcon: any = (this.sorting.field === field) ? (
            <span class='component-datatable-sorting-icon' role='presentation'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'  v-show={sortingOrder === SortingOrder.ASC}>
                <g class='icon-color'><path d='M4 2h1v12H4z'/>
                  <path d='M6 12l-1.5 2L3 12H2l2.3 3c.1.1.3.1.4 0L7 12H6zM9 5h5V4H8v2h1zM9 8h3V7H8v2h1zM9 11h1v-1H8v2h1z'/>
                </g>
              </svg>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' v-show={sortingOrder === SortingOrder.DESC}>
                <g class='icon-color'><path d='M4 2h1v12H4z'/>
                  <path d='M3 4l1.5-2L6 4h1L4.7 1c-.1-.1-.3-.1-.4 0L2 4h1zM9 5h5V4H8v2h1zM9 8h3V7H8v2h1zM9 11h1v-1H8v2h1z'/>
                </g>
              </svg>
            </span>
        ) : '';
        const sortInfo = TYPO3.lang['List.table.header.sort_info']
          .replace('{field}', TYPO3.lang['List.table.header.' + field])
          .replace('{order}', sortingOrder === SortingOrder.ASC
            ? TYPO3.lang['List.table.header.descending']
            : TYPO3.lang['List.table.header.ascending']);
        const sortText: any = (
            <span class='component-datatable-sorting-label component-visually-hidden'>{sortInfo}</span>
        );
        const iconMarkup: any = (
          <span class='component-datatable-columnheader-icon' role='presentation'>
            {icon}
          </span>
        );
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
                    {sortIcon}
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
