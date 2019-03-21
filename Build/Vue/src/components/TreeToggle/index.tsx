import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation} from 'vuex-class';
import {TOGGLE_TREE} from '@/store/mutations';

@Component
export default class TreeToggle extends Vue {
    @Mutation(TOGGLE_TREE)
    toggleTree!: Function;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div>
                <button onClick={this.toggleTree}>Show / Hide Tree</button>
            </div>
        );
    }
}
