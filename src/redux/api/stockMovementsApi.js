import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

const buildMovementListQuery = (path) => ({ search = "", page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("limit", limit);
  return `${path}?${params.toString()}`;
};

export const stockMovementsApi = createApi({
  reducerPath: "stockMovementsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["stockLevels", "stockMovements"],

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
      providesTags: ["stockMovements"],
    }),

    // incoming stock movements (restocks)
    getIncoming: builder.query({
      query: buildMovementListQuery("/stock-movements/incoming"),
      providesTags: ["stockMovements"],
    }),

    // outgoing stock movements (shipped/sold/damaged/etc.)
    getOutgoing: builder.query({
      query: buildMovementListQuery("/stock-movements/outgoing"),
      providesTags: ["stockMovements"],
    }),

    // returned stock movements
    getReturns: builder.query({
      query: buildMovementListQuery("/stock-movements/returns"),
      providesTags: ["stockMovements"],
    }),

    // restock a product
    restockProduct: builder.mutation({
      query: (data) => ({
        url: "/stock-movements/restock",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["stockLevels", "stockMovements"],
    }),

    // record manual outgoing stock (damage/sample/manual correction)
    recordOutgoing: builder.mutation({
      query: (data) => ({
        url: "/stock-movements/stock-out",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["stockLevels", "stockMovements"],
    }),

    // record a customer return
    recordReturn: builder.mutation({
      query: (data) => ({
        url: "/stock-movements/return",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["stockLevels", "stockMovements"],
    }),
  }),
});

export const {
  useGetStockLevelsSummaryQuery,
  useGetStockMovementsQuery,
  useLazyGetIncomingQuery,
  useLazyGetOutgoingQuery,
  useLazyGetReturnsQuery,
  useRestockProductMutation,
  useRecordOutgoingMutation,
  useRecordReturnMutation,
} = stockMovementsApi;
