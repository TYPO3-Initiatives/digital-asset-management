import {Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import {State} from 'vuex-class';
import {ViewType} from '@/enums/ViewType';

export default abstract class FolderContent extends Vue {
    @State
    viewMode!: String;

    get currentViewMode(): String {
        return this.viewMode;
    }

    protected abstract renderList(): VNode;
    protected abstract renderTiles(): VNode;

    protected render(h: CreateElement): VNode {
        return (
            this.renderContent()
        );
    }

    protected renderContent(): VNode {
        if (this.currentViewMode === ViewType.LIST) {
            return this.renderList();
        } else {
            return this.renderTiles();
        }
    }
}
