const mongoose = require("mongoose");

const Todo = mongoose.model("Todo", {
  text: {
    type: String,
    required: true,
    minlength: 4,
    trim: true
  },
  complited: {
    type: Boolean,
    default: false
  },
  complitedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {
  Todo
};
