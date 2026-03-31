import streamlit as st
from datetime import datetime

# Mock data for negotiations
negotiations = [
    {
        "Buyer": "Buyer A",
        "Lot ID": "MANGO-20260301-0001",
        "Offer": "₹120/kg",
        "Status": "Pending",
        "Timestamp": "2026-03-30 10:00:00",
    },
    {
        "Buyer": "Buyer B",
        "Lot ID": "POMEGRANATE-20260302-0002",
        "Offer": "₹100/kg",
        "Status": "Countered",
        "Timestamp": "2026-03-30 11:00:00",
    },
]

# Streamlit app
st.set_page_config(page_title="Negotiations", layout="wide")
st.title("Negotiations")

# Pending Bids Table
st.header("Pending Bids")
st.table(negotiations)

# Actions for Negotiations
st.header("Actions")
selected_negotiation = st.selectbox("Select Negotiation", [n["Lot ID"] for n in negotiations])
selected = next(n for n in negotiations if n["Lot ID"] == selected_negotiation)
st.json(selected)

col1, col2, col3 = st.columns(3)
if col1.button("Accept"):
    st.success("Bid accepted!")
if col2.button("Counter"):
    st.info("Counter offer sent!")
if col3.button("Decline"):
    st.warning("Bid declined!")
