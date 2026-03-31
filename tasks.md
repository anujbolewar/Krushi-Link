# Implementation Plan: AgroVault Web MVP

## Overview

This implementation plan focuses on the 6 core modules for a hackathon-ready MVP: Produce Listing Engine, Price Forecaster, Export Readiness Checker, Traceability Ledger, Cold Chain Tracker, and Document Generator. The backend uses FastAPI with PostgreSQL, and the frontend uses Streamlit for rapid prototyping. All tasks build incrementally toward a demo-ready platform.

## Tasks

- [ ] 1. Set up project structure and database foundation
  - Create FastAPI project with SQLAlchemy and Alembic
  - Define PostgreSQL database schema for lots, traceability_events, cold_chain_records, bids, users, fpos, notifications
  - Implement append-only constraints on traceability_events table
  - Create Pydantic models for all core entities (Lot, PriceForecast, ExportReadinessReport, TraceabilityEvent, ColdChainRecord, Bid, User, FPO)
  - Set up database connection pooling (min 10, max 50 connections)
  - _Requirements: 1.1, 4.3, 4.7, 14.2, 14.5, 24.3_

- [ ] 2. Implement Produce Listing Engine
  - [ ] 2.1 Implement lot creation with Lot_ID generation
    - Write `create_lot()` method with Lot_ID format CROP-YYYYMMDD-XXXX
    - Implement daily sequential counter for XXXX suffix
    - Generate QR code encoding lot_id and verification URL
    - Store lot record in database
    - _Requirements: 1.1, 1.2, 1.3, 1.7_
  
  - [ ] 2.2 Implement photo upload and processing
    - Write `process_photos()` method to resize images to 1200px max width
    - Compress photos to <500KB using Pillow
    - Generate 300px thumbnails for list views
    - Store photos with unique filenames based on lot_id
    - Handle 1-5 photos per lot with validation
    - _Requirements: 1.6, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_
  
  - [ ] 2.3 Implement bulk lot creation from CSV
    - Write `create_lots_bulk()` method accepting CSV file
    - Validate each row for required fields (crop_type, quantity, harvest_date, location)
    - Create all lots in single transaction or reject entire batch
    - Generate ZIP file with all QR codes
    - Return summary with created/failed counts
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_
  
  - [ ] 2.4 Add multi-language support for lot creation
    - Accept Hindi and Marathi input for crop_type and location fields
    - Store language preference in user session
    - _Requirements: 1.4, 10.1, 10.2, 10.3, 10.4_

- [ ] 3. Implement Price Forecaster module
  - [ ] 3.1 Create price data fetching and parsing
    - Write mock NCDEX API client returning spot and futures prices
    - Write mock APMC API client returning mandi modal prices
    - Implement `fetch_training_data()` to retrieve and store price history
    - Parse JSON responses into structured records with date, commodity, price, volume
    - Store parsed data in price_history table
    - _Requirements: 2.2, 11.1, 11.2, 21.1, 21.2, 21.6, 21.7_
  
  - [ ] 3.2 Implement XGBoost price forecasting model
    - Write `train_model()` method with time-series feature engineering
    - Implement features: historical prices, futures prices, seasonality, market volume
    - Train XGBoost regressor with quantile regression for confidence intervals
    - Write `forecast_price()` method returning predictions for 7, 14, 21 days ahead
    - Include 10th, 50th, 90th percentile confidence intervals
    - _Requirements: 2.1, 2.2, 2.4, 2.6_
  
  - [ ] 3.3 Implement sell window recommendation
    - Write `recommend_sell_window()` method analyzing forecast peak
    - Return optimal date range with expected price and confidence
    - _Requirements: 2.3_

- [ ] 4. Implement Export Readiness Checker
  - [ ] 4.1 Create APEDA MRL validation logic
    - Write mock APEDA API client returning MRL tables
    - Implement `validate_mrl()` checking pesticide residue levels against limits
    - Support UAE, EU, US market-specific MRL standards
    - Apply stricter limits for Grade A produce
    - _Requirements: 3.1, 3.2, 3.5, 3.7, 17.7_
  
  - [ ] 4.2 Implement export readiness checking
    - Write `check_readiness()` method validating lot against target markets
    - Validate FSSAI license validity for FPO
    - Return pass/fail status for each market with compliance checks
    - _Requirements: 3.1, 3.3, 3.6, 3.7_
  
  - [ ] 4.3 Implement remediation guidance
    - Write `get_remediation_guidance()` providing actionable steps for failed checks
    - Return specific guidance on which standards failed and how to address
    - _Requirements: 3.4_

