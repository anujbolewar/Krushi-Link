with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/static/krushilink.css', 'r') as f:
    text = f.read()

# Make sure there is no max-width limiting the main page since grid constraints are removed
text = text.replace(
'''.page {
  padding: 0px;
  max-width: 100%;
  margin: 0 auto;
  height: calc(100vh - 60px);
}''',
'''.page {
  padding: 0px;
  width: 100%;
  margin: 0;
  height: calc(100vh - 60px);
}''')

with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/static/krushilink.css', 'w') as f:
    f.write(text)
