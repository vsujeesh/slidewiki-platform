import PropTypes from 'prop-types';
import React from 'react';
import { connectToStores } from 'fluxible-addons-react';
import { navigateAction } from 'fluxible-router';
import { Microservices } from '../../configs/microservices';
import AddDeckStore from '../../stores/AddDeckStore';
import UserProfileStore from '../../stores/UserProfileStore';
import ImportStore from '../../stores/ImportStore';
import addDeckShowWrongFields from '../../actions/addDeck/addDeckShowWrongFields';
import addDeckSaveDeck from '../../actions/addDeck/addDeckSaveDeck';
import addDeckDestruct from '../../actions/addDeck/addDeckDestruct';
import addDeckDeleteError from '../../actions/addDeck/addDeckDeleteError';
import checkNoOfSlides from '../../actions/addDeck/checkNoOfSlides';
import importCanceled from '../../actions/import/importCanceled';
import importFinished from '../../actions/import/importFinished';
import uploadFile from '../../actions/import/uploadFile';
import storeTags from '../../actions/import/storeTags';
import addActivity from '../../actions/activityfeed/addActivity';
import publishDeck from '../../actions/addDeck/publishDeck';
import ImportModal from '../Import/ImportModal';
import TagInput from '../Deck/ContentModulesPanel/TagsPanel/TagInput';

import {Message} from 'semantic-ui-react';
import { FormattedMessage, defineMessages } from 'react-intl';
import classNames from 'classnames';


import { educationLevels } from '../../lib/isced';
import SWAutoComplete from '../common/SWAutoComplete';
import {getLanguageDisplayName, translationLanguages} from '../../common';

//TODO: update link to terms of use;

class AddDeck extends React.Component {
    constructor(props) {
        super(props);
        this.percentage = 0;

        this.state = {
            language: null,
            educationLevel: null,
            formValidationErrors: []
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.defaultTagNames = [];// used for saving defaultName properties for tags
    }
    componentDidMount() {
    }
    componentDidUpdate() {
        if (this.props.ImportStore.uploadProgress > 0 || (this.props.ImportStore.filename !== '' && this.props.ImportStore.uploadProgress === 100))
            this.updateProgressBar();

        if (this.props.ImportStore.error !== null)
            this.showError();
    }
    handleKeyPressUploadModal(event) {
        if (event.key === 'Enter') {
            this.handleUploadModal(event);
        }
    }
    handleUploadModal(x) {
        $('.ui.small.modal').modal('show');
    }
    handleKeyPressAddDeck(event) {
        if (event.key === 'Enter') {
            this.handleAddDeck(event);
        }
    }
    handleAddDeck(x) {
        //console.log('handleAddDeck');
        this.saveTags();

        this.context.executeAction(addDeckDeleteError, null);

        // Clear any existing validation errors.
        this.state.formValidationErrors = [];

        //validate input
        const title = this.refs.input_title.value;
        const language = this.state.language;
        const description = this.refs.textarea_description.value;
        const theme = this.refs.select_themes.value;
        const educationLevel = this.state.educationLevel;
        const license = 'CC BY-SA';//default license
        let tags = [...this.tagInput.getSelected(), ...this.topicInput.getSelected()];
        tags.forEach((tag) => {
            // check whether we have earlier assigned defaultName to tagName (in saveTags function) for this tag and restore the original state
            if (this.defaultTagNames.includes(tag.tagName)) {
                tag.defaultName = tag.tagName;
                delete tag.tagName;
            }
        });
        const acceptedConditions = this.refs.checkbox_conditions.checked;
        const acceptedImagesLicense = this.refs.checkbox_imageslicense.checked;

        // Validate title
        if (!title) this.state.formValidationErrors.title = <FormattedMessage
            id='AddDeck.error.validation.title'
            defaultMessage='Specify a title.'
            tagName='span'
        />;

        // Validate language
        if (!language || language.length < 2) this.state.formValidationErrors.language = <FormattedMessage
            id='AddDeck.error.validation.language'
            defaultMessage='Specify a language.'
            tagName='span'
        />;

        // Validate T&Cs acceptance
        if (acceptedConditions === false) this.state.formValidationErrors.conditions = <FormattedMessage
            id='AddDeck.error.validation.conditions'
            defaultMessage='You must agree to the SlideWiki terms and conditions.'
            tagName='span'
        />;

        // Validate image rights declaration
        if (acceptedImagesLicense === false)
            this.state.formValidationErrors.imagesLicence = <FormattedMessage
                id='AddDeck.error.validation.imagesLicence'
                defaultMessage='You must agree to the rights declaration.'
                tagName='span'
            />;

        // If there are no validation errors, then create the deck
        if(Object.keys(this.state.formValidationErrors).length === 0) {
            this.correctMetadata(title, language, description, theme, educationLevel, license, tags, acceptedConditions, acceptedImagesLicense);
        }
    }
    correctMetadata(title, language, description, theme, educationLevel, license, tags, acceptedConditions, acceptedImagesLicense) {
        if (this.props.ImportStore.filename !== '') {//import deck
            this.handleFileSubmit(title, language, description, theme, license, tags, acceptedConditions);
        } else {//create empty deck
            this.context.executeAction(addDeckSaveDeck, {
                title: title,
                language: language,
                description: description,
                theme: theme,
                educationLevel: educationLevel,
                license: license,
                tags: tags,
                deckId: this.props.ImportStore.deckId,
                selector: { id: this.props.ImportStore.deckId }
            });
        }
    }
    handleCancel(x) {
        //console.log('handleCancel: ', x);
        //TODO: check if there already inputs which should be stored?

        this.context.executeAction(addDeckDeleteError, null);
        this.context.executeAction(importFinished, {});  // destroy import components state
        this.context.executeAction(navigateAction, {
            url: '/'
        });
    }
    handleRedirect() {
        //console.log('AddDeck: handleRedirect()');
        this.context.executeAction(importFinished, {});  // destroy import components state
        this.context.executeAction(navigateAction, {
            url: '/deck/' + this.props.AddDeckStore.redirectID + '/_/deck/' + this.props.AddDeckStore.redirectID
        });
    }
    handleImportRedirect() {
        this.context.executeAction(importFinished, {});  // destroy import components state
        this.context.executeAction(navigateAction, {
            url: '/deck/' + this.props.ImportStore.deckId
        });
    }
    updateProgressBar() {
        const progress_messages = defineMessages({
            uploading: {
                id: 'AddDeck.progress.uploading',
                defaultMessage: 'Uploading file',
            },
            converting: {
                id: 'AddDeck.progress.converting',
                defaultMessage: 'Converting file',
            },
            importing: {
                id: 'AddDeck.progress.importing',
                defaultMessage: 'Importing slide ',
            },
            of: {
                id: 'AddDeck.progress.of',
                defaultMessage: ' of ',
            },
            uploaded: {
                id: 'AddDeck.progress.uploaded',
                defaultMessage: 'Slides uploaded!',
            },
            imported: {
                id: 'AddDeck.progress.imported',
                defaultMessage: 'Imported ',
            },
            slides: {
                id: 'AddDeck.progress.slides',
                defaultMessage: ' slides',
            }
        });
        $('#progressbar_addDeck_upload').progress('set percent', this.props.ImportStore.uploadProgress);
        let noOfSlides = String(this.props.ImportStore.noOfSlides);
        let totalNoOfSlides = String(this.props.ImportStore.totalNoOfSlides);
        let progressLabel = (totalNoOfSlides === '0' && this.props.ImportStore.uploadProgress < 65) ? this.context.intl.formatMessage(progress_messages.uploading) :
            (this.props.ImportStore.uploadProgress === 65) ? this.context.intl.formatMessage(progress_messages.converting) :
                (this.props.ImportStore.uploadProgress !== 100) ? this.context.intl.formatMessage(progress_messages.importing) + noOfSlides + this.context.intl.formatMessage(progress_messages.of) + totalNoOfSlides :
                    (noOfSlides === totalNoOfSlides) ? this.context.intl.formatMessage(progress_messages.uploaded) :
                        this.context.intl.formatMessage(progress_messages.imported) + noOfSlides + this.context.intl.formatMessage(progress_messages.of) + totalNoOfSlides + this.context.intl.formatMessage(progress_messages.slides);//this should not happen, but user should know in case it does
        $('#progresslabel_addDeck_upload').text(parseInt(this.props.ImportStore.uploadProgress) + '% - ' + progressLabel);

        if (this.props.ImportStore.uploadProgress === 100) {
            if (this.props.ImportStore.deckId !== null) {
                // createActivity
                let activity = {
                    activity_type: 'add',
                    user_id: String(this.props.UserProfileStore.userid),
                    content_id: String(this.props.ImportStore.deckId) + '-1',
                    content_name: this.refs.input_title.value,
                    content_owner_id: String(this.props.UserProfileStore.userid),
                    content_kind: 'deck'
                };
                context.executeAction(addActivity, { activity: activity });

                const success_messages = defineMessages({
                    success_title_text: {
                        id: 'AddDeck.swal.success_title_text',
                        defaultMessage: 'Deck created!',
                    },
                    success_text: {
                        id: 'AddDeck.swal.success_text',
                        defaultMessage: 'The selected file has been imported and a new deck has been created.',
                    },
                    preview_text: {
                        id: 'AddDeck.swal.preview_text',
                        defaultMessage: 'Here is a preview of your slides. It may take a few seconds for the images to be created. You can use the tab key to move through the images.',
                    },
                    success_text_extra: {
                        id: 'AddDeck.swal.success_text_extra',
                        defaultMessage: 'This new deck will not be visible to others in your decks page or in search results until published.',
                    },
                    success_confirm_text: {
                        id: 'AddDeck.swal.success_confirm_text',
                        defaultMessage: 'Complete import',
                    },
                    success_reject_text: {
                        id: 'AddDeck.swal.success_reject_text',
                        defaultMessage: 'Try again',
                    },
                    success_imported_slides_text: {
                        id: 'AddDeck.swal.success_imported_slides_text',
                        defaultMessage: 'Imported slides:',
                    },
                    success_publish_deck_text: {
                        id: 'AddDeck.swal.success_publish_deck_text',
                        defaultMessage: 'Publish your deck for it to show in search results immediately (publishing occurs after a few seconds)',
                    }
                });

                let imgStyle = '"border:1px solid black;border-radius:5px;margin-left:auto;margin-right:auto;display:block;width:100%;"';
                // let borderStyle = 'border:1px solid black;border-radius:5px;';
                //let html = this.context.intl.formatMessage(success_messages.success_text) + ' ' + this.context.intl.formatMessage(success_messages.preview_text) + '<br><br>' +
                let html = '<p style="text-align:left;">' + this.context.intl.formatMessage(success_messages.preview_text) + '</p><br><br>' +
                    '<div style="height: 260px;overflow: auto;" >' +
                    '<table><tr>';
                let slides = this.props.ImportStore.slides;
                for (let i = 0; i < slides.length; i++) {
                    let slide = slides[i];
                    let thumbnailAlt = 'Slide ' + (i + 1) + ': ';
                    if (slide.title !== undefined)
                        thumbnailAlt += slide.title;
                    let thumbnailSrc = Microservices.file.uri + '/thumbnail/slide/' + slide.id + '/' + (this.props.ImportStore.theme ? this.props.ImportStore.theme : 'default');
                    html += '<td style="padding: 15px;"><div style="width: 250px;" tabIndex="0">' +
                        'Slide ' + (i + 1) + '<img title="Title: ' + slide.title + '" style=' + imgStyle + ' src=' + thumbnailSrc + ' alt="' + thumbnailAlt + '" aria-hidden="true" />' +
                        '</div></td>'; //THUMBNAIL
                }
                html += '</tr></table></div>';
                html += '<h3><div class="ui checkbox" style="text-align:left"><input type="checkbox" tabIndex="0" id="checkbox_publish" ref="checkbox_publish" ><label for="checkbox_publish"> ' + this.context.intl.formatMessage(success_messages.success_publish_deck_text) + '</label></div></h3>';

                swal({
                    title: this.context.intl.formatMessage(success_messages.success_title_text),
                    text: this.context.intl.formatMessage(success_messages.success_text) +
                        '\n' + this.context.intl.formatMessage(success_messages.success_text_extra),
                    html: html,
                    type: 'success',
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: this.context.intl.formatMessage(success_messages.success_confirm_text),
                    confirmButtonClass: 'positive ui button',
                    cancelButtonText: this.context.intl.formatMessage(success_messages.success_reject_text),
                    cancelButtonClass: 'ui red button',
                    buttonsStyling: false,
                    allowOutsideClick: false
                }).then((accepted) => {
                    let checkboxPublish = $('#checkbox_publish')[0].checked;
                    if (checkboxPublish) {
                        //Publish the deck (set hidden to false)
                        let deckId = this.props.ImportStore.deckId;
                        let selector = {
                            id: deckId
                        };

                        this.context.executeAction(publishDeck, {
                            deckId: deckId,
                            title: this.props.ImportStore.title,
                            language: this.props.ImportStore.language,
                            description: this.props.ImportStore.description,
                            theme: this.props.ImportStore.theme,
                            license: this.props.ImportStore.license,
                            selector: selector,
                            hidden: false,
                        });
                    }
                    this.handleImportRedirect();

                    return true;
                }, (reason) => {
                    //Reset form
                    this.context.executeAction(importCanceled, {});  // destroy import components state
                    this.context.executeAction(addDeckDestruct, {});
                    this.initializeProgressBar();
                    this.refs.checkbox_conditions.checked = false;
                    this.refs.checkbox_imageslicense.checked = false;
                }).catch(() => {
                    return true;
                });
            } else {
                const error_messages = defineMessages({
                    error_title_text: {
                        id: 'AddDeck.swal.error_title_text',
                        defaultMessage: 'Error',
                    },
                    error_text: {
                        id: 'AddDeck.swal.error_text',
                        defaultMessage: 'There was a problem with importing this file. Please, try again.',
                    },
                    error_confirm_text: {
                        id: 'AddDeck.swal.error_confirm_text',
                        defaultMessage: 'Close',
                    }
                });
                swal({
                    title: this.context.intl.formatMessage(error_messages.error_title_text),
                    text: this.context.intl.formatMessage(error_messages.error_text),
                    type: 'error',
                    confirmButtonText: this.context.intl.formatMessage(error_messages.error_confirm_text),
                    confirmButtonClass: 'negative ui button',
                    buttonsStyling: false
                })
                    .then(() => {
                        return true;
                    })
                    .catch(() => {
                        return true;
                    });
            }
        }
    }
    initializeProgressBar() {
        $('#progressbar_addDeck_upload').show();
        $('#progressbar_addDeck_upload').progress('set active');
        $('#progressbar_addDeck_upload').progress('reset');

        const progress_messages = defineMessages({
            uploaded: {
                id: 'AddDeck.progress.uploaded',
                defaultMessage: 'Slides uploaded!',
            },
            failed: {
                id: 'AddDeck.progress.failed',
                defaultMessage: 'Upload failed!',
            }
        });
        $('#progressbar_addDeck_upload').progress({
            text: {
                // active  : 'Uploading: {percent}%',
                // active  : 'Importing: {percent}%',
                success: this.context.intl.formatMessage(progress_messages.uploaded),
                error: this.context.intl.formatMessage(progress_messages.failed)
            }
        });
    }
    showError() {
        //update progress bar
        $('#progressbar_addDeck_upload').progress('set error');
    }
    handleFileSubmit(title, language, description, theme, license, tags, acceptedConditions) {

        this.context.executeAction(addDeckDeleteError, null);

        if (this.props.ImportStore.file !== null) {

            //call action
            const payload = {
                title: title,
                language: language,
                description: description,
                theme: theme,
                license: license,
                tags: tags,
                filename: this.props.ImportStore.file.name,
                user: this.props.UserProfileStore.userid,
                jwt: this.props.UserProfileStore.jwt,
                base64: this.props.ImportStore.base64
            };
            this.initializeProgressBar();
            this.context.executeAction(uploadFile, payload);
        }
        else {
            console.error('Submission not possible - no file or not pptx/odp/zip');
        }
    }
    
    saveTags() {
        let tags = this.tagInput.getSelected();
        tags.forEach((tag) => {
            if (!tag.tagName && tag.defaultName) {
                tag.tagName = tag.defaultName;//assign defaultName to tagName to avoid errors during the initialization of the TagInput component
                this.defaultTagNames.push((tag.defaultName));//save defaultName in the array so that in the end we can restore the tag state in handleAddDeck
            }
        });
        let topics = this.topicInput.getSelected();
        topics.forEach((topic) => {
            if (!topic.tagName && topic.defaultName) {
                topic.tagName = topic.defaultName;
                this.defaultTagNames.push((topic.defaultName));
            }
        });
        //save tags in the store so that they can be restored during the initialization of TagInput component
        this.context.executeAction(storeTags, {tags:tags, topics: topics});
    }

    handleInputChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render() {
        //redirect to new deck if created
        if (this.props.AddDeckStore.redirectID !== 0) {
            this.redirectID = this.props.AddDeckStore.redirectID;
            this.handleRedirect();
            this.context.executeAction(addDeckDestruct, {});
        }


        let fieldClass_title = classNames({
            'required': true,
            'field': true,
            'error': this.state.formValidationErrors.title
        });
        let fieldClass_conditions = classNames({
            'required': true,
            'inline': true,
            'field': true,
            'error': this.state.formValidationErrors.conditions
        });
        let fieldClass_imageslicense = classNames({
            'required': true,
            'inline': true,
            'field': true,
            'error': this.state.formValidationErrors.imagesLicence
        });
        let btnClasses_submit = classNames({
            'ui': true,
            'primary': true,
            'disabled': this.props.ImportStore.uploadProgress > 0 && this.props.ImportStore.uploadProgress < 100,
            'loading': this.props.ImportStore.uploadProgress > 0 && this.props.ImportStore.uploadProgress < 100,
            'button': true
        });
        let btnClasses_upload = classNames({
            'ui': true,
            'primary': true,
            'disabled': (this.props.ImportStore.uploadProgress > 0 && this.props.ImportStore.uploadProgress < 100) || this.props.ImportStore.isUploaded,
            'button': true

        });

        let formClasses = classNames({
            'ui': true,
            'form': true,
            'upload': true,
            'error': Object.keys(this.state.formValidationErrors).length === 0 ? '' : ' error'
        });

        let filename = this.props.ImportStore.filename;
        if (filename.length > 40)
            filename = filename.substr(0, 40) + ' ...';

        let themeOptions = <select className="ui search dropdown" id="themes" aria-labelledby="theme" ref="select_themes">
            <option value="default">White - Default</option>
            <option value="beige">Cream</option>
            <option value="black">Black</option>
            <option value="league">Dark Grey</option>
            <option value="sky">Pale Blue</option>
            <option value="solarized">Beige</option>
            <option value="moon">Dark Slate Blue</option>
            <option value="night">High Contrast 1</option>
            <option value="blood">High Contrast 2</option>
            <option value="serif">Serif</option>
            <option value="simple">Simple</option>
            <option value="openuniversity">Open University</option>
            <option value="odimadrid">ODI Madrid</option>
            <option value="oeg">OEG</option>
        </select>;

        const form_messages = defineMessages({
            hint_title: {
                id: 'AddDeck.form.hint_title',
                defaultMessage: 'Please enter a title.',
            },
            hint_language: {
                id: 'AddDeck.form.hint_language',
                defaultMessage: 'Please select a language.',
            },
            selected_message: {
                id: 'AddDeck.form.selected_message',
                defaultMessage: '(Selected for upload: {filename})',
            },
            button_create: {
                id: 'AddDeck.form.button_create',
                defaultMessage: 'Create deck',
            }
        });

        //check number of slides in order to update progressbar
        if (this.props.ImportStore.deckId !== null &&
            this.props.ImportStore.uploadProgress < 100 &&
            this.props.ImportStore.error === null) {
            setTimeout(() => {
                this.context.executeAction(checkNoOfSlides, { id: this.props.ImportStore.deckId });
            }, 100);
        }

        return (
            <div className="ui vertically padded grid container">
                <h1 className="ui header" style={{marginTop: '1em'}}>
                    <FormattedMessage
                        id='AddDeck.form.heading'
                        defaultMessage='Add a deck to SlideWiki' />
                </h1>
                
                <div className="sixteen wide column">
                    <form className={formClasses}>
                        <div className={fieldClass_title} ref="div_title">
                            <label htmlFor="title">
                                <FormattedMessage
                                    id='AddDeck.form.label_title'
                                    defaultMessage='Title' />
                            </label>
                            <input type="text" id="title" aria-required="true" ref="input_title" aria-invalid={this.state.formValidationErrors.title ? true : false} />
                            {this.state.formValidationErrors.title ? 
                                <span htmlFor="title" aria-labelledby="title" className="input-error">{this.state.formValidationErrors.title}</span> 
                            : ''}
                        </div>
                        <div className="two fields">
                            <SWAutoComplete
                                ref="div_languages"
                                required={true}
                                error={this.state.formValidationErrors.language ? true : false}
                                label={<FormattedMessage
                                    id='AddDeck.form.label_language'
                                    defaultMessage='Language' />
                                }
                                name='language'
                                defaultValue={this.state.language}
                                options={translationLanguages.map((s) => ({
                                    value: s,
                                    name: getLanguageDisplayName(s),
                                }))}
                                onChange={this.handleInputChange}
                                errorMessage={this.state.formValidationErrors.language}
                            />
                            <div className="field" ref="div_themes" >
                                <label htmlFor="themes">
                                    <FormattedMessage
                                        id='AddDeck.form.label_themes'
                                        defaultMessage='Choose deck theme' />
                                </label>
                                {themeOptions}
                            </div>
                        </div>
                        <div className="field">
                            <label htmlFor="deck-description" id="deck-description-label" >
                                <FormattedMessage
                                    id='AddDeck.form.label_description'
                                    defaultMessage='Description' />
                            </label>
                            <textarea rows="4" aria-labelledby="deck-description-label" ref="textarea_description" />
                        </div>
                        <div className="ui message" id="metadata">
                            <p>
                                <FormattedMessage
                                    id='AddDeck.form.metadata'
                                    values={{
                                        link_help: <a href="/help" target="_blank">
                                            <FormattedMessage id="add.help" defaultMessage="Help decks"/>
                                        </a>
                                    }}
                                    defaultMessage='Please select from the following lists to specify the education level and subject area of your deck. You can find out more about these options in our {link_help}.' />
                            </p>
                        </div>
                        <div className="two fields">
                            <div className="sr-only" id="describe_level"><FormattedMessage id='AddDeck.sr.education' defaultMessage='Select education level of deck content'/></div>
                            <div className="sr-only" id="describe_topic"><FormattedMessage id='AddDeck.sr.subject' defaultMessage='Select subject of deck content from autocomplete. Multiple subjects can be selected'/></div>
                            <div className="sr-only" id="describe_tags"><FormattedMessage id='AddDeck.sr.tags' defaultMessage='Add tags or keywords for your deck. Multiple tags can be provided.'/></div>
                            <SWAutoComplete
                                ref="dropdown_level"
                                label={<FormattedMessage
                                    id='DeckProperty.Education.Choose'
                                    defaultMessage='Choose Education Level' />
                                }
                                name='educationLevel'
                                value={this.state.educationLevel}
                                options={Object.entries(educationLevels).map(([value, text]) => ({
                                    value: value,
                                    name: text,
                                }))}
                                onChange={this.handleInputChange}
                            />
                            <div className="field">
                                <label htmlFor="topics_input_field" id="topics_label"><FormattedMessage id='DeckProperty.Tag.Topic.Choose' defaultMessage='Choose Subject' /></label>
                                <TagInput id="topics_input_field" initialTags={this.props.ImportStore.topics} ref={(i) => (this.topicInput = i)} tagFilter={{ tagType: 'topic' }} aria-labelledby="topics_label" aria-describedby="describe_topic" />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="tags_input_field" id="tags_label"><FormattedMessage id='DeckProperty.Tag.Choose' defaultMessage='Choose Tags' /></label>
                            <TagInput id="tags_input_field" initialTags={this.props.ImportStore.tags} ref={(i) => (this.tagInput = i)} allowAdditions={true} aria-labelledby="tags_label" aria-describedby="describe_tags" />
                        </div>

                        <div className="ui message" id="uploadDesc">
                            <p>
                                <FormattedMessage
                                    id='AddDeck.form.format_message'
                                    defaultMessage='You can upload existing slides to your new deck in the following file formats: PowerPoint pptx, OpenOffice ODP, SlideWiki HTML downloads (*.zip files) and RevealJS slideshows (*.zip files).' />
                            </p>
                        </div>
                        <div className="ui field">
                            <div className="two column row">
                                <span className="column">
                                    <ImportModal savetags={this.saveTags.bind(this)}/>
                                </span>
                                <span ref="div_filename">
                                    {filename ? this.context.intl.formatMessage(form_messages.selected_message, { filename: filename }) : ''}
                                </span>
                            </div>
                        </div>
                        <div className={fieldClass_conditions} >
                            <div className="ui checkbox" ref="div_conditions" >
                                <input type="checkbox" tabIndex="0" id="terms" aria-required="true" ref="checkbox_conditions" aria-invalid={this.state.formValidationErrors.conditions ? true : false} />
                                <label htmlFor="terms">
                                    <FormattedMessage
                                        id='AddDeck.form.label_terms1'
                                        defaultMessage='I agree to the SlideWiki ' />{' '}
                                    <a className="item" href="/terms" target="_blank">
                                        <FormattedMessage
                                            id='AddDeck.form.label_terms2'
                                            defaultMessage='terms and conditions' />
                                    </a>{' '}
                                    <FormattedMessage
                                        id='AddDeck.form.label_terms3'
                                        defaultMessage=' and that content I upload, create and edit can be published under a Creative Commons ShareAlike license.' />
                                </label>
                            </div>
                            {this.state.formValidationErrors.conditions ? 
                                <span htmlFor="title" aria-labelledby="terms" className="input-error">{this.state.formValidationErrors.conditions}</span> 
                            : ''}
                        </div>
                        <div className={fieldClass_imageslicense} >
                            <div className="ui checkbox" ref="div_imageslicense" >
                                <input type="checkbox" tabIndex="0" id="termsimages" aria-required="true" ref="checkbox_imageslicense" aria-invalid={this.state.formValidationErrors.imagesLicence ? true : false} />
                                <label htmlFor="termsimages">
                                    <FormattedMessage
                                        id='AddDeck.form.label_termsimages'
                                        defaultMessage='I agree that images within my imported slides are in the public domain or made available under a Creative Commons Attribution (CC-BY or CC-BY-SA) license.' />
                                </label>
                            </div>
                            {this.state.formValidationErrors.imagesLicence ? 
                                <span htmlFor="title" aria-labelledby="termsimages" className="input-error">{this.state.formValidationErrors.imagesLicence}</span> 
                            : ''}
                        </div>
                        <div className="ui indicating progress" ref="div_progress" id="progressbar_addDeck_upload" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" tabIndex="0" style={{display:'none'}}>
                            <div className="bar"/>
                            <div className="label" ref="div_progress_text" id="progresslabel_addDeck_upload" aria-live="polite"/>
                        </div>
                        <div className="ui buttons">
                            <div className={btnClasses_submit} role="button" tabIndex="0" onClick={this.handleAddDeck.bind(this)} onKeyPress={this.handleKeyPressAddDeck.bind(this)} >
                                {this.context.intl.formatMessage(form_messages.button_create)}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}


AddDeck.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired
};
AddDeck = connectToStores(AddDeck, [AddDeckStore, UserProfileStore, ImportStore], (context, props) => {
    return {
        AddDeckStore: context.getStore(AddDeckStore).getState(),
        UserProfileStore: context.getStore(UserProfileStore).getState(),
        ImportStore: context.getStore(ImportStore).getState()
    };
});
export default AddDeck;
