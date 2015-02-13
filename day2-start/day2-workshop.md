# Introduction

### Seeding the Database

In the previous workshop your flashcard data was being stored in your `'MainController'` as an array of objects placed on the `$scope`.  For today's workshop you will be retrieving the flashcard data from your Mongo database.  We have provided you with a `seed.js` file that when ran will create flash cards in  your database.  If you would like you can take a look in the file and you will see some familiar mongoose methods as well as some other stuff.

Before you do anything:

```bash
$ npm install
```

If your mongoDB isn't already running enter the command:

```bash
$ mongod
```

You can then seed the database by running the following command in the terminal in the root directory of today's workshop:

```bash
$ node seed.js
```

If completed successfully you should see the message:

```bash
Database seeded!
```

# Getting Flashcards from the Server

### Creating the FlashCards Factory

Now that your flashcard data is in the database you need to go about retrieving it.  The first step is to start up you express server:

```bash
$ node start.js
```

In your `/public/app.js` file you will now make an Angular Factory that can make an AJAX request to your server and be able to use this data in your app.  Remember that Angular has a built-in factory called `$http` that can be dependency injected throughout your app that will allow you to make AJAX requests.  Make sure to check out your `/server/app.js` file to see what is happening when we hit the `'/cards'` route.  Copy and paste the following code block into your `/public/app.js` file.

```javascript
app.factory('FlashCardsFactory', function ($http) {
    return {
        getFlashCards: function () {
            return $http.get('/cards').then(function (response) {
                return response.data;
            });
        }
    };
});
```

Upon further inspection you can see that the `'FlashCardsFactory'` returns an object that contains a function.  This `getFlashCards` function will return a promise for the `response.data` which in this case is an array of flashcards.  It is important to note that you are using `.then()` after the `$http.get()` call.  This indicates that `$http.get()` returns a promise that you use `.then()` with a callback function to access the data.  Finally notice that the function returns a promise for the `response.data` rather than the entire `response` object.  This is because at this time we are only concerned with this factory returning the data from the request.

### Using the Factory

It is great that you have a Factory now but what are you going to do with it? If you remember from the first workshop the flashcard data array was placed in the `'MainController'` on the scope as `$scope.flashCards`.  This provided the data to your HTML template for angular to interpolate in various ways such as `{{ flashcards }}`.
Now that you have a Factory with a function that will get that data for you lets use it.  In order to call the `getFlashCards` function in your `'MainController'` you are going to need to dependency inject `'FlashCardsFactory'`.  You can then set `$scope.flashCards` equal to the return of the promise from `FlashCardFactory.getFlashCards()`.  Your `'MainController'` should look like this:

```javascript
app.controller('MainController', function ($scope, FlashCardsFactory) {
    $scope.flashCards = [];
    
    FlashCardsFactory.getFlashCards().then(function (cards) {
    	$scope.flashCards = cards;
    });
});
```

Another key aspect of the above code is that you set `$scope.flashCards` to an empty array.  In a way this is like instantiating a variable (e.g. `var x = []`) except you are creating the value on the `$scope`.  This is very important because when you run your app Angular will parse the HTML and look for properties on the `$scope`.  For example if you are evaluating the length of flashCards array with `'flashCards.length'` and the AJAX call has not returned yet, then you are going to get an `undefined` error. Therefore if you didn't create an empty placeholder on the `$scope` you are setting up a race condition.  The place holder makes Angular aware that `flashCards` will be an array and it will recognize when the data arrives from the factory and update the view.


### Retrieving Flash Cards by Category 

Now that you are getting your flash cards from the database you are at the same place you were at the end of yesterday's workshop.  If you were to `console.log($scope.flashCards)` you would see that a single flash card is an object that looks like:

```javascript
{
    _id: 54 dce589877f21e85fddc001,
    question: 'What is Angular?',
    category: 'MongoDB',
    __v: 0,
    answers: [{
        text: 'A front-end framework for great power!',
        correct: true,
        _id: 54 dce589877f21e85fddc004
    }, {
        text: 'Something lame, who cares, whatever.',
        correct: false,
        _id: 54 dce589877f21e85fddc003
    }, {
        text: 'Some kind of fish, right?',
        correct: false,
        _id: 54 dce589877f21e85fddc002
    }]
}
```

