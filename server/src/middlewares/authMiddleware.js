const { verifyToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired authentication session', 401);
  }
};

module.exports = authMiddleware;
