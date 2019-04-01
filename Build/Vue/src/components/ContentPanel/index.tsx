import {AjaxRoutes} from '@/enums/AjaxRoutes';
import FolderContent from './FolderContent';
import StorageContent from './StorageContent';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import DocHeader from '@/components/DocHeader';
import SortingSelector from '@/components/SortingSelector';
import ViewSelector from '@/components/ViewSelector';
import Breadcrumb from '@/components/Breadcrumb';
import SelectIndicator from '@/components/SelectIndicator';
import StorageSelector from '@/components/StorageSelector';
import {Action, State} from 'vuex-class';
import TreeToggle from '@/components/TreeToggle';
import DropZone from '@/components/DropZone';
import ButtonBar from '@/components/ButtonBar';

@Component
export default class ContentPanel extends Vue {
    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @State
    activeStorage!: StorageInterface;

    constructor(props: any) {
        super(props);
    }

    updated(): void {
        if (this.activeStorage) {
            this.fetchData(this.activeStorage.identifier + ':/');
        }
    }

    private render(): VNode {
        return (
          <div class='typo3-filelist-contentpanel'>
              <DropZone>
                  <template slot='beforeUploadTable'>
                      <DocHeader>
                          <template slot='topBarLeft'><TreeToggle v-show={this.activeStorage}/><ViewSelector/></template>
                          <template slot='topBarRight'><ButtonBar /><SortingSelector/></template>
                          <template slot='bottomBarLeft'><StorageSelector /><Breadcrumb v-show={this.activeStorage}/></template>
                          <template slot='bottomBarRight'><SelectIndicator v-show={this.activeStorage}/></template>
                      </DocHeader>
                  </template>
                  <template slot='afterUploadTable'>
                      {this.activeStorage ? <FolderContent /> : <StorageContent />}
                  </template>
              </DropZone>
          </div>
        );
    }
}
