'use strict'
const { Service } = require('egg')
const fse = require('fs-extra')
const path = require('path')

const nodemailer = require('nodemailer')

const userEmail = 'zuisidejingjing@163.com'

const transporter = nodemailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'WWVHLLCQQTQZAIWI',
  },
})

class ToolService extends Service {

  async mergeFile(filePath, filehash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, filehash) // 切片的文件夹
    let chunks = await fse.readdir(chunkDir)
    chunks.sort((a, b) =>
      a.split('-')[1] - b.split('-')[1]
    )
    chunks = chunks.map(cp => path.resolve(chunkDir, cp))
    await this.mergeChunks(chunks, filePath, size)
  }
  async mergeChunks(files, dest, size) {
    const pipStream = (filePath, writeStream) =>
      new Promise(resolve => {
        const readStream = fse.createReadStream(filePath)
        readStream.on('end', () => {
          fse.unlinkSync(filePath)
          resolve()
        })
        readStream.pipe(writeStream)
      })
    await Promise.all(
      files.forEach((file, index) => {
        pipStream(file, fse.createWriteStream(dest, {
          start: index * size,
          end: (index + 1) * size,
        }))
      })
    )
  }
  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      cc: userEmail, // 发送给自己，规避垃圾邮件规则
      to: email,
      subject,
      text,
      html,
    }

    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (err) {
      console.log('email error', err)
      return false
    }
  }
}

module.exports = ToolService
