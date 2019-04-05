import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation} from 'vuex-class';
import {Mutations} from '@/enums/Mutations';

@Component
export default class TreeToggle extends Vue {
    @Mutation(Mutations.TOGGLE_TREE)
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
