'use strict'
const { Service } = require('egg')

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
