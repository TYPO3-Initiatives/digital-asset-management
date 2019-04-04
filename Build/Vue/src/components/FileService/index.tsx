import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, Mutation, State} from 'vuex-class';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {Mutations} from '@/enums/Mutations';
import CopyMoveModal from '@/components/CopyMoveModal';
import {ResourceInterface} from '@/interfaces/ResourceInterface';
import Modal from 'TYPO3/CMS/Backend/Modal';
import {CopyMoveRequestInterface} from '@/interfaces/request/CopyMoveRequestInterface';
import client from '@/services/http/Typo3Client';
import {DeleteRequestInterface} from '@/interfaces/request/DeleteRequestInterface';
import {DownloadRequestInterface} from '@/interfaces/request/DownloadRequestInterface';
import {FileServiceEvent} from '@/enums/FileServiceEvent';

@Component
export default class FileService extends Vue {
    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @Mutation(Mutations.SET_MODAL_CONTENT)
    setModalContent!: Function;

    @Mutation(Mutations.NAVIGATE)
    navigate!: Function;

    @State
    selected!: Array<ResourceInterface>;

    @State
    current!: string;

    private modal: any;

    constructor(props: any) {
        super(props);
        document.addEventListener('fileServiceEvent', ((event: CustomEvent) => {
            this.selected = event.detail.resources;
            switch (event.detail.event) {
                case FileServiceEvent.COPY_TO:
                    this.selectTarget(this.copyResources);
                    break;
                case FileServiceEvent.MOVE_TO:
                    this.selectTarget(this.moveResources);
                    break;
                case FileServiceEvent.DELETE:
                    this.confirm(this.deleteResources);
                    break;
                case FileServiceEvent.DOWNLOAD:
                    this.downloadResources();
                    break;
                default:
                    throw new Error('unknown event type: ' + event.detail.event);
            }
        }) as EventListener);
    }

    private selectTarget(action: Function): void {
        this.setModalContent(<CopyMoveModal/>);
        let content: any = jQuery('#vue-modalContent');
        this.modal = Modal.advanced({
            content: content,
            additionalCssClasses: ['modal-select-target'],
            buttons: [
                {
                    btnClass: 'btn-default',
                    dataAttributes: {
                        method: 'dismiss',
                    },
                    icon: 'actions-close',
                    text: 'Cancel',
                },
                {
                    btnClass: 'btn-primary',
                    dataAttributes: {
                        method: 'select',
                    },
                    text: 'Select target',
                },
            ],
            callback: (currentModal: any): void => {
                currentModal.on('button.clicked', (e: any): void => {
                    const method = $(e.target).data('method');
                    if (method === 'dismiss') {
                        currentModal.trigger('modal-dismiss');
                    }
                    if (method === 'select') {
                        const target: string = $(e.currentTarget).find('.list-tree .list-tree-group.active').data('identifier');
                        let result = action({
                            'resources': this.selected,
                            'target': target,
                        });
                        if (result) {
                            this.modal.trigger('modal-dismiss');
                            this.fetchData(this.current);
                            this.navigate(this.current);
                        }
                    }
                });
            },
            title: 'Select target folder',
        });
    }

    private async copyResources(request: CopyMoveRequestInterface): Promise<any> {
        const identifiers: Array<string> = [];
        Object.values(request.resources).map((item: ResourceInterface) => {
            identifiers.push(item.identifier);
        });

        const response = await client.get(
            TYPO3.settings.ajaxUrls[AjaxRoutes.damCopyResources]
            + '&conflictMode=rename'
            + '&identifiers[]=' + identifiers.join('&identifiers[]=')
            + '&targetFolderIdentifier=' + request.target,
        );

        if (response.status === 200) {
            this.fetchData(request.target);
            this.navigate(request.target);
        } else {
            console.log('Error while move, missing error handling');
        }
    }

    private async moveResources(request: CopyMoveRequestInterface): Promise<any> {
        const identifiers: Array<string> = [];
        Object.values(request.resources).map((item: ResourceInterface) => {
            identifiers.push(item.identifier);
        });

        const response = await client.get(
            TYPO3.settings.ajaxUrls[AjaxRoutes.damMoveResources]
            + '&conflictMode=rename'
            + '&identifiers[]=' + identifiers.join('&identifiers[]=')
            + '&targetFolderIdentifier=' + request.target,
        );

        if (response.status === 200) {
            this.fetchData(request.target);
            this.navigate(request.target);
        } else {
            console.log('Error while move, missing error handling');
        }
    }

    private async deleteResources(request: DeleteRequestInterface): Promise<any> {
        const identifiers: Array<string> = [];
        Object.values(request.resources).map((item: ResourceInterface) => {
            identifiers.push(item.identifier);
        });

        const response = await client.get(
            TYPO3.settings.ajaxUrls[AjaxRoutes.damDeleteResources]
            + '&identifiers[]=' + identifiers.join('&identifiers[]='),
        );

        if (response.status === 200) {
            this.modal.trigger('modal-dismiss');
            this.fetchData(this.current);
        } else {
            console.log('Error while delete, missing error handling');
        }
    }

    private async downloadResources(): Promise<any> {
        const identifiers: Array<string> = [];
        Object.values(this.selected).map((item: ResourceInterface) => {
            identifiers.push(item.identifier);
        });

        const response = await client.get(
            TYPO3.settings.ajaxUrls[AjaxRoutes.damPrepareDownload]
            + '&identifiers[]=' + identifiers.join('&identifiers[]='),
            {responseType: 'blob'},
        ).then((resp) => {
            const url = window.URL.createObjectURL(new Blob([resp.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', resp.headers.filename);
            document.body.appendChild(link);
            link.click();
        });
    }

    private confirm(action: Function): void {
        this.modal = Modal.confirm('Are you sure?', 'Do you want delete the selected resources?')
            .on('confirm.button.cancel', (): void => {
                this.modal.trigger('modal-dismiss');
            })
            .on('confirm.button.ok', (): void => {
                action({
                    'resources': this.selected,
                });
            });
    }

    private render(): VNode {
        return (
            <div></div>
        );
    }
}
