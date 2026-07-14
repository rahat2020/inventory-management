import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["analytics"],

  endpoints: (builder) => ({
    getAnalyticsOverview: builder.query({
      query: () => "/analytics/overview",
      providesTags: ["analytics"],
    }),

    getRestockForecast: builder.query({
      query: () => "/analytics/forecast",
      providesTags: ["analytics"],
    }),
  }),
});

export const { useGetAnalyticsOverviewQuery, useGetRestockForecastQuery } =
  analyticsApi;
