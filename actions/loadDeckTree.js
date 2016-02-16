import {shortTitle} from '../configs/general';
export default function loadDeckTree(context, payload, done) {
    context.service.read('decktree.nodes', payload, {timeout: 20 * 1000}, (err, res) => {
        if (err) {
            context.dispatch('LOAD_DECK_TREE_FAILURE', err);
        } else {
            context.dispatch('LOAD_DECK_TREE_SUCCESS', res);
        }
        let pageTitle = shortTitle + ' | Deck Tree | ' + payload.params.stype + ' | ' + payload.params.sid;
        context.dispatch('UPDATE_PAGE_TITLE', {
            pageTitle: pageTitle
        });
        done();
    });
}