- [ ] 5. Implement Traceability Ledger
  - [ ] 5.1 Implement append-only event logging
    - Write `append_event()` method with sequential event numbering
    - Support event types: farm_input, harvest, cold_storage_entry, cold_storage_exit, transport, buyer_handoff
    - Store GPS coordinates for transport and handoff events
    - Enforce append-only constraint via database rules
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7_
  
  - [ ] 5.2 Implement timeline retrieval and verification
    - Write `get_timeline()` returning chronological audit log
    - Write `verify_integrity()` checking for tampering
    - _Requirements: 4.4_

- [ ] 6. Implement Cold Chain Tracker
  - [ ] 6.1 Implement cold storage entry and exit recording
    - Write `record_entry()` storing entry timestamp, temperature, expected shelf life
    - Write `record_exit()` storing exit timestamp and final temperature
    - _Requirements: 5.1, 5.6_
  
  - [ ] 6.2 Implement temperature monitoring and alerts
    - Write `record_temperature()` for manual temperature entry
    - Implement crop-specific temperature thresholds (mango: 12-14°C, pomegranate: 5-7°C, onion: 0-4°C, grape: 0-2°C)
    - Write `check_alerts()` detecting temperature violations and shelf life warnings
    - Generate alerts when temperature exceeds threshold or storage duration > 80% of shelf life
    - _Requirements: 5.2, 5.3, 5.4, 5.7_
  
  - [ ] 6.3 Implement shelf life calculation
    - Write `calculate_remaining_shelf_life()` based on crop type, temperature, elapsed time
    - _Requirements: 5.5_

- [ ] 7. Implement Document Generator
  - [ ] 7.1 Set up ReportLab PDF generation
    - Create base PDF template class with APEDA/FSSAI layouts
    - Implement QR code embedding in documents
    - Format dates as DD/MM/YYYY and currency as ₹1,25,000
    - _Requirements: 6.5, 22.3, 22.4_
  
  - [ ] 7.2 Implement document generation methods
    - Write `generate_phytosanitary_certificate()` using APEDA template
    - Write `generate_apeda_rcmc_form()` with FPO registration details
    - Write `generate_export_invoice()` with buyer info and pricing
    - Write `generate_certificate_of_analysis()` with lot metadata
    - Write `generate_fssai_compliance_statement()` with FPO license info
    - Populate all mandatory fields without blank spaces
    - _Requirements: 6.1, 6.2, 6.3, 22.1, 22.2, 22.5_
  
  - [ ] 7.3 Implement batch document generation
    - Write `generate_all_documents()` producing all 5 document types in one call
    - Return downloadable PDFs within 5 seconds
    - Handle missing data with descriptive errors
    - _Requirements: 6.4, 6.7_

