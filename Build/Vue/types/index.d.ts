import {FileOverrideAction} from '@/enums/FileOverrideAction';

export interface UploadedFile {
    file: File;
    fileObject: boolean|object;
    id: string | number;
    size: number;
    name: string;
    type: string;
    active: boolean;
    error: string;
    success: boolean;
    putAction: string;
    postAction: string;
    headers: {
        [x: string]: any,
    };
    timeout: number;
    response: {
        errorMessage: string;
    };
    progress: string;
    speed: number;
    xhr: XMLHttpRequest;
    iframe: Element;
    data: {
        [x: string]: any,
    };
    customAction: Function | null;
    callback: Function;
    conflictMode: FileOverrideAction;
    targetFolder: string;
    fileExists: boolean|undefined;
    statusMessage: string;
    chunk: any;
    el: any;
}


export interface ExperimentalHTMLInputElement extends HTMLInputElement {
    webkitdirectory: boolean | undefined;
    directory: boolean | undefined;
}
