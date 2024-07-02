const admin = require('firebase-admin');

const asyncHandler = require('../utils/async_handler');

const Exception = require('../utils/exception');

exports.sendNotification = asyncHandler(async (req, res, next) => {

  const { fcmToken } = req.body;


  try {
    await admin.messaging().send({
      token: fcmToken,
      data: {
        'name': 'Hello World From Token',
      },
    });

  } catch (e) {
    console.log(e);
  }

  res.status(200).json({
    status: true,
  });
});
