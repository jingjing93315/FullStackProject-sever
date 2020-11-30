'use strict'
const md5 = require('md5')
const BaseController = require('./base')

const jwt = require('jsonwebtoken')

const HashSalt = ':goajing@good!@19930315'
const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
}
class UseController extends BaseController {
  async login() {
    // this.success('token')
    const { ctx, app } = this
    const { email, captcha, password, emailcode } = ctx.request.body
    if (emailcode !== ctx.session.emailcode.toUpperCase()) {
      return this.error('邮箱验证码错误')
    }
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + HashSalt),
    })
    if (!user) {
      return this.error('用户名密码错误')
    }
    // 用户信息加密成token
    const token = jwt.sign({
      id: user._id,
      email,
    }, app.config.jwt.secret, {
      expiresIn: '1h',
    })

    this.success({ token, email, nickname: user.nickname })

  }
  async register() {
    const { ctx } = this
    try {
      // 校验传递参数
      ctx.validate(createRule)
    } catch (e) {
      return this.error('参数校验失败', -1, e.errors)
    }

    const { email, password, captcha, nickname } = ctx.request.body
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    // email 是否 repeating
    if (await this.checkEmail(email)) {
      return this.error('邮箱重复啦')
    }
    const ret = await ctx.model.User.create({
      email,
      nickname,
      password: md5(password + HashSalt),
    })

    if (ret._id) {
      this.message('register success')
    }


    // this.success({name: 'gaojing'})
  }
  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email })
    return user
  }
  async verify() {
    // 校验用户名是否存在
  }

  async info() {
    // 可以获取header，解析
    // 使用中间件
    const { ctx } = this
    const { email } = ctx.state
    const user = await this.checkEmail(email)
    this.success(user)

  }
}

module.exports = UseController

