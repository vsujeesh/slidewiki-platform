import notFoundError from './error/notFoundError';
const log = require('./log/clog');

export default function loadNotFound(context, payload, done) {
    log.info(context, payload);
    context.executeAction(notFoundError, payload, done);
    return;
}
