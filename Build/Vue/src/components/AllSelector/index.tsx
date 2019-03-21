import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {SELECT_ALL, UNSELECT_ALL} from '@/store/mutations';

@Component
export default class AllSelector extends Vue {

    get isSelected(): boolean {
        return this.selected.length > 0;
    }
    @Mutation(SELECT_ALL)
    selectItems: any;

    @Mutation(UNSELECT_ALL)
    unselectItems: any;

    @State
    selected!: Array<object>;

    @Prop()
    listOfIdentifiers!: Array<String>;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        // fix me, I'm ugly
        return (
            <span onClick={(event: Event) => this.toggleSelect(event, this.listOfIdentifiers)}
            >{this.isSelected ? 'X' : 'O'}</span>
        );
    }

    private toggleSelect(event: Event, listOfIdentifiers: Array<String>): void {
        event.stopPropagation();
        if (this.selected.length > 0) {
            this.unselectItems(listOfIdentifiers);
        } else {
            this.selectItems(listOfIdentifiers);
        }
    }
}
