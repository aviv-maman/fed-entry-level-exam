import axios from 'axios';

export type Ticket = {
  id: string;
  title: string;
  content: string;
  creationTime: number;
  userEmail: string;
  labels?: string[];
  hideTicket: (ticketId: string) => void;
};

export type ServerResponse = {
  tickets: Ticket[];
  totalLength: number;
  length: number;
  message?: string;
};

export type ApiClient = {
  getTickets: (formData?: {}) => Promise<ServerResponse>;
};

export const createApiClient = (): ApiClient => {
  return {
    getTickets: async (formData) => {
      const res = await axios.get(`http://localhost:3232/api/tickets`, {
        params: formData,
      });
      return res.data;
    },
  };
};
