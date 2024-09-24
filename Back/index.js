 // index.js
 const express = require('express'); // express 임포트
 const app = express(); // app생성
 const port = 3000;
 
 app.get('/', function (req, res) {
   res.send('hello world!!');
 });
 
 app.listen(port, () => console.log(`${port}포트입니다.`));
 
 // 몽구스 연결
 const mongoose = require('mongoose');
 mongoose
   .connect(
     'mongodb+srv://admin:admin@cluster0.6m1uhwl.mongodb.net/',
     {
       // useNewUrlPaser: true,
       // useUnifiedTofology: true,
       // useCreateIndex: true,
       // useFindAndModify: false,
     }
   )
   .then(() => console.log('MongoDB conected'))
   .catch((err) => {
     console.log(err);
   });
   