// scripts/sync-data.js
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

// MySQL configuration
const mysqlConfig = {
  host: process.env.WRITERDBHOST || "35.238.92.232",
  user: process.env.DBUSER || "root",
  password: process.env.DBPASS || ":yFHmzfz&9vfdC,&",
  database: process.env.DATABASE || "dev",
  port: parseInt(process.env.MYSQL_PORT || "3306")
};

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/queue_manager';

// Order schema for MongoDB (simplified version)
const OrderSchema = new mongoose.Schema({
  order_id: { type: Number, required: true, unique: true },
  property_id: String,
  customer_id: String,
  abstrator_id: String,
  organization_id: String,
  order_status: { type: Number, default: 1 },
  order_custom_price: Number,
  order_final_price: Number,
  order_creation_date: Date,
  order_modification_date: Date,
  order_completion_date: Date,
  order_eta: Date,
  order_priority: Number,
  order_is_quote: Boolean,
  order_billed: Boolean,
  latest_note: String,
  // Additional fields for queue management
  assigned_to: String,
  tagged_users: [String],
  score: { type: Number, default: 0 },
  last_synced: { type: Date, default: Date.now }
}, {
  timestamps: true
});

let Order;

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Create or get the Order model
    Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

async function connectToMySQL() {
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL successfully!');
    return connection;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    throw error;
  }
}

function mapMySQLToMongoDB(mysqlData) {
  // Parse JSON data from MySQL
  const data = typeof mysqlData === 'string' ? JSON.parse(mysqlData) : mysqlData;
  
  return {
    order_id: data.Order_ID,
    property_id: data.Property_ID,
    customer_id: data.Customer_ID,
    abstrator_id: data.Abstrator_ID,
    organization_id: data.Organization_ID,
    order_status: data.Order_Status,
    order_custom_price: data.Order_Custom_Price,
    order_final_price: data.Order_Final_Price,
    order_creation_date: data.Order_Creation_Date ? new Date(data.Order_Creation_Date) : null,
    order_modification_date: data.Order_Modification_Date ? new Date(data.Order_Modification_Date) : null,
    order_completion_date: data.Order_Completion_Date ? new Date(data.Order_Completion_Date) : null,
    order_eta: data.Order_ETA ? new Date(data.Order_ETA) : null,
    order_priority: data.Order_Priority,
    order_is_quote: data.Order_Is_Quote,
    order_billed: data.Order_Billed,
    latest_note: data.Latest_Note,
    last_synced: new Date()
  };
}

async function syncData() {
  let mysqlConnection;
  
  try {
    console.log('🔄 Starting data synchronization...');
    
    // Connect to both databases
    await connectToMongoDB();
    mysqlConnection = await connectToMySQL();
    
    // Fetch unprocessed entries from MySQL
    console.log('🔄 Fetching unprocessed entries from MySQL...');
    const [rows] = await mysqlConnection.execute(
      'SELECT * FROM order_change_log WHERE processed = 0 ORDER BY timestamp ASC'
    );
    
    console.log(`📊 Found ${rows.length} unprocessed entries`);
    
    if (rows.length === 0) {
      console.log('✅ No new data to sync');
      return;
    }
    
    let syncedCount = 0;
    let errorCount = 0;
    const processedIds = [];
    
    for (const row of rows) {
      try {
        let orderData;
        
        // Handle different operations
        switch (row.operation) {
          case 'INSERT':
            if (row.new_data) {
              orderData = mapMySQLToMongoDB(row.new_data);
              await Order.findOneAndUpdate(
                { order_id: orderData.order_id },
                orderData,
                { upsert: true, new: true }
              );
              console.log(`✅ Inserted/Updated order ${orderData.order_id}`);
            }
            break;
            
          case 'UPDATE':
            if (row.new_data) {
              orderData = mapMySQLToMongoDB(row.new_data);
              const result = await Order.findOneAndUpdate(
                { order_id: orderData.order_id },
                orderData,
                { new: true }
              );
              
              if (result) {
                console.log(`✅ Updated order ${orderData.order_id}`);
              } else {
                console.log(`⚠️  Order ${orderData.order_id} not found, creating new`);
                await Order.create(orderData);
              }
            }
            break;
            
          case 'DELETE':
            if (row.old_data) {
              const oldData = JSON.parse(row.old_data);
              await Order.findOneAndDelete({ order_id: oldData.Order_ID });
              console.log(`🗑️  Deleted order ${oldData.Order_ID}`);
            }
            break;
            
          default:
            console.log(`⚠️  Unknown operation: ${row.operation}`);
        }
        
        syncedCount++;
        processedIds.push(row.id);
        
      } catch (error) {
        console.error(`❌ Error processing row ${row.id}:`, error.message);
        errorCount++;
      }
    }
    
    // Mark processed entries as processed
    if (processedIds.length > 0) {
      console.log('🔄 Marking entries as processed...');
      await mysqlConnection.execute(
        `UPDATE order_change_log SET processed = 1, processed_at = NOW() WHERE id IN (${processedIds.join(',')})`
      );
    }
    
    console.log('🎉 Data synchronization completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total entries: ${rows.length}`);
    console.log(`   - Successfully synced: ${syncedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Data synchronization failed:', error);
    throw error;
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('🔌 MySQL connection closed');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Function to run continuous sync (for cron jobs or intervals)
async function continuousSync(intervalMinutes = 5) {
  console.log(`🔄 Starting continuous sync every ${intervalMinutes} minutes...`);
  
  const runSync = async () => {
    try {
      await syncData();
    } catch (error) {
      console.error('❌ Sync failed, will retry on next interval:', error.message);
    }
  };
  
  // Run immediately
  await runSync();
  
  // Schedule recurring sync
  setInterval(runSync, intervalMinutes * 60 * 1000);
}

// Run the sync if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const isContinuous = args.includes('--continuous');
  const interval = args.find(arg => arg.startsWith('--interval='))?.split('=')[1] || 5;
  
  if (isContinuous) {
    continuousSync(parseInt(interval))
      .catch((error) => {
        console.error('❌ Continuous sync failed:', error);
        process.exit(1);
      });
  } else {
    syncData()
      .then(() => {
        console.log('✅ Sync completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Sync failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { syncData, continuousSync };