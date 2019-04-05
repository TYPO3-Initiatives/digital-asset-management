import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import {ExperimentalHTMLInputElement, UploadedFile} from '../../../types';
import Timeout = NodeJS.Timeout;
import ChunkUploadDefaultHandler from './chunk/ChunkUploadHandler';
import {VNode} from 'vue';
import InputFile from '@/components/Upload/InputFile';

interface ChunkOptions {
    headers: object;
    action: String;
    minSize: number;
    maxActive: number;
    maxRetries: number;
    handler: any;
}

interface Features {
    html5: boolean;
    directory: boolean;
    drag: boolean;
    drop: boolean;
}

const CHUNK_DEFAULT_OPTIONS: ChunkOptions = {
    headers: {},
    action: '',
    minSize: 1048576,
    maxActive: 3,
    maxRetries: 5,

    handler: ChunkUploadDefaultHandler,
};

interface ProgressData {
    error: string | boolean;
    progress: string;
    response: object | string | null;
}

@Component
export default class FileUpload extends Vue {

    /**
     * uploaded - Whether the file list has been uploaded
     */
    get uploaded(): Boolean {
        let file;
        for (let i = 0; i < this.files.length; i++) {
            file = this.files[i];
            if (file.fileObject && !file.error && !file.success) {
                return false;
            }
        }
        return true;
    }

    get chunkOptions(): ChunkOptions {
        return Object.assign(CHUNK_DEFAULT_OPTIONS, this.chunk);
    }

    get className(): Array<String | undefined> {
        return [
            'file-uploads',
            this.features.html5 ? 'file-uploads-html5' : 'file-uploads-html4',
            this.features.directory && this.directory ? 'file-uploads-directory' : undefined,
            this.features.drop && this.drop ? 'file-uploads-drop' : undefined,
            this.disabled ? 'file-uploads-disabled' : undefined,
        ];
    }

    files: Array<UploadedFile> = [];
    features: Features = {
        html5: true,
        directory: false,
        drag: false,
        drop: true,
    };
    active: boolean = false;
    dropActive: boolean = false;
    uploading: number = 0;
    destroy: boolean = false;
    maps: any = {};

    @Prop()
    inputId!: String;

    @Prop({default: 'file'})
    name!: String;

    @Prop()
    accept!: String;

    @Prop()
    capture!: any;

    @Prop()
    disabled!: Boolean;

    @Prop({default: true})
    multiple!: Boolean;

    @Prop({default: 0})
    maximum!: Number;

    @Prop([Boolean, Number])
    addIndex!: Boolean | Number;

    @Prop()
    directory!: Boolean;

    @Prop()
    postAction!: String;

    @Prop()
    putAction!: String;

    @Prop()
    customAction!: Function;

    @Prop({default: Object})
    headers!: ObjectConstructor;

    @Prop({default: Object})
    data!: ObjectConstructor;

    @Prop({default: 0})
    timeout!: Number;

    @Prop({default: true})
    drop!: Boolean;

    @Prop({default: true})
    dropDirectory!: Boolean;

    @Prop({default: 0})
    size!: Number;

    @Prop()
    extensions!: Array<String> | RegExp | String;

    @Prop({default: []})
    value!: Array<any>;

    @Prop({default: 5})
    thread!: Number;

    @Prop({default: false})
    chunkEnabled!: Boolean;

    @Prop({default: () => CHUNK_DEFAULT_OPTIONS})
    chunk!: ObjectConstructor;

    private dropElement: any;

    constructor(props: any) {
        super(props);
    }

    @Watch('active')
    onActiveChange(active: any): void {
        this.watchActive(active);
    }

    @Watch('dropActive')
    onDropActive(): void {
        if (this.$parent) {
            this.$parent.$forceUpdate();
        }
    }

    @Watch('drop')
    dropWatch(value: any): void {
        this.watchDrop(value);
    }

