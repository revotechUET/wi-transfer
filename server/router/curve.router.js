const router = require('express').Router();
const zlib = require('zlib');
const responseJSON = require('./../json-response');
const archiver = require('archiver');
const fs = require('fs');
const config = require('config');
// let CurveStatus = require('./curve-status.model').model;

let curveBaseFolder = process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath;

router.post('/download', (req, res) => {
    let curveFiles = req.body.curveFiles;
    let listFileCurve = curveFiles.map((e) => curveBaseFolder + e);
    let outputName = __dirname + '/curves_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + '.zip';
    let output = fs.createWriteStream(outputName);
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    archive.pipe(output);

    let n = listFileCurve.length;
    for (let i = 0; i < n; i++) {
        if (fs.existsSync(listFileCurve[i]))
        archive.append(fs.createReadStream(listFileCurve[i]), { name: curveFiles[i] });
    }

    archive.on('finish', ()=>{
        let transferFile = fs.createReadStream(outputName).pipe(res);

        transferFile.on('close', () => {
            console.log('download file successfully');
            fs.unlink(outputName);
        });
        transferFile.on('error', (e) => {
            console.log(e.message);
        });
    });
        
    archive.finalize();

});

// router.post('/upload', (req, res) => {

// });

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