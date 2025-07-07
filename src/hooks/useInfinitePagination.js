import { useEffect, useState, useCallback, useRef } from "react";
import { useLazyGetPaginatedFactoryDataQuery } from "../redux/api/companyApi";

const useInfinitePagination = () => {
  // Store items and pagination state
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Use refs to prevent issues with stale closures and multiple fetches
  const isInitialFetchDone = useRef(false);
  const isFetching = useRef(false);
  const fetchedData = useRef(new Map()); // Map to track what we've already fetched

  // Get the query function
  const [trigger, result] = useLazyGetPaginatedFactoryDataQuery();

  // Function to fetch data with a specific offset
  const fetchData = useCallback(
    (fetchOffset) => {
      isFetching.current = true;

      // Mark this offset as fetched
      fetchedData.current.set(fetchOffset, true);

      // Trigger the query
      trigger({ offset: fetchOffset });
    },
    [trigger]
  );

  // Initial fetch
  useEffect(() => {
    if (!isInitialFetchDone.current && !isFetching.current) {
      isInitialFetchDone.current = true;
      fetchData(0);
    }
  }, [fetchData]);

  // Handle query results
  useEffect(() => {
    // Only process if we have data and the query is done
    if (result.isSuccess) {
      isFetching.current = false;

      const currentOffset = result.originalArgs?.offset || 0;

      if (Array.isArray(result.data)) {
        // Process the data
        if (result.data.length > 0) {
          // Add new items, avoiding duplicates
          setItems((prevItems) => {
            // Create a map of existing items by ID for quick lookup
            const existingItemsMap = new Map();
            prevItems.forEach((item) => {
              const itemId = item.id || JSON.stringify(item);
              existingItemsMap.set(itemId, true);
            });

            // Filter out duplicates from new data
            const newUniqueItems = result.data.filter((item) => {
              const itemId = item.id || JSON.stringify(item);
              return !existingItemsMap.has(itemId);
            });

            // Return combined array
            return [...prevItems, ...newUniqueItems];
          });

          // Update pagination state
          if (result.data.length < 50) {
            setHasMore(false);
          } else {
            // Update offset for next fetch
            setOffset(currentOffset + 1);
          }
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } else if (result.isError) {
      isFetching.current = false;
    }
  }, [result.isSuccess, result.isError, result.data, result.originalArgs]);

  // Function to fetch next page
  const fetchNext = useCallback(() => {
    fetchData(offset);
  }, [offset, hasMore, fetchData]);

  // Reset function
  const reset = useCallback(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    isInitialFetchDone.current = false;
    isFetching.current = false;
    fetchedData.current.clear();
    fetchData(0);
  }, [fetchData]);
  console.log(items);

  return {
    items,
    isLoading: result.isLoading || isFetching.current,
    isError: result.isError,
    error: result.error,
    fetchNext,
    hasMore,
    currentOffset: offset,
    totalItems: items.length,
    reset,
  };
};

export default useInfinitePagination;
