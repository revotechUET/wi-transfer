const router = require('express').Router();
const zlib = require('zlib');
const responseJSON = require('./../json-response');
// let CurveStatus = require('./curve-status.model').model;

router.post('/download', (req, res)=>{
    
});

router.post('/upload', (req, res)=>{

});

router.post('/get-status', (req, res)=>{
    let user = req.body.user;
    // CurveStatus.find({user: user}, (err, rs)=>{
    //     if (err) {
    //         res.json(responseJSON(false, err.message, {}));
    //     } else {
    //         if (rs) {
    //             res.json(responseJSON(true, "successfully", rs));
    //         } else {
    //             res.json(responseJSON(false, "No found", {}));
    //         }
    //     }
    // });
});



module.exports = router;