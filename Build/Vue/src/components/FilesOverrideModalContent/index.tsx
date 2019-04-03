import {VNode} from 'vue';
import {Prop, Vue} from 'vue-property-decorator';
import Component from 'vue-class-component';
import {Action} from '@/enums/FileOverrideActions';
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

    actionForAll: Action | null = null;

    get all(): Action | null {
        return this.actionForAll;
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
                                    this.actionForAll = (event.currentTarget as HTMLSelectElement).value as Action;
                                });
                            }
                        }>
                            <option value=''>Choose for all</option>
                            <option value={Action.SKIP}>{TYPO3.lang['file_upload.actions.all.skip']}</option>
                            <option
                                value={Action.RENAME}>{TYPO3.lang['file_upload.actions.all.rename']}</option>
                            <option
                                value={Action.OVERRIDE}>{TYPO3.lang['file_upload.actions.all.override']}</option>
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
                case Action.SKIP:
                    label = TYPO3.lang['file_upload.actions.skip'];
                    break;
                case Action.OVERRIDE:
                    label = TYPO3.lang['file_upload.actions.override'];
                    break;
                case Action.RENAME:
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
                    <option value={Action.SKIP}>{TYPO3.lang['file_upload.actions.skip']}</option>
                    <option
                        value={Action.RENAME}>{TYPO3.lang['file_upload.actions.rename']}</option>
                    <option
                        value={Action.OVERRIDE}>{TYPO3.lang['file_upload.actions.override']}</option>
                </select>
            );
        }

    }

}