    @Watch('value')
    watchValue(files: any): void {
        if (this.files === files) {
            return;
        }
        this.files = files;

        let oldMaps = this.maps;

        // Rewrite maps cache
        this.maps = {};
        for (let i = 0; i < this.files.length; i++) {
            let file = this.files[i];
            this.maps[file.id] = file;
        }

        // add, update
        for (let key in this.maps) {
            if (this.maps[key] && oldMaps[key]) {
                let newFile = this.maps[key];
                let oldFile = oldMaps[key];
                if (newFile !== oldFile) {
                    this.emitFile(newFile, oldFile);
                }
            }
        }

        // delete
        for (let key in oldMaps) {
            if (!this.maps[key]) {
                this.emitFile(undefined, oldMaps[key]);
            }
        }
    }

    mounted(): void {
        let input = document.createElement('input') as ExperimentalHTMLInputElement;
        input.type = 'file';
        input.multiple = true;

        // html5 feature
        if (window.FormData && input.files) {
            // Upload Directory Options
            if (typeof input.webkitdirectory === 'boolean' || typeof input.directory === 'boolean') {
                this.features.directory = true;
            }

            // Drag and Drop
            if (this.features.html5 && typeof input.ondrop !== 'undefined') {
                this.features.drop = true;
            }
        } else {
            this.features.html5 = false;
        }

        // files local cache
        this.maps = {};
        if (this.files) {
            for (let i = 0; i < this.files.length; i++) {
                let file = this.files[i];
                this.maps[file.id] = file;
            }
        }

        this.$nextTick(() => {

            // Update parent component
            if (this.$parent) {
                this.$parent.$forceUpdate();
            }

            // drag and drop rendering
            this.watchDrop(this.drop);
        });
    }

    beforeDestroy(): void {
        // Destroyed
        this.destroy = true;

        // set to inactive
        this.active = false;
    }

    render(): VNode {
        return (
            <span class={this.className}>
                <slot></slot>
                <label for={this.inputId || this.name}></label>
                <InputFile></InputFile>
              </span>
        );
    }

    clear(): Boolean {
        if (this.files.length) {
            let files = this.files;
            this.files = [];

            // clear maps after files!
            this.maps = {};

            // trigger Event
            this.emitInput();
            for (let i = 0; i < files.length; i++) {
                this.emitFile(undefined, files[i]);
            }
        }
        return true;
    }

    // select
    get(id: UploadedFile | string): any | Boolean {
        if (!id) {
            return false;
        }

        if (typeof id === 'object') {
            return this.maps[id.id] || false;
        }

        return this.maps[id] || false;
    }

    add(_files: Array<UploadedFile> | UploadedFile | any, index: Number | Boolean = this.addIndex): Boolean | Array<UploadedFile> {
        let files = _files;
        let isArray = files instanceof Array;

        // If not Array, create one
        if (!isArray) {
            files = [files];
        }

        // Traverse Files
        let addFiles = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (this.features.html5 && file instanceof Blob) {
                file = {
                    file,
                    size: file.size,
                    // @ts-ignore - no modern features
                    name: file.webkitRelativePath || file.relativePath || file.name || 'unknown',
                    type: file.type,
                };
            }
            let fileObject = false;
            // noinspection PointlessBooleanExpressionJS - DO NOT simplify to "!" - compares against false instead of undefined
            if (file.fileObject === false) {
                // false
            } else if (file.fileObject) {
                fileObject = true;
            } else if (typeof Element !== 'undefined' && file.el instanceof Element) {
                fileObject = true;
            } else if (typeof Blob !== 'undefined' && file.file instanceof Blob) {
                fileObject = true;
            }
            if (fileObject) {
                file = {
                    fileObject: true,
                    size: -1,
                    name: 'Filename',
                    type: '',
                    active: false,
                    error: '',
                    success: false,
                    putAction: this.putAction,
                    postAction: this.postAction,
                    timeout: this.timeout,
                    ...file,
                    response: {},

                    progress: '0.00',
                    speed: 0,
                    // xhr: false,
                    // iframe: false
                };

                file.data = {
                    ...this.data,
                    ...file.data ? file.data : {},
                };

                file.headers = {
                    ...this.headers,
                    ...file.headers ? file.headers : {},
                };
            }

            // a file must have an ID
            if (!file.id) {
                file.id = Math.random().toString(36).substr(2);
            }

            if (this.emitFilter(file, undefined)) {
                continue;
            }

            // Max number of files (default unlimited)
            if (this.maximum > 1 && (addFiles.length + this.files.length) >= this.maximum) {
                break;
            }

            addFiles.push(file);

            if (this.maximum === 1) {
                break;
            }
        }

