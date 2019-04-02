import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import FileUpload from 'vue-upload-component';
import client from "@/services/http/Typo3Client";
import {AjaxRoutes} from "@/enums/AjaxRoutes";
import {Mutation, State} from "vuex-class";
import {Mutations} from "@/enums/Mutations";
import {SeverityEnum} from "../../../../../../../TYPO3.CMS/typo3/sysext/backend/Resources/Private/TypeScript/Enum/Severity";
import ModalContent from "@/components/DropZone/ModalContent";
import {Action} from "@/enums/FileOverrideActions";

//@todo types, auto-upload, response handling, dropzone styling on active

@Component
export default class DropZone extends Vue {

    dragging: boolean = false;
    files: Array<any> = [];

    @State
    current: string;

    @Mutation(Mutations.SET_MODAL_CONTENT)
    setModalContent: Function;

    get targetFolder(): string {
        return this.current;
    }

    private render(): VNode {
        return (
            <div class='dropZone' onDragover={() => this.dragging = true}
                 onDragleave={() => this.dragging = false} onDragend={() => this.dragging = false}
                 onDrop={() => this.dragging = false}>
                {this.$slots.beforeUploadTable}
                {this.renderUploadTable()}
                {this.$slots.afterUploadTable}
                {this.renderUploadButton()}
                {this.renderDropArea()}
            </div>
        );
    }

    private upload = async (file: VUFile, fileUpload: FileUpload) => {
        // @todo check existence and choose conflict mode
        file.data['identifier'] = file.name;
        file.customAction = null;
        file.putAction = 'http://comp.ddev.local/test.php';
        if (fileUpload.features.html5) {
            if (fileUpload.shouldUseChunkUpload(file)) {
                return await fileUpload.uploadChunk(file)
            }
            if (file.putAction) {
                return await fileUpload.uploadPut(file)
            }
            if (file.postAction) {
                return await fileUpload.uploadHtml5(file)
            }
        }
        if (file.postAction) {
            return await this.uploadHtml4(file)
        }
        return Promise.reject('No action configured');
    };

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

    //@ autoupload (later)
    private inputFile(newFile, oldFile) {
        if (Boolean(newFile) !== Boolean(oldFile) || oldFile.error !== newFile.error) {
            if (!this.$refs.upload.active) {
                this.$refs.upload.active = true
            }
        }
    }

    private async onInputFiles(files: Array<VUFile>): Promise<any> {
        let responses = await this.checkFileConflicts(files);
        let content: VNode|null = null;

        if (responses.length > 0) {
            content = <ModalContent files={responses}/>
            this.setModalContent(<table>{content}</table>);
            const modal = top.TYPO3.Modal.confirm(
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
                top.TYPO3.Modal.dismiss();
            });
            modal.on('confirm.button.ok', () => {});
        }
    }

    private async checkFileConflicts(files: Array<VUFile>): Promise<Array<any>> {
        let promises: Array<Promise<any>> = [];
        let responses: Array<any> = [];
        for (let i = 0; i < files.length; i++) {
            promises.push(
                client.get(`${TYPO3.settings.ajaxUrls[AjaxRoutes.damFileExists]}&identifier=${this.targetFolder}${files[i].file.name}`).then((response) => {
                        if (response.data.state !== 0) {
                            let originalFile = response.data[0];
                            responses.push({
                                originalFile,
                                newFile: files[i],
                                callback: this.setConflictMode
                            });
                        }
                    }
                )
            );
        }
        await Promise.all(promises);
        return responses;
    }

    private setConflictMode(file: {newFile: VUFile}, conflictMode: Action) {
        this.files.forEach((stateFile: VUFile, index) => {
           if (file.newFile.id === stateFile.id) {
               this.files[index].conflictMode = conflictMode;
           }
        });
    }

    private renderUploadTable(): VNode | null {
        if (this.$refs.upload && this.$refs.upload.files.length > 0) {
            return (
                <div class='table-responsive'>
                    <table class='table table-hover'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Thumb</th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Speed</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.files.map((file, index) => {
                            return this.renderRow(file, index);
                        })}
                        </tbody>
                    </table>
                </div>
            )
        }
        return null;
    }

    private renderRow(file: VUFile, index) {
        let progress = null;
        let success = '';
        if (file.error) {
            success = file.error;
        } else if (file.success) {
            success = 'success';
        } else if (file.active) {
            success = 'active';
        }
        if (file.active || file.progress !== '0.00') {
            progress = <div class='progress'>
                <div
                    class={{
                        'progress-bar': true,
                        'progress-bar-striped': true,
                        'bg-danger': file.error,
                        'progress-bar-animated': file.active
                    }}
                    role='progressbar' style={{width: file.progress + '%'}}>{file.progress}%
                </div>
            </div>;
        }
        return (<tr key={file.id}>
            <td>{index}</td>
            <td>
                <div class='filename'>
                    {file.name}
                    {progress}
                </div>

            </td>
            <td>{file.size}</td>
            <td>{file.speed}</td>
            <td>{success}</td>
        </tr>);
    }

    private renderUploadButton(): VNode | null {
        if ((this.$refs.upload && !this.$refs.upload.active && this.$refs.upload.files.length > 0)) {
            return (
                <button type='button' class='btn btn-success' onClick={(e: Event) => {
                    this.$refs.upload.active = true
                }}>
                    <i class='fa fa-arrow-up' aria-hidden='true'></i>
                    Start Upload
                </button>
            )
        } else {
            return null;
        }
    }
}
