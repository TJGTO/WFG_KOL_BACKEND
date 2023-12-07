const yup = require('yup');
const loginvalidationschema = yup.object({
    body: yup.object({
        email: yup.string().required("Please enter email"),
        password: yup.string().required("Please enter password")
    })
});

module.exports = loginvalidationschema;