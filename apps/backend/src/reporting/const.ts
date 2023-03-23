export const dailySummaryColumns = [
  { header: 'Program', key: 'program' },
  { header: 'Date', key: 'date' },
  { header: 'Location ID', key: 'location_id' },
  { header: 'Location', key: 'location_name' },
  { header: 'Total Payments', key: 'total_payments' },
  { header: 'Total Unmatched', key: 'total_unmatched_payments' },
  { header: '% Unmatched', key: 'percent_unmatched' },
  { header: 'Sum Of Payments', key: 'total_sum' }
];

export const detailedReportColumns = [
  { header: 'Source File', key: 'source_file' },
  { header: 'Reconciliation Status', key: 'reconciliation_status' },
  { header: 'Transaction ID', key: 'transaction_id' },
  { header: 'Location ID', key: 'location_id' },
  { header: 'Location', key: 'location' },
  { header: 'Date', key: 'date' },
  { header: 'Time', key: 'time' },
  { header: 'Deposit Date Range', key: 'deposit_date_range' },
  { header: 'Fiscal Date', key: 'fiscal_date' },
  { header: 'Payment Method', key: 'payment_method' },
  { header: 'Amount', key: 'amount' },
  { header: 'Foreign Currency Amount', key: 'foreign_currency_amount' },
  { header: 'Currency', key: 'currency' },
  { header: 'Exchange Rate', key: 'exchange_rate' },
  { header: 'Misc', key: 'misc' },
  { header: 'Merchant ID', key: 'merchant_id' },
  { header: 'Terminal No', key: 'terminal_no' },
  { header: 'Card ID', key: 'card_id' },
  { header: 'Transaction Code', key: 'transaction_code' },
  { header: 'Approval Code', key: 'approval_code' },
  { header: 'Invoice no', key: 'invoice_no' },
  { header: 'Echo Data Field', key: 'echo_data_field' },
  { header: 'Dist Client Code', key: 'dist_client_code' },
  { header: 'Dist Resp Code', key: 'dist_resp_code' },
  { header: 'Dist Service Line Code', key: 'dist_service_line_code' },
  { header: 'Dist Stob Code', key: 'dist_stob_code' },
  { header: 'Dist Project Code', key: 'dist_project_code' },
  { header: 'Dist Location Code', key: 'dist_location_code' },
  { header: 'Dist Future Code', key: 'dist_future_code' }
];
export enum Report {
  DAILY_SUMMARY = 'Daily Summary',
  DETAILED_REPORT = 'Reconciliation Details'
}