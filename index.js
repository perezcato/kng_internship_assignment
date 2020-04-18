import express from 'express';
import multer from 'multer';
import fs from 'fs';
import fsExtra from 'fs-extra';

const app = express();
const upload =  multer();

app.set('view engine', 'ejs');

app.post('/', upload.any(), async (req, res) => {
   const file = req.files[0];
   const writeStream = fs.createWriteStream('./upload.json');
   writeStream.write(file.buffer,'utf8');
   const userData = await fsExtra.readJson('./upload.json');
   console.log(userData);
   res.render('response');
});
app.listen(3000,() => {
   console.log('server started listening on port 3000');
});


const createHTML = (jsonData) => {

};
