import {
  default as request,
  createRequest,
  sendFormRequest,
} from '../utils/request';

interface Chunk {
  retries: number;
  blob: any;
  startOffset: any;
  uploaded: any;
  active: boolean;
  xhr: any;
  progress: any;
}

export default class ChunkUploadHandler {
  chunkSize: any;
  sessionId: any;
  private file: any;
  private options: any;
  private chunks: any;
  private promise: Promise<any>|undefined;
  private resolve!: ((value?: (PromiseLike<any> | any)) => void);
  private reject!: ((reason?: any) => void);

  /**
   * Constructor
   *
   * @param {File} file
   * @param {Object} options
   */
  constructor (file: any, options: any) {
    this.file = file;
    this.options = options;
  }

  /**
   * Gets the max retries from options
   */
  get maxRetries (): number {
    return parseInt(this.options.maxRetries, undefined);
  }

  /**
   * Gets the max number of active chunks being uploaded at once from options
   */
  get maxActiveChunks (): number {
    return parseInt(this.options.maxActive, undefined);
  }

  /**
   * Gets the file type
   */
  get fileType (): any {
    return this.file.type;
  }

  /**
   * Gets the file size
   */
  get fileSize (): any {
    return this.file.size;
  }

  /**
   * Gets the file name
   */
  get fileName (): any {
    return this.file.name;
  }

  /**
   * Gets action (url) to upload the file
   */
  get action (): any {
    return this.options.action || null;
  }

  /**
   * Gets the body to be merged when sending the request in start phase
   */
  get startBody (): any {
    return this.options.startBody || {};
  }

  /**
   * Gets the body to be merged when sending the request in upload phase
   */
  get uploadBody (): any {
    return this.options.uploadBody || {};
  }

  /**
   * Gets the body to be merged when sending the request in finish phase
   */
  get finishBody (): any {
    return this.options.finishBody || {};
  }

  /**
   * Gets the headers of the requests from options
   */
  get headers (): {} {
    return this.options.headers || {};
  }

  /**
   * Whether it's ready to upload files or not
   */
  get readyToUpload (): boolean {
    return !!this.chunks;
  }

  /**
   * Gets the progress of the chunk upload
   * - Gets all the completed chunks
   * - Gets the progress of all the chunks that are being uploaded
   */
  get progress (): number {
    const completedProgress = (this.chunksUploaded.length / this.chunks.length) * 100;
    const uploadingProgress = this.chunksUploading.reduce((progress: number, chunk: Chunk) => {
      return progress + ((chunk.progress | 0) / this.chunks.length);
    },                                                    0);

    return Math.min(completedProgress + uploadingProgress, 100);
  }

  /**
   * Gets all the chunks that are pending to be uploaded
   */
  get chunksToUpload (): any {
    return this.chunks.filter((chunk: Chunk) => {
      return !chunk.active && !chunk.uploaded;
    });
  }

  /**
   * Whether there are chunks to upload or not
   */
  get hasChunksToUpload (): boolean {
    return this.chunksToUpload.length > 0;
  }

  /**
   * Gets all the chunks that are uploading
   */
  get chunksUploading (): any {
    return this.chunks.filter((chunk: Chunk) => {
      return !!chunk.xhr && !!chunk.active;
    });
  }

  /**
   * Gets all the chunks that have finished uploading
   */
  get chunksUploaded (): any {
    return this.chunks.filter((chunk: { uploaded: any; }) => !!chunk.uploaded);
  }

  /**
   * Creates all the chunks in the initial state
   */
  createChunks (): void {
    this.chunks = [];

    let start = 0;
    let end = this.chunkSize;
    while (start < this.fileSize) {
      this.chunks.push({
        blob: this.file.file.slice(start, end),
        startOffset: start,
        active: false,
        retries: this.maxRetries,
      });
      start = end;
      end = start + this.chunkSize;
    }
  }

  /**
   * Updates the progress of the file with the handler's progress
   */
  updateFileProgress (): void {
    this.file.progress = this.progress;
  }

  /**
   * Paues the upload process
   * - Stops all active requests
   * - Sets the file not active
   */
  pause (): void {
    this.file.active = false;
    this.stopChunks();
  }

