const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const asyncHandler = require('../utils/async_handler');

const prisma = new PrismaClient();

exports.getTransactions = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { id } = req.body;

  if (!id) return next(new Exception('Please provide id', 403));

  const transactions = await prisma.transaction.findMany({
    where: {
      owner: user.id,
      tenant: id,
    },
  });

  return res.status(200).json({
    status: true,
    data: transactions,
  });
});

exports.createTransaction = asyncHandler(async (req, res, next) => {
  const user = req.user;

  let { id, amount, description, date, attachment } = req.body;

  if (!id) return next(new Exception('Please provide id', 403));

  if (!id || !amount) {
    return next(new Exception('Please provide all the details', 403));
  }

  date ??= Date.now();

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      description,
      attachment,
      owner: user.id,
      tenant: id,
    },
  });

  return res.status(200).json({
    status: true,
    data: transaction,
  });
});

exports.editTransaction = asyncHandler(async (req, res, next) => {});

exports.deleteTransaction = asyncHandler(async (req, res, next) => {});
