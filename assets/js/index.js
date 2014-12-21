/**
 * Created by lynn on 14/9/28.
 */
angular.module('BookApp', [
    "ngRoute",
    "ngTouch",
    "ngResource",
    "mobile-angular-ui",
    "ngSanitize",
    "pouchdb",
    "wiz.markdown",
    "btford.markdown"
])

    .value('URL', 'http://127.0.0.1:18080/')
    .value('USER', {
        "name":"",
        "sign_in":true//需要大范围的修改,只改成属性相关
    })

    .factory('bookdb', function(PouchDB,URL){
        return PouchDB(URL+'db/bookdb');
    })
    .factory('userdb', function(PouchDB,URL){
        return PouchDB(URL+'db/userdb');
    })
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller:'MainCtrl',
                templateUrl:'assets/view/home.html'
            })
            .when('/login', {
                controller:'MainCtrl',
                templateUrl:'assets/view/login.html'
            })
            .when('/search', {
                controller:'MainCtrl',
                templateUrl:'assets/view/search.html'
            })
            .when('/bbc', {
                controller:'MainCtrl',
                templateUrl:'assets/view/bbc.html'
            })
            .when('/book/:book_id', {
                controller:'BookCtrl',
                templateUrl:'assets/view/book.html'
            })
            .when('/new', {
                controller:'CreateCtrl',
                templateUrl:'detail.html'
            })
            .otherwise({
                redirectTo:'/'
            });
    })

    .controller('MainCtrl', function($rootScope, $scope, $routeParams, bookdb , userdb , USER) {
        $scope.test='用户';
        $scope.bookdb=bookdb;
        $scope.userdb=userdb;
        userdb.changes({
            include_docs: true,
            conflicts: true,
            continuous: true,
            since: 'now',
            onChange: function (change) {
                //console.log(change.doc);
                //userdb.allDocs({include_docs: true}, function(err, res) { console.log(res['rows'])});
            }
        });

        $scope.user={
            "name":"",
            "sign_in":"注册"
        };
        $scope.user=USER;//绑定为全局可以访问的一个元素
        $scope.switchClicked=function(){//现在switch的 ng-model还没改,改后才能切换回来改定
            if($scope.user['sign_in']=='登录'){
                $scope.user['sign_in']='注册';
            }else{
                $scope.user['sign_in']='登录'
            }
        };
        $scope.Notifications_sign_up={
            "success":"has-success",
            "text":"请注册"
        };
        $scope.Notifications_login={
            "success":"has-success",
            "text":""
        };
        $scope.Notifications_password={
            "success":"has-success",
            "text":""
        };


        $scope.i=1;
        $scope.book_now=function(){
            console.log($scope.i++)
        };
        userdb.allDocs({include_docs: true}, function(err, res) {
            $scope.userlist=res['rows'];
            console.log(res)
        });
        bookdb.allDocs({include_docs: true}, function(err, res) {
            $scope.booklist=res['rows'];
            console.log(res)
        });
        $scope.sign_up=function(){
            userdb.put({
                'name':$scope.user.name,
                'password':$scope.user.password
            },$scope.user.name).then(function(res){
                console.log(res);
            }).catch(function(err){
                console.log(err);
            })
        };
        $scope.sign_in=function(){
            userdb.get(
                $scope.user.name
            ).then(function(res){
                    if(res["password"]==$scope.user.password){
                        $scope.Notifications_login="登录成功";
                        $scope.user["sign_in"]="true";
                    }else{
                        $scope.Notifications_login="密码错误"
                    }
                }).catch(function(err){
                    $scope.Notifications_login="用户不存在"
                })
        };
        $scope.change_username=function(){
            if($scope.user["name"]==''){
                $scope.Notifications_sign_up['text']='用户名不能为空';
                $scope.Notifications_sign_up['success']="has-error";

                $scope.Notifications_login['text']='用户名不能为空';
                $scope.Notifications_login['success']="has-error"
            }else{
                userdb.get($scope.user["name"])
                    .then(function(res){
                        $scope.Notifications_sign_up['text']='用户名已经被注册';
                        $scope.Notifications_sign_up['success']="has-error";
                        $scope.Notifications_login['text']='';
                        $scope.Notifications_login['success']="has-success";
                    })
                    .catch(function(err){
                        $scope.Notifications_sign_up['text']='可以使用的用户名';
                        $scope.Notifications_sign_up['success']="has-success";
                        $scope.Notifications_login['text']='用户不存在';
                        $scope.Notifications_login['success']="has-error";
                    })
            }
        };//页面切换聚焦的时候不能只用ng-change
        $scope.change_password=function(){
            if( $scope.user.password != $scope.user.repassword ){
                $scope.Notifications_password['text']='两次密码不一致';
                $scope.Notifications_password['success']="has-error";
            }else{
                $scope.Notifications_password['text']='';
                $scope.Notifications_password['success']="has-success";
            }
        };
        $rootScope.$on("$routeChangeStart", function(){
            $rootScope.loading = true;
        });

        $rootScope.$on("$routeChangeSuccess", function(){
            $rootScope.loading = false;
        });
        $scope.userAgent = navigator.userAgent;
    })

    .controller('BookCtrl', function($scope, $routeParams, bookdb , userdb) {
        bookdb.get($routeParams.book_id).then(function(res){
            $scope.book_now=res;
        });
    })
/*
    .controller('EditCtrl',
    function($scope, $location, $routeParams, Projects) {
        var projectId = $routeParams.projectId,
            projectIndex;

        $scope.projects = Projects;
        projectIndex = $scope.projects.$indexFor(projectId);
        $scope.project = $scope.projects[projectIndex];

        $scope.destroy = function() {
            $scope.projects.$remove($scope.project).then(function(data) {
                $location.path('/');
            });
        };

        $scope.save = function() {
            $scope.projects.$save($scope.project).then(function(data) {
                $location.path('/');
            });
        };
    });
*/