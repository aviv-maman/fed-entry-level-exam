import { useEffect, useState } from 'react';
import './App.scss';
import { Tickets } from './Tickets';
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
  const [hiddenTicketsAmount, setHiddenTicketsAmount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  async function fetchTickets(formData?: { global?: string; page?: number }) {
    const data = await api.getTickets(formData);
    if (formData?.page && formData?.page !== 1) {
      setFetchedTickets((prevState) => [...prevState, ...data.tickets]);
      setVisibleTickets((prevState) => [...prevState, ...data.tickets]);
    } else {
      setFetchedTickets(data.tickets);
      setVisibleTickets(data.tickets);
    }
    const totalFetchedPages = Math.ceil(data.totalLength / data.length);
    setTotalPages(totalFetchedPages);
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  let searchDebounce: any;
  const onSearch = (val: string, newPage?: number) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      setSearch(val);
      fetchTickets({ global: val });
    }, 300);
  };

  const hideTicket = (ticketId: string) => {
    const filteredTickets = visibleTickets.filter((ticket) => ticket.id !== ticketId);
    setVisibleTickets(filteredTickets);
    setHiddenTicketsAmount(fetchedTickets.length - filteredTickets.length);
  };

  const resetVisibleTickets = () => {
    setVisibleTickets(fetchedTickets);
    setHiddenTicketsAmount(0);
  };

  const loadNextPage = (nextPageNumber: number) => {
    fetchTickets({ page: nextPageNumber });
    setCurrentPage((prevState) => prevState + 1);
  };

  return (
    <main>
      <h1>Tickets List</h1>
      <header>
        <input type='search' placeholder='Search...' onChange={(e) => onSearch(e.target.value)} />
      </header>
      {visibleTickets ? (
        <div className='results'>
          Showing {visibleTickets.length} results {hiddenTicketsAmount === 1 ? `(${hiddenTicketsAmount} hidden ticket ` : hiddenTicketsAmount > 1 && `(${hiddenTicketsAmount} hidden tickets `}
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
      ) : null}
      {visibleTickets ? <Tickets tickets={visibleTickets} search={search} hideTicket={hideTicket} /> : <h2>Loading..</h2>}
      <button className='primary-button' onClick={() => loadNextPage(currentPage + 1)} disabled={currentPage >= totalPages}>
        Load More
      </button>
    </main>
  );
};

export default App;
