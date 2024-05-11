const { PrismaClient } = require('@prisma/client');

const asyncHandler = require('../utils/async_handler');
const Exception = require('../utils/exception');

const prisma = new PrismaClient();

exports.getContacts = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const contacts = await prisma.contact.findMany({
    where: { ownerId: user.id , deleted: false},
  });

  res.status(200).json({
    status: true,
    body: contacts,
  });

  next();
});


exports.addContact = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, profile, phone } = req.body;
  const { user } = req;

  if (!firstName || !lastName || !phone) {
    return next(new Exception('Please provide first name, last name and phone at-least.', 400));
  }

  // TODO Check if the phone number is already existent

  let existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  let contact;

  if (existingUser) {
    contact = await prisma.contact.create({
      data: {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        profile: existingUser.profile,
        ownerId: user.id,
        phone,
      },
    });

    await prisma.contact.create({
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: user.profile,
        ownerId: existingUser.id,
        phone: user.phone,
      },
    });
  } else {
    contact = await prisma.contact.create({
      data: { firstName, lastName, phone, profile, ownerId: user.id },
    });
  }

  res.status(201).json({
    status: true,
    message: 'Contact Created Successfully',
    body: contact,
  });

  next();
});

exports.updateContact = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, profile, id } = req.body;

  if (!id) return next(new Exception('Please provide id', 400));

  let contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) return next(new Exception('No Contact Found', 404));

  contact = await prisma.contact.update({
    where: { id },
    data: { firstName, lastName, profile },
  });

  res.status(201).json({
    status: true,
    message: 'Contact Updated Successfully',
    body: contact,
  });

  next();
});


exports.deleteContact = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, profile, id } = req.body;

  if (!id) return next(new Exception('Please provide id', 400));

  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) return next(new Exception('No Contact Found', 404));

  await prisma.contact.update({
    where: { id },
    data: { deleted: true, detetedAt: new Date() },
  });

  res.status(204).json({
    status: true,
    message: 'Contact Deleted Successfully',
  });

  next();
});

exports.findAccountByPhone = asyncHandler(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(new Exception('Please enter some other phone number', 400));
  }

  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) return next(new Exception('No Account Found', 404));

  res.status(200).json({
    status: true,
    message: 'Account Already Exists with Similar Phone Number',
  });

  next();
});

exports.getContactById = asyncHandler(async (req, res, next) => {
  let { id } = req.params;

  if (!id) id = req.body.contactId;

  if (!id) return next(new Exception('Please provide id', 400));

  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) return next(new Exception('No Contact Found', 404));

  req.contact = contact;

  next();
});
