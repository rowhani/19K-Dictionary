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
		$scope.letters = [];
		$scope.results = {};
		$scope.searching = false;
	};
	
	$scope.clearSearch();
	
	function search() {
		console.log("Searching...");
		var results = common.lookup($scope.searchData.query);
		$.each(results, function(i, r) {
			var ch = r.word.charAt(0);
			if ($scope.letters.indexOf(ch) == -1) {
				$scope.letters.push(ch);
				$scope.results[ch] = [];
			}
			$scope.results[ch].push(r);
		});		
		$scope.searchTimeout = null;
		$scope.searching = false;
		$scope.$apply();
		console.log("Results:", $scope.searchData.query, results.length);
	}
	
	$scope.search = function($event) {
		$scope.letters = [];
		$scope.results = {};
			
		if (!$scope.searchData.query.length) {
			$scope.searching = false;
			$scope.$apply();
			return;
		}
		
		$scope.searching = true;
		$scope.$apply();
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
		var parts = [];
		$.each(this.split(" "), function() {
			var meaning = $.trim(this.replace(")", " ").replace("(", " ").replace("»", " ").replace("«", " ").replace("»", " ").replace("  ", " "));
			parts.push(this.replace(meaning, common.getWordLink(meaning, $stateParams.wordId)));
		});
		$scope.meanings.push(parts.join(" "));
	});
})