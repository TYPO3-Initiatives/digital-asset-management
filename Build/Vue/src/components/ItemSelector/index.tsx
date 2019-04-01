import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {Mutations} from '@/enums/Mutations';

@Component
export default class ItemSelector extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.identifier);
    }
    @Mutation(Mutations.SELECT_ITEM)
    selectItem: any;

    @Mutation(Mutations.UNSELECT_ITEM)
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
          <a href='#' onClick={(event: Event) => this.toggleSelect(event, this.identifier)} className='btn btn-sm btn-default'>
              <i class='fa fa-check-square' v-show={this.isSelected} />
              <i class='fa fa-square-o' v-show={!this.isSelected} />
          </a>
        );
    }

    private toggleSelect(event: Event, identifier: String): void {
        event.stopPropagation();
        this.selected.includes(identifier)
            ? this.unselectItem(identifier)
            : this.selectItem(identifier);
    }
}
