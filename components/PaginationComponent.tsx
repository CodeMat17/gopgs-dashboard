import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

export default function PaginationComponent({
  totalPages,
  currentPage,
  handlePageChange,
}: PaginationProps) {
  return (
    <div className='mt-12 bg-gray-100 dark:bg-gray-800 py-3 border'>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}>
              <ChevronsLeftIcon />
            </Button>
          </PaginationItem>

          <PaginationItem className='px-4'>
            Page {currentPage} of {totalPages}
          </PaginationItem>

          <PaginationItem>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}>
              <ChevronsRightIcon />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
