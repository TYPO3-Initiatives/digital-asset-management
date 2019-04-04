import FolderContentList from '@/components/List/FolderContentList';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import Tiles from '@/components/Tiles';
import {Action, State} from 'vuex-class';
import {ViewType} from '@/enums/ViewType';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {FolderInterface} from '@/interfaces/FolderInterface';
import {FileInterface} from '@/interfaces/FileInterface';
import {ImageInterface} from '@/interfaces/ImageInterface';
import {ResourceInterface} from '@/interfaces/ResourceInterface';

@Component
export default class FolderContent extends Vue {

    get folders(): Array<FolderInterface> {
        return this.itemsGrouped.folders;
    }

    get files(): Array<FileInterface> {
        return this.itemsGrouped.files;
    }

    get images(): Array<ImageInterface> {
        return this.itemsGrouped.images;
    }

    get allItems(): Array<ResourceInterface> {
        return this.items;
    }

    get currentViewMode(): String {
        return this.viewMode;
    }

    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @State
    activeStorage!: StorageInterface;

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

    get browsableIdentifier(): string {
        return this.activeStorage.identifier + ':/';
    }

    mounted(): void {
        if (this.activeStorage) {
            this.fetchData(this.browsableIdentifier);
        }
    }

    private renderFileTiles(): VNode | null {
        return this.files ? <Tiles items={this.files} /> : null;
    }

    private renderFolderTiles(): VNode | null {
        return this.folders ? <Tiles items={this.folders} /> : null;
    }

    private renderImageTiles(): VNode | null {
        return this.images ? <Tiles items={this.images} /> : null;
    }

    private render(): VNode {
        return (
            this.renderContent()
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
            <div class={
                (this.readOnly ? ' readonly' : '')
                + (this.allItems.length === 0 ? ' empty' : '')
            }>
                <FolderContentList items={this.allItems} />
            </div>
        );
    }

    private renderTiles(): VNode {
        return (
            <div className={
                (this.readOnly ? ' readonly' : '')
                + (this.allItems.length === 0 ? ' empty' : '')
            }>
                {this.renderFolderTiles()}
                {this.renderFileTiles()}
                {this.renderImageTiles()}
            </div>
        );
    }
}