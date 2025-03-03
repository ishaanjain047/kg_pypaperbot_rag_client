import { useState, useEffect, useRef } from "react";

// Base API URL
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Custom hook for handling EventSource connections with reconnection logic
 * @param {string} url - The URL to connect to
 * @returns {Object} - Event data, connection status, and control functions
 */
const useEventSource = (url) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("connecting");
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  useEffect(() => {
    if (!url) {
      setStatus("disconnected");
      return;
    }

    const createEventSource = () => {
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Create EventSource connection with the complete URL
      const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
      console.log("Connecting to EventSource at:", fullUrl);

      try {
        const eventSource = new EventSource(fullUrl, { withCredentials: true });
        eventSourceRef.current = eventSource;
        setStatus("connecting");

        // Event handlers
        eventSource.onopen = () => {
          console.log("EventSource connection opened");
          setStatus("open");
          reconnectAttemptsRef.current = 0; // Reset counter on successful connection
        };

        eventSource.onerror = (error) => {
          console.error("EventSource error:", error);
          setStatus("error");

          // Close the current connection
          eventSource.close();

          // Try to reconnect if we haven't exceeded max attempts
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            console.log(
              `Reconnection attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in 3 seconds...`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              createEventSource();
            }, 3000); // Try to reconnect after 3 seconds
          } else {
            console.log("Max reconnection attempts reached");
          }
        };

        eventSource.onmessage = (event) => {
          try {
            console.log("Raw event data received:", event.data);
            const parsedData = JSON.parse(event.data);
            console.log("Parsed event data:", parsedData);
            setData(parsedData);
          } catch (error) {
            console.error("Error parsing event data:", error);
          }
        };
      } catch (err) {
        console.error("Error creating EventSource:", err);
        setStatus("error");
      }
    };

    createEventSource();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        console.log("Closing EventSource connection");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      setStatus("closed");
    };
  }, [url]);

  const attemptReconnection = () => {
    console.log("Manual reconnection attempt");
    reconnectAttemptsRef.current = 0; // Reset counter

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Force immediate reconnection
    if (url) {
      const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
      try {
        const eventSource = new EventSource(fullUrl, { withCredentials: true });
        eventSourceRef.current = eventSource;
        setStatus("connecting");

        eventSource.onopen = () => {
          console.log("EventSource connection reopened");
          setStatus("open");
        };

        eventSource.onerror = (error) => {
          console.error("EventSource reconnection error:", error);
          setStatus("error");
          eventSource.close();
        };

        eventSource.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            setData(parsedData);
          } catch (error) {
            console.error("Error parsing event data:", error);
          }
        };
      } catch (err) {
        console.error("Error during manual reconnection:", err);
        setStatus("error");
      }
    }
  };

  return {
    data,
    status,
    close: () => eventSourceRef.current?.close(),
    reconnect: attemptReconnection,
  };
};

export default useEventSource;
export { API_BASE_URL };
