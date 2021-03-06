// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.participants')

/**
 * Participants handlers.
 *
 * @module mm.addons.participants
 * @ngdoc service
 * @name $mmaParticipantsHandlers
 */
.factory('$mmaParticipantsHandlers', function($mmaParticipants, mmCoursesAccessMethods, $state, $mmContentLinkHandlerFactory) {
    var self = {};

    /**
     * Course nav handler.
     *
     * @module mm.addons.participants
     * @ngdoc method
     * @name $mmaParticipantsHandlers#coursesNavHandler
     */
    self.coursesNavHandler = function() {

        var self = {};

        /**
         * Check if handler is enabled.
         *
         * @return {Boolean} True if handler is enabled, false otherwise.
         */
        self.isEnabled = function() {
            return true;
        };

        /**
         * Check if handler is enabled for this course.
         *
         * @param  {Number} courseId     Course ID.
         * @param  {Object} accessData   Type of access to the course: default, guest, ...
         * @param  {Object} [navOptions] Course navigation options for current user. See $mmCourses#getUserNavigationOptions.
         * @param  {Object} [admOptions] Course admin options for current user. See $mmCourses#getUserAdministrationOptions.
         * @return {Boolean|Promise}     Promise resolved  with true if handler is enabled,
         *                               false or promise rejected or resolved with false otherwise.
         */
        self.isEnabledForCourse = function(courseId, accessData, navOptions, admOptions) {
            if (accessData && accessData.type == mmCoursesAccessMethods.guest) {
                return false; // Not enabled for guests.
            }

            if (navOptions && typeof navOptions.participants != 'undefined') {
                return navOptions.participants;
            }

            return $mmaParticipants.isPluginEnabledForCourse(courseId);
        };

        /**
         * Get the controller.
         *
         * @param {Number} courseId Course ID.
         * @return {Object}         Controller.
         */
        self.getController = function(courseId) {
            return function($scope, $state) {
                $scope.icon = 'ion-person-stalker';
                $scope.title = 'mma.participants.participants';
                $scope.class = 'mma-participants-handler';
                $scope.action = function($event, course) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $state.go('site.participants', {
                        course: course
                    });
                };
            };
        };

        return self;
    };

    /**
     * Content links handler.
     * Match user/index.php but NOT grade/report/user/index.php.
     *
     * @module mm.addons.participants
     * @ngdoc method
     * @name $mmaParticipantsHandlers#linksHandler
     */
    self.linksHandler = $mmContentLinkHandlerFactory.createChild(
            /\/user\/index\.php/, '$mmCoursesDelegate_mmaParticipants');

    // Check if the handler is enabled for a certain site. See $mmContentLinkHandlerFactory#isEnabled.
    self.linksHandler.isEnabled = function(siteId, url, params, courseId) {
        courseId = parseInt(params.id, 10) || courseId;
        if (!courseId || url.indexOf('/grade/report/') != -1) {
            return false;
        }

        return $mmaParticipants.isPluginEnabledForCourse(courseId, siteId);
    };

    // Get actions to perform with the link. See $mmContentLinkHandlerFactory#getActions.
    self.linksHandler.getActions = function(siteIds, url, params, courseId) {
        courseId = parseInt(params.id, 10) || courseId;

        return [{
            action: function(siteId) {
                // Always use redirect to make it the new history root (to avoid "loops" in history).
                $state.go('redirect', {
                    siteid: siteId,
                    state: 'site.participants',
                    params: {
                        course: {id: courseId}
                    }
                });
            }
        }];
    };

    return self;
});
