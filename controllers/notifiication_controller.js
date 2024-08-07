const admin = require('firebase-admin');
const asyncHandler = require('../utils/async_handler');
const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const prisma = new PrismaClient();

exports.sendNotification = asyncHandler(async (req, res, next) => {
  const { fcmToken, fcmTokenData, notification } = req.body;

  if(!(fcmToken && fcmTokenData && notification)) return next();

  // console.log('Token', fcmToken);
  // console.log('Body', fcmTokenData);
  // console.log('Notification', notification);

  try {
    const response = await admin.messaging().send({ token: fcmToken, data: fcmTokenData, notification });

    console.log(response);

  } catch (e) {
    // TODO Research on it and figure out the common issues to optimise the catch block
    // await admin.messaging().send({ token: fcmToken, data: fcmTokenData });

    console.error(e);
  }

  req.body.fcmTokenData = undefined;
  req.body.notification = undefined;

  next();
});

// When a transaction, contact is CRUD

exports.addNotification = asyncHandler(async (req, res, next) => {
  const { transaction, contact, user, subject, reason } = req;

  let data;

  if (transaction) {
    data = JSON.stringify({ sender: user, receiver: contact });
  } else {
    data = JSON.stringify({
      data: {
        user,
        contact,
        messaging: `${user.phone} added you in their contacts list`,
      },
    });
  }

  await prisma.notification.create({
    data: { title: subject, subTitle: reason, data, userId: contact.id },
  });

  req.subject = undefined;
  req.reason = undefined;

  next();
});

exports.getNotifiications = asyncHandler(async (req, res, next) => {

  const { user } = req;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  notifications.forEach((e) => e.data = JSON.parse(e.data));

  res.status(200).json({
    status: true,
    data: notifications,
  });

  next();
});

exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  let notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) return next(new Exception('No Notification Found', 404));

  notification = await prisma.notification.delete({ where: { id } });


  if (!notification) return next(new Exception('Could not delete Notification', 401));


  res.status(204).json({ status: true });

  next();
});

exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  for (const id of ids) {
    await prisma.notification.updateMany({ where: { id }, data: { read: true , readAt: new Date()} });
  }

  res.status(200).json({ status: true, message: 'Messages marked successfully' });

  next();
});
