# Requirements Document

## Introduction

AgroVault is an AI-powered export intelligence platform designed for India's small Farmer Producer Organizations (FPOs). The web MVP enables FPOs to list produce, receive AI-driven price forecasts, verify export readiness against international standards, maintain traceability records, track cold chain logistics, and generate export documentation. The platform integrates with APEDA, NCDEX, APMC data sources, and GeM Portal to provide actionable intelligence for export decision-making.

## Glossary

- **FPO**: Farmer Producer Organization - a cooperative of small farmers
- **Lot**: A batch of produce with unique identifier, grade, quantity, and harvest metadata
- **Lot_ID**: Unique identifier for a produce lot in format CROP-YYYYMMDD-XXXX
- **QR_Code**: Machine-readable code encoding Lot_ID and traceability URL
- **Price_Forecaster**: XGBoost-based ML model predicting commodity prices 7-21 days ahead
- **Export_Readiness_Checker**: Module validating produce against APEDA MRL, FSSAI, and import country standards
- **Traceability_Ledger**: Append-only audit log recording farm-to-buyer chain events
- **Cold_Chain_Tracker**: Module monitoring storage temperature, duration, and shelf life
- **Document_Generator**: Module producing export compliance PDFs
- **APEDA**: Agricultural and Processed Food Products Export Development Authority
- **MRL**: Maximum Residue Limit for pesticides
- **FSSAI**: Food Safety and Standards Authority of India
- **NCDEX**: National Commodity and Derivatives Exchange
- **APMC**: Agricultural Produce Market Committee
- **GeM_Portal**: Government e-Marketplace for procurement
- **Buyer_Portal**: Web interface for export agents and food processors to search and bid on lots
- **FPO_Dashboard**: Web interface for FPO managers to manage members and lots

## Requirements

### Requirement 1: Produce Lot Creation

**User Story:** As an FPO manager, I want to create produce lots with crop details and photos, so that I can list inventory for potential buyers.

#### Acceptance Criteria

1. WHEN an FPO manager submits crop type, quantity, harvest date, location, and photos, THE Produce_Listing_Engine SHALL create a Lot with auto-generated Lot_ID
2. THE Produce_Listing_Engine SHALL generate Lot_ID in format CROP-YYYYMMDD-XXXX where XXXX is a sequential counter
3. WHEN a Lot is created, THE Produce_Listing_Engine SHALL generate a QR_Code encoding the Lot_ID and traceability URL
4. THE Produce_Listing_Engine SHALL support Hindi and Marathi language input for crop type and location fields
5. WHEN photo upload fails, THE Produce_Listing_Engine SHALL save the Lot with placeholder image and mark photo status as pending
6. THE Produce_Listing_Engine SHALL accept between 1 and 5 photos per Lot
7. WHEN a Lot is successfully created, THE Produce_Listing_Engine SHALL return the Lot_ID and QR_Code to the FPO manager

### Requirement 2: AI Price Forecasting

**User Story:** As an FPO manager, I want to see price forecasts for my crops, so that I can decide the optimal time to sell.

#### Acceptance Criteria

1. WHEN an FPO manager requests a price forecast for a crop type, THE Price_Forecaster SHALL return predicted prices for 7, 14, and 21 days ahead
2. THE Price_Forecaster SHALL use XGBoost model trained on NCDEX spot prices, NCDEX futures data, and APMC mandi prices
3. THE Price_Forecaster SHALL recommend an optimal sell window based on predicted peak price within the 21-day forecast period
4. WHEN the Price_Forecaster generates a forecast, THE Price_Forecaster SHALL include confidence intervals for each prediction
5. THE Price_Forecaster SHALL display data source attribution showing NCDEX and APMC mandi names
6. WHEN historical data is unavailable for a crop, THE Price_Forecaster SHALL return an error message indicating insufficient data
7. THE Price_Forecaster SHALL update forecast data daily at 06:00 IST

### Requirement 3: Export Readiness Validation

**User Story:** As an FPO manager, I want to check if my produce meets export standards, so that I can target the right international markets.

#### Acceptance Criteria

