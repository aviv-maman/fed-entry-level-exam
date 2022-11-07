import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import './App.scss';
import { Tickets } from './components/Tickets';
import { createApiClient, Ticket } from './api';

export type AppState = {
  tickets?: Ticket[];
  search: string;
};

const api = createApiClient();

const App = () => {
  const [search, setSearch] = useState<string>('');
  const [fetchedTickets, setFetchedTickets] = useState<Ticket[]>([]);
  const [visibleTickets, setVisibleTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const hiddenTicketsAmount = fetchedTickets.length - visibleTickets.length;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const observer: MutableRefObject<any> = useRef();

  const lastTicketElementRef = useCallback(
    (node: any) => {
      if (isLoading) {
        return;
      }
      if (observer?.current) {
        observer?.current?.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchTickets({ page: currentPage + 1 }); //Load next page if last element is visible
        }
      });
      if (node) {
        observer?.current?.observe(node);
      }
    },
    [isLoading, hasMore, currentPage]
  );

  async function fetchTickets(formData?: { global?: string; page?: number }) {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await api.getTickets(formData);
      const areMorePages = data?.page < data?.totalPages;
      setHasMore(areMorePages);
      if (data?.page !== 1) {
        setFetchedTickets((prevState) => [...prevState, ...data.tickets]);
        setVisibleTickets((prevState) => [...prevState, ...data.tickets]);
      } else {
        setFetchedTickets(data.tickets);
        setVisibleTickets(data.tickets);
      }
      setCurrentPage(data?.page);
    } catch (error) {
      setHasError(true);
      console.log(error);
      return error;
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  let searchDebounce: any;
  const onSearch = (val: string, newPage?: number) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      setSearch(val);
      fetchTickets({ global: val, page: 1 });
    }, 300);
  };

  const hideTicket = (ticketId: string) => {
    const filteredTickets = visibleTickets.filter((ticket) => ticket.id !== ticketId);
    setVisibleTickets(filteredTickets);
  };

  const resetVisibleTickets = () => {
    setVisibleTickets(fetchedTickets);
  };

  // const loadNextPage = () => {
  //   fetchTickets({ page: currentPage + 1 });
  // };

  return (
    <main>
      <h1>Tickets List</h1>
      <header>
        <input type='search' placeholder='Search...' onChange={(e) => onSearch(e.target.value)} />
      </header>
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
          <Tickets lastTicketElementRef={lastTicketElementRef} tickets={visibleTickets} search={search} hideTicket={hideTicket} />
        </>
      )}
      {isLoading && <h2>Loading...</h2>}
      {hasError && <h2>Error</h2>}
    </main>
  );
};

export default App;
