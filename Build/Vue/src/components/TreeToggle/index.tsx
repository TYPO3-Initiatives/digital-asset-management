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
            <div class='btn-group' role='group'>
                <button onClick={this.toggleTree} class='btn btn-default'><i class='fa fa-fw fa-tree' /></button>
            </div>
        );
    }
}
