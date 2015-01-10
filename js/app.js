angular.module('19kdic', ['ionic', '19kdic.utils', '19kdic.controllers'])

.run(function($ionicPlatform, $rootScope, $state, $location, $ionicLoading, common, localStorage) {
  $ionicPlatform.ready(function() {
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    ionic.Platform.isFullScreen = true;

    document.addEventListener("backbutton", function() {
      if ($location.path().length > '/app/search/'.length) {
        $state.go('app.search');
      } else {
        navigator.app.exitApp();
      }
    }, false);

    function loadFile(path, callback) {
      $.ajax({
        url: path,
        dataType: "text",
        success: function(data) {
          callback(data)
        }
      });
    }

    function createDB() {
      var records = [];
      $.each($rootScope.words, function(i, k) {
        records.push({
          id: i,
          key: common.getCleanQuery($rootScope.words[i]),
          word: common.getRawQuery($rootScope.words[i]),
          meaning: $rootScope.meanings[i].trim()
        });
      });

      $rootScope.db = TAFFY(records);
      console.log("DB Loaded");
    }

    function initialize() {
      $ionicLoading.show({
        template: 'در حال بارگذاری...'
      });
      loadFile("db/words.txt", function(data) {
        $rootScope.words = data.split("\n");
        loadFile("db/meanings.txt", function(data) {
          $rootScope.meanings = data.split("\n");
          createDB();
          $ionicLoading.hide();
        })
      });
    }

    initialize();

    $rootScope.lightVersion = localStorage.get("searchMode") == 'manual';
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/app.html",
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: "/search",
    views: {
      'appContent': {
        templateUrl: "templates/search.html",
        controller: 'SearchCtrl'
      }
    }
  })

  .state('app.definition', {
    url: "/search/:wordId",
    views: {
      'appContent': {
        templateUrl: "templates/definition.html",
        controller: 'DefinitionCtrl'
      }
    }
  })

  $urlRouterProvider.otherwise('/app/search');
});