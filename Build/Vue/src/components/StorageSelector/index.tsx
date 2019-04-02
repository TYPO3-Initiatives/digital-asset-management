import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {Mutations} from '@/enums/Mutations';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, State} from 'vuex-class';

@Component
export default class StorageSelector extends Vue {
    @Action(AjaxRoutes.damGetStoragesAndMounts)
    getStorages!: Function;

    @Action(Mutations.SET_STORAGE)
    setStorage!: Function;

    @State
    storages!: Array<StorageInterface>;

    @State
    activeStorage!: StorageInterface;

    constructor(props: any) {
        super(props);
    }

    mounted(): void {
        this.getStorages();
    }

    private getBrowsableIdentifier(identifier: number): string {
        return identifier + ':/';
    }

    private render(): VNode | null {
        if (!this.storages.length) {
            return null;
        }

        const options = this.storages.map(this.generateOption, this);
        return (
            <div class='storage-selector' onchange={this.updateStorage}>
                <select class='form-control'>
                    {options}
                </select>
            </div>
        );
    }

    private generateOption(storage: StorageInterface): VNode {
        return(
            <option
                value={storage.identifier}
                selected={storage.identifier === this.activeStorage.identifier}
            >
                {storage.name}
            </option>
        );
    }

    private updateStorage(e: Event): void {
        const selectedStorage = parseInt((e.target as HTMLSelectElement).selectedOptions[0].value, 10);
        this.setStorage({
            id: selectedStorage,
            browsableIdentifier: this.getBrowsableIdentifier(selectedStorage),
        });
    }
}