  /**
   * Stops all the current chunks
   */
  stopChunks (): void {
    this.chunksUploading.forEach((chunk: Chunk) => {
      chunk.xhr.abort();
      chunk.active = false;
    });
  }

  /**
   * Resumes the file upload
   * - Sets the file active
   * - Starts the following chunks
   */
  resume (): void {
    this.file.active = true;
    this.startChunking();
  }

  /**
   * Starts the file upload
   *
   * @returns Promise
   * - resolve  The file was uploaded
   * - reject   The file upload failed
   */
  upload (): any {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.start();

    return this.promise;
  }

  /**
   * Start phase
   * Sends a request to the backend to initialise the chunks
   */
  start (): void {
    request({
      method: 'POST',
      headers: Object.assign({}, this.headers, {
        'Content-Type': 'application/json',
      }),
      url: this.action,
      body: Object.assign(this.startBody, {
        phase: 'start',
        mime_type: this.fileType,
        size: this.fileSize,
        name: this.fileName,
      }),
    }).then((res: { status: string; data: { session_id: any; end_offset: any; }; }) => {
      if (res.status !== 'success') {
        this.file.response = res;
        return this.reject('server');
      }

      this.sessionId = res.data.session_id;
      this.chunkSize = res.data.end_offset;

      this.createChunks();
      this.startChunking();
    }).catch((res: any) => {
      this.file.response = res;
      this.reject('server');
    });
  }

  /**
   * Starts to upload chunks
   */
  startChunking (): void {
    for (let i = 0; i < this.maxActiveChunks; i++) {
      this.uploadNextChunk();
    }
  }

  /**
   * Uploads the next chunk
   * - Won't do anything if the process is paused
   * - Will start finish phase if there are no more chunks to upload
   */
  uploadNextChunk (): void {
    if (this.file.active) {
      if (this.hasChunksToUpload) {
        return this.uploadChunk(this.chunksToUpload[0]);
      }

      if (this.chunksUploading.length === 0) {
        return this.finish();
      }
    }
  }

  /**
   * Uploads a chunk
   * - Sends the chunk to the backend
   * - Sets the chunk as uploaded if everything went well
   * - Decreases the number of retries if anything went wrong
   * - Fails if there are no more retries
   *
   * @param {Object} chunk
   */
  uploadChunk (chunk: Chunk): void {
    chunk.progress = 0;
    chunk.active = true;
    this.updateFileProgress();
    chunk.xhr = createRequest({
      method: 'POST',
      headers: this.headers,
      url: this.action,
    });

    chunk.xhr.upload.addEventListener('progress', function (evt: ProgressEvent): void {
      if (evt.lengthComputable) {
        chunk.progress = Math.round(evt.loaded / evt.total * 100);
      }
    },                                false);

    sendFormRequest(chunk.xhr, Object.assign(this.uploadBody, {
      phase: 'upload',
      session_id: this.sessionId,
      start_offset: chunk.startOffset,
      chunk: chunk.blob,
    })).then((res: any ) => {
      chunk.active = false;
      if (res.status === 'success') {
        chunk.uploaded = true;
      } else {
        if (chunk.retries-- <= 0) {
          this.stopChunks();
          return this.reject('upload');
        }
      }

      this.uploadNextChunk();
    }).catch(() => {
      chunk.active = false;
      if (chunk.retries-- <= 0) {
        this.stopChunks();
        return this.reject('upload');
      }

      this.uploadNextChunk();
    });
  }

  /**
   * Finish phase
   * Sends a request to the backend to finish the process
   */
  finish (): void {
    this.updateFileProgress();

    request({
      method: 'POST',
      headers: Object.assign({}, this.headers, {
        'Content-Type': 'application/json',
      }),
      url: this.action,
      body: Object.assign(this.finishBody, {
        phase: 'finish',
        session_id: this.sessionId,
      }),
    }).then((res: { status: string; }) => {
      this.file.response = res;
      if (res.status !== 'success') {
        return this.reject('server');
      }

      this.resolve(res);
    }).catch((res: any) => {
      this.file.response = res;
      this.reject('server');
    });
  }
}