1. WHEN an FPO manager requests export readiness check for a Lot, THE Export_Readiness_Checker SHALL validate the produce against APEDA MRL tables, FSSAI standards, and target market import requirements
2. THE Export_Readiness_Checker SHALL support validation for UAE, EU, and US import markets
3. WHEN validation is complete, THE Export_Readiness_Checker SHALL return pass or fail status for each target market
4. IF a Lot fails validation for a market, THEN THE Export_Readiness_Checker SHALL provide remediation guidance specifying which standards were not met
5. THE Export_Readiness_Checker SHALL check pesticide residue levels against APEDA MRL limits for the specific crop type
6. THE Export_Readiness_Checker SHALL verify FSSAI license validity for the FPO
7. WHEN a Lot passes all checks for a market, THE Export_Readiness_Checker SHALL mark the Lot as export-ready for that market

### Requirement 4: Traceability Record Management

**User Story:** As a buyer, I want to view the complete farm-to-buyer chain for a lot, so that I can verify produce authenticity and handling.

#### Acceptance Criteria

1. WHEN a traceability event occurs, THE Traceability_Ledger SHALL append the event with timestamp, actor, location, and event type to the Lot's audit log
2. THE Traceability_Ledger SHALL support event types: farm_input, harvest, cold_storage_entry, cold_storage_exit, transport, and buyer_handoff
3. THE Traceability_Ledger SHALL prevent modification or deletion of existing audit log entries
4. WHEN a QR_Code is scanned, THE Traceability_Ledger SHALL return all audit log entries for the associated Lot_ID in chronological order
5. THE Traceability_Ledger SHALL record GPS coordinates for transport and handoff events
6. WHEN an event is appended, THE Traceability_Ledger SHALL assign a sequential event number starting from 1
7. THE Traceability_Ledger SHALL store event data in PostgreSQL with append-only constraints

### Requirement 5: Cold Chain Monitoring

**User Story:** As an FPO manager, I want to track storage conditions for my produce, so that I can prevent spoilage and maintain quality.

#### Acceptance Criteria

1. WHEN produce enters cold storage, THE Cold_Chain_Tracker SHALL record entry timestamp, temperature, and expected shelf life
2. WHILE produce is in cold storage, THE Cold_Chain_Tracker SHALL monitor current temperature and storage duration
3. IF storage temperature exceeds safe threshold for the crop type, THEN THE Cold_Chain_Tracker SHALL generate a degradation risk alert
4. IF storage duration exceeds 80% of expected shelf life, THEN THE Cold_Chain_Tracker SHALL generate a shelf life warning
5. THE Cold_Chain_Tracker SHALL calculate remaining shelf life percentage based on crop type, temperature, and elapsed time
6. WHEN produce exits cold storage, THE Cold_Chain_Tracker SHALL record exit timestamp and final temperature reading
7. THE Cold_Chain_Tracker SHALL maintain temperature thresholds for common export crops: mango (12-14°C), pomegranate (5-7°C), onion (0-4°C), grape (0-2°C)

### Requirement 6: Export Document Generation

**User Story:** As an FPO manager, I want to generate export compliance documents, so that I can complete export formalities quickly.

#### Acceptance Criteria

1. WHEN an FPO manager requests document generation for a Lot, THE Document_Generator SHALL produce phytosanitary certificate, APEDA RCMC form, export invoice, Certificate of Analysis, and FSSAI compliance statement as PDF files
2. THE Document_Generator SHALL populate document fields using Lot metadata, FPO registration details, and buyer information
3. THE Document_Generator SHALL embed QR_Code in each generated document for verification
4. WHEN document generation is complete, THE Document_Generator SHALL return downloadable PDF files within 5 seconds
5. THE Document_Generator SHALL use ReportLab library for PDF rendering
6. THE Document_Generator SHALL format documents according to APEDA and FSSAI official templates
7. WHEN required data is missing for a document type, THE Document_Generator SHALL return an error specifying which fields are incomplete

### Requirement 7: FPO Dashboard Analytics

**User Story:** As an FPO manager, I want to view aggregate analytics for my organization, so that I can track performance and member activity.

#### Acceptance Criteria

1. THE FPO_Dashboard SHALL display total active lots, total members, pending negotiations, and total revenue as key performance indicators
2. THE FPO_Dashboard SHALL calculate and display week-over-week percentage change for each KPI
3. THE FPO_Dashboard SHALL show a price heatmap visualizing crop prices across different markets
4. THE FPO_Dashboard SHALL display a timeline chart showing lot status distribution over time
5. THE FPO_Dashboard SHALL list all member farmers with their listing status and last activity timestamp
6. WHEN an FPO manager views the dashboard, THE FPO_Dashboard SHALL load all data within 2 seconds
7. THE FPO_Dashboard SHALL refresh KPI data automatically every 60 seconds via WebSocket connection

