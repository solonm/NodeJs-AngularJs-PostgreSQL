 angular.module('myApp', []).controller('myCtrl', 
     function($scope) {
      $scope.entries = [];     
    var socketid= null;
    var socket = io();
      console.log("binding events");
     /* socket.on('con', function(msg){
        if(socketid !== msg){
          $scope.entries = [];
          $scope.$apply();
        }
      	console.log('con: ', msg);
           //socket.emit("loaded");
           socketid = msg;
      });*/
      
       socket.on('init', function(msg){
         $scope.entries = [];
        var response = JSON.parse(msg);
        for(i=0;i<response.length;i++){
          $scope.entries.push(response[i]);
        }
        $scope.$apply();
      });
      
      socket.on('insert', function(msg){
      	console.log('insert: ', msg);
        var newEntry = msg.substring(1, msg.length-1).split(',');
        var entry = {"id": newEntry[0], "name":newEntry[1]};
        if(!containsObject(entry,$scope.entries)){
          $scope.entries.push(entry);
          $scope.$apply();
        }
      });
	  
     
	    socket.on('update', function(msg){
        var newEntry = msg.substring(1, msg.length-1).split(',');
        var entry = {"id": newEntry[0], "name":newEntry[1]};
      	for(i=0;i<$scope.entries.length;i++){
          if($scope.entries[i].id ==  entry.id){
            $scope.entries[i] = entry;
            $scope.$apply();  
          }
        }
      });
	  
	    socket.on('delete', function(msg){
      	var newEntry = msg.substring(1, msg.length-1).split(',');
        var entry = {"id": newEntry[0], "name":newEntry[1]};
      	for(i=0;i<$scope.entries.length;i++){
          if($scope.entries[i].id ==  entry.id){
            $scope.entries.pop(i);
            $scope.$apply();  
          }
        }
      });
      
      function containsObject(obj, list) {
         var i;
         for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
              return true;
            }
        }
        return false;
      }
   });