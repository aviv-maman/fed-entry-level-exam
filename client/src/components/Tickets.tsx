import type { Ticket } from '../api';
import SingleTicket from './SingleTicket';

export type TicketsProps = {
  tickets: Ticket[];
  search: string;
  hideTicket: (ticketId: string) => void;
  lastTicketElementRef?: any;
};

export const Tickets = ({ tickets, search, hideTicket, lastTicketElementRef }: TicketsProps) => {
  const filteredTickets = tickets.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(search.toLowerCase()));

  return (
    <ul className='tickets'>
      {filteredTickets.map((ticket, index) => {
        if (filteredTickets.length === index + 1) {
          return <SingleTicket lastTicketElementRef={lastTicketElementRef} key={ticket.id} ticket={ticket} hideTicket={hideTicket} />;
        } else {
          return <SingleTicket key={ticket.id} ticket={ticket} hideTicket={hideTicket} />;
        }
      })}
    </ul>
  );
};
