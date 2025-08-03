-- Create the order_change_log table
CREATE TABLE order_change_log (
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
);

-- Trigger for INSERT operations
DELIMITER $
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
END$

-- Trigger for UPDATE operations
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
END$

-- Trigger for DELETE operations
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
END$

DELIMITER ;

-- Optional: Create a cleanup procedure to remove old processed logs
DELIMITER $$
CREATE PROCEDURE cleanup_order_change_log(IN days_to_keep INT DEFAULT 30)
BEGIN
    DELETE FROM order_change_log 
    WHERE processed = 1 
    AND processed_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
END$$
DELIMITER ;

-- Optional: Create an event to auto-cleanup old logs weekly
CREATE EVENT cleanup_order_logs_event
ON SCHEDULE EVERY 1 WEEK
DO
    CALL cleanup_order_change_log(30);