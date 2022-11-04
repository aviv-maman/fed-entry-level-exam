import { FC } from 'react';
import type { Ticket } from './api';

type TicketLabelsProps = {
  labels?: Ticket['labels'];
};

const TicketLabels: FC<TicketLabelsProps> = (props) => {
  return (
    <div className='labels-container'>
      {props?.labels?.map((label) => (
        <span className='single-label'>{label}</span>
      ))}
    </div>
  );
};

export default TicketLabels;
