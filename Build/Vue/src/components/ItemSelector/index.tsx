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
        const randomPart: string =  Math.random().toString(36).substring(7);
        const label: string = this.isSelected ? TYPO3.lang['ItemSelector.label.deselect'] : TYPO3.lang['ItemSelector.label.select'];
        return (
            <span class='component-checkbox'>
                <input class='component-checkbox-input' type='checkbox' id={'component-datatable-select-identifier-' + randomPart}
                  value='1' checked={this.selected.includes(this.identifier)} />
                <label class='component-checkbox-label' for={'component-datatable-select-identifier-' + randomPart}
                    onClick={(event: Event) => this.toggleSelect(event, this.identifier)}>
                    <span class='component-visually-hidden'>{label} {this.identifier}</span>
                </label>
            </span>
        );
    }

    private toggleSelect(event: Event, identifier: String): void {
        event.stopPropagation();
        this.selected.includes(identifier)
            ? this.unselectItem(identifier)
            : this.selectItem(identifier);
    }
}
