import Dropdown from '@/components/Dropdown';
import DropdownMenu from '@/components/DropdownMenu';
import {Mutations} from '@/enums/Mutations';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {LinkInterface} from '@/interfaces/LinkInterface';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, State} from 'vuex-class';

@Component
export default class StorageSelector extends Vue {
    @Action(Mutations.SET_STORAGE)
    setStorage!: Function;

    @State
    storages!: Array<StorageInterface>;

    @State
    activeStorage!: StorageInterface;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode | null {
        if (!this.activeStorage) {
            return null;
        }

        if (!this.storages.length) {
            return null;
        }

        const entries = this.storages.map(this.generateEntry, this);
        return (
            <span class='component-storageselector'>
                <Dropdown
                    toggleLabel={this.activeStorage.name}
                    toggleLabelIconIdentifier={this.activeStorage.icon}
                    toggleTitle={TYPO3.lang['StorageSelector.title']}
                    toggleAriaLabel={TYPO3.lang['StorageSelector.label']}
                >
                    <DropdownMenu entries={entries} />
                </Dropdown>
            </span>
        );
    }

    private generateEntry(storage: StorageInterface): LinkInterface {
        return {
            title: storage.storageName,
            href: '#',
            dataIdentifier: storage.identifier.toString(),
            iconIdentifier: storage.icon,
            onclick: this.updateStorage,
        };
    }

    private updateStorage(e: Event): void {
        const me = (e.target as HTMLElement);
        const link = me.closest('a');
        if (link === null || typeof link.dataset.identifier === 'undefined') {
            return;
        }

        const storageId = parseInt(link.dataset.identifier, 10);
        if (storageId !== this.activeStorage.identifier) {
            this.setStorage(storageId);
        }
    }
}
