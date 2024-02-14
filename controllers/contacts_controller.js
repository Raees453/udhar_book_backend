const { PrismaClient } = require('@prisma/client');

const Exception = require('../utils/exception');

const asyncHandler = require('../utils/async_handler');

const prisma = new PrismaClient();

exports.getAllContacts = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const contacts = await prisma.contact.findMany({
    where: {
      OR: [{ ownerId: user.id }],
    },
  });

  return res.status(200).json({
    success: true,
    contacts,
  });
});

exports.addContact = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { name, bio, email, phone, profile } = req.body;

  if (!name) {
    return next(new Exception('Please provide name', 403));
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        email !== null ? { email } : null,
        phone !== null ? { phone } : null,
      ].filter(Boolean),
    },
  });

  const isLocalContact = existingUser == null;

  let data = {
    name,
    bio,
    email,
    phone,
    profile,
    ownerId: user.id,
  };

  let contact;

  if (isLocalContact) {
    contact = await createContact(data);
  } else {
    data.id = existingUser.id;

    contact = await createContact(data);

    data = {
      name: user.name,
      bio: user.bio,
      email: user.email,
      phone: user.phone,
      profile: user.profile,
      ownerId: contact.id,
    };

    const tenantContact = await createContact(data);
  }

  return res.status(200).json({
    success: true,
    data: contact,
  });
});

exports.editContact = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { id, name, bio, email, phone, profile } = req.body;

  if (!id) {
    return next(new Exception('Please provide contact id', 403));
  }

  const contact = await prisma.contact.update({
    where: {
      id,
    },
    data: {
      name,
      bio,
      email,
      phone,
      profile,
    },
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
    where: {
      id,
    },
  });

  if (!contact) return next(new Exception('No Contact Found', 404));

  return res.status(204).json({
    success: true,
  });
});

const createContact = async (data) => {
  return prisma.contact.create({ data });
};
