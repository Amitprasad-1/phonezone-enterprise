package com.phonezone.service;

import com.phonezone.model.Sale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.List;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(String customerEmail, String customerName, String orderId, List<Sale> items) {
        StringBuilder emailBody = new StringBuilder();
        emailBody.append("<html><body style='font-family: Arial, sans-serif; color: #333;'>");
        emailBody.append("<div style='max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;'>");
        emailBody.append("<h2 style='color: #8b5cf6;'>PhoneZone Order Confirmation</h2>");
        emailBody.append("<p>Dear <strong>").append(customerName).append("</strong>,</p>");
        emailBody.append("<p>Thank you for shopping at PhoneZone! Your order has been received and is being processed.</p>");
        emailBody.append("<p><strong>Order ID:</strong> ").append(orderId).append("</p>");
        emailBody.append("<p><strong>Order Date:</strong> ").append(new Date().toString()).append("</p>");
        emailBody.append("<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>");
        emailBody.append("<h3>Consignment Items:</h3>");
        emailBody.append("<table style='width: 100%; border-collapse: collapse;'>");
        emailBody.append("<thead><tr style='border-bottom: 2px solid #eee;'>");
        emailBody.append("<th style='text-align: left; padding: 8px;'>Item</th>");
        emailBody.append("<th style='text-align: left; padding: 8px;'>IMEI</th>");
        emailBody.append("<th style='text-align: right; padding: 8px;'>Price</th>");
        emailBody.append("</tr></thead><tbody>");

        double total = 0;
        for (Sale item : items) {
            emailBody.append("<tr style='border-bottom: 1px solid #eee;'>");
            emailBody.append("<td style='padding: 8px;'>").append(item.getBrand()).append(" ").append(item.getModel()).append("</td>");
            emailBody.append("<td style='padding: 8px; font-family: monospace;'>").append(item.getImei()).append("</td>");
            emailBody.append("<td style='padding: 8px; text-align: right;'>INR ").append(String.format("%,.0f", item.getPricePaid())).append("</td>");
            emailBody.append("</tr>");
            total += item.getPricePaid();
        }

        emailBody.append("</tbody></table>");
        emailBody.append("<div style='margin-top: 20px; text-align: right; font-size: 16px; font-weight: bold;'>");
        emailBody.append("Grand Total: INR ").append(String.format("%,.0f", total));
        emailBody.append("</div>");
        emailBody.append("<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>");
        emailBody.append("<p style='font-size: 12px; color: #777;'>Overnight Insured shipping is free. For any questions, please contact help@phonezone.com.</p>");
        emailBody.append("</div></body></html>");

        String body = emailBody.toString();

        // 1. Log offline copy to email_logs.txt in workspace root
        writeToEmailLog(customerEmail, orderId, body);

        // 2. Try sending HTML email via configured JavaMailSender
        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(customerEmail);
                helper.setSubject("PhoneZone Order Confirmation - " + orderId);
                helper.setText(body, true);
                helper.setFrom("sales@phonezone.com");
                mailSender.send(message);
                System.out.println("[EmailService] Real email sent successfully to: " + customerEmail);
            } catch (Exception e) {
                System.err.println("[EmailService] Failed to send real email. Reason: " + e.getMessage());
                System.out.println("[EmailService] Fallback to email_logs.txt active.");
            }
        } else {
            System.out.println("[EmailService] JavaMailSender not configured. Email logged to email_logs.txt only.");
        }
    }

    private void writeToEmailLog(String to, String orderId, String body) {
        // Log to relative path "email_logs.txt" (will create in the root workspace)
        try (FileWriter fw = new FileWriter("email_logs.txt", true);
             PrintWriter pw = new PrintWriter(fw)) {
            pw.println("==========================================================================");
            pw.println("DATE: " + new Date().toString());
            pw.println("TO: " + to);
            pw.println("SUBJECT: PhoneZone Order Confirmation - " + orderId);
            pw.println("BODY:");
            pw.println(body);
            pw.println("==========================================================================");
            pw.println();
            System.out.println("[EmailService] Logged HTML receipt to email_logs.txt for order: " + orderId);
        } catch (IOException e) {
            System.err.println("[EmailService] Failed to write offline email log: " + e.getMessage());
        }
    }
}
