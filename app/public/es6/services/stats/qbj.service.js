(() => {
   
   angular.module('tournamentApp')
    .factory('QBJ', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {

      const service = this;
      
      service.factory = {
          getQBJReport
      };
      
      function getQBJReport(tournamentId, { download = false, fileName = 'qbj_file' }) {
          return $q((resolve, reject) => {
              const token = Cookies.get('nfToken');
              $http.get('/api/t/' + tournamentId + '/qbj?token=' + token)
                  .then(({data}) => {
                      if (download) {
                          downloadQBJ(data.result, fileName);
                      }
                      resolve();
                  })
                  .catch(error => reject(error));
          });
      }
      
      function downloadQBJ(json, fileName) {
          if (window.navigator.msSaveOrOpenBlob) {
              const fileData = [JSON.stringify(json, null, 4)];
              const blobObject = new Blob(fileData);
              window.navigator.msSaveOrOpenBlob(blobObject, fileName + '.qbj');
          } else {
              const type = 'json';
              const blob = new Blob([JSON.stringify(json, null, 4)], { type: type });
              const URL = window.URL || window.webkitURL;
              const downloadUrl = URL.createObjectURL(blob);
              var tempAnchor = document.createElement("a");
              
              if (typeof tempAnchor.download === 'undefined') {
                  window.location = downloadUrl;
              } else {
                  tempAnchor.href = downloadUrl;
                  tempAnchor.download = fileName + '.qbj';
                  document.body.appendChild(tempAnchor);
                  tempAnchor.click();
                  setTimeout(function() {
                      document.body.removeChild(tempAnchor);
                      window.URL.revokeObjectURL(downloadUrl);
                  }, 100);
              }
          }
      }

      return service.factory;
        
    }]); 
        
})();