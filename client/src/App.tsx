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

  useEffect(() => {
    async function fetchTickets() {
      const tickets = await api.getTickets();
      setFetchedTickets(tickets);
      setVisibleTickets(tickets);
    }
    fetchTickets();
  }, []);

  let searchDebounce: any;
  const onSearch = (val: string, newPage?: number) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      setSearch(val);
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

  return (
    <main>
      <h1>Tickets List</h1>
      <header>
        <input type='search' placeholder='Search...' onChange={(e) => onSearch(e.target.value)} />
      </header>
      {visibleTickets ? (
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
      ) : null}
      {visibleTickets ? (
        <Tickets tickets={visibleTickets} search={search} hideTicket={hideTicket} />
      ) : (
        <h2>Loading..</h2>
      )}
    </main>
  );
};

export default App;
