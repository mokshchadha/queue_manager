// scripts/setup-mysql.js
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const dbConfig = {
  host: process.env.WRITERDBHOST || "35.238.92.232",
  user: process.env.DBUSER || "root",
  password: process.env.DBPASS || ":yFHmzfz&9vfdC,&",
  database: process.env.DATABASE || "dev",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  multipleStatements: true
};

async function setupMySQLTables() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL successfully!');

    // Step 1: Create the order_change_log table if not exists
    await createOrderChangeLogTable(connection);
    
    // Step 2: Create triggers with proper existence checking
    await createOrderTriggers(connection);
    
    // Step 3: Create procedures and events
    await createProceduresAndEvents(connection);
    
    // Step 4: Verify setup
    await verifySetup(connection);

    console.log('🎉 MySQL setup completed successfully!');
    
  } catch (error) {
    console.error('❌ MySQL setup failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL connection closed');
    }
  }
}

async function createOrderChangeLogTable(connection) {
  console.log('🔄 Creating order_change_log table...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS order_change_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      table_name VARCHAR(50) NOT NULL DEFAULT 'Orders',
      operation ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
      order_id INT NOT NULL,
      old_data JSON NULL,
      new_data JSON NULL,
      changed_fields JSON NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed TINYINT(1) DEFAULT 0,
      processed_at DATETIME NULL,
      INDEX idx_processed_timestamp (processed, timestamp),
      INDEX idx_order_id (order_id),
      INDEX idx_operation (operation)
    )
  `;
  
  try {
    await connection.execute(createTableSQL);
    console.log('✅ order_change_log table ready');
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    throw error;
  }
}

async function triggerExists(connection, triggerName) {
  try {
    const [rows] = await connection.execute(
      'SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_NAME = ? AND TRIGGER_SCHEMA = ?',
      [triggerName, dbConfig.database]
    );
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking trigger ${triggerName}:`, error.message);
    return false;
  }
}

