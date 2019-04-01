import {FileType} from '@/enums/FileType';
import FolderTreeNode from '@/models/FolderTreeNode';
import {FETCH_TREE_DATA} from '@/store/mutations';
import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import TreeNode from '@/components/TreeNode';
import {Action, State} from 'vuex-class';
import {DraggableService, DragConfiguration} from '@/services/DraggableService';

@Component
export default class Tree extends Vue {
    @Action(FETCH_TREE_DATA)
    fetchTreeData: any;

    @State
    tree!: any;

    @State
    storage!: string;

    private draggableService: DraggableService;

    constructor(props: any) {
        super(props);

        const configuration: DragConfiguration = {
            draggableElements: 'li[data-type="' + FileType.FOLDER + '"] .list-tree-group',
            dropInto: 'li[data-type="' + FileType.FOLDER + '"] .list-tree-group',
        };
        this.draggableService = new DraggableService(configuration);
    }

    mounted(): void {
        this.fetchTreeData(this.storage);
        this.draggableService.makeDraggable();
    }

    private render(h: CreateElement): VNode|null {
        if (!this.tree) {
            return null;
        }

        const nodes = [this.tree].map(this.generateNodes, this);
        return(
            <div><ul class='list-tree list-tree-root'><li>{nodes}</li></ul></div>
        );
    }

    private generateNodes(nodeCollection: any): VNode {
        const collection = nodeCollection.map(this.generateNode, this);
        return(
            <ul class='list-tree'>
                {collection}
            </ul>
        );
    }

    private generateNode(node: FolderTreeNode): VNode {
        let treeNodeElement = <TreeNode tree={this} node={node}></TreeNode>;
        let childNodes;
        if (node.expanded && node.hasChildren && node.children.length) {
            childNodes = [node.children].map(this.generateNodes, this);
        }

        return(
            <li data-type={FileType.FOLDER}>
                {treeNodeElement}
                {childNodes}
            </li>
        );
    }
}
