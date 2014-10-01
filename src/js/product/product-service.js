/**
 * Created by fortesl on 9/2/2014.
 */

(function() {
    'use strict';

    var app = angular.module('product');

    app.factory('ProductService', ['$http', 'aerobatic', function($http, aerobatic) {
        return {
            errorMessage: '',

            getList: function() { return $http.get(aerobatic.assetUrl('/storeData/products.json')); },

            getDetail: function(productId) { return $http.get(aerobatic.assetUrl('/storeData/' + productId + '.json')); }
        };
    }]);
})();
