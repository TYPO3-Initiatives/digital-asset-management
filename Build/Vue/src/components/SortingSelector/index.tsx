import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation} from 'vuex-class';
import {SortingFields, SortingOrder} from '@/enums/Sorting';
import {Mutations} from '@/enums/Mutations';
import {LinkInterface} from '@/interfaces/LinkInterface';
import Dropdown from '@/components/Dropdown';
import DropdownMenu from '@/components/DropdownMenu';

@Component
export default class SortingSelector extends Vue {
    @Mutation(Mutations.CHANGE_SORTING)
    changeSorting: any;

    @Mutation(Mutations.CHANGE_SORTORDER)
    changeSortOrder: any;

    constructor(props: any) {
        super(props);
    }

    get fieldEntries(): Array<LinkInterface> {
        let entries: Array<LinkInterface> = [];
        Object.values(SortingFields).map(
            (field: string) => {
                let link: LinkInterface = {
                    title: field,
                    href: '#',
                    onclick: (e: Event) => this.changeSorting(field),
                };
                entries.push(link);
            },
        );
        return entries;
    }

    get orderEntries(): Array<LinkInterface> {
        let entries: Array<LinkInterface> = [];
        Object.values(SortingOrder).map(
            (field: string) => {
                let link: LinkInterface = {
                    title: TYPO3.lang['SortingSelector.order.' + field + '.label'],
                    href: '#',
                    onclick: (e: Event) => this.changeSortOrder(field),
                };
                entries.push(link);
            },
        );
        return entries;
    }

    private render(): VNode {
        return (
            <span class='component-selector-sorting'>
                <Dropdown
                    toggleLabel={TYPO3.lang['SortingSelector.toggle.label']}
                    toggleLabelIconIdentifier='dam-actions-sort-amount'
                >
                    <DropdownMenu entries={this.fieldEntries} activeIcon='true' />
                    <DropdownMenu entries={this.orderEntries} activeIcon='true' secondary='true' />
                </Dropdown>
            </span>
        );
    }
}
