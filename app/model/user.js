module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const UserSchema = new Schema({
    // __v:
    email: { type: String, required: true },
    password: { type: String, required: true },
    nickname: { type: String, required: true },
    avatar: { type: String, required: false, default: '/user.png' },
  }, { timestamps: true })


  return mongoose.model('User', UserSchema)
}
