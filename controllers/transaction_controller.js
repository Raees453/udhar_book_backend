const asyncHandler = require('../utils/async_handler');
const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const prisma = new PrismaClient();

exports.getTransactions = asyncHandler(async (req, res, next) => {
  const { user, contact } = req;

  let transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { ownerId: user.id, contactId: contact.id },
        { ownerId: contact.id, contactId: user.id },
      ],
    },
  });

  let total = 0;

  transactions = transactions.map(transaction => {
    if (transaction.ownerId !== user.id) transaction = { ...transaction, amount: -transaction.amount };

    total += transaction.amount;

    return transaction;
  });

  res.status(200).json({
    status: true,
    amount: total,
    data: transactions,
  });

  next();
});


exports.createTransaction = asyncHandler(async (req, res, next) => {
  const { user, contact } = req;
  const { amount, description } = req.body;

  await prisma.transaction.create({
    data: { amount, ownerId: user.id, contactId: contact.id, description },
  });

  next();
});

exports.updateTransaction = asyncHandler(async (req, res, next) => {
  const { amount, description } = req.body;
  const { user } = req;

  let { id } = req.params;

  if (!id) id = req.body.id;


  if (!id) return next(new Exception('Please provide id', 400));

  let transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) return next(new Exception('No Transaction Found', 404));

  if (transaction.ownerId !== user.id) {
    return next(new Exception('You do not have permission to edit this transaction', 400));
  }

  if (!transaction) return next(new Exception('No Transaction Found', 404));

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { amount, description },
  });

  next();
});

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const { user } = req;

  let { id } = req.params;

  if (!id) id = req.body.id;

  if (!id) return next(new Exception('Please provide id', 400));

  let transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) return next(new Exception('No Transaction Found', 404));

  req.contact = await prisma.contact.findUnique({ where: { id: transaction.contactId } });

  if (transaction.ownerId !== user.id) {
    return next(new Exception('You do not have permission to delete this transaction', 400));
  }

  await prisma.transaction.delete({ where: { id } });

  next();
});
