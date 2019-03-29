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

    // lifecycle method
    mounted(): void {
        if (this.$props.node.expanded) {
            this.fetchTreeData(this.$props.node.identifier);
        }
    }

    private render(h: CreateElement): VNode {
        const controlClassName = 'list-tree-control ' + (this.node.expanded ? 'list-tree-control-open' : 'list-tree-control-closed');
        return(
            <span
                class='list-tree-group'
                draggable='true'
                ondragstart={this.dragStart}
                ondragover={this.dragOver}
                ondragenter={this.dragEnter}
                ondragleave={this.dragLeave}
            >
                <a class={controlClassName} href='#' v-show={this.node.hasChildren} onclick={() => this.toggleNode(this.$props.node)}>
                    <i class='fa'></i>
                </a>
                <a href='#' data-identifier={this.node.identifier} onclick={() => this.openNode(this.$props.node.identifier)}>
                    <img src={this.node.icon} width='16' height='16' /> {this.node.name}
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
     * @param {FolderTreeNode} node
     */
    private toggleNode(node: FolderTreeNode): void {
        node.expanded = !node.expanded;

        if (node.expanded) {
            if (node.hasChildren && !node.children.length) {
                this.fetchTreeData(node.identifier);
            }
        } else {
            // Collapse all children
            for (let nodeToCollapse of node.children.filter((child: FolderTreeNode) => child.expanded)) {
                this.toggleNode(nodeToCollapse);
            }
        }
    }

    private dragStart(e: DragEvent): void {
        if (e.dataTransfer && e.target) {
            const eventTargetAsElement = (e.target as HTMLElement);
            eventTargetAsElement.style.border = '1px dashed tomato';
            const identifier = eventTargetAsElement.dataset.identifier;
            if (identifier) {
                console.log('index.tsx@96: ', eventTargetAsElement);

                e.dataTransfer.effectAllowed = 'move';
                // console.log('index.tsx@97: ', eventTargetAsElement.outerHTML);

                e.dataTransfer.setData('text/html', eventTargetAsElement.outerHTML);
            } else {
                e.stopImmediatePropagation();
            }
        }
        console.log('index.tsx@72: ', e);
    }

    private dragOver(e: DragEvent): void {
        e.preventDefault();
        if (e.dataTransfer && e.currentTarget) {
            console.log('index.tsx@121: ', e.dataTransfer);

            e.dataTransfer.dropEffect = 'move';

            // const isWithinPath =
            // console.log('index.tsx@120: ', e);
        }
    }

    private dragEnter(e: DragEvent): void {
        if (e.currentTarget) {
            (e.currentTarget as HTMLElement).style.background = '#7f8082';
        }
    }

    private dragLeave(e: DragEvent): void {
        if (e.currentTarget) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
    }
}
