import {BaseStore} from 'fluxible/addons';

class SlideEditStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.id = '';
        this.slideId = '';
        this.title = '';
        this.LeftPanelTitleChange = false;
        this.content = '';
        this.markdown = '';
        this.speakernotes = '';
        this.scaleratio = 1; //default no scale ratio
        this.template = '';
        this.embedQuestionsClick = 'false';
        this.embedQuestionsContent = ''; //contains the content for the question embedding
        this.slideSize = '';
        this.slideTransition = '';
        this.transitionType = '';
	    this.slideSizeText = '';
        this.saveSlideClick = 'false';
        this.cancelClick = 'false';
        this.selector = '';
        this.undoClick = 'false';
        this.redoClick = 'false';
        this.addInputBox = 'false';
        this.uploadMediaClick = 'false';
        this.uploadVideoClick = 'false';
        this.tableClick = 'false';
        this.annotateClick = 'false';
        this.mathsClick = 'false';
        this.codeClick = 'false';
        this.removeBackgroundClick = 'false';
        this.embedClick = 'false';
        this.embedWidth = '';
        this.embedHeight = '';
        this.embedURL = '';
        this.embedCode = '';
        this.ltiClick = 'false';
        this.ltiWidth = '';
        this.ltiHeight = '';
        this.ltiURL = '';
        this.ltiKey = '';
        this.ltiResponseURL = '',
        this.ltiResponseHTML = '',
        this.embedTitle = '';
        this.HTMLEditorClick = 'false';
        this.scaleRatio = null;
        this.contentEditorFocus = 'false';
        this.annotations = [];
        /* Whether there are unsaved changes in editor. */
        this.hasChanges = false;
        this.refreshEditor = 'false';
    }
    updateContent(payload) {
        this.id = payload.slide.id;
        this.slideId = payload.selector.sid;
        this.title = payload.slide.title || ' ';
        this.content = payload.slide.content || ' ';
        this.markdown = payload.slide.markdown || ' ';
        this.speakernotes = payload.slide.speakernotes || ' ';
        this.annotations = payload.slide.annotations || [];

        this.hasChanges = false;

        this.emitChange();
    }

    saveSlide() {
        this.emitChange();
    }

    addSlide() {
        this.emitChange();
    }

    changeTemplate(payload){
        this.template = payload.template;
        this.emitChange();
        this.template = '';
        this.emitChange();
    }

    changeSlideSize(payload){
        this.slideSize = payload.slideSize;
        this.emitChange();
        this.slideSize = '';
        this.emitChange();
    }

    changeSlideTransition(payload){
        this.slideTransition = payload.slideTransition;
        // this.transitionType = payload.transitionType;
        this.emitChange();
    }

    changeSlideSizeText(payload){
        this.slideSizeText = payload.slideSizeText;
        this.emitChange();
    }

    handleSaveSlideClick(){
        this.saveSlideClick = 'true';
        this.emitChange();
        this.saveSlideClick = 'false';
        this.emitChange();
    }

    handleCancelClick(payload){
        this.selector = payload.selector;
        this.cancelClick = 'true';
        this.emitChange();
        this.cancelClick = 'false';
        this.emitChange();
    }

    handleUndoClick(){
        this.undoClick = 'true';
        this.emitChange();
        this.undoClick = 'false';
        this.emitChange();
    }

    handleRedoClick(){
        this.redoClick = 'true';
        this.emitChange();
        this.redoClick = 'false';
        this.emitChange();
    }

    handleAddInputBox(){
        this.addInputBox = 'true';
        this.emitChange();
        this.addInputBox = 'false';
        this.emitChange();
    }

    handleUploadMedia(){
        this.uploadMediaClick = 'true';
        this.emitChange();
        this.uploadMediaClick = 'false';
        this.emitChange();
    }

    handleuploadVideoClick(){
        this.uploadVideoClick = 'true';
        this.emitChange();
        this.uploadVideoClick = 'false';
        this.emitChange();
    }

    handleTableClick(){
        this.tableClick = 'true';
        this.emitChange();
        this.tableClick = 'false';
        this.emitChange();
    }

    handleAnnotateClick(){
        this.annotateClick = 'true';
        this.emitChange();
        this.annotateClick = 'false';
        this.emitChange();
    }

    handleMathsClick(){
        this.mathsClick = 'true';
        this.emitChange();
        this.mathsClick = 'false';
        this.emitChange();
    }

    handleCodeClick(){
        this.codeClick = 'true';
        this.emitChange();
        this.codeClick = 'false';
        this.emitChange();
    }

    handleRemoveBackgroundClick(){
        this.removeBackgroundClick = 'true';
        this.emitChange();
        this.removeBackgroundClick = 'false';
        this.emitChange();
    }

    handleEmbedClick(payload){
        this.embedClick = 'true';
        this.embedWidth = payload.embedWidth;
        this.embedHeight = payload.embedHeight;
        this.embedURL = payload.embedURL;
        this.embedCode = payload.embedCode;
        this.embedTitle = payload.embedTitle;
        this.emitChange();
        this.embedClick = 'false';
        this.embedWidth = '';
        this.embedHeight = '';
        this.embedURL = '';
        this.embedCode = '';
        this.embedTitle = '';
        this.emitChange();
    }

    changeTitle(payload){
        this.title = payload.title;
        this.LeftPanelTitleChange = payload.LeftPanelTitleChange;
        this.emitChange();
    }

    handleHTMLEditorClick(){
        this.HTMLEditorClick = 'true';
        this.emitChange();
        this.HTMLEditorClick = 'false';
        this.emitChange();
    }
    handleLTIAddClick(payload){
        this.ltiURL = payload.ltiURL;
        this.ltiKey = payload.ltiKey;
        this.ltiWidth = payload.ltiWidth;
        this.ltiHeight = payload.ltiHeight;
        this.ltiResponseURL = payload.ltiResponseURL;
        this.ltiResponseHTML = payload.ltiResponseHTML;
        this.ltiClick = 'true';
        this.emitChange();
        this.ltiClick = 'false';
        this.emitChange();
    }
    handleEmbedQuestions(payload){
        //embedQuestionsContent - this is the content that will be embedded (questions and options)
        //embedQuestions - this will be the trigger that causes the questions to be embedded.
        //add some form of logic/error handling here?
        this.embedQuestionsContent = payload;
        this.embedQuestionsClick = 'true';
        this.emitChange();

        this.embedQuestionsClick = 'false';
        this.embedQuestionsContent = '';
    }
    handleContentEditorFocus(payload) {
        this.contentEditorFocus = payload.focus;
        this.emitChange();
    }
    updateSlideContentAfterTranslation(payload){
        this.content = payload.translations.translations;
        this.emitChange();
        this.refreshEditor = 'true';
        this.emitChange();
        this.refreshEditor = 'false';
        this.emitChange();
    }
    getState() {
        return {
            id: this.id,
            slideId: this.slideId,
            title: this.title,
            LeftPanelTitleChange: this.LeftPanelTitleChange,
            content: this.content,
            markdown: this.markdown,
            speakernotes: this.speakernotes,
            scaleratio: this.scaleratio,
            saveSlideClick: this.saveSlideClick,
            cancelClick: this.cancelClick,
            selector: this.selector,
            undoClick: this.undoClick,
            redoClick: this.redoClick,
            template: this.template,
            embedQuestionsClick: this.embedQuestionsClick,
            embedQuestionsContent: this.embedQuestionsContent,
            slideSize: this.slideSize,
            slideTransition: this.slideTransition,
            transitionType: this.transitionType,
            slideSizeText: this.slideSizeText,
            addInputBox: this.addInputBox,
            uploadMediaClick: this.uploadMediaClick,
            uploadVideoClick: this.uploadVideoClick,
            tableClick: this.tableClick,
            annotateClick: this.annotateClick,
            mathsClick: this.mathsClick,
            codeClick: this.codeClick,
            removeBackgroundClick: this.removeBackgroundClick,
            embedClick: this.embedClick,
            embedURL: this.embedURL,
            embedCode: this.embedCode,
            embedTitle: this.embedTitle,
            embedWidth: this.embedWidth,
            embedHeight: this.embedHeight,
            ltiClick: this.ltiClick,
            ltiURL: this.ltiURL,
            ltiKey: this.ltiKey,
            ltiWidth: this.ltiWidth,
            ltiHeight: this.ltiHeight,
            ltiResponseURL: this.ltiResponseURL,
            ltiResponseHTML: this.ltiResponseHTML,
            HTMLEditorClick: this.HTMLEditorClick,
            scaleRatio: this.scaleRatio,
            contentEditorFocus: this.contentEditorFocus,
            annotations: this.annotations,
            hasChanges: this.hasChanges,
            refreshEditor: this.refreshEditor
        };
    }

    dehydrate() {
        return this.getState();
    }

    rehydrate(state) {
        this.id = state.id;
        this.slideId = state.slideId;
        this.title = state.title;
        this.LeftPanelTitleChange = state.LeftPanelTitleChange;
        this.content = state.content;
        this.markdown = state.markdown;
        this.speakernotes = state.speakernotes;
        this.scaleratio = state.scaleratio;
        this.saveSlideClick = state.saveSlideClick;
        this.cancelClick = state.cancelClick;
        this.selector = state.selector;
        this.undoClick = state.undoClick;
        this.redoClick = state.redoClick;
        this.template = state.template;
        this.embedQuestionsClick = state.embedQuestionsClick;
        this.embedQuestionsContent = state.embedQuestionsContent;
        this.slideSize = state.slideSize;
        this.slideTransition = state.slideTransition;
        this.transitionType = state.transitionType;
        this.slideSizeText = state.slideSizeText;
        this.addInputBox = state.addInputBox;
        this.uploadMediaClick = state.uploadMediaClick;
        this.uploadVideoClick = state.uploadVideoClick;
        this.tableClick = state.tableClick;
        this.annotateClick = state.annotateClick;
        this.mathsClick = state.mathsClick;
        this.codeClick = state.codeClick;
        this.removeBackgroundClick = state.removeBackgroundClick;
        this.embedClick = state.embedClick;
        this.embedURL = state.embedURL;
        this.embedCode = state.embedCode;
        this.embedTitle = state.embedTitle;
        this.embedWidth = state.embedWidth;
        this.embedHeight = state.embedHeight;
        this.ltiClick = state.ltiClick;
        this.ltiURL = state.ltiURL;
        this.ltiKey = state.ltiKey;
        this.ltiWidth = state.ltiWidth;
        this.ltiHeight = state.ltiHeight;
        this.ltiResponseURL = state.ltiResponseURL;
        this.ltiResponseHTML = state.ltiResponseHTML;
        this.HTMLEditorClick = state.HTMLEditorClick;
        this.scaleRatio = state.scaleRatio = 1;
        this.contentEditorFocus = state.contentEditorFocus;
        this.annotations = state.annotations;
        this.hasChanges = state.hasChanges;
        this.refreshEditor = state.refreshEditor;
    }

    zoomContent(payload) {
        if (!this.scaleRatio) {
            this.scaleRatio = 1;
        }

        if (payload.mode === 'edit') {
            switch (payload.direction) {
                case 'in':
                    this.scaleRatio += 0.25;
                    break;

                case 'out':
                    this.scaleRatio -= 0.25;
                    break;

                case 'reset':
                    this.scaleRatio = 1;
                    break;
            }
        }
        this.emitChange();
    }

    registerChange(payload) {
        this.hasChanges = payload.hasChanges;
        this.emitChange();
    }
}

SlideEditStore.storeName = 'SlideEditStore';
SlideEditStore.handlers = {
    'LOAD_SLIDE_EDIT_SUCCESS': 'updateContent',
    'SAVE_SLIDE_EDIT_SUCCESS': 'saveSlide',
    'ADD_SLIDE_EDIT_SUCCESS': 'addSlide',
    'SAVE_SLIDE_CLICK': 'handleSaveSlideClick',
    'CANCEL_CLICK': 'handleCancelClick',
    'CHANGE_TEMPLATE': 'changeTemplate',
    'CHANGE_SLIDE_SIZE': 'changeSlideSize',
    'CHANGE_SLIDE_TRANSITION': 'changeSlideTransition',
    'CHANGE_SLIDE_SIZE_TEXT': 'changeSlideSizeText',
    'ADD_INPUT_BOX': 'handleAddInputBox',
    'UPLOAD_MEDIA_CLICK': 'handleUploadMedia',
    'UPLOAD_VIDEO_CLICK': 'handleuploadVideoClick',
    'TABLE_CLICK': 'handleTableClick',
    'ANNOTATE_CLICK': 'handleAnnotateClick',
    'MATHS_CLICK': 'handleMathsClick',
    'CODE_CLICK': 'handleCodeClick',
    'REMOVE_BACKGROUND_CLICK': 'handleRemoveBackgroundClick',
    'EMBED_CLICK': 'handleEmbedClick',
    'ADD_LTI_SUCCESS': 'handleLTIAddClick',
    'CHANGE_TITLE': 'changeTitle',
    'HTML_EDITOR_CLICK': 'handleHTMLEditorClick',
    'SLIDE_EMBED_QUESTIONS': 'handleEmbedQuestions',
    'UNDO_CLICK': 'handleUndoClick',
    'REDO_CLICK': 'handleRedoClick',
    'ZOOM': 'zoomContent',
    'CONTENT_EDITOR_FOCUS': 'handleContentEditorFocus',
    'REGISTER_CHANGE': 'registerChange',
    'UPDATE_SLIDE_CONTENT_AFTER_TRANSLATION': 'updateSlideContentAfterTranslation',
};

export default SlideEditStore;
