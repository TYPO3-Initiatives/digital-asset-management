import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import FileUpload from 'vue-upload-component';
import client from '@/services/http/Typo3Client';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {Mutation, State} from 'vuex-class';
import {Mutations} from '@/enums/Mutations';
import {Action} from '@/enums/FileOverrideActions';
import Modal from 'TYPO3/CMS/Backend/Modal';
import FilesOverrideModalContent from '@/components/FilesOverrideModalContent';
import {FileUploadComponent, UploadedFile} from '../../../types';
import {SeverityEnum} from '@/enums/Severity';
import FormatterService from '@/services/FormatterService';

@Component
export default class DropZone extends Vue {

    dragging: boolean = false;
    files: Array<any> = [];

    @State
    current!: String;

    @Mutation(Mutations.SET_MODAL_CONTENT)
    setModalContent!: Function;

    @Mutation(Mutations.CLEAR_MODAL_CONTENT)
    clearModalContent!: Function;

    get targetFolder(): String {
        return this.current;
    }

    private render(): VNode {
        return (
            <div class='dropZone' onDragover={() => this.dragging = true}
                 onDragleave={() => this.dragging = false} onDragend={() => this.dragging = false}
                 onDrop={() => this.dragging = false}>
                {this.$slots.beforeUploadTable}
                {this.renderUploadTable()}
                {...this.renderUploadButtons()}
                {this.$slots.afterUploadTable}
                {this.renderDropArea()}
            </div>
        );
    }

    private upload = async (file: UploadedFile, fileUpload: FileUploadComponent) => {
        if (file.conflictMode === Action.SKIP) {
            file.success = true;
            return Promise.resolve('Skipped.');
        }
        file.data.identifier = file.targetFolder + file.name;
        file.data.conflictMode = file.conflictMode;
        file.customAction = null;
        file.putAction = TYPO3.settings.ajaxUrls[AjaxRoutes.damFileUpload];
        if (fileUpload.features.html5) {
            if (fileUpload.shouldUseChunkUpload(file)) {
                return await fileUpload.uploadChunk(file);
            }
            if (file.putAction) {
                return await fileUpload.uploadPut(file);
            }
            if (file.postAction) {
                return await fileUpload.uploadHtml5(file);
            }
        }
        if (file.postAction) {
            return await fileUpload.uploadHtml4(file);
        }
        return Promise.reject('No action configured');
    }

    private renderDropArea(): VNode | null {
        return (
            <div class={{'hot': this.dragging}}>
                <div class='dragMessage'>Drag to upload files</div>
                <FileUpload onInput={this.onInputFiles} ref='upload' drop={true} vModel={this.files} multiple={true}
                            customAction={this.upload}>
                </FileUpload>
            </div>
        );
    }

    private async onInputFiles(files: Array<UploadedFile>): Promise<any> {
        this.files.forEach((file: UploadedFile, index) => {
            // method gets called on all state changes of files - therefor only set vars if not yet set
            if (this.files[index].targetFolder === undefined) {
                this.files[index].targetFolder = this.targetFolder;
            }
            if (this.files[index].conflictMode === undefined) {
                // set conflict mode default
                files[index].conflictMode = Action.SKIP;
            }
        });
    }

