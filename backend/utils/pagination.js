/**
 * Pagination utility for consistent API responses
 */

export const createPaginationQuery = (page = 1, limit = 10, maxLimit = 100) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 10));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
};

export const createPaginationResponse = (data, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
};

export const createCursorPaginationQuery = (cursor, limit = 10, maxLimit = 100) => {
  const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 10));
  
  const query = {};
  if (cursor) {
    // For date-based cursor pagination (newest first)
    query.createdAt = { $lt: new Date(cursor) };
  }

  return {
    query,
    limit: parsedLimit,
  };
};

export const createCursorPaginationResponse = (data, limit) => {
  const hasNextPage = data.length === limit;
  const nextCursor = hasNextPage && data.length > 0 
    ? data[data.length - 1].createdAt.toISOString()
    : null;

  return {
    data,
    pagination: {
      hasNextPage,
      nextCursor,
      limit,
    },
  };
};

export const getCacheKey = (prefix, params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
    
  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

export default {
  createPaginationQuery,
  createPaginationResponse,
  createCursorPaginationQuery,
  createCursorPaginationResponse,
  getCacheKey,
};