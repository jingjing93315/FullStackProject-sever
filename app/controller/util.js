'use strict'
const svgCaptcha = require('svg-captcha')
const BaseController = require('./base')
const fse = require('fs-extra')
const path = require('path')

class UtilController extends BaseController {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    })
    this.ctx.session.captcha = captcha.text

    this.ctx.response.type = 'image/svg+xml'
    this.ctx.body = captcha.data
  }
  async checkFile() {
    const { ctx } = this
    const { ext, hash } = ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    let uploaded = false
    let uploadedList = []
    if (fse.existsSync(filePath)) {
      // 文件存在
      uploaded = true
    } else {
      uploadedList = await this.getUploadedList(
        path.resolve(this.config.UPLOAD_DIR, hash)
      )
    }
    this.success({
      uploaded,
      uploadedList,
    })
  }
  // .DS_Store
  async getUploadedList(dirPath) {
    return fse.existsSync(dirPath)
      ? (await fse.readdir(dirPath)).filter(name => name[0] !== '.')
      : []
  }
  async uploadFile() {
    // /public/hash/name(hash+index)
    // 报错
    // if (Math.random() > 0.5) {
    //   return this.ctx.status = 500
    // }

    const { ctx } = this
    const file = ctx.request.files[0]
    const { hash, name } = ctx.request.body
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)
    // const filePath = path.resolve() // 文件最终存储位置，合并之后

    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }
    // console.log(name, file)
    // this.success({url: 'xxx'})
    // const targetDir = path.resolve()
    await fse.move(file.filepath, `${chunkPath}/${name}`)
    this.message('切片上传成功')
  }
  async mergeFile() {
    const { ext, size, hash } = this.ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await this.ctx.service.tools.mergeFile(filePath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`,
    })
  }
  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random()
      .toString()
      .slice(2, 6)
    console.log(code)
    ctx.session.emailcode = code
    const subject = 'gaojing' // 发送邮件的主题名称
    const text = ''
    const html = `<h2>一线蓝光</h2><a href="https://kaikeba.com"><span>${code}</span></a>`
    const hasSend = await this.service.tools.sendMail(
      email,
      subject,
      text,
      html
    )
    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }
}

module.exports = UtilController
