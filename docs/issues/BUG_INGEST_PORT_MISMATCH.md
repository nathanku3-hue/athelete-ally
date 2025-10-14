# Bug Report: Ingest Service Port Mismatch in Smoke Tests

## 🐛 **Issue Summary**
Smoke tests expect BFF service on port 4000, but ingest service is running on port 4101, causing test failures.

## 📋 **Details**

### **Expected Behavior**
- Smoke tests should connect to the correct service port
- Health checks should pass for running services

### **Actual Behavior**
- Smoke test tries to connect to `http://localhost:4000/api/health`
- Ingest service is running on `http://localhost:4101/health`
- Connection fails with `ECONNREFUSED` error

### **Root Cause**
Service port configuration mismatch between:
- Smoke test configuration: `SMOKE_BASE_URL=http://localhost:4000`
- Actual ingest service: Running on port 4101

## 🔍 **Evidence**

### **Service Status**
```bash
# Ingest service is healthy on port 4101
curl http://localhost:4101/health
# Response: {"status":"healthy","service":"ingest","timestamp":"2025-10-01T15:42:51.246Z","eventBus":"connected"}

# Smoke test fails on port 4000
curl http://localhost:4000/api/health
# Error: Failed to connect to localhost port 4000
```

### **Port Analysis**
```bash
netstat -an | Select-String -Pattern "4101|4000"
# Output: TCP 0.0.0.0:4101 0.0.0.0:0 LISTENING
# No service listening on port 4000
```

## 🎯 **Impact**
- Smoke tests fail during post-merge verification
- Cannot verify end-to-end functionality
- Blocks deployment confidence

## 🔧 **Proposed Solutions**

### **Option 1: Update Smoke Test Configuration**
```bash
# Use correct port for ingest service
SMOKE_BASE_URL=http://localhost:4101 npm run smoke:alpha
```

### **Option 2: Start BFF Service**
- Start the BFF service on port 4000
- Ensure proper service orchestration

### **Option 3: Port Standardization**
- Standardize all services to use consistent ports
- Update documentation and configurations

## 📊 **Priority**
**Medium** - Affects testing but doesn't impact core functionality

## 🏷️ **Labels**
- `bug`
- `testing`
- `infrastructure`
- `port-configuration`

## 📝 **Notes**
- Ingest service is healthy and functional
- EventBus connection is working correctly
- Issue is purely configuration-related
- No impact on production functionality
