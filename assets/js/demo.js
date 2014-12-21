Array.prototype.indexOf = function (vItem) {
    for (var i=0; i<this.length; i++) {
        if (vItem == this[i]) {
            return i;
        }
    }
    return -1;
};
/*
Array.prototype.indexOf_name = function (vItem) {
    for (var i=0; i<this.length; i++) {
        if (vItem == this[i]["中文通用名"]) {
            return this[i];
        }
    }
    return -1;//return 主页
};
*/
//

var app = angular.module('BookApp', [
    "ngRoute",
    "ngTouch",
    "ngResource",
    "mobile-angular-ui",
    "ngSanitize",
    "pouchdb",
    "wiz.markdown",
    "btford.markdown"
]);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/',                    {templateUrl: "assets/view/home.html"});
    $routeProvider.when('/bbc',                 {templateUrl: "assets/view/bbc.html"});
    $routeProvider.when('/toggle',              {templateUrl: "assets/view/toggle.html"});
    $routeProvider.when('/tabs',                {templateUrl: "assets/view/tabs.html"});
    $routeProvider.when('/detail/:poison_name', {templateUrl: "assets/view/detail.html"});
    //MDdetails
    $routeProvider.when('/MDdetail/:MDpoison_name', {templateUrl: "assets/view/home.html"});


    $routeProvider.when('/book/:book_id', {templateUrl: "assets/view/book.html"});
    $routeProvider.when('/login',               {templateUrl: "assets/view/login.html"});
    $routeProvider.when('/search',              {templateUrl: "assets/view/search.html"});
    $routeProvider.when('/carousel',            {templateUrl: "assets/view/carousel.html"});
});

app.service('bookdb',function(PouchDB){
    return PouchDB('http://127.0.0.1:18080/db/bookdb');
    }
);

app.service('userdb',function(PouchDB){
        return PouchDB('http://127.0.0.1:18080/db/userdb');
    }
);

app.service('MDpoison', [
    '$resource', function($resource) {
        return $resource('assets/md_json/:md_name.json', {}, {
            query: {method:'GET', params:{md_name:'md_all'}, isArray:true}
        });
    }
]);


app.service('Apoison', [
    '$resource', function($resource) {
        return $resource('poisons/:poison_name.json', {}, {
            query: {method:'GET', params:{poison_name:'poisons'}, isArray:true}
        });
    }
]);

app.controller('MainController', function($rootScope, $scope, $routeParams, Apoison, MDpoison, bookdb , userdb){
    $scope.bookdb=bookdb;
    $scope.userdb=userdb;
    //userdb.onchange();

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
/*
//没法直接集成
    userdb.signup('batman', 'brucewayne', function (err, response) {
        if (err) {
            if (err.name === 'conflict') {
                // "batman" already exists, choose another username
            } else if (err.name === 'forbidden') {
                // invalid username
            } else {
                // HTTP error, cosmic rays, etc.
            }
        }
    });
*/
    $scope.Notifications='请注册';


    $scope.user={
        "name":"",
        "sign_in":"注册"
    };

    //$scope.book_now=$routeParams.book_id;
    $scope.i=1;
    $scope.book_now=function(){
        console.log($scope.i++)
    };
    /*
    $scope.book_now=function(){
        if($routeParams.book_id){
            bookdb.get($routeParams.book_id).then(function(res){
                return res;
            });
            //可以通过函数回调的形式来使用,页面上的{{}}会不断调用book_now这个函数,造成对数据库的不断读写输出
        }
    };
    */
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
        userdb.get($scope.user["name"])
            .then(function(res){
                $scope.Notifications='用户名已经被注册';
                $scope.Notifications_login='';
            })
            .catch(function(err){
                $scope.Notifications='可以使用的用户名';
                $scope.Notifications_login='用户不存在';
            })
    };//页面切换聚焦的时候不能只用ng-change
    $scope.change_password=function(){
        if( $scope.user.password != $scope.user.repassword ){
            $scope.Notifications='两次密码不一致';
        }else{
            $scope.Notifications='';
        }
    };

    $rootScope.$on("$routeChangeStart", function(){
        $rootScope.loading = true;
    });

    $rootScope.$on("$routeChangeSuccess", function(){
        $rootScope.loading = false;
    });

    $scope.forums = [
        {title:"毒物信息纠错板块"},
        {title:"技术交流板块"},
        {title:"疑难解答板块"}
    ];

    $scope.markdown="#你好";
    $scope.MD_Id=$routeParams.MDpoison_name;//在一开始的界面定义无用????不分controller就没有办法用序列号.fuckkkkkkkk,因为scope就在一开始的界面生成了所以没有

    $scope.search={
        "临床表现":""
    };

    $scope.search_page={
        test:function(){
            console.log(MDpoison.query());

            console.log($scope.markdown);
            console.log($routeParams.MDpoison_name);
        },

        point:0,
        get_point:function(_a){//方法二是讲数组直接用函数传递,如果数量多了还是不适合遍历的,但是ng-click的部分未解决
            this.point=_a;
            //console.log($routeParams.poison_name);//可以传递,但是会迟一个才传出,应该和点击次序有关,搞不懂了,不过确实有两个方法,一个应该更适合
        }
    };
    $scope.test=function(_keyword,_string){
        //{{test(search["临床表现"],MDpoison["临床表现"])}}
        this._keyword=_keyword;
        this._string=_string;
        if(this._keyword) {
            this._final = this._string.replace(RegExp(this._keyword, 'g'), '<strong>' + this._keyword + '</strong>');
        }else{
            this._final = this._string;
        }//失败,提交的是字符
        return this._final;


    };
    $scope.poisons=Apoison.query();
    $scope.MDpoisons=MDpoison.query();
    //$scope.test="<img src='http://d.hiphotos.baidu.com/image/pic/item/30adcbef76094b36dfd52ee7a1cc7cd98d109d70.jpg'>";
    //上面的结果是直接显示了标点,而不是图片
    $scope.character=["一、理化性质","二、快速检测参考方法"];
    $scope.ways=["方法原理","试剂","方法步骤（前处理）","试验结果（图片或视频）","相关评价","注意事项","方法出处"];
    $scope.phys=["分子式","分子量","结构式","外观（纯品与商业品）","图片（另存）","密度","熔点","沸点","气味","可燃性","溶解性","酸碱性","LD50","中毒剂量（人）","致死剂量（人）","其他理化性质（特殊反应）"]
    $scope.names=["中文通用名","化学名","俗称（商品名）","英文名","CASNo"];//Apoison["中文通用名"]();
    $scope.abouts=["毒物来源","中毒机制及体内代谢","临床表现","尸检情况","急救措施"];
    //console.log(1234);
    //$scope.search.name= $routeParams.poison_name;//一种方法是传递毒物名,详细界面再做一次检索,另一种是直接传递参数好像也不适合


    $scope.userAgent = navigator.userAgent;

});
