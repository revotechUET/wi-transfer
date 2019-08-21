const router = require('express').Router();
const responseJSON = require('./../json-response');
const archiver = require('archiver');
const fs = require('fs');
const config = require('config');
const unzip = require('unzip-stream');

// let CurveStatus = require('./curve-status.model').model;
const multer = require('multer');
const CurveStatus = require('./curve-status.model').model;

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

let upload = multer({storage: storage});


let curveBaseFolder = process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath;

router.post('/download', (req, res) => {

    let curveFiles = req.body.curveFiles;
    let listFileCurve = curveFiles.map((e) => curveBaseFolder + e);

    let outputName = '.downloads/curves_' + Date.now() + '_' + Math.floor(Math.random() * 100000) + '.zip';

    let n = listFileCurve.length;
    
    let output = fs.createWriteStream(outputName);
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    archive.pipe(output);

    for (let i = 0; i < n; i++) {
        if (fs.existsSync(listFileCurve[i]))
            archive.append(fs.createReadStream(listFileCurve[i]), { name: curveFiles[i] });
    }

    output.on('close', () => {
        let transferFile = fs.createReadStream(outputName).pipe(res);

        transferFile.on('close', () => {
            console.log('download file successfully');
            fs.unlinkSync(outputName);
        });
        transferFile.on('error', (e) => {
            console.log(e.message);
            fs.unlinkSync(outputName);
        });
    });

    archive.finalize().then((res)=>{
        console.log('Zip file successfully:', output.path);
    }).catch((err)=>{
        console.log('Zip error:', err.message);
    });

});

router.post('/upload', upload.single('curve'), (req, res) => {
    let pathOfZipFile = req.file.path;
    let curveInfos = req.body.curveInfo;
    let unzipProcesss = fs.createReadStream(pathOfZipFile).pipe(unzip.Extract({ path: curveBaseFolder}));
    unzipProcesss.on('error', (e)=>{
        res.json(responseJSON(false, e.message, {}));
        fs.unlinkSync(pathOfZipFile);
    });
    unzipProcesss.on('close', ()=>{
        res.json(responseJSON(true, 'successfully', {}));
        fs.unlinkSync(pathOfZipFile);

        //update
        for (let i = 0; i < curveInfos.length; i++) {
            CurveStatus.findOneAndUpdate({path: curveInfos[i].path.toString()}, {updatedAt: new Date(curveInfos[i].updatedAt)}, (err, doc)=>{
                if (err) {
                    console.log(err);
                }
            });
        }
        
    });
});

// router.post('/get-status', (req, res) => {
//     let user = req.body.user;
//     // CurveStatus.find({user: user}, (err, rs)=>{
//     //     if (err) {
//     //         res.json(responseJSON(false, err.message, {}));
//     //     } else {
//     //         if (rs) {
//     //             res.json(responseJSON(true, "successfully", rs));
//     //         } else {
//     //             res.json(responseJSON(false, "No found", {}));
//     //         }
//     //     }
//     // });
// });



module.exports = router;