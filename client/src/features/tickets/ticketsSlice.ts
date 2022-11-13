//DUCKS pattern
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ticket } from '../../api';

interface TicketsState {
  fetchedTickets: Ticket[];
  value: number;
}

const initialState: TicketsState = {
  fetchedTickets: [],
  value: 0,
};

const counterSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    //Increase
    incremented(state) {
      state.value++;
    },
    //
    amountAdded(state, action: PayloadAction<number>) {
      state.value += action.payload;
    },
  },
});

export const { incremented, amountAdded } = counterSlice.actions;
export default counterSlice.reducer;
