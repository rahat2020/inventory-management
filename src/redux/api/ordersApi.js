import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["orders"],

  endpoints: (builder) => ({
    getOrdersList: builder.query({
      query: ({ status = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);
        return `/orders/all?${params.toString()}`;
      },
      providesTags: ["orders"],
    }),

    getOrderStats: builder.query({
      query: () => "/orders/stats/summary",
      providesTags: ["orders"],
    }),

    getSalesTrend: builder.query({
      query: (period = "weekly") => `/orders/stats/trend?period=${period}`,
      providesTags: ["orders"],
    }),
  }),
});

export const {
  useGetOrdersListQuery,
  useGetOrderStatsQuery,
  useGetSalesTrendQuery,
} = ordersApi;
