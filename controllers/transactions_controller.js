const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const asyncHandler = require('../utils/async_handler');

const prisma = new PrismaClient();

exports.getTransactions = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { id } = req.body;

  if (!id) return next(new Exception('Please provide id', 403));

  const transactions = await prisma.transaction.findMany({
    where: { ownerId: user.id, tenantId: id },
  });

  const amount = await gatherAmount({ ownerId: user.id, tenantId: id });

  return res.status(200).json({
    status: true,
    amount,
    data: transactions,
  });
});

exports.createTransaction = asyncHandler(async (req, res, next) => {
  const { user, contact } = req;

  console.log('Contact', contact);

  let { id, amount, description, date, attachment } = req.body;

  if (!id) {
    return next(new Exception('Please provide contact id', 403));
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

  let transaction = await createTransaction(data);

  if (contact) {
    data.amount *= -1;
    data.tenantId = user.id;
    data.ownerId = id;
    data.parentId = transaction.id;

    console.log('Reverse Amount', data.amount);
    const reverseTransaction = await createTransaction(data);

    transaction.childId = reverseTransaction.id;

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: transaction,
    });
  }

  const totalAmount = await gatherAmount({ ownerId: user.id, tenantId: id });

  return res.status(200).json({
    status: true,
    amount: totalAmount,
    data: transaction,
  });
});

exports.editTransaction = asyncHandler(async (req, res, next) => {
  let { user, transaction, attachedTransaction } = req;

  const { amount, description, attachment, date, id } = req.body;

  const hasAttachedTransaction = attachedTransaction !== undefined;

  if (amount) transaction.amount = amount;

  if (amount && hasAttachedTransaction)
    attachedTransaction.amount = amount * -1;

  if (description) transaction.description = description;

  if (description && hasAttachedTransaction)
    attachedTransaction.description = description;

  if (attachment) transaction.attachment = attachment;

  if (attachment && hasAttachedTransaction)
    attachedTransaction.attachment = attachment;

  transaction = await prisma.transaction.update({
    where: { id: transaction.id },
    data: transaction,
  });

  if (hasAttachedTransaction) {
    attachedTransaction = await prisma.transaction.update({
      where: { id: attachedTransaction.id },
      data: attachedTransaction,
    });
  }

  const totalAmount = await gatherAmount({ ownerId: user.id, tenantId: id });

  return res.status(200).json({
    status: true,
    amount: totalAmount,
    data: transaction,
  });
});

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  let { user } = req;

  let { id } = req.body;

  if (!id) return next(new Exception('Please provide id', 403));

  const transaction = await deleteTransaction({ where: { id } });

  if (!transaction) {
    return next(new Exception('No Transaction Found', 404));
  }

  if (transaction.childId) {
    await deleteTransaction({ where: { id: transaction.childId } });
  } else if (transaction.parentId) {
    await deleteTransaction({ where: { id: transaction.parentId } });
  }

  const amount = await gatherAmount({
    ownerId: user.id,
    tenantId: transaction.tenantId,
  });

  return res.status(200).json({
    status: true,
    amount,
  });
});

exports.attachTransactions = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  const transaction = await prisma.transaction.findUnique({ where: { id } });

  if (!transaction) {
    return next(new Exception('No Transaction found for the id provided'));
  }

  const attachedTransaction = await prisma.transaction.findFirst({
    where: { OR: [{ parentId: transaction.id }, { childId: transaction.id }] },
  });

  if (attachedTransaction) {
    req.attachedTransaction = attachedTransaction;
  }

  req.transaction = transaction;

  return next();
});

const createTransaction = (data) => prisma.transaction.create({ data });

const deleteTransaction = (condition) => prisma.transaction.delete(condition);

const gatherAmount = async (condition) =>
  (
    await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: condition,
    })
  )['_sum']['amount'] ?? 0;