- [ ] 8. Checkpoint - Ensure core modules work independently
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement FastAPI REST endpoints
  - [ ] 9.1 Implement lot management endpoints
    - POST /api/v1/lots - create lot
    - POST /api/v1/lots/bulk - bulk lot creation
    - GET /api/v1/lots - list lots with filters (crop_type, status, fpo_id, grade, location)
    - GET /api/v1/lots/{lot_id} - get lot details
    - PATCH /api/v1/lots/{lot_id} - update lot (limited fields: status, min_price)
    - _Requirements: 1.1, 1.7, 8.1, 8.2, 19.1_
  
  - [ ] 9.2 Implement price forecasting endpoints
    - GET /api/v1/forecast/{crop_type} - get price forecast
    - GET /api/v1/forecast/{crop_type}/recommend - get sell recommendation
    - Return error when historical data unavailable
    - _Requirements: 2.1, 2.3, 2.6_
  
  - [ ] 9.3 Implement export readiness endpoints
    - POST /api/v1/export-check - check export readiness for lot
    - GET /api/v1/export-check/{lot_id} - get readiness report
    - _Requirements: 3.1, 3.3, 3.4_
  
  - [ ] 9.4 Implement traceability endpoints
    - GET /api/v1/traceability/{lot_id} - get audit log
    - POST /api/v1/traceability/event - append event
    - GET /api/v1/verify/{lot_id} - public QR verification
    - _Requirements: 4.1, 4.4, 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 9.5 Implement cold chain endpoints
    - POST /api/v1/cold-chain/entry - record cold storage entry
    - POST /api/v1/cold-chain/temperature - record temperature
    - POST /api/v1/cold-chain/exit - record cold storage exit
    - GET /api/v1/cold-chain/{lot_id} - get cold chain history
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [ ] 9.6 Implement document generation endpoints
    - POST /api/v1/documents/generate - generate export documents
    - GET /api/v1/documents/{doc_id} - download document
    - _Requirements: 6.1, 6.4_
  
  - [ ] 9.7 Implement bidding and negotiation endpoints
    - POST /api/v1/bids - submit bid
    - GET /api/v1/bids - list bids filtered by user role
    - PATCH /api/v1/bids/{bid_id} - accept/counter/decline bid
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ] 9.8 Implement authentication endpoints
    - POST /api/v1/auth/login - login with email/password
    - POST /api/v1/auth/logout - logout
    - GET /api/v1/auth/me - get current user
    - Implement session timeout after 60 minutes
    - _Requirements: 13.1, 13.2, 13.7_
  
  - [ ] 9.9 Implement analytics endpoints
    - GET /api/v1/analytics/kpis - get dashboard KPIs with week-over-week changes
    - GET /api/v1/analytics/price-heatmap - get price heatmap data
    - GET /api/v1/analytics/timeline - get lot timeline data
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 9.10 Implement data export endpoints
    - POST /api/v1/export/lots - export lots as CSV
    - POST /api/v1/export/transactions - export transactions as CSV
    - POST /api/v1/export/analytics - export analytics as PDF
    - Apply FPO-specific filtering for FPO_Manager role
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

- [ ] 10. Implement API middleware and error handling
  - [ ] 10.1 Add request validation and error responses
    - Implement Pydantic validation for all request payloads
    - Return consistent error JSON with error_code, message, details
    - Categorize errors: validation_error, authentication_error, external_api_error, database_error, internal_error
    - _Requirements: 14.4, 14.5, 25.2, 25.3_
  
  - [ ] 10.2 Add rate limiting and logging
    - Implement rate limiting at 100 requests per minute per user
    - Return 429 Too Many Requests with Retry-After header
    - Log all API requests with timestamp, user_id, endpoint, response status
    - Log external API calls with request parameters, response status, latency
    - _Requirements: 14.6, 14.7, 25.4_
  
  - [ ] 10.3 Add authentication and authorization middleware
    - Implement JWT-based authentication
    - Enforce role-based access control (FPO_Manager, Buyer, Admin)
    - Restrict FPO_Manager to own FPO's data
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 11. Implement Notification System
  - [ ] 11.1 Create notification service
    - Write `send_notification()` method storing notifications in database
    - Support notification types: new_bid, bid_accepted, counter_offer, cold_chain_alert, lot_sold
    - Write `get_notifications()` and `get_unread_count()` methods
    - Write `mark_as_read()` method
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.6_
  
  - [ ] 11.2 Add WebSocket support for real-time notifications
    - Implement WebSocket endpoint /ws/bids/{user_id}
    - Push notifications to connected clients within 10 seconds
    - _Requirements: 9.4, 14.3_

