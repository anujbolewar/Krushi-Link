import streamlit as st
from datetime import datetime

# Mock data for lots
lots = [
    {
        "Lot ID": "MANGO-20260301-0001",
        "Crop Type": "Mango",
        "Quantity": "1000 kg",
        "Harvest Date": "2026-03-01",
        "Location": "Pune",
        "Status": "Active",
    },
    {
        "Lot ID": "POMEGRANATE-20260302-0002",
        "Crop Type": "Pomegranate",
        "Quantity": "800 kg",
        "Harvest Date": "2026-03-02",
        "Location": "Nashik",
        "Status": "Pending",
    },
]

# Streamlit app
st.set_page_config(page_title="Lot Management", layout="wide")
st.title("Lot Management")

# Lot Listing Table
st.header("Lot Listing")
st.table(lots)

# Lot Creation Form
st.header("Create New Lot")
with st.form("lot_creation_form"):
    crop_type = st.text_input("Crop Type")
    quantity = st.text_input("Quantity (e.g., 1000 kg)")
    harvest_date = st.date_input("Harvest Date", datetime.now())
    location = st.text_input("Location")
    photos = st.file_uploader("Upload Photos", accept_multiple_files=True)
    submitted = st.form_submit_button("Create Lot")

    if submitted:
        st.success("Lot created successfully!")

# Lot Details
st.header("Lot Details")
selected_lot = st.selectbox("Select Lot", [lot["Lot ID"] for lot in lots])
lot_details = next(lot for lot in lots if lot["Lot ID"] == selected_lot)
st.json(lot_details)
