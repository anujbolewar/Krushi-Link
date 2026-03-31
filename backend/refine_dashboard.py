with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/templates/dashboard.html', 'r') as f:
    content = f.read()

content = content.replace(
'''    <section class="section-header">
      <h1 class="section-title">FPO Overview</h1>
      <p class="section-sub">Snapshot of your cooperative’s export pipeline.</p>
    </section>

    <section class="screens-grid-wide">
      <div class="web-frame">
        <div class="web-chrome">
          <div class="chrome-dots">
            <span class="chrome-dot"></span>
            <span class="chrome-dot"></span>
            <span class="chrome-dot"></span>
          </div>
          <div class="chrome-url">https://agrovault.local/dashboard</div>
        </div>
        <div class="dashboard-shell">
          <aside class="dash-sidebar">
            <div class="dash-sidebar-title">FPO Dashboard</div>
            <nav class="dash-nav">
              <button class="dash-nav-item active">Overview</button>
              <button class="dash-nav-item">Lots</button>
              <button class="dash-nav-item">Members</button>
              <button class="dash-nav-item">Negotiations</button>
              <button class="dash-nav-item">Documents</button>
              <button class="dash-nav-item">Settings</button>
            </nav>
          </aside>
          <section class="dash-main">''',
'''    <section class="screens-grid-wide">
      <div class="web-frame">
        <div class="dashboard-shell">
          <aside class="dash-sidebar">
            <div class="dash-sidebar-title">FPO Dashboard</div>
            <nav class="dash-nav">
              <button class="dash-nav-item active">Overview</button>
              <button class="dash-nav-item">Lots</button>
              <button class="dash-nav-item">Members</button>
              <button class="dash-nav-item">Negotiations</button>
              <button class="dash-nav-item">Documents</button>
              <button class="dash-nav-item">Settings</button>
            </nav>
          </aside>
          <section class="dash-main">

            <section class="section-header" style="border-bottom: none; margin-bottom: 0px;">
              <h1 class="section-title">FPO Overview</h1>
              <p class="section-sub">Snapshot of your cooperative’s export pipeline.</p>
            </section>
''')

with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/templates/dashboard.html', 'w') as f:
    f.write(content)
