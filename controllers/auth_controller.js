const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const asyncHandler = require('../utils/async_handler');

exports.signup = asyncHandler(async (req, res, next) => {
  console.log('Sign up');


  const { name, email } = req.body;


  const result = await prisma.user.create({
    data: {
      name, email,
    },
  });

  console.log('RESULT', result);

  return res.status(200).json({
    'status': true, 'data': result,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  console.log('Login');

  return res.status(200).json({
    'status': true,
  });

});
