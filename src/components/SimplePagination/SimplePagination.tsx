import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationLink,
} from "@/components/ui/pagination"; // ajusta la ruta si es necesario

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handlePageClick = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Para hacer paginación con números, limitamos a máximo 5 páginas visibles
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      end = Math.min(5, totalPages);
    }
    if (currentPage > totalPages - 3) {
      start = Math.max(totalPages - 4, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <Pagination className="bg-blue-100 rounded-lg p-2 shadow-sm">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePageClick(currentPage - 1)}
            aria-disabled={currentPage === 1}
            className="text-primary hover:bg-blue-200"
          />
        </PaginationItem>

        {pages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={handlePageClick(1)}
                isActive={currentPage === 1}
                className="text-primary hover:bg-blue-200"
              >
                1
              </PaginationLink>
            </PaginationItem>
            {pages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis className="text-primary" />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={handlePageClick(page)}
              isActive={page === currentPage}
              className="text-primary hover:bg-blue-200"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis className="text-primary" />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={handlePageClick(totalPages)}
                isActive={currentPage === totalPages}
                className="text-primary hover:bg-blue-200"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handlePageClick(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            className="text-primary hover:bg-blue-200"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { SimplePagination };
