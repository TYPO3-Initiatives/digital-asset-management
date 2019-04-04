import StorageContentList from '@/components/List/StorageContentList';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import Tiles from '@/components/Tiles';
import {State} from 'vuex-class';
import {ViewType} from '@/enums/ViewType';

@Component
export default class StorageContent extends Vue {
    @State
    storages!: Array<StorageInterface>;

    @State
    viewMode!: String;

    get currentViewMode(): String {
        return this.viewMode;
    }

    constructor(props: any) {
        super(props);
    }

    private renderStorageTiles(): VNode | null {
        return this.storages ? <Tiles items={this.storages} /> : null;
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
            <div>
                <StorageContentList items={this.storages} />
            </div>
        );
    }

    private renderTiles(): VNode {
        return (
            <div>
                {this.renderStorageTiles()}
            </div>
        );
    }
}
