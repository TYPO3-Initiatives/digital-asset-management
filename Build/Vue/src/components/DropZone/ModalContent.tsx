import {VNode} from "vue";
import {Prop, Vue} from "vue-property-decorator";
import Component from "vue-class-component";
import {Action} from "@/enums/FileOverrideActions";

@Component
export default class ModalContent extends Vue {
    @Prop()
    files: Array<any>;

    get filesWithConflicts() {
        return this.files;
    }

    private render(): VNode {
        return (
            <table class='table'>
                <thead>
                <tr>
                    <th></th>
                    <th>{TYPO3.lang['file_upload.header.originalFile']}</th>
                    <th>{TYPO3.lang['file_upload.header.uploadedFile']}</th>
                    <th>{TYPO3.lang['file_upload.header.action']}</th>
                </tr>
                </thead>
                <tbody>
                {this.filesWithConflicts.map((file) => {
                    return (
                        <tr>
                            <td>{file.originalFile.thumbnailUrl ?
                                <img src={file.originalFile.thumbnailUrl} alt={file.originalFile.name}
                                     height='40'/> : ''}</td>
                            <td>
                                {file.originalFile.name} ({file.originalFile.sizeDisplay}) <br/>
                                {file.originalFile.mtimeDisplay}
                            </td>
                            <td>
                                {file.newFile.name} ({ModalContent.fileSizeAsString(file.newFile.file.size)}) <br/>
                                {/*@todo moment js foo*/file.newFile.file.lastModified}
                            </td>
                            <td>
                                <select onchange={
                                    (event: HTMLSelectElement) => {
                                        file.callback(file, event.currentTarget.value)
                                    }
                                }>
                                    <option value={Action.SKIP}>{TYPO3.lang['file_upload.actions.skip']}</option>
                                    <option value={Action.RENAME}>{TYPO3.lang['file_upload.actions.rename']}</option>
                                    <option
                                        value={Action.OVERRIDE}>{TYPO3.lang['file_upload.actions.override']}</option>
                                </select>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        )
    }

    private static fileSizeAsString(size: number): string {
        const sizeKB: number = size / 1024;
        let str = '';

        if (sizeKB > 1024) {
            str = (sizeKB / 1024).toFixed(1) + ' MB';
        } else {
            str = sizeKB.toFixed(1) + ' KB';
        }
        return str;
    }
}
