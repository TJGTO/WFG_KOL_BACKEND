const yup = require('yup');

const createGameSchema = yup.object({
    body: yup.object({
        venue: yup.string().required(),
        date: yup.string().required(),
        start_time: yup.string().required(),
        end_time: yup.string().required(),
        price: yup.string().required(),
    }),
});

module.exports = {createGameSchema};