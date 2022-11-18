import type { Ticket } from '../api';
import SingleTicket from './SingleTicket';

export type TicketsProps = {
  tickets: Ticket[];
  hideTicket: (ticketId: string) => void;
  elementRef?: any;
};

export const Tickets = ({ tickets, hideTicket, elementRef }: TicketsProps) => {
  return (
    <ul className='tickets'>
      {tickets.map((ticket, index) => {
        if (tickets.length - 2 === index + 1) {
          return <SingleTicket elementRef={elementRef} key={ticket.id} ticket={ticket} hideTicket={hideTicket} />;
        } else {
          return <SingleTicket key={ticket.id} ticket={ticket} hideTicket={hideTicket} />;
        }
      })}
    </ul>
  );
};
