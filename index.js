import express from 'express';
import multer from 'multer';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';

const app = express();
const upload =  multer();

app.set('views', path.join(process.cwd(),'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(process.cwd(),'public')));
app.set(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'kng_internship'}));
app.use(cookieParser());
app.use(morgan('dev'));


app.get('/',(req,res) => {
   console.log('server connected');
   res.send('KNG Assignment One');
});

app.post('/', upload.any(), async (req, res) => {
      if(req.files[0].fieldname !== 'user_data') res.status(422).send('Invalid field name');
      else if(req.files[0].mimetype !== 'application/json') res.status(422).send('Please upload a json file');
      else{
         await fs.createWriteStream('./upload.json').write(req.files[0].buffer,'utf8');
         res.status(200).render('response', { userData: await fsExtra.readJson('./upload.json')});
      }
});
app.listen(3000,() => {
   console.log('server started listening on port 3000');
});
