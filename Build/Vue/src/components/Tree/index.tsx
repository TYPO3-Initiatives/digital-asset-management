import {FETCH_TREE_DATA} from '@/store/mutations';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import {Tree as VueTree, TreeData, TreeNodeState} from 'tree-vue-component';
import {Action, State} from 'vuex-class';
// query: tree
// render TYPO3 SVG Tree component

@Component
export default class Tree extends Vue {
    @Prop()
    tree!: TreeData;

    constructor(props: any) {
        super(props);
    }

    private render(h: CreateElement): VNode {
        return (
            <VueTree data={this.tree}>
            </VueTree>
        );
    }
}
