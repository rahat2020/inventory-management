import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

// Backs FilterDropdown's "create new option" affordance: lets a dropdown
// persist a freshly typed option against whatever model/field it's bound to.
export const globalApi = createApi({
  reducerPath: "globalApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["globalOptions"],

  endpoints: (builder) => ({
    createNewSelectOption: builder.mutation({
      query: ({ model, fieldName, value }) => ({
        url: `/${model}/create-option`,
        method: "POST",
        body: { fieldName, value },
      }),
      invalidatesTags: ["globalOptions"],
    }),
  }),
});

export const { useCreateNewSelectOptionMutation } = globalApi;
