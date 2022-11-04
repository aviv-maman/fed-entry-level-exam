import type { Ticket } from './api';
import SingleTicket from './SingleTicket';

export type TicketsProps = {
  tickets: Ticket[];
  search: string;
  hideTicket: (ticketId: string) => void;
};

export const Tickets = ({ tickets, search, hideTicket }: TicketsProps) => {
  const filteredTickets = tickets.filter((t) =>
    (t.title.toLowerCase() + t.content.toLowerCase()).includes(search.toLowerCase())
  );

  return (
    <ul className='tickets'>
      {filteredTickets.map((ticket) => (
        <SingleTicket key={ticket.id} ticket={ticket} hideTicket={hideTicket} />
      ))}
    </ul>
  );
};
