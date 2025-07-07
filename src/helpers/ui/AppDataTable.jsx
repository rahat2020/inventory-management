import { useMemo } from "react";
import { size } from "lodash";
import InfiniteScroll from "react-infinite-scroll-component";
import AppSpinner from "./AppSpinner";

const AppDataTable = ({
  columns,
  data = [],
  rowKey,
  rowStyles,
  isBodyScrollable = false,
  bodyMaxHeight = "200px",
  singleHeaderTitle = "",
  isSingleHeader = false,
  tableBodyClasses = "py-3 px-4",
  isDataLoading = true,
  multiHeaderClasses = "py-3 px-4 text-gray-800",
  options: {
    loadMoreData = () => {},
    hasMoreData = false,
    loadingData = false,
  } = {},
}) => {
  // get columns counter
  const columnCount = useMemo(
    () => columns.filter((c) => c.isShow !== false).length,
    [columns]
  );
  console.log("isBodyScrollable", isBodyScrollable);
  const filteredColumnsData = columns?.filter((item) => item.isShow !== false);

  // For width handling, create array of widths
  const columnWidths = useMemo(
    () =>
      columns
        .filter((col) => col.isShow !== false)
        .map((col) => col.width || "120px"),
    [columns]
  );

  return (
    <div
      id="scrollable-table-body"
      className={`w-full relative !scrollbar-hide ${
        isBodyScrollable ? "overflow-y-auto" : "overflow-x-auto"
      }`}
      style={{
        maxHeight: isBodyScrollable ? bodyMaxHeight : "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <InfiniteScroll
        dataLength={data.length}
        next={loadMoreData}
        hasMore={hasMoreData}
        loader={
          loadingData && (
            <div className="text-center text-sm py-4">Loading...</div>
          )
        }
        scrollableTarget="scrollable-table-body"
        scrollThreshold={0.9}
      >
        <table
          className={isBodyScrollable ? "block w-full" : ""}
          style={isBodyScrollable ? { width: "100%" } : {}}
        >
          <thead className={isBodyScrollable ? "block" : ""}>
            {isSingleHeader ? (
              <tr className="table w-full table-fixed">
                <th
                  // colSpan={columns.filter((c) => c.isShow !== false).length}
                  colSpan={columnCount}
                  className="bg-[#DFF0D8] text-center py-2 font-bold border-t border-b border-gray-200 text-[1rem]"
                  style={{
                    width: isBodyScrollable ? "100%" : undefined,
                    minWidth: isBodyScrollable ? "100%" : undefined,
                  }}
                >
                  {singleHeaderTitle}
                </th>
              </tr>
            ) : (
              <tr className={isBodyScrollable ? "flex w-full" : ""}>
                {/* <tr className="table w-full table-fixed border-b-3 border-gray-300"> */}
                {columns.map(
                  (col, index) =>
                    col.isShow !== false && (
                      <th
                        key={index}
                        className={`font-semibold ${multiHeaderClasses} ${
                          isBodyScrollable ? "overflow-hidden" : ""
                        }`}
                        style={{
                          width: columnWidths[index],
                          minWidth: columnWidths[index],
                          maxWidth: columnWidths[index],
                          boxSizing: "border-box",
                        }}
                        // className={`font-semibold ${multiHeaderClasses}`}
                        // style={
                        //   col.width
                        //     ? { width: col.width, minWidth: col.width }
                        //     : {}
                        // }
                      >
                        {col.header}
                      </th>
                    )
                )}
              </tr>
            )}
          </thead>

          {isDataLoading ? (
            <tbody className="flex justify-center items-center w-full h-full">
              <tr className="flex justify-center items-center w-full h-full">
                <td className="flex justify-center items-center w-full h-full">
                  <AppSpinner width="15" height="15" />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {size(data) === 0 ? (
                <tr>
                  <td
                    // colSpan={columns.filter((c) => c.isShow !== false).length}
                    colSpan={columnCount}
                    // className={
                    //   isBodyScrollable
                    //     ? "block overflow-y-auto w-full text-center text-sm text-gray-500 py-4 font-medium capitalize"
                    //     : "text-center text-sm text-gray-500 py-4 font-medium capitalize"
                    // }
                    className="flex justify-center items-center w-full h-full text-center text-sm text-gray-500 py-4 font-medium capitalize"
                  >
                    <p className="text-center">No data found</p>
                  </td>
                </tr>
              ) : (
                data?.map((item, rowIndex) => (
                  <tr
                    key={item[rowKey] || rowIndex}
                    className={
                      (isBodyScrollable ? "flex w-full" : "") +
                      ` border-b border-gray-100 ${
                        rowStyles ? rowStyles(rowIndex) : ""
                      }`
                    }
                    style={isBodyScrollable ? { width: "100%" } : {}}
                    // key={item[rowKey] || rowIndex}
                    // className={`border-b border-gray-100 ${
                    //   rowStyles ? rowStyles(rowIndex) : ""
                    // }`}
                  >
                    {filteredColumnsData?.map(
                      (col, colIndex) =>
                        col.isShow !== false && (
                          <td
                            key={colIndex}
                            className="py-3 px-4 truncate max-w-xs"
                            // className={`${tableBodyClasses} truncate max-w-xs ${
                            //   isBodyScrollable ? "overflow-hidden" : ""
                            // }`}
                            style={{
                              width: columnWidths[colIndex],
                              minWidth: columnWidths[colIndex],
                              maxWidth: columnWidths[colIndex],
                              boxSizing: "border-box",
                            }}
                            // style={
                            //   col.width
                            //     ? { width: col.width, minWidth: col.width }
                            //     : {}
                            // }
                          >
                            {col.render ? col.render(item) : item[col.key]}
                          </td>
                        )
                    )}
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </InfiniteScroll>
    </div>
  );
};

export default AppDataTable;