    private async checkFileConflicts(files: Array<UploadedFile>): Promise<Array<any>> {
        let promises: Array<Promise<any>> = [];
        let responses: Array<any> = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].fileExists === undefined) {
                this.files[i].fileExists = false;
                const url = `${TYPO3.settings.ajaxUrls[AjaxRoutes.damFileExists]}&identifier=${this.targetFolder}${files[i].name}`;
                promises.push(client.get(url).then((response) => {
                    if (response.data.state !== 0 && response.data.state !== 1) {
                        let originalFile = response.data[0];
                        this.files[i].fileExists = true;
                        this.files[i].progress = '5.00';
                        responses.push(
                            {
                                originalFile,
                                newFile: files[i],
                                callback: this.setConflictMode,
                            },
                        );
                    }
                }));
                if (i % 5 === 0 || i === files.length - 1) {
                    await Promise.all(promises);
                }
            }
        }
        return responses;
    }

    private setConflictMode(file: { newFile: UploadedFile }, conflictMode: Action): Promise<void> {
        this.files.forEach((stateFile: UploadedFile, index) => {
            if (file.newFile.id === stateFile.id) {
                this.files[index].fileExists = true;
                this.files[index].conflictMode = conflictMode;
            }
        });
    }

    private renderUploadTable(): VNode | null {
        if (this.$refs.upload && (this.$refs.upload as FileUpload).files.length > 0) {
            return (
                <div class='table-responsive'>
                    <table class='table table-hover'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Progress</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.files.map((file, index) => {
                            return this.renderRow(file, index);
                        })}
                        </tbody>
                    </table>
                </div>
            );
        }
        return null;
    }

    private renderRow(file: UploadedFile, index: Number): VNode {
        let progress = null;
        let success = '';
        if (file.error) {
            success = 'error';
        } else if (file.success) {
            success = 'success';
        } else if (file.active) {
            success = 'active';
        }
        let conflictHandling = '';
        // 5.00 is "fileExistenceCheck done"
        if (file.fileExists && (file.active || (file.progress !== '5.00' && file.progress !== '0.00'))) {
            switch (file.conflictMode) {
                case Action.SKIP:
                    conflictHandling = TYPO3.lang['file_upload.actions.skip'];
                    break;
                case Action.OVERRIDE:
                    conflictHandling = TYPO3.lang['file_upload.actions.override'];
                    break;
                case Action.RENAME:
                    conflictHandling = TYPO3.lang['file_upload.actions.rename'];
                    break;
                default:
            }
        }
        if (file.active || file.progress !== '0.00') {
            progress = <div class='progress'>
                <div
                    class={{
                        'progress-bar': true,
                        'progress-bar-striped': true,
                        'bg-danger': file.error,
                        'progress-bar-animated': file.active,
                    }}
                    role='progressbar' style={{width: file.progress + '%'}}>{file.progress}%
                </div>
            </div>;
        }
        return (
            <tr key={file.id} class={success}>
                <td>{index}</td>
                <td>
                    <div class='filename'>
                        {file.name}
                    </div>
                </td>
                <td>{FormatterService.fileSizeAsString(file.size)}</td>
                <td>{progress} <br />{conflictHandling}</td>
            </tr>
        );
    }

    private renderUploadButtons(): Array<VNode> {
        let buttons = [];
        if (
            this.$refs.upload &&
            !(this.$refs.upload as FileUpload).active &&
            (this.$refs.upload as FileUpload).files.length > 0
        ) {
            buttons.push(<button type='button' class='btn btn-secondary' onclick={(e: Event) => {
                (this.$refs.upload as FileUpload).clear();
            }}>
                <i class='fa fa-eraser' aria-hidden='true'></i>
                Clear
            </button>);
            buttons.push(<button type='button' class='btn btn-success' onclick={async (e: Event) => {
                await this.preFlightChecks();
            }}>
                <i class='fa fa-arrow-up' aria-hidden='true'></i>
                Start Upload
            </button>);
        }
        return buttons;
    }

    private async preFlightChecks(): Promise<any> {
        const responses = await this.checkFileConflicts(this.files);
        if (responses.length > 0) {
            // @ts-ignore - I don't get it.
            let modalContent = <FilesOverrideModalContent files={responses}/>;
            this.setModalContent(modalContent);
            const modal = Modal.confirm(
                TYPO3.lang['file_upload.existingfiles.title'], jQuery('#vue-modalContent'), SeverityEnum.warning,
                [
                    {
                        text: TYPO3.lang['file_upload.button.cancel'] || 'Cancel',
                        active: true,
                        btnClass: 'btn-default',
                        name: 'cancel',
                    },
                    {
                        text: TYPO3.lang['file_upload.button.continue'] || 'Continue with selected actions',
                        btnClass: 'btn-warning',
                        name: 'ok',
                    },
                ],
                ['modal-inner-scroll'],
            );
            modal.on('confirm.button.cancel', () => {
                (this.$refs.upload as FileUpload).clear();
                this.clearModalContent();
                Modal.dismiss();
            });
            modal.on('confirm.button.ok', () => {
                this.clearModalContent();
                Modal.dismiss();
                this.startUpload();
            });
        }
    }

    private startUpload(): void {
        (this.$refs.upload as FileUpload).active = true;
    }
}
