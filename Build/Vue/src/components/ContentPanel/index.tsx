import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import ButtonBar from '@/components/ButtonBar';
import DocHeader from '@/components/DocHeader';
import SortingSelector from '@/components/SortingSelector';
import ViewSelector from '@/components/ViewSelector';
import Breadcrumb from '@/components/Breadcrumb';
import SelectIndicator from '@/components/SelectIndicator';
import Tiles from '@/components/Tiles';
import {Action, State} from 'vuex-class';
import {FETCH_DATA} from '@/store/mutations';
import List from '@/components/List';
import {FileType} from '@/enums/FileType';
import StorageSelector from '@/components/StorageSelector';
import TreeToggle from '@/components/TreeToggle';
import {ViewType} from '@/enums/ViewType';

@Component
export default class ContentPanel extends Vue {

    get folders(): Array<any> {
        return this.itemsGrouped.folders;
    }

    get files(): Array<any> {
        return this.itemsGrouped.files;
    }

    get images(): Array<any> {
        return this.itemsGrouped.images;
    }

    get allItems(): Array<any> {
        return this.items;
    }

    get currentViewMode(): String {
        return this.viewMode;
    }

    @Action(FETCH_DATA)
    fetchData: any;

    @State
    items: any;

    @State
    itemsGrouped: any;

    @State
    viewMode!: String;

    @Prop()
    readOnly!: boolean;

    constructor(props: any) {
        super(props);
    }

    private openFolder(identifier: String): void {
        this.fetchData(identifier);
    }

    private open(identifier: String, type: String): void {
        if (type === FileType.FOLDER) {
            this.openFolder(identifier);
        }
        // open files and images?
    }

    private renderFileTiles(): VNode | null {
        return this.files ? <Tiles items={this.files}/> : null;
    }

    private renderFolderTiles(): VNode | null {
        return this.folders ? <Tiles items={this.folders} click={this.open}/> : null;
    }

    private renderImageTiles(): VNode | null {
        return this.images ? <Tiles items={this.images}/> : null;
    }

    private render(): VNode {
        return (
            <div class='typo3-filelist-contentpanel'>
                <DocHeader>
                    <template slot='topBarLeft'><ButtonBar/></template>
                    <template slot='topBarRight'><SortingSelector/><ViewSelector/></template>
                    <template slot='bottomBarLeft'><TreeToggle /><StorageSelector /><Breadcrumb/></template>
                    <template slot='bottomBarRight'><SelectIndicator/></template>
                </DocHeader>
                {this.renderContent()}
            </div>
        );
    }

    private renderContent(): VNode {
        if (this.currentViewMode === ViewType.LIST) {
            return this.renderList();
        } else {
            return this.renderTiles();
        }
    }

    private renderList(): VNode {
        return (
            <div className={
                'module-body t3js-module-body'
                + (this.readOnly ? ' readonly' : '')
                + (this.allItems.length === 0 ? ' empty' : '')
            }>
                <List items={this.allItems} click={this.open} />
            </div>
        );
    }

    private renderTiles(): VNode {
        return (
          <div className={
              'module-body t3js-module-body'
              + (this.readOnly ? ' readonly' : '')
              + (this.allItems.length === 0 ? ' empty' : '')
          }>
            {this.renderFolderTiles()}
            {this.renderFileTiles()}
            {this.renderImageTiles()}
          </div>
        );
    }
}
