const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
      return res.status(401).json({
          msg: 'No hay token en la petición'
      });
  }

  try {
      // Eliminar 'Bearer ' del token si está presente
      const tokenWithoutBearer = token.replace('Bearer ', '');
      const { userId } = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET || 'secret_key');
      req.userId = userId;
      next();
  } catch (error) {
      return res.status(401).json({
          msg: 'No tienes permiso para estar aqui :) post: tu token no es válido'
      });
  }
};

module.exports = {
  validarJWT,
};
