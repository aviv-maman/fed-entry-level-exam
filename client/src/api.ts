import axios from 'axios';

export type Ticket = {
  id: string;
  title: string;
  content: string;
  creationTime: number;
  userEmail: string;
  labels?: string[];
};

export type ServerResponse = {
  message?: string;
  tickets: Ticket[];
  length: number;
  totalLength: number;
  page: number;
  totalPages: number;
};

export type FormData = {
  global?: string;
  page?: number;
  after?: string;
  before?: string;
  userEmail?: string;
};

export type ApiClient = {
  getTickets: (formData?: FormData) => Promise<ServerResponse>;
};

export const createApiClient = (): ApiClient => {
  return {
    getTickets: async (formData) => {
      let searchCanceler: () => void;
      try {
        const res = await axios.get(`http://localhost:3232/api/tickets`, {
          params: formData,
          cancelToken: new axios.CancelToken((canceler) => (searchCanceler = canceler)),
        });
        return res.data;
      } catch (error) {
        if (axios.isCancel(error)) {
          return error;
        }
      }
      return () => searchCanceler();
    },
  };
};
