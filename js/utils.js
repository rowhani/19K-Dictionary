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
        text = text.replaceAll(key, value);
      });
      return text;
    },

    getRawQuery: function(query) {
      return query.trim().replaceAll("  ", " ").replaceAll("ی", "ي").replaceAll("ک", "ك");
    },

    getCleanQuery: function(query) {
      return query.trim().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, " ").replaceAll("  ", " ").trim().replace(/^[ء]+|[ء]+$/g, "")
        .replaceAll("ي", "ی").replaceAll("ك", "ک")
        .replaceAll("آ", "ا").replaceAll("إ", "ا").replaceAll("أ", "ا").replaceAll("ٱ", "ا")
        .replaceAll("َ", "").replaceAll("ُ", "").replaceAll("ِ", "")
        .replaceAll("ً", "").replaceAll("ٌ", "").replaceAll("ٍ", "")
        .replaceAll("ّ", "").replaceAll("ْ", "")
        .replaceAll("ة", "ه").replaceAll("ۀ", "ه")
        .replaceAll("ء", "ی").replaceAll("ؤ", "و").replaceAll("ئ", "ی");
    },

    simpleLookup: function(rawQuery, cleanQuery, limit) {
      var allMatches = $rootScope.db({
        key: {
          leftnocase: cleanQuery
        }
      }).order("word");
      return allMatches.limit(limit).get();
    },

    unorderedLookup: function(rawQuery, cleanQuery, limit) {
      var allMatches = $rootScope.db({
        key: {
          likenocase: cleanQuery
        }
      }).order("word").limit(limit);
      return allMatches.get();
    },

    orderedLookup: function(rawQuery, cleanQuery, limit) {
      var partialMatches = $rootScope.db({
        key: {
          likenocase: cleanQuery
        }
      }).order("word").limit(limit);
      var exactMatches = $rootScope.db({
        word: {
          leftnocase: rawQuery
        }
      }).order("word").limit(limit);
      var allMatches = exactMatches.get();
      var words = $.map(allMatches, function(r, i) {
        return r.word;
      });
      partialMatches.each(function(record, recordnumber) {
        if (words.indexOf(record.word) == -1) {
          allMatches.push(record);
        }
      });
      return allMatches;
    },

    lookup: function(query, limit) {
      if (!limit) {
        limit = 50;
      }
      var rawQuery = this.getRawQuery(query);
      var cleanQuery = this.getCleanQuery(query);

      if (cleanQuery.length == 0) {
        return []
      } else if (cleanQuery.length < 3 || $rootScope.lightVersion) {
        return this.simpleLookup(rawQuery, cleanQuery, limit);
      } else {
        return this.orderedLookup(rawQuery, cleanQuery, limit);
      }
    },

    getWord: function(id) {
      return $rootScope.words[id];
    },

    getMeanings: function(id) {
      var _this = this;

      var lastParenthese = 0;
      var meanings = $rootScope.meanings[id];
      $.each(meanings.split(""), function(i, m) {
        if (m == "(") {
          lastParenthese = i;
        } else if (m == ")") {
          meanings = meanings.substr(0, lastParenthese) + meanings.substring(lastParenthese, i).replaceAll("-", "،") + meanings.substr(i);
        }
      });
      meanings = $.map(meanings.replaceAll("(", "-(").split("-"), function(m, i) {
        return _this.convertNumber(m.trim().replaceAll("  ", " ").replace(/^[\.]+|[\.]+$/g, ""));
      });

      return meanings;
    },

    getWordLink: function(word, queryWordId) {
      if (word.length < 3) {
        return word;
      }

      var cleanWord = this.getCleanQuery(word);
      var results = $rootScope.db({
        key: cleanWord
      });
      if (results.count() && results.first().id != parseInt(queryWordId)) {
        return '<a href="#/app/search/' + results.first().id + '"><strong>' + word + '</strong></a>';
      } else {
        return word;
      }
    }
  }
}])

.factory('localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    remove: function(key) {
      delete $window.localStorage[key];
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    setTiedObject: function(key, value) {
      var obj = this.getObject(key) || {};
      var apiKey = this.get('api_key');
      obj[apiKey] = value;
      this.setObject(key, obj);
    },
    getTiedObject: function(key, value) {
      var obj = this.getObject(key) || {};
      return obj[value];
    }
  }
}]);

String.prototype.replaceAll = function(search, replace) {
  search = new RegExp(search.replace(".", "\\.").replace("(", "\\(").replace(")", "\\)"), "g");
  return this.replace(search, replace);
}

String.prototype.trim = function() {
  return $.trim(this);
}