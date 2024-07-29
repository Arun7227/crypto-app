import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPagination = () => {
    let pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    return pages;
  };

  return (
    <div className="flex justify-center my-4 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 mx-1 bg-blue-200 rounded disabled:opacity-50"
      >
        &lArr;
      </button>
      {getPagination().map((page, index) => (
        <button
          key={index}
          title='Previous'
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`px-2 py-1 mx-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-300'} ${page === '...' ? 'cursor-default' : ''}`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title='Next'
        className="px-2 py-1 mx-1 bg-blue-200 rounded disabled:opacity-50"
      >
        &rArr;
      </button>
    </div>
  );
};

export default Pagination;
