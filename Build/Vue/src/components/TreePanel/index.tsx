import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import DocHeader from '@/components/DocHeader';
import Tree from '@/components/Tree';
import StorageSelector from '@/components/StorageSelector';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Action, State} from 'vuex-class';

@Component
export default class TreePanel extends Vue {
  @Action(AjaxRoutes.damGetFolderItems)
  fetchFolderItems: any;

  @Action(AjaxRoutes.damGetTreeFolders)
  fetchTreeData: any;

  @State
  activeStorage!: StorageInterface;

  constructor(props: any) {
    super(props);
  }

  get browsableIdentifier(): string {
    return this.activeStorage.identifier + ':/';
  }

  updated(): void {
    this.fetchTreeData(this.browsableIdentifier);
  }

  private render(): VNode|null {
    return (
      <div class='typo3-filelist-treepanel'>
        <DocHeader>
          <template slot='bottomBarLeft'><StorageSelector/></template>
        </DocHeader>
        <div class=''>
          {this.activeStorage ? <Tree storage={this.activeStorage} selectCallBack={this.fetchFolderItems} /> : ''}
        </div>
      </div>
    );
  }
}
