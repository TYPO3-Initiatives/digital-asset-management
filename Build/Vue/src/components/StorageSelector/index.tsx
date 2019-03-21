import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';

@Component
export default class StorageSelector extends Vue {
    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div><select>
                <option>StorageSelector</option>
            </select></div>
        );
    }
}
