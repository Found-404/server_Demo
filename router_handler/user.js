/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */

// 导入数据库操作模块
const db = require('../db/index');

// 导入bcryptjs密码加密模块
const bcrypt = require('bcryptjs')

// 导入生成token的包
const jwt = require('jsonwebtoken');
const config = require('../config');


// 注册用户的处理函数
exports.regUser = (req, res) => {
    // 获取客户端提交到服务器的信息
    const userinfor = req.body;
    // 对表单中的数据进行合法性的校验
    if (!userinfor.username || !userinfor.password) {
        return res.send({
            status: 1,
            message: '用户名或密码不合法'
        });
    };
    // 定义SQL语句,查询用户名是否被占用
    const sqlStr = 'select * from ev_users where username=?';
    db.query(sqlStr, userinfor.username, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        };
        // 判断用户名是否被占用
        if (results.length > 0) {
            return res.send({
                status: 1,
                message: '用户名被占用，请更换其他用户名！'
            });
        };
        // TODO：用户名可用
        // 调用bcryptjs.hashSync() 对密码进行加密
        userinfor.password = bcrypt.hashSync(userinfor.password, 10);

        // 定义插入新用户的SQL语句
        const sql = 'insert into ev_users set ?';
        db.query(sql, { username: userinfor.username, password: userinfor.password }, (err, results) => {
            // 判断SQL语句是否执行成功
            if (err) {
                return res.send({
                    status: 1,
                    message: err.message
                })
            };
            // 注册用户成功
            res.send({
                status: 0,
                message: '注册成功！'
            });
        })


    });
    // res.send('reguser OK')
};

// 登录的处理函数
exports.login = (req, res) => {
    const userinfo = req.body;
    const sql = 'select * from ev_users where username=?';

    db.query(sql, userinfo.username, function(err, results) {
        // 执行 SQL 语句失败
        if (err) return res.cc(err);
        // 执行 SQL 语句成功，但是查询到数据条数不等于 1
        if (results.length !== 1) return res.cc('登录失败！');
        // TODO：判断用户输入的登录密码是否和数据库中的密码一致
        // 拿着用户输入的密码,和数据库中存储的密码进行对比
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password);
        console.log(compareResult);

        // 如果对比的结果等于 false, 则证明用户输入的密码错误
        if (!compareResult) {
            return res.cc('登录失败！');
        }
        // TODO：登陆成功 在服务器端生成 Token 字符串
        const user = {...results[0], password: '', user_pic: '' };
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn });
        // 调用res.send将token相应给客户端
        res.send({
            status: 0,
            message: '登陆成功',
            token: 'Bearer ' + tokenStr
        });
    });
};