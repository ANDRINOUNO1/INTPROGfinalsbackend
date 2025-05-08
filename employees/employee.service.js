const db = require('../_helpers/db')
const { Op } = require('sequelize')

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: _delete,
  checkUserHasEmployee
}

async function getById(id) {
  const employee = await getEmployee(id)
  return basicDetails(employee)
}

async function getEmployee(id){
  const employee = await db.Employee.findByPk(id)
  if(!employee) throw 'Employee not found'

  return employee
}

async function checkUserHasEmployee(userId) {
  const employee = await db.Employee.findOne({ where: { userId } })
  return !!employee
}

async function create(params){
  // Check if employeeId already exists
  const existingEmployeeId = await db.Employee.findOne({
    where: { employeeId: params.employeeId }
  })
  if (existingEmployeeId) {
    throw new Error('Employee ID is already in use')
  }

  // Check if user already has an employee record
  if (params.userId) {
    const existingUserEmployee = await db.Employee.findOne({
      where: { userId: params.userId }
    })
    if (existingUserEmployee) {
      throw new Error('User already has an employee record')
    }
  }

  const employee = new db.Employee(params)
  await employee.save()
  // console.log('testing create employee')
  // console.log(JSON.stringify(employee, null, 2))
  return basicDetails(employee)
}

async function update(id, params) {
  const employee = await getEmployee(id)
  
  // Check if employeeId is being changed and if it's already in use
  if (params.employeeId && params.employeeId !== employee.employeeId) {
    const existingEmployeeId = await db.Employee.findOne({
      where: { 
        employeeId: params.employeeId,
        id: { [Op.ne]: id }
      }
    })
    if (existingEmployeeId) {
      throw new Error('Employee ID is already in use')
    }
  }
  
  // Check if userId is being changed and if it's already associated with another employee
  if (params.userId && params.userId !== employee.userId) {
    const existingUserEmployee = await db.Employee.findOne({
      where: { 
        userId: params.userId,
        id: { [Op.ne]: id }
      }
    })
    if (existingUserEmployee) {
      throw new Error('User already has an employee record')
    }
  }
  
  // copy params to employee and save
  Object.assign(employee, params)
  await employee.save()
  
  return basicDetails(employee)
}

async function _delete(id) {
  const employee = await getEmployee(id)
  await employee.destroy()
}

function basicDetails(employee){
  const { id, employeeId, position, isActive, hireDate, userId, departmentId, account, department } = employee
  // console.log(JSON.stringify(employee, null, 2))
  return { id, employeeId, position, isActive, hireDate, userId, departmentId, account, department }
}

async function getAll(){
  const employees = await db.Employee.findAll({
    include: [
      { model: db.Account, attributes: ['email']},
      { model: db.Department, attributes: ['name']},
    ]
  })

  return employees.map(x => basicDetails(x))
}