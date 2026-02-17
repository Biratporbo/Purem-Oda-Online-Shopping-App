import java.io.*;
import java.util.*;

/**
 * OrderProcessor - Handles business logic for order processing
 * Processes orders, calculates totals, applies discounts, and computes taxes
 */
public class OrderProcessor {
    
    private static final double TAX_RATE = 0.08; // 8% tax
    private static final double BULK_DISCOUNT_THRESHOLD = 100.0;
    private static final double BULK_DISCOUNT_RATE = 0.10; // 10% discount for orders > $100
    
    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.err.println("Usage: OrderProcessor <command>");
            System.exit(1);
        }
        
        String command = args[0];
        
        switch (command) {
            case "calculate":
                if (args.length < 2) {
                    System.err.println("Usage: OrderProcessor calculate <json_string>");
                    System.exit(1);
                }
                handleCalculateOrder(args[1]);
                break;
                
            case "validate":
                if (args.length < 2) {
                    System.err.println("Usage: OrderProcessor validate <json_string>");
                    System.exit(1);
                }
                handleValidateOrder(args[1]);
                break;
                
            default:
                System.err.println("Unknown command: " + command);
                System.exit(1);
        }
    }
    
    /**
     * Calculate order total with tax and discounts
     * Input JSON format: {"items": [{"price": 50, "quantity": 2}]}
     */
    private static void handleCalculateOrder(String jsonInput) {
        try {
            // Simple JSON parsing (without external libraries)
            double subtotal = parseSubtotal(jsonInput);
            double discountAmount = 0.0;
            
            // Apply bulk discount
            if (subtotal > BULK_DISCOUNT_THRESHOLD) {
                discountAmount = subtotal * BULK_DISCOUNT_RATE;
            }
            
            double afterDiscount = subtotal - discountAmount;
            double tax = afterDiscount * TAX_RATE;
            double total = afterDiscount + tax;
            
            // Output JSON result
            System.out.println("{\"success\": true, \"subtotal\": " + subtotal + 
                             ", \"discount\": " + discountAmount + 
                             ", \"tax\": " + tax + 
                             ", \"total\": " + total + "}");
        } catch (Exception e) {
            System.out.println("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
            System.exit(1);
        }
    }
    
    /**
     * Validate order before processing
     */
    private static void handleValidateOrder(String jsonInput) {
        try {
            if (!jsonInput.contains("\"items\"")) {
                throw new Exception("Missing items array");
            }
            if (!jsonInput.contains("\"customerId\"")) {
                throw new Exception("Missing customerId");
            }
            
            double subtotal = parseSubtotal(jsonInput);
            if (subtotal <= 0) {
                throw new Exception("Order total must be greater than 0");
            }
            
            System.out.println("{\"success\": true, \"message\": \"Order is valid\"}");
        } catch (Exception e) {
            System.out.println("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
            System.exit(1);
        }
    }
    
    /**
     * Extract and calculate subtotal from JSON string
     */
    private static double parseSubtotal(String json) throws Exception {
        double total = 0.0;
        
        String itemsSection = json.substring(json.indexOf("["), json.lastIndexOf("]") + 1);
        String[] items = itemsSection.split("\\{");
        
        for (String item : items) {
            if (item.isEmpty()) continue;
            
            // Extract price
            int priceIdx = item.indexOf("\"price\":");
            if (priceIdx == -1) continue;
            
            int commaIdx = item.indexOf(",", priceIdx);
            int braceIdx = item.indexOf("}", priceIdx);
            int endIdx = (commaIdx != -1 && commaIdx < braceIdx) ? commaIdx : braceIdx;
            
            String priceStr = item.substring(priceIdx + 8, endIdx).trim();
            double price = Double.parseDouble(priceStr);
            
            // Extract quantity
            int qtyIdx = item.indexOf("\"quantity\":");
            if (qtyIdx == -1) {
                total += price;
            } else {
                commaIdx = item.indexOf(",", qtyIdx);
                braceIdx = item.indexOf("}", qtyIdx);
                endIdx = (commaIdx != -1 && commaIdx < braceIdx) ? commaIdx : braceIdx;
                
                String qtyStr = item.substring(qtyIdx + 11, endIdx).trim();
                int quantity = Integer.parseInt(qtyStr);
                total += price * quantity;
            }
        }
        
        return Math.round(total * 100.0) / 100.0;
    }
}
