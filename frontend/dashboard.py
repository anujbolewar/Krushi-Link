import streamlit as st
import plotly.express as px
from datetime import datetime
from streamlit_option_menu import option_menu
from babel.dates import format_date
from babel.numbers import format_currency

# Mock data for KPIs
kpis = {
    "total_active_lots": 12,
    "total_members": 180,
    "pending_negotiations": 4,
    "total_revenue": 1250000,
}

# Mock data for heatmap and timeline
heatmap_data = {
    "Crop": ["Mango", "Pomegranate", "Onion", "Grape"],
    "Price": [120, 80, 40, 150],
    "Date": ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"],
}

timeline_data = {
    "Event": ["Harvest", "Cold Storage", "Transport", "Buyer Handoff"],
    "Date": ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"],
}

# Streamlit app
st.set_page_config(page_title="FPO Dashboard", layout="wide")
st.title("FPO Dashboard")

# Language Selector
language = option_menu(
    "Language",
    ["English", "Hindi", "Marathi"],
    icons=["globe", "globe", "globe"],
    menu_icon="cast",
    default_index=0,
    orientation="horizontal",
)

# Format dates and numbers based on language
formatted_date = format_date(datetime.now(), locale="hi" if language == "Hindi" else "mr" if language == "Marathi" else "en")
formatted_currency = format_currency(kpis["total_revenue"], "INR", locale="hi" if language == "Hindi" else "mr" if language == "Marathi" else "en")

# KPI Section
st.header("Key Performance Indicators")
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Active Lots", kpis["total_active_lots"])
col2.metric("Total Members", kpis["total_members"])
col3.metric("Pending Negotiations", kpis["pending_negotiations"])
col4.metric("Total Revenue", formatted_currency)

st.caption(f"Data as of {formatted_date}")

# Heatmap Section
st.header("Price Heatmap")
fig = px.bar(heatmap_data, x="Crop", y="Price", title="Price Heatmap")
st.plotly_chart(fig, use_container_width=True)

# Timeline Section
st.header("Traceability Timeline")
fig = px.timeline(timeline_data, x_start="Date", x_end="Date", y="Event", title="Traceability Timeline")
st.plotly_chart(fig, use_container_width=True)
