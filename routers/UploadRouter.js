const express = require("express")
const router = express.Router()
const fs = require("fs")
const { db, genid } = require("../db/DbUtils")

router.post("/cover_upload", async (req, res) => {
    if (!req.files) {
        res.send({
            "code": 404,
            "message": "上传失败"
        })
        return;
    }
    let files = req.files;
    let ret_files = [];
    for (let file of files) {
        let file_ext = file.originalname.substring(file.originalname.lastIndexOf(".") + 1)
        let file_name = genid.NextId() + "." + file_ext
        fs.renameSync(
            process.cwd() + "/public/upload/temp/" + file.filename,
            process.cwd() + "/public/upload/cover/" + file_name
        )
        ret_files.push("/upload/cover/" + file_name)
    }
    res.send({
        "code": 200,
        "msg": '上传成功',
        "data": {
            "url": ret_files[0],
        }
    })

})


router.post("/rich_editor_upload", async (req, res) => {
    if (!req.files) {
        res.send({
            "errno": 1,
            "message": "失败信息"
        })
        return;
    }
    let files = req.files;
    let ret_files = [];
    for (let file of files) {
        let file_ext = file.originalname.substring(file.originalname.lastIndexOf(".") + 1)
        let file_name = genid.NextId() + "." + file_ext
        fs.renameSync(
            process.cwd() + "/public/upload/temp/" + file.filename,
            process.cwd() + "/public/upload/" + file_name
        )
        ret_files.push("/upload/" + file_name)
    }
    res.send({
        "errno": 0,
        "data": {
            "url": ret_files[0],
        }
    })

})


module.exports = router