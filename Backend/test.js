const bcrypt = require('bcryptjs');

const password = "1234567";
const hashedPassword = "$2a$10$jYpzTE3ihyMKh7WnxEkIa.Gr/1cHrsb/XkcHFIv8m7d7jVRjMUWX6";

bcrypt.compare(password, hashedPassword, (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Resultado de comparación manual:', result); // Esto debería ser true
    }
});
