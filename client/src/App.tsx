import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.scss';
import { Tickets } from './components/Tickets';
import type { Ticket } from './api';

//Redux
import { useFetchTicketsQuery } from './features/tickets/ticketsApiSlice';

export type AppState = {
  tickets?: Ticket[];
  search: string;
};

const App = () => {
  ///Redux Example
  // const { data, isFetching, isLoading, isError } = useFetchTicketsQuery({ limit: PAGE_SIZE, page: currentPage });
  ///Redux
  const [searchParam, setSearchParam] = useState<{ page?: number; global?: string; userEmail?: string; after?: string; before?: string }>({
    page: 1,
    global: '',
    userEmail: '',
    after: '',
    before: '',
  });

  ////////////////////////////////
  // https://github.com/reduxjs/redux-toolkit/discussions/1163
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState<number>(1); // Something calculated from scroll position

  const lastResult = useFetchTicketsQuery({ limit: PAGE_SIZE, page: currentPage - 1 }, { skip: currentPage === 1 }); // Don't fetch pages before 0
  const currentResult = useFetchTicketsQuery({ limit: PAGE_SIZE, page: currentPage, global: searchParam.global });
  // const nextResult = useFetchTicketsQuery({ limit: PAGE_SIZE, page: currentPage + 1 });

  const pageSize: number = currentResult?.data?.length || PAGE_SIZE;
  const combinedTickets = useMemo(() => {
    const arr = new Array(pageSize * (currentPage + 1));
    // for (const data of [lastResult.data, currentResult.data, nextResult.data]) {
    for (const data of [lastResult.data, currentResult.data]) {
      if (data) {
        arr.splice(data.offset, data.tickets.length, ...data.tickets);
      }
    }
    return arr;
  }, [pageSize, currentPage, lastResult.data, currentResult.data]);
  // work with combined tickets from here
  ////////////////////////////////

  const [visibleTickets, setVisibleTickets] = useState<Ticket[]>([]);
  const hiddenTicketsAmount = combinedTickets.length - visibleTickets.length;
  // Check param type
  const searchParamsHelper = (val: string, newPage?: number) => {
    const searchParamsObj = { page: newPage, global: '', userEmail: '', after: '', before: '' };
    const inputValueToSearch = val.trim().toLowerCase();
    if (inputValueToSearch.startsWith('from:')) {
      searchParamsObj.userEmail = val.split(':')[1];
    } else if (inputValueToSearch.startsWith('after:')) {
      searchParamsObj.after = val.split(':')[1];
      searchParamsObj.global = val.split(' ')[1];
    } else if (inputValueToSearch.startsWith('before:')) {
      searchParamsObj.before = val.split(':')[1];
      searchParamsObj.global = val.split(' ')[1];
    } else {
      searchParamsObj.global = val;
    }
    return searchParamsObj;
  };

  let searchDebounce: any;
  const onSearch = (val: string, newPage: number = 1) => {
    const searchParams = searchParamsHelper(val, newPage);
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      setSearchParam(searchParams);
    }, 300);
  };

  const hideTicket = (ticketId: string) => {
    const filteredTickets = visibleTickets.filter((ticket) => ticket.id !== ticketId);
    setVisibleTickets(filteredTickets);
  };

  const resetVisibleTickets = () => {
    setVisibleTickets(combinedTickets);
  };

  const loadMore = () => {
    setCurrentPage((prevState) => prevState + 1);
  };

  //
  useEffect(() => {
    setVisibleTickets(combinedTickets);
  }, [combinedTickets]);

  //

  const observer: MutableRefObject<any> = useRef();
  // For infinite scrolling
  const lastTicketElementRef = useCallback(
    (node: any) => {
      if (currentResult?.isFetching) {
        return;
      }
      if (observer?.current) {
        observer?.current?.disconnect();
      }
      const hasNextPage = currentResult?.data?.totalPages > currentResult?.data?.page;
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          setCurrentPage((prevState) => prevState + 1); //Load next page if last element is visible
        }
      });
      if (node) {
        observer?.current?.observe(node);
      }
    },
    [currentResult?.isFetching, currentResult?.data]
  );

  return (
    <main>
      <h1>Tickets List</h1>
      <header>
        <input type='search' placeholder='Search...' onChange={(e) => onSearch(e.target.value)} />
      </header>

      <button onClick={loadMore}>Load More</button>

      <div>
        <p>Number of tickets fetched in cache: {combinedTickets?.length}</p>
      </div>

      {visibleTickets && (
        <>
          <div className='results'>
            Showing {visibleTickets.length} results{' '}
            {hiddenTicketsAmount === 1
              ? `(${hiddenTicketsAmount} hidden ticket `
              : hiddenTicketsAmount > 1 && `(${hiddenTicketsAmount} hidden tickets `}
            {hiddenTicketsAmount > 0 && (
              <>
                {' - '}
                <span className='styledLink' onClick={resetVisibleTickets}>
                  Restore
                </span>
                {')'}
              </>
            )}
          </div>
          <Tickets lastTicketElementRef={lastTicketElementRef} tickets={visibleTickets} hideTicket={hideTicket} />
        </>
      )}
      {(currentResult.isLoading || currentResult.isFetching) && <h2>Loading...</h2>}
      {currentResult.isError && <h2>Error</h2>}
    </main>
  );
};

export default App;
