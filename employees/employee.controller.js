const express = require("express");
const router = express.Router();
const validateRequest = require("../_middleware/validate-request");
const authorize = require("../_middleware/authorize");
const Role = require("../_helpers/role");
const Joi = require("joi");
const employeeService = require('../employees/employee.service')

router.get("/", authorize(Role.Admin), getAll)
router.get("/:id", authorize(), getById)
router.post("/", authorize(Role.Admin), createSchema, create)
router.put("/:id", authorize(Role.Admin), updateSchema, update)
router.delete("/:id", authorize(Role.Admin), _delete)

module.exports = router

function getById(req, res, next){
  if(req.user.role !== Role.Admin){
    return res.status(401).json({ msg: 'Unauthorized' })
  }

  employeeService
    .getById(req.params.id)
    .then(employee => (employee ? res.json(employee) : res.sendStatus(404)))
    .catch(next)
}

function getAll(req, res, next){
  employeeService
    .getAll()
    .then(employees => res.json(employees))
    .catch(next)
}

function createSchema(req, res, next){
  const schema = Joi.object({
    employeeId: Joi.string().required(),
    position: Joi.string().required(),
    userId: Joi.number().required(),
    departmentId: Joi.number().required(),
    isActive: Joi.boolean().required()
  })
  validateRequest(req, next, schema)
}

function updateSchema(req, res, next) {
  const schema = Joi.object({
    employeeId: Joi.string(),
    position: Joi.string(),
    userId: Joi.number(),
    departmentId: Joi.number(),
    isActive: Joi.boolean()
  })
  validateRequest(req, next, schema)
}

function create(req, res, next){
  // Check if user already has an employee record
  employeeService
    .checkUserHasEmployee(req.body.userId)
    .then(hasEmployee => {
      if (hasEmployee) {
        return res.status(400).json({ message: 'User already has an employee record' });
      }
      return employeeService.create(req.body)
        .then(employee => res.json(employee))
        .catch(next);
    })
    .catch(next);
}

function update(req, res, next) {
  employeeService
    .update(req.params.id, req.body)
    .then((employee) => res.json(employee))
    .catch(next)
}

function _delete(req, res, next) {
  employeeService
    .delete(req.params.id)
    .then(() => res.json({ message: 'Employee deleted successfully' }))
    .catch(next)
}