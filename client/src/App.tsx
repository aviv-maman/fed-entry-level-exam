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
  const [searchParam, setSearchParam] = useState<{
    page: number;
    limit?: number;
    global?: string;
    userEmail?: string;
    after?: string;
    before?: string;
  }>({
    page: 1,
    limit: PAGE_SIZE,
    global: '',
    userEmail: '',
    after: '',
    before: '',
  });

  ////////////////////////////////
  const { data, isError, isFetching, isLoading } = useFetchTicketsQuery({ ...searchParam, page: searchParam.page });
  const [fetchedTickets, setFetchedTickets] = useState<Ticket[]>(data?.tickets || []);
  const [visibleTickets, setVisibleTickets] = useState<Ticket[]>([]);
  const hiddenTicketsAmount = fetchedTickets.length - visibleTickets.length;
  ////////////////////////////////

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

  const observer: MutableRefObject<any> = useRef();
  // For infinite scrolling
  const elementRef = useCallback(
    (node: any) => {
      if (isFetching) {
        return;
      }
      if (observer?.current) {
        observer?.current?.disconnect();
      }
      const hasNextPage = data?.totalPages > data?.page;
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          setSearchParam({ ...searchParam, page: searchParam.page + 1 }); //Load next page if last element is visible
        }
      });
      if (node) {
        observer?.current?.observe(node);
      }
    },
    [isFetching, data, searchParam]
  );

  let searchDebounce: any;
  const onSearch = (val: string, newPage: number = 1) => {
    const searchParams = searchParamsHelper(val, newPage);
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      setSearchParam({ ...searchParam, ...searchParams });
    }, 600);
  };

  const hideTicket = (ticketId: string) => {
    const filteredTickets = visibleTickets.filter((ticket) => ticket.id !== ticketId);
    setVisibleTickets(filteredTickets);
  };

  const resetVisibleTickets = () => {
    setVisibleTickets(fetchedTickets);
  };

  const loadMore = () => {
    setSearchParam({ ...searchParam, page: searchParam.page + 1 });
  };

  useEffect(() => {
    if (data?.tickets) {
      if (data?.page === 1) {
        setFetchedTickets(data.tickets);
        setVisibleTickets(data.tickets);
      } else {
        setFetchedTickets((prevState) => [...prevState, ...data.tickets]);
        setVisibleTickets((prevState) => [...prevState, ...data.tickets]);
      }
    }
  }, [data?.tickets, data?.page]);

  return (
    <main>
      <h1>Tickets List</h1>
      <header>
        <input type='search' placeholder='Search...' onChange={(e) => onSearch(e.target.value)} />
      </header>

      <button onClick={loadMore}>Load More</button>

      {visibleTickets && (
        <>
          <div className='results'>
            Showing {visibleTickets?.length} results of {data?.totalLength}{' '}
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
          <Tickets elementRef={elementRef} tickets={visibleTickets} hideTicket={hideTicket} />
        </>
      )}
      {(isLoading || isFetching) && <h2>Loading...</h2>}
      {isError && <h2>Error</h2>}
    </main>
  );
};

export default App;
