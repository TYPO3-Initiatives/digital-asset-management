import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import {State} from 'vuex-class';

@Component
export default class SelectIndicator extends Vue {

    get selectedCount(): number {
        return this.selected.length;
    }

    @State
    selected!: Array<object>;

    constructor(props: any) {
        super(props);
    }


    private render(h: CreateElement): VNode {
        return (
            <div>Selected {this.selectedCount}</div>
        );
    }
}
