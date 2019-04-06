import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {Mutations} from '@/enums/Mutations';
import {ResourceInterface} from '@/interfaces/ResourceInterface';
import Icon from '@/components/Icon';

@Component
export default class SelectIndicator extends Vue {

    get selectedCount(): number {
        return this.selected.length;
    }

    @State
    selected!: Array<ResourceInterface>;

    @Mutation(Mutations.UNSELECT_ALL)
    unselectItems: any;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode | null {
        return this.selectedCount > 0 ? (
            <button class='component-button component-button-primary' onClick={(event: Event) => this.clearSelection(event)}>
                <span class='component-button-text'>
                    Selected {this.selectedCount}
                </span>
                <span class='component-button-icon'>
                    <Icon identifier='actions-close' />
                </span>
            </button>
        ) : null;
    }

    private clearSelection(event: Event): void {
        event.stopPropagation();
        this.unselectItems();
    }
}
