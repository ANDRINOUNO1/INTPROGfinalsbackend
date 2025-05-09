const { DataTypes } = require('sequelize')

module.exports = model

function model(sequelize){
  const attributes = {
    employeeId: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },  
    departmentId: { type: DataTypes.INTEGER, allowNull: true },  
    isActive: { type: DataTypes.BOOLEAN },
    hireDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated: { type: DataTypes.DATE } 
  }

  const options = {
    timestamps: false
  }

  return sequelize.define('employee', attributes, options)
}

  