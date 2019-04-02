import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, State} from 'vuex-class';
import ItemSelector from '@/components/ItemSelector';
import {FileType} from '@/enums/FileType';
import {AjaxRoutes} from '@/enums/AjaxRoutes';

@Component
export default class ListItem extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.identifier);
    }

    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @State
    selected!: Array<object>;

    @Prop()
    visibleColumns!: Array<string>;

    @Prop()
    identifier!: String;

    @Prop()
    item!: any;

    constructor(props: any) {
        super(props);
    }

    private openFolder(identifier: String): void {
        this.fetchData(identifier);
    }

    private render(): VNode {
        const columns: Array<VNode> = [];
        for (let field in this.visibleColumns) {
            if (this.visibleColumns.hasOwnProperty(field)) {
                let fieldName = this.visibleColumns[field];
                let val: any = this.item[fieldName] || '';
                columns.push(this.renderFieldColumn(fieldName, val));
            }
        }

        return (
            <tr data-uid={this.identifier}>
                <td data-type='checkbox' data-label={'Select ' + this.item.name}>
                    <ItemSelector identifier={this.identifier}/>
                </td>
                {columns}
            </tr>
        );
    }

    private renderFieldColumn(fieldName: string, val: any): VNode {
        if (fieldName === 'name') {
            if (this.item.type === FileType.FOLDER) {
                const clickFunction = (e: Event) => {
                    e.stopPropagation();
                    this.openFolder(this.item.identifier);
                };
                return (
                  <th scope='row' data-type='title' data-value={this.item.name} data-property='name' data-label='Filename'>
                      <a class='component-datatable-link' href='#'
                        title={TYPO3.lang['ListItem.label.open'] + ' ' + this.item.name} onClick={clickFunction}>
                          <span class='component-datatable-link-icon' role='presentation'>
                              <img src={this.item.icon} height='16' />
                          </span>
                          <span class='component-datatable-link-text'>{val}</span>
                      </a>
                  </th>
                );
            } else {
                return (
                  <th scope='row' data-type='title' data-value={this.item.name} data-property='name' data-label='Filename'>
                      <a class='component-datatable-link' href={this.item.editMetaUrl}
                        title={TYPO3.lang['ListItem.label.open'] + ' ' + this.item.name}>
                          <span class='component-datatable-link-icon' role='presentation'>
                              <img src={this.item.icon} height='16'/>
                          </span>
                          <span class='component-datatable-link-text'>{val}</span>
                      </a>
                  </th>
                );
            }
        } else if (fieldName === 'references' && val > 0) {
            const clickFunction = (e: Event) => {
                e.stopPropagation();
                top.TYPO3.InfoWindow.showItem('_FILE', this.identifier);
            };
            return (
              <td data-type='number' data-value={val} data-property={fieldName} data-label={fieldName}>
                  <a href='#' onclick={clickFunction}>{val}</a>
              </td>
            );
        } else if (fieldName === 'permissions') {
            const sortValue = (val.isReadable ? 1 : 0) + (val.isWritable ? 2 : 0);
            return (
              <td data-type='string' data-value={sortValue} data-property={fieldName} data-label={fieldName}>
                  {val.isReadable ? 'R' : ''}{val.isWritable ? 'W' : ''}
              </td>
            );
        } else {
            return (
              <td data-type='string' data-value={val} data-property={fieldName} data-label={fieldName}>
                  {val}
              </td>
            );
        }
    }
}