### Requirement 8: Buyer Search and Discovery

**User Story:** As a buyer, I want to search for produce lots by crop type, grade, location, and certification, so that I can find suitable inventory for export.

#### Acceptance Criteria

1. THE Buyer_Portal SHALL allow buyers to filter lots by crop type, grade (A/B/C), location (state/district), and export readiness status
2. WHEN a buyer applies filters, THE Buyer_Portal SHALL return matching lots within 1 second
3. THE Buyer_Portal SHALL display lot cards showing crop type, quantity, grade, price, location, and export-ready markets
4. THE Buyer_Portal SHALL sort search results by relevance, price, or harvest date
5. WHEN a buyer clicks on a lot card, THE Buyer_Portal SHALL display detailed lot information including photos, traceability timeline, and compliance certificates
6. THE Buyer_Portal SHALL support pagination with 20 lots per page
7. THE Buyer_Portal SHALL show real-time availability status for each lot

### Requirement 9: Negotiation and Bidding

**User Story:** As a buyer, I want to negotiate prices with FPOs, so that I can secure produce at favorable terms.

#### Acceptance Criteria

1. WHEN a buyer submits a bid for a Lot, THE Buyer_Portal SHALL record the bid amount, quantity, and delivery terms
2. WHEN a bid is received, THE FPO_Dashboard SHALL notify the FPO manager and display the bid details
3. THE FPO_Dashboard SHALL allow FPO managers to accept, counter, or decline bids
4. WHEN an FPO manager submits a counter-offer, THE Buyer_Portal SHALL notify the buyer within 10 seconds
5. THE Buyer_Portal SHALL display negotiation history showing all offers and counter-offers with timestamps
6. WHEN a bid is accepted, THE Buyer_Portal SHALL mark the Lot as sold and remove it from search results
7. THE FPO_Dashboard SHALL display minimum acceptable price threshold for each Lot to guide negotiation decisions

### Requirement 10: Multi-Language Support

**User Story:** As an FPO manager in Maharashtra, I want to use the platform in Marathi, so that I can operate efficiently in my native language.

#### Acceptance Criteria

1. THE FPO_Dashboard SHALL support English, Hindi, and Marathi language options
2. WHEN an FPO manager selects a language, THE FPO_Dashboard SHALL display all UI labels, buttons, and messages in the selected language
3. THE FPO_Dashboard SHALL persist language preference across sessions
4. THE FPO_Dashboard SHALL translate crop type names, location names, and status labels to the selected language
5. THE FPO_Dashboard SHALL display numeric values and dates using locale-appropriate formatting
6. WHEN language data is unavailable for a term, THE FPO_Dashboard SHALL fall back to English with a visual indicator

### Requirement 11: Data Integration with External Sources

**User Story:** As a system administrator, I want to integrate with APEDA, NCDEX, and APMC data sources, so that the platform provides accurate and current information.

#### Acceptance Criteria

1. THE Price_Forecaster SHALL fetch NCDEX spot prices and futures data via API daily at 06:00 IST
2. THE Price_Forecaster SHALL fetch APMC mandi prices from data.gov.in API daily at 06:00 IST
3. THE Export_Readiness_Checker SHALL fetch APEDA MRL tables via API weekly on Monday at 02:00 IST
4. IF an external API call fails, THEN THE System SHALL retry up to 3 times with exponential backoff
5. IF all retry attempts fail, THEN THE System SHALL log the error and use cached data from the previous successful fetch
6. WHERE GeM_Portal integration is configured, THE System SHALL mock GeM API responses for MVP deployment
7. THE System SHALL store fetched external data in PostgreSQL with fetch timestamp and source attribution

### Requirement 12: QR Code Scanning and Verification

**User Story:** As a buyer, I want to scan a QR code on produce packaging, so that I can verify authenticity and view traceability records.

#### Acceptance Criteria

