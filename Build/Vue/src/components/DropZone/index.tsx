import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import FileUpload from 'vue-upload-component';

//@todo types, auto-upload, response handling, conflict handling, dropzone styling on active

@Component
export default class DropZone extends Vue {

    dragging: boolean = false;
    files: Array<any> = [];

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

    private upload = async (file, fileUpload: FileUpload) => {
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
                <FileUpload ref='upload' drop={true} vModel={this.files} multiple={true} customAction={this.upload}>
                </FileUpload>
            </div>
        );
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

    private renderRow(file, index) {
        const thumb = file.thumb ? <img v-if='file.thumb' src={file.thumb} width='40' height='auto'/> :
            <span>No Image</span>;
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
                {thumb}
            </td>
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
