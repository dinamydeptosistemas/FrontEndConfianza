import React from 'react';

function getPages(paginaActual, totalPaginas) {
  const pages = [];
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) pages.push(i);
  } else {
    if (paginaActual <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPaginas);
    } else if (paginaActual >= totalPaginas - 3) {
      pages.push(1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas);
    } else {
      pages.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
    }
  }
  return pages;
}

const Paginador = ({ paginaActual, totalPaginas, onPageChange }) => {
  const pages = getPages(paginaActual, totalPaginas);
  return (
    <div className="flex items-center gap-0.5 select-none">
      {pages.map((p, idx) =>
        p === '...'
          ? <span key={idx} className="px-2 py-1 border border-gray-200 bg-white text-gray-500">...</span>
          : <button
              key={p}
              className={`w-8 h-8 border border-gray-200 ${p === paginaActual ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'} font-semibold rounded-none`}
              onClick={() => onPageChange(p)}
              disabled={p === paginaActual}
            >
              {p}
            </button>
      )}
    </div>
  );
};

export default Paginador; 