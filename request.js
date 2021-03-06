const fs = require('fs');
const express = require('express')
const { spawn } = require('child_process');
const multer = require('multer');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { response } = require('express');

const app = express()
const port = process.env.PORT || 2000;

//access to localhost
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

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
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
});

//FUNCTIONS
const upload = multer({ storage: storage });

sendToConvert = (req, res, next) => {
    const file = req.file;
    if (!file) {
        return res.status(400)
            .json({
                success: false,
                data: 'Please specify a file',
            })
    }
    var redirectAddress = '/convert?filename=' + req.file.filename;
    if (req.body.width) redirectAddress += '&width=' + req.body.width;
    if (req.body.height) redirectAddress += '&height=' + req.body.height;
    if (req.body.tolarance) redirectAddress += '&tolarance=' + req.body.tolarance;
    redirectAddress += '&inpage=' + (req.body.inpage === 'on');

    res.redirect(redirectAddress);
};

const Check = (req, res, next) => {

    const queries = {
        filename: req.query.filename ? req.query.filename : null,
        width: req.query.width ? req.query.width : null,
        height: req.query.height ? req.query.height : null,
        tolarance: req.query.tolarance ? req.query.tolarance : null,
        inpage: req.query.inpage === 'true' ? true : false,
    };

    //check if there is file...
    if (!queries.filename) {
        return res.status(400)
            .json({
                success: false,
                data: 'Please specify a file',
            })
    }

    //check if there are queries, import to defaults if not.
    if (!queries.width) queries.width = 40;
    if (!queries.height) queries.height = 40;
    if (!queries.tolarance) queries.tolarance = 57;
    if (!queries.inpage) queries.inpage = false;

    //limitations

    if (queries.height > 255 || queries.width < 1) {
        Delete(req, res, next)
        return res.status(400)
            .json({
                success: false,
                data: 'height is invalid (min:1 max:255)',
            })
    };

    if (queries.width > 255 || queries.width < 1) {
        Delete(req, res, next)
        return res.status(400)
            .json({
                success: false,
                data: 'width is invalid (min:1 max:255)',
            })
    };

    if (queries.tolarance > 255 || queries.tolarance < 1) {
        Delete(req, res, next)
        return res.status(400)
            .json({
                success: false,
                data: 'tolarance is invalid (min:1 max:255)',
            })
    };

    //ok
    req.query = queries;
    next()
}

const Convert = (req, res, next) => {

    var dataToSend = "";
    var filename = 'imgs/' + req.query.filename;

    // spawn new child process to call the python script
    const python = spawn('python', ['pixelToBinary.py', filename, req.query.width, req.query.height, req.query.tolarance]);

    // collect data from script
    python.stdout.on('data', function (data) {
        // console.log('Pipe data from python script ...');
        let stringified;
        try {
            stringified = data.toString();
        }
        catch (err) {
            Delete(req, res, next)
            res.send(400).json({
                success: false,
                data: "file format is invalid."
            })
            stringified = "";
        };
        dataToSend += stringified;
    });

    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        // console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        req.dataToSend = dataToSend;
        if (req.dataToSend) return next()
        else res.status(400).json({
            success: false,
            data: "file format is invalid."
        });
        Delete(req, res, next())
    });
}

const Show = (req, res, next) => {
    if (req.query.inpage === true) {
        var page = "<div style=\"width:" + req.query.width * 12.05 + "px; font:16px \'Times New Roman\'\">" + req.dataToSend + "</div>"
        res.send(page)
    }
    else {
        let data = req.dataToSend.split('\n').join('').replace(/\s/g, '');
        res.status(200).json({
            data,
        });
    };
    next();
}

const Delete = (req, res, next) => {
    const filename = `imgs/${req.query.filename}`
    try {
        fs.unlink(filename, function (err) {
            if (err) return console.log(err);
            // console.log('file deleted successfully');
        });
    }
    catch (err) {
        if (err) return console.log(err);
    }
};

// API
app.post('/uploadfile', upload.single('file'), sendToConvert);

app.get('/convert', Check, Convert, Show, Delete);

app.use(express.static('public'))
app.get('*', (req, res) => res.sendFile(__dirname + '/index.html'))

app.listen(port, () => console.log(`Binary-inator app listening on port 
${ port}!`))