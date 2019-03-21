import {Component, Prop, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import {State} from 'vuex-class';
import ItemSelector from '@/components/ItemSelector';

@Component
export default class Tile extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.$props.identifier);
    }

    @State
    selected!: Array<object>;

    @Prop()
    identifier!: String;

    @Prop()
    header!: String;

    @Prop()
    subheader!: String;

    @Prop()
    meta!: String;

    @Prop()
    type!: String;

    @Prop()
    image!: String;

    @Prop()
    click!: Function;
    constructor(props: any) {
        super(props);
    }

    private render(h: CreateElement): VNode {
        // fix me, I'm ugly
        let classes = 'panel panel-default tile ' + this.$props.type;
        if (this.isSelected) {
            classes += ' selected';
        }
        // noop
        let onClick = () => null;
        if (this.$props.click) {
            onClick = () => this.$props.click(this.$props.identifier, this.$props.type);
        }
        return (
            <div class={classes}
                 onClick={onClick}
                 data-identifier={this.$props.identifier}
            >
                <ItemSelector identifier={this.$props.identifier}/>
                <div class='panel-heading'>
                    {this.$props.header}
                </div>
                <div class='panel-body'>
                    {this.$props.subheader}<br/>
                    {this.$props.meta}<br/>
                    <img src={this.$props.image}/>
                </div>
            </div>
        );
    }
}
