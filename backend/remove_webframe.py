with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/templates/dashboard.html', 'r') as f:
    text = f.read()

# Replace the beginning of the frame wrapping
text = text.replace(
'''    <section class="screens-grid-wide">
      <div class="web-frame">
        <div class="dashboard-shell">''',
'''    <section class="screens-grid-wide">
        <div class="dashboard-shell">''')

# Replace the closing div for the frame wrap at the bottom
text = text.replace(
'''          </section>
        </div>
      </div>
    </section>''',
'''          </section>
        </div>
    </section>''')

with open('/media/lab/LocalDisk/Projects/Pune_agri_P4/frontend/templates/dashboard.html', 'w') as f:
    f.write(text)
