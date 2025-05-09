const { DataTypes } = require('sequelize')

module.exports = model

function model(sequelize){
  const attributes = {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false }
  }

  const options = {
    timastamps: true
  }

  return sequelize.define('department', attributes, options)
}