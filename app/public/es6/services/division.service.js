(() => {
   
   angular.module('tournamentApp')
        .factory('Division', ['$q', '$http', 'Cookies', function($q, $http, Cookies) {
            
            let service = this;
            
            let divisions = [];

            service.factory = {
                getDivisions,
                editDivision,
                addDivision,
                removeDivision,

                divisions
            }

            function getDivisions(tournamentId) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '/divisions?token=' + token)
                        .then(({data}) => {
                            let formattedDivisions = data.result.map(division => {
                                return {
                                    name: division.division_name,
                                    newName: division.division_name,
                                    id: division.division_id,
                                    phaseId: division.phase_id
                                }
                            })
                            angular.copy(formattedDivisions, service.factory.divisions)
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        })
                })
            }

            function editDivision(tournamentId, division) {
                return $q((resolve, reject) => {
                    let body = { 
                        token: Cookies.get('nfToken'), 
                        newName: division.newName
                    };
                    $http.put('/api/t/' + tournamentId + '/divisions/' + division.id, body)
                        .then(({data}) => {
                            updateDivisionInArray(data.result);
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        })
                })
            }

            function addDivision(tournamentId, name, phaseId) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        name,
                        phaseId
                    }
                    $http.post('/api/t/' + tournamentId + '/divisions', body)
                        .then(({data}) => {
                            addDivisionToArray(data.result);
                            resolve();
                        })
                        .catch(error => reject(error));
                })
            }

            function removeDivision(tournamentId, {id}) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http.delete('/api/t/' + tournamentId + '/divisions/' + id + '?token=' + token)
                        .then(({data}) => {
                            removeDivisionFromArray(data.result.id);
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        });
                })
            }

            function updateDivisionInArray(newDivisionInfo) {
                let index = service.factory.divisions.findIndex(division => division.id === newDivisionInfo.id);
                service.factory.divisions[index].name = newDivisionInfo.name;
                service.factory.divisions[index].newName = newDivisionInfo.name;
            }

            function addDivisionToArray({name, id, phase_id: phaseId}) {
                service.factory.divisions.push({
                    name,
                    newName: name,
                    id,
                    phaseId
                });
            }

            function removeDivisionFromArray(divisionId) {
                let index = service.factory.divisions.findIndex(division => division.id === divisionId);
                if (index !== -1) {
                    service.factory.divisions.splice(index, 1);
                }
            }
            
            return service.factory;
            
        }]); 
        
})();