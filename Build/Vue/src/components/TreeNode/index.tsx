import {AjaxRoutes} from '@/enums/AjaxRoutes';
import FolderTreeNode from '@/interfaces/FolderTreeNode';
import {VNode} from 'vue';
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import {Action, State} from 'vuex-class';

@Component
export default class TreeNode extends Vue {
    @Action(AjaxRoutes.damGetTreeFolders)
    fetchTreeData: any;

    @State
    treeFolders!: Array<FolderTreeNode>;

    @Prop()
    selectedNodeIdentifier!: string;

    @Prop()
    node!: FolderTreeNode;

    @Prop()
    selectCallBack!: Function;

    constructor(props: any) {
        super(props);
    }

    // lifecycle method
    mounted(): void {
        if (this.node.expanded) {
            this.fetchTreeData(this.node.identifier);
        }
    }

    private select(): void {
        this.selectCallBack(this.node.identifier);
    }

    private render(): VNode {
        const controlClassName = 'list-tree-control list-tree-control-' + (this.node.expanded ? 'open' : 'closed');
        const activeClassName = this.selectedNodeIdentifier === this.node.identifier ? 'active' : '';
        return(
            <span class={'list-tree-group ' + activeClassName} data-identifier={this.node.identifier}>
                <a class={controlClassName} href='#' v-show={this.node.hasChildren} onclick={() => this.toggleNode(this.node)}>
                    <i class='fa' />
                </a>
                <a href='#' data-identifier={this.node.identifier} onclick={() => this.select()}>
                    <img src={this.node.icon} width='16' height='16' /> {this.node.name}
                </a>
            </span>
        );
    }

    /**
     * Called by TreeNode
     *
     * @param {FolderTreeNode} node
     */
    private toggleNode(node: FolderTreeNode): void {
        node.expanded = !node.expanded;

        if (node.expanded) {
            if (node.hasChildren && !node.folders.length) {
                this.fetchTreeData(node.identifier);
            }
        } else {
            // Collapse all children
            for (let nodeToCollapse of node.folders.filter((child: FolderTreeNode) => child.expanded)) {
                this.toggleNode(nodeToCollapse);
            }
        }
    }
}
