import angular from 'angular';
import ngCookies from 'angular-cookies';
import ngAnimate from 'angular-animate';
import config from './modules/config';
import IndexController from './modules/controllers/index.controller';
import HomeController from './modules/controllers/home.controller';
import TournamentController from './modules/controllers/tournament.controller';
import MatchController from './modules/controllers/match.controller';
import AuthService from './modules/services/auth.service';
import TournamentService from './modules/services/tournament.service';
import MatchService from './modules/services/match.service';
import MatchHttpService from './modules/services/http/match-http.service';
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
  .factory('MatchUtilFactory', MatchUtilFactory)
  .controller('TournamentCtrl', TournamentController)
  .controller('GameCtrl', MatchController)
  .filter('preventSameMatchTeams', PreventSameMatchTeamFilter);