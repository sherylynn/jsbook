var crypto = require('crypto'),
    User = require('../models/user.js'),
    Book = require('../models/book.js');


module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index', {
            title: '金山图书管理',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.get('/index.html', function (req, res) {
        res.render('index', {
            title: '金山图书管理',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function (req, res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        //检验用户两次输入的密码是否一致
        if (password_re != password) {
            req.flash('error', '两次输入的密码不一致!');
            console.log("两次输入的密码不一致!");
            return res.redirect('/reg');//返回主册页
        }
        //检验用户是否输入密码
        if (password == '') {
            req.flash('error', '请输入密码!');
            console.log("请输入密码!");
            return res.redirect('/reg');//返回主册页
        }
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name: req.body.name,
            password: password,
            email: req.body.email
        });
        //检查用户名是否已经存在
        User.get(newUser.name, function (err, user) {
            if (user) {
                req.flash('error', '用户已存在!');
                return res.redirect('/reg');//返回注册页
            }
            //如果不存在则新增用户
            newUser.save(function (err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');//注册失败返回主册页
                }
                if (req.session.user && req.session.user.name == 'admin') {
                    req.flash('success', '注册成功!');
                    res.redirect('/admin/ad-user-list.html');
                }
                else {
                    req.session.user = user;//用户信息存入 session
                    req.flash('success', '注册成功!');
                    res.redirect('/');//注册成功后返回主页
                }
            });
        });
    });

    //app.get('/login', checkNotLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    //app.post('/login', checkNotLogin);
    app.post('/login', function (req, res) {
        //生成密码的 md5 值
        console.log('收到登陆消息');
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.get(req.body.name, function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/login');
            }
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/login');//用户不存在则跳转到登录页
            }
            //检查密码是否一致
            if (user.password != password) {
                req.flash('error', '密码错误!');
                return res.redirect('/login');//密码错误则跳转到登录页
            }
            //用户名密码都匹配后，将用户信息存入 session
            req.session.user = user;
            req.flash('success', '登陆成功!');
            res.redirect('/');//登陆成功后跳转到主页
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');//登出成功后跳转到主页
    });

    app.get('/admin', checkAdmin);
    app.get('/admin', function (req, res) {
        User.getAll(null, function (err, users) {
            if (err) {
                users = [];
                return res.redirect('/login');//用户不存在则跳转到登录页
            }

            res.render('admin/index', {
                title: '系统后台',
                users: users
            });
        });
    });
    app.get('/admin/index.html', function (req, res) {
        User.getAll(null, function (err, users) {
            if (err) {
                users = [];
                return res.redirect('/login');//用户不存在则跳转到登录页
            }

            res.render('admin/index', {
                title: '系统后台',
                users: users
            });
        });
    });

    app.get('/admin/ad-book.html', function (req, res) {
        Book.getAll(null, function (err, books) {
            if (err) {
                books = [];
                return res.redirect('/login');//用户不存在则跳转到登录页
            }

            res.render('admin/ad-book', {
                title: '书籍概览',
                books: books
            });
        });
    });
    app.get('/admin/ad-book-add.html', function (req, res) {
        User.getAll(null, function (err, users) {
            if (err) {
                users = [];
                return res.redirect('/login');//用户不存在则跳转到登录页
            }

            res.render('admin/ad-book-add', {
                title: '添加书籍',
                users: users
            });
        });
    });
    app.post('/admin/ad-book-add.html', checkAdmin);
    app.post('/admin/ad-book-add.html', function (req, res) {
        var newBook = new Book({
            name: req.body.name,
            author: req.body.author,
            from: req.body.from,
            owner: req.body.owner,
            ISBN: req.body.ISBN,
            stock: req.body.stock
        });
        //检查书本是否已经存在
        Book.get(newBook.ISBN, function (err, book) {
            if (book) {
                req.flash('error', '已有此书!');
                return res.redirect('back');//返回新增书界面
            }
            //如果不存在则新增书本
            newBook.save(function (err, book) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('back');//新增失败返回新增书页
                }
                req.session.book = book;//书本信息存入 session
                req.flash('success', '添加书本成功!');
                res.redirect('/admin/ad-book-list.html');//添加成功后返回书本列表页

            });
        });
    });
    app.get('/admin/ad-book-list.html', checkAdmin);
    app.get('/admin/ad-book-list.html', function (req, res) {
        //判断是否是第1页
        var page = req.query.p ? parseInt(req.query.p) : 1;
        console.log(page);
        //查询并返回滴page页的10本书
        Book.getTen(null, page, function (err, books, total) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('admin/ad-book-list', {
                title: '书籍列表',
                books: books,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + books.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.get('/admin/ad-book-star.html', function (req, res) {
        User.getAll(null, function (err, users) {
            if (err) {
                users = [];
                return res.redirect('/login');//用户不存在则跳转到登录页
            }

            res.render('admin/ad-book-star', {
                title: '推荐列表',
                users: users
            });
        });
    });
    app.get('/bookremove/:_id', checkAdmin);
    app.get('/bookremove/:_id', function (req, res) {
        Book.remove(req.params._id, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('back');
        });
    });

    app.get('/restore_book', function (req, res) {
        Book.restore(req, function (err) {
            if(err){
                req.flash('error', err);
                console.log(err);
                return res.redirect('/admin/ad-book-list.html');
            }
            req.flash('success', '重置成功!');
            res.redirect('/admin/ad-book-list.html');
        });
    });
/*    app.get('/restore_book', function (req, res) {
        for (var i = 2; i <= base['!range']['e']['r']; i++) {
            //var qr_png = qr.image(URL+'#/book/'+base['D'+i]['v'], { type: 'png' });
            //console.log(URL+'#/book/'+base['D'+i]['v']);
            //qr_png.pipe(fs.createWriteStream('assets/img/'+base['D'+i]['v']+'.png'));


            var newBook = new Book({
                name: base['A' + i]['v'],
                author: base['B' + i]['v'],
                from: base['C' + i]['v'],
                owner: base['A' + i]['v'],
                ISBN: base['D' + i]['v'],
                stock: 1
            });
            //检查书本是否已经存在
            Book.get(newBook.ISBN, function (err, book) {
                if (book) {
                    req.flash('error', '已有此书!');
                    return res.redirect('back');//返回新增书界面
                }
                //如果不存在则新增书本
                newBook.save(function (err, book) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('back');//新增失败返回新增书页
                    }
                    req.session.book = book;//书本信息存入 session
                    req.flash('success', '添加书本成功!');
                    res.redirect('/admin/ad-book-list.html');//添加成功后返回书本列表页

                });
            });
        }
    });
*/
    app.get('/admin/ad-user.html', function (req, res) {
        User.getAll(null, function (err, users) {
            if (err) {
                users = [];
                return res.redirect('/login');//用户不存在则跳转到登录页
            }

            res.render('admin/ad-user', {
                title: '用户管理',
                users: users
            });
        });
    });
    app.get('/admin/ad-user-add.html', function (req, res) {
        User.getAll(null, function (err, users) {
            if (err) {
                users = [];
                return res.redirect('/login');//用户不存在则跳转到登录页
            }

            res.render('admin/ad-user-add', {
                title: '添加用户',
                users: users
            });
        });
    });
    app.get('/admin/ad-user-list.html', function (req, res) {
        User.getAll(null, function (err, users) {
            if (err) {
                users = [];
                return res.redirect('/login');//用户不存在则跳转到登录页
            }

            res.render('admin/ad-user-list', {
                title: '用户列表',
                users: users
            });
        });
    });
    app.get('/remove/:name', checkAdmin);
    app.get('/remove/:name', function (req, res) {
        var currentUser = req.session.user;
        User.remove(req.params.name, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('back');
        });
    });

    app.get('/booklist', function (req, res) {
        res.render('booklist', {title: '书籍列表'});
    });

    app.get('/book/:ISBN', function (req, res) {
        Book.get(req.params.ISBN, function (err, book) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');//新增失败返回新增书页
            }
            if (book) {
                res.render('booksingle', {
                    title: '书籍详情',
                    book: book
                });
            } else {
                req.flash('error', ('ISBN为' + req.params.ISBN + '的书不存在'));
                return res.redirect('back');
            }
        });
    });


    app.get('/post', function (req, res) {
        res.render('post', {title: '发表'});
    });
    app.post('/post', function (req, res) {
    });
    app.get('/logout', function (req, res) {
    });


    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录!');
            res.redirect('/login');
        }
        next();
    }

    function checkAdmin(req, res, next) {
        if (!req.session.user || req.session.user.name != 'admin') {
            req.flash('error', '非管理员用户!');
            res.redirect('/');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user && req.session.user.name != 'admin') {
            req.flash('error', '已登录!');
            console.log('已经登陆');
            res.redirect('back');//返回之前的页面
        }
        next();
    }
};