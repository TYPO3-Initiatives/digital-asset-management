import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import DocHeader from '@/components/DocHeader';
import Tree from '@/components/Tree';
import StorageSelector from '@/components/StorageSelector';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {State} from 'vuex-class';

@Component
export default class TreePanel extends Vue {
    @State
    showTree!: boolean;

    @State
    activeStorage!: StorageInterface;

    constructor(props: any) {
        super(props);
    }

    get shallShowTree(): boolean {
        return this.showTree;
    }

    private render(): VNode|null {
        return (
            <div class='typo3-filelist-treepanel' v-show={this.shallShowTree}>
                <DocHeader>
                    <template slot='bottomBarLeft'><StorageSelector/></template>
                </DocHeader>
                <div class=''>
                    {this.activeStorage ? <Tree storage={this.activeStorage}/> : ''}
                </div>
            </div>
        );
    }
}
