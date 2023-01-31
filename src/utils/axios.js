import axios from 'axios'

const service = axios.create({
    baseURL: `http://localhost:${window.port}/note`,
    timeout: 15000
})

export const Get = (url, params = {}, clearFn) =>
    new Promise((resolve) => {
        service
            .get(url, { params })
            .then((result) => {
                let res = clearFn !== undefined ? clearFn(result.data) : result.data
                resolve(res);
            })
            .catch((err) => {
                resolve([err, undefined]);
            });
    });

export const Post = (url, data, params = {}) => {
    return new Promise((resolve) => {
        service
            .post(url, data, { params })
            .then((result) => {
                resolve(result.data);
            })
            .catch((err) => {
                resolve([err, undefined]);
            });
    });
};