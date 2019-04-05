import {VNode} from 'vue';
import {Prop, Vue} from 'vue-property-decorator';
import Component from 'vue-class-component';
import {FileOverrideAction} from '@/enums/FileOverrideAction';
import FormatterService from '@/services/FormatterService';
import {UploadedFile} from '../../../types';
import moment from 'moment';

@Component
export default class FilesOverrideModalContent extends Vue {

    @Prop()
    files!: Array<UploadedFile>;

    get filesWithConflicts(): Array<any> {
        return this.files;
    }

    actionForAll: FileOverrideAction | null = null;

    get all(): FileOverrideAction | null {
        return this.actionForAll;
    }

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div class='vue-override-files'>
                <div class='change-all'>
                    <label>
                        <select onchange={
                            (event: Event) => {
                                this.files.map((file: UploadedFile) => {
                                    file.callback(file, (event.currentTarget as HTMLSelectElement).value);
                                    this.actionForAll = (event.currentTarget as HTMLSelectElement).value as FileOverrideAction;
                                });
                            }
                        }>
                            <option value=''>Choose for all</option>
                            <option value={FileOverrideAction.SKIP}>{TYPO3.lang['file_upload.actions.all.skip']}</option>
                            <option
                                value={FileOverrideAction.RENAME}>{TYPO3.lang['file_upload.actions.all.rename']}</option>
                            <option
                                value={FileOverrideAction.OVERRIDE}>{TYPO3.lang['file_upload.actions.all.override']}</option>
                        </select>
                    </label>
                </div>
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
                                    {file.newFile.name} ({FormatterService.fileSizeAsString(file.newFile.file.size)}) <br/>
                                    {moment(file.newFile.file.lastModified, 'x').format('YYYY-MM-DD HH:mm')}
                                </td>
                                <td>
                                    {this.getActionSelector(file)}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        );
    }

    private getActionSelector(file: UploadedFile): VNode | null {
        if (this.all) {
            let label = '';
            switch (this.all) {
                case FileOverrideAction.SKIP:
                    label = TYPO3.lang['file_upload.actions.skip'];
                    break;
                case FileOverrideAction.OVERRIDE:
                    label = TYPO3.lang['file_upload.actions.override'];
                    break;
                case FileOverrideAction.RENAME:
                    label = TYPO3.lang['file_upload.actions.rename'];
                    break;
                default:
            }
            return <span>{label}</span>;
        } else {
            return (
                <select onchange={
                    (event: Event) => {
                        file.callback(file, (event.currentTarget as HTMLSelectElement).value);
                    }
                }>
                    <option value={FileOverrideAction.SKIP}>{TYPO3.lang['file_upload.actions.skip']}</option>
                    <option
                        value={FileOverrideAction.RENAME}>{TYPO3.lang['file_upload.actions.rename']}</option>
                    <option
                        value={FileOverrideAction.OVERRIDE}>{TYPO3.lang['file_upload.actions.override']}</option>
                </select>
            );
        }

    }

}
