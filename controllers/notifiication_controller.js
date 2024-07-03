const admin = require('firebase-admin');
const asyncHandler = require('../utils/async_handler');
const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const prisma = new PrismaClient();

exports.sendNotification = asyncHandler(async (req, res, next) => {
  const { fcmToken } = req.body;

  try {
    await admin.messaging().send({
      token: fcmToken,
      data: {
        name: 'Hello World From Token',
      },
    });
  } catch (e) {
    console.log(e);
  }

  res.status(200).json({
    status: true,
  });
});

// When a transaction, contact is CRUD

exports.addNotification = asyncHandler(async (req, res, next) => {
  const { transaction, contact, user, subject, reason } = req;

  if (transaction) {
    await prisma.notification.create({
      data: {
        subject,
        reason,
        data: JSON.stringify({
          sender: user,
          receiver: contact,
        }),
        owner: {
          connect: { id: user.id },
        },
      },
    });
  } else {
  }

  req.subject = undefined;
  req.reason = undefined;
  next();
});
