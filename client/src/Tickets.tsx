import { Ticket } from './api';

export const Tickets = ({
  tickets,
  search,
  hideTicket,
}: {
  tickets: Ticket[];
  search: string;
  hideTicket: (ticketId: string) => void;
}) => {
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
          </footer>
        </li>
      ))}
    </ul>
  );
};