As you can see the flashcard has a property `category`.  You are going to use this property to make different `GET` AJAX requests from your `FlashCardFactory` to the server to return different sets of flashcards.  Before you dive into the factory first you need to set up some HTML in your `index.html` and change your `'MainController'` to accommodate these categories.  Let's put the four different **MEAN** stack categories on the `$scope` in `'MainController'`:

```javascript
$scope.categories = [
        'MongoDB',
        'Express',
        'Angular',
        'Node',
    	];
```

Now add the corresponding HTML to your `index.html` to make buttons for each of these categories. Notice that there are `ng-click` attributes on these buttons that you will have to put on your scope to retrieve the appropriate data:

```html
<button ng-click="getAllCards()">All Categories</button>

<button ng-repeat="category in categories" 
		ng-click="getCategoryCards(category)">
	{{ category }}
</button>
```

Now in your `'MainController'` you will need to put these functions on the `$scope` to be able to execute them when clicking the buttons. You will need to construct a `getAllCards` function that will return all flash cards from your `FlashCardsFactory`.  You will also need to construct a function `getCategoryCards` that takes the category from the `ng-repeat` on the `$scope.categories` as an argument.  This will involve looking at what the Express route in your `server/app.js` is expecting in your `req.query`.  Never heard of `req.query`? Check [this](http://expressjs.com/api.html#req.query) out. Your controller should now look something like:

```javascript
app.controller('MainController', function ($scope, FlashCardsFactory) {
    $scope.flashCards = [];
    
    $scope.categories = [
        'MongoDB',
        'Express',
        'Angular',
        'Node',
    ];

    $scope.getAllCards = function () {
        FlashCardsFactory.getFlashCards().then(function (cards) {
            $scope.flashCards = cards;
        });
    };

    $scope.getCategoryCards = function (category) {
        FlashCardsFactory.getFlashCards(category).then(function (cards) {
            $scope.flashCards = cards;
        });
    };

    $scope.getAllCards();

});
```

Notice that you run the `getAllCards` function after defining it.  This means that when the `public/app.js` is loaded in the `<script src="app.js"></script>` of your `index.hml` all of the flash cards are retrieved from your database and placed on the `$scope`.  Referencing back to your category `<button>` elements you can see that when the button is clicked the variable `category` is passed into the function.  Coming full circle you can see that `category` is simply a string that is `ng-repeat`'ed over from the `$scope`.  This in turn passes that `category` string into your factory to send as a query to your Express server. Your `FlashCardFactory` should now look like:

```javascript
app.factory('FlashCardsFactory', function ($http) {
    return {
        getFlashCards: function (category) {
            var queryParams = {};
            if (category) {
                queryParams.category = category;
            }
            return $http.get('/cards', {
                params: queryParams
            }).then(function (response) {
                return response.data;
            });
        }
    };
});
```

The final step in the categories process is to add the name of the category on the flash card. Add the following:

```html
	<h3>{{ flashCard.category }}</h3>
```

### Keeping Score with a Factory

One of the powerful features of a factory is that it is singleton that exists in the ecosystem of your app.  This means that anywhere you can use dependency injection (e.g. any of your controllers) you can access and modify the properties of the factory.  Let's utilize this functionality to keep a total of your correct and incorrect answers.  To do this you are going to create a `'ScoreFactory'` as well as a `'StatsController'`.  Then make an HTML block that will display your correct and incorrect score.  You can add the following above your `<div ng-controller="MainController">`:

```html
<div ng-controller="StatsController" id="statistics">
	<div id="scoreboard">
		<h3>Correct: <span>{{ scores.correct }}</span></h3>
		<h3>Incorrect: <span>{{ scores.incorrect }}</span></h3>
	</div>
</div>
```

As you can see we have put a new controller on this `<div>` so you can go ahead and make the `'StatsController'`.  You can see that in this controller you will need to put a `scores` object on your `$scope`.  Knowing what you know about factories and how you utilized them to put flashcards on the scope think about how you will use `'ScoreFactory'`.  Your controller should look like this:

```javascript
app.controller('StatsController', function ($scope, ScoreFactory) {
    $scope.scores = ScoreFactory;
});
```

If you are setting `$scope.scores` equal to the return of `ScoreFactory` then that should give you a good clue as to what you are going to have in your `'ScoreFactory'`.  Your factory should look like:

```javascript
app.factory('ScoreFactory', function () {
    return {
        correct: 0,
        incorrect: 0
    };
});
```

The final step for keeping score is to dependency inject your `'ScoreFactory'` into your `'FlashCardController'` and increment the corresponding value when a correct or incorrect answer is given.  Your `'FlashCardController'` should now look like this:

```javascript 
app.controller('FlashCardController', function ($scope, ScoreFactory) {

    $scope.answered = false;
    $scope.answeredCorrectly = null;

    $scope.answerQuestion = function (answer) {
        if ($scope.answered) {
            return;
        }
        
        $scope.answered = true;
        $scope.answeredCorrectly = answer.correct;

        if (answer.correct) {
            ScoreFactory.correct++;
        } else {
            ScoreFactory.incorrect++;
        }
    };
});
```

The fact that the `'ScoreFactory'`  is a singleton allows you to increment it's properties in your `'FlashCardController'` and then have that data be immediately updated in your `'StatsController'`.  Awesome!!!

### App Architecture

If you look back at all that you have done today you can see that you were working in `public/app.js` exclusively.  While you can see all your work in front of you it is already becoming cluttered and hard to find what you are looking for.  The beauty of Angular is that you have the ability to modularize your code because all of your factories and controllers are registered on your app.  The first line in `public/app.js` is very important in this concept:

```javascript
var app = angular.module('FlashCards', []);
```  

When this script is loaded into your browser with the `<script src="app.js"></script>` the variable `app` is made a global variable.  This means that we can move our code in to separate files and then simply load them in `<script>` elements after your `app.js`.  This will allow you to make your code organized and easy to read and maintain.  You now going to make some new folders in your workshop directory to start this process.  In the root of your workshop directory run these commands in your terminal:

```bash
$ mkdir public/js
$ mkdir public/css
```

Now you can start organizing your public folder.  Move your stylesheets into the `public/css` folder by running the following commands:

```bash
$ mv public/reset.css public/css
$ mv public/style.css public/css
```

You should also move your `app.js` into the `js` directory:

```bash
$ mv public/app.js public/js
```

Great! Now lets move that `angular.js` file into somewhere that makes sense:

```bash
$ mkdir public/js/lib
$ mv public/angular.js public/js/lib
```

Now the only file in `/public/js` is `app.js`.  Now let's start splitting up our `app.js` into more readable chunks.  Make some folders for your controllers and factories to live:

```bash
mkdir public/js/controllers
mkdir public/js/factories
```

Finally lets make all of the files needed to identify all the parts of our app.

```bash
$ touch public/js/controllers/FlashCardController.js
$ touch public/js/controllers/MainController.js
$ touch public/js/controllers/StatsController.js
$ touch public/js/factories/FlashCardsFactory.js
$ touch public/js/factories/ScoreFactory.js
```
Now that all of our components have homes lets make sure that we load them in our HTML. Add the appropriate scripts into your HTML below `<script src="app.js"></script>`.  Don't forget that we also changed the location of our angular library and our stylesheets:

```html
<link rel="stylesheet" type="text/css" href="css/reset.css" />
<link rel="stylesheet" type="text/css" href="css/style.css" />
<script src="js/lib/angular.js"></script>
<script src="js/app.js"></script>
<script src="js/controllers/FlashCardController.js"></script>
<script src="js/controllers/MainController.js"></script>
<script src="js/controllers/StatsController.js"></script>
<script src="js/factories/FlashCardsFactory.js"></script>
<script src="js/factories/ScoreFactory.js"></script>
```


Now you can move the code out of `app.js` into its corresponding file.  The only thing left in your `app.js` should be 

```javascript
var app = angular.module('FlashCards', []);
```

This makes sense right? Because this file is loaded first and `app` is a global variable it allows us to reference `app` in all of our other files and it works!  This aspect of modularity is great for keeping your code clean and easy to read and maintain.  You can imagine in a production application with thousands of lines of code how hard it would be to find something if all of your app was contained in a single file.












