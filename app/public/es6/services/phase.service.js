(() => {
   
   angular.module('tournamentApp')
        .factory('Phase', ['$http', '$q', 'Cookies', 'Tournament', function($http, $q, Cookies, Tournament) {
            
            let service = this;
            
            let phases = [];

            let activePhase = Tournament.activePhase;

            service.phaseFactory = {
                phases,

                postPhase,
                editPhase,
                getPhases,
                deletePhase,
                updateActivePhase,

                activePhase
            }
            
            function postPhase(tournamentId, phaseName) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        name: phaseName
                    }
                    $http.post('/api/t/' + tournamentId + '/phases', body)
                        .then(({data}) => {
                            addNewPhaseToArray(data.result);
                            if (service.phaseFactory.phases.length === 1) {
                                updateActivePhase(tournamentId, data.result.id)
                                    .then(() => resolve(data.result.name))
                            } else {
                                resolve(data.result.name);
                            }                            
                        })
                        .catch(error => reject(error));
                })
            }

            function editPhase(tournamentId, newName, phaseId) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        newName
                    }
                    $http.put('/api/t/' + tournamentId + '/phases/' + phaseId, body)
                        .then(({data}) => {
                            updatePhaseInArray(data.result.id, data.result.name)
                            resolve(data.result.name);
                        })
                        .catch(error => reject(error));
                })
            }
            
            function getPhases(tournamentId) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '/phases?token=' + token)
                        .then(({data}) => {
                            let formattedPhases = data.result.map(({name, id}) => {
                                return {
                                    name,
                                    newName: name,
                                    id
                                }
                            });
                            angular.copy(formattedPhases, service.phaseFactory.phases);
                            resolve(formattedPhases);
                        })
                        .catch(error => reject(error));
                })
            }
            
            function deletePhase(tournamentId, id) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http.delete('/api/t/' + tournamentId + '/phases/' + id + '?token=' + token)
                        .then(({data}) => {
                            removePhaseFromArray(data.result.id, tournamentId);
                            if (service.phaseFactory.phases.length > 0 && data.result.id === service.phaseFactory.activePhase.id) {
                                updateActivePhase(tournamentId, service.phaseFactory.phases[0].id)
                                    .then(() => resolve(data.result.name));
                            } else {
                                updateActivePhaseObject(null);
                                resolve(data.result.name);
                            }
                        })
                        .catch(error => reject(error));
                })
            }

            function updateActivePhase(tournamentId, phaseId) {
                return $q((resolve, reject) => {
                    let body = {token: Cookies.get('nfToken')};
                    $http.put('/api/t/' + tournamentId + '/phases/' + phaseId + '/active', body)
                        .then(({data}) => {
                            updateActivePhaseObject(data.result.active_phase_id);
                            resolve()
                        })
                        .catch(error => reject(error));
                })
            }

            function updateActivePhaseObject(phaseId) {
                let matchingPhase = service.phaseFactory.phases.find(phase => phase.id === phaseId);
                service.phaseFactory.activePhase.id = matchingPhase ? matchingPhase.id : null;
                service.phaseFactory.activePhase.name = matchingPhase ? matchingPhase.name : null;
            }

            function updatePhaseInArray(id, newName) {
                let index = service.phaseFactory.phases.findIndex(phase => phase.id === id);
                if (index !== -1) {
                    service.phaseFactory.phases[index].name = newName;
                    if (service.phaseFactory.activePhase.id === id) {
                        updateActivePhaseObject(id);
                    }
                }
            }

            function addNewPhaseToArray({name, id}) {
                service.phaseFactory.phases.push({
                    name,
                    id,
                    newName: name
                })
            }

            function removePhaseFromArray(id, tournamentId) {
                let index = service.phaseFactory.phases.findIndex(phase => phase.id === id);
                if (index !== -1) {
                    service.phaseFactory.phases.splice(index, 1);                    
                }
            }

           
            
            return service.phaseFactory;
            
        }]); 
        
})();