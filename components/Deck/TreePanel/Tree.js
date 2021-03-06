import PropTypes from 'prop-types';
import React from 'react';
import {HotKeys} from 'react-hotkeys';
import {NavLink, navigateAction} from 'fluxible-router';
import Util from '../../common/Util';
import TreeNodeList from './TreeNodeList';

class Tree extends React.Component {

    getKeyMap() {
        const keyMap = {
            'moveUp': 'up',
            'moveDown': 'down',
            'fastForward': 'shift+up',
            'fastBackward': 'shift+down',
            'expandOrMenu': 'right',
            'collapseOrMenu': 'left'
        };
        return keyMap;
    }

    getKeyMapHandlers() {
        const handlers = {
            'moveUp': (event) => this.handleUpKey(),
            'moveDown': (event) => this.handleDownKey(),
            'fastForward': (event) => this.handleForwardClick(),
            'fastBackward': (event) => this.handleBackwardClick(),
            'expandOrMenu': (event) => this.handleRightKey(),
            'collapseOrMenu': (event) => this.handleLeftKey()
        };
        return handlers;
    }

    getImmNodeFromPath(deckTree, path) {
        if (!path) {
            //in case of root deck selected
            return deckTree;
        }
        let out = ['children'];
        let tmp, arr = path.split(';');
        arr.forEach((item, index) => {
            tmp = item.split(':');
            out.push(parseInt(tmp[1] - 1));
            if (index !== (arr.length - 1)) {
                //last item is always a slide, remaining are decks
                out.push('children');
            }
        });
        let chain = deckTree;
        out.forEach((item, index) => {
            //chain will be a list of all nodes in the same level
            chain = chain.get(item);
        });
        return chain;
    }

    handleRightKey() {
        let node = this.getImmNodeFromPath(this.props.deckTree, this.props.focusedSelector.get('spath'));
        if (node.get('editable') || this.props.username=== '') {
            //disable handler when editing node or when user is not loggedIn
            return true;
        } else {
            if (node.get('type') === 'deck') {
                if (!node.get('expanded')) {
                    this.props.onToggleNode({
                        id: this.props.rootNode.id,
                        stype: this.props.focusedSelector.get('stype'),
                        sid: this.props.focusedSelector.get('sid'),
                        spath: this.props.focusedSelector.get('spath')
                    });
                } else {
                    this.props.onSwitchOnAction({
                        id: this.props.rootNode.id,
                        stype: this.props.focusedSelector.get('stype'),
                        sid: this.props.focusedSelector.get('sid'),
                        spath: this.props.focusedSelector.get('spath')
                    });
                }
            } else {
                this.props.onSwitchOnAction({
                    id: this.props.rootNode.id,
                    stype: this.props.focusedSelector.get('stype'),
                    sid: this.props.focusedSelector.get('sid'),
                    spath: this.props.focusedSelector.get('spath')
                });
            }
            return false;
        }
    }

    handleLeftKey() {
        let node = this.getImmNodeFromPath(this.props.deckTree, this.props.focusedSelector.get('spath'));
        if (node.get('editable')  || this.props.username=== '') {
            //disable handler when editing node or when user is not loggedIn
            return true;
        } else {
            if (node.get('type') === 'deck') {
                if (node.get('onAction')) {
                    this.props.onSwitchOnAction({
                        id: this.props.rootNode.id,
                        stype: this.props.focusedSelector.get('stype'),
                        sid: this.props.focusedSelector.get('sid'),
                        spath: this.props.focusedSelector.get('spath')
                    });
                } else {
                    if (node.get('expanded')) {
                        this.props.onToggleNode({
                            id: this.props.rootNode.id,
                            stype: this.props.focusedSelector.get('stype'),
                            sid: this.props.focusedSelector.get('sid'),
                            spath: this.props.focusedSelector.get('spath')
                        });
                    }
                }
            } else {
                if (node.get('onAction')) {
                    this.props.onSwitchOnAction({
                        id: this.props.rootNode.id,
                        stype: this.props.focusedSelector.get('stype'),
                        sid: this.props.focusedSelector.get('sid'),
                        spath: this.props.focusedSelector.get('spath')
                    });
                }
            }
            return false;
        }
    }

    handleForwardClick() {
        let firstNode = this.props.deckTree.get('children').get(0);
        let selector = {
            id: this.props.rootNode.id,
            stype: firstNode.get('type'),
            sid: firstNode.get('id'),
            spath: firstNode.get('path')
        };
        let path = Util.makeNodeURL(selector, this.props.page, this.props.mode, undefined, undefined, true);
        if (path) {
            this.context.executeAction(navigateAction, {
                url: path
            });
        }
        //returning false stops the event and prevents default browser events
        return false;
    }

    handleBackwardClick() {
        let lastNode = this.props.deckTree.get('children').get(this.props.deckTree.get('children').size - 1);
        let selector = {
            id: this.props.rootNode.id,
            stype: lastNode.get('type'),
            sid: lastNode.get('id'),
            spath: lastNode.get('path')
        };
        let path = Util.makeNodeURL(selector, this.props.page, this.props.mode, undefined, undefined, true);
        if (path) {
            this.context.executeAction(navigateAction, {
                url: path
            });
        }
        //returning false stops the event and prevents default browser events
        return false;
    }

    handleUpKey() {
        this.props.onFocusNode(this.props.prevSelector.toJS());
        //returning false stops the event and prevents default browser events
        return false;
    }

    handleDownKey() {
        this.props.onFocusNode(this.props.nextSelector.toJS());
        //returning false stops the event and prevents default browser events
        return false;
    }

    render() {
        //hide focused outline
        let compStyle = {
            outline: 'none'
        };
        let self = this;
        return (
            <HotKeys keyMap={this.getKeyMap()} handlers={this.getKeyMapHandlers()} className="sw-tree"
                     style={compStyle}>
                <div ref="tree">
                    <TreeNodeList parentNode={self.props.deckTree} onToggleNode={self.props.onToggleNode}
                                  onSwitchOnAction={self.props.onSwitchOnAction} onRename={self.props.onRename}
                                  onUndoRename={self.props.onUndoRename} onSave={self.props.onSave}
                                  onAddNode={self.props.onAddNode} onDeleteNode={self.props.onDeleteNode}
                                  onMoveNode={self.props.onMoveNode} mode={self.props.mode}
                                  page={self.props.page} rootNode={self.props.rootNode}
                                  username={self.props.username}
                                  permissions={self.props.permissions}
                                  showThumbnails={this.props.showThumbnails}/>
                </div>
            </HotKeys>
        );
    }
}
Tree.contextTypes = {
    executeAction: PropTypes.func.isRequired
};

export default Tree;
