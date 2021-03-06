/* eslint-disable */

import exceptionDetector from './interceptors/exceptionDetector';
import CacheService from '@core/services/storage/CacheService';
import settings from '@utils/settings'

const NETWORK_SERVICE = settings.NETWORK_SERVICE;

class NetworkService {
    _interceptors = [exceptionDetector];
    _uri = null;

    constructor(uri, interceptors = []) {
        if (!uri || typeof uri !== 'string') {
            throw new Error('The "uri" argument must be string.');
        }

        if (interceptors.length) {
            interceptors.forEach(interceptor => {
                if (typeof interceptor !== 'function') {
                    throw new Error(`The '${interceptor}' is not a function.`)
                }
                this._interceptors.push(interceptor)
            });
        }

        this._uri = uri;
    };

    clearAuthenticatedState = () => {
        CacheService.clearStorage();
        history.push('/login')
    };

    makeAPIGetRequest = (url: string, options: Object = {}) => {
        options = options || {};
        options.method = NETWORK_SERVICE.REQUEST_METHODS.GET;
        return this.makeAPIRequest(url, options);
    };

    makeAPIPostRequest = (url: string, options: Object = {}) => {
        options.method = NETWORK_SERVICE.REQUEST_METHODS.POST;
        return this.makeAPIRequest(url, options);
    };

    makeAPIPutRequest = (urlPrefix: string, options: Object = {}) => {
        options.method = NETWORK_SERVICE.REQUEST_METHODS.PUT;
        return this.makeAPIRequest(urlPrefix, options);
    };

    makeAPIDeleteRequest = (urlPrefix: string, options: Object = {}) => {
        options.method = NETWORK_SERVICE.REQUEST_METHODS.DELETE;
        return this.makeAPIRequest(urlPrefix, options);
    };

    makeAPIPatchRequest = (urlPrefix: string, options: Object = {}) => {
        options.method = NETWORK_SERVICE.REQUEST_METHODS.PATCH;
        return this.makeAPIRequest(urlPrefix, options);
    };

    createUrl = (arg: Array<string> | string) => {
        if (Array.isArray(arg)) {
            return [this._uri, ...arg].join('/');
        }
        return `${this._uri}/${arg}`;
    };

    createQueryParams = (queryParams: Object) => Object.keys(queryParams).reduce((accumulator, key) => {
        const item = queryParams[key];
        if (item === null || item === undefined) return accumulator;

        if (Array.isArray(item)) {
            for (let index = 0; index < item.length; index++) {
                const arrItem = item[index];
                accumulator += `${key}=${arrItem}&`;
            }
        } else {
            accumulator += `${key}=${item}&`;
        }
        return accumulator;
    }, '');


    makeAPIRequest = (partUrl: string, options: ?Object = {}) => new Promise((resolve, reject) => {
        let url: string = this.createUrl(partUrl);

        if (!url) {
            return reject(NETWORK_SERVICE.ERRORS.INVALID_REQUEST_PARAMS);
        }

        if (options.query_params) {
            url += `?${this.createQueryParams(options.query_params)}`;
        }
        if (!options.method) {
            options.method = NETWORK_SERVICE.REQUEST_METHODS.GET;
        }

        const auth_token = CacheService.getItem('auth_token'); //@TODO take token from reducer
        const fetch_options = {
            method: options.method,
            headers: options.headers || {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                version: 1,
                Authentication: auth_token
            }
        };


        if (options.headers) {
            fetch_options.headers = options.headers;
        }
        try {
            if (options.body) {
                fetch_options.body = JSON.stringify(options.body);
            }
        } catch (ex) {
            return reject({ message: NETWORK_SERVICE.ERRORS.INVALID_REQUEST_PARAMS });
        }

        fetch(url, fetch_options)
            .then(async response => {
                if (!response) {
                    return reject({ message: NETWORK_SERVICE.ERRORS.INVALID_RESPONSE_DATA });
                }

                const { headers } = response;
                let body = {};

                const contentType = headers.get('content-type');

                if (contentType && contentType.indexOf('application/json') !== -1) {
                    body = await response.json();
                }

                body.status = response.status;

                try {
                    if (this._interceptors.length) {
                        this._interceptors.forEach(interceptor => {
                            if (typeof interceptor === 'function') {
                                body = interceptor(body);
                            }
                        });
                    }
                } catch(e) {
                    reject({ message: e.message, res: { body, headers } });
                }

                if (response.status > 400) {
                    return reject({ message: body.AlertMessage, res: { body, headers } });
                }
                return resolve({ body, headers });
            }).catch(err => reject(err));
    })
}

export default NetworkService;
