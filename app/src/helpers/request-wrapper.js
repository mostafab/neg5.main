import request from 'request';

export default (url) => {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                resolve(body);
            }
        })
    })
}