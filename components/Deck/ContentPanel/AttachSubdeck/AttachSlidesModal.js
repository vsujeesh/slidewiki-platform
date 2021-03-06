import PropTypes from 'prop-types';
import React from 'react';
import {connectToStores} from 'fluxible-addons-react';
import {Button, Icon, Modal, Container, Segment, TextArea, Popup} from 'semantic-ui-react';
import UserProfileStore from '../../../../stores/UserProfileStore';
import AttachSubdeckModalStore from '../../../../stores/AttachSubdeckModalStore';
import DeckTreeStore from '../../../../stores/DeckTreeStore';
import FocusTrap from 'focus-trap-react';
import loadUserDecks from '../../../../actions/attachSubdeck/loadUserDecks';
import loadRecentDecks from '../../../../actions/attachSubdeck/loadRecentDecks';
import resetModalStore from '../../../../actions/attachSubdeck/resetModalStore';
import loadSlides from '../../../../actions/attachSubdeck/loadSlides';
import initModal from '../../../../actions/attachSubdeck/initModal';
import addTreeNodeListAndNavigate from '../../../../actions/decktree/addTreeNodeListAndNavigate';
import updateSelectedSlides from '../../../../actions/attachSubdeck/updateSelectedSlides';
import updateSelectedDeck from '../../../../actions/attachSubdeck/updateSelectedDeck';
import addActivities from '../../../../actions/activityfeed/addActivities';
import AttachMenu from './AttachMenu';
import AttachMyDecks from './AttachMyDecks';
import AttachSlideWiki from './AttachSlideWiki';
import AttachSearchForm from './AttachSearchForm';
import AttachSlides from './AttachSlides';
import {FormattedMessage, defineMessages} from 'react-intl';


class AttachSubdeckModal extends React.Component{
  /*Props expected:
    buttonStyle = {
      classNames : string ->additional clases for the trigger button
      iconSize:  enum {large|small} -> final size for displaying the icon of the button. Medium is not accepted by react-semantic-ui component

   }*/

    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            activeItem: 'MyDecks',
            activeTrap: false,
            selectedDeckId: -1,
            selectedSlides:[],
            showSlides:false,
            deckSlides:[],
        };

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.unmountTrap = this.unmountTrap.bind(this);
        this.handleAttachButton = this.handleAttachButton.bind(this);
        this.handleNextButton = this.handleNextButton.bind(this);
        this.handlePreviousButton = this.handlePreviousButton.bind(this);

        this.messages = defineMessages({
            attachText:{
                id: 'attachSlidesModal.attachText',
                defaultMessage: 'Attach Slides'
            },
            attach:{
                id: 'attachSlidesModal.attach',
                defaultMessage: 'Attach'
            },
            next:{
                id: 'attachSlidesModal.next',
                defaultMessage: 'Next'
            },
            previous:{
                id: 'attachSlidesModal.previous',
                defaultMessage: 'Previous'
            },
            cancel:{
                id: 'attachSlidesModal.cancel',
                defaultMessage: 'Cancel'    
            }

        });

    }

    componentWillReceiveProps(nextProps){

        this.setState({
            selectedDeckId: nextProps.AttachSubdeckModalStore.selectedDeckId,
            activeItem: nextProps.AttachSubdeckModalStore.activeItem,
            selectedSlides: nextProps.AttachSubdeckModalStore.selectedSlides,
            deckSlides:nextProps.AttachSubdeckModalStore.deckSlides
        });





    }
    componentWillUnmount(){
        this.context.executeAction(resetModalStore,[]);


    }

    handleOpen(){

      //fETCH USER DECKS
        let payload = {params:{
            id2:this.props.UserProfileStore.userid,
            id:this.props.UserProfileStore.userid,
            jwt:this.props.UserProfileStore.jwt,
            loggedInUser:this.props.UserProfileStore.username,
            username:this.props.UserProfileStore.username
        }};
        let payload2 = {params: {
            limit: 20,
            offset: 0
        }};
        this.context.executeAction(loadUserDecks, payload);
        this.context.executeAction(loadRecentDecks, payload2);
        let payload3  = {
            selectedDeckId:this.state.selectedDeckId,
            selectedDeckTitle:'First select the deck which contains the slides you wish to attach...'
        };
        this.context.executeAction(updateSelectedDeck,payload3);

        $('#app').attr('aria-hidden','true');
        this.setState({
            modalOpen:true,
            activeTrap:true
        });


    }

    handleClose(){

        $('#app').attr('aria-hidden','false');
        this.setState({
            modalOpen:false,
            activeTrap: false,
            activeItem: 'MyDecks',
            selectedSlides:[],
            showSlides:false

        });
        this.context.executeAction(initModal,[]);
    }

    unmountTrap(){
        if(this.state.activeTrap){
            this.setState({ activeTrap: false });
            $('#app').attr('aria-hidden','false');
        }

    }

    handleNextButton(){
        this.context.executeAction(loadSlides,{id:this.state.selectedDeckId});
        this.setState({
            showSlides:true
        });



    }
    handleAttachButton(){
        //selector: Object {id: "56", stype: "deck", sid: 67, spath: "67:2"}
        //nodeSec: Object { {type: "slide", id: 1245-2}, {type: "slide", id: 1585-2}}
        //each element of the payload.selectedSlides array is like 11225-2-6 (slideId-revisionId-orderInDeck)
        //we need to remove the order in Deck
        let nodeSpec = this.state.selectedSlides.map((slideIdWithOrder) => {
            let pos = slideIdWithOrder.lastIndexOf('-');
            let slideId = slideIdWithOrder.substring(0,pos);
            return {
                type:'slide',
                id:slideId
            };
        });
        this.context.executeAction(addTreeNodeListAndNavigate, {selector: this.props.selector, nodeSpec:nodeSpec, attach: true});

        //find target deck id
        let targetDeckId = this.props.selector.sid;
        if (this.props.selector.stype === 'slide') {
            const pathArray = this.props.selector.spath.split(';');
            if (pathArray.length > 1) {
                const parentDeck = pathArray[pathArray.length - 2];
                targetDeckId = parentDeck.split(':')[0];
            } else {
                targetDeckId = this.props.selector.id;
            }
        }
        
        let activities = nodeSpec.map((node) => {
            return {
                activity_type: 'use',
                user_id: String(this.props.UserProfileStore.userid),
                content_id: node.id,
                content_kind: 'slide',
                content_root_id: this.state.selectedDeckId,
                use_info: {
                    target_id:  targetDeckId,
                    target_name: this.getTitle(this.props.DeckTreeStore.deckTree, 'deck', targetDeckId)
                }
            };
        });

        this.context.executeAction(addActivities, {activities: activities});

        this.handleClose();

    }
    handlePreviousButton(){
        this.setState({
            showSlides:false
        });
        this.context.executeAction(updateSelectedSlides,{selectedSlides:[]},null);


    }

    //find node title
    getTitle(deckTree, type, id) {
        let title = '';
        if (deckTree.get('type') === type && deckTree.get('id') === id) {
            title = deckTree.get('title');
        } else if (deckTree.get('type') === 'deck') {
            deckTree.get('children').forEach((item, index) => {
                if (title === '') {
                    title = this.getTitle(item, type, id);
                }
            });
        }

        return title;
    }

    render() {

        //From my Decks option content
        let myDecksContent = <AttachMyDecks destinationDeckId={this.props.selector.id} actionButtonId={'#nextAttachModal'}/>;

        //From SlideWiki content
        let slideWikiContent = <AttachSlideWiki destinationDeckId={this.props.selector.id} actionButtonId={'#nextAttachModal'}/>;

        let segmentPanelContent;
        let searchForm;
        let actionButton;
        let actionButton2;
        let attachMenu;
        let modalDescription;


        if(!this.state.showSlides){//no deck selected, displaying next button
            attachMenu = <AttachMenu activeItem={this.state.activeItem}/>;

            modalDescription = <p><FormattedMessage id='slidesModal.attachSlidesDescriptionStep1' defaultMessage='You can attach one or more slides from another deck. First select your deck containing the slides or search SlideWiki for a deck. We advise a maximum of 50 slides per (sub)deck for maximal performance/speed for viewing your presentation. You can also separate a large presentation, for example, a series of lectures, into a deck collection.' />
            <TextArea className="sr-only" id="attachSlidesDescriptionSR" value="You can attach one or more slides from another deck. First select your deck containing the slides or search SlideWiki for a deck. We advise a maximum of 50 slides per (sub)deck for maximal performance/speed for viewing your presentation. You can also separate a large presentation, for example, a series of lectures, into a deck collection." tabIndex ='-1'/></p>;

            if (this.state.activeItem === 'MyDecks'){
                searchForm ='';
                segmentPanelContent = myDecksContent;

            }else{
                searchForm =  <AttachSearchForm />;
                segmentPanelContent = slideWikiContent;
            }

            actionButton = <Button id="nextAttachModal" color="green" icon tabIndex="0" type="button" aria-label="Next Select slides"
                              data-tooltip={this.context.intl.formatMessage(this.messages.next)} disabled={this.state.selectedDeckId===-1} onClick={this.handleNextButton}>
                               <Icon name="arrow right"/>
                               {this.context.intl.formatMessage(this.messages.next)}
                               <Icon name="arrow right"/>
                            </Button>;
            actionButton2='';
        } else{ //deck selected, diplay its slides, previous and attach button
            attachMenu ='';
            searchForm ='';
            modalDescription= <p><FormattedMessage id='slidesModal.attachSlidesDescriptionStep2' defaultMessage='Select slides to attach. We advise a maximum of 50 slides per (sub)deck for maximal performance/speed for viewing your presentation. You can also separate a large presentation, for example, a series of lectures, into a deck collection.' />
            <TextArea className="sr-only" id="attachSlidesDescriptionSR" value="Select slides to attach. We advise a maximum of 50 slides per (sub)deck for maximal performance/speed for viewing your presentation. You can also separate a large presentation, for example, a series of lectures, into a deck collection." tabIndex ='-1'/></p>;
            //<TextArea className="sr-only" id="attachSlidesDescription" value="Select slides to attach" tabIndex ='-1'/>;

            segmentPanelContent = <AttachSlides numColumns="3" />;
            actionButton = <Button id="attachAttachModal" color="green" icon tabIndex="0" type="button" aria-label={this.context.intl.formatMessage(this.messages.attach)}
                            data-tooltip={this.context.intl.formatMessage(this.messages.attach)} disabled={this.state.selectedSlides.length===0} onClick={this.handleAttachButton}>
                             <Icon name="attach"/>
                             {this.context.intl.formatMessage(this.messages.attach)}
                             <Icon name="attach"/>
                          </Button>;
            actionButton2 =<Button id="previousAttachModal" color="green" icon tabIndex="0" type="button" aria-label={this.context.intl.formatMessage(this.messages.previous)}
                            data-tooltip={this.context.intl.formatMessage(this.messages.previous)} onClick={this.handlePreviousButton}>
                             <Icon name="arrow left"/>
                             {this.context.intl.formatMessage(this.messages.previous)}
                             <Icon name="arrow left"/>
                          </Button>;

        }

        let attachSlideBtn = <Popup trigger={<Button as="button" className={this.props.buttonStyle.classNames}
                                                     type="button" aria-label={this.context.intl.formatMessage(this.messages.attachText)}
                                                     aria-hidden={this.state.modalOpen}
                                                     basic onClick={this.handleOpen}
                                                     tabIndex={this.props.buttonStyle.noTabIndex ? -1 : 0}>
            <Icon.Group size={this.props.buttonStyle.iconSize}>
                <Icon className="grey" name="file alternate outline"/>
                <Icon className="corner black" name="attach"/>
            </Icon.Group>
        </Button>} content={this.context.intl.formatMessage(this.messages.attachText)} on='hover'/>;


        return (
           <Modal trigger={attachSlideBtn}
                open={this.state.modalOpen}
                onClose={this.handleClose}
                role="dialog"
                id="attachSlidesModal"
                aria-labelledby="attachModalHeader"
                aria-describedby="attachSlidesDescriptionSR"
                aria-hidden = {!this.state.modalOpen}
                tabIndex="0">
                <FocusTrap
                        id="focus-trap-attachSlidesModal"
                        focusTrapOptions={{
                            onDeactivate: this.unmountTrap,
                            clickOutsideDeactivates: true,
                            initialFocus: '#tabMyDecksId'
                        }}
                        active={this.state.activeTrap}
                        className = "header">

                <Modal.Header className="ui center aligned" as="h1" id="attachModalHeader">
                    {this.context.intl.formatMessage(this.messages.attachText)}
                </Modal.Header>
                <Modal.Content>
                    <Container text>
                         {modalDescription}
                         <Segment color="blue" textAlign="center" padded>
                            {attachMenu}
                            <Segment attached="bottom" textAlign="left" role="tabpanel">

                               {searchForm}
                               {segmentPanelContent}
                            </Segment>
                            <Modal.Actions>
                              {actionButton}
                              {actionButton2}
                              <Button id="cancelAttachModal" color="red" tabIndex="0" type="button" aria-label={this.context.intl.formatMessage(this.messages.cancel)} data-tooltip={this.context.intl.formatMessage(this.messages.cancel)} onClick={this.handleClose} >
                              {this.context.intl.formatMessage(this.messages.cancel)}
                              </Button>
                            </Modal.Actions>
                         </Segment>
                   </Container>
                </Modal.Content>

                </FocusTrap>
            </Modal>

        );
    }

}


AttachSubdeckModal.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired
};

AttachSubdeckModal = connectToStores(AttachSubdeckModal,[UserProfileStore,AttachSubdeckModalStore,DeckTreeStore],(context,props) => {
    return {
        UserProfileStore: context.getStore(UserProfileStore).getState(),
        AttachSubdeckModalStore: context.getStore(AttachSubdeckModalStore).getState(),
        DeckTreeStore: context.getStore(DeckTreeStore).getState()
    };
});

export default AttachSubdeckModal;
