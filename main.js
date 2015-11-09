// Create application with dependency 'firebase'
var data;
var baseUrl = 'https://api.spotify.com/v1/search?type=track&query='
var myApp = angular.module('myApp', ['firebase']);
var a = "nothing";
var artist = "nobody";

// Bind controller, passing in $scope, $firebaseAuth, $firebaseArray, $firebaseObject
myApp.controller('myCtrl', function($http, $scope, $firebaseAuth, $firebaseArray, $firebaseObject){
	
	// Create a variable 'ref' to reference your firebase storage
	var ref = new Firebase('https://spotifyapp.firebaseio.com/');

    // Create references to store tweets and users
    var tweetsRef = ref.child('tweets');
    var usersRef = ref.child("users");

    // Create a firebaseArray of your tweets, and store this as part of $scope
    $scope.tweets = $firebaseArray(tweetsRef);    

    // Create a firebaseObject of your users, and store this as part of $scope
    $scope.users = $firebaseObject(usersRef);

	// Create authorization object that referes to firebase
	$scope.authObj = $firebaseAuth(ref);

	// Test if already logged in
	var authData = $scope.authObj.$getAuth();
	if (authData) {
		$scope.userId = authData.uid;
	} 

	// SignUp function
	$scope.signUp = function() {
		// Create user
		$scope.authObj.$createUser({
			email: $scope.email,
			password: $scope.password, 			
		})

		// Once the user is created, call the logIn function
		.then($scope.logIn)

		// Once logged in, set and save the user data
		.then(function(authData) {
			$scope.userId = authData.uid;
			$scope.users[authData.uid] ={
				handle:$scope.handle, 
				userImage:$scope.userImage,
			}
			$scope.users.$save()
		})

		// Catch any errors
		.catch(function(error) {
			console.error("Error: ", error);
		});
	}

	// SignIn function
	$scope.signIn = function() {
		$scope.logIn().then(function(authData){
			$scope.userId = authData.uid;
		})
	}

	// LogIn function
	$scope.logIn = function() {
		console.log('log in')
		return $scope.authObj.$authWithPassword({
			email: $scope.email,
			password: $scope.password
		})
	}

	// LogOut function
	$scope.logOut = function() {
		$scope.authObj.$unauth()
		$scope.userId = false
	}


	$scope.audioObject = {}
	$scope.getSongs = function() {
		$http.get(baseUrl + $scope.track).success(function(response){
	 		data = $scope.tracks = response.tracks.items
		})
	}
	$scope.play = function(preview, song) {
		console.log('Now playing: ' + song.name);
		a = song.name;
		artist = song.artists[0].name;
		console.log(artist);
		if($scope.currentSong == preview) {
	  		$scope.audioObject.pause()
		    $scope.currentSong = false
		    return
		}
		else {
			if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
		    $scope.audioObject = new Audio(preview);
		    $scope.audioObject.play()  
		    $scope.currentSong = preview
		}
	}

	//display tweets
	$scope.tweet = function() {
		// Add a new object to the tweets array using the firebaseArray .$add method. 		
		$scope.tweets.$add({
			text:$scope.newTweet, 
			userId:$scope.userId, 
			likes:0, 
			time:Firebase.ServerValue.TIMESTAMP,
			song: a,
			artist: artist
		})
		
		// Once the tweet is saved, reset the value of $scope.newTweet to empty string
		.then(function() {
			$scope.newTweet = ''
		})
	}
	
	// Function to like a tweet
	$scope.like = function(tweet) {
		tweet.likes += 1;
		$scope.tweets.$save(tweet)
	} 
})

