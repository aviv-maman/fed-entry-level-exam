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
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    async function fetchTickets() {
      setTickets(await api.getTickets());
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

  return (
    <main>
      <h1>Tickets List</h1>
      <header>
        <input type='search' placeholder='Search...' onChange={(e) => onSearch(e.target.value)} />
      </header>
      {tickets ? <div className='results'>Showing {tickets.length} results</div> : null}
      {tickets ? <Tickets tickets={tickets} search={search} /> : <h2>Loading..</h2>}
    </main>
  );
};

export default App;
