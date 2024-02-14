const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const asyncHandler = require('../utils/async_handler');

const prisma = new PrismaClient();

exports.getTransactions = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { id } = req.body;

  if (!id) return next(new Exception('Please provide id', 403));

  console.log('User id', user.id, 'Id', id);

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { ownerId: user.id, tenantId: id },
        { ownerId: id, tenantId: user.id },
      ],
    },
  });

  const amountttt = await prisma.transaction.aggregate({
    where: {
      ownerId: { equals: user.id },
      tenantId: { equals: id },
    },

    _sum: {
      amount: true,
    },
  });

  return res.status(200).json({
    status: true,
    amount: amountttt,
    data: transactions,
  });
});

exports.createTransaction = asyncHandler(async (req, res, next) => {
  const { user, contact } = req;

  let { id, amount, description, date, attachment } = req.body;

  if (!id) {
    return next(new Exception('Please provide id', 403));
  }

  if (!amount) {
    return next(new Exception('Please provide all the details', 403));
  }

  const data = {
    amount,
    description,
    attachment,
    ownerId: user.id,
    tenantId: id,
  };

  console.log('Forward is been called', data);

  const transaction = await createTransaction(data);

  if (contact) {
    data.amount *= -1;
    data.ownerId = contact.id;
    data.tenantId = user.id;

    const reverseTransaction = await createTransaction(data);
  }

  const amountttt = await prisma.transaction.aggregate({
    where: {
      ownerId: { equals: user.id },
      tenantId: { equals: id },
    },

    sum: {
      amount: true,
    },
  });

  return res.status(200).json({
    amount: amountttt,
    status: true,
    data: transaction,
  });
});

exports.editTransaction = asyncHandler(async (req, res, next) => {});

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const user = req.user;

  let { id } = req.body;

  if (!id) return next(new Exception('Please provide id', 403));

  const transaction = await prisma.transaction.findUnique({ where: { id } });

  if (!transaction) {
    return next(new Exception('No Transaction Found', 404));
  }

  if (transaction.ownerId !== user.id) {
    return next(
      new Exception('You are not authorised to delete this transaction', 403),
    );
  }

  const deletedTransaction = await prisma.transaction.delete({
    where: { id },
  });

  return res.status(204).json({
    success: true,
  });
});

const createTransaction = (data) => {
  return prisma.transaction.create({ data });
};
