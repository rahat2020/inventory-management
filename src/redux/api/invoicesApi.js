import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";
import { addFiltersData } from "../app/appSlice";

export const invoicesApi = createApi({
  reducerPath: "invoicesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["invoices"],

  endpoints: (builder) => ({
    // get invoices lists
    getInvoiceListData: builder.query({
      query: (id) => `/invoices/list/${id}`,
      providesTags: ["invoices"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          console.log("inside_try_catch", id);
          const { data } = await queryFulfilled;
          dispatch(addFiltersData(data));
        } catch (err) {
          console.error("Error during fetch:", err);
        }
      },
    }),
    // create invoice
    createInvoice: builder.mutation({
      query: (data) => ({
        url: "/pi-issue/store",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["invoices"],
    }),
  }),
});

export const { useGetInvoiceListDataQuery, useCreateInvoiceMutation } =
  invoicesApi;
