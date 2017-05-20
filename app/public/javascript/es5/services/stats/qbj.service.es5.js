'use strict';

(function () {

    angular.module('tournamentApp').factory('QBJ', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        service.factory = {
            getQBJReport: getQBJReport
        };

        function getQBJReport(tournamentId, _ref) {
            var _ref$download = _ref.download;
            var download = _ref$download === undefined ? false : _ref$download;
            var _ref$fileName = _ref.fileName;
            var fileName = _ref$fileName === undefined ? 'qbj_file' : _ref$fileName;

            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/qbj?token=' + token).then(function (_ref2) {
                    var data = _ref2.data;

                    if (download) {
                        downloadQBJ(data.result, fileName);
                    }
                    resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function downloadQBJ(json, fileName) {
            if (window.navigator.msSaveOrOpenBlob) {
                var fileData = [JSON.stringify(json, null, 4)];
                var blobObject = new Blob(fileData);
                window.navigator.msSaveOrOpenBlob(blobObject, fileName + '.qbj');
            } else {
                var tempAnchor;

                (function () {
                    var type = 'json';
                    var blob = new Blob([JSON.stringify(json, null, 4)], { type: type });
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);
                    tempAnchor = document.createElement("a");


                    if (typeof tempAnchor.download === 'undefined') {
                        window.location = downloadUrl;
                    } else {
                        tempAnchor.href = downloadUrl;
                        tempAnchor.download = fileName + '.qbj';
                        document.body.appendChild(tempAnchor);
                        tempAnchor.click();
                        setTimeout(function () {
                            document.body.removeChild(tempAnchor);
                            window.URL.revokeObjectURL(downloadUrl);
                        }, 100);
                    }
                })();
            }
        }

        return service.factory;
    }]);
})();