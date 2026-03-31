with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/static/krushilink.css', 'r') as f:
    content = f.read()

content = content.replace(
'''.dashboard-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 540px;
}''',
'''.dashboard-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 80vh;
}''').replace(
'''.page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}''',
'''.page {
  padding: 0px;
  max-width: 100%;
  margin: 0 auto;
}''').replace(
'''.web-frame {
  background: var(--surface);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-2);
  border: 1px solid var(--border);
}''',
'''.web-frame {
  background: var(--surface);
  border-radius: 0px;
  overflow: hidden;
  border-top: none;
  border: none;
}''').replace(
'''.site-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--green-900);
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 32px;
  height: 60px;
  box-shadow: 0 2px 12px rgba(0,0,0,.25);
}''',
'''.site-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--green-900);
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 16px;
  height: 60px;
  box-shadow: 0 2px 12px rgba(0,0,0,.25);
}''')

with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/static/krushilink.css', 'w') as f:
    f.write(content)
