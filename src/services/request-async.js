const https = require('https');

module.exports = {
    getHttpsGetPromise: function (host, path) {
        return new Promise((resolve, reject) => {
            https.get({
                    host: host,
                    path: path
                }, function (response) {
                    let body = '';
                    response.on('data', function (d) {
                        body += d;
                    });
                    response.on('end', function () {
                        resolve(body);
                    });
                    response.on('error', (error) => {
                        reject(error.message);
                    });
                }
            );
        })
    }
}