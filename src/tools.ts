import { z } from 'zod';
import { NetSuiteClient } from './api-client.js';

/**
 * NetSuite MCP Tool Definitions
 *
 * 42 tools covering: SuiteQL, Generic Records, Customers, Vendors,
 * Invoices, Sales Orders, Purchase Orders, Vendor Bills, Journal Entries,
 * Payments, Credit Memos, Accounting, Employees, Items, Estimates/Opportunities
 */

interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (client: NetSuiteClient, args: any) => Promise<any>;
}

// Reusable pagination params
const paginationParams = {
  limit: z.number().optional().describe('results per page'),
  offset: z.number().optional().describe('pagination offset'),
};

const searchableParams = {
  ...paginationParams,
  q: z.string().optional().describe('search query string'),
};

export const tools: ToolDef[] = [
  // --- SuiteQL (1) ---

  {
    name: 'suiteql_query',
    description: 'Execute a SuiteQL query (SQL-like)',
    inputSchema: z.object({
      query: z.string().describe('SuiteQL query string'),
      limit: z.number().optional().describe('max results per page'),
      offset: z.number().optional().describe('pagination offset'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.runSuiteQL(args.query, args.limit, args.offset),
  },

  // --- Generic Records (5) ---

  {
    name: 'record_list',
    description: 'List records of any type',
    inputSchema: z.object({
      record_type: z.string().describe('record type (e.g. customer, invoice)'),
      ...searchableParams,
      fields: z.string().optional().describe('comma-separated field names'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listRecords(args.record_type, {
        limit: args.limit,
        offset: args.offset,
        q: args.q,
        fields: args.fields,
      }),
  },
  {
    name: 'record_get',
    description: 'Get any record by type and ID',
    inputSchema: z.object({
      record_type: z.string().describe('record type (e.g. customer, invoice)'),
      id: z.string().describe('record internal ID'),
      fields: z.string().optional().describe('comma-separated field names'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getRecord(args.record_type, args.id, args.fields),
  },
  {
    name: 'record_create',
    description: 'Create a record of any type',
    inputSchema: z.object({
      record_type: z.string().describe('record type (e.g. customer, invoice)'),
      data: z.string().describe('JSON record body'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.createRecord(args.record_type, JSON.parse(args.data)),
  },
  {
    name: 'record_update',
    description: 'Update any record by type and ID',
    inputSchema: z.object({
      record_type: z.string().describe('record type (e.g. customer, invoice)'),
      id: z.string().describe('record internal ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.updateRecord(args.record_type, args.id, JSON.parse(args.data)),
  },
  {
    name: 'record_delete',
    description: 'Delete any record by type and ID',
    inputSchema: z.object({
      record_type: z.string().describe('record type (e.g. customer, invoice)'),
      id: z.string().describe('record internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.deleteRecord(args.record_type, args.id),
  },

  // --- Customers (4) ---

  {
    name: 'customers_list',
    description: 'List customers',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listCustomers(args),
  },
  {
    name: 'customer_get',
    description: 'Get customer by ID',
    inputSchema: z.object({
      id: z.string().describe('customer internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getCustomer(args.id),
  },
  {
    name: 'customer_create',
    description: 'Create a customer',
    inputSchema: z.object({
      data: z.string().describe('JSON customer body'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.createCustomer(JSON.parse(args.data)),
  },
  {
    name: 'customer_update',
    description: 'Update a customer',
    inputSchema: z.object({
      id: z.string().describe('customer internal ID'),
      data: z.string().describe('JSON fields to update'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.updateCustomer(args.id, JSON.parse(args.data)),
  },

  // --- Vendors (3) ---

  {
    name: 'vendors_list',
    description: 'List vendors',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listVendors(args),
  },
  {
    name: 'vendor_get',
    description: 'Get vendor by ID',
    inputSchema: z.object({
      id: z.string().describe('vendor internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getVendor(args.id),
  },
  {
    name: 'vendor_create',
    description: 'Create a vendor',
    inputSchema: z.object({
      data: z.string().describe('JSON vendor body'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.createVendor(JSON.parse(args.data)),
  },

  // --- Invoices (3) ---

  {
    name: 'invoices_list',
    description: 'List invoices',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listInvoices(args),
  },
  {
    name: 'invoice_get',
    description: 'Get invoice by ID',
    inputSchema: z.object({
      id: z.string().describe('invoice internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getInvoice(args.id),
  },
  {
    name: 'invoice_create',
    description: 'Create an invoice',
    inputSchema: z.object({
      data: z.string().describe('JSON invoice body with entity and item lines'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.createInvoice(JSON.parse(args.data)),
  },

  // --- Sales Orders (3) ---

  {
    name: 'sales_orders_list',
    description: 'List sales orders',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listSalesOrders(args),
  },
  {
    name: 'sales_order_get',
    description: 'Get sales order by ID',
    inputSchema: z.object({
      id: z.string().describe('sales order internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getSalesOrder(args.id),
  },
  {
    name: 'sales_order_create',
    description: 'Create a sales order',
    inputSchema: z.object({
      data: z.string().describe('JSON sales order body'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.createSalesOrder(JSON.parse(args.data)),
  },

  // --- Purchase Orders (3) ---

  {
    name: 'purchase_orders_list',
    description: 'List purchase orders',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listPurchaseOrders(args),
  },
  {
    name: 'purchase_order_get',
    description: 'Get purchase order by ID',
    inputSchema: z.object({
      id: z.string().describe('purchase order internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getPurchaseOrder(args.id),
  },
  {
    name: 'purchase_order_create',
    description: 'Create a purchase order',
    inputSchema: z.object({
      data: z.string().describe('JSON purchase order body'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.createPurchaseOrder(JSON.parse(args.data)),
  },

  // --- Vendor Bills (3) ---

  {
    name: 'vendor_bills_list',
    description: 'List vendor bills',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listVendorBills(args),
  },
  {
    name: 'vendor_bill_get',
    description: 'Get vendor bill by ID',
    inputSchema: z.object({
      id: z.string().describe('vendor bill internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getVendorBill(args.id),
  },
  {
    name: 'vendor_bill_create',
    description: 'Create a vendor bill',
    inputSchema: z.object({
      data: z.string().describe('JSON vendor bill body'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.createVendorBill(JSON.parse(args.data)),
  },

  // --- Journal Entries (3) ---

  {
    name: 'journal_entries_list',
    description: 'List journal entries',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listJournalEntries(args),
  },
  {
    name: 'journal_entry_get',
    description: 'Get journal entry by ID',
    inputSchema: z.object({
      id: z.string().describe('journal entry internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getJournalEntry(args.id),
  },
  {
    name: 'journal_entry_create',
    description: 'Create a journal entry',
    inputSchema: z.object({
      data: z.string().describe('JSON journal entry with line items'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.createJournalEntry(JSON.parse(args.data)),
  },

  // --- Payments (2) ---

  {
    name: 'customer_payments_list',
    description: 'List customer payments',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listCustomerPayments(args),
  },
  {
    name: 'vendor_payments_list',
    description: 'List vendor payments',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listVendorPayments(args),
  },

  // --- Credit Memos (2) ---

  {
    name: 'credit_memos_list',
    description: 'List credit memos',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listCreditMemos(args),
  },
  {
    name: 'credit_memo_get',
    description: 'Get credit memo by ID',
    inputSchema: z.object({
      id: z.string().describe('credit memo internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getCreditMemo(args.id),
  },

  // --- Accounting (5) ---

  {
    name: 'accounts_list',
    description: 'List chart of accounts',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listAccounts(args),
  },
  {
    name: 'account_get',
    description: 'Get account by ID',
    inputSchema: z.object({
      id: z.string().describe('account internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getAccount(args.id),
  },
  {
    name: 'subsidiaries_list',
    description: 'List subsidiaries',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listSubsidiaries(args),
  },
  {
    name: 'departments_list',
    description: 'List departments',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listDepartments(args),
  },
  {
    name: 'locations_list',
    description: 'List locations',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listLocations(args),
  },

  // --- Employees (2) ---

  {
    name: 'employees_list',
    description: 'List employees',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listEmployees(args),
  },
  {
    name: 'employee_get',
    description: 'Get employee by ID',
    inputSchema: z.object({
      id: z.string().describe('employee internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getEmployee(args.id),
  },

  // --- Items (2) ---

  {
    name: 'items_list',
    description: 'List inventory items',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listItems(args),
  },
  {
    name: 'item_get',
    description: 'Get item by ID',
    inputSchema: z.object({
      id: z.string().describe('item internal ID'),
    }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.getItem(args.id),
  },

  // --- Estimates & Opportunities (2) ---

  {
    name: 'estimates_list',
    description: 'List estimates/quotes',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listEstimates(args),
  },
  {
    name: 'opportunities_list',
    description: 'List opportunities',
    inputSchema: z.object({ ...searchableParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listOpportunities(args),
  },

  // --- Classifications (1) ---

  {
    name: 'classifications_list',
    description: 'List classifications',
    inputSchema: z.object({ ...paginationParams }),
    handler: async (client: NetSuiteClient, args: any) =>
      client.listClassifications(args),
  },
];
