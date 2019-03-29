import {FileType} from '@/enums/FileType';
import FolderTreeNode from '@/models/FolderTreeNode';
import {FETCH_TREE_DATA} from '@/store/mutations';
import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import TreeNode from '@/components/TreeNode';
import {Action, State} from 'vuex-class';

@Component
export default class Tree extends Vue {
    @Action(FETCH_TREE_DATA)
    fetchTreeData: any;

    @State
    tree!: any;

    @State
    storage!: string;

    constructor(props: any) {
        super(props);
    }

    mounted(): void {
        this.fetchTreeData(this.storage);
    }

    private render(h: CreateElement): VNode|null {
        if (!this.tree) {
            return null;
        }

        // const dndOptions = {
        //     dropzoneSelector: 'ul.list-tree',
        //     draggableSelector: 'li[data-type="folder"]',
        //     handlerSelector: null,
        //     multipleDropzonesItemsDraggingEnabled: true,
        //     showDropzoneAreas: true,
        //     onDragstart: (e: VueDraggableEvent): void => {
        //         console.log('index.tsx@44: ', e);
        //     },
        //     onDrop: (e: VueDraggableEvent): void => {
        //         const action = ((e.nativeEvent as EventModifierInit).ctrlKey) ? 'copy' : 'move';
        //         console.log('index.tsx@48: ', e);
        //         console.log('index.tsx@49: ', action);
        //     },
        //     onDragend: (e: VueDraggableEvent): void => {
        //         console.log('index.tsx@52: ', e);
        //     },
        // };

        const nodes = [this.tree].map(this.generateNodes, this);
        return(
            <div><ul class='list-tree list-tree-root'><li>{nodes}</li></ul></div>
        );
    }

    private generateNodes(nodeCollection: any): VNode {
        const collection = nodeCollection.map(this.generateNode, this);
        return(
            <ul class='list-tree' ondrop={this.drop}>
                {collection}
            </ul>
        );
    }

    private generateNode(node: FolderTreeNode): VNode {
        let treeNodeElement = <TreeNode tree={this} node={node}></TreeNode>;
        if (node.expanded && node.hasChildren && node.children.length) {
            treeNodeElement.children = [node.children].map(this.generateNodes, this);
        }
        return(
            <li data-type={FileType.FOLDER}>
                {treeNodeElement}
            </li>
        );
    }

    private drop(e: DragEvent): void {
        e.preventDefault();
        if (e.dataTransfer) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            const data = e.dataTransfer.getData('text/html');
            console.log('index.tsx@86: ', data);
        }
    }
}
