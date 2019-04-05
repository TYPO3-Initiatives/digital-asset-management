import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import client from '@/services/http/Typo3Client';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {Action, Mutation, State} from 'vuex-class';
import {Mutations} from '@/enums/Mutations';
import {FileOverrideAction} from '@/enums/FileOverrideAction';
import Modal from 'TYPO3/CMS/Backend/Modal';
import FilesOverrideModalContent from '@/components/FilesOverrideModalContent';
import {UploadedFile} from 'types';
import {SeverityEnum} from '@/enums/Severity';
import FormatterService from '@/services/FormatterService';
import {FileExistResponseCode} from '@/enums/FileExistResponseCode';
import {AxiosResponse} from 'axios';
import FileUpload from '@/components/Upload/FileUpload';

@Component
export default class DropZone extends Vue {

    dragging: boolean = false;
    files: Array<any> = [];

    @Action(AjaxRoutes.damGetTreeFolders)
    fetchTreeData: any;

    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @State
    current!: String;

    @Mutation(Mutations.SET_MODAL_CONTENT)
    setModalContent!: Function;

    @Mutation(Mutations.CLEAR_MODAL_CONTENT)
    clearModalContent!: Function;

    get targetFolder(): String {
        return this.current;
    }

    get uploadFinished(): boolean {
        return this.files.length > 0 && this.files.filter((file: UploadedFile) => {
            return !file.success;
        }).length === 0;
    }

