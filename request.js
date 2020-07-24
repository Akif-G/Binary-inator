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
    max: 10000,
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

//FUNCTIONS
const upload = multer({ storage: storage });

sendToConvert = (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400;
        return next(error)
    }
    var redirectAddress = '/convert?filename=' + req.file.filename;
    if (req.body.width) redirectAddress += '&width=' + req.body.width;
    if (req.body.height) redirectAddress += '&height=' + req.body.height;
    if (req.body.tolarance) redirectAddress += '&tolarance=' + req.body.tolarance;
    redirectAddress += '&inpage=' + (req.body.inpage === 'on');

    res.redirect(redirectAddress);
};

check = (req, res, next) => {
    console.log(req.query)
    const queries = {
        filename: req.query.filename ? req.query.filename : null,
        width: req.query.width ? req.query.width : null,
        height: req.query.height ? req.query.height : null,
        tolarance: req.query.tolarance ? req.query.tolarance : null,
        inpage: req.query.inpage === 'true' ? true : false,
    };
    //check if there is file...
    if (!queries.filename) {
        const error = new Error('Please specify a file')
        error.httpStatusCode = 400
        return next(error)
    }

    //check if there are queries, import to defaults if not.
    if (!queries.width) queries.width = 40;
    if (!queries.height) queries.height = 40;
    if (!queries.tolarance) queries.tolarance = 57;
    if (!queries.inpage) queries.inpage = false;

    //limitations

    if (queries.height > 255 || queries.width < 1) {
        const error = new Error('height is invalid')
        error.httpStatusCode = 400
        return next(error)
    };

    if (queries.width > 255 || queries.width < 1) {
        const error = new Error('width is invalid')
        error.httpStatusCode = 400
        return next(error)
    };

    if (queries.tolarance > 126) {
        const error = new Error('tolarence is invalid')
        error.httpStatusCode = 400
        return next(error)
    };

    //ok
    req.query = queries;
    next()
}

const convert = (req, res, next) => {
    var dataToSend = "";
    // spawn new child process to call the python script
    var filename = 'imgs/paddington.png';
    if (req.query.filename) {
        filename = 'imgs/' + req.query.filename;
    }
    const python = spawn('python', ['pixelToBinary.py', filename, req.query.width, req.query.height, req.query.tolarance]);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        let stringified;
        try {
            stringified = data.toString();
        }
        catch (err) {
            console.log(err)
            stringified = "";
        };
        dataToSend += stringified;
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
    console.log(req.query.inpage)
    if (req.query.inpage === true) {
        var page = "<div style=\"width:" + req.query.width * 12.05 + "px; font:16px \'Times New Roman\'\">" + req.dataToSend + "</div>"
        res.send(page)
    }
    else {
        let data = req.dataToSend.split('\n').join('')
        res.send(`{"data":"${data}"}`)
    }
}

// API
app.post('/uploadfile', (res, req, next) => { console.log(req.body); next() }, upload.single('file'), sendToConvert);

app.get('/convert', check, convert, show);

app.use(express.static('public'))
app.get('*', (req, res) => res.sendFile(__dirname + '/index.html'))

app.listen(port, () => console.log(`Example app listening on port 
${ port}!`))