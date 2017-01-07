import angular from 'angular';
import ngCookies from 'angular-cookies';
import ngAnimate from 'angular-animate';
import config from './modules/config';
import IndexController from './modules/controllers/index.controller';
import HomeController from './modules/controllers/home.controller';
import TournamentController from './modules/controllers/tournament.controller';
import MatchController from './modules/controllers/match.controller';
import TeamController from './modules/controllers/team.controller';
import PhaseController from './modules/controllers/phase.controller';
import StatisticsController from './modules/controllers/statistics.controller';
import ConfigController from './modules/controllers/config.controller';
import DivisionController from './modules/controllers/division.controller';
import CollaboratorSearchController from './modules/controllers/collaborator-search.controller';
import CollaboratorListController from './modules/controllers/collaborator-list.controller';
import AuthService from './modules/services/auth.service';
import TournamentService from './modules/services/tournament.service';
import MatchService from './modules/services/match.service';
import TeamService from './modules/services/team.service';
import PhaseService from './modules/services/phase.service';
import DivisionService from './modules/services/division.service';
import CollaboratorService from './modules/services/collaborator.service';
import QBJService from './modules/services/qbj.service';
import QBJHttpService from './modules/services/http/qbj-http.service';
import PhaseHttpService from './modules/services/http/phase-http.service';
import DivisionHttpService from './modules/services/http/division-http.service';
import MatchHttpService from './modules/services/http/match-http.service';
import TeamHttpService from './modules/services/http/team-http.service';
import CollaboratorHttpService from './modules/services/http/collaborator-http.service';
import MatchUtilFactory from './modules/factories/util/match-util.factory';
import PreventSameMatchTeamFilter from './modules/filters/prevent-same-match-teams';
import MatchSearchFilter from './modules/filters/match-search.filter';

angular.module('IndexApp', [ngCookies, ngAnimate])
  .config(config)
  .service('AuthService', AuthService)
  .controller('IndexController', IndexController);

angular.module('HomeApp', [ngCookies, ngAnimate])
  .config(config)
  .service('TournamentService', TournamentService)
  .controller('HomeController', HomeController);

angular.module('tournamentApp', [ngCookies, ngAnimate])
  .config(config)
  .service('TournamentService', TournamentService)
  .service('MatchService', MatchService)
  .service('MatchHttpService', MatchHttpService)
  .service('TeamService', TeamService)
  .service('TeamHttpService', TeamHttpService)
  .service('PhaseService', PhaseService)
  .service('PhaseHttpService', PhaseHttpService)
  .service('QBJHttpService', QBJHttpService)
  .service('QBJService', QBJService)
  .service('DivisionService', DivisionService)
  .service('DivisionHttpService', DivisionHttpService)
  .service('CollaboratorService', CollaboratorService)
  .service('CollaboratorHttpService', CollaboratorHttpService)
  .factory('MatchUtilFactory', MatchUtilFactory)
  .controller('TournamentCtrl', TournamentController)
  .controller('GameCtrl', MatchController)
  .controller('TeamCtrl', TeamController)
  .controller('StatisticsCtrl', StatisticsController)
  .controller('ConfigCtrl', ConfigController)
  .controller('PhaseController', PhaseController)
  .controller('DivisionController', DivisionController)
  .controller('CollaboratorSearchCtrl', CollaboratorSearchController)
  .controller('CollaboratorListCtrl', CollaboratorListController)
  .filter('preventSameMatchTeams', PreventSameMatchTeamFilter)
  .filter('matchSearch', MatchSearchFilter);
