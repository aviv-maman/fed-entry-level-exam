import { useEffect, useMemo, useState } from 'react';
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
  // https://github.com/reduxjs/redux-toolkit/discussions/1163
  const currentPage = 1; // Something calculated from scroll position
  const lastResult = useFetchTicketsQuery({ ...searchParam, page: searchParam.page - 1 }, { skip: searchParam.page === 1 }); // Don't fetch pages before 0
  const currentResult = useFetchTicketsQuery(searchParam);
  const nextResult = useFetchTicketsQuery({ ...searchParam, page: searchParam.page + 1 });

  const combinedTickets = useMemo(() => {
    const arr = new Array(PAGE_SIZE * (currentPage + 1));
    for (const data of [lastResult.data, currentResult.data, nextResult.data]) {
      if (data) {
        arr.splice(data.offset, data.tickets.length, ...data.tickets);
      }
    }
    return arr;
  }, [lastResult.data, currentResult.data, nextResult.data]);
  ////////////////////////////////

  const [visibleTickets, setVisibleTickets] = useState<Ticket[]>([]);
  const hiddenTicketsAmount = combinedTickets.length - visibleTickets.length;
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
      setSearchParam({ ...searchParam, ...searchParams });
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
    setSearchParam({ ...searchParam, page: searchParam.page + 1 });
  };

  useEffect(() => {
    if (currentResult?.data?.tickets) {
      if (currentResult?.data?.page === 1) {
        setVisibleTickets(currentResult.data.tickets);
      } else {
        setVisibleTickets((prevState) => [...prevState, ...currentResult.data.tickets]);
      }
    }
  }, [currentResult?.data?.tickets, currentResult.data?.page]);

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
          <Tickets tickets={visibleTickets} hideTicket={hideTicket} />
        </>
      )}
      {(currentResult.isLoading || currentResult.isFetching) && <h2>Loading...</h2>}
      {currentResult.isError && <h2>Error</h2>}
    </main>
  );
};

export default App;
