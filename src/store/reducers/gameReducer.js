import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

const initialState = {
  isPlaying: false,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
  },
  extraReducers: builder => {},
});

// Action creators are generated for each case reducer function
export const {setIsPlaying} = gameSlice.actions;

export default gameSlice.reducer;
