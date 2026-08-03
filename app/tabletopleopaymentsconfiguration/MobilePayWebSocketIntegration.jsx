"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Custom Hook for WebSocket integration with MobilePay payments
 * Provides real-time updates for payment status, dashboard, and tracking
 */
export const useMobilePayWebSocket = (
  orderId,
  businessId,
  onPaymentUpdate,
  onOrderStatusUpdate
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const connectWebSocket = useCallback(() => {
    try {
      // Determine WS protocol based on location
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/mobilepay/${businessId}/${orderId}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected for MobilePay", { orderId, businessId });
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Send subscription message
        wsRef.current?.send(
          JSON.stringify({
            type: "SUBSCRIBE",
            orderId,
            businessId,
            timestamp: new Date().toISOString(),
          })
        );
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("MobilePay WebSocket message received:", data);

          setLastUpdate({
            type: data.type,
            data: data,
            timestamp: new Date(),
          });

          // Handle different message types
          switch (data.type) {
            case "PAYMENT_RESERVED":
              // Payment has been reserved on customer's MobilePay account
              onPaymentUpdate?.({
                status: "RESERVED",
                paymentReference: data.paymentReference,
                amount: data.amount,
                currency: data.currency,
                timestamp: data.timestamp,
              });
              break;

            case "PAYMENT_CAPTURED":
              // Payment has been successfully captured
              onPaymentUpdate?.({
                status: "CAPTURED",
                paymentReference: data.paymentReference,
                transactionId: data.transactionId,
                amount: data.amount,
                currency: data.currency,
                timestamp: data.timestamp,
              });
              break;

            case "PAYMENT_CANCELLED":
              // Payment was cancelled
              onPaymentUpdate?.({
                status: "CANCELLED",
                paymentReference: data.paymentReference,
                reason: data.reason,
                timestamp: data.timestamp,
              });
              break;

            case "PAYMENT_FAILED":
              // Payment failed
              onPaymentUpdate?.({
                status: "FAILED",
                paymentReference: data.paymentReference,
                errorMessage: data.errorMessage,
                timestamp: data.timestamp,
              });
              break;

            case "ORDER_STATUS_UPDATE":
              // Order status changed (e.g., Received → Preparing → Cooking → Ready)
              onOrderStatusUpdate?.({
                orderId: data.orderId,
                status: data.status, // RECEIVED, PREPARING, COOKING, READY, DELIVERED
                message: data.message,
                estimatedTime: data.estimatedTime,
                timestamp: data.timestamp,
              });
              break;

            case "PING":
              // Keep-alive ping from server
              wsRef.current?.send(
                JSON.stringify({
                  type: "PONG",
                  timestamp: new Date().toISOString(),
                })
              );
              break;

            default:
              console.warn("Unknown WebSocket message type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Attempt reconnection
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1;
          console.log(
            `Attempting to reconnect... (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`
          );
          setTimeout(connectWebSocket, RECONNECT_DELAY);
        } else {
          console.error("Max reconnection attempts reached");
        }
      };
    } catch (error) {
      console.error("Error establishing WebSocket connection:", error);
      setIsConnected(false);
    }
  }, [orderId, businessId, onPaymentUpdate, onOrderStatusUpdate]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          ...message,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.warn("WebSocket is not open");
    }
  }, []);

  return {
    isConnected,
    lastUpdate,
    sendMessage,
  };
};

/**
 * Component for displaying real-time payment updates
 */
