﻿(function () {

  var injectParams = ['$http', '$rootScope','$q', 'localStorageService', 'config'];

  var authFactory = function ($http, $rootScope, $q, localStorageService, config) {
    var serviceBase = config.serviceBase,
            factory = {
                loginPath: '/login',
                user: {
                  isAuthenticated: false,
                  roles: null,
                  email: ''
                }
            };

        function changeAuth(loggedIn) {
          factory.user.isAuthenticated = loggedIn;
          $rootScope.$broadcast('loginStatusChanged', loggedIn);
        }

        factory.login = function (email, password) {
          var data = "grant_type=password&username=" + email + "&password=" + password + "&client_id=" + config.clientId;

          var deferred = $q.defer();

          $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

            localStorageService.set('authorizationData', { token: response.access_token, email: email, refreshToken: response.refresh_token, useRefreshTokens: true });
            var loggedIn = response.access_token !== '';
            changeAuth(loggedIn);

            factory.user.isAuthenticated = true;
            factory.user.email = email;

            deferred.resolve(response);

          }).error(function (err, status) {
            logout();
            deferred.reject(err);
          });

          return deferred.promise;
        };

        factory.logout = function () {
          localStorageService.remove('authorizationData');
          factory.user.email = '';
          changeAuth(false);
        };

        factory.redirectToLogin = function () {
            $rootScope.$broadcast('redirectToLogin', null);
        };

        factory.fillAuthData = function () {
          var authData = localStorageService.get('authorizationData');
          if (authData) {
            factory.user.isAuthenticated = true;
            factory.user.email = authData.email;
          }
        };

        return factory;
    };

    authFactory.$inject = injectParams;

    angular.module('fanSelectorApp').factory('authService', authFactory);

}());
