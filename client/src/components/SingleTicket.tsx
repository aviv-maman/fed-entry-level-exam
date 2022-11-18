import { FC, useState } from 'react';
import TicketLabels from './TicketLabels';

import type { Ticket } from '../api';
import type { TicketsProps } from './Tickets';

type SingleTicketProps = {
  ticket: Ticket;
  hideTicket: TicketsProps['hideTicket'];
  elementRef?: any;
};

const SingleTicket: FC<SingleTicketProps> = ({ ticket, hideTicket, elementRef }) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const toggleShowMore = (): void => setShowMore(!showMore);

  return (
    <li key={ticket.id} className='ticket' ref={elementRef}>
      <div className='styledHeader'>
        <span className='hiddenStyledButton' onClick={() => hideTicket(ticket.id)}>
          Hide
        </span>
      </div>

      <h1>{ticket.title}</h1>
      <h5 className={`${showMore ? 'title' : 'title show-more'}`}>{ticket.content}</h5>
      <span className='styledLink' onClick={toggleShowMore}>
        {`${showMore ? 'Show Less' : 'Show More'}`}
      </span>
      <footer>
        <div className='meta-data'>
          by {ticket.userEmail} | {new Date(ticket.creationTime).toLocaleString()}
        </div>
        <div className='meta-data2'>
          <TicketLabels labels={ticket.labels} />
        </div>
      </footer>
    </li>
  );
};

export default SingleTicket;
