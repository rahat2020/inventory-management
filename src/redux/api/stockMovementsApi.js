import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

export const stockMovementsApi = createApi({
  reducerPath: "stockMovementsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["stockLevels"],

  endpoints: (builder) => ({
    // get stock levels summary (counts across all products)
    getStockLevelsSummary: builder.query({
      query: () => "/stock-movements/levels/summary",
      providesTags: ["stockLevels"],
    }),

    // recent stock movements (for dashboard activity feed)
    getStockMovements: builder.query({
      query: ({ limit = 10, page = 1, movementType = "" } = {}) => {
        const params = new URLSearchParams();
        if (movementType) params.append("movementType", movementType);
        params.append("page", page);
        params.append("limit", limit);
        return `/stock-movements/all?${params.toString()}`;
      },
      providesTags: ["stockLevels"],
    }),

    // restock a product
    restockProduct: builder.mutation({
      query: (data) => ({
        url: "/stock-movements/restock",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["stockLevels"],
    }),
  }),
});

export const {
  useGetStockLevelsSummaryQuery,
  useGetStockMovementsQuery,
  useRestockProductMutation,
} = stockMovementsApi;
