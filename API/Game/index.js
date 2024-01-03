const express = require('express');
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const {createGameSchema} = require('./validationschema')

router.post(
    '/create',
    requestValidator(createGameSchema),
    require('./creategame')
);

router.post(
    '/addUpdate',
    require('./addUpdatePlayer')
)

module.exports = router;