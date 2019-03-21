import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';
import ItemSelector from '@/components/ItemSelector';

@Component
export default class ListItem extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.$props.identifier);
    }

    @State
    selected!: Array<object>;

    @Prop()
    identifier!: String;

    @Prop()
    item!: String;

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
        if (this.$props.click) {
            onClick = () => this.$props.click(this.$props.identifier, this.$props.item.type);
        }
        return (
            <tr class={classes}
                onClick={onClick}
                data-identifier={this.$props.identifier}
            >
                <th><ItemSelector identifier={this.$props.identifier}/></th>
                {
                    Object.values(this.$props.item).map((val: any) => {
                        return <td>{val}</td>;
                    })
                }
            </tr>
        );
    }
}