async function createOrderTriggers(connection) {
  console.log('🔄 Setting up order triggers...');
  
  const triggers = [
    {
      name: 'order_insert_trigger',
      sql: `
        CREATE TRIGGER order_insert_trigger
        AFTER INSERT ON Orders
        FOR EACH ROW
        BEGIN
          INSERT INTO order_change_log (
            operation, 
            order_id, 
            new_data, 
            timestamp
          )
          VALUES (
            'INSERT', 
            NEW.Order_ID, 
            JSON_OBJECT(
              'Order_ID', NEW.Order_ID,
              'Property_ID', NEW.Property_ID,
              'Customer_ID', NEW.Customer_ID,
              'Abstrator_ID', NEW.Abstrator_ID,
              'Organization_ID', NEW.Organization_ID,
              'Order_Status', NEW.Order_Status,
              'Order_Custom_Price', NEW.Order_Custom_Price,
              'Order_Final_Price', NEW.Order_Final_Price,
              'Order_Creation_Date', NEW.Order_Creation_Date,
              'Order_Modification_Date', NEW.Order_Modification_Date,
              'Order_Completion_Date', NEW.Order_Completion_Date,
              'Order_ETA', NEW.Order_ETA,
              'Order_Priority', NEW.Order_Priority,
              'Order_Is_Quote', NEW.Order_Is_Quote,
              'Order_Billed', NEW.Order_Billed,
              'Latest_Note', NEW.Latest_Note
            ),
            NOW()
          );
        END
      `
    },
    {
      name: 'order_update_trigger',
      sql: `
        CREATE TRIGGER order_update_trigger
        AFTER UPDATE ON Orders
        FOR EACH ROW
        BEGIN
          DECLARE changed_fields_json JSON DEFAULT JSON_OBJECT();
          
          -- Check which fields changed and build the changed_fields JSON
          IF OLD.Order_Status != NEW.Order_Status THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Order_Status', JSON_OBJECT('old', OLD.Order_Status, 'new', NEW.Order_Status));
          END IF;
          
          IF OLD.Customer_ID != NEW.Customer_ID OR (OLD.Customer_ID IS NULL AND NEW.Customer_ID IS NOT NULL) OR (OLD.Customer_ID IS NOT NULL AND NEW.Customer_ID IS NULL) THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Customer_ID', JSON_OBJECT('old', OLD.Customer_ID, 'new', NEW.Customer_ID));
          END IF;
          
          IF OLD.Abstrator_ID != NEW.Abstrator_ID OR (OLD.Abstrator_ID IS NULL AND NEW.Abstrator_ID IS NOT NULL) OR (OLD.Abstrator_ID IS NOT NULL AND NEW.Abstrator_ID IS NULL) THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Abstrator_ID', JSON_OBJECT('old', OLD.Abstrator_ID, 'new', NEW.Abstrator_ID));
          END IF;
          
          IF OLD.Order_Final_Price != NEW.Order_Final_Price OR (OLD.Order_Final_Price IS NULL AND NEW.Order_Final_Price IS NOT NULL) OR (OLD.Order_Final_Price IS NOT NULL AND NEW.Order_Final_Price IS NULL) THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Order_Final_Price', JSON_OBJECT('old', OLD.Order_Final_Price, 'new', NEW.Order_Final_Price));
          END IF;
          
          IF OLD.Order_ETA != NEW.Order_ETA OR (OLD.Order_ETA IS NULL AND NEW.Order_ETA IS NOT NULL) OR (OLD.Order_ETA IS NOT NULL AND NEW.Order_ETA IS NULL) THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Order_ETA', JSON_OBJECT('old', OLD.Order_ETA, 'new', NEW.Order_ETA));
          END IF;
          
          IF OLD.Order_Completion_Date != NEW.Order_Completion_Date OR (OLD.Order_Completion_Date IS NULL AND NEW.Order_Completion_Date IS NOT NULL) OR (OLD.Order_Completion_Date IS NOT NULL AND NEW.Order_Completion_Date IS NULL) THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Order_Completion_Date', JSON_OBJECT('old', OLD.Order_Completion_Date, 'new', NEW.Order_Completion_Date));
          END IF;
          
          IF OLD.Order_Priority != NEW.Order_Priority OR (OLD.Order_Priority IS NULL AND NEW.Order_Priority IS NOT NULL) OR (OLD.Order_Priority IS NOT NULL AND NEW.Order_Priority IS NULL) THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Order_Priority', JSON_OBJECT('old', OLD.Order_Priority, 'new', NEW.Order_Priority));
          END IF;
          
          IF OLD.Order_Billed != NEW.Order_Billed OR (OLD.Order_Billed IS NULL AND NEW.Order_Billed IS NOT NULL) OR (OLD.Order_Billed IS NOT NULL AND NEW.Order_Billed IS NULL) THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Order_Billed', JSON_OBJECT('old', OLD.Order_Billed, 'new', NEW.Order_Billed));
          END IF;
          
          IF OLD.Latest_Note != NEW.Latest_Note OR (OLD.Latest_Note IS NULL AND NEW.Latest_Note IS NOT NULL) OR (OLD.Latest_Note IS NOT NULL AND NEW.Latest_Note IS NULL) THEN
            SET changed_fields_json = JSON_SET(changed_fields_json, '$.Latest_Note', JSON_OBJECT('old', OLD.Latest_Note, 'new', NEW.Latest_Note));
          END IF;
          
          -- Only insert if there are actual changes
          IF JSON_LENGTH(changed_fields_json) > 0 THEN
            INSERT INTO order_change_log (
              operation, 
              order_id, 
              old_data,
              new_data,
              changed_fields,
              timestamp
            )
            VALUES (
              'UPDATE', 
              NEW.Order_ID,
              JSON_OBJECT(
                'Order_ID', OLD.Order_ID,
                'Property_ID', OLD.Property_ID,
                'Customer_ID', OLD.Customer_ID,
                'Abstrator_ID', OLD.Abstrator_ID,
                'Organization_ID', OLD.Organization_ID,
                'Order_Status', OLD.Order_Status,
                'Order_Custom_Price', OLD.Order_Custom_Price,
                'Order_Final_Price', OLD.Order_Final_Price,
                'Order_Creation_Date', OLD.Order_Creation_Date,
                'Order_Modification_Date', OLD.Order_Modification_Date,
                'Order_Completion_Date', OLD.Order_Completion_Date,
                'Order_ETA', OLD.Order_ETA,
                'Order_Priority', OLD.Order_Priority,
                'Order_Is_Quote', OLD.Order_Is_Quote,
                'Order_Billed', OLD.Order_Billed,
                'Latest_Note', OLD.Latest_Note
              ),
              JSON_OBJECT(
                'Order_ID', NEW.Order_ID,
                'Property_ID', NEW.Property_ID,
                'Customer_ID', NEW.Customer_ID,
                'Abstrator_ID', NEW.Abstrator_ID,
                'Organization_ID', NEW.Organization_ID,
                'Order_Status', NEW.Order_Status,
                'Order_Custom_Price', NEW.Order_Custom_Price,
                'Order_Final_Price', NEW.Order_Final_Price,
                'Order_Creation_Date', NEW.Order_Creation_Date,
                'Order_Modification_Date', NEW.Order_Modification_Date,
                'Order_Completion_Date', NEW.Order_Completion_Date,
                'Order_ETA', NEW.Order_ETA,
                'Order_Priority', NEW.Order_Priority,
                'Order_Is_Quote', NEW.Order_Is_Quote,
                'Order_Billed', NEW.Order_Billed,
                'Latest_Note', NEW.Latest_Note
              ),
              changed_fields_json,
              NOW()
            );
          END IF;
        END
      `
    },
    {
      name: 'order_delete_trigger',
      sql: `
        CREATE TRIGGER order_delete_trigger
        AFTER DELETE ON Orders
        FOR EACH ROW
        BEGIN
          INSERT INTO order_change_log (
            operation, 
            order_id, 
            old_data,
            timestamp
          )
          VALUES (
            'DELETE', 
            OLD.Order_ID,
            JSON_OBJECT(
              'Order_ID', OLD.Order_ID,
              'Property_ID', OLD.Property_ID,
              'Customer_ID', OLD.Customer_ID,
              'Abstrator_ID', OLD.Abstrator_ID,
              'Organization_ID', OLD.Organization_ID,
              'Order_Status', OLD.Order_Status,
              'Order_Custom_Price', OLD.Order_Custom_Price,
              'Order_Final_Price', OLD.Order_Final_Price,
              'Order_Creation_Date', OLD.Order_Creation_Date,
              'Order_Modification_Date', OLD.Order_Modification_Date,
              'Order_Completion_Date', OLD.Order_Completion_Date,
              'Order_ETA', OLD.Order_ETA,
              'Order_Priority', OLD.Order_Priority,
              'Order_Is_Quote', OLD.Order_Is_Quote,
              'Order_Billed', OLD.Order_Billed,
              'Latest_Note', OLD.Latest_Note
            ),
            NOW()
          );
        END
      `
    }
  ];

  for (const trigger of triggers) {
    try {
      const exists = await triggerExists(connection, trigger.name);
      
      if (exists) {
        console.log(`⚠️  Trigger ${trigger.name} already exists, dropping and recreating...`);
        await connection.query(`DROP TRIGGER IF EXISTS ${trigger.name}`);
      }
      
      console.log(`🔄 Creating trigger ${trigger.name}...`);
      await connection.query(trigger.sql);
      console.log(`✅ Trigger ${trigger.name} created successfully`);
      
    } catch (error) {
      console.error(`❌ Error creating trigger ${trigger.name}:`, error.message);
      throw error;
    }
  }
}

