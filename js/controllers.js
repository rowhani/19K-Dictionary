angular.module('19kdic.controllers', [])

.controller('AppCtrl', function($scope, common) {
  console.log("App");
})

.controller('SearchCtrl', function($scope, $rootScope, $state, $timeout, $window, common, localStorage) {
  console.log("Search");

  $scope.searchMode = $rootScope.lightVersion ? 'manual' : 'automatic';
  $scope.$apply();
  
  $scope.changeSearchMode = function(searchMode) {
    localStorage.set("searchMode", searchMode);
    $rootScope.lightVersion = searchMode == 'manual';
    $scope.searchMode = searchMode;
    $scope.$apply();
    $state.reload(); //$window.location.reload();
  };

  $scope.searchModeShown = false;
  $scope.toggleSearchModeViewer = function() {
    $scope.searchModeShown = !$scope.searchModeShown;
	alert($scope.searchMode + " " + $rootScope.lightVersion);
	$scope.$apply();
  }

  $scope.searchData = {
    query: ''
  };

  $scope.clearSearch = function() {
    $scope.searchData.query = '';
    $scope.letters = [];
    $scope.results = {};
    $scope.searching = false;
    $scope.searchStarted = false;
    $scope.showEmpty = false;
    $scope.showLogo = true;
  };

  $scope.clearSearch();

  function search() {
    console.log("Searching...");
    $scope.searchStarted = true;
    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
      $scope.$apply();
    }
    var results = common.lookup($scope.searchData.query);
    if (!$rootScope.lightVersion) {
      $.each(results, function(i, r) {
        var ch = r.word.charAt(0);
        if ($scope.letters.indexOf(ch) == -1) {
          $scope.letters.push(ch);
          $scope.results[ch] = [];
        }
        $scope.results[ch].push(r);
      });
    } else {
      $scope.letters = [''];
      $scope.results[''] = results;
    }
    $scope.showEmpty = (results.length == 0);
    $scope.searchTimeout = null;
    $scope.searching = false;
    $scope.searchStarted = false;
    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
      $scope.$apply();
    }
    console.log("Results:", $scope.searchData.query, results.length);
  }

  $scope.search = function($event) {
    $scope.letters = [];
    $scope.results = {};

    if (!common.getCleanQuery($scope.searchData.query).length) {
      $scope.searching = false;
      if (!$scope.searchData.query.length) {
        $scope.showEmpty = false;
        $scope.showLogo = true;
      } else {
        $scope.showEmpty = true;
        $scope.showLogo = false;
      }
      if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
        $scope.$apply();
      }
      return;
    }

    $scope.searching = true;
    $scope.showLogo = false;
    $scope.showEmpty = false;
    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
      $scope.$apply();
    }
    if (!$rootScope.lightVersion) {
      if ($scope.searchTimeout) {
        window.clearTimeout($scope.searchTimeout);
      }
      $scope.searchTimeout = setTimeout(search, 500);
    } else {
      search();
    }
  };

  $scope.highlight = function(el) {
    $timeout(function() {
      var cleanQuery = common.getCleanQuery($scope.searchData.query);
      var rawQuery = common.getRawQuery($scope.searchData.query);
      $(".result").highlight([cleanQuery, rawQuery]);
    }, 0);
  };
})

.controller('DefinitionCtrl', function($scope, $rootScope, $state, $stateParams, common) {
  console.log("Definition:", $stateParams.wordId);

  $scope.back = function() {
    $state.go('app.search');
  };

  $scope.word = common.getWord($stateParams.wordId);

  var meanings = common.getMeanings($stateParams.wordId);
  if (!$rootScope.lightVersion) {
    $scope.meanings = [];
    $.each(meanings, function() {
      var parts = [];
      $.each(this.split(" "), function() {
        var meaning = this.replaceAll(")", " ").replaceAll("(", " ").replaceAll("»", " ").replaceAll("«", " ").replaceAll("»", " ").replaceAll("  ", " ").trim();
        parts.push(this.replaceAll(meaning, common.getWordLink(meaning, $stateParams.wordId)));
      });
      $scope.meanings.push(parts.join(" "));
    });
  } else {
    $scope.meanings = meanings;
  }
})