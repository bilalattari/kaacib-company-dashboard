import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';

export const fetchAssets = createAsyncThunk('assets/fetch', async (params = {}) => {
  const qp = new URLSearchParams();
  if (params.status) qp.append('status', params.status);
  if (params.asset_type) qp.append('asset_type', params.asset_type);
  if (params.search) qp.append('search', params.search);
  if (params.branch_id) qp.append('branch_id', params.branch_id);
  if (params.page) qp.append('page', params.page);
  if (params.limit) qp.append('limit', params.limit);
  const url = qp.toString()
    ? `${ENDPOINTS.COMPANY_ASSETS()}?${qp.toString()}`
    : ENDPOINTS.COMPANY_ASSETS();
  const res = await api.get(url);
  return res.data?.data || res.data;
});

export const createAsset = createAsyncThunk('assets/create', async (payload) => {
  const res = await api.post(ENDPOINTS.COMPANY_ASSETS(), payload);
  return res.data?.data?.asset || res.data?.asset || res.data;
});

export const updateAssetById = createAsyncThunk('assets/update', async ({ id, data }) => {
  const res = await api.put(ENDPOINTS.COMPANY_ASSET_BY_ID(id), data);
  return res.data?.data?.asset || res.data?.asset || res.data;
});

export const deleteAssetById = createAsyncThunk('assets/delete', async (id) => {
  await api.delete(ENDPOINTS.COMPANY_ASSET_BY_ID(id));
  return id;
});

export const fetchAssetHistory = createAsyncThunk(
  'assets/history',
  async ({ id, page = 1, limit = 10 }) => {
    const res = await api.get(
      `${ENDPOINTS.COMPANY_ASSET_SERVICE_HISTORY(id)}?page=${page}&limit=${limit}`
    );
    return { id, ...(res.data?.data || res.data) };
  }
);

export const createAssetServiceRequest = createAsyncThunk(
  'assets/serviceRequest',
  async ({ id, data }) => {
    delete data.visiting_fee
    const res = await api.post(`${ENDPOINTS.COMPANY_ASSET_BY_ID(id)}/service-request`, data);
    return res.data?.data || res.data;
  }
);

const slice = createSlice({
  name: 'assets',
  initialState: {
    list: [],
    loading: false,
    error: null,
    filters: { status: '', asset_type: '', search: '', branch_id: '', page: 1, limit: 10 },
    pagination: { current: 1, pages: 1, total: 0 },
    history: { items: [], pagination: { current: 1, pages: 1, total: 0 }, loading: false, assetId: null },
  },
  reducers: {
    setAssetFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAssetFilters(state) {
      state.filters = { status: '', asset_type: '', search: '', branch_id: '', page: 1, limit: 10 };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchAssets.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAssets.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload?.assets || a.payload || [];
        if (a.payload?.pagination) s.pagination = a.payload.pagination;
      })
      .addCase(fetchAssets.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error?.message;
      });

    builder
      .addCase(createAsset.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createAsset.fulfilled, (s, a) => {
        s.loading = false;
        if (a.payload) s.list.unshift(a.payload);
      })
      .addCase(createAsset.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error?.message;
      });

    builder
      .addCase(updateAssetById.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateAssetById.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.map((it) => (it._id === a.payload._id ? a.payload : it));
      })
      .addCase(updateAssetById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error?.message;
      });

    builder
      .addCase(deleteAssetById.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(deleteAssetById.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.filter((it) => it._id !== a.payload);
      })
      .addCase(deleteAssetById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error?.message;
      });

    builder
      .addCase(fetchAssetHistory.pending, (s) => {
        s.history.loading = true;
        s.history.items = [];
        s.history.assetId = null;
      })
      .addCase(fetchAssetHistory.fulfilled, (s, a) => {
        s.history.loading = false;
        s.history.items = a.payload.service_history || [];
        s.history.pagination = a.payload.pagination || { current: 1, pages: 1, total: 0 };
        s.history.assetId = a.payload.id;
      })
      .addCase(fetchAssetHistory.rejected, (s, a) => {
        s.history.loading = false;
        s.error = a.error?.message;
        s.history.assetId = null;
      });

    builder
      .addCase(createAssetServiceRequest.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createAssetServiceRequest.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(createAssetServiceRequest.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error?.message;
      });
  },
});

export const { setAssetFilters, clearAssetFilters } = slice.actions;
export default slice.reducer;


