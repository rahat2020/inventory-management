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
      query: ({
        search = "",
        status = "",
        paymentStatus = "",
        page = 1,
        limit = 10,
      } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        if (paymentStatus) params.append("paymentStatus", paymentStatus);
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

    getOrderById: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: ["orders"],
    }),

    getSalesTrend: builder.query({
      query: (period = "weekly") => `/orders/stats/trend?period=${period}`,
      providesTags: ["orders"],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, ...data }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),
  }),
});

export const {
  useGetOrdersListQuery,
  useLazyGetOrdersListQuery,
  useGetOrderStatsQuery,
  useGetSalesTrendQuery,
  useLazyGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