1. WHEN a QR_Code is scanned, THE System SHALL decode the Lot_ID and retrieve the associated Lot record
2. IF the Lot_ID does not exist in the database, THEN THE System SHALL return an error message indicating invalid or unrecognized code
3. WHEN a valid Lot_ID is retrieved, THE System SHALL display crop type, grade, quantity, harvest date, FPO name, and current status
4. THE System SHALL display the complete traceability timeline from the Traceability_Ledger
5. THE System SHALL display cold chain history including temperature readings and storage duration
6. THE System SHALL provide a public verification page accessible without authentication
7. THE System SHALL log each QR scan event with timestamp and scanner IP address for audit purposes

### Requirement 13: Authentication and Authorization

**User Story:** As a system administrator, I want to control access based on user roles, so that FPO managers and buyers have appropriate permissions.

#### Acceptance Criteria

1. THE System SHALL support three user roles: FPO_Manager, Buyer, and Admin
2. WHEN a user logs in, THE System SHALL authenticate credentials and assign the appropriate role
3. THE System SHALL restrict FPO_Dashboard access to users with FPO_Manager or Admin role
4. THE System SHALL restrict Buyer_Portal access to users with Buyer or Admin role
5. THE System SHALL allow FPO_Manager users to create and edit lots only for their own FPO
6. THE System SHALL allow Buyer users to view all lots but only submit bids for available lots
7. THE System SHALL enforce session timeout after 60 minutes of inactivity

### Requirement 14: Backend API Architecture

**User Story:** As a developer, I want a RESTful API with clear endpoints, so that I can integrate frontend clients and future mobile apps.

#### Acceptance Criteria

1. THE System SHALL implement a FastAPI backend with RESTful endpoints for all core operations
2. THE System SHALL use PostgreSQL as the primary database for lots, users, bids, and traceability records
3. THE System SHALL implement WebSocket endpoints for real-time dashboard updates and bid notifications
4. THE System SHALL return JSON responses with consistent error structure including error code, message, and details
5. THE System SHALL validate all API request payloads using Pydantic models
6. THE System SHALL implement rate limiting of 100 requests per minute per user
7. THE System SHALL log all API requests with timestamp, user ID, endpoint, and response status

### Requirement 15: Frontend User Interface

**User Story:** As an FPO manager, I want an intuitive web interface, so that I can manage lots and view analytics without technical expertise.

#### Acceptance Criteria

1. WHERE Streamlit is used for rapid prototyping, THE FPO_Dashboard SHALL provide form-based lot creation, tabular lot listing, and chart-based analytics
2. WHERE React with Tailwind CSS is used, THE FPO_Dashboard SHALL implement the design system specified in krushilink-design.html
3. THE FPO_Dashboard SHALL display a sidebar navigation with sections: Overview, Lots, Members, Negotiations, Documents, and Settings
4. THE Buyer_Portal SHALL display a top navigation bar with sections: Search, My Bids, Messages, and Profile
5. THE System SHALL ensure all interactive elements have minimum touch target size of 44x44 pixels for mobile accessibility
6. THE System SHALL display loading indicators for operations taking longer than 500ms
7. THE System SHALL display error messages in user-friendly language with actionable next steps

### Requirement 16: Photo Upload and Storage

**User Story:** As an FPO manager, I want to upload produce photos, so that buyers can visually assess quality.

#### Acceptance Criteria

1. THE Produce_Listing_Engine SHALL accept JPEG and PNG image formats for photo uploads
2. THE Produce_Listing_Engine SHALL resize uploaded photos to maximum 1200px width while maintaining aspect ratio
3. THE Produce_Listing_Engine SHALL compress photos to reduce file size below 500KB per image
4. THE Produce_Listing_Engine SHALL store photos in a file storage system with unique filenames based on Lot_ID and photo sequence
5. WHEN photo upload exceeds 5MB, THE Produce_Listing_Engine SHALL reject the upload and return an error message
6. THE Produce_Listing_Engine SHALL generate thumbnail images at 300px width for list views
7. THE Produce_Listing_Engine SHALL serve photos via CDN or static file server with caching headers

### Requirement 17: Lot Grade Assignment

**User Story:** As an FPO manager, I want to assign quality grades to lots, so that buyers can filter by quality level.

#### Acceptance Criteria

