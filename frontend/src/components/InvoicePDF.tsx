import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.cdnfonts.com/s/29107/Helvetica.woff', fontWeight: 'normal' },
    { src: 'https://fonts.cdnfonts.com/s/29107/Helvetica-Bold.woff', fontWeight: 'bold' },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { marginBottom: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  storeName: { fontSize: 18, fontWeight: 'bold', color: '#2d6a4f', marginBottom: 4 },
  storeInfo: { fontSize: 9, color: '#666', marginBottom: 2 },
  invoiceTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  invoiceId: { fontSize: 10, color: '#666', marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#2d6a4f', marginBottom: 8, borderBottom: '1 solid #eee', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { fontSize: 9, color: '#666', width: 80 },
  value: { fontSize: 10, color: '#333' },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#2d6a4f', padding: '6 8', color: '#fff', fontSize: 9, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #eee', padding: '6 8', fontSize: 9 },
  colProduct: { width: '40%' },
  colQty: { width: '15%', textAlign: 'right' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '25%', textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: '6 8', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  paymentRow: { flexDirection: 'row', padding: '4 8', fontSize: 9, borderBottom: '1 solid #eee' },
  paymentColDate: { width: '25%' },
  paymentColMethod: { width: '20%' },
  paymentColAmount: { width: '25%', textAlign: 'right' },
  paymentColRef: { width: '30%', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999', borderTop: '1 solid #eee', paddingTop: 8 },
  balanceDue: { fontSize: 12, fontWeight: 'bold', color: '#c0392b' },
  paidText: { fontSize: 12, fontWeight: 'bold', color: '#27ae60' },
})

interface Props {
  sale: {
    id: number
    customerName: string
    saleDate: string
    totalAmount: number
    paidAmount: number
    status: string
    notes?: string
    items: Array<{
      productName: string
      productUomAbbr: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
    payments: Array<{
      amount: number
      paymentMethod: string
      referenceNo?: string
      createdAt: string
    }>
  }
}

const BUSINESS = {
  name: 'Kaya Agri Trading',
  address: '123 National Highway, Brgy. San Jose',
  city: 'General Santos City, South Cotabato',
  phone: '(083) 555-0123',
  email: 'info@kayaagri.com',
}

function InvoicePDF({ sale }: Props) {
  const balance = sale.totalAmount - sale.paidAmount

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.storeName}>{BUSINESS.name}</Text>
              <Text style={styles.storeInfo}>{BUSINESS.address}</Text>
              <Text style={styles.storeInfo}>{BUSINESS.city}</Text>
              <Text style={styles.storeInfo}>Phone: {BUSINESS.phone}</Text>
              <Text style={styles.storeInfo}>Email: {BUSINESS.email}</Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceId}># {sale.id}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{sale.customerName}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{sale.saleDate}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Status:</Text><Text style={styles.value}>{sale.status}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colProduct}>Product</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colPrice}>Unit Price</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {sale.items.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colProduct}>{item.productName}</Text>
                <Text style={styles.colQty}>{item.quantity} {item.productUomAbbr}</Text>
                <Text style={styles.colPrice}>{item.unitPrice.toFixed(2)}</Text>
                <Text style={styles.colTotal}>{item.totalPrice.toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#f5f5f5', fontWeight: 'bold' }]}>
              <Text style={styles.colProduct} />
              <Text style={styles.colQty} />
              <Text style={styles.colPrice}>Total:</Text>
              <Text style={styles.colTotal}>{sale.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {sale.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payments</Text>
            <View style={styles.table}>
              <View style={[styles.tableHeader, { backgroundColor: '#27ae60' }]}>
                <Text style={styles.paymentColDate}>Date</Text>
                <Text style={styles.paymentColMethod}>Method</Text>
                <Text style={styles.paymentColAmount}>Amount</Text>
                <Text style={styles.paymentColRef}>Reference</Text>
              </View>
              {sale.payments.map((p, i) => (
                <View key={i} style={styles.paymentRow}>
                  <Text style={styles.paymentColDate}>{new Date(p.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.paymentColMethod}>{p.paymentMethod}</Text>
                  <Text style={styles.paymentColAmount}>{p.amount.toFixed(2)}</Text>
                  <Text style={styles.paymentColRef}>{p.referenceNo || '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <View style={styles.totalRow}>
            <Text style={{ width: 100 }}>Total:</Text>
            <Text style={{ width: 80, textAlign: 'right' }}>{sale.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ width: 100 }}>Paid:</Text>
            <Text style={{ width: 80, textAlign: 'right' }}>{sale.paidAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ width: 100 }}>Balance:</Text>
            <Text style={[styles.paidText, balance > 0 ? styles.balanceDue : styles.paidText, { width: 80, textAlign: 'right' }]}>
              {balance > 0 ? balance.toFixed(2) : 'Paid in Full'}
            </Text>
          </View>
        </View>

        {sale.notes && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 9 }}>{sale.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for your business! | {BUSINESS.name} | {BUSINESS.phone}
        </Text>
      </Page>
    </Document>
  )
}

export default InvoicePDF
