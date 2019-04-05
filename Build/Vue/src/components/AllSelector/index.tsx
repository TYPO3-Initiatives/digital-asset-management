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
        const randomPart: string =  Math.random().toString(36).substring(7);
        return (
            <span class='component-checkbox'>
                <input class='component-checkbox-input' type='checkbox' id={'component-datatable-selectall-' + randomPart}
                  value='1' onClick={(event: Event) => this.toggleSelect(event, this.listOfResources)} />
                <label class='component-checkbox-label' for={'component-datatable-selectall-' + randomPart}>
                    <span class='component-visually-hidden'>
                        {this.isSelected ? TYPO3.lang['AllSelector.label.deselect'] : TYPO3.lang['AllSelector.label.select']}
                    </span>
                </label>
            </span>
        );
    }

    private toggleSelect(event: Event, listOfResources: Array<ResourceInterface>): void {
        event.stopPropagation();
        this.selected.length > 0
            ? this.unselectItems(listOfResources)
            : this.selectItems(listOfResources);
    }
}
