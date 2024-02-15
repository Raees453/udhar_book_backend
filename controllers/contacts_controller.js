const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const asyncHandler = require('../utils/async_handler');

const prisma = new PrismaClient();

exports.getAllContacts = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const contacts = await prisma.contact.findMany({
    where: { ownerId: user.id },
  });

  return res.status(200).json({
    success: true,
    contacts,
  });
});

exports.addContact = asyncHandler(async (req, res, next) => {
  const { user, contact } = req;

  const { name, bio, email, phone, profile } = req.body;

  if (!name) {
    return next(new Exception('Please provide name', 403));
  }

  console.log('Check for Local Account', contact);

  let data = {
    name,
    bio,
    email,
    phone,
    profile,
    ownerId: user.id,
  };

  console.log('Data', data);

  let newContact;

  if (!contact) {
    newContact = await createContact(data);
  } else {
    data.id = contact.id;

    newContact = await createContact(data);

    data = {
      id: user.id,
      name: user.name,
      bio: user.bio,
      email: user.email,
      phone: user.phone,
      profile: user.profile,
      ownerId: newContact.id,
    };

    console.log('New Data', data);

    const tenantContact = await createContact(data);
  }

  return res.status(200).json({
    success: true,
    data: newContact,
  });
});

exports.editContact = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { id, name, bio, email, phone, profile } = req.body;

  if (!id) {
    return next(new Exception('Please provide contact id', 403));
  }

  const data = { name, bio, email, phone, profile };

  const contact = await prisma.contact.update({
    where: { id },
    data,
  });

  return res.status(200).json({
    success: true,
    contact,
  });
});

exports.deleteContact = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  if (!id) return next(new Exception('Please provide an id', 403));

  const contact = await prisma.contact.delete({
    where: { id },
  });

  if (!contact) return next(new Exception('No Contact Found', 404));

  return res.status(204).json({
    success: true,
  });
});

exports.checkForLocalContact = asyncHandler(async (req, res, next) => {
  const { id, email, phone } = req.body;

  req.contact = await prisma.user.findFirst({
    where: {
      OR: [
        email !== null ? { email } : null,
        phone !== null ? { phone } : null,
        id !== null ? { id } : null,
      ].filter(Boolean),
    },
  });

  console.log('Local Contact', req.contact);
  next();
});

exports.doesContactExist = asyncHandler(async (req, res, next) => {
  const { email, phone } = req.body;

  const contact = await prisma.contact.findFirst({
    where: { OR: [{ email }, { phone }].filter(Boolean) },
  });

  console.log(contact);

  if (contact) return next(new Exception('Contact already exists', 403));

  next();
});

const createContact = async (data) => {
  return prisma.contact.create({ data });
};
