package com.phonezone.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class ApiKeyFilter implements Filter {

    @Value("${phonezone.api.key:8080}")
    private String apiKey;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Support CORS headers on unauthorized responses so browser does not block the error details
        String origin = httpRequest.getHeader("Origin");
        if (origin != null) {
            httpResponse.setHeader("Access-Control-Allow-Origin", origin);
            httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            httpResponse.setHeader("Access-Control-Allow-Headers", "*");
            httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
        }

        String method = httpRequest.getMethod();
        
        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Guard POST, PUT, DELETE mutating requests (except public checkout purchase endpoints)
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
            String uri = httpRequest.getRequestURI();
            
            // Allow public checkouts and public review submissions, but guard status updates and inventory writes
            boolean isPublicPurchase = uri.contains("/api/products/purchase") && !uri.contains("/api/products/purchase/status");
            boolean isPublicReviewSubmit = uri.contains("/api/reviews");
            
            if (!isPublicPurchase && !isPublicReviewSubmit) {
                String clientKey = httpRequest.getHeader("X-API-KEY");
                
                if (clientKey == null || !clientKey.equals(apiKey)) {
                    httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    httpResponse.setContentType("application/json");
                    httpResponse.getWriter().write("{\"error\": \"Unauthorized: Missing or invalid API key.\"}");
                    return;
                }
            }
        }

        chain.doFilter(request, response);
    }
}
