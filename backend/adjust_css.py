with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/static/krushilink.css', 'r') as f:
    text = f.read()

text = text.replace(
'''.dashboard-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 80vh;
}''',
'''.dashboard-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: calc(100vh - 60px); /* Fill the screen beneath nav */
}''').replace(
'''.page {
  padding: 0px;
  max-width: 100%;
  margin: 0 auto;
}''',
'''.page {
  padding: 0px;
  max-width: 100%;
  margin: 0 auto;
  height: calc(100vh - 60px);
}''')


# The original code might still contain the web-frame classes, even though we removed it from HTML
# Removing references to .web-frame and .web-chrome to clean up codebase

import re
text = re.sub(r'\.web-frame\s*{[^}]*}\n?', '', text)
text = re.sub(r'\.web-chrome\s*{[^}]*}\n?', '', text)
text = re.sub(r'\.chrome-dots\s*{[^}]*}\n?', '', text)
text = re.sub(r'\.chrome-dot\s*{[^}]*}\n?', '', text)
text = re.sub(r'\.chrome-dot:nth-child\(\d+\)\s*{[^}]*}\n?', '', text)
text = re.sub(r'\.chrome-url\s*{[^}]*}\n?', '', text)

with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/static/krushilink.css', 'w') as f:
    f.write(text)
