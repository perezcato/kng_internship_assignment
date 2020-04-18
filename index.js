import express from 'express';
import multer from 'multer';
import fs from 'fs';
import fsExtra from 'fs-extra';

const app = express();
const upload =  multer();

app.set('view engine', 'ejs');
app.get('/',(req,res) => {
   res.send('KNG Assignment One');
});

app.post('/', upload.any(), async (req, res) => {
   if(req.files[0].mimetype !== 'application/json') res.status(422).send('Please upload a json file');
   else{
      await fs.createWriteStream('./upload.json').write(req.files[0].buffer,'utf8');
      res.status(200).render('response', { userData: await fsExtra.readJson('./upload.json')});
   }
});
app.listen(3000,() => {
   console.log('server started listening on port 3000');
});
