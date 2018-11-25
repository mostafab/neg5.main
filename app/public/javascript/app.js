/**
 * Import Bootstrap and jQuery
 */
import 'jquery';
import 'bootstrap/dist/js/bootstrap.min.js';

/**
 * Import css
 */
import './styles/v2/index.css';
import './styles/v2/pages-index.css';
import './styles/v2/neg-five-main.css';
import './styles/v2/reset.css';
import './styles/v2/style.css';
import './styles/v2/common.css';

/**
 * Import Angular dependencies
 */
import angular from 'angular';
import ngCookies from 'angular-cookies';
import ngAnimate from 'angular-animate';
import ngDragAndDrop from 'angular-drag-and-drop-lists';

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
import MatchKeyDetailsController from './modules/controllers/match-key-details.controller';
import TeamKeyDetailsController from './modules/controllers/team-key-details.controller';
import PoolsController from './modules/controllers/pools.controller';

import CollaboratorSearchController from './modules/controllers/collaborator-search.controller';
import CollaboratorListController from './modules/controllers/collaborator-list.controller';

import ScoresheetFormController from './modules/controllers/scoresheet/scoresheet-form.controller';
import ScoresheetPointsTrackerController from './modules/controllers/scoresheet/scoresheet-points-tracker.controller';
import ScoresheetCycleController from './modules/controllers/scoresheet/scoresheet-cycle.controller';
import ScoresheetTableController from './modules/controllers/scoresheet/scoresheet-table.controller';

import AuthService from './modules/services/auth.service';
import TournamentService from './modules/services/tournament.service';
import MatchService from './modules/services/match.service';
import TeamService from './modules/services/team.service';
import PhaseService from './modules/services/phase.service';
import DivisionService from './modules/services/division.service';
import CollaboratorService from './modules/services/collaborator.service';
import QBJService from './modules/services/qbj.service';

import SlugService from './modules/services/util/slug.service';

import QBJHttpService from './modules/services/http/qbj-http.service';
import PhaseHttpService from './modules/services/http/phase-http.service';
import DivisionHttpService from './modules/services/http/division-http.service';
import MatchHttpService from './modules/services/http/match-http.service';
import TeamHttpService from './modules/services/http/team-http.service';
import CollaboratorHttpService from './modules/services/http/collaborator-http.service';
import MatchKeyDetailsService from './modules/services/match-key-details.service';
import TeamKeyDetailsService from './modules/services/team-key-details.service';

import ScoresheetService from './modules/services/scoresheet/scoresheet.service';
import ScoresheetCycleService from './modules/services/scoresheet/scoresheet-cycle.service';
import ScoresheetPointsTrackerService from './modules/services/scoresheet/scoresheet-points-tracker.service';
import ScoresheetTableService from './modules/services/scoresheet/scoresheet-table.service';

import MatchUtilFactory from './modules/factories/util/match-util.factory';
import TournamentIdFactory, { KEY as TournamentIdFactoryKey } from './modules/factories/tournament-id.factory';

import PreventSameMatchTeamFilter from './modules/filters/prevent-same-match-teams';
import MatchSearchFilter from './modules/filters/match-search.filter';
import DivisionPhaseFilter from './modules/filters/division-phase.filter';

import ToolTipDirective from './modules/directives/tooltip.directive';

angular.module('IndexApp', [ngCookies, ngAnimate])
  .config(config)
  .service('AuthService', AuthService)
  .controller('IndexController', IndexController);

angular.module('HomeApp', [ngCookies, ngAnimate])
  .config(config)
  .service('TournamentService', TournamentService)
  .service('SlugService', SlugService)
  .controller('HomeController', HomeController);

angular.module('tournamentApp', [ngCookies, ngAnimate, 'dndLists'])
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
  .service('ScoresheetService', ScoresheetService)
  .service('ScoresheetCycleService', ScoresheetCycleService)
  .service('ScoresheetPointsTrackerService', ScoresheetPointsTrackerService)
  .service('ScoresheetTableService', ScoresheetTableService)
  .service('MatchKeyDetailsService', MatchKeyDetailsService)
  .service('TeamKeyDetailsService', TeamKeyDetailsService)
  .service('SlugService', SlugService)
  .factory('MatchUtilFactory', MatchUtilFactory)
  .factory(TournamentIdFactoryKey, TournamentIdFactory)
  .controller('TournamentCtrl', TournamentController)
  .controller('GameCtrl', MatchController)
  .controller('MatchKeyDetailsController', MatchKeyDetailsController)
  .controller('TeamCtrl', TeamController)
  .controller('TeamKeyDetailsController', TeamKeyDetailsController)
  .controller('StatisticsCtrl', StatisticsController)
  .controller('ConfigCtrl', ConfigController)
  .controller('PhaseController', PhaseController)
  .controller('DivisionController', DivisionController)
  .controller('CollaboratorSearchCtrl', CollaboratorSearchController)
  .controller('CollaboratorListCtrl', CollaboratorListController)
  .controller('ScoresheetFormCtrl', ScoresheetFormController)
  .controller('ScoresheetCycleController', ScoresheetCycleController)
  .controller('ScoresheetPointsTrackerCtrl', ScoresheetPointsTrackerController)
  .controller('ScoresheetTableController', ScoresheetTableController)
  .controller('PoolsController', PoolsController)
  .filter('preventSameMatchTeams', PreventSameMatchTeamFilter)
  .filter('matchSearch', MatchSearchFilter)
  .filter('divisionPhase', DivisionPhaseFilter)
  .directive('tooltip', ToolTipDirective);

