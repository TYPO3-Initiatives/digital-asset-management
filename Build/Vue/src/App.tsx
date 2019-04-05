import NoStoragesOverlay from '@/components/NoStoragesOverlay';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import TreePanel from '@/components/TreePanel';
import ContentPanel from '@/components/ContentPanel';
import {Action, Mutation, State} from 'vuex-class';
import Modal from 'TYPO3/CMS/Backend/Modal';

@Component
export default class App extends Vue {
    @Action(AjaxRoutes.damGetStoragesAndMounts)
    getStorages!: Function;

    @State
    storages!: Array<StorageInterface>;

    @State
    activeStorage!: StorageInterface;

    @State
    showTree!: boolean;

    private modal!: any;

    mounted(): void {
        this.getStorages();
    }

    private render(): VNode | null {
        if (this.storages === null) {
            return null;
        }

        if (!this.storages.length) {
            return (
                <div id='app' class='module'>
                    <NoStoragesOverlay />
                    <ContentPanel />
                </div>
            );
        }

        if (this.modal) {
            this.modal = null;
            Modal.dismiss();
        }

        return (
            <div id='app' class='module'>
                <TreePanel v-show={this.showTree && this.activeStorage}/>
                <ContentPanel />
            </div>
        );
    }
}
