import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

function getPages(paginaActual, totalPaginas) {
  console.log(`Generando páginas para paginador: paginaActual=${paginaActual}, totalPaginas=${totalPaginas}`);
  
  // Asegurar que totalPaginas sea al menos 1
  const total = Math.max(1, totalPaginas);
  
  // Asegurar que paginaActual esté dentro del rango válido
  const actual = Math.max(1, Math.min(paginaActual, total));
  
  const pages = [];
  // Si hay pocas páginas, mostrar todas
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    // Lógica para mostrar páginas con elipsis
    if (actual <= 4) {
      // Cerca del inicio
      pages.push(1, 2, 3, 4, 5, '...', total);
    } else if (actual >= total - 3) {
      // Cerca del final
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
      // En medio
      pages.push(1, '...', actual - 1, actual, actual + 1, '...', total);
    }
  }
  
  console.log('Páginas generadas para el paginador:', pages);
  return pages;
}

const Paginador = ({ paginaActual, totalPaginas, onPageChange }) => {
  const pages = getPages(paginaActual, totalPaginas);
  const isFirstPage = paginaActual === 1;
  const isLastPage = paginaActual === totalPaginas;

  // Siempre mostrar el paginador, incluso si solo hay una página
  if (totalPaginas < 1) return null;

  return (
    <div className="flex items-center gap-1 select-none">
      {/* First Page Button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={isFirstPage}
        className={`p-1.5 border rounded-md ${isFirstPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
        aria-label="Ir a la primera página"
      >
        <FaAngleDoubleLeft size={14} />
      </button>
      
      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(paginaActual - 1)}
        disabled={isFirstPage}
        className={`p-1.5 border rounded-md ${isFirstPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
        aria-label="Página anterior"
      >
        <FaChevronLeft size={14} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-0.5">
        {pages.map((p, idx) =>
          p === '...'
            ? <span key={`ellipsis-${idx}`} className="px-2 py-1 border border-gray-200 bg-white text-gray-500">...</span>
            : <button
                key={`page-${p}-${idx}`}
                className={`w-8 h-8 border ${p === paginaActual 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-200'} font-semibold rounded`}
                onClick={() => onPageChange(p)}
                disabled={p === paginaActual}
                aria-current={p === paginaActual ? 'page' : undefined}
              >
                {p}
              </button>
        )}
      </div>

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(paginaActual + 1)}
        disabled={isLastPage}
        className={`p-1.5 border rounded-md ${isLastPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
        aria-label="Siguiente página"
      >
        <FaChevronRight size={14} />
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => onPageChange(totalPaginas)}
        disabled={isLastPage}
        className={`p-1.5 border rounded-md ${isLastPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
        aria-label="Ir a la última página"
      >
        <FaAngleDoubleRight size={14} />
      </button>
    </div>
  );
};

export default Paginador;