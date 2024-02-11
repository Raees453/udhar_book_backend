const { PrismaClient } = require('@prisma/client');
const Exception = require('../utils/exception');

const prisma = new PrismaClient();

const asyncHandler = require('../utils/async_handler');

exports.signup = asyncHandler(async (req, res, next) => {
  console.log('Sign up');

  let { name, email, phone, password } = req.body;

  if (!(email || phone)) {
    return next(new Exception('Please provide name or email', 400));
  }

  if (!password) {
    return next(new Exception('Please provide password', 400));
  }

  const result = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password,
    },
  });

  return res.status(200).json({
    status: true,
    data: removeNullValues(result),
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  console.log('Login');

  return res.status(200).json({
    status: true,
  });
});

function removeNullValues(_) {
  return Object.fromEntries(
    Object.entries(_).filter(
      ([_, value]) => value !== null || _.toLowerCase() === 'password',
    ),
  );
}
