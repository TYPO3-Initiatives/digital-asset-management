import {Mutations} from '@/enums/Mutations';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action} from 'vuex-class';

@Component
export default class StorageSelector extends Vue {
    @Action(Mutations.SET_STORAGE)
    setStorage!: Function;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div class='storage-selector' onchange={this.updateStorage}>
                <select class='form-control'>
                    <option value='1:/'>fileadmin/ (auto-created)</option>
                    <option value='2:/'>also fileadmin/ (but another ID)</option>
                </select>
            </div>
        );
    }

    private updateStorage(e: Event): void {
        const selectedStorage = (e.target as HTMLSelectElement).selectedOptions[0].value;
        this.setStorage(selectedStorage);
    }
}
