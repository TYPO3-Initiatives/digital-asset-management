import {ActiveStorageInterface} from '@/interfaces/ActiveStorageInterface';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import DocHeader from '@/components/DocHeader';
import Tree from '@/components/Tree';
import StorageSelector from '@/components/StorageSelector';
import {State} from 'vuex-class';

@Component
export default class TreePanel extends Vue {
    @State
    showTree!: boolean;

    @State
    activeStorage!: ActiveStorageInterface;

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

        return (
            <div class='typo3-filelist-treepanel'>
                <DocHeader>
                    <template slot='bottomBarLeft'><StorageSelector/></template>
                </DocHeader>
                <div class=''>
                    <Tree v-show={this.activeStorage}/>
                </div>
            </div>
        );
    }
}
