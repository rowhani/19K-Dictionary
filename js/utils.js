angular.module('19kdic.utils', [])


.factory('common', ['$rootScope', function($rootScope) {
	return {
		convertNumber: function(text) {
			var numberMap = {
				'0': '٠',
				'1': '١',
				'2': '٢',
				'3': '٣',
				'4': '٤',
				'5': '٥',
				'6': '٦',
				'7': '٧',
				'8': '٨',
				'9': '٩',
			};
			
			angular.forEach(numberMap, function(value, key) {
				text = text.replace(key, value);
			});
			return text;
		},
		
		getRawQuery: function(query) {
			return $.trim(query).replace("  ", " ").replace("ی", "ي").replace("ک", "ك");
		},
	
		getCleanQuery: function(query) {
			return $.trim(query).replace(/^[ء]+|[ء]+$/g, "")
								.replace(".", " ").replace("-", " ").replace("(", " ").replace(")", " ").replace("  ", " ")
								.replace("ي", "ی").replace("ك", "ک")
								.replace("آ", "ا").replace("إ", "ا").replace("أ", "ا").replace("ٱ", "ا")
								.replace("َ", "").replace("ُ", "").replace("ِ", "")
								.replace("ً", "").replace("ٌ", "").replace("ٍ", "")
								.replace("ّ", "").replace("ْ", "")
								.replace("ة", "ه").replace("ۀ", "ه")
								.replace("ء", "ی").replace("ؤ", "و").replace("ئ", "ی");
		},
		
		simpleLookup: function(rawQuery, cleanQuery) {
			var allMatches = $rootScope.db({ key: { leftnocase: [cleanQuery, rawQuery] } }).order("word");
			return allMatches.get();
		},

		unorderedLookup: function(rawQuery, cleanQuery) {	
			var allMatches = $rootScope.db({ key: { likenocase: [cleanQuery, rawQuery] } }).order("word");
			return allMatches.get();
		},
		
		orderedLookup: function(rawQuery, cleanQuery) {
			var partialMatches = $rootScope.db({ key: { likenocase: [cleanQuery, rawQuery] } }).order("word");
			var exactMatches = $rootScope.db({ key: { likenocase: [cleanQuery, rawQuery] }, word: { leftnocase: rawQuery } }).order("word");
			var allMatches = exactMatches.get();
			var words = $.map(allMatches, function(r, i) { return r.word; });
			partialMatches.each(function (record, recordnumber) { 
				if (words.indexOf(record.word) == -1) {
					allMatches.push(record); 
				}
			}); 		
			return allMatches;
		},
		
		lookup: function(query) {
			var rawQuery = this.getRawQuery(query);
			var cleanQuery = this.getCleanQuery(query);
			
			if (cleanQuery.length == 0) {
				return []
			}
			else if (cleanQuery.length < 3) {
				return this.simpleLookup(rawQuery, cleanQuery);
			} else {
				return this.orderedLookup(rawQuery, cleanQuery);
			}
		},
		
		getWord: function(id) {
			return $rootScope.words[id];
		},
		
		getMeanings: function(id) {
			var _this = this;
			
			var lastParenthese = 0;
			var meanings = $rootScope.meanings[id];
			$.each(meanings.split(""), function (i, m) {
				if (m == "(") {
					lastParenthese = i;
				} else if (m == ")"){
					meanings = meanings.substr(0, lastParenthese) + meanings.substring(lastParenthese, i).replace("-", "،") + meanings.substr(i);
				}
			});
			
			meanings = $.map(meanings.split("-"), function(m, i) { 
				return _this.convertNumber($.trim(m).replace(/^[\.]+|[\.]+$/g, ""));
			});
			
			return meanings;
		},
		
		getWordLink: function(word, queryWordId) {
			if (word.length < 3) {
				return word;
			}
			
			var cleanWord = this.getCleanQuery(word);
			var results = $rootScope.db({ key: cleanWord });
			if (results.count() && results.first().id != parseInt(queryWordId)) {
				return '<a href="#/app/search/' + results.first().id + '">' + word + '</a>';
			} else {
				return word;
			}
		}
	}
}])