import _ from 'vue-upload-component';
import {FileOverrideAction} from '@/enums/FileOverrideAction';

export interface UploadedFile {
    file: File;
    readonly fileObject: boolean;
    id: string | number;
    size: number;
    name: string;
    type: string;
    active: boolean;
    error: string;
    success: boolean;
    putAction: string;
    postAction: string;
    headers: object;
    timeout: number;
    response: {
        errorMessage: string;
    };
    progress: string;
    speed: number;
    xhr: XMLHttpRequest;
    iframe: Element;
    data: {
        identifier: string,
        conflictMode: string;
    };
    customAction: Function | null;
    callback: Function;
    conflictMode: FileOverrideAction;
    targetFolder: string;
    fileExists: boolean;
    statusMessage: string;
}

export interface FileUploadComponent extends _ {
    shouldUseChunkUpload: Function;
    uploadChunk: Function;
    uploadFile: Function;
    uploadPut: Function;
    uploadHtml5: Function;
    uploadHtml4: Function;
}