        // No file
        if (!addFiles.length) {
            return false;
        }

        // if max. is 1 then clear at this point
        if (this.maximum === 1) {
            this.clear();
        }

        // Add to Files
        let newFiles;
        if (index === true || index === 0) {
            newFiles = addFiles.concat(this.files);
        } else if (index) {
            newFiles = this.files.concat([]);
            newFiles.splice((index as number), 0, ...addFiles);
        } else {
            newFiles = this.files.concat(addFiles);
        }

        this.files = newFiles;

        // add in cache
        for (let i = 0; i < addFiles.length; i++) {
            let file = addFiles[i];
            this.maps[file.id] = file;
        }

        // Emit event
        this.emitInput();
        for (let i = 0; i < addFiles.length; i++) {
            this.emitFile(addFiles[i], undefined);
        }

        return isArray ? addFiles : addFiles[0];
    }

    // Add form input for file
    addInputFile(el: any): Boolean | Array<UploadedFile> {
        let files = [];
        if (el.files) {
            for (let i = 0; i < el.files.length; i++) {
                let file = el.files[i];
                files.push({
                    size: file.size,
                    name: file.webkitRelativePath || file.relativePath || file.name,
                    type: file.type,
                    file,
                });
            }
        } else {
            let names = el.value.replace(/\\/g, '/').split('/');
            delete el.__vuex__;
            files.push({
                name: names[names.length - 1],
                el,
            });
        }
        return this.add(files);
    }

    // Add to DataTransfer
    addDataTransfer(dataTransfer: { items: any[]; files: UploadedFile[]; } | DataTransfer): any {
        let files: Array<UploadedFile | File> = [];
        if (dataTransfer.items && dataTransfer.items.length) {
            let items: Array<any> = [];
            for (let i = 0; i < dataTransfer.items.length; i++) {
                let item = dataTransfer.items[i];
                if (item.getAsEntry) {
                    item = item.getAsEntry() || item.getAsFile();
                } else if (item.webkitGetAsEntry) {
                    item = item.webkitGetAsEntry() || item.getAsFile();
                } else {
                    item = item.getAsFile();
                }
                if (item) {
                    items.push(item);
                }
            }

            return new Promise((resolve, reject) => {
                let forEach = (i: number) => {
                    let item = items[i];
                    // final number of files is bigger than maximum - max. reached
                    if (!item || (this.maximum > 0 && files.length >= this.maximum)) {
                        return resolve(this.add(files));
                    }
                    this.getEntry(item).then(function (results: any): void {
                        files.push(...results);
                        forEach(i + 1);
                    });
                };
                forEach(0);
            });
        }

        if (dataTransfer.files.length) {
            for (let i = 0; i < dataTransfer.files.length; i++) {
                files.push(dataTransfer.files[i]);
                if (this.maximum > 0 && files.length >= this.maximum) {
                    break;
                }
            }
            return Promise.resolve(this.add(files));
        }

        return Promise.resolve([]);
    }

    getEntry(
        entry: { isFile: any; file: (arg0: (file: any) => void) => void; isDirectory: any; createReader: () => any; name: string; },
        path: string = '',
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            if (entry.isFile) {
                entry.file(function (file: UploadedFile): any {
                    resolve([
                        {
                            size: file.size,
                            name: path + file.name,
                            type: file.type,
                            file,
                        },
                    ]);
                });
            } else if (entry.isDirectory && this.dropDirectory) {
                let files: any[] = [];
                let dirReader = entry.createReader();
                let readEntries = () => {
                    dirReader.readEntries((entries: {
                                               [x: string]: {
                                                   isFile: any;
                                                   file: (arg0: (file: any) => void) => void;
                                                   isDirectory: any;
                                                   createReader: () => void; name: string;
                                               };
                                           },
                    ) => {
                        let forEach = (i: number) => {
                            if ((!entries[i] && i === 0) || (this.maximum > 0 && files.length >= this.maximum)) {
                                return resolve(files);
                            }
                            if (!entries[i]) {
                                return readEntries();
                            }
                            this.getEntry(entries[i], path + entry.name + '/').then((results) => {
                                files.push(...results);
                                forEach(i + 1);
                            });
                        };
                        forEach(0);
                    });
                };
                readEntries();
            } else {
                resolve([]);
            }
        });
    }

    replace(id1: string | UploadedFile, id2: string | UploadedFile): boolean {
        let file1 = this.get(id1);
        let file2 = this.get(id2);
        if (!file1 || !file2 || file1 === file2) {
            return false;
        }
        let files = this.files.concat([]);
        let index1 = files.indexOf(file1);
        let index2 = files.indexOf(file2);
        if (index1 === -1 || index2 === -1) {
            return false;
        }
        files[index1] = file2;
        files[index2] = file1;
        this.files = files;
        this.emitInput();
        return true;
    }

    remove(id: string | UploadedFile): boolean | any | Boolean {
        let file = this.get(id);
        if (file) {
            if (this.emitFilter(undefined, file)) {
                return false;
            }
            let files = this.files.concat([]);
            let index = files.indexOf(file);
            if (index === -1) {
                console.error('remove', file);
                return false;
            }
            files.splice(index, 1);
            this.files = files;

            // remove from cache
            delete this.maps[file.id];

            // emit event
            this.emitInput();
            this.emitFile(undefined, file);
        }
        return file;
    }

    update(
        id: string | UploadedFile,
        data: {
            active?: boolean;
            success?: boolean;
            error?: any;
            progress?: string;
            speed?: number;
            xhr?: any;
            iframe?: HTMLIFrameElement;
        },
    ): boolean | any {
        let file = this.get(id);
        if (file) {
            let newFile = {
                ...file,
                ...data,
            };
            // abort transfer (as error)
            if (file.fileObject && file.active && !newFile.active && !newFile.error && !newFile.success) {
                newFile.error = 'abort';
            }

            if (this.emitFilter(newFile, file)) {
                return false;
            }

            let files = this.files.concat([]);
            let index = files.indexOf(file);
            if (index === -1) {
                console.error('update', file);
                return false;
            }
            files.splice(index, 1, newFile);
            this.files = files;

            // Remove old file, add new file in cache
            delete this.maps[file.id];
            this.maps[newFile.id] = newFile;

            // emit event
            this.emitInput();
            this.emitFile(newFile, file);
            return newFile;
        }
        return false;
    }

    // Preprocess files with filter
    emitFilter(newFile: any, oldFile: any): boolean {
        let isPrevent = false;
        this.$emit('input-filter', newFile, oldFile, function (): Boolean {
            isPrevent = true;
            return isPrevent;
        });
        return isPrevent;
    }

    // Postprocess file
    emitFile(newFile: UploadedFile | undefined, oldFile: UploadedFile | undefined): void {
        this.$emit('input-file', newFile, oldFile);
        if (newFile && newFile.fileObject && newFile.active && (!oldFile || !oldFile.active)) {
            this.uploading++;
            // 激活
            this.$nextTick(
                function (): void {
                    setTimeout(
                        () => {
                            this.upload(newFile as UploadedFile).then(() => {
                                // eslint-disable-next-line
                                newFile = this.get(newFile as UploadedFile);
                                if (newFile && newFile.fileObject) {
                                    this.update(newFile, {
                                        active: false,
                                        success: !newFile.error,
                                    });
                                }
                            }).catch((e: { code: any; error: any; message: any; }) => {
                                this.update(newFile as UploadedFile, {
                                    active: false,
                                    success: false,
                                    error: e.code || e.error || e.message || e,
                                });
                            });
                        },
                        parseInt(String(Math.random() * 50 + 50), 10));
                });
        } else if ((!newFile || !newFile.fileObject || !newFile.active) && oldFile && oldFile.fileObject && oldFile.active) {
            // stop
            this.uploading--;
        }

        // continue automatically
        if (
            this.active && (Boolean(newFile) !== Boolean(oldFile) ||
            (newFile as UploadedFile).active !== (oldFile as UploadedFile).active)
        ) {
            this.watchActive(true);
        }
    }

    emitInput(): void {
        this.$emit('input', this.files);
    }


    upload(id: string | UploadedFile): Promise<never> | Promise<any> | any {
        let file = this.get(id);

        // has been deleted
        if (!file) {
            return Promise.reject('not_exists');
        }

        // is not a file object
        if (!file.fileObject) {
            return Promise.reject('file_object');
        }

        // response contains error
        if (file.error) {
            return Promise.reject(file.error);
        }

        // response successfully completed
        if (file.success) {
            return Promise.resolve(file);
        }

        // file extensions / suffixes
        let extensions = this.extensions;

        // @ts-ignore
        if (extensions && ((extensions as String[]).length || typeof extensions.length === 'undefined')) {
            if (typeof extensions !== 'object' || !(extensions instanceof RegExp)) {
                if (typeof extensions === 'string') {
                    extensions = (extensions as string).split(',').map((value: String) => value.trim()).filter((value: String) => value);
                }
                extensions = new RegExp('\\.(' + (extensions as String[]).join('|').replace(/\./g, '\\.') + ')$', 'i');
            }
            if (file.name.search(extensions) === -1) {
                return Promise.reject('extension');
            }
        }

        // handle max size
        if (this.size > 0 && file.size >= 0 && file.size > this.size) {
            return Promise.reject('size');
        }

        if (this.customAction) {
            return this.customAction(file, this);
        }

        if (this.features.html5) {
            if (this.shouldUseChunkUpload(file)) {
                return this.uploadChunk(file);
            }
            if (file.putAction) {
                return this.uploadPut(file);
            }
            if (file.postAction) {
                return this.uploadHtml5(file);
            }
        }
        if (file.postAction) {
            return this.uploadHtml4(file);
        }
        return Promise.reject('No action configured');
    }

    /**
     * Whether this file should be uploaded using chunk upload or not
     *
     * @param file
     */
    shouldUseChunkUpload(file: UploadedFile): boolean {
        return this.chunkEnabled &&
            !!this.chunkOptions.handler &&
            file.size > this.chunkOptions.minSize;
    }

    /**
     * Upload a file using Chunk method
     *
     * @param file
     */
    uploadChunk(file: UploadedFile): any {
        const HandlerClass = this.chunkOptions.handler;
        file.chunk = new HandlerClass(file, this.chunkOptions);

        return file.chunk.upload();
    }

    uploadPut(file: UploadedFile): Promise<any> {
        let querys = [];
        for (let key in file.data) {
            if (file.data[key] !== null && file.data[key] !== undefined) {
                querys.push(encodeURIComponent(key) + '=' + encodeURIComponent(file.data[key]));
            }
        }
        let queryString = querys.length ? (file.putAction.indexOf('?') === -1 ? '?' : '&') + querys.join('&') : '';
        let xhr = new XMLHttpRequest();
        xhr.open('PUT', file.putAction + queryString);
        return this.uploadXhr(xhr, file, file.file);
    }

    uploadHtml5(file: UploadedFile): Promise<any> {
        let form = new window.FormData();
        for (let key in file.data) {
            if (file.data[key] && typeof file.data[key] === 'object' && typeof file.data[key].toString !== 'function') {
                if (file.data[key] instanceof File) {
                    form.append(key, file.data[key], file.data[key].name);
                } else {
                    form.append(key, JSON.stringify(file.data[key]));
                }
            } else if (file.data[key] !== null && file.data[key] !== undefined) {
                form.append(key, file.data[key]);
            }
        }
        // @ts-ignore
        form.append(this.name, file.file, file.file.filename || file.name);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', file.postAction);
        return this.uploadXhr(xhr, file, form);
    }

    uploadXhr(xhr: XMLHttpRequest, _file: UploadedFile, body: File): Promise<any> {
        let file = _file;
        let speedTime = 0;
        let speedLoaded = 0;

        // progress bar
        xhr.upload.onprogress = (e) => {
            // upload not yet started, file deleted, inactive
            file = this.get(file);
            if (!e.lengthComputable || !file || !file.fileObject || !file.active) {
                return;
            }

            // progress speed - updates every second
            let speedTime2 = Math.round(Date.now() / 1000);
            if (speedTime2 === speedTime) {
                return;
            }
            speedTime = speedTime2;

            file = this.update(file, {
                progress: (e.loaded / e.total * 100).toFixed(2),
                speed: e.loaded - speedLoaded,
            });
            speedLoaded = e.loaded;
        };

        // check status
        let interval: Timeout | boolean = setInterval(
            () => {
                file = this.get(file);
                if (file && file.fileObject && !file.success && !file.error && file.active) {
                    return;
                }

                if (interval) {
                    clearInterval(interval as Timeout);
                    interval = false;
                }

                try {
                    xhr.abort();
                    xhr.timeout = 1;
                } catch (e) {
                    // intentionally left blank
                }
            },
            100,
        );

        return new Promise((resolve, reject) => {
            let complete: boolean;
            let fn = (e: { type: any; }) => {
                // already done
                if (complete) {
                    return;
                }
                complete = true;
                if (interval) {
                    clearInterval(interval as Timeout);
                    interval = false;
                }

                file = this.get(file);

                // no direct response
                if (!file) {
                    return reject('not_exists');
                }

                // no file object
                if (!file.fileObject) {
                    return reject('file_object');
                }

                // response returned error
                if (file.error) {
                    return reject(file.error);
                }

                // transfer was aborted
                if (!file.active) {
                    return reject('abort');
                }

                // transfer was successful
                if (file.success) {
                    return resolve(file);
                }

                let data: ProgressData = {
                    error: false,
                    progress: '0.00',
                    response: null,
                };

                switch (e.type) {
                    case 'timeout':
                    case 'abort':
                        data.error = e.type;
                        break;
                    case 'error':
                        if (!xhr.status) {
                            data.error = 'network';
                        } else if (xhr.status >= 500) {
                            data.error = 'server';
                        } else if (xhr.status >= 400) {
                            data.error = 'denied';
                        }
                        break;
                    default:
                        if (xhr.status >= 500) {
                            data.error = 'server';
                        } else if (xhr.status >= 400) {
                            data.error = 'denied';
                        } else {
                            data.progress = '100.00';
                        }
                }

                if (xhr.responseText) {
                    let contentType = xhr.getResponseHeader('Content-Type');
                    if (contentType && contentType.indexOf('/json') !== -1) {
                        data.response = JSON.parse(xhr.responseText);
                    } else {
                        data.response = xhr.responseText;
                    }
                }

                // update
                file = this.update(file, data);

                // corresponding error
                if (file.error) {
                    return reject(file.error);
                }

                // response
                return resolve(file);
            };

            // events
            xhr.onload = fn;
            xhr.onerror = fn;
            xhr.onabort = fn;
            xhr.ontimeout = fn;

            // timeout
            if (file.timeout) {
                xhr.timeout = file.timeout;
            }

            // headers
            for (let key in file.headers) {
                if (file.headers[key]) {
                    xhr.setRequestHeader(key, file.headers[key]);
                }
            }

            // update xhr
            file = this.update(file, {xhr});

            // start upload
            xhr.send(body);
        });
    }

    uploadHtml4(_file: UploadedFile): Promise<any | never> {
        let file = _file;
        let onKeydown = function (e: KeyboardEvent): void {
            if (e.keyCode === 27) {
                e.preventDefault();
            }
        };

        let iframe = document.createElement('iframe');
        iframe.id = 'upload-iframe-' + file.id;
        iframe.name = 'upload-iframe-' + file.id;
        iframe.src = 'about:blank';
        iframe.setAttribute('style', 'width:1px;height:1px;top:-999em;position:absolute; margin-top:-999em;');

        let form = document.createElement('form');

        form.action = file.postAction;

        form.name = 'upload-form-' + file.id;

        form.setAttribute('method', 'POST');
        form.setAttribute('target', 'upload-iframe-' + file.id);
        form.setAttribute('enctype', 'multipart/form-data');

        let value;
        let input;
        for (let key in file.data) {
            if (file.data[key]) {
                if (typeof file.data[key] === 'object' && typeof file.data[key].toString !== 'function') {
                    value = JSON.stringify(file.data[key]);
                }
                if (file.data[key] !== null && file.data[key] !== undefined) {
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = file.data[key];
                    form.appendChild(input);
                }
            }
        }
        form.appendChild(file.el);

        document.body.appendChild(iframe).appendChild(form);

        let getResponseData = function (): string | null {
            let doc;
            try {
                if (iframe.contentWindow) {
                    doc = iframe.contentWindow.document;
                }
            } catch (err) {
                // intentionally left blank
            }
            if (!doc) {
                try {
                    // @ts-ignore - fallback for weird browsers
                    doc = iframe.contentDocument ? iframe.contentDocument : iframe.document;
                } catch (err) {
                    // @ts-ignore - fallback for weird browsers
                    doc = iframe.document;
                }
            }
            if (doc && doc.body) {
                return doc.body.innerHTML;
            }
            return null;
        };

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                file = this.update(file, {iframe});

                // does not exist
                if (!file) {
                    return reject('not_exists');
                }

                    // check time
                let interval: Timeout | boolean = setInterval(
                        () => {
                            file = this.get(file);
                            if (file && file.fileObject && !file.success && !file.error && file.active) {
                                return;
                            }

                            if (interval) {
                                clearInterval(interval as Timeout);
                                interval = false;
                            }

                            // @ts-ignore
                            iframe.onabort({type: file ? 'abort' : 'not_exists'});
                        },
                        100,
                    );

                let complete: boolean;
                let fn = (e: Event | string) => {
                        // already done
                        if (complete) {
                            return;
                        }
                        complete = true;

                        if (interval) {
                            clearInterval(interval as Timeout);
                            interval = false;
                        }

                        // turn off esc event
                        document.body.removeEventListener('keydown', onKeydown);

                        file = this.get(file);

                        // no response / file does not exist anymore
                        if (!file) {
                            return reject('not_exists');
                        }

                        // no file object
                        if (!file.fileObject) {
                            return reject('file_object');
                        }

                        // response returned error
                        if (file.error) {
                            return reject(file.error);
                        }

                        // transfer was aborted
                        if (!file.active) {
                            return reject('abort');
                        }

                        // transfer was successful
                        if (file.success) {
                            return resolve(file);
                        }

                        let response = getResponseData();
                        let data: ProgressData = {
                            error: '',
                            progress: '0.00',
                            response: null,
                        };
                        switch ((e as Event).type) {
                            case 'abort':
                                data.error = 'abort';
                                break;
                            case 'error':
                                if (file.error) {
                                    data.error = file.error;
                                } else if (response === null) {
                                    data.error = 'network';
                                } else {
                                    data.error = 'denied';
                                }
                                break;
                            default:
                                if (file.error) {
                                    data.error = file.error;
                                } else if (response === null) {
                                    data.error = 'network';
                                } else {
                                    data.progress = '100.00';
                                }
                        }

                        if (response !== null) {
                            if (response && response.substr(0, 1) === '{' && response.substr(response.length - 1, 1) === '}') {
                                try {
                                    response = JSON.parse(response);
                                } catch (err) {
                                    // intentionally left blank
                                }
                            }
                            data.response = response;
                        }

                        // Update
                        file = this.update(file, data);

                        if (file.error) {
                            return reject(file.error);
                        }

                        // Return Response
                        return resolve(file);
                    };

                    // Events
                iframe.onload = fn;
                iframe.onerror = fn;
                iframe.onabort = fn;

                    // Add escape listener
                document.body.addEventListener('keydown', onKeydown);

                    // submit
                form.submit();
                },
                       50,
            );
        }).then(function (reason: any): any {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
            return reason;
        }).catch(function (reason: any): any {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
            return reason;
        });
    }

    watchActive(active: boolean): void {
        let file;
        let index = 0;
        while ((file = this.files[index])) {
            index++;
            if (!file.fileObject) {
                // not a file object
            } else if (active && !this.destroy) {
                if (this.uploading >= this.thread || (this.uploading && !this.features.html5)) {
                    break;
                }
                if (!file.active && !file.error && !file.success) {
                    this.update(file, {active: true});
                }
            } else {
                if (file.active) {
                    this.update(file, {active: false});
                }
            }
        }
        if (this.uploading === 0) {
            this.active = false;
        }
    }

    watchDrop(_el: Boolean | string | Element | null): void {
        let el = _el;
        if (!this.features.drop) {
            return;
        }

        // remove mount
        if (this.dropElement) {
            try {
                document.removeEventListener('dragenter', this.onDragenter, false);
                document.removeEventListener('dragleave', this.onDragleave, false);
                document.removeEventListener('drop', this.onDocumentDrop, false);
                this.dropElement.removeEventListener('dragover', this.onDragover, false);
                this.dropElement.removeEventListener('drop', this.onDrop, false);
            } catch (e) {
                // intentionally left blank
            }
        }

        if (!el) {
            el = false;
        } else if (typeof el === 'string') {
            el = document.querySelector(el) || this.$root.$el.querySelector(el);
        } else if (el === true) {
            el = this.$parent.$el;
        }

        this.dropElement = el;

        if (this.dropElement) {
            document.addEventListener('dragenter', this.onDragenter, false);
            document.addEventListener('dragleave', this.onDragleave, false);
            document.addEventListener('drop', this.onDocumentDrop, false);
            this.dropElement.addEventListener('dragover', this.onDragover, false);
            this.dropElement.addEventListener('drop', this.onDrop, false);
        }
    }

    onDragenter(e: DragEvent): void {
        e.preventDefault();
        if (this.dropActive) {
            return;
        }
        if (!e.dataTransfer) {
            return;
        }
        let dt = e.dataTransfer;
        if (dt.files && dt.files.length) {
            this.dropActive = true;
        } else if (!dt.types) {
            this.dropActive = true;
        } else if (dt.types.indexOf && dt.types.indexOf('Files') !== -1) {
            this.dropActive = true;
        }
    }

    onDragleave(e: DragEvent | any): void {
        e.preventDefault();
        if (!this.dropActive) {
            return;
        }
        if (e.target.nodeName === 'HTML' ||
            e.target === e.explicitOriginalTarget ||
            (!e.fromElement &&
                (e.clientX <= 0 ||
                    e.clientY <= 0 ||
                    e.clientX >= window.innerWidth ||
                    e.clientY >= window.innerHeight)
            )
        ) {
            this.dropActive = false;
        }
    }

    onDragover(e: DragEvent): void {
        e.preventDefault();
    }

    onDocumentDrop(): void {
        this.dropActive = false;
    }

    onDrop(e: DragEvent): void {
        e.preventDefault();
        if (e.dataTransfer !== null) {
            this.addDataTransfer(e.dataTransfer);
        }
    }
}
