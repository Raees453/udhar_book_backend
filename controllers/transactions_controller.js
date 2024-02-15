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

  const transaction = await createTransaction(data);

  if (contact) {
    data.amount *= -1;
    data.tenantId = data.ownerId;
    data.ownerId = user.id;

    const reverseTransaction = await createTransaction(data);
  }

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
    amount: amountttt,
    status: true,
    data: transaction,
  });
});

exports.editTransaction = asyncHandler(async (req, res, next) => {
  const { user, transaction, attachedTransaction } = req;

  const { amount, description, attachment } = req.body;

  if (amount) {
    transaction.amount = amount;
    if (attachedTransaction) {
      attachedTransaction.amount = amount * -1;
    }
  }

  if (description) {
    transaction.description = description;
    if (attachedTransaction) {
      attachedTransaction.description = description;
    }
  }

  if (attachment) {
    transaction.attachment = attachment;
    if (attachedTransaction) {
      attachedTransaction.attachment = attachment;
    }
  }

  let newTransaction, newAttachedTransaction;

  newTransaction = await prisma.transaction.update({
    where: { id: transaction.id },
    data: transaction,
  });

  if (attachedTransaction) {
    newAttachedTransaction = await prisma.transaction.update({
      where: { id: attachedTransaction.id },
      data: attachedTransaction,
    });
  }

  const isTransactionSuccessful = validateSuccessfulTransactions(
    req,
    newTransaction,
    attachedTransaction,
  );

  if (!isTransactionSuccessful) {
    await deleteTransactions(newTransaction, newAttachedTransaction);

    return next(new Exception('Some error occurred.', 400));
  }

  return res.status(200).json({
    status: true,
    data: newTransaction,
  });
});

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const user = req.user;

  let { id } = req.body;

  if (!id) return next(new Exception('Please provide id', 403));

  return res.status(204).json({
    success: true,
  });
});

exports.attachTransactions = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  const transaction = await prisma.transaction.findUnique({ where: { id } });

  if (!transaction) {
    return next(new Exception('No Transaction found for the id provided'));
  }

  const attachedTransaction = await prisma.transaction.findFirst({
    where: { parentId: transaction.id },
  });

  if (attachedTransaction) {
    req.attachedTransaction = attachedTransaction;
  }

  req.transaction = transaction;

  return next();
});

const createTransaction = (data) => prisma.transaction.create({ data });

const validateSuccessfulTransactions = (
  req,
  actualTransaction,
  copyTransaction,
) => {
  const isLocalTransaction = req.attachedTransaction === null;

  if (isLocalTransaction) {
    return actualTransaction !== null;
  }

  return (
    actualTransaction !== null &&
    copyTransaction !== null &&
    copyTransaction?.parentId === actualTransaction.id
  );
};

const deleteTransactions = async (actualTransaction, copyTransaction) => {
  return prisma.transaction.delete({
    where: { id: actualTransaction.id },
  });
};
