const crypto = require('crypto');
const util = require('util');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const asyncHandler = require('../utils/async_handler');

const prisma = new PrismaClient();

// const twilioClient = twilio(process.env.TEST_TWILIO_ACCOUNT_SID, process.env.TEST_TWILIO_AUTH_TOKEN, { lazyLoading: true });

// TODO Refactor these constant variables to some other file
const MAX_PASSWORD_SALT_HASH = 10;


exports.signUp = asyncHandler(async (req, res, next) => {

  let { phone, password, confirmPassword } = req.body;

  if (!phone || !password || !confirmPassword) {
    return next(new Exception('Please provider phone, password, confirmPassword.', 400));
  }

  if (password !== confirmPassword) {
    return next(new Exception('Passwords do not match', 400));
  }

  password = await bcrypt.hash(password, MAX_PASSWORD_SALT_HASH);

  await prisma.user.create({ data: { phone, password } });

  next();
});


exports.login = asyncHandler(async (req, res, next) => {

  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(new Exception('Please provide phone number and password', 400));
  }

  const user = await prisma.user.findUnique({
    where: { phone: phone },
  });

  if (!user) return next(new Exception('Invalid phone number', 400));

  // the non-encrypted one has to be the first input
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return next(new Exception('Invalid Password entered', 400));
  }

  user.token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  user.password = undefined;
  user.passwordChangedAt = undefined;
  user.otp = undefined;
  user.otpCreatedAt = undefined;
  user.deleted = undefined;
  user.deletedAt = undefined;

  res.status(200).json({
    status: true, message: 'Welcome back', data: user,
  });

  next();
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {

  const { phone } = req.body;

  if (!phone) return next(new Exception('Please provide phone number', 400));

  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) return next(new Exception('No User Registered with the phone', 400));

  let otp = '123456';
  let otpCreatedAt = new Date();

  otp = crypto.createHash('sha256').update(otp).digest('hex');

  user = await prisma.user.update({
    where: { id: user.id }, data: { otp, otpCreatedAt },
  });

  // const otpResult = await twilioClient.verify.v2.services('VA062d09d2e36baf8012fc1111adacdd67')
  //   .verifications
  //   .create({ to: phone, channel: 'sms' });

  res.status(200).json({
    status: true, message: `OTP Sent successfully`, data: user,
  });

  next();
});

exports.resetPassword = asyncHandler(async (req, res, next) => {

  let { phone, otp, password, confirmPassword } = req.body;

  if (!phone || !otp || !password || !confirmPassword) {
    return next(new Exception('Please provider phone, otp, password and confirm password', 400));
  }

  if (password !== confirmPassword) {
    return next(new Exception('Password and Confirm Password do not match', 400));
  }

  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) return next(new Exception('No User Registered with the phone', 400));

  if (user.otp === undefined || user.otpCreatedAt === undefined) {
    return next(new Exception('OTP Does not belong to this person'));
  }

  otp = crypto.createHash('sha256').update(otp).digest('hex');

  // It should also check for OTP Expiration as well

  if (user.otp !== otp) {
    return next(new Exception('Invalid OTP Provided', 400));
  }

  password = await bcrypt.hash(password, MAX_PASSWORD_SALT_HASH);
  const passwordChangedAt = new Date();

  await prisma.user.update({
    where: { id: user.id }, data: { otp: undefined, otpCreatedAt: undefined, password, passwordChangedAt },
  });

  res.status(200).json({
    status: true, message: 'Password updated successfully',
  });

  next();
});

exports.updatePassword = asyncHandler(async (req, res, next) => {

  let { password, newPassword, confirmNewPassword } = req.body;

  if (!password || !newPassword || !confirmNewPassword) {
    return next(new Exception('Please provider password, newPassword & confirmNewPassword', 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new Exception('newPassword and confirmNewPassword do not match', 400));
  }

  let user = req.user;

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return next(new Exception('Invalid Password entered', 400));
  }

  await prisma.user.update({
    where: { id: user.id }, data: { password: newPassword, passwordChangedAt: new Date() },
  });

  res.status(200).json({
    status: true, message: 'Password updated successfully',
  });

  next();
});


exports.authorise = asyncHandler(async (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token || !token.startsWith('Bearer ')) {
    return next(new Exception('Please login to access', 403));
  }
  
  token = token.replace('Bearer ', '');

  const result = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: { id: result.id },
  });

  if (!user) return next(new Exception('No User Exists', 400));

  req.user = user;

  next();
});


exports.deleteAccount = asyncHandler(async (req, res, next) => {

  const user = req.user;

  await prisma.user.update({
    where: { id: user.id },
    data: { deleted: true },
  });

  res.status(204).json({
    status: true,
    message: 'Account Deleted Successfully',
  });

  next();
});


exports.updateAccount = asyncHandler(async (req, res, next) => {

  const user = req.user;

  const { firstName, lastName, profile } = req.body;

  await prisma.user.update({
    where: { id: user.id },
    data: { firstName, lastName, profile },
  });

  res.status(200).json({
    status: true,
    message: 'Account Updated Successfully',
  });

  next();
});
