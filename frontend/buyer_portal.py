import streamlit as st
import plotly.express as px
from datetime import datetime

# Mock data for lots
lots = [
    {
        "Lot ID": "MANGO-20260301-0001",
        "Crop Type": "Mango",
        "Grade": "A",
        "Location": "Pune",
        "Export Readiness": "UAE, EU",
        "Price": 120,
        "Harvest Date": "2026-03-01",
    },
    {
        "Lot ID": "POMEGRANATE-20260302-0002",
        "Crop Type": "Pomegranate",
        "Grade": "B",
        "Location": "Nashik",
        "Export Readiness": "US",
        "Price": 100,
        "Harvest Date": "2026-03-02",
    },
]

# Streamlit app
st.set_page_config(page_title="Buyer Portal", layout="wide")
st.title("Buyer Portal")

# Search and Discovery Page
st.header("Search and Discovery")

# Filters
with st.sidebar:
    st.header("Filters")
    crop_type = st.selectbox("Crop Type", ["All"] + list(set(lot["Crop Type"] for lot in lots)))
    grade = st.selectbox("Grade", ["All"] + list(set(lot["Grade"] for lot in lots)))
    location = st.selectbox("Location", ["All"] + list(set(lot["Location"] for lot in lots)))
    export_readiness = st.selectbox("Export Readiness", ["All"] + list(set(lot["Export Readiness"] for lot in lots)))

# Filtered Results
filtered_lots = [
    lot for lot in lots
    if (crop_type == "All" or lot["Crop Type"] == crop_type)
    and (grade == "All" or lot["Grade"] == grade)
    and (location == "All" or lot["Location"] == location)
    and (export_readiness == "All" or export_readiness in lot["Export Readiness"])
]

# Display Results
st.subheader("Available Lots")
for lot in filtered_lots:
    st.write(f"**{lot['Crop Type']}** - {lot['Grade']} grade, ₹{lot['Price']}/kg")
    st.write(f"Location: {lot['Location']}, Export Readiness: {lot['Export Readiness']}")
    st.write(f"Harvest Date: {lot['Harvest Date']}")
    st.write("---")

# Lot Detail Page
st.header("Lot Details")
selected_lot = st.selectbox("Select Lot", [lot["Lot ID"] for lot in lots])
lot_details = next(lot for lot in lots if lot["Lot ID"] == selected_lot)

st.subheader(f"Details for Lot: {selected_lot}")
st.write(f"**Crop Type**: {lot_details['Crop Type']}")
st.write(f"**Grade**: {lot_details['Grade']}")
st.write(f"**Price**: ₹{lot_details['Price']}/kg")
st.write(f"**Location**: {lot_details['Location']}")
st.write(f"**Export Readiness**: {lot_details['Export Readiness']}")
st.write(f"**Harvest Date**: {lot_details['Harvest Date']}")

# Mock Traceability Timeline
st.subheader("Traceability Timeline")
st.write("Harvest → Cold Storage → Transport → Buyer Handoff")

# Mock Cold Chain History
st.subheader("Cold Chain History")
st.write("Temperature maintained between 2-8°C throughout transport.")

# Mock Compliance Certificates
st.subheader("Compliance Certificates")
st.write("Phytosanitary Certificate, FSSAI Compliance Statement")

# Bidding Interface
st.header("Bidding Interface")
selected_lot_for_bid = st.selectbox("Select Lot for Bidding", [lot["Lot ID"] for lot in lots])

st.subheader(f"Place a Bid for Lot: {selected_lot_for_bid}")
with st.form("bid_form"):
    bid_amount = st.number_input("Bid Amount (₹/kg)", min_value=1)
    bid_quantity = st.number_input("Quantity (kg)", min_value=1)
    delivery_terms = st.text_area("Delivery Terms")
    submitted = st.form_submit_button("Submit Bid")

    if submitted:
        st.success("Bid submitted successfully!")

# Mock Negotiation History
st.subheader("Negotiation History")
st.write("Buyer A: ₹120/kg, 1000 kg, Accepted")
st.write("Buyer B: ₹100/kg, 800 kg, Countered")
