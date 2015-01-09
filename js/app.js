angular.module('19kdic', ['ionic', '19kdic.utils', '19kdic.controllers'])

.run(function($ionicPlatform, $rootScope, $state, common) {
	alert("Run");
	console.log("Run");
  $ionicPlatform.ready(function() {
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    ionic.Platform.isFullScreen = true;
	alert("Ready");
	console.log("Ready");
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
          meaning: $.trim($rootScope.meanings[i])
        });
      });

      $rootScope.db = TAFFY(records);
	  alert("DB Loaded");
      console.log("DB Loaded");
    }

    function initialize() {
		alert("initialize");
	console.log("initialize");
      loadFile("db/words.txt", function(data) {
        $rootScope.words = data.split("\n");
        loadFile("db/meanings.txt", function(data) {
          $rootScope.meanings = data.split("\n");
		  alert("initialize done");
	console.log("initialize done");
          createDB();
        })
      });
    }

    initialize();
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