- [ ] 12. Implement FPO Dashboard (Streamlit)
  - [ ] 12.1 Create dashboard overview page
    - Display KPIs: total active lots, total members, pending negotiations, total revenue
    - Calculate and display week-over-week percentage changes
    - Show price heatmap and timeline chart using Plotly
    - Load all data within 2 seconds
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_
  
  - [ ] 12.2 Create lot management page
    - Display lot listing table with filters
    - Add lot creation form with photo upload
    - Show lot details with photos, traceability timeline, compliance status
    - _Requirements: 1.1, 8.3, 8.5_
  
  - [ ] 12.3 Create negotiations page
    - Display pending bids with buyer details
    - Add accept/counter/decline actions
    - Show negotiation history with timestamps
    - Display minimum acceptable price threshold
    - _Requirements: 9.2, 9.3, 9.5, 9.7_
  
  - [ ] 12.4 Add multi-language support
    - Implement language selector (English, Hindi, Marathi)
    - Translate UI labels, buttons, messages
    - Format dates and numbers using locale-appropriate formatting
    - Persist language preference across sessions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 13. Implement Buyer Portal (Streamlit)
  - [ ] 13.1 Create search and discovery page
    - Add filters for crop_type, grade, location (state/district), export readiness
    - Display lot cards with crop type, quantity, grade, price, location, export-ready markets
    - Implement sorting by relevance, price, harvest date
    - Add pagination with 20 lots per page
    - Return results within 1 second
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.7_
  
  - [ ] 13.2 Create lot detail page
    - Display detailed lot information with photos
    - Show traceability timeline from Traceability_Ledger
    - Display cold chain history with temperature readings
    - Show compliance certificates and export readiness status
    - _Requirements: 8.5, 12.4, 12.5_
  
  - [ ] 13.3 Create bidding interface
    - Add bid submission form with amount, quantity, delivery terms
    - Display negotiation history with all offers and counter-offers
    - Show real-time bid status updates
    - _Requirements: 9.1, 9.4, 9.5_

- [ ] 14. Implement public QR verification page
  - Create static HTML page for QR code scanning
  - Decode Lot_ID from QR code and call /api/v1/verify/{lot_id}
  - Display crop type, grade, quantity, harvest date, FPO name, status
  - Show complete traceability timeline and cold chain history
  - Handle invalid Lot_ID with error message
  - Log each scan event with timestamp and IP address
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [ ] 15. Implement external API integration with retry logic
  - Add exponential backoff retry (up to 3 attempts) for external API calls
  - Use cached data from previous successful fetch when all retries fail
  - Log errors for failed API calls
  - Implement Redis caching with 24-hour TTL for NCDEX/APMC prices
  - Implement 7-day TTL for APEDA MRL tables
  - _Requirements: 11.3, 11.4, 11.5, 24.4, 25.1_

- [ ] 16. Add database indexes and performance optimization
  - Create indexes on lots(crop_type, status, fpo_id), lots(status, created_at)
  - Create indexes on traceability_events(lot_id, event_number)
  - Create indexes on bids(lot_id, status), bids(buyer_id, status)
  - Create index on notifications(user_id, read_at)
  - Implement gzip compression for API responses >1KB
  - Log slow queries exceeding 1 second
  - _Requirements: 24.2, 24.5, 24.6, 24.7_

- [ ] 17. Implement error logging and monitoring
  - Set up structured JSON logging with timestamp, level, message, context
  - Log unhandled exceptions with stack trace, user_id, request context
  - Implement daily log rotation with 30-day retention
  - Add admin email alerts for critical errors
  - _Requirements: 25.1, 25.3, 25.5, 25.6, 25.7_

- [ ] 18. Create database migrations and seed data
  - Write Alembic migrations for all tables
  - Create seed data: sample FPOs, users (FPO_Manager, Buyer, Admin roles), crop types
  - Add sample APEDA MRL data for UAE, EU, US markets
  - Add sample NCDEX/APMC historical price data for model training
  - _Requirements: 14.2, 3.2, 2.2_

- [ ] 19. Final integration and deployment preparation
  - [ ] 19.1 Wire all components together
    - Connect FastAPI endpoints to business logic modules
    - Connect Streamlit dashboards to API endpoints
    - Test end-to-end workflows: lot creation → price forecast → export check → bid → document generation
    - _Requirements: All_
  
  - [ ] 19.2 Create deployment configuration
    - Write requirements.txt with all Python dependencies
    - Create Railway/Render deployment config
    - Set up PostgreSQL connection string and environment variables
    - Configure static file serving for photos and documents
    - _Requirements: 14.2, 16.7_
  
  - [ ] 19.3 Create README and setup instructions
    - Document installation steps
    - Document API endpoints and authentication
    - Document environment variables
    - Add demo credentials for testing

- [ ] 20. Final checkpoint - Ensure all tests pass and demo readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Focus on Streamlit for fastest MVP delivery; React is optional if time permits
- Mock all external APIs (NCDEX, APMC, APEDA, GeM Portal) for hackathon demo
- Manual temperature and grade entry for MVP (no IoT/AI models)
- Append-only PostgreSQL provides blockchain-equivalent traceability for demo
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation before moving to next phase
