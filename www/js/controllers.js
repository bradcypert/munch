angular.module('starter.controllers', [])

.service('dateService', function(){
  return {
    getCurrentDay : function(){
      var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      var date = new Date();
      return days[date.getDay()] + ", " + date.toLocaleDateString();
    },
    getFirstDayOfMonth : function(){
      var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      var day = firstDay.getDay();
      return day;
    },
    getLastDayOfLastMonth : function(){
      var date = new Date();
      var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
      var day = lastDay.getDate();
      return day;
    },
    getLastDayOfThisMonth : function(){
      var date = new Date();
      var lastDay = new Date(date.getFullYear(), date.getMonth()+1, 0);
      console.log(lastDay);
      var day = lastDay.getDate();
      return day;
    },
    getCurrentDate : function(){
      var date = new Date();
      return date.getDate();
    }
  }
})

.service('storageService', function(){
  return{
    getItem: function(item){
      JSON.parse(window.localStorage.getItem(item)) || {}
    },
    setItem: function(item, value){

    }
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.settings = JSON.parse(window.localStorage.getItem('settings')) || {};
  $scope.calendar = JSON.parse(window.localStorage.getItem('calendar')) || {};

  //TODO: Is this actually being used?
  $scope.preferences = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.updateSettings = function() {
    console.log('Saving Settings...', $scope.settings);

    window.localStorage.setItem('settings', angular.toJson($scope.settings));

    $scope.closeLogin();
  }
})

.controller('PlannerCtrl', function($scope, dateService){
  $scope.today = dateService.getCurrentDay();
  $scope.firstDayOfMonth = dateService.getFirstDayOfMonth();
  $scope.lastDayOfLastMonth = dateService.getLastDayOfLastMonth();
  $scope.lastDayOfThisMonth = dateService.getLastDayOfThisMonth();
  $scope.currentDate = dateService.getCurrentDate();
  $scope.calendar = [];


  for(i = 1; i <= $scope.firstDayOfMonth; i++){
    $scope.calendar.push($scope.lastDayOfLastMonth - $scope.firstDayOfMonth + i);
  }
  for(i = 1; i <= $scope.lastDayOfThisMonth; i++){
    $scope.calendar.push(i);
  }
  for(i = 0; i < $scope.calendar.length%7; i++){
    $scope.calendar.push(i+1);
  }

  $scope.getRow = function(id) {
    var array = [];
    for(i = id*7; i < (id+1)*7; i++){
      array.push($scope.calendar[i]);
    }
    return array;
  }

})

.controller('CurrentDayCtrl', function($rootScope, $scope, dateService) {
  $scope.today = dateService.getCurrentDay();
  var today = new Date();
  $scope.paramDate = dateService.getCurrentDate();
  $scope.saveDate = today.toDateString();
  console.log("Read From :", $scope.saveDate);

  $rootScope.$on('update-local-storage', function(event, args) {
    $scope.dailyFood = JSON.parse(window.localStorage.getItem($scope.saveDate)) || {meals: []};
    $scope.totalDailyCalories = 0;
    $scope.dailyFood.meals.forEach(function(element, index, array){
      $scope.totalDailyCalories += parseInt(element.calories) ? parseInt(element.calories) : 0;
    });
  });

  $scope.dailyFood = JSON.parse(window.localStorage.getItem($scope.saveDate)) || {meals: []};
  $scope.totalDailyCalories = 0;
  $scope.dailyFood.meals.forEach(function(element, index, array){
    $scope.totalDailyCalories += parseInt(element.calories) ? parseInt(element.calories) : 0;
  });
})

.controller('AddToCookbookCtrl', function($scope, $rootScope, $ionicHistory){
  $scope.item = {};
  $scope.cookbook = JSON.parse(window.localStorage.getItem('cookbook')) || [{id:0,
    name: 'Three Cheese Penne',
    servingSize: '8oz',
    calories: 500,
    protein: 16,
    transFat: 4,
  }];

    $scope.addToCookbook = function(){
    var item = $scope.item;
    $scope.cookbook[$scope.cookbook.length] = item;
    window.localStorage.setItem('cookbook', angular.toJson($scope.cookbook));
    $rootScope.$broadcast('update-local-storage');
    $ionicHistory.goBack();
  };
  $scope.function = $scope.addToCookbook;
  $scope.command = "Add";
})

.controller('EditCookbookCtrl', function($scope, $location, $ionicHistory, $window, $rootScope){
  $scope.index = $location.search().index;

  $scope.cookbook = JSON.parse(window.localStorage.getItem('cookbook')) || [{id:0,
    name: 'Three Cheese Penne',
    servingSize: '8oz',
    calories: 500,
    protein: 16,
    transFat: 4,
  }];

  $scope.item = $scope.cookbook[$scope.index];
  $scope.command = "Save";
  $scope.function = $scope.saveToCookbook;

  $scope.saveToCookbook = function(id){
    $scope.cookbook[id] = $scope.item;
    window.localStorage.setItem('cookbook', angular.toJson($scope.cookbook));
    $rootScope.$broadcast('update-local-storage');
    $ionicHistory.goBack();
  };

  $scope.removeFromCookbook = function(id){
    console.log("Removing from cookbook");
    $scope.cookbook.splice(id,1);
    window.localStorage.setItem('cookbook', angular.toJson($scope.cookbook));
    $rootScope.$broadcast('update-local-storage');
    $ionicHistory.goBack();
  };

})

.controller('AddToDayCtrl', function($scope, $rootScope, dateService, $location){

  $scope.date = dateService.getCurrentDate();
  var difference = 0;
  var today = new Date();
  var saveDate = new Date(today);

  if($location.search() && $location.search().date)
  {
    console.log($location.search());
    difference = $location.search().date - $scope.date;
  }

  if(difference != 0)
    saveDate.setDate(today.getDate()+difference);

  $scope.displayDate = saveDate.toDateString().substr(0,3);
  switch($scope.displayDate){
    case "Sun":
      $scope.displayDate = "Sunday";
      break;
    case "Mon":
      $scope.displayDate = "Monday";
      break;
    case "Tue":
      $scope.displayDate = "Tuesday";
      break;
    case "Wed":
      $scope.displayDate = "Wednesday";
      break;
    case "Thu":
      $scope.displayDate = "Thursday";
      break;
    case "Fri":
      $scope.displayDate = "Friday";
      break;
    case "Sat":
      $scope.displayDate = "Saturday";
      break;
  }

  $scope.saveDate = saveDate.toDateString();

  $rootScope.$on('update-local-storage', function(event, args) {
    $scope.cookbook = JSON.parse(window.localStorage.getItem('cookbook')) || [{id:0,
      name: 'Three Cheese Penne',
      servingSize: '8oz',
      calories: 500,
      protein: 16,
      transFat: 4,
    }];
    $scope.cookbook.forEach(function(element1, index1, array1){
      $scope.plannedDate.meals.forEach(function(element2, index2, array2){
        console.log("elems: ", element1.name, element2.name);
        if(element1.name == element2.name)
          element1.checked = true;
      });
    });
  });

  $scope.cookbook = JSON.parse(window.localStorage.getItem('cookbook')) || [{id:0,
    name: 'Three Cheese Penne',
    servingSize: '8oz',
    calories: 500,
    protein: 16,
    transFat: 4,
  }];

  $scope.plannedDate = JSON.parse(window.localStorage.getItem($scope.saveDate)) || {meals: []};
  $scope.cookbook.forEach(function(element1, index1, array1){
    $scope.plannedDate.meals.forEach(function(element2, index2, array2){
      console.log("elems: ", element1.name, element2.name);
      if(element1.name == element2.name)
        element1.checked = true;
    });
  });

  $scope.existsInPlannedMeals = function(item){
    if($scope.plannedDate.meals.indexOf(item) > -1)
      return true;
    return false;
  };

  $scope.toggleItemForDay = function(day, item){
    var index = -1;
    $scope.plannedDate.meals.forEach(function(element, counter, array){
      if(element.name == item.name)
        index = counter;
    });
    if(index > -1){
      $scope.plannedDate.meals.splice(index,1);
    } else{
      $scope.plannedDate.meals.push(item);
    }
    //Save to local storage
    console.log($scope.plannedDate);
    window.localStorage.setItem($scope.saveDate, angular.toJson($scope.plannedDate));
    $rootScope.$broadcast('update-local-storage');
  }; //End Function
  //End Controller
})

.controller('CookbookCtrl', function($scope, $rootScope){
  //TODO: Evaluate passing one object + id and updating/adding to list.
  $rootScope.$on('update-local-storage', function(event, args) {
    $scope.cookbook = JSON.parse(window.localStorage.getItem('cookbook')) || [{id:0,
      name: 'Three Cheese Penne',
      servingSize: '8oz',
      calories: 500,
      protein: 16,
      transFat: 4,
    }];
  });

  $scope.cookbook = JSON.parse(window.localStorage.getItem('cookbook')) || [{id:0,
    name: 'Three Cheese Penne',
    servingSize: '8oz',
    calories: 500,
    protein: 16,
    transFat: 4,
  }];
});