export const MobilePayUpdateNotification = ({ update, isConnected }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (update) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [update]);

  if (!visible || !update) return null;

  const getStyleByStatus = (status) => {
    switch (status) {
      case "RESERVED":
        return { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" };
      case "CAPTURED":
        return { bg: "#dcfce7", border: "#16a34a", text: "#15803d" };
      case "CANCELLED":
        return { bg: "#fed7aa", border: "#f97316", text: "#9a3412" };
      case "FAILED":
        return { bg: "#fee2e2", border: "#dc2626", text: "#991b1b" };
      default:
        return { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" };
    }
  };

  const style = getStyleByStatus(update.data?.status);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        color: style.text,
        fontFamily: "system-ui, sans-serif",
        fontSize: 14,
        fontWeight: 500,
        maxWidth: 300,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <div style={{ marginBottom: 4 }}>{update.data?.status || "Update"}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        {update.data?.message || update.data?.paymentReference}
      </div>
      {!isConnected && (
        <div
          style={{
            fontSize: 11,
            marginTop: 8,
            opacity: 0.7,
            fontStyle: "italic",
          }}
        >
          (Offline mode - updates may be delayed)
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Backend Controller for WebSocket endpoints
 * Add this to: src/main/java/com/backendDev/controller/MobilePayWebSocketController.java
 */
const WEBSOCKET_CONTROLLER_CODE = `
package com.backendDev.controller;

import com.backendDev.service.MobilePayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;

@Controller
@Slf4j
@RequiredArgsConstructor
public class MobilePayWebSocketController implements WebSocketMessageBrokerConfigurer {

    private final SimpMessagingTemplate messagingTemplate;
    private final MobilePayService mobilePayService;

    /**
     * Handle WebSocket subscription
     * URL: ws://localhost:8080/ws/mobilepay/{businessId}/{orderId}
     */
    @MessageMapping("/mobilepay/{businessId}/{orderId}")
    @SendToUser("/queue/payments")
    public void subscribeToPaymentUpdates(
            @Payload Map<String, String> payload,
            Principal principal) {

        String businessId = payload.get("businessId");
        String orderId = payload.get("orderId");

        log.info("Customer subscribed to payment updates: orderId={}, businessId={}", orderId, businessId);

        // Send acknowledgment
        sendPaymentUpdate(businessId, orderId, Map.of(
                "type", "SUBSCRIPTION_CONFIRMED",
                "message", "Connected to payment updates",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    /**
     * Send payment update to connected WebSocket clients
     */
    public void sendPaymentUpdate(String businessId, String orderId, Map<String, Object> update) {
        String destination = "/user/" + orderId + "/queue/payments";
        messagingTemplate.convertAndSendToUser(
                orderId,
                "/queue/payments",
                update
        );

        log.debug("Sent payment update: orderId={}, update={}", orderId, update);
    }

    /**
     * Send order status update to connected clients
     */
    public void sendOrderStatusUpdate(String businessId, String orderId, Map<String, Object> update) {
        messagingTemplate.convertAndSendToUser(
                orderId,
                "/queue/order-status",
                update
        );

        log.debug("Sent order status update: orderId={}, update={}", orderId, update);
    }

    /**
     * Broadcast payment update to admin dashboard
     */
    public void broadcastAdminUpdate(String businessId, String adminId, Map<String, Object> update) {
        messagingTemplate.convertAndSendToUser(
                adminId,
                "/queue/admin-payments/" + businessId,
                update
        );

        log.debug("Sent admin update: adminId={}, businessId={}", adminId, businessId);
    }
}
`;

/**
 * WebSocket Configuration for Spring Boot
 * Add this to: src/main/java/com/backendDev/config/WebSocketConfig.java
 */
const WEBSOCKET_CONFIG_CODE = `
package com.backendDev.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/user", "/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/mobilepay/**")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
`;

/**
 * Usage Example in React Component
 */
const USAGE_EXAMPLE = `
import { useMobilePayWebSocket, MobilePayUpdateNotification } from "@/components/MobilePayWebSocketIntegration";

export default function CustomerTrackingPage() {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  const { isConnected, lastUpdate, sendMessage } = useMobilePayWebSocket(
    orderId,
    businessId,
    (paymentUpdate) => {
      setPaymentStatus(paymentUpdate);
      // Handle payment update
      if (paymentUpdate.status === "CAPTURED") {
        // Payment successful, update UI
      }
    },
    (orderUpdate) => {
      setOrderStatus(orderUpdate);
      // Handle order status update
    }
  );

  return (
    <div>
      <h2>Your Order Status</h2>
      <p>Order: {orderStatus?.status}</p>
      
      {/* Show real-time updates */}
      <MobilePayUpdateNotification 
        update={lastUpdate} 
        isConnected={isConnected} 
      />
    </div>
  );
}
`;

export default {
  WEBSOCKET_CONTROLLER_CODE,
  WEBSOCKET_CONFIG_CODE,
  USAGE_EXAMPLE,
};
