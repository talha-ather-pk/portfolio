"""
Generate the "Data portfolio" grid in index.html from the PROJECTS list below.
To add a project or a link (e.g. once 10-17 are published), edit the list and run:  python tools/build_projects.py
Empty links are left out of the page.
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GH = "https://github.com/talha-ather-pk/"
# id, industry, title, result, result label, one line, tools, filter tags, live URL, GitHub repo
PROJECTS = [
    ("01", "Retail", "Superstore sales & profitability", "2.3%", "margin on a third of sales",
     "Four years of orders cleaned into a star schema. Furniture is 35% of sales at a 2.3% margin, and half of all order lines lose money.",
     "Python · Power BI · DAX", "powerbi python", "https://superstore-sales-analysis-phi.vercel.app", "superstore-sales-analysis"),
    ("02", "E-commerce", "Customer segmentation (RFM) & delivery", "24.7%", "of revenue from 7.9% of customers",
     "RFM segments in SQL and a Power BI report with drill-through. A late first delivery cuts repeat purchases by three-quarters.",
     "SQL · Python · Power BI", "powerbi python sql", "https://ecommerce-rfm-segmentation.vercel.app", "ecommerce-rfm-segmentation"),
    ("03", "Retail", "Demand forecasting for 60 stores", "5.9%", "forecast error, half the baseline",
     "Prophet + gradient boosting ensemble with rolling backtests; beats the baseline in every store, including the holiday peak.",
     "Python · Prophet · scikit-learn · Power BI", "powerbi python", "https://retail-demand-forecasting-navy.vercel.app", "retail-demand-forecasting"),
    ("04", "Transport", "Taxi lakehouse on Databricks", "3.5M", "trips, every rejected row explained",
     "Bronze-silver-gold pipeline with PySpark and Delta Lake, incremental MERGE loads and a congestion-fee impact study.",
     "PySpark · Delta Lake · Databricks · Power BI", "powerbi python sql", "https://taxi-lakehouse-databricks.vercel.app", "taxi-lakehouse-databricks"),
    ("05", "Finance · credit risk", "Loan default risk & IFRS 9 ECL", "$6.48M", "loss allowance, backtested",
     "Vintage and roll-rate analysis, an application scorecard tested out of time, and staged expected credit loss with scenarios.",
     "SQL · Python · IFRS 9 · Power BI", "powerbi python sql", "https://loan-default-risk-ifrs9.vercel.app", "loan-default-risk-ifrs9"),
    ("06", "Manufacturing", "Supply chain & inventory analytics", "94.7%", "on time after two transport fixes",
     "OTIF and carrier analysis, ABC-XYZ reorder points (fill rate 99.4%) and a $1.62M profit-leak waterfall.",
     "Python · SQL · Excel · Power BI", "powerbi python sql excel", "https://supply-chain-inventory-analytics.vercel.app", "supply-chain-inventory-analytics"),
    ("07", "HR · people analytics", "Attrition drivers & retention case", "£2.72M", "net benefit of the retention plan",
     "Monthly headcount rebuilt from HR history in SQL, a survival model of resignations and a costed retention package.",
     "Python · SQL · statsmodels · Power BI", "powerbi python sql excel", "https://hr-attrition-analysis-beryl.vercel.app", "hr-attrition-analysis"),
    ("08", "Telecom", "Customer churn tracker", "15×", "churn when a contract ends",
     "One workbook for Excel and Google Sheets, formulas only: cohorts, an at-risk list and a retention business case.",
     "Excel · Google Sheets · Python · SQL", "excel python sql", "https://telco-churn-tracker.vercel.app", "telco-churn-tracker"),
    ("09", "Healthcare", "Hospital cost comparison", "$66M", "a year saved with reference pricing",
     "Medicare-style inpatient data: a charge index that flags 186 high-charging hospitals and a health-plan savings model.",
     "SQL · Python · Power BI", "powerbi python sql", "https://hospital-cost-comparison.vercel.app", "hospital-cost-comparison"),
    ("10", "Real estate", "Property sales & valuation template", "<1%", "valuation bias, vs 7% for the rule of thumb",
     "One row in six of a sales register is not a sale. A hedonic model and an Excel template with time-adjusted comparables.",
     "Python · statsmodels · SQL · Excel", "python sql excel", "", ""),
    ("11", "Accounting", "Bank reconciliation tool", "£0.00", "difference, 12 of 12 errors found",
     "Matches the bank statement to the cash book, finds transposed digits and double postings, and writes the statement and journals.",
     "Python · pandas · openpyxl · pytest", "python excel automation", "", ""),
    ("12", "Food & beverage", "Excel report automation", "5 s", "for a report that took a day",
     "Three messy monthly exports become a formatted management pack with charts and a tie-out, on a schedule.",
     "Python · openpyxl · Task Scheduler · Docker", "python excel automation", "", ""),
    ("13", "E-commerce", "Price scraper & tracker", "1,000", "books scraped, 0 errors",
     "Polite crawler with retries, snapshots in SQLite, change detection between runs and an Excel tracker.",
     "Python · BeautifulSoup · SQLite · Excel", "python excel automation", "", ""),
    ("15", "Retail", "SQL sales database", "11", "tables, 12 business questions",
     "A normalised database for a bike shop's tills, web shop and workshop, with constraints, views and schema tests.",
     "SQL · database design · SQLite", "sql", "", ""),
    ("16", "Services", "Google Sheets weekly report", "0 min", "of Monday reporting",
     "Apps Script builds the summary from the jobs sheet and emails an HTML report every Monday at 07:00.",
     "Apps Script · Google Sheets", "excel automation", "", ""),
    ("17", "Fitness", "Gym KPI tracker web app", "3 gyms", "daily KPIs, trends and targets",
     "Managers log daily numbers; everyone sees week-on-week changes, 90-day trends and the month against target.",
     "React · Firebase · Recharts", "web", "", ""),
]
FILTERS = [("all", "All"), ("powerbi", "Power BI"), ("python", "Python"), ("sql", "SQL"), ("excel", "Excel & Sheets"),
           ("automation", "Automation"), ("web", "Web app")]


def card(p):
    pid, industry, title, result, label, line, tools, tags, live, repo = p
    main = live or (GH + repo if repo else "")
    t = escape(title)
    head = f'<a href="{main}" target="_blank" rel="noopener">{t}</a>' if main else t
    img = f'<img src="/assets/projects/p{pid}.webp" alt="{t}: screenshot" width="800" height="500" loading="lazy">'
    img = f'<a class="pcard-img" href="{main}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">{img}</a>' if main else f'<div class="pcard-img">{img}</div>'
    links = []
    if live:
        links.append(f'<a class="arrow-link plausible-event-name=Project+Click" href="{live}" target="_blank" rel="noopener">Case study</a>')
    if repo:
        links.append(f'<a class="arrow-link plausible-event-name=Project+Click" href="{GH}{repo}" target="_blank" rel="noopener">Code</a>')
    links_html = f'<div class="links">{"".join(links)}</div>' if links else '<div class="links soon">Write-up coming soon</div>'
    return f'''            <article class="pcard" data-tags="{tags}">
              {img}
              <div class="pcard-body">
                <span class="meta">{pid} · {escape(industry)}</span>
                <div class="pcard-result"><span class="num-big">{escape(result)}</span><span class="result-label">{escape(label)}</span></div>
                <h3>{head}</h3>
                <p>{escape(line)}</p>
                <div class="tools">{escape(tools)}</div>
                {links_html}
              </div>
            </article>'''


block = f'''          <!-- DATA-PORTFOLIO:START (generated by tools/build_projects.py; edit the list there) -->
          <div id="data-portfolio">
            <p class="subhead">Data portfolio · {len(PROJECTS)} end-to-end projects</p>
            <p class="pgrid-intro">Each project starts from messy data with a known answer, so every cleaning step and result is checked. Synthetic data, fictional companies, real methods.</p>
            <div class="pfilter" role="group" aria-label="Filter projects by skill">
{chr(10).join(f'              <button type="button" data-filter="{k}"{" aria-pressed=" + chr(34) + "true" + chr(34) if k == "all" else " aria-pressed=" + chr(34) + "false" + chr(34)}>{v}</button>' for k, v in FILTERS)}
            </div>
            <div class="pgrid">
{chr(10).join(card(p) for p in PROJECTS)}
            </div>
          </div>
          <!-- DATA-PORTFOLIO:END -->
'''
idx = ROOT / "index.html"
s = idx.read_text(encoding="utf-8")
if "<!-- DATA-PORTFOLIO:START" in s:
    a = s.index("          <!-- DATA-PORTFOLIO:START"); b = s.index("<!-- DATA-PORTFOLIO:END -->") + len("<!-- DATA-PORTFOLIO:END -->\n")
    s = s[:a] + block + s[b:]
else:
    anchor = '          <p class="subhead">More projects &amp; coursework</p>'
    assert anchor in s
    s = s.replace(anchor, block + "\n" + anchor)
idx.write_text(s, encoding="utf-8")
print(f"wrote {len(PROJECTS)} project cards")
