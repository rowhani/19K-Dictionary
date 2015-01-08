angular.module('19kdic.controllers', [])

.controller('AppCtrl', function($scope, common) {
  console.log("App");  
})

.controller('SearchCtrl', function($scope, $timeout, common) {
	console.log("Search");	
	
	$scope.searchData = {
		query : ''
	}
  
	$scope.clearSearch = function() {
		$scope.searchData.query = '';
		$scope.results = [];
		$scope.searching = false;
	};
	
	$scope.clearSearch();
	
	function search() {
		console.log("Searching...");
		$scope.results = [];
		$scope.$apply();
		$scope.results = common.lookup($scope.searchData.query);
		$scope.searchTimeout = null;
		$scope.searching = false;
		$scope.$apply();
		console.log("Results:", $scope.searchData.query, $scope.results.length);
	}
	
	$scope.search = function($event) {
		$scope.searching = true;
		if ($scope.searchTimeout){
			window.clearTimeout($scope.searchTimeout);
		}  
		$scope.searchTimeout = setTimeout(search, 500);
	};
	
	$scope.highlight = function(el) {
		$timeout(function(){
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
	$scope.meanings = [];
	$.each(meanings, function() {
		var parts = []
		$.each(this.split(" "), function() {
			parts.push(common.getWordLink(this, $stateParams.wordId));
		});
		$scope.meanings.push(parts.join(" "));
	});
})