1. THE Produce_Listing_Engine SHALL support grade values: A (premium), B (standard), and C (economy)
2. WHEN an FPO manager creates a Lot, THE Produce_Listing_Engine SHALL require grade selection
3. WHERE AI-based grading is available, THE Produce_Listing_Engine SHALL suggest a grade based on photo analysis with confidence score
4. THE Produce_Listing_Engine SHALL allow FPO managers to override AI-suggested grades
5. THE Produce_Listing_Engine SHALL store grade assignment timestamp and method (manual or AI-assisted)
6. THE Buyer_Portal SHALL display grade prominently on lot cards and detail views
7. THE Export_Readiness_Checker SHALL apply stricter MRL limits for Grade A produce compared to Grade B and C

### Requirement 18: Notification System

**User Story:** As an FPO manager, I want to receive notifications for new bids and alerts, so that I can respond promptly to opportunities.

#### Acceptance Criteria

1. WHEN a new bid is received for an FPO's Lot, THE System SHALL send a notification to the FPO manager
2. WHEN a cold chain alert is triggered, THE System SHALL send a notification to the FPO manager
3. WHEN a buyer accepts a counter-offer, THE System SHALL send a notification to the FPO manager
4. THE System SHALL support notification delivery via in-app notification center and email
5. THE System SHALL display unread notification count in the FPO_Dashboard header
6. WHEN a notification is clicked, THE System SHALL mark it as read and navigate to the relevant page
7. THE System SHALL retain notifications for 30 days before archiving

### Requirement 19: Bulk Lot Entry

**User Story:** As an FPO manager, I want to create multiple lots at once, so that I can efficiently list large harvests.

#### Acceptance Criteria

1. THE Produce_Listing_Engine SHALL accept CSV file uploads containing multiple lot records
2. THE Produce_Listing_Engine SHALL validate each row in the CSV for required fields: crop_type, quantity, harvest_date, location
3. WHEN CSV validation succeeds, THE Produce_Listing_Engine SHALL create all lots in a single transaction
4. IF any row fails validation, THEN THE Produce_Listing_Engine SHALL reject the entire upload and return error details for each invalid row
5. THE Produce_Listing_Engine SHALL generate unique Lot_IDs and QR_Codes for each lot in the bulk upload
6. THE Produce_Listing_Engine SHALL support bulk uploads of up to 100 lots per CSV file
7. WHEN bulk upload completes, THE Produce_Listing_Engine SHALL return a summary showing total created, total failed, and downloadable QR codes as a ZIP file

### Requirement 20: Data Export and Reporting

**User Story:** As an FPO manager, I want to export transaction history and analytics, so that I can maintain records and share reports with stakeholders.

#### Acceptance Criteria

1. THE FPO_Dashboard SHALL allow FPO managers to export lot listings as CSV files
2. THE FPO_Dashboard SHALL allow FPO managers to export transaction history as CSV files with columns: date, lot_id, buyer, quantity, price, status
3. THE FPO_Dashboard SHALL allow FPO managers to export analytics reports as PDF files including KPIs, charts, and member activity
4. WHEN an export is requested, THE System SHALL generate the file within 10 seconds
5. THE System SHALL include export timestamp and FPO name in generated filenames
6. THE System SHALL apply date range filters to exports when specified by the user
7. THE System SHALL limit export data to the requesting user's FPO for FPO_Manager role

### Requirement 21: Price Forecast Data Parsing

**User Story:** As a developer, I want to parse NCDEX and APMC price data reliably, so that the forecasting model has clean input.

#### Acceptance Criteria

1. WHEN NCDEX API returns price data, THE Price_Data_Parser SHALL parse JSON response into structured records with fields: date, commodity, price, volume, exchange
2. WHEN APMC API returns price data, THE Price_Data_Parser SHALL parse JSON response into structured records with fields: date, commodity, market, min_price, max_price, modal_price
3. IF parsing fails due to malformed data, THEN THE Price_Data_Parser SHALL return a descriptive error indicating the field and expected format
4. THE Price_Data_Formatter SHALL format parsed price records into CSV format for model training
5. FOR ALL valid price records, parsing then formatting then parsing SHALL produce equivalent structured data (round-trip property)
6. THE Price_Data_Parser SHALL handle missing optional fields by setting them to null without failing the entire parse
7. THE Price_Data_Parser SHALL validate date fields are in ISO 8601 format and price fields are positive numbers

### Requirement 22: Document Template Rendering

