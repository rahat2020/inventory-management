import { size } from "lodash";
import { memo, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

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
  multiHeaderClasses = "py-3 px-4 text-gray-800",
  scrollId,
  fetchMoreData,
  hasMore,
  options: { loadingData = false } = {},
}) => {
  const columnCount = useMemo(
    () => columns.filter((c) => c.isShow !== false).length,
    [columns]
  );

  const filteredColumnsData = columns?.filter((item) => item.isShow !== false);

  const columnWidths = useMemo(
    () =>
      columns
        .filter((col) => col.isShow !== false)
        .map((col) => col.width || "120px"),
    [columns]
  );

  return (
    <div className="w-full overflow-x-auto !scrollbar-hide">
      <table className="min-w-max w-full table-fixed border-collapse">
        <thead
          className={isBodyScrollable ? "block w-full" : ""}
          style={isBodyScrollable ? { width: "100%" } : {}}
        >
          {isSingleHeader ? (
            <tr className={isBodyScrollable ? "flex w-full" : ""}>
              <th
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
              {filteredColumnsData.map((col, index) => (
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
                >
                  {col.header}
                </th>
              ))}
            </tr>
          )}
        </thead>
      </table>

      {/* ✅ Scrollable wrapper with ID */}
      <div
        style={{
          maxHeight: bodyMaxHeight,
          overflowY: "auto",
        }}
        className="w-full"
      >
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMoreData}
          hasMore={hasMore}
          height={bodyMaxHeight}
          loader={
            loadingData && (
              <div className="flex justify-center items-center h-10 w-full">
                <h4>Loading...</h4>
              </div>
            )
          }
          scrollableTarget={scrollId}
        >
          <table
            className="min-w-max w-full table-fixed border-collapse"
            id={scrollId}
          >
            <tbody className={isBodyScrollable ? "block w-full" : ""}>
              {size(data) === 0 ? (
                <tr className={isBodyScrollable ? "flex w-full" : ""}>
                  <td
                    colSpan={columnCount}
                    className="text-center text-sm text-gray-500 py-4 font-medium capitalize"
                    style={isBodyScrollable ? { width: "100%" } : {}}
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <tr
                    key={item[rowKey] || rowIndex}
                    className={
                      (isBodyScrollable ? "flex w-full" : "") +
                      ` border-b border-gray-100 ${
                        rowStyles ? rowStyles(rowIndex) : ""
                      }`
                    }
                    style={isBodyScrollable ? { width: "100%" } : {}}
                  >
                    {filteredColumnsData.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`${tableBodyClasses} truncate max-w-xs ${
                          isBodyScrollable ? "overflow-hidden" : ""
                        }`}
                        style={{
                          width: columnWidths[colIndex],
                          minWidth: columnWidths[colIndex],
                          maxWidth: columnWidths[colIndex],
                          boxSizing: "border-box",
                        }}
                      >
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default memo(AppDataTable);
