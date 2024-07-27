const crypto = require('crypto');
const util = require('util');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');

const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const asyncHandler = require('../utils/async_handler');

const prisma = new PrismaClient();

// TODO Refactor these constant variables to some other file
const MAX_PASSWORD_SALT_HASH = 10;

exports.signUp = asyncHandler(async (req, res, next) => {

  let { phone, password, confirmPassword, firstName, lastName } = req.body;

  if (!phone || !password || !confirmPassword) {
    return next(new Exception('Please provider phone, password, confirmPassword.', 400));
  }

  if (password !== confirmPassword) {
    return next(new Exception('Passwords do not match', 400));
  }

  password = await bcrypt.hash(password, MAX_PASSWORD_SALT_HASH);

  const userCredential = await admin.auth().createUser({ phoneNumber: phone });
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  await admin.auth().setCustomUserClaims(userCredential.uid, { verificationCode, expiresIn: 300000 });

  const user = await prisma.user.create({
    data: { id: userCredential.uid, phone, password, firstName, lastName },
  });

  res.status(201).json({ status: true, message: 'Account Created Successfully', user: mapUser(user) });

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

  res.status(200).json({
    status: true, message: 'Welcome back', data: mapUser(user),
  });

  next();
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {

  const { phone } = req.body;

  if (!phone) return next(new Exception('Please provide phone number', 400));

  let user = await prisma.user.findUnique({
    where: { phone },
  });

  // const userCredential = await admin.auth().createUser({ phoneNumber: phone });
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // await admin.auth().setCustomUserClaims(userCredential.uid, { verificationCode, expiresIn: 300000 });

  if (!user) return next(new Exception('No User Registered with the phone', 400));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user = await prisma.user.update({
    where: { id: user.id }, data: { otp, otpCreatedAt: new Date() },
  });


  console.log(`OTP for ${phone} is`, otp);

  res.status(200).json({
    status: true, message: `OTP Sent successfully`,
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
    status: true, message: 'Password Updated Successfully',
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

  if (!user) return next(new Exception('No User Exists', 403));

  req.user = mapUser(user);

  next();
});


exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;
  const user = req.user;

  if (!phone || !password) {
    return next(new Exception('Please provide phone number and password', 400));
  }

  if (!user) return next(new Exception('Invalid phone number', 400));

  // the non-encrypted one has to be the first input
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return next(new Exception('Invalid Password Provided', 400));
  }

  await prisma.user.update({ where: { id: user.id }, data: { deleted: true, deletedAt: new Date() } });

  res.status(200).json({
    status: true, message: 'Account Deleted Successfully',
  });

  next();
});

exports.updateAccount = asyncHandler(async (req, res, next) => {

  const user = req.user;

  const { firstName, lastName, profile } = req.body;

  await prisma.user.update({
    where: { id: user.id }, data: { firstName, lastName, profile },
  });

  res.status(200).json({
    status: true, message: 'Account Updated Successfully',
  });

  next();
});

exports.updateFCMToken = asyncHandler(async (req, res, next) => {

  const user = req.user;

  const { fcmToken } = req.body;

  await prisma.user.update({ where: { id: user.id }, data: { fcmToken } });

  res.status(200).json({
    status: true, message: 'FCM Token Updated Successfully',
  });

  next();
});

exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { phone, otp } = req.body;

  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user) return next(new Exception('No User Exists', 404));

  let isValidOTP = false;

  if (user.otp === otp) {
    isValidOTP = true;

    await prisma.user.update({
      where: { id: user.id, otp: null, otpCreatedAt: null },
    });

    user.token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  }

  res.status(200).json({
    status: isValidOTP, message: 'Valid OTP Provided', token: isValidOTP ? user.token : undefined,
  });

  next();
});

const mapUser = (user) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    phoneVerified: user.phoneVerified ?? false,
    profile: user.profile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: user.token,
  };
};
