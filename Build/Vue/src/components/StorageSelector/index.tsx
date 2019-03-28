import {SET_STORAGE} from '@/store/mutations';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action} from 'vuex-class';

@Component
export default class StorageSelector extends Vue {
    @Action(SET_STORAGE)
    setStorage!: Function;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div><select onchange={this.updateStorage}>
                <option value='1:/'>fileadmin/ (auto-created)</option>
                <option value='2:/'>also fileadmin/ (but another ID)</option>
            </select></div>
        );
    }

    private updateStorage(e: Event): void {
        if (e.target instanceof HTMLSelectElement) {
            const selectedStorage = e.target.selectedOptions[0].value;
            this.setStorage(selectedStorage);
        }
    }
}
