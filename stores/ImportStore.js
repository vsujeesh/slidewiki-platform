import {BaseStore} from 'fluxible/addons';

class ImportStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.isUploaded = false;
        this.file = null;
        this.base64 = null;
        this.filename = '';
        this.uploadProgress = 0;
        this.fileReadyForUpload = false;
    }
    destructor()
    {
        this.isUploaded = false;
        this.file = null;
        this.base64 = null;
        this.filename = '';
        this.uploadProgress = 0;
        this.fileReadyForUpload = false;
    }
    getState() {
        return {
            isUploaded: this.isUploaded,
            file: this.file,
            base64: this.base64,
            filename: this.filename,
            fileReadyForUpload: this.fileReadyForUpload,
            uploadProgress: this.uploadProgress
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.isUploaded = state.isUploaded;
        this.file = state.file;
        this.base64 = state.base64;
        this.filename = state.filename;
        this.fileReadyForUpload = state.fileReadyForUpload;
        this.uploadProgress = state.uploadProgress;
    }

    storeFile(payload) {
        console.log('ImportStore: storeFile()', payload);
        this.file = payload.file;
        this.base64 = payload.base64;
        this.filename = this.file.name;
        this.fileReadyForUpload = true;
        this.uploadProgress = 10;
        this.emitChange();
    }
    uploadFailed(error) {
        console.log('ImportStore: uploadFailed()', error);
        //TODO: show an error
        this.destructor();
        this.emitChange();
    }
    uploadSuccess(headers) {
        console.log('ImportStore: uploadSuccess()', headers);
        this.isUploaded = true;
        this.uploadProgress = 100;

        this.file = null;
        this.base64 = null;
        this.fileReadyForUpload = false;

        this.emitChange();
    }
    uploadStarted() {
        console.log('ImportStore: uploadStarted()');
        this.uploadProgress += 10;
        this.emitChange();
    }
    uploadMoreProgress(progress) {
        console.log('ImportStore: uploadMoreProgress()', progress);
        if (this.uploadProgress === 100)
            return;

        this.uploadProgress += progress;

        if (this.uploadProgress > 99)
            this.uploadProgress = 99;

        this.emitChange();
    }
}

ImportStore.storeName = 'ImportStore';
ImportStore.handlers = {
    'STORE_FILE': 'storeFile',
    'IMPORT_FINISHED': 'destructor',
    'UPLOAD_FAILED': 'uploadFailed',
    'UPLOAD_SUCCESS': 'uploadSuccess',
    'UPLOAD_STARTED': 'uploadStarted',
    'UPLOAD_MORE_PROGRESS': 'uploadMoreProgress'
};

export default ImportStore;
