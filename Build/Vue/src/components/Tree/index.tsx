import FolderTreeNode from '@/models/FolderTreeNode';
import {FETCH_TREE_DATA} from '@/store/mutations';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import TreeNode from '@/components/TreeNode';
import {Action} from 'vuex-class';

@Component
export default class Tree extends Vue {
    @Action(FETCH_TREE_DATA)
    fetchTreeData: any;

    @Prop()
    data!: any;

    constructor(props: any) {
        super(props);
    }

    // lifecycle method
    mounted(): void {
        this.fetchTreeData('1:/');
    }

    private render(h: CreateElement): VNode|null {
        if (!this.data) {
            return null;
        }

        const nodes = [this.data].map(this.generateNodes, this);
        return(
            <ul class='list-tree list-tree-root'><li>{nodes}</li></ul>
        );
    }

    private generateNodes(nodeCollection: any): VNode {
        const collection = nodeCollection.map(this.generateNode, this);
        return(<ul class='list-tree'>{collection}</ul>);
    }

    private generateNode(node: FolderTreeNode): VNode {
        let treeNodeElement = <TreeNode tree={this} node={node}></TreeNode>;
        if (node.expanded && node.hasChildren && node.children.length) {
            treeNodeElement.children = [node.children].map(this.generateNodes, this);
        }
        return(<li>{treeNodeElement}</li>);
    }
}
