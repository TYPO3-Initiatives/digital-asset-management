import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';
import ItemSelector from '@/components/ItemSelector';

@Component
export default class ListItem extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.identifier);
    }

    @State
    selected!: Array<object>;

    @Prop()
    visibleColumns!: Array<string>;

    @Prop()
    identifier!: String;

    @Prop()
    item!: any;

    @Prop()
    click!: Function;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        // fix me, I'm ugly
        let classes = 'list-item ';
        if (this.isSelected) {
            classes += ' selected';
        }
        // noop
        let onClick = () => null;
        if (this.click) {
            onClick = () => this.click(this.identifier, this.item.type);
        }
        return (
            <tr class={classes}
                data-identifier={this.identifier}
            >
                <th><ItemSelector identifier={this.identifier}/></th>
                {
                    Object.keys(this.item).map((key: any) => {
                        if (this.visibleColumns.indexOf(key) !== -1) {
                            const val = this.item[key];
                            if (key === 'name') {
                                if (this.item.type === 'FOLDER') {
                                    return <td><img src={this.item.icon} height='16' /> <a href='#' onClick={onClick}>{val}</a></td>;
                                } else {
                                    return <td><img src={this.item.icon} height='16' /> <a href={this.item.editUrl}>{val}</a></td>;
                                }
                            }
                            if (key === 'references' && val > 0) {
                                const clickFunction = (e: Event) => {
                                    e.stopPropagation();
                                    top.TYPO3.InfoWindow.showItem('_FILE', this.identifier);
                                };
                                return <td><a href='#' onClick={clickFunction}>{val}</a></td>;
                            }
                            return <td>{val}</td>;
                        }
                        return '';
                    })
                }
            </tr>
        );
    }
}
