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

    let outputName = './downloads/curves_' + Date.now() + '_' + Math.floor(Math.random() * 100000) + '.zip';

    let n = listFileCurve.length;
    
    let output = fs.createWriteStream(outputName);
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    archive.pipe(output);

    for (let i = 0; i < n; i++) {
        if (fs.existsSync(listFileCurve[i]))
            console.log('exist:', listFileCurve[i]);
            archive.append(fs.createReadStream(listFileCurve[i]), { name: curveFiles[i] });
    }

    output.on('close', () => {
        let transferFile = fs.createReadStream(outputName).pipe(res);

        transferFile.on('finish', () => {
            console.log('download file successfully');
            fs.unlink(outputName, (err)=>{
                if (err) {
                    console.log('delete file err:', err.message);
                } else {
                    console.log('delete file successfully:', outputName);
                }
            });
        });

        transferFile.on('error', (e) => {
            console.log(e.message);
            fs.unlink(outputName, (err) => {
                if (err) {
                    console.log('delete file err:', err.message);
                } else {
                    console.log('delete file successfully', outputName);
                }
            });
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
    let curveInfos = JSON.parse(req.body.curveInfo);
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
            let date = new Date(curveInfos[i].updatedAt);
            CurveStatus.findOneAndUpdate({path: curveInfos[i].path}, {updatedAt: date}, (err, doc)=>{
                if (err) {
                    console.log(err);
                }
                console.log(doc);
                if (!doc) {
                    // this is new one, create it
                    let curveStt = new CurveStatus({
                        path: curveInfos[i].path,
                        updatedAt: date,
                        user: curveInfos[i].user
                    });
                    curveStt.save((err)=>{
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        }
        
    });
});

// router.get('/zip-download', (req,res)=>{

//     let outputName = './downloads/file' + Date.now() + '.zip';
    
//     let output = fs.createWriteStream(outputName);
//     let archive = archiver('zip', {
//         zlib: { level: 9 } // Sets the compression level.
//     });
//     archive.pipe(output);

//     archive.append(fs.createReadStream('./install-docker.pdf'), { name: 'install-docker.pdf' });
//     archive.append(fs.createReadStream('./install-i2g.pdf'), { name: '/folder/install-i2g.pdf' });

//     output.on('close', () => {
//         let transferFile = fs.createReadStream(outputName).pipe(res);

//         transferFile.on('finish', () => {
//             console.log('download file successfully');
//             fs.unlink(outputName, (err)=>{
//                 if (err) {
//                     console.log('delete file err:', err.message);
//                 } else {
//                     console.log('delete file successfully');
//                 }
//             });
//         });
//         transferFile.on('error', (e) => {
//             console.log(e.message);
//             fs.unlink(outputName, (err) => {
//                 if (err) {
//                     console.log('delete file err:', err.message);
//                 } else {
//                     console.log('delete file successfully');
//                 }
//             });
//         });
//     });

//     archive.finalize().then((res)=>{
//         console.log('Zip file successfully:', output.path);
//     }).catch((err)=>{
//         console.log('Zip error:', err.message);
//     });
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