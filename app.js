// 导入express
const express = require('express');
// 创建服务器实例对象
const app = express();
// 导入cors中间件
const cors = require('cors');
// 导入joi模块
const joi = require('joi');

// 响应数据的中间件
app.use(function(req, res, next) {
    // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = function(err, status = 1) {
        res.send({
            // 状态
            status,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
});

// 在路由之前配置解析token的中间件
const expressJWT = require('express-jwt');
const config = require('./config');

app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api/] }))




// 错误中间件
app.use(function(err, req, res, next) {
    // 数据验证失败
    if (err instanceof joi.ValidationError) return res.cc(err);
    // 未知错误
    res.cc(err)
});

// 将cors注册为全局中间件
app.use(cors());

// 配置解析表单数据的中间件
// 通过如下的代码，只能配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件：
app.use(express.urlencoded({ extended: false }));

// 导入并且使用用户路由模块
const userRouter = require('./router/user');
app.use('/api', userRouter);




// write your code here...
// 错误中间件
app.use(function(err, req, res, next) {
    // 省略其它代码...

    if (err instanceof joi.ValidationError) {
        return res.cc(err);
    }
    // 捕获身份认证失败的错误
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')

    // 未知错误...
})


// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(3007, function() {
    console.log('api server running at http://127.0.0.1:3007')
});