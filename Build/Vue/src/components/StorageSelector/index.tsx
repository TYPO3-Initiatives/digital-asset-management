import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';

@Component
export default class StorageSelector extends Vue {
    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div class='storage-selector'>
                <select class='form-control'>
                    <option>StorageSelector</option>
                </select>
            </div>
        );
    }
}
