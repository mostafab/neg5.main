import angular from 'angular';
import ngCookies from 'angular-cookies';
import ngAnimate from 'angular-animate';
import config from './modules/config';
import IndexController from './modules/controllers/index.controller';
import HomeController from './modules/controllers/home.controller';
import TournamentController from './modules/controllers/tournament.controller';
import MatchController from './modules/controllers/match.controller';
import TeamController from './modules/controllers/team.controller';
import StatisticsController from './modules/controllers/statistics.controller';
import ConfigController from './modules/controllers/config.controller';
import AuthService from './modules/services/auth.service';
import TournamentService from './modules/services/tournament.service';
import MatchService from './modules/services/match.service';
import TeamService from './modules/services/team.service';
import PhaseService from './modules/services/phase.service';
import QBJService from './modules/services/qbj.service';
import QBJHttpService from './modules/services/http/qbj-http.service';
import PhaseHttpService from './modules/services/http/phase-http.service';
import MatchHttpService from './modules/services/http/match-http.service';
import TeamHttpService from './modules/services/http/team-http.service';
import MatchUtilFactory from './modules/factories/util/match-util.factory';
import PreventSameMatchTeamFilter from './modules/filters/prevent-same-match-teams';

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
  .factory('MatchUtilFactory', MatchUtilFactory)
  .controller('TournamentCtrl', TournamentController)
  .controller('GameCtrl', MatchController)
  .controller('TeamCtrl', TeamController)
  .controller('StatisticsCtrl', StatisticsController)
  .controller('ConfigCtrl', ConfigController)
  .filter('preventSameMatchTeams', PreventSameMatchTeamFilter);
