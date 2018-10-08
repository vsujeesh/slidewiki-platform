import {BaseStore} from 'fluxible/addons';
import { isEmpty } from '../common.js';
import { isNullOrUndefined } from 'util';

class AttachQuestionsModalStore extends BaseStore{
    constructor(dispatcher) {
        super(dispatcher);
        this.userDecks = [];
        this.recentDecks = [];
        this.searchDecks =[];
        this.selectedDeckTitle = ''; /*nikki 'Select the deck you wish to attach...'; */
        this.selectedDeckId =-1;
        this.showSearchResults = false;
        this.showQuestions = false; /*nikki changed away from true */
        this.showOptions = false;
        this.activeItem = 'CurrentDeck';
        //this.selectedSlides = [];
        this.deckSlides =[];
        this.deckQuestions = [];
        this.selectedQuestions = []; /*nikki for storing the questions that have been selected for insertion */
        this.currentDeckId = '';
        this.currentDeckTitle = '';
        this.questionsCount = '';
        this.embedOptions = {
            title: '',
            showNumbers: false,
            showAnswers: false,
            showExplanation: false,
        };
    }

    getState(){ //should this be getInitialState?
        return {
            userDecks : this.userDecks,
            recentDecks: this.recentDecks,
            searchDecks: this.searchDecks,
            selectedDeckTitle: this.selectedDeckTitle,
            selectedDeckId: this.selectedDeckId,
            showSearchResults: this.showSearchResults,
            showQuestions: this.showQuestions,
            showOptions: this.showOptions,
            activeItem: this.activeItem,
        //    selectedSlides:this.selectedSlides,
            deckSlides: this.deckSlides,
            deckQuestions: this.deckQuestions,
            deckQuestionsCount: this.deckQuestionsCount,
            selectedQuestions: this.selectedQuestions,
            questionsCount: this.questionsCount,
            embedOptions: this.embedOptions,
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.userDecks = state.userDecks;
        this.recentDecks = state.recentDecks;
        this.searchDecks = state.searchDecks;
        this.selectedDeckTitle = state.selectedDeckTitle;
        this.selectedDeckId = state.selectedDeckId;
        this.showSearchResults = state.showSearchResults;
        this.showQuestions = state.showQuestions;
        this.showOptions = state.showOptions;
        this.activeItem = state.activeItem;
     //   this.selectedSlides = state.selectedSlides;
        this.deckSlides = state.deckSlides;
        this.deckQuestions = state.deckQuestions;
        this.deckQuestionsCount = state.deckQuestionsCount;
        this.selectedQuestions = state.selectedQuestions;
        this.questionsCount = state.questionsCount;//nikki 
    }
    resetModalStore(){
        this.userDecks = [];
        this.recentDecks = [];
        this.searchDecks = [];
        this.selectedDeckTitle = ''; /*nikki 'Select the deck you wish to attach...'; */
        this.selectedDeckId = -1;
        this.showSearchResults = false;
        this.showQuestions = false; 
        this.showOptions = false;
        this.activeItem = 'CurrentDeck';
     //   this.selectedSlides = [];
        this.deckSlides = [];
        this.deckQuestions = [];
        this.deckQuestionsCount = '';
        this.selectedQuestions = [];
        this.questionsCount = '';//nikki 
        this.embedOptions = {
            title: '',
            showNumbers: false,
            showAnswers: false,
            showExplanation: false,
        };

        this.emitChange();
    }
    initModal(){
        this.selectedDeckTitle = ''; /*nikki 'Select the deck you wish to attach...'; */
        this.selectedDeckId = -1;
        this.showSearchResults = false;
        this.showQuestions = false;
        this.showOptions = false;
        this.activeItem = 'CurrentDeck';
    //    this.selectedSlides = [];
        this.deckSlides = [];
        this.deckQuestions = [];
        this.deckQuestionsCount = ''; 
        this.selectedQuestions = []; 
        this.embedOptions = {
            title: '',
            showNumbers: false,
            showAnswers: false,
            showExplanation: false,
        }; //is this needed in this bit?
    
        this.emitChange();
    }

    updateUserDecks(payload){
        this.userDecks = payload;
        this.emitChange();
    }

    updateSelectedDeck(payload){/*nikki still necessary for then loading the questions from the selectedDeckId */
        this.selectedDeckTitle = payload.selectedDeckTitle;
        this.selectedDeckId = payload.selectedDeckId;
        this.emitChange();
    }

    updateRecentDecks(payload){ /*nikki what is this used for? used for the search form*/
        if(payload.recent===[]){
            this.recentDecks =[];
        } else{
            let recentDecks = payload.recent.map((deck) => {

                return({
                    title: !isEmpty(deck.title) ? deck.title : 'No Title',
                    picture: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Business_presentation_byVectorOpenStock.jpg',
                    description: deck.description,
                    //updated: !isEmpty(deck.lastUpdate) ? deck.lastUpdate : (new Date()).setTime(1).toISOString(),
                    updated:deck.lastUpdate,
                    //creationDate: !isEmpty(deck.timestamp) ? deck.timestamp : (new Date()).setTime(1).toISOString(),
                    creationDate: deck.timestamp,
                    deckID: deck._id,
                    theme: deck.theme,
                    firstSlide: deck.firstSlide,
                    language:deck.language,
                    countRevisions:deck.countRevisions,
                    deckCreatorid:deck.user,
                    deckCreator:deck.username,
                    questionsCount: deck.questionsCount,
                });

            }); //map
            this.recentDecks = recentDecks;
        }
        this.emitChange();
    }

    updateSearchDecks(payload){
        if((payload.docs===[])||(typeof payload.docs === 'undefined')){
            this.searchDecks =[];
            this.showSearchResults = true;
        }else{
            let searchDecks = payload.docs.map((deck) => {
                return({
                    title: !isEmpty(deck.title) ? deck.title : 'No Title',
                    picture: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Business_presentation_byVectorOpenStock.jpg',
                    description: deck.description,
                    updated:deck.lastUpdate,
                    creationDate: deck.timestamp,
                    deckID: deck.db_id,
                    theme: deck.theme,
                    firstSlide: deck.firstSlide,
                    language:deck.language,
                    countRevisions:deck.revisionCount,
                    deckCreatorid:deck.creator,
                    deckCreator:deck.user.username,
                    questionsCount: deck.questionsCount,
                });
            });//map

            this.searchDecks = searchDecks;
            this.showSearchResults = true;
        }
        this.emitChange();
    }

    updateActiveItem(payload){

        this.activeItem = payload.activeItem;
        //this.showQuestions = payload.showQuestions;
        this.emitChange();
    }

    updateShowQuestions(payload){
        if (isNullOrUndefined(payload)){
            console.log('undefined');
        } else {
            this.showQuestions = payload;
        }
        this.emitChange();
    }

    updateShowOptions(payload){
        if (payload===true){
            this.showOptions = true;
        }
        else {
            this.showOptions = false;
        }
        this.emitChange();
    }

    updateDeckSlides(payload){ /*nikki is this still needed? */
        if((payload.slides===[])||(typeof payload.slides === 'undefined')){
            this.deckSlides =[];
        }else{
            this.deckSlides = payload.slides.map((slide) => ({
                id: slide.id,
                title: slide.title,
                theme: slide.theme,
            }));
        }
        this.emitChange();
    }
    updateDeckQuestions(payload){
/*nikki should i add the logic back in?*/
        if((payload === [])||(typeof payload === 'undefined')){
            this.deckQuestions = [];
            this.deckQuestionsCount = 0;
        }else{
            this.deckQuestions = payload.questions;
            this.deckQuestionsCount = this.deckQuestions.length;
        }
        this.emitChange();
    }

    getQuestionsCount(payload){
        this.questionsCount = payload.count;
        this.emitChange();
    }

    updateSelectedQuestions(payload){
/*nikki add code in here */
        if((payload.selectedQuestions===[])||(typeof payload.selectedQuestions === 'undefined')){
            this.selectedQuestions =[];
        }else{
            this.selectedQuestions = payload.selectedQuestions;
            console.log(payload.selectedQuestions);
        }
        this.emitChange();  
    }

    updateOptions(payload){
        //gets payload type (option) and the value?
        //options.title , options.showAnswers , options.showExplanation
        console.log(payload);
        switch(payload.option){
            case 'title':
                //update here
                this.embedOptions.title = payload.value;
                break;
            case 'showNumbers':
                this.embedOptions.showNumbers = payload.value;
                break;
            case 'showAnswers':
                this.embedOptions.showAnswers = payload.value;
                break;
            case 'showExplanation':
                this.embedOptions.showExplanation = payload.value;
                break;
            default:
                //does it need anything here?
                break;
        }
        console.log(this.embedOptions);
        this.emitChange();
    }
/* nikki - remove this?    updateSelectedSlides(payload){
        if((payload.selectedSlides===[])||(typeof payload.selectedSlides === 'undefined')){
            this.selectedSlides =[];
        }else{
            this.selectedSlides = payload.selectedSlides;
        }

        this.emitChange();
    }
*/ 

}
AttachQuestionsModalStore.storeName = 'AttachQuestionsModalStore';
AttachQuestionsModalStore.handlers = {
    'ATTACHQUESTIONS_LOAD_USERDECKS' : 'updateUserDecks',
    'ATTACHQUESTIONS_SELECTED_DECK' : 'updateSelectedDeck',
    'ATTACHQUESTIONS_LOAD_RECENTDECKS': 'updateRecentDecks',
    'ATTACHQUESTIONS_LOAD_SEARCHDECKS' : 'updateSearchDecks',
    'ATTACHQUESTIONS_RESET':'resetModalStore',
    'ATTACHQUESTIONS_INIT' :'initModal',
    'ATTACHQUESTIONS_ACTIVE_ITEM' :'updateActiveItem',
    'ATTACHQUESTIONS_LOAD_SLIDES' : 'updateDeckSlides', /*nikki remove this? */
    'ATTACHQUESTIONS_LOAD_QUESTIONS' : 'updateDeckQuestions', //new
    'ATTACHQUESTIONS_SELECTED_QUESTIONS' : 'updateSelectedQuestions', //new
    'ATTACHQUESTIONS_SHOW_QUESTIONS' : 'updateShowQuestions', //new
    'ATTACHQUESTIONS_SHOW_OPTIONS'  : 'updateShowOptions',  //new
    'ATTACHQUESTIONS_QUESTIONS_COUNT': 'getQuestionsCount', //new
    'ATTACHQUESTIONS_UPDATE_OPTIONS': 'updateOptions',
//    'ATTACHQUESTIONS_SELECTED_SLIDES' :'updateSelectedSlides'
};

export default AttachQuestionsModalStore;
