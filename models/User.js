import mongoose from 'mongoose'
import crypto from 'crypto'

const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  user_is_verified: {
    type: Boolean,
    default: false
  },
  activation_token: {
    type: String,
    default: null
  }
}, { timestamps: true })

const User = mongoose.model('users', userSchema)

export default User
