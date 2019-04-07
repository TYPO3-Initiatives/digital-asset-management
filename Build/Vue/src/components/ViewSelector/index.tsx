import Dropdown from '@/components/Dropdown';
import DropdownMenu from '@/components/DropdownMenu';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {ViewType} from '@/enums/ViewType';
import {Mutations} from '@/enums/Mutations';
import {LinkInterface} from '@/interfaces/LinkInterface';

@Component
export default class ViewSelector extends Vue {

    get currentViewMode(): String {
        return this.viewMode;
    }

    get tileEntry(): LinkInterface {
        return {
            title: TYPO3.lang['ViewSelector.tileview.title'],
            href: '#',
            onclick: (event: Event) => this.changeView(ViewType.TILE),
            iconIdentifier: 'dam-actions-viewmode-tiles',
            active: this.currentViewMode === ViewType.TILE,
        };
    }

    get listEntry(): LinkInterface {
        return {
            title: TYPO3.lang['ViewSelector.listview.title'],
            href: '#',
            onclick: (event: Event) => this.changeView(ViewType.LIST),
            iconIdentifier: 'dam-actions-viewmode-list',
            active: this.currentViewMode === ViewType.LIST,
        };
    }

    @Mutation(Mutations.SWITCH_VIEW)
    switch: any;

    @State
    viewMode!: String;

    constructor(props: any) {
        super(props);
    }

    private changeView(newView: String): void {
        this.switch(newView);
    }

    private render(): VNode {
        let entries = [];
        entries.push(this.tileEntry);
        entries.push(this.listEntry);

        return (
            <span class='component-selector-view'>
                <Dropdown
                    toggleLabel={TYPO3.lang['ViewSelector.toggle.label']}
                    toggleLabelIconIdentifier='actions-system-list-open'
                >
                    <DropdownMenu entries={entries} activeIcon='true' />
                </Dropdown>
            </span>
        );
    }
}
