/* global document */

export default class QBJService {
  constructor($q, $window, QBJHttpService, TournamentService) {
    this.$q = $q;
    this.$window = $window;
    this.QBJHttpService = QBJHttpService;
    this.TournamentService = TournamentService;
  }

  downloadQBJ(tournamentId, fileName = 'qbj_file') {
    this.QBJHttpService.getQBJReport(tournamentId)
      .then((qbj) => {
        this.downloadFile(JSON.stringify(qbj, null, 4), {
          fileName,
          contentType: 'json',
          extension: '.qbj',
        });
      });
  }

  downloadFile(data, { fileName, contentType, extension }) {
    const entireFileName = `${fileName}${extension}`;
    if (this.$window.navigator.msSaveOrOpenBlob) {
      const blobObject = new this.$window.Blob(data);
      this.$window.navigator.msSaveOrOpenBlob(blobObject, entireFileName);
    } else {
      const blob = new this.$window.Blob([data], { type: contentType });
      const URL = this.$window.URL || this.$window.webkitURL;
      const downloadUrl = URL.createObjectURL(blob);
      const tempAnchor = document.createElement('a');
      if (typeof tempAnchor.download === 'undefined') {
        this.$window.location = downloadUrl;
      } else {
        tempAnchor.href = downloadUrl;
        tempAnchor.download = entireFileName;
        document.body.appendChild(tempAnchor);
        tempAnchor.click();
        setTimeout(() => {
          document.body.removeChild(tempAnchor);
          this.$window.URL.revokeObjectURL(downloadUrl);
        }, 100);
      }
    }
  }
}

QBJService.$inject = ['$q', '$window', 'QBJHttpService', 'TournamentService'];
