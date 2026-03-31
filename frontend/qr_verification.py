import streamlit as st
from datetime import datetime

# Mock data for lots
lots = {
    "MANGO-20260301-0001": {
        "Crop Type": "Mango",
        "Grade": "A",
        "Quantity": "1000 kg",
        "Harvest Date": "2026-03-01",
        "FPO Name": "Pune Agro Co-op",
        "Status": "Export Ready",
        "Traceability Timeline": "Harvest → Cold Storage → Transport → Buyer Handoff",
        "Cold Chain History": "Temperature maintained between 2-8°C",
    },
    "POMEGRANATE-20260302-0002": {
        "Crop Type": "Pomegranate",
        "Grade": "B",
        "Quantity": "800 kg",
        "Harvest Date": "2026-03-02",
        "FPO Name": "Nashik Agro Co-op",
        "Status": "Pending",
        "Traceability Timeline": "Harvest → Cold Storage",
        "Cold Chain History": "Temperature maintained between 5-10°C",
    },
}

# Streamlit app
st.set_page_config(page_title="QR Code Verification", layout="wide")
st.title("QR Code Verification")

# QR Code Input
lot_id = st.text_input("Enter Lot ID from QR Code")

if lot_id:
    lot_details = lots.get(lot_id)
    if lot_details:
        st.subheader(f"Details for Lot: {lot_id}")
        st.write(f"**Crop Type**: {lot_details['Crop Type']}")
        st.write(f"**Grade**: {lot_details['Grade']}")
        st.write(f"**Quantity**: {lot_details['Quantity']}")
        st.write(f"**Harvest Date**: {lot_details['Harvest Date']}")
        st.write(f"**FPO Name**: {lot_details['FPO Name']}")
        st.write(f"**Status**: {lot_details['Status']}")

        st.subheader("Traceability Timeline")
        st.write(lot_details["Traceability Timeline"])

        st.subheader("Cold Chain History")
        st.write(lot_details["Cold Chain History"])
    else:
        st.error("Invalid Lot ID. Please check the QR code.")

# Log Scan Event
st.caption(f"Scan logged at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
