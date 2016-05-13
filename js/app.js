// Ionic Checklist App
// app.js

angular.module('checklist', ['ionic', 'ngCordova', 'ngStorage'])

// Setup
.run(function ($ionicPlatform, TaskService) {

    //Ionic Default Setup
    $ionicPlatform.ready(function () {
        if (cordova.platformId === 'ios' && window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        if (ionic.Platform.isAndroid()) {
            admobid = { // for Android
                banner: 'ca-app-pub-9807241074508080/6909980408' // Change this to your Ad Unit Id for banner...
            };

            if (AdMob)
                AdMob.createBanner({
                    adId: admobid.banner,
                    position: AdMob.AD_POSITION.BOTTOM_CENTER,
                    autoShow: true
                });
        }
        
    });

    //Restore Tasks
    TaskService.setTasks();
    console.log(TaskService.getAll());
    console.log("Loaded Tasks Successfully");
})

//Main View Controller
.controller('TasksCtrl', function ($scope, $ionicModal, $cordovaFile, TaskService) {

    //Initialize localStorage variable
    var storage = window.localStorage;

    //Tasks
    $scope.tasks = TaskService.getTasks();

    //New Task Modal
    $ionicModal.fromTemplateUrl('newTaskModal',
        {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

    //Edit Tasks Modal
    $ionicModal.fromTemplateUrl('editTaskModal',
        {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.editModal = modal;
        });

    //Read Text Fields for New Task
    $scope.newTaskInput = {
        taskName: '',
        taskComments: ''
    }

    //Read Text Fields for Edit Task
    $scope.editTaskInput = {
        taskName: '',
        taskComments: ''
    }

    //Open New Task Modal
    $scope.openNewTask = function () {
        $scope.modal.show();

    }

    //Close New Task Modal
    $scope.closeNewTask = function () {
        $scope.modal.hide();
    }

    //Open Edit Task Modal
    $scope.editTaskTask = [];
    $scope.openEditTask = function (task) {
        $scope.editModal.show();
        $scope.editTaskTask = task;
        $scope.editTaskInput.taskName = task.name;
        $scope.editTaskInput.taskComments = task.comment;

    }

    //Close Edit Task Modal
    $scope.closeEditTask = function () {
        $scope.editModal.hide();
    }

    //Create New Task
    $scope.newTask = function () {
        TaskService.makeTask($scope.newTaskInput.taskName, $scope.newTaskInput.taskComments);
        $scope.closeNewTask();
        $scope.newTaskInput.taskName = null;
        $scope.newTaskInput.taskComments = null;
    }

    //Swipe to Delete Task
    $scope.deleteTask = function (task) {
        TaskService.deleteTask(task);
    }

    //Swipe to Edit Task
    $scope.editTask = function () {
        TaskService.editTask($scope.editTaskTask, $scope.editTaskInput.taskName, $scope.editTaskInput.taskComments);
        $scope.closeEditTask();
        $scope.editTaskInput.taskName = null;
        $scope.editTaskInput.taskComments = null;
    }

    
})

//Detail View Controller (to get a task and comments)
.controller('TaskDetailCtrl', function ($scope, $stateParams, TaskService) {
    $scope.taskId = $stateParams.taskId;
    $scope.task = TaskService.getTask($scope.taskId);
})

//Set State Provider
.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.navBar.alignTitle('center');

    $stateProvider
        .state('tasks', {
            url: '/',
            templateUrl: 'tasks',
            controller: 'TasksCtrl'
        })
        .state('taskDetail', {
            url: '/:taskId',
            templateUrl: 'taskDetail',
            controller: 'TaskDetailCtrl'
        });

    $urlRouterProvider.otherwise("/");

})


.service('TaskService', function ($localStorage) {

    //Set initial tasks variable for localStorage
    $localStorage = $localStorage.$default({
        tasks: []
    });

    return {

        //Sample JSON data for tasks.
        /*tasks: [
        {
            id: '1',
            name: 'Milk',
            comment: 'Get it from the Frick Park Market.'
        }, 
        {
            id: '2',
            name: 'Eggs',
            comment: 'Get from chicken.'
        }
        ],*/

        tasks: [],

        //Retrieve tasks from localStorage
        getAll: function() {
            return $localStorage.tasks;
        },

        //Set Tasks to localStorage
        setTasks: function() {
            this.tasks = $localStorage.tasks;
        },

        //New Task
        makeTask: function(name, comment) {
            var newId = this.tasks.length + 1;
            var task = {
                id: newId,
                name: name,
                comment: comment
            };
            $localStorage.tasks.push(task);
        },

        //Delete Task
        deleteTask: function (task) {
            $localStorage.tasks.splice($localStorage.tasks.indexOf(task), 1);

            //Reassign ID's for smooth operation
            for (i = 0; i < this.tasks.length; i++) {
                this.tasks[i].id = i+1;
            };
        },

        //Edit Task
        editTask: function (task, name, comment) {
            task.name = name;
            task.comment = comment;
        },
        
        //Get tasks locally
        getTasks: function() {
            return this.tasks;
        },

        //Get specific task
        getTask: function (taskId) {

            for (i = 0; i < this.tasks.length; i++) {

                if (this.tasks[i].id == taskId) {
                    return this.tasks[i];
                }

            }

        }
    }
})