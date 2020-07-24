const express = require('express')
const { spawn } = require('child_process');
const multer = require('multer');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');


const app = express()
const port = process.env.PORT || 2000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));


//security &http

//limit requests
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'too many request for this ip please try again later.'
})
app.use('/', limiter);

//body parser: reading data from body into req.body, with limit of 10kb
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



const storage = multer.diskStorage({
    destination: 'imgs',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

const convert = (req, res, next) => {
    var dataToSend;
    // spawn new child process to call the python script
    var filename = 'imgs/paddington.png';
    if (req.params.filename) {
        filename = 'imgs/' + req.params.filename;
    }
    const python = spawn('python', ['pixelToBinary.py', filename]);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        req.dataToSend = dataToSend;
        next()
    });
}
const show = (req, res, next) => {
    var page = "<div style='width:485px'>" + req.dataToSend + "</div>"
    res.send(page)
}

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.redirect('/convert/' + req.file.filename);
})

app.get('/convert/:filename', convert, show);

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))
app.get('*', (req, res) => res.sendFile(__dirname + '/index.html'))

app.listen(port, () => console.log(`Example app listening on port 
${port}!`))