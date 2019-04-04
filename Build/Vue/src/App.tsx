import {NoStoragesModal} from '@/components/NoStoragesModal';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {Mutations} from '@/enums/Mutations';
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

    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @Mutation(Mutations.SET_MODAL_CONTENT)
    setModalContent!: Function;

    @State
    storages!: Array<StorageInterface>;

    @State
    activeStorage!: StorageInterface;

    private modal!: any;

    mounted(): void {
        this.getStorages();
    }

    private render(): VNode | null {
        if (this.storages === null) {
            return null;
        }

        if (!this.storages.length) {
            this.setModalContent(<NoStoragesModal />);

            this.$nextTick(() => {
                const content = (document.querySelector('#vue-modalContent') as HTMLDivElement);
                this.modal = Modal.advanced({
                    title: '',
                    size: Modal.sizes.small,
                    content: content,
                }).on('hidden.bs.modal', (): void => {
                    ((document.querySelector('#app') as HTMLDivElement).parentNode as HTMLElement).appendChild(content);
                });
            });

            return (
                <div id='app' class='module'>
                </div>
            );
        }

        if (this.modal) {
            this.modal = null;
            Modal.dismiss();
        }

        return (
            <div id='app' class='module'>
                <TreePanel />
                <ContentPanel />
            </div>
        );
    }
}
