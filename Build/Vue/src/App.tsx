import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import TreePanel from '@/components/TreePanel';
import ContentPanel from '@/components/ContentPanel';
import {Action, State} from 'vuex-class';

@Component
export default class App extends Vue {
    @Action(AjaxRoutes.damGetStoragesAndMounts)
    getStorages!: Function;

    @State
    activeStorage!: StorageInterface;

    mounted(): void {
        this.getStorages();
    }

    private render(h: CreateElement): VNode | null {
        if (!this.activeStorage) {
            return null;
        }

        return (
            <div id='app' class='module'>
                <TreePanel/>
                <ContentPanel/>
            </div>
        );
    }
}
