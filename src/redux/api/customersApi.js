import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["customers"],

  endpoints: (builder) => ({
    getCustomersList: builder.query({
      query: ({ search = "", status = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);
        return `/customers/all?${params.toString()}`;
      },
      providesTags: ["customers"],
    }),

    getCustomerStats: builder.query({
      query: () => "/customers/stats/summary",
      providesTags: ["customers"],
    }),

    getCustomerById: builder.query({
      query: (customerId) => `/customers/${customerId}`,
      providesTags: ["customers"],
    }),

    createCustomer: builder.mutation({
      query: (data) => ({
        url: "/customers/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["customers"],
    }),

    updateCustomer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/customers/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["customers"],
    }),

    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["customers"],
    }),
  }),
});

export const {
  useLazyGetCustomersListQuery,
  useGetCustomerStatsQuery,
  useLazyGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