    beforeUpdate(): void {
        if (this.uploadFinished) {
            (this.$refs.upload as FileUpload).clear();
            // trigger re-rendering of all current data dependent components
            this.fetchTreeData(this.current);
            this.fetchData(this.current);
        }
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

    private upload = async (file: UploadedFile, fileUpload: FileUpload) => {
        // do not upload skipped files
        if (file.fileExists && file.conflictMode === FileOverrideAction.SKIP) {
            file.success = true;
            file.statusMessage = '';
            return Promise.resolve('Skipped.');
        }
        file.statusMessage = TYPO3.lang['DropZone.status.startUpload'];
        // data attributes are automatically converted into request parameters
        file.data.identifier = file.targetFolder + file.name;
        file.data.conflictMode = file.conflictMode;

        // reset custom action to fall back to original component handling
        file.customAction = null;
        file.putAction = TYPO3.settings.ajaxUrls[AjaxRoutes.damFileUpload];

        // whilst currently not used besides the putAction this provides compatibility to the configuration options
        // of the original component
        file.statusMessage = 'Uploading';
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

    private async onInputFiles(files: Array<UploadedFile>): Promise<any> {
        this.files.forEach((file: UploadedFile, index) => {
            // method gets called on all state changes of files - therefor only set vars if not yet set
            if (this.files[index].targetFolder === undefined) {
                this.files[index].targetFolder = this.targetFolder;
            }
            if (this.files[index].conflictMode === undefined) {
                // set conflict mode default
                files[index].conflictMode = FileOverrideAction.SKIP;
            }
        });
    }

    private async checkFileConflicts(files: Array<UploadedFile>): Promise<Array<any>> {
        let promises: Array<Promise<any>> = [];
        let conflictedFiles: Array<any> = [];

        function hasBeenChecked(i: number): boolean {
            return files[i].fileExists !== undefined;
        }

        function hasFileConflict(response: AxiosResponse<any>): boolean {
            return response.data.state !== FileExistResponseCode.FILE_DOES_NOT_EXIST &&
                response.data.state !== FileExistResponseCode.PARENT_FOLDER_DOES_NOT_EXIST;
        }

        for (let i = 0; i < files.length; i++) {
            if (!hasBeenChecked(i)) {
                this.files[i].fileExists = false;
                const url = `${TYPO3.settings.ajaxUrls[AjaxRoutes.damFileExists]}&identifier=${this.targetFolder}${files[i].name}`;
                promises.push(client.get(url).then((response) => {
                    if (hasFileConflict(response)) {
                        this.files[i].statusMessage = TYPO3.lang['DropZone.status.preflight'];
                        let originalFile = response.data[0];
                        this.files[i].fileExists = true;
                        conflictedFiles.push(
                            {
                                originalFile,
                                newFile: files[i],
                                callback: this.setConflictMode,
                            },
                        );
                    }
                }));
                // max. 5 parallel requests to avoid crashing the server (especially on folder upload)
                if (i % 5 === 0 || i === files.length - 1) {
                    await Promise.all(promises);
                }
            }
        }
        return conflictedFiles;
    }

    private setConflictMode(file: { newFile: UploadedFile }, conflictMode: FileOverrideAction): void {
        this.files.forEach((stateFile: UploadedFile, index) => {
            if (file.newFile.id === stateFile.id) {
                this.files[index].fileExists = true;
                this.files[index].conflictMode = conflictMode;
            }
        });
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

    private renderUploadTable(): VNode | null {
        if (this.$refs.upload && (this.$refs.upload as FileUpload).files.length > 0) {
            return (
                <div class='table-responsive'>
                    <table class='table table-hover'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>{TYPO3.lang['DropZone.uploadTable.header.name']}</th>
                            <th>{TYPO3.lang['DropZone.uploadTable.header.size']}</th>
                            <th>{TYPO3.lang['DropZone.uploadTable.header.progress']}</th>
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
        let errorMessage = null;
        if (file.error) {
            file.statusMessage = TYPO3.lang['DropZone.status.uploadFailed'];
            errorMessage = file.response.errorMessage ? file.response.errorMessage : file.error;
            success = 'danger';
        } else if (file.success) {
            file.statusMessage = TYPO3.lang['DropZone.status.uploadSucceeded'];
            success = 'success';
        } else if (file.active) {
            success = 'info';
        }
        let conflictHandling = '';
        if (file.fileExists && (file.active || (file.progress !== '0.00'))) {
            switch (file.conflictMode) {
                case FileOverrideAction.SKIP:
                    conflictHandling = TYPO3.lang['file_upload.actions.skip'];
                    break;
                case FileOverrideAction.OVERRIDE:
                    conflictHandling = TYPO3.lang['file_upload.actions.override'];
                    break;
                case FileOverrideAction.RENAME:
                    conflictHandling = TYPO3.lang['file_upload.actions.rename'];
                    break;
                default:
            }
        }
        if (file.active || (file.progress !== '0.00' && file.progress !== '100.00')) {
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
                <td>{file.statusMessage}{progress}{errorMessage} <br/>{conflictHandling}</td>
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
                this.files.forEach((file: UploadedFile, index) => {
                    this.files[index].statusMessage = TYPO3.lang['DropZone.status.initializing'];
                });
                await this.uploadFiles();
            }}>
                <i class='fa fa-arrow-up' aria-hidden='true'></i>
                Start Upload
            </button>);
        }
        return buttons;
    }

    private async uploadFiles(): Promise<any> {
        const filesWithConflicts = await this.checkFileConflicts(this.files);
        if (filesWithConflicts.length > 0) {
            this.renderOverrideFilesModal(filesWithConflicts);
        } else {
            this.startUpload();
        }
    }

    private renderOverrideFilesModal(filesWithConflicts: Array<UploadedFile>): void {
        let modalContent = <FilesOverrideModalContent files={filesWithConflicts}/>;
        this.setModalContent(modalContent);
        let modal = Modal.advanced(
            {
                title: TYPO3.lang['file_upload.existingfiles.title'],
                content: jQuery('#vue-modalContent'),
                severity: SeverityEnum.warning,
                size: Modal.sizes.large,
                buttons: [
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
                additionalCssClasses: ['modal-inner-scroll'],
                callback: (currentModal: JQuery): void => {
                    currentModal.on('button.clicked', (e: JQueryEventObject): void => {
                        if (e.target.getAttribute('name') === 'cancel') {
                            currentModal.trigger('confirm.button.cancel');
                        } else if (e.target.getAttribute('name') === 'ok') {
                            currentModal.trigger('confirm.button.ok');
                        }
                    });
                },
            },
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

    private startUpload(): void {
        (this.$refs.upload as FileUpload).active = true;
    }
}
