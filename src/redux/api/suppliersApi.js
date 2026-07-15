import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

export const suppliersApi = createApi({
  reducerPath: "suppliersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["suppliers"],

  endpoints: (builder) => ({
    getSuppliersList: builder.query({
      query: ({ search = "", status = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);
        return `/suppliers/all?${params.toString()}`;
      },
      providesTags: ["suppliers"],
    }),

    getSupplierStats: builder.query({
      query: () => "/suppliers/stats/summary",
      providesTags: ["suppliers"],
    }),

    getSupplierById: builder.query({
      query: (supplierId) => `/suppliers/${supplierId}`,
      providesTags: ["suppliers"],
    }),

    createSupplier: builder.mutation({
      query: (data) => ({
        url: "/suppliers/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["suppliers"],
    }),

    updateSupplier: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/suppliers/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["suppliers"],
    }),

    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["suppliers"],
    }),
  }),
});

export const {
  useLazyGetSuppliersListQuery,
  useGetSupplierStatsQuery,
  useLazyGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
