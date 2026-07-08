import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config/api";

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
        // backend's getAllProducts reads `search`, not `name`
        if (name) params.append("search", name);
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

    // create product
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/add-product",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["products"],
    }),

    // update product
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/product/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["products"],
    }),

    // delete product
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/product/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["products"],
    }),
  }),
});

export const {
  useLazyGetProductsListQuery,
  useGetSingleProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
