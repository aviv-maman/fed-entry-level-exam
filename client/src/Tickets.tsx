import { Ticket } from './api';
import TicketLabels from './TicketLabels';

type TicketsProps = {
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
        <li key={ticket.id} className='ticket'>
          <div className='styledHeader'>
            <span className='hiddenStyledButton' onClick={() => hideTicket(ticket.id)}>
              Hide
            </span>
          </div>

          <h1>{ticket.title}</h1>
          <h5 className='title'>{ticket.content}</h5>
          <footer>
            <div className='meta-data'>
              by {ticket.userEmail} | {new Date(ticket.creationTime).toLocaleString()}
            </div>
            <div className='meta-data2'>
              <TicketLabels labels={ticket.labels} />
            </div>
          </footer>
        </li>
      ))}
    </ul>
  );
};
