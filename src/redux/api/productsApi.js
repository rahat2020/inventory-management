import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";
import { addFiltersData } from "../app/appSlice";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["products"],

  endpoints: (builder) => ({
    // get products lists
    getProductsList: builder.query({
      query: ({ name = "", status = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();

        if (name) params.append("name", name); // matches your API
        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);

        return `/all-products?${params.toString()}`;
      },
      providesTags: ["products"],
    }),

    // get single products
    getSingleProduct: builder.query({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
    }),

    // create invoice
    // createInvoice: builder.mutation({
    //   query: (data) => ({
    //     url: "/pi-issue/store",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["products"],
    // }),
  }),
});

export const { useLazyGetProductsListQuery, useGetSingleProductQuery } =
  productsApi;
