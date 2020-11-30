'use strict'
// 解析token 中间件,也可以用egg-jwt，自己封装适合了解原理
const jwt = require('jsonwebtoken')
module.exports = ({ app }) => {
  return async function verify(ctx, next) {


    if (!ctx.request.header.authorization) {
      ctx.body = {
        code: -666,
        message: '用户未登录',
      }
      return false
    }

    const token = ctx.request.header.authorization.replace('Bearer ', '')
    console.log(token)
    try {
      const ret = await jwt.verify(token, app.config.jwt.secret)
      console.log(ret)
      ctx.state.email = ret.email
      ctx.state.userid = ret._id
      await next()

    } catch (err) {
      console.log(err)

      if (err.name === 'TokenExpiredError') {
        ctx.body = {
          code: -666,
          message: '登录已过期',
        }
      } else {
        ctx.body = {
          code: -1,
          message: '用户信息出错',
        }
      }

    }
  }
}
