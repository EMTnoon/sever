
const express = require("express")
const multer = require("multer")
const path = require("path")
const app = express();
const { db, genid } = require("./db/DbUtils")
const port = 8080


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method == "OPTIONS") res.sendStatus(200);
    else next();
});

app.use(express.json())
const update = multer({
    dest: "./public/upload/temp"
})
app.use(update.any())
app.use(express.static(path.join(__dirname, "public")))

const ADMIN_TOKEN_PATH = "/_token"
app.all("*", async (req, res, next) => {
    if (req.path.indexOf(ADMIN_TOKEN_PATH) > -1) {

        let { token } = req.headers;

        let admin_token_sql = "SELECT * FROM `admin` WHERE `token` = ?"
        let adminResult = await db.async.all(admin_token_sql, [token])
        if (adminResult.err != null || adminResult.rows.length == 0) {
            res.send({
                code: 403,
                msg: "请先登录"
            })
            return
        } else {
            next()
        }
    } else {
        next()
    }
})

app.use("/admin", require("./routers/AdminRouter"))
app.use("/category", require("./routers/CategoryRouter"))
app.use("/blog", require("./routers/BlogRouter"))
app.use("/upload", require("./routers/UploadRouter"))

app.get("/", (req, res) => {
    res.send("hello world");
})

app.listen(port, () => {
    console.log(`启动成功 : http://localhost:${port}/`)
})

