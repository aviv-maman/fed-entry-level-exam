import type { Ticket } from '../api';
import SingleTicket from './SingleTicket';

export type TicketsProps = {
  tickets: Ticket[];
  hideTicket: (ticketId: string) => void;
  lastTicketElementRef?: any;
};

export const Tickets = ({ tickets, hideTicket, lastTicketElementRef }: TicketsProps) => {
  return (
    <ul className='tickets'>
      {tickets.map((ticket, index) => {
        if (tickets.length === index + 1) {
          return <SingleTicket lastTicketElementRef={lastTicketElementRef} key={ticket.id} ticket={ticket} hideTicket={hideTicket} />;
        } else {
          return <SingleTicket key={ticket.id} ticket={ticket} hideTicket={hideTicket} />;
        }
      })}
    </ul>
  );
};
