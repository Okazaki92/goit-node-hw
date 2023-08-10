const mongoose = require("mongoose");
const { Schema } = mongoose;

const contact = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Contact = mongoose.model("contact", contact, "contacts");

const listContacts = async () => {
  try {
    return Contact.find();
  } catch (error) {
    console.log("Error reading file:", error);
    return [];
  }
};

const getContactById = async (contactId) => {
  try {
    return Contact.findById(contactId);
  } catch (error) {
    console.log(`Could not find a contact with id ${contactId}`);
  }
};

const removeContact = async (contactId) => {
  try {
    return Contact.findByIdAndDelete(contactId);
  } catch (error) {
    console.log(`Could not delete the contact with ID:${contactId}`, error);
  }
};

const addContact = async (body) => {
  try {
    Contact.create(body);
  } catch (error) {
    console.log("Error adding contact:", error);
  }
};

const updateContact = async (contactId, body) => {
  try {
    return Contact.findByIdAndUpdate(contactId, body, { new: true });
  } catch (error) {
    console.log(`Error updating the contact with ID:${contactId}`, error);
  }
};

const updateFavorite = async (contactId, favorite) => {
  try {
    return Contact.findByIdAndUpdate(contactId, { favorite }, { new: true });
  } catch (error) {
    console.log("missing field favorite");
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavorite,
};
