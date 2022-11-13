import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
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
  const PAGE_SIZE: number = 20;
  const [searchParam, setSearchParam] = useState<{ page: number; limit?: number, global?: string; userEmail?: string; after?: string; before?: string }>({
    page: 1,
    limit: PAGE_SIZE,
    global: '',
    userEmail: '',
    after: '',
    before: '',
  });

  const currentResult = useFetchTicketsQuery(searchParam);
  const [fetchedTickets, setFetchedTickets] = useState<Ticket[]>(currentResult?.data?.tickets || []);
  const [visibleTickets, setVisibleTickets] = useState<Ticket[]>([]);
  const hiddenTicketsAmount = fetchedTickets.length - visibleTickets.length;
  // Check param type
  const searchParamsHelper = (val: string, newPage: number) => {
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
      setSearchParam({...searchParam, ...searchParams});
    }, 300);
  };

  const hideTicket = (ticketId: string) => {
    const filteredTickets = visibleTickets.filter((ticket) => ticket.id !== ticketId);
    setVisibleTickets(filteredTickets);
  };

  const resetVisibleTickets = () => {
    setVisibleTickets(fetchedTickets);
  };

  const loadMore = () => {
    setSearchParam({...searchParam, page: searchParam.page + 1});
  };

  useEffect(() => {
    if (currentResult?.data?.tickets) {
      if (currentResult?.data?.page === 1) {
        setFetchedTickets(currentResult.data.tickets);
        setVisibleTickets(currentResult.data.tickets);  
      } else {
        setFetchedTickets((prevState) => [...prevState, ...currentResult.data.tickets]);
        setVisibleTickets((prevState) => [...prevState, ...currentResult.data.tickets]);   
      }
    }
  }, [currentResult?.data?.tickets, currentResult.data?.page]);

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
          setSearchParam({...searchParam, page: searchParam.page + 1}); //Load next page if last element is visible
        }
      });
      if (node) {
        observer?.current?.observe(node);
      }
    },
    [currentResult?.isFetching, currentResult?.data, searchParam]
  );

  return (
    <main>
      <h1>Tickets List</h1>
      <header>
        <input type='search' placeholder='Search...' onChange={(e) => onSearch(e.target.value)} />
      </header>

      <button onClick={loadMore}>Load More</button>

      <div>
        <p>Number of tickets fetched in cache: {fetchedTickets?.length}</p>
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
