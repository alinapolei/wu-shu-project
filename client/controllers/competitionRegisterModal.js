app.controller("competitionRegisterModal", function ($scope, $rootScope, $window, $http, $routeParams, $filter, $location, sportsmanService, clubService, pagingService, competitionService, excelService, commonFunctionsService, constants, categoryService, confirmDialogService, toastNotificationService) {
    $scope.selectedNotRegisteredUsers = [];
    $scope.selectedRegisteredUsers = [];
    $scope.toRegisterUsers = [];
    $scope.toUnRegisterUsers = [];
    $scope.toUpdateRegisterUsers = [];
    $scope.pager = {};
    let dropZoneRegCompetition = document.getElementById("dropZoneRegCompetition");
    let downExcelRegCompetition = document.getElementById("downExcelRegCompetition");

    setPage(1);
    getData();
    var regObj = {
        compId: $routeParams.idComp,
        sportsmenIds: []
    }

    $scope.setPage = function (page) {
        setPage(page);
    };

    function setPage(page) {
        if (page < 1 || (page > $scope.pager.totalPages && $scope.totalPages > 0)) {
            return;
        }

        sportsmanService.getSportsmenCount(sportsmanService.buildConditionds($scope.searchText, null, $scope.selectedClub, null, null, $routeParams.idComp, null))
            .then(function (result) {
                let totalCount = result.data.count;
                $scope.pager = pagingService.GetPager(totalCount, page);

                sportsmanService.getSportsmen(sportsmanService.buildConditionds($scope.searchText, null, $scope.selectedClub, null, null, $routeParams.idComp, null, $scope.pager.startIndex + 1, $scope.pager.endIndex + 1))
                    .then(function (result) {
                        $scope.users = sportsmanService.formatSportsmanCategoriesList(result.data.sportsmen, $scope.categories);
                    }, function (error) {
                        console.log(error)
                    });
            }, function (error) {
                console.log(error)
            });
        window.scroll(0, 0);
    }

    async function getData() {
        clubService.getClubs()
            .then(function (result) {
                $scope.clubs = result.data;
            }, function (error) {
                console.log(error)
            });

        let result = await categoryService.getCategories();
        $scope.categories = result.data;
        setPage(1);
    }

    $scope.getAgeRange = categoryService.getAgeRange;

    function makeJsonToReg(rowObj) {
        for (let i = 0; i < rowObj.length; i++)
            regObj.sportsmenIds.push(parseInt(rowObj[i]["ת.ז ספורטאי"]))
    }

    function addOrUpdateRegisterUsersList(list, user, newCategory, oldCategory) {
        let registration = list.find(item => {
            return item.id === user.id && item.category === oldCategory.id;
        });
        if (registration) {
            registration.category = newCategory.id;
        } else {
            list.push({id: user.id, category: newCategory.id, oldCategory: oldCategory.id});
        }
    }

    $scope.addToToRegisterUsers = function (user, newCategory, oldCategory, index) {
        let registration = $scope.toUnRegisterUsers.find(item => item.id === user.id && item.category === newCategory.id);
        if (registration)
            $scope.toUnRegisterUsers = commonFunctionsService.arrayRemove($scope.toUnRegisterUsers, registration);
        if (!oldCategory) {
            $scope.toRegisterUsers.push({id: user.id, category: newCategory.id, oldCategory: undefined});
        } else {
            if (!oldCategory.originalId)
                addOrUpdateRegisterUsersList($scope.toRegisterUsers, user, newCategory, oldCategory);
            else {
                if (registration)
                    $scope.toUnRegisterUsers.push({id: user.id, category: oldCategory.id});
                else {
                    addOrUpdateRegisterUsersList($scope.toUpdateRegisterUsers, user, newCategory, oldCategory);
                    newCategory.originalId = oldCategory.originalId;
                }
            }
        }

        console.log("----------------")
        console.log("insert")
        console.log($scope.toRegisterUsers);
        console.log("delete");
        console.log($scope.toUnRegisterUsers);
        console.log("update")
        console.log($scope.toUpdateRegisterUsers);

    };


    $scope.addToToUnRegisterUsers = function (user, oldCategory, index) {
        if (oldCategory) {
            let registration = $scope.toRegisterUsers.find(item => item.id === user.id && item.category === oldCategory.id);
            if (registration)
                $scope.toRegisterUsers = commonFunctionsService.arrayRemove($scope.toRegisterUsers, registration);
            else {
                let registration = $scope.toUpdateRegisterUsers.find(item => item.id === user.id && item.category === oldCategory.id);
                if(registration) {
                    $scope.toUpdateRegisterUsers = commonFunctionsService.arrayRemove($scope.toUpdateRegisterUsers, registration);
                    $scope.toUnRegisterUsers.push({id: user.id, category: oldCategory.originalId});
                }
                else
                    $scope.toUnRegisterUsers.push({id: user.id, category: oldCategory.id});
            }
            user.selectedCategories = commonFunctionsService.arrayRemove(user.selectedCategories, oldCategory);
            if (user.selectedCategories.length === 0)
                user.selectedCategories.push(undefined);
        } else
            user.selectedCategories.pop();

        console.log("----------------")
        console.log("insert")
        console.log($scope.toRegisterUsers);
        console.log("delete");
        console.log($scope.toUnRegisterUsers);
        console.log("update")
        console.log($scope.toUpdateRegisterUsers);
    };

    $scope.register = function () {
        competitionService.registerSportsmenToCompetition($routeParams.idComp, $scope.toRegisterUsers, $scope.toUnRegisterUsers, $scope.toUpdateRegisterUsers)
            .then(function (result) {
                toastNotificationService.successNotification("הרישום בוצע בהצלחה");
                $scope.isSaved = true;
                //if ($rootScope.isChangingLocationFirstTime) $location.path("/competitions/registerToCompetition");
            }, function (error) {
                console.log(error)
            });
    }
    $rootScope.isChangingLocationFirstTime = true;
    $scope.$on('$routeChangeStart', function (event, newRoute, oldRoute) {
        if (($scope.toRegisterUsers.length > 0 || $scope.toUnRegisterUsers.length > 0) && !$scope.isSaved && $rootScope.isChangingLocationFirstTime)
            confirmDialogService.notSavedItems(event, $location.path(), $scope.register);
    });

    $scope.downloadExcelRegCompetition = function () {
        let token = $window.sessionStorage.getItem('token')
        let compId = $routeParams.idComp;
        let url = constants.serverUrl + '/downloadExcelFormatRegisterToCompetition/' + token + '/' + compId;
        downExcelRegCompetition.setAttribute('href', url);
        downExcelRegCompetition.click();
    }

    /*Drop zone */
    dropZoneRegCompetition.ondrop = function (e) {
        excelService.dropZoneDropFile(e, function (res) {
            changeDropZone(res.fileName)
            let data = {
                compId: $routeParams.idComp,
                sportsman: res.result
            };
            console.log(data);
            competitionRegisterExcelSportsman(data);
        })
    };

    function competitionRegisterExcelSportsman(data) {
        competitionService.regExcelSportsmanCompetition(data)
            .then((res) => {
                toastNotificationService.successNotification("הספורטאיים נשמרו בהצלחה");
                setPage(1)
            }).catch((err) => {
            console.log(err)
            $scope.excelErrors = err.data;
        })
    }

    function changeDropZone(name) {
        let nameArray = name.toString().split("\\");
        $scope.filename = nameArray[nameArray.length - 1];
        $scope.isDropped = true;
        dropZoneRegCompetition.className = "dropzoneExcel"
    }

    dropZoneRegCompetition.ondragover = function () {
        this.className = 'dropzone dragover';
        return false;
    };
    dropZoneRegCompetition.ondragleave = function () {
        this.className = 'dropzone';
        return false;
    };
    $scope.uploadNewFile = function () {
        $scope.excelErrors = [];
        $scope.isDropped = false;
        dropZoneRegCompetition.className = "dropzone"
        document.getElementById("fileSportsman").value = "";
    }

    $scope.ExcelExport = function (event) {
        excelService.uploadExcel(event, function (res) {
            changeDropZone(event.target.value.toString())
            let data = {
                compId: $routeParams.idComp,
                sportsman: res
            };

            competitionRegisterExcelSportsman(data)
        })
    };
});
