import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ServerResponse, Ticket } from '../../api';

const API_KEY = 'a';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3232/api',
    prepareHeaders(headers, api) {
      headers.set('x-api-key', API_KEY);

      return headers;
    },
  }),
  //   endpoints(builder) {
  //     return {
  //       fetchTickets: builder.query<ServerResponse, number | void>({
  //         query(limit = 10) {
  //           return `/tickets?limit=${limit}`;
  //         },
  //       }),
  //     };
  //   },
  endpoints: (builder) => ({
    fetchTickets: builder.query({
      query: ({ limit = 10, page = 1, global, userEmail, after, before }) => {
        return {
          url: `/tickets?limit=${limit}&page=${page}`,
          method: 'GET',
          params: { global, userEmail, after, before },
        };
      },
    }),
  }),
});

export const { useFetchTicketsQuery } = apiSlice;
