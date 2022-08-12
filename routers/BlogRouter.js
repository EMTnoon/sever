const express = require('express')
const router = express.Router()
const { db, genid } = require('../db/DbUtils')

// router.get("/text", async (req, res) => {

//     pageNum = 2
//     pageSize = 5
//     let blog_sql = 'select * from `blog` limit ?,?'
//     let searchCountSql = " SELECT count(*) AS `count` FROM  "
//     let { err, rows } = await db.async.all(blog_sql, [(pageNum-1)*pageSize,pageSize])
//     let countResult = await db.async.all(searchCountSql,[])
//     if (err == null) {
//         res.send({
//             code: 200,
//             msg: "获取成功",
//             rows,
//             count:countResult.rows[0].count
//         })
//     } else {
//         res.send({
//             code: 500,
//             msg: "获取失败"
//         })
//     }

// })
router.get('/createtime', async (req, res) => {
    let detail_sql = 'SELECT `date` FROM `blog` '
    let { err, rows } = await db.async.all(detail_sql)

    if (err == null) {
        res.send({
            code: 200,
            msg: '获取成功',
            rows,
        })
    } else {
        res.send({
            code: 500,
            msg: '获取失败',
        })
    }
})
router.get('/detail', async (req, res) => {
    let { id } = req.query
    let detail_sql = 'SELECT * FROM `blog` WHERE `id` = ? '
    let { err, rows } = await db.async.all(detail_sql, [id])

    if (err == null) {
        res.send({
            code: 200,
            msg: '获取成功',
            rows,
        })
    } else {
        res.send({
            code: 500,
            msg: '获取失败',
        })
    }
})
router.get('/bloglist', async (req, res) => {
    let { pageNum, pageSize, searchTime } = req.query
    pageNum = pageNum == null ? 1 : pageNum
    pageSize = pageSize == null ? 5 : pageSize
    let blogCountSql = 'SELECT * FROM `blog` WHERE `date` = ? limit ?,? '
    let searchCountSql =
        ' SELECT count(*) AS `count` FROM `blog` where `date` = ? '
    const timeConversion = (time) => {
        let Time = new Date(time)
        let Cltime = `${Time.getFullYear()}年${Time.getMonth() + 1
            }月${Time.getDate()}日`
        return Cltime
    }
    if (searchTime) {
        searchTime = timeConversion(JSON.parse(searchTime))
    }
    let { err, rows } = await db.async.all(blogCountSql, [
        searchTime,
        (pageNum - 1) * pageSize,
        pageSize,
    ])
    let countResult = await db.async.all(searchCountSql, [searchTime])
    if (err == null) {
        res.send({
            code: 200,
            msg: '获取成功',
            rows,
            count: countResult.rows[0].count,
        })
    } else {
        res.send({
            code: 500,
            msg: '获取失败',
        })
    }
})
router.get('/search/blogCount', async (req, res) => {
    let blogCountSql = ' SELECT count(*) AS `count` FROM `blog`  '
    let { err, rows } = await db.async.all(blogCountSql)
    if (err == null) {
        res.send({
            code: 200,
            msg: '获取成功',
            rows,
        })
    } else {
        res.send({
            code: 500,
            msg: '获取失败',
        })
    }
})
//查询博客
router.get('/search', async (req, res) => {
    let { keyword, categoryId, page, pageSize, searchTime } = req.query
    page = page == null ? 1 : page
    pageSize = pageSize == null ? 10 : pageSize
    categoryId = categoryId == null ? 0 : categoryId
    keyword = keyword == null ? '' : keyword

    let params = []
    let whereSqls = []
    if (categoryId != 0) {
        whereSqls.push(' `category_id` = ? ')
        params.push(categoryId)
    }

    if (keyword != '') {
        whereSqls.push(' (`title` LIKE ? OR `content` LIKE ?) ')
        params.push('%' + keyword + '%')
        params.push('%' + keyword + '%')
    }
    let whereSqlStr = ''
    if (whereSqls.length > 0) {
        whereSqlStr = ' WHERE ' + whereSqls.join(' AND ')
    }
    //查分页数据
    let searchSql =
        ' SELECT `id`,`category_id`,`date`,`create_time`,`title`,`cover_img`,substr(`content`,0,50) AS `content` FROM `blog` ' +
        whereSqlStr +
        ' ORDER BY `create_time` DESC LIMIT ?,? '

    let searchSqlParams = params.concat([(page - 1) * pageSize, pageSize])

    //查询数据总数
    let searchCountSql = ' SELECT count(*) AS `count` FROM `blog` ' + whereSqlStr
    let searchCountParams = params
    //分页数据
    let searchResult = await db.async.all(searchSql, searchSqlParams)
    let countResult = await db.async.all(searchCountSql, searchCountParams)
    if (searchResult.err == null && countResult.err == null) {
        res.send({
            code: 200,
            msg: '查询成功',
            data: {
                keyword,
                categoryId,
                page,
                pageSize,
                rows: searchResult.rows,
                count: countResult.rows[0].count,
            },
        })
    } else {
        res.send({
            code: 500,
            msg: '查询失败',
        })
    }
})

// 删除接口
router.delete('/_token/delete', async (req, res) => {
    let id = req.query.id
    const delete_sql = 'DELETE FROM `blog` WHERE `id` = ?'
    let { err, rows } = await db.async.run(delete_sql, [id])

    if (err == null) {
        res.send({
            code: 200,
            msg: '删除成功',
        })
    } else {
        res.send({
            code: 500,
            msg: '删除失败',
        })
    }
})

//修改博客
router.put('/_token/update', async (req, res) => {
    let { id, title, categoryId, content } = req.body
    let create_time = new Date().getTime()

    const update_sql =
        'UPDATE `blog` SET `title` = ?,`content` = ?,`category_id` = ? WHERE `id` = ?'
    let params = [title, content, categoryId, id]

    let { err, rows } = await db.async.run(update_sql, params)

    if (err == null) {
        res.send({
            code: 200,
            msg: '修改成功',
        })
    } else {
        res.send({
            code: 500,
            msg: '修改失败',
        })
    }
})

//添加博客
router.post('/_token/add', async (req, res) => {
    let { title, categoryId, content, coverImg } = req.body
    let id = genid.NextId()
    let create_time = new Date().getTime()
    let time = new Date()
    let date = `${time.getFullYear()}年${time.getMonth() + 1
        }月${time.getDate()}日`
    const insert_sql =
        'INSERT INTO `blog`(`id`,`title`,`category_id`,`content`,`create_time`, `cover_img`,`date`) VALUES (?,?,?,?,?,?,?)'
    let params = [id, title, categoryId, content, create_time, coverImg, date]

    let { err, rows } = await db.async.run(insert_sql, params)

    if (err == null) {
        res.send({
            code: 200,
            msg: '添加成功',
        })
    } else {
        res.send({
            code: 500,
            msg: '添加失败',
        })
    }
})

module.exports = router
