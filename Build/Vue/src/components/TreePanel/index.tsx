import {FETCH_TREE_DATA} from "@/store/mutations";
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import DocHeader from '@/components/DocHeader';
import ButtonBar from '@/components/ButtonBar';
import StorageSelector from '@/components/StorageSelector';
import Tree from '@/components/Tree';
import {Action, State} from 'vuex-class';

@Component
export default class TreePanel extends Vue {
    @Action(FETCH_TREE_DATA)
    fetchTreeData: any;

    @State
    showTree!: boolean;

    @State
    tree!: any;

    constructor(props: any) {
        super(props);
    }

    get shallShowTree(): boolean {
        return this.showTree;
    }

    private render(): VNode|null {
        if (!this.shallShowTree) {
            return null;
        }

        this.fetchTreeData();

        return (
            <div class='typo3-filelist-treepanel'>
                <DocHeader>
                    <template slot='topBarLeft'><ButtonBar/></template>
                    <template slot='bottomBarLeft'><StorageSelector/></template>
                </DocHeader>
                <div class='module-body t3js-module-body'>
                    <Tree data={this.tree}></Tree>
                </div>
            </div>
        );
    }
}
