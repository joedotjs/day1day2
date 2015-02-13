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