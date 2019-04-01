import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, State} from 'vuex-class';
import ItemSelector from '@/components/ItemSelector';
import {FileType} from '@/enums/FileType';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import Icon from '@/components/Icon';

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
        let classes = 'list-item ';
        if (this.isSelected) {
            classes += ' selected';
        }

        const columns: Array<VNode> = [];
        for (let field in this.visibleColumns) {
            if (this.visibleColumns.hasOwnProperty(field)) {
                let fieldName = this.visibleColumns[field];
                let val: any = this.item[fieldName] || '';
                if (fieldName === 'name') {
                    if (this.item.type === FileType.FOLDER) {
                        const clickFunction = (e: Event) => {
                            e.stopPropagation();
                            this.openFolder(this.item.identifier);
                        };
                        columns.push(
                          <td>
                              <img src={this.item.icon} height='16' />
                              <a href='#' onClick={clickFunction}>{val}</a>
                          </td>);
                    } else {
                        columns.push(
                          <td>
                              <Icon identifier={this.item.iconIdentifier} />
                              <a href={this.item.editMetaUrl}>{val}</a>
                          </td>);
                    }
                } else if (fieldName === 'references' && val > 0) {
                    const clickFunction = (e: Event) => {
                        e.stopPropagation();
                        top.TYPO3.InfoWindow.showItem('_FILE', this.identifier);
                    };
                    columns.push(<td><a href='#' onClick={clickFunction}>{val}</a></td>);
                } else if (fieldName === 'permissions') {
                    columns.push(<td>{val.isReadable ? 'R' : ''}{val.isWritable ? 'W' : ''}</td>);
                } else {
                    columns.push(<td>{val}</td>);
                }
            }
        }

        return (
            <tr class={classes} data-identifier={this.identifier}>
                <th><ItemSelector item={this.item}/></th>
                {columns}
            </tr>
        );
    }
}
