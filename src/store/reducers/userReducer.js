import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {UserAPI} from '../../api/userAPI';

const initialState = {
  auth: false,
  user: {},
  error: null,
  loading: true,
};

export const userLogout = createAsyncThunk(
  'user/userLogout',
  async (args, thunkAPI) => {
    await AsyncStorage.removeItem('token');
    thunkAPI.dispatch(logout());
  },
);

export const userLogin = createAsyncThunk(
  'user/userLogin',
  async ({login, password_hash}, thunkAPI) => {
    const response = await UserAPI.login(login, password_hash);
    await AsyncStorage.setItem('token', response?.data?.token);
    return response;
  },
);

export const userRegister = createAsyncThunk(
  'user/userRegister',
  async ({login, password_hash, type, name}, thunkAPI) => {
    const response = await UserAPI.register(login, password_hash, type, name);
    await AsyncStorage.setItem('token', response.token);
    return response;
  },
);

export const userGetInfo = createAsyncThunk(
  'user/userGetInfo',
  async (args, thunkAPI) => {
    const response = await UserAPI.currentUser();
    return response;
  },
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: state => {
      state.auth = false;
      state.user = {};
    },
  },
  extraReducers: builder => {
    builder.addCase(userLogin.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.auth = true;
      }
    });
    builder.addCase(userRegister.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.auth = true;
        state.user = action.payload.user;
      }
    });
    builder.addCase(userLogin.rejected, (state, action) => {});
    builder.addCase(userRegister.rejected, (state, action) => {});
    builder.addCase(userGetInfo.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.user = action.payload.data;
        state.auth = true;
      }
      state.loading = false;
    });
    builder.addCase(userGetInfo.rejected, (state, action) => {
      state.loading = false;
    });
  },
});

// Action creators are generated for each case reducer function
export const {logout} = userSlice.actions;

export default userSlice.reducer;
