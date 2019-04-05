import AbstractContent from '@/components/ContentPanel/AbstractContent';
import StorageContentList from '@/components/List/StorageContentList';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import Tiles from '@/components/Tiles';
import {State} from 'vuex-class';

@Component
export default class StorageContent extends AbstractContent {
    @State
    storages!: Array<StorageInterface>;

    constructor(props: any) {
        super(props);
    }

    protected render(h: CreateElement): VNode {
        return super.render(h);
    }

    protected renderList(): VNode {
        return (
            <StorageContentList items={this.storages} />
        );
    }

    protected renderTiles(): VNode {
        return (
            <div>
                {this.renderStorageTiles()}
            </div>
        );
    }

    private renderStorageTiles(): VNode | null {
        return this.storages ? <Tiles items={this.storages} /> : null;
    }
}
