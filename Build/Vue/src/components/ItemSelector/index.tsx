import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {SELECT_ITEM, UNSELECT_ITEM} from '@/store/mutations';

@Component
export default class ItemSelector extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.$props.identifier);
    }
    @Mutation(SELECT_ITEM)
    selectItem: any;

    @Mutation(UNSELECT_ITEM)
    unselectItem: any;

    @State
    selected!: Array<object>;

    @Prop()
    identifier!: String;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        // fix me, I'm ugly
        return (
            <span onClick={(event: Event) => this.toggleSelect(event, this.$props.identifier)}
            >{this.isSelected ? 'X' : 'O'}</span>
        );
    }

    private toggleSelect(event: Event, identifier: String): void {
        event.stopPropagation();
        if (this.selected.includes(identifier)) {
            this.unselectItem(identifier);
        } else {
            this.selectItem(identifier);
        }
    }
}
