const clog = require('../log/clog');
import serviceUnavailable from '../error/serviceUnavailable';

export default function updateDataSources(context, payload, done) {
    clog.info(context, payload);
    context.service.update('datasource.array', payload, {timeout: 20 * 1000}, (err, res) => {
        if (err) {
            clog.error(context, payload, {filepath: __filename, err: err});
            context.executeAction(serviceUnavailable, payload, done);
            //context.dispatch('UPDATE_DATASOURCES_FAILURE', err);
        } else {
            context.dispatch('UPDATE_DATASOURCES_SUCCESS', res);
        }

        done();
    });
}
