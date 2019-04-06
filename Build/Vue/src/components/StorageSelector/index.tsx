import Icon from '@/components/Icon';
import {Mutations} from '@/enums/Mutations';
import {StorageInterface} from '@/interfaces/StorageInterface';
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

    private static toggleDropdown(e: Event): void {
        const me = (e.target as HTMLElement);
        const dropdown = me.closest('.component-dropdown');
        if (dropdown === null) {
            return;
        }

        let isActive = dropdown.classList.contains('component-dropdown-active');
        dropdown.classList.toggle('component-dropdown-active', !isActive);
        dropdown.classList.toggle('component-dropdown-inactive', isActive);

        const dropdownToggle = dropdown.querySelector('.component-dropdown-toggle');
        if (dropdownToggle !== null) {
            dropdownToggle.setAttribute('aria-expanded', (!isActive).toString());
        }
    }

    private render(): VNode | null {
        if (!this.activeStorage) {
            return null;
        }

        if (!this.storages.length) {
            return null;
        }

        const options = this.storages.map(this.generateOption, this);
        return (
            <span class='component-dropdown component-dropdown-inactive'>
                <button
                    type='button'
                    title={TYPO3.lang['StorageSelector.title']}
                    aria-label={TYPO3.lang['StorageSelector.label']}
                    class='component-dropdown-toggle'
                    aria-haspopup='true'
                    aria-expanded='false'
                    onclick={StorageSelector.toggleDropdown}
                >
                    <span class='component-dropdown-toggle-icon' role='presentation'>
                        <Icon identifier={this.activeStorage.icon} />
                    </span>
                    <span class='component-dropdown-toggle-text'>
                        {this.activeStorage.name}
                    </span>
                    <span class='component-dropdown-toggle-icon' role='presentation'>
                        <Icon identifier='apps-pagetree-expand' />
                    </span>
                </button>
                <div class='component-dropdown-container'>
                    <ul class='component-dropdown-menu' role='menu'>
                        {options}
                    </ul>
                </div>
            </span>
        );
    }

    private generateOption(storage: StorageInterface): VNode {
        return(
            <li class='component-dropdown-menu-item'>
                <a
                    class='component-dropdown-menu-link'
                    title={storage.storageName}
                    href='#'
                    data-identifier={storage.identifier}
                    onclick={this.updateStorage}
                >
                    <span class='component-dropdown-menu-link-icon' role='presentation'>
                        <Icon identifier={storage.icon} />
                    </span>
                    <span class='component-dropdown-menu-link-text'>{storage.storageName}</span>
                </a>
            </li>
        );
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
