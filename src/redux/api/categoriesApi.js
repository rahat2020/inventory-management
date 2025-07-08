import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["categories"],

  endpoints: (builder) => ({
    // get products lists
    getAllCategories: builder.query({
      query: ({ name = "", status = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (name) params.append("name", name);
        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);

        return `/all-categories?${params.toString()}`;
      },
      providesTags: ["categories"],
    }),

    // get filter category
    getFilterCategories: builder.query({
      query: () => ({
        url: "/filter-categories",
        method: "GET",
      }),
      providesTags: ["categories"],
    }),

    // get single category
    getSingleCategory: builder.query({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: ["categories"],
    }),

    // create category
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/add-category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["categories"],
    }),
  }),
});

export const {
  useLazyGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useGetSingleCategoryQuery,
  useGetFilterCategoriesQuery,
} = categoriesApi;
