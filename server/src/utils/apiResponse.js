class ApiResponse {
  static success(res, data = {}, message = 'Operation successful', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res, message = 'An error occurred', statusCode = 500, errorDetails = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorDetails,
      timestamp: new Date().toISOString(),
    });
  }

  static paginated(res, items = [], total = 0, page = 1, limit = 10, message = 'Items retrieved') {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({
      success: true,
      message,
      data: items,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ApiResponse;
