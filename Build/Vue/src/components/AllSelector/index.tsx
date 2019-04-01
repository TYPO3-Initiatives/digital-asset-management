import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {Mutations} from '@/enums/Mutations';
import {ResourceInterface} from '@/interfaces/ResourceInterface';

@Component
export default class AllSelector extends Vue {

    get isSelected(): boolean {
        return this.selected.length > 0;
    }
    @Mutation(Mutations.SELECT_ALL)
    selectItems: any;

    @Mutation(Mutations.UNSELECT_ALL)
    unselectItems: any;

    @State
    selected!: Array<ResourceInterface>;

    @Prop()
    listOfResources!: Array<ResourceInterface>;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        // fix me, I'm ugly
        return (
            <a href='#' onClick={(event: Event) => this.toggleSelect(event, this.listOfResources)} class='btn btn-sm btn-default'>
                <i class='fa fa-check-square' v-show={this.isSelected} />
                <i class='fa fa-square-o' v-show={!this.isSelected} />
            </a>
        );
    }

    private toggleSelect(event: Event, listOfResources: Array<ResourceInterface>): void {
        event.stopPropagation();
        this.selected.length > 0
            ? this.unselectItems(listOfResources)
            : this.selectItems(listOfResources);
    }
}
