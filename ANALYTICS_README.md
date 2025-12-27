# Analytics Dashboard Setup

This directory contains the R script to generate the analytics dashboard for Pokémon or Drug game.

## Running the Dashboard

1. Make sure you have the required R packages installed:
```r
install.packages(c("tidyverse", "lubridate", "gt", "jsonlite"))
# Install dashboardr from GitHub if not already installed
devtools::install_github("favstats/dashboardr")
```

2. Run the analytics script:
```r
source("analytics.R")
```

This will:
- Fetch fresh data from the Google Sheets CSV
- Process and aggregate the data
- Export data as JSON for reference
- Generate visualizations for games over time and by league
- Create the dashboard directly in the `analytics/` directory (ready for GitHub Pages)

## Publishing to GitHub Pages

The dashboard is configured to output directly to `analytics/` (no `/docs` subfolder).

1. After running `analytics.R`, commit and push:
```bash
git add analytics/
git commit -m "Update analytics dashboard"
git push
```

2. The dashboard will be available at: `https://favstats.github.io/pokemon-or-drug/analytics/`

## Automatic Updates (GitHub Actions)

A GitHub Actions workflow (`.github/workflows/update-analytics.yml`) is configured to automatically regenerate the dashboard every hour with fresh data from Google Sheets.

- The workflow runs on a schedule (every hour)
- It can also be triggered manually from the Actions tab
- It automatically commits and pushes updates if the data has changed

To enable automatic updates, ensure the workflow file is committed to your repository.

## Dashboard Features

- **Overview Page**: Summary statistics and key metrics
- **Games Over Time**: 
  - Timeline showing games per day by league
  - Games by hour of day
  - Games by day of week
- **League Analysis**:
  - Statistics table with averages
  - Total games by league visualization

## Data Source

The dashboard fetches data from a Google Sheets CSV that is automatically updated with game results.

