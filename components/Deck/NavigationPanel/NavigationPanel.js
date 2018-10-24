import React from 'react';
import Immutable from 'immutable';
import {connectToStores} from 'fluxible-addons-react';
import DeckTreeStore from '../../../stores/DeckTreeStore';
import Breadcrumb from './Breadcrumb';
import DeckLanguageMenu from '../DeckLanguageMenu';
import classNames from "classnames";

class NavigationPanel extends React.Component {
    getNameofNodes(tree, selector) {
        if(!selector.get('spath')){
            return 0;
        }

        let names = [];
        let nodes = selector.get('spath').split(';');
        let currentChildren = tree.get('children');
        let position = 0;
        nodes.forEach ((node, index) => {
            position = node.split(':')[1];
            names.push(currentChildren.get(position - 1).get('title'));
            if(currentChildren.get(position - 1).get('children')){
                currentChildren = currentChildren.get(position - 1).get('children');
            }
        });
        return names;
    }
    render() {
        let deckTree = this.props.DeckTreeStore.deckTree;
        let selector = this.props.DeckTreeStore.selector;

        let translatebtn = {
            padding: '16px',
            fontWeight: 'bold'
        };

        return (<div>
            <Breadcrumb selector={selector} pathNames={this.getNameofNodes(deckTree, selector)} rootDeckName={deckTree.get('title')} />

            <div className={`ui ${this.props.lastAttached ? 'bottom' : ''} attached medium basic fluid button`}  style={translatebtn}>
                <DeckLanguageMenu />
            </div>
        </div>);
    }
}

NavigationPanel = connectToStores(NavigationPanel, [DeckTreeStore], (context, props) => {
    return {
        DeckTreeStore: context.getStore(DeckTreeStore).getState()
    };
});
export default NavigationPanel;
