import FolderTreeNode from '@/models/FolderTreeNode';
import {FETCH_DATA, FETCH_TREE_DATA} from '@/store/mutations';
import {CreateElement, VNode} from 'vue';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {Action} from 'vuex-class';

@Component
export default class TreeNode extends Vue {
    @Action(FETCH_DATA)
    fetchData: any;

    @Action(FETCH_TREE_DATA)
    fetchTreeData: any;

    @Prop()
    tree!: any;

    @Prop()
    node!: FolderTreeNode;

    constructor(props: any) {
        super(props);
    }

    private render(h: CreateElement): VNode {
        if (this.$props.node.expanded) {
            this.fetchTreeData(this.$props.node.identifier);
        }
        return(
            <span>
                <a href='#' v-show={this.node.hasChildren} onclick={(event: Event) => this.tree.toggleNode(event, this.$props.node)}>
                    [{ this.node.expanded ? '-' : '+' }]
                </a>
                <a href='#' data-identifier={this.node.identifier} onclick={(event: Event) => this.openNode(this.$props.node.identifier)}>
                    <img src={this.node.icon} width='16' height='16' /> {this.node.text}
                </a>
            </span>
        );
    }

    /**
     * @param {string} identifier
     */
    private openNode(identifier: string): void {
        this.fetchData(identifier);
    }

    /**
     * Called by TreeNode
     *
     * @param {Event} e
     * @param {FolderTreeNode} node
     */
    private toggleNode(e: Event, node: FolderTreeNode): void {
        if (!node.expanded && node.hasChildren && !node.children.length) {
            this.fetchTreeData(node.identifier);
        }

        node.expanded = !node.expanded;
    }
}
