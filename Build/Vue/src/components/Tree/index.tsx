import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {FileType} from '@/enums/FileType';
import FolderTreeNode from '@/interfaces/FolderTreeNode';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import TreeNode from '@/components/TreeNode';
import TreeRootNode from '@/components/TreeRootNode';
import {Action, State} from 'vuex-class';
import {DraggableService, DragConfiguration} from '@/services/DraggableService';

@Component
export default class Tree extends Vue {
    @Action(AjaxRoutes.damGetTreeFolders)
    fetchTreeData: any;

    @Prop()
    storage!: StorageInterface;

    @State
    treeFolders!: Array<FolderTreeNode>;

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
        this.draggableService.makeDraggable();
    }

    private render(h: CreateElement): VNode | null {
        const nodes = [this.treeFolders].map(this.generateNodes, this);
        return(
            <div>
                <ul class='list-tree list-tree-root'>
                    <li class='list-tree-control-open'>
                        <TreeRootNode storage={this.storage}></TreeRootNode>
                        {nodes}
                    </li>
                </ul>
            </div>
        );
    }

    private generateNodes(nodeCollection: Array<FolderTreeNode>): VNode {
        const collection = nodeCollection.map(this.generateNode, this);
        return(
            <ul class='list-tree'>
                {collection}
            </ul>
        );
    }

    private generateNode(node: FolderTreeNode): VNode {
        let treeNodeElement = <TreeNode node={node}></TreeNode>;
        let childNodes;
        if (node.expanded && node.hasChildren && node.folders.length) {
            childNodes = [node.folders].map(this.generateNodes, this);
        }

        return(
            <li data-type={FileType.FOLDER}>
                {treeNodeElement}
                {childNodes}
            </li>
        );
    }
}
