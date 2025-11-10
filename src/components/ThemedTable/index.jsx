import { Table, Skeleton } from 'antd';

const ThemedTable = ({ columns, data, summary, loading, pagination }) => {
  const pageSize = pagination?.pageSize || 10;

  // Grab real data keys from columns
  const columnKeys = columns.map(
    (col, index) => col.dataIndex || `col${index}`,
  );

  // Build skeleton rows using actual column keys
  const fakeData = Array.from({ length: pageSize }).map((_, i) => {
    const row = { key: `skeleton-${i}` };
    columnKeys.forEach((key) => {
      row[key] = `skeleton-${i}-${key}`;
    });
    return row;
  });

  const maxSkeletonCols = 6;
  const visibleSkeletonColumns = columns.slice(0, maxSkeletonCols);
  const skeletonColumns = visibleSkeletonColumns.map((col) => ({
    ...col,
    render: () => (
      <Skeleton.Input
        style={{
          height: 24,
          borderRadius: 6,
        }}
        active
        size="small"
      />
    ),
  }));

  return (
    <Table
      columns={loading ? skeletonColumns : columns}
      dataSource={loading ? fakeData : data}
      rowKey={(record, index) => record.key || index}
      summary={summary}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
        total: pagination?.total || data.length,
        current: pagination?.current,
        pageSize: pagination?.pageSize,
        hideOnSinglePage: false,
        onChange: (page) => {
          pagination?.setCurrentPage?.(page);
        },
        onShowSizeChange: (_, size) => {
          pagination?.setResultPerPage?.(size);
        },
      }}
      loading={loading ? { spinning: false } : false}
    />
  );
};

export default ThemedTable;
