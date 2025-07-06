import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  modalProps: {},
  filtersData: null,
  globalPropsForSingleTask: {},
  sidebarCurrentPath: {},
  activetabs: {},
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    addModalProps: (state, action) => ({
      ...state,
      modalProps: action.payload,
    }),
    addGlobalPropsForSingleTask: (state, action) => ({
      ...state,
      globalPropsForSingleTask: action.payload,
    }),
    addFiltersData: (state, action) => ({
      ...state,
      filtersData: action.payload,
    }),
    addSidebarPath: (state, action) => ({
      ...state,
      sidebarCurrentPath: action.payload,
    }),
    addActiveTabs: (state, action) => ({
      ...state,
      activetabs: action.payload,
    }),
  },
});

export const {
  addModalProps,
  addGlobalPropsForSingleTask,
  addFiltersData,
  addSidebarPath,
  addActiveTabs,
} = appSlice.actions;
export default appSlice.reducer;
