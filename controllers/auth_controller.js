const util = require('util');

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Exception = require('../utils/exception');

const prisma = new PrismaClient();

const asyncHandler = require('../utils/async_handler');

const MAX_PASSWORD_SALT = 10;

exports.signup = asyncHandler(async (req, res, next) => {
  let { name, email, phone, password } = req.body;

  if (!containsPhoneOrEmail(phone, email)) {
    return next(new Exception('Please provide name or email', 400));
  }

  if (!password) {
    return next(new Exception('Please provide password', 400));
  }

  password = await bcrypt.hash(password, MAX_PASSWORD_SALT);

  const result = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password,
    },
  });

  return res.status(201).json({
    status: true,
    data: removeNullValues(result),
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, phone, password } = req.body;

  if (!containsPhoneOrEmail(phone, email)) {
    return next(new Exception('Please provide name or email', 400));
  }

  if (!password) {
    return next(new Exception('Please provide password', 400));
  }

  const user = await findUserByPhoneOrEmail(phone, email);

  if (!user) return next(new Exception('No Account Found', 404));

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(new Exception('Invalid login credentials provided', 403));
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return res.status(200).json({
    status: true,
    token,
    data: removeNullValues(user),
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email, phone } = req.body;

  if (!containsPhoneOrEmail(phone, email)) {
    return next(new Exception('Please provide phone or email', 400));
  }

  const user = await findUserByPhoneOrEmail(phone, email);

  if (!user) {
    return next(new Exception('No Account Found', 404));
  }

  let message = 'An email has been sent with the OTP';

  if (phone) {
    // send an OTP to phone number

    message = 'OTP sent to registered phone number';
  } else {
    // send an email to email
  }

  return res.status(200).json({
    status: true,
    message,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  let { currentPassword, newPassword } = req.body;
  
  const { user } = req;

  if (!currentPassword || !newPassword) {
    return next(new Exception('Please provide new and old password', 400));
  }

  if (currentPassword === newPassword) {
    return next(
      new Exception('Current Password cannot be same as Old Password', 400),
    );
  }

  const isPasswordSame = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordSame) {
    return next(new Exception('Current Password is not valid', 400));
  }

  newPassword = await bcrypt.hash(newPassword, MAX_PASSWORD_SALT);

  const newUser = await prisma.user.update({
    where: { id: user.id },
    data: { password: newPassword, password_changed_at: new Date() },
  });

  return res.status(200).json({
    status: true,
    data: newUser,
  });
});

exports.authorise = asyncHandler(async (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token || !token.startsWith('Bearer ')) {
    return next(new Exception('Please login to access this route.', 403));
  }

  token = token.replace('Bearer ', '');

  const result = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  // TODO need to check if the user has already applied for change of password
  // TODO need to check if the jwt is been expired
  // TODO need to check if the password was created before the jwt was created

  const userId = result.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return next(new Exception('No Related account found for login', 404));
  }

  req.user = user;

  next();
});

const containsPhoneOrEmail = (phone, email) => email || phone;

const findUserByPhoneOrEmail = async function (phone, email) {
  return prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
    include: {
      contacts: true,
    },
  });
};

function removeNullValues(_) {
  return Object.fromEntries(
    Object.entries(_).filter(([_, value]) => {
      if (_ === 'password') {
        return false;
      }

      return value !== null;
    }),
  );
}