**User Story:** As an FPO manager, I want generated documents to match official formats exactly, so that they are accepted by export authorities.

#### Acceptance Criteria

1. WHEN the Document_Generator renders a phytosanitary certificate, THE Document_Generator SHALL use the APEDA-approved template layout
2. THE Document_Generator SHALL populate all mandatory fields in each document type without leaving blank spaces
3. THE Document_Generator SHALL format dates in DD/MM/YYYY format for all export documents
4. THE Document_Generator SHALL format currency values in INR with thousand separators (e.g., ₹1,25,000)
5. THE Document_Generator SHALL embed the FPO's FSSAI license number and APEDA RCMC number in document headers
6. THE Document_Generator SHALL include page numbers in format "Page X of Y" for multi-page documents
7. THE Document_Generator SHALL apply digital signature placeholder boxes for authorized signatory fields

### Requirement 23: Offline Capability and Sync

**User Story:** As an FPO manager in a rural area, I want to create lots offline, so that I can work despite intermittent internet connectivity.

#### Acceptance Criteria

1. WHERE offline mode is enabled, THE FPO_Dashboard SHALL allow lot creation and store data locally in browser storage
2. WHEN internet connectivity is restored, THE System SHALL automatically sync locally stored lots to the server
3. THE System SHALL display an offline indicator banner when network connectivity is lost
4. WHEN sync completes, THE System SHALL update local Lot_IDs with server-assigned Lot_IDs and notify the user
5. IF sync fails due to validation errors, THEN THE System SHALL display error details and allow the user to edit and retry
6. THE System SHALL queue up to 50 lots for offline sync
7. THE System SHALL prioritize syncing lots in chronological order of creation

### Requirement 24: Performance and Scalability

**User Story:** As a system administrator, I want the platform to handle concurrent users efficiently, so that it remains responsive during peak usage.

#### Acceptance Criteria

1. THE System SHALL support at least 100 concurrent FPO managers and 200 concurrent buyers
2. THE System SHALL respond to API requests within 500ms for 95% of requests under normal load
3. THE System SHALL implement database connection pooling with minimum 10 and maximum 50 connections
4. THE System SHALL implement caching for APEDA MRL tables, NCDEX prices, and APMC prices with 24-hour TTL
5. THE System SHALL compress API responses using gzip when response size exceeds 1KB
6. THE System SHALL implement database indexes on frequently queried fields: lot.crop_type, lot.status, lot.fpo_id, bid.lot_id
7. WHEN database query time exceeds 1 second, THE System SHALL log a slow query warning with query details

### Requirement 25: Error Handling and Logging

**User Story:** As a developer, I want comprehensive error logging, so that I can diagnose and fix issues quickly.

#### Acceptance Criteria

1. WHEN an unhandled exception occurs, THE System SHALL log the error with stack trace, timestamp, user ID, and request context
2. THE System SHALL return user-friendly error messages to the frontend without exposing internal implementation details
3. THE System SHALL categorize errors as: validation_error, authentication_error, external_api_error, database_error, or internal_error
4. THE System SHALL log all external API calls with request parameters, response status, and latency
5. THE System SHALL implement structured logging in JSON format with fields: timestamp, level, message, context
6. THE System SHALL rotate log files daily and retain logs for 30 days
7. WHEN a critical error occurs, THE System SHALL send an alert notification to the admin email address

## Out of Scope for MVP

The following features are explicitly excluded from the MVP scope and may be considered for future releases:

- Actual blockchain implementation (using append-only PostgreSQL instead)
- Real payment gateway integration (manual payment coordination)
- Live GeM Portal API integration (mocked for MVP)
- MPEDA marine products support (focusing on agricultural produce only)
- Native mobile applications (web-responsive only)
- WhatsApp bot for individual farmers (FPO web dashboard only)
- AI-based image grading model (manual grade entry for MVP)
- Real-time IoT sensor integration for cold chain (manual temperature entry)
- Multi-currency support (INR only)
- Advanced analytics and ML insights beyond price forecasting

## Future Considerations

- WhatsApp bot integration for individual farmer access
- Mobile native apps for iOS and Android
- Blockchain integration for immutable traceability
- Payment gateway for automated transactions
- IoT sensor integration for automated cold chain monitoring
- Computer vision model for automated produce grading
- Expanded crop coverage and international market support
