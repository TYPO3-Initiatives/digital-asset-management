import Icon from '@/components/Icon';
import {Mutations} from '@/enums/Mutations';
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

    @Action(Mutations.SET_STORAGE)
    setStorage!: Function;

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

    private openStorage(identifier: number): void {
        this.setStorage(identifier);
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
                    if (this.item.type === FileType.STORAGE) {
                        const clickFunction = (e: Event) => {
                            e.stopPropagation();
                            this.openStorage(this.item.identifier);
                        };
                        columns.push(
                            <td>
                                <Icon identifier={this.item.icon} />
                                <a href='#' onClick={clickFunction}>{val}</a>
                            </td>);
                    } else if (this.item.type === FileType.FOLDER) {
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
                              <img src={this.item.icon} height='16' />
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
                } else if (typeof val === 'boolean') {
                    columns.push(<td>{TYPO3.lang['List.table.header.state.' + (val.toString())]}</td>);
                } else {
                    columns.push(<td>{val}</td>);
                }
            }
        }

        return (
            <tr class={classes} data-identifier={this.identifier}>
                {this.item.type !== FileType.STORAGE ? <th><ItemSelector identifier={this.identifier}/></th> : ''}
                {columns}
            </tr>
        );
    }
}