async function triggerExists(connection, triggerName) {
  try {
    const [rows] = await connection.execute(
      'SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_NAME = ? AND TRIGGER_SCHEMA = ?',
      [triggerName, dbConfig.database]
    );
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking trigger ${triggerName}:`, error.message);
    return false;
  }
}

async function procedureExists(connection, procedureName) {
  try {
    const [rows] = await connection.execute(
      'SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_NAME = ? AND ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = "PROCEDURE"',
      [procedureName, dbConfig.database]
    );
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking procedure ${procedureName}:`, error.message);
    return false;
  }
}

async function eventExists(connection, eventName) {
  try {
    const [rows] = await connection.execute(
      'SELECT EVENT_NAME FROM information_schema.EVENTS WHERE EVENT_NAME = ? AND EVENT_SCHEMA = ?',
      [eventName, dbConfig.database]
    );
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking event ${eventName}:`, error.message);
    return false;
  }
}

async function createProceduresAndEvents(connection) {
  console.log('🔄 Setting up cleanup procedures and events...');
  
  // Create cleanup procedure
  const procedureName = 'cleanup_order_change_log';
  try {
    const exists = await procedureExists(connection, procedureName);
    
    if (exists) {
      console.log(`⚠️  Procedure ${procedureName} already exists, dropping and recreating...`);
      await connection.query(`DROP PROCEDURE IF EXISTS ${procedureName}`);
    }
    
    const createProcedureSQL = `
      CREATE PROCEDURE cleanup_order_change_log(IN days_to_keep INT DEFAULT 30)
      BEGIN
        DELETE FROM order_change_log 
        WHERE processed = 1 
        AND processed_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
      END
    `;
    
    console.log(`🔄 Creating procedure ${procedureName}...`);
    await connection.query(createProcedureSQL);
    console.log(`✅ Procedure ${procedureName} created successfully`);
    
  } catch (error) {
    console.error(`❌ Error creating procedure ${procedureName}:`, error.message);
    throw error;
  }
  
  // Create cleanup event
  const eventName = 'cleanup_order_logs_event';
  try {
    const exists = await eventExists(connection, eventName);
    
    if (exists) {
      console.log(`⚠️  Event ${eventName} already exists, dropping and recreating...`);
      await connection.query(`DROP EVENT IF EXISTS ${eventName}`);
    }
    
    const createEventSQL = `
      CREATE EVENT cleanup_order_logs_event
      ON SCHEDULE EVERY 1 WEEK
      DO
        CALL cleanup_order_change_log(30)
    `;
    
    console.log(`🔄 Creating event ${eventName}...`);
    await connection.query(createEventSQL);
    console.log(`✅ Event ${eventName} created successfully`);
    
  } catch (error) {
    console.error(`❌ Error creating event ${eventName}:`, error.message);
    // Events might fail if event scheduler is not enabled, so don't throw
    console.log('💡 Note: If event creation failed, you may need to enable the event scheduler with SET GLOBAL event_scheduler = ON;');
  }
}

async function verifySetup(connection) {
  console.log('🔄 Verifying setup...');
  
  // Verify table creation
  try {
    const [tableRows] = await connection.execute('SHOW TABLES LIKE "order_change_log"');
    
    if (tableRows.length > 0) {
      console.log('✅ order_change_log table verified');
      
      // Show table structure
      const [columns] = await connection.execute('DESCRIBE order_change_log');
      console.log('📋 Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
    } else {
      throw new Error('Table verification failed');
    }
  } catch (error) {
    console.error('❌ Table verification failed:', error.message);
    throw error;
  }
  
  // Verify triggers
  try {
    const [triggerRows] = await connection.execute(
      'SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? AND TRIGGER_NAME LIKE "order_%_trigger"',
      [dbConfig.database]
    );
    
    console.log('📋 Active triggers:');
    triggerRows.forEach(trigger => {
      console.log(`   ✅ ${trigger.TRIGGER_NAME}`);
    });
    
    if (triggerRows.length < 3) {
      console.log('⚠️  Warning: Expected 3 triggers but found ' + triggerRows.length);
    }
  } catch (error) {
    console.error('❌ Trigger verification failed:', error.message);
  }
  
  // Verify procedures
  try {
    const [procedureRows] = await connection.execute(
      'SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME = "cleanup_order_change_log"',
      [dbConfig.database]
    );
    
    if (procedureRows.length > 0) {
      console.log('✅ cleanup_order_change_log procedure verified');
    }
  } catch (error) {
    console.error('❌ Procedure verification failed:', error.message);
  }
  
  // Verify events
  try {
    const [eventRows] = await connection.execute(
      'SELECT EVENT_NAME FROM information_schema.EVENTS WHERE EVENT_SCHEMA = ? AND EVENT_NAME = "cleanup_order_logs_event"',
      [dbConfig.database]
    );
    
    if (eventRows.length > 0) {
      console.log('✅ cleanup_order_logs_event verified');
    }
  } catch (error) {
    console.error('❌ Event verification failed:', error.message);
  }
}

// Utility function to test the triggers (optional)
async function testTriggers(connection) {
  console.log('🧪 Testing triggers...');
  
  try {
    // Check if we can insert a test log entry
    const [testRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM order_change_log'
    );
    console.log(`📊 Current log entries: ${testRows[0].count}`);
    
    console.log('✅ Triggers are ready for testing');
  } catch (error) {
    console.error('❌ Trigger test failed:', error.message);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupMySQLTables()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  setupMySQLTables, 
  createOrderChangeLogTable,
  createOrderTriggers,
  createProceduresAndEvents,
  testTriggers
};