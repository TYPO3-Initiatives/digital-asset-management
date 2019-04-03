import {Vue} from 'vue/types/vue';
import _ from "vue-upload-component";

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
    response: object | string;
    progress: string;
    speed: number;
    xhr: XMLHttpRequest;
    iframe: Element;
    data: {
        identifier: string,
    };
    customAction: Function | null;
    callback: Function;
}

export interface FileUploadComponent extends _ {
    shouldUseChunkUpload: Function;
    uploadChunk: Function;
    uploadFile: Function;
    uploadPut: Function;
    uploadHtml5: Function;
    uploadHtml4: Function;
    readonly files: Array<UploadedFile>;
    readonly features: { html5?: boolean; directory?: boolean; drag?: boolean };
    active: boolean;
    readonly dropActive: true;
    readonly uploaded: true;
}
