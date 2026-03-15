import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const RECORD_PATH = '/services/rest/record/v1';
const QUERY_PATH = '/services/rest/query/v1';

export class NetSuiteClient {
  private baseUrl: string;
  private oauth: OAuth;
  private token: OAuth.Token;

  constructor(
    accountId: string,
    consumerKey: string,
    consumerSecret: string,
    tokenId: string,
    tokenSecret: string,
  ) {
    // NetSuite account IDs: replace hyphens with underscores for URL
    const urlAccountId = accountId.replace(/-/g, '_').toLowerCase();
    this.baseUrl = `https://${urlAccountId}.suitetalk.api.netsuite.com`;

    this.oauth = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: 'HMAC-SHA256',
      hash_function(baseString: string, key: string) {
        return crypto.createHmac('sha256', key).update(baseString).digest('base64');
      },
      realm: accountId,
    });

    this.token = { key: tokenId, secret: tokenSecret };
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      params?: Record<string, string | number | boolean | undefined>;
      body?: any;
      headers?: Record<string, string>;
    } = {},
  ): Promise<T> {
    const { params, body, headers: extraHeaders } = options;
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const requestData = { url: url.toString(), method };
    const authHeader = this.oauth.toHeader(
      this.oauth.authorize(requestData, this.token),
    );

    const headers: Record<string, string> = {
      Authorization: (authHeader as any).Authorization,
      Accept: 'application/json',
      ...extraHeaders,
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 204) return {} as T;

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return {} as T;
  }

  // --- SuiteQL ---

  async runSuiteQL(query: string, limit?: number, offset?: number) {
    return this.request<any>('POST', `${QUERY_PATH}/suiteql`, {
      params: { limit, offset },
      body: { q: query },
      headers: { Prefer: 'transient' },
    });
  }

  // --- Generic Record CRUD ---

  async listRecords(recordType: string, params?: {
    limit?: number;
    offset?: number;
    q?: string;
    fields?: string;
  }) {
    return this.request<any>('GET', `${RECORD_PATH}/${encodeURIComponent(recordType)}`, { params });
  }

  async getRecord(recordType: string, id: string, fields?: string) {
    return this.request<any>('GET', `${RECORD_PATH}/${encodeURIComponent(recordType)}/${encodeURIComponent(id)}`, {
      params: fields ? { fields } : undefined,
    });
  }

  async createRecord(recordType: string, body: any) {
    return this.request<any>('POST', `${RECORD_PATH}/${encodeURIComponent(recordType)}`, { body });
  }

  async updateRecord(recordType: string, id: string, body: any) {
    return this.request<any>('PATCH', `${RECORD_PATH}/${encodeURIComponent(recordType)}/${encodeURIComponent(id)}`, { body });
  }

  async deleteRecord(recordType: string, id: string) {
    return this.request<any>('DELETE', `${RECORD_PATH}/${encodeURIComponent(recordType)}/${encodeURIComponent(id)}`);
  }

  // --- Customers ---

  async listCustomers(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('customer', params);
  }

  async getCustomer(id: string) {
    return this.getRecord('customer', id);
  }

  async createCustomer(body: any) {
    return this.createRecord('customer', body);
  }

  async updateCustomer(id: string, body: any) {
    return this.updateRecord('customer', id, body);
  }

  // --- Vendors ---

  async listVendors(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('vendor', params);
  }

  async getVendor(id: string) {
    return this.getRecord('vendor', id);
  }

  async createVendor(body: any) {
    return this.createRecord('vendor', body);
  }

  // --- Invoices ---

  async listInvoices(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('invoice', params);
  }

  async getInvoice(id: string) {
    return this.getRecord('invoice', id);
  }

  async createInvoice(body: any) {
    return this.createRecord('invoice', body);
  }

  // --- Sales Orders ---

  async listSalesOrders(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('salesOrder', params);
  }

  async getSalesOrder(id: string) {
    return this.getRecord('salesOrder', id);
  }

  async createSalesOrder(body: any) {
    return this.createRecord('salesOrder', body);
  }

  // --- Purchase Orders ---

  async listPurchaseOrders(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('purchaseOrder', params);
  }

  async getPurchaseOrder(id: string) {
    return this.getRecord('purchaseOrder', id);
  }

  async createPurchaseOrder(body: any) {
    return this.createRecord('purchaseOrder', body);
  }

  // --- Vendor Bills ---

  async listVendorBills(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('vendorBill', params);
  }

  async getVendorBill(id: string) {
    return this.getRecord('vendorBill', id);
  }

  async createVendorBill(body: any) {
    return this.createRecord('vendorBill', body);
  }

  // --- Journal Entries ---

  async listJournalEntries(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('journalEntry', params);
  }

  async getJournalEntry(id: string) {
    return this.getRecord('journalEntry', id);
  }

  async createJournalEntry(body: any) {
    return this.createRecord('journalEntry', body);
  }

  // --- Payments ---

  async listCustomerPayments(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('customerPayment', params);
  }

  async listVendorPayments(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('vendorPayment', params);
  }

  // --- Credit Memos ---

  async listCreditMemos(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('creditMemo', params);
  }

  async getCreditMemo(id: string) {
    return this.getRecord('creditMemo', id);
  }

  // --- Accounting ---

  async listAccounts(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('account', params);
  }

  async getAccount(id: string) {
    return this.getRecord('account', id);
  }

  async listSubsidiaries(params?: { limit?: number; offset?: number }) {
    return this.listRecords('subsidiary', params);
  }

  async listDepartments(params?: { limit?: number; offset?: number }) {
    return this.listRecords('department', params);
  }

  async listLocations(params?: { limit?: number; offset?: number }) {
    return this.listRecords('location', params);
  }

  async listClassifications(params?: { limit?: number; offset?: number }) {
    return this.listRecords('classification', params);
  }

  // --- Employees ---

  async listEmployees(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('employee', params);
  }

  async getEmployee(id: string) {
    return this.getRecord('employee', id);
  }

  // --- Items ---

  async listItems(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('inventoryItem', params);
  }

  async getItem(id: string) {
    return this.getRecord('inventoryItem', id);
  }

  // --- Estimates & Opportunities ---

  async listEstimates(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('estimate', params);
  }

  async listOpportunities(params?: { limit?: number; offset?: number; q?: string }) {
    return this.listRecords('opportunity', params);
  }
}
