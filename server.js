/**
 * Created by lynn on 14-2-22.
 */
var qr= require('qr-image')
    ,jsonFile = require('json-file-plus')
    ,fs= require('fs');
//qr.image('http://www.baidu.com/')
var URL='http://127.0.0.1:18080/';



var express=require('express')
  , ex_pouch=require('express-pouchdb')
  , corser  = require('corser')
  , PouchDB=ex_pouch.Pouch
  , app =express()
  , corserRequestListener = corser.create({
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
      supportsCredentials: true
  });
//用express-pouchdb会有跨域问题!!!fuck!!!!
//用pouchdb-server不会有
//查明pouchdb-server中采用了corser作跨域处理

var iconv = require('iconv-lite');


//console.log(J.readFile(__dirname+"/book.xls")[1]["Strings"]);
//J.utils.to_json(__dirname+"/book.xls");
//console.log(J.read(__dirname+"/book.xls"));
var port=process.env.PORT||18080;

app.use(express.static(__dirname));

app.configure(function () {
  app.use(express.logger('tiny'));
  app.use(function (req, res, next) {
    corserRequestListener(req, res, function () {
      if (req.method == 'OPTIONS') {
        // End CORS preflight request.
        res.writeHead(204);
        return res.end();
      }
      next();
    });
  });
  app.use('/db', ex_pouch);
});

var io=require('socket.io').listen(app.listen(port));
io.sockets.on('connection',function(socket){
  socket.emit('connected')
});

var bookdb=new PouchDB('bookdb');//创建一次后就不再创建

var J=require('j');
var base=J.readFile(__dirname+"/book.xls")[1]["Sheets"]["Sheet1"];
console.log(base['!range']['e']['r']+1);

//bookdb.destroy();

var put=function(){

    for (var i=2;i<=base['!range']['e']['r'];i++) {
        var qr_png = qr.image(URL+'#/book/'+base['D'+i]['v'], { type: 'png' });
        console.log(URL+'#/book/'+base['D'+i]['v']);
        qr_png.pipe(fs.createWriteStream('assets/img/'+base['D'+i]['v']+'.png'));
        bookdb.put({
            '书名':base['A'+i]['v'],
            '作者':base['B'+i]['v'],
            '出版社':base['C'+i]['v'],
            'ISBN':base['D'+i]['v'],
            '索书号':base['E'+i]['v']
        },base['D'+i]['v'])//索书号中的斜杠不好用,改用ISBN做id
        .then(function(res){

            console.log(res)
        }).catch(function(err){
            console.log(err);
        });
    }
};
put();
//bookdb.allDocs([options], [callback])
//bookdb.allDocs({include_docs: true}, function(err, res) { console.log(res['rows'][0])});


console.log('成功建立端口'+port);

