import PropTypes from 'prop-types';
import React from 'react';
import {connectToStores} from 'fluxible-addons-react';
import {navigateAction} from 'fluxible-router';
import userSignIn from '../../actions/user/userSignIn';
import userSignOut from '../../actions/user/userSignOut';
import userSocialSignIn from '../../actions/user/userSocialSignIn';
import newSocialData from '../../actions/user/registration/newSocialData';
import ReactDOM from 'react-dom';
import {ssoEnabled} from '../../configs/general';
import common from '../../common';
import {Microservices} from '../../configs/microservices';
let classNames = require('classnames');
let MediaQuery = require ('react-responsive');
import {FormattedMessage, defineMessages} from 'react-intl';
import SelectInstanceModal from '../User/SelectInstanceModal.js';
import openSSOModal from '../../actions/user/openSSOModal';
import FocusTrap from 'focus-trap-react';
import LoginModalStore from '../../stores/LoginModalStore';
import updateTrap from '../../actions/loginModal/updateTrap';

const headerStyle = {
    'textAlign': 'center'
};
const modalStyle = {
    top: '15%'
};
const MODI = 'sociallogin_modi';
const NAME = 'sociallogin_data';

class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.handleLoginButton = this.handleLoginButton.bind(this);
        this.handleSignupClick = this.handleSignupClick.bind(this);
        this.handleNoAccessClick = this.handleNoAccessClick.bind(this);
        this.unmountTrap = this.unmountTrap.bind(this);
        this.signin = this.signin.bind(this);
        this.provider = '';
        this.state = {
            activeTrap: this.props.LoginModalStore.activeTrap?this.props.LoginModalStore.activeTrap:false,
            isLoading: false
        };

        this.errorMessages = defineMessages({

            error403: {
                id: 'userSignIn.errormessage.isSPAM',
                defaultMessage: 'Your account was marked as SPAM thus you are not able to sign in. Contact us directly for reactivation.'
            },
            error404: {
                id: 'userSignIn.errormessage.notFound',
                defaultMessage: 'The credentials are unknown. Please retry with another input.'
            },
            error423: {
                id: 'userSignIn.errormessage.deactivatedOrUnactivated',
                defaultMessage: 'Your user account either have to be activated via the activation link in your email or is deactivated in general.'
            }
        });
    }
    componentWillReceiveProps(nextProps){
        this.setState({ activeTrap: nextProps.LoginModalStore.activeTrap });

        if (nextProps.errorMessage !== '' && this.props.errorMessage === '' && this.state.isLoading) {
            // console.log('body intended', this.props.errorMessage.toString());
            $('.ui.form.signin').form('add errors', [this.props.errorMessage]);
            this.setState({ isLoading: false });
        }
    }
    openModal() {
        this.context.executeAction(updateTrap,{activeTrap:true});
        //hidden the other page elements to readers
        $('#app').attr('aria-hidden','true');
        $('.ui.login.modal').modal('show');
    }
    unmountTrap(){
        if(this.state.activeTrap){
            this.context.executeAction(updateTrap,{activeTrap:false});
        };
        $('#app').attr('aria-hidden','false');


    }
    isModalShown() {
        const classes = $('.ui.login.modal').attr('class');
        return classes.indexOf('hidden') === -1;
    }

    handleLoginButton() {
        this.openModal();


        setTimeout(() => {
            ReactDOM.findDOMNode(this.refs.email1).focus();
        }, 0);

    }

    signin(e) {
        e.preventDefault();

        // Remove any existing validation error messages.
        // This is necessary because screenreaders will only read the form error messages when there is a change in the message.
        // For instance, without this, the error message will be read by the screenreader on the first failed login attempt, and will not be read on subsequent attempts.
        // Removing then re-adding the error message after failure ensures the screenreader always reads it.
        $('.ui.form.signin > div.ui.error').empty();

        const email = this.refs.email1.value;
        let regExp = /\S+@\S+\.\S+/;
        if (email === '' || !regExp.test(email)) {//Check if email is valid
            $('.ui.form.signin').form('add errors', [this.context.intl.formatMessage({
                id: 'LoginModal.error.noValidEmailAddress',
                defaultMessage: 'Please use a valid email address',
            }) ]);
        } else {
            this.setState({ isLoading: true });

            this.context.executeAction(userSignIn, {
                email: this.refs.email1.value,
                password: common.hashPassword(this.refs.password1.value),
                errorMessages: {
                    error403: this.context.intl.formatMessage(this.errorMessages.error403),
                    error404: this.context.intl.formatMessage(this.errorMessages.error404),
                    error423: this.context.intl.formatMessage(this.errorMessages.error423)
                }
            });
        }
        return false;
    }

    handleRegisterFirst(dismiss) {
        localStorage.setItem(MODI, 'login_failed_register_now');

        this.context.executeAction(navigateAction, {
            url: '/signup'
        });

        return true;
    }

    componentDidUpdate() {
        if (this.props.errorMessage.length > 2)
            $('.ui.form.signin').form('add errors', [this.props.errorMessage]);
        // console.log('componentDidUpdate:', this.props.errorMessage, ',', this.props.socialLoginError, ',', this.props.userid, ',', this.props.username, ',', this.state.isLoading);
        if (localStorage.getItem(MODI) === 'login' && this.props.socialLoginError){
            localStorage.setItem(MODI, 'login_failed');
            this.setState({ isLoading: false });
            swal({
                title: this.context.intl.formatMessage({
                    id: 'LoginModal.title.information',
                    defaultMessage: 'Information',
                }),
                text: this.context.intl.formatMessage({
                    id: 'LoginModal.hint.noAccountForTheProviderData',
                    defaultMessage: 'You haven\'t logged in before with these credentials. Either choose another provider to log in or try to register a new account.',
                }),
                type: 'question',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: this.context.intl.formatMessage({
                    id: 'LoginModal.button.registerNow',
                    defaultMessage: 'Register now',
                }),
                confirmButtonClass: 'positive ui button',
                cancelButtonText: this.context.intl.formatMessage({
                    id: 'LoginModal.button.tryAnotherProvider',
                    defaultMessage: 'Try another provider',
                }),
                cancelButtonClass: 'ui orange button',
                buttonsStyling: false
            })
            .then((dismiss) => {
                $('.ui.login.modal').modal('hide');
                return this.handleRegisterFirst(dismiss);
            })
            .catch((action) => {
                // console.log('action after click', action);
                //delete old data
                this.context.executeAction(newSocialData, {});
                if (action !== 'close')
                    this.handleLoginButton();

                return true;
            });
        }
        else if (this.props.userid && $('.ui.login.modal').modal('is active')) {
            if (localStorage.getItem(MODI) === 'login')
                localStorage.setItem(MODI, 'login_success');
            this.setState({ isLoading: false });
            $('.ui.login.modal').modal('hide');

            //redirect if on a specific page
            if (location.pathname === '/signup' || location.pathname === '/resetpassword') {
                this.context.executeAction(navigateAction, {
                    url: '/user/' + this.props.username + '/settings/profile'
                });
            }
        }
    }

    handleSignupClick(e) {
        e.preventDefault();
        $('.ui.login.modal').modal('hide');
        this.context.executeAction(navigateAction, {
            url: '/signup'
        });
        // return false;
    }

    handleNoAccessClick(e) {
        e.preventDefault();
        $('.ui.login.modal').modal('hide');
        this.context.executeAction(navigateAction, {
            url: '/resetpassword'
        });
    }

    socialLogin(provider, e) {
        e.preventDefault();
        // console.log('Hit on social login icon', provider);
        this.provider = provider;

        $('.ui.login.modal').modal('hide');

        //prepare localStorage
        localStorage.setItem(MODI, 'login');
        localStorage.setItem(NAME, '');

        //observe storage
        $(window).off('storage').on('storage', this.handleStorageEvent.bind(this));

        //create new window
        let url = Microservices.user.uri + '/connect/' + provider;

        let width = screen.width*0.75, height = screen.height*0.75;
        if (width < 600)
            width = screen.width;
        if (height < 500)
            height = screen.height;
        let left = screen.width/2-width/2, topSpace = screen.height/2-height/2;

        let win = window.open(url, '_blank', 'width='+width+',height='+height+',left='+left+',top='+topSpace+',toolbar=No,location=No,scrollbars=no,status=No,resizable=no,fullscreen=No');
        win.focus();
    }

    doSSO(e) {
        e.preventDefault();

        $('.ui.login.modal').modal('hide');

        this.context.executeAction(openSSOModal, {register: false});
    }

    handleStorageEvent(e) {
        // console.log('storage event', e.key, localStorage.getItem(e.key));
        //this is available

        if (e.key !== NAME || localStorage.getItem(MODI) !== 'login')
            return;

        let data = {};
        try {
            data = JSON.parse(localStorage.getItem(e.key));
        } catch (err) {
            console.log('Error while parsing data', err);
            return;
        }
        finally {
            //delete data
            localStorage.setItem(NAME, '');
        }

        //add language before send to service
        let language = common.getIntlLanguage();
        data.language = language;

        // console.log('LoginModal got social data', data);

        //check data - valid and not empty
        if ( (data.token.length < 1)
          || (data.provider.length < 3)
          || (data.token_creation.length < 22) )
            //Failure
            return;

        if ( (data.email === undefined || data.email.indexOf('@') === -1 || data.email.indexOf('.') === -1 || data.email.length < 5) ) {
            //show hint
            const provider = this.getProviderName();
            let messages = defineMessages({
                swal_text:{
                    id: 'LoginModal.text.incompleteProviderData',
                    defaultMessage: 'The data from {provider} was incomplete. In case you want to use this provider, please add an e-mail address at the provider itself and try again at SlideWiki.'
                },
            });
            swal({
                title: this.context.intl.formatMessage({
                    id: 'LoginModal.title.error',
                    defaultMessage: 'Error',
                }),
                text: this.context.intl.formatMessage(messages.swal_text, {
                    provider: provider
                }),
                type: 'error',
                confirmButtonText: this.context.intl.formatMessage({
                    id: 'LoginModal.button.confirm',
                    defaultMessage: 'Confirm',
                }),
                confirmButtonClass: 'negative ui button',
                buttonsStyling: false
            }).then().catch();

            return;
        }

        this.context.executeAction(userSocialSignIn, data);
    }

    getProviderName() {
        if (this.provider.length < 1)
            return '';
        return this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
    }

    render() {

        let inputField_classes = classNames({
            'ui': true,
            'icon': true,
            'disabled': this.state.isLoading,
            'input': true,
            'loading': this.state.isLoading,
            'field': true,
            'fluid': true,
            'inline': true
        });

        const messages = defineMessages({
            placeholder_email: {
                id: 'LoginModal.placeholder.email',
                defaultMessage: 'E-Mail',
            },
            placeholder_password: {
                id: 'LoginModal.placeholder.password',
                defaultMessage: 'Password',
            },
            headerText:{
                id:'userSignIn.headerText',
                defaultMessage:'Sign In'
            },
            ariagoogle:{
                id: 'LoginModal.aria.google',
                defaultMessage: 'sign in with your Google account'
            },
            ariagithub:{
                id: 'LoginModal.aria.github',
                defaultMessage: 'sign in with your Github account'
            }
        });

        let inputs =
        <div className="ui one column grid">
          <div className="ui aligned column">
            <textarea className="sr-only" id="signinModalDescription"
            defaultValue="Use your user email address and password to sign in. Or select GooglePlus or GitHub if you have used these services to active your account on SlideWiki"
            tabIndex ='-1'/>

            <div className={inputField_classes}>
              <div className="sr-only">
                <label htmlFor="email1">
                    <FormattedMessage
                    id='LoginModal.label.email'
                    defaultMessage='E-Mail'
                    />
                </label>
              </div>
              <input type="text" id="email1" name="email1" ref="email1"  autoFocus tabIndex="0" placeholder={this.context.intl.formatMessage(messages.placeholder_email)} required/><i className="mail icon"/>
            </div>
          </div>
          <br/>
          <div className="ui center aligned column">
            <div className={inputField_classes}>
              <div className="sr-only">
                <label htmlFor="password1">
                  <FormattedMessage
                    id='LoginModal.label.password'
                    defaultMessage='Password'
                  />
                </label>
              </div>
              <input type="password" id="password1" name="password1" ref="password1" tabIndex="0" placeholder={this.context.intl.formatMessage(messages.placeholder_password)} required/><i className="lock icon"/>
            </div>
          </div>
        </div>;

        return(
          <div>
            <div className="ui login modal" id='signinModal' role="dialog" aria-labelledby="siginModal_header" aria-describedby="signinModalDescription" style={modalStyle}>
            <FocusTrap
                    id="focus-trap-signinModal"
                    focusTrapOptions={{
                        onDeactivate: this.unmountTrap,
                        clickOutsideDeactivates: true,
                        initialFocus: '#email1'
                    }}
                    active={this.state.activeTrap}
                    className = "header">
              <div className="header">
                  <h2 id="siginModal_header" style={headerStyle}>
                     {this.context.intl.formatMessage(messages.headerText)}

                  </h2>
              </div>
              <div className="content">
                <div className="ui container">
                    <div className="ui blue padded center aligned segment">
                      <form className="ui form signin">
                        <div className="ui one column centered grid">
                          <MediaQuery minDeviceWidth={769} values={{deviceWidth: 1600}}>
                            <div className="ui five wide column">
                              {inputs}
                            </div>
                          </MediaQuery>
                          <MediaQuery maxDeviceWidth={768}>
                            <div className="ui twelve wide centered column">
                              {inputs}
                            </div>
                          </MediaQuery>
                        </div>

                        <br/>
                        <div className="ui center aligned">
                            <button type="submit" className="ui blue large labeled submit icon button" onClick={this.signin}><i className="icon sign in"/>
                              <FormattedMessage
                                id='LoginModal.button.signIn'
                                defaultMessage='Sign In'
                              />
                            </button>
                        </div>
                        <br/>
                        <div className="ui error message" role="region" aria-live="polite"/>
                      </form>
                      <br/>
                      <div className="container">

                        <button className="ui big circular red icon button" onClick={this.socialLogin.bind(this, 'google')} role="button" tabIndex="0" aria-label={this.context.intl.formatMessage(messages.ariagoogle)}>
                          <i className="large google plus icon"/>
                        </button>
                        <button className="ui big circular black icon button" onClick={this.socialLogin.bind(this, 'github')} role="button" tabIndex="0" aria-label={this.context.intl.formatMessage(messages.ariagithub)}>
                          <i className="large github icon"/>
                        </button>
                      </div>
                      <br/>
                      <div className="ui floated right">
                          <a className="ui teal inverted  button" role="button" tabIndex="0" href="#" onClick={this.handleNoAccessClick}>
                            <FormattedMessage
                              id='LoginModal.text.iCannotAccessMyAccount'
                              defaultMessage='I can not access my account'
                            />
                          </a>
                          <br/><br/>
                          <a className="ui teal inverted button" role="button" tabIndex="0" href="#" onClick={this.handleSignupClick}>
                            <FormattedMessage
                              id='LoginModal.text.dontHaveAnAccount'
                              defaultMessage='Don&apos;t have an account? Sign up here.'
                            />
                          </a>
                      </div>
                    </div>
                </div>
              </div>
              <div className="actions">
                <button type="cancel" className="ui cancel button">
                  <i className="remove icon"/>
                  <FormattedMessage
                    id='LoginModal.button.close'
                    defaultMessage='Close'
                  />
                </button>
              </div>
             </FocusTrap>
            </div>
            <SelectInstanceModal />
          </div>
        );
    }
}

LoginModal.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired
};
LoginModal = connectToStores(LoginModal,[LoginModalStore],(context,props) => {
    return {
        LoginModalStore: context.getStore(LoginModalStore).getState(),

    };
});
export default LoginModal;
