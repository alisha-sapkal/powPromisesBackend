const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Fundraiser = sequelize.define("Fundraiser", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Title is required",
      },
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [["medical", "education", "emergency", "other"]],
        msg: "Invalid category",
      },
    },
  },
  targetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "Target amount must be greater than 0",
      },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Description is required",
      },
    },
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("active", "completed", "cancelled"),
    defaultValue: "active",
  },
});

Fundraiser.belongsTo(User, { as: "creator", foreignKey: "creatorId" });


module.exports = Fundraiser;
