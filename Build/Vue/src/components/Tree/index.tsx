import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
// query: tree
// render TYPO3 SVG Tree component

@Component
export default class Tree extends Vue {
    constructor(props: any) {
        super(props);
    }

    private render(h: CreateElement): VNode {
        return (
            <div id='typo3-pagetree' class='svg-tree'>
                <div>
                    <div id='typo3-pagetree-treeContainer'>
                        <div id='typo3-pagetree-tree' class='svg-tree-wrapper' style='height:1000px;'>
                            <div class='node-loader'></div>
                        </div>
                    </div>
                </div>
                <div class='svg-tree-loader'></div>
            </div>
        );
    }
}
