# Analytics Dashboard for Pokémon or Drug Game
# Visualizes games over time and by league

library(tidyverse)
library(dashboardr)
library(lubridate)
library(gt)
library(jsonlite)

# Fetch data from Google Sheets
csv_url <- "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKvOHhK-Rw71DILu_X0ydZCS86KF2TeCyLrNAQx_MQsQN0mIPEteIO_V86DUerFO_JpwZmieGXLW-P/pub?gid=923170622&single=true&output=csv"

# Read the CSV data
games_data <- read_csv(csv_url, show_col_types = FALSE)

# Process the data
games_processed <- games_data %>%
  mutate(
    Date = as_datetime(Date),
    Date_Date = as_date(Date),
    Date_Hour = hour(Date),
    Date_Day = day(Date),
    Date_Month = month(Date),
    Date_Year = year(Date),
    Date_Week = week(Date),
    Date_Weekday = wday(Date, label = TRUE, abbr = FALSE),
    League = factor(League, levels = c("boulder", "cascade", "volcano", "earth", "custom")),
    Mode = factor(Mode, levels = c("single", "multiplayer"))
  ) %>%
  filter(!is.na(Date)) %>%
  arrange(Date)

# Get last updated timestamp (needed early for content)
last_updated <- format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")
last_updated_iso <- format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z")

# Create aggregated data for league statistics
league_stats <- games_processed %>%
  group_by(League) %>%
  summarise(
    TotalGames = n(),
    AvgScore = round(mean(Score, na.rm = TRUE), 0),
    AvgAccuracy = round(mean(Accuracy, na.rm = TRUE), 1),
    AvgSpeed = round(mean(AvgSpeed, na.rm = TRUE), 0),
    .groups = "drop"
  ) %>%
  mutate(
    League = factor(League, levels = c("boulder", "cascade", "volcano", "earth", "custom"))
  ) %>%
  arrange(League)

# Add hourly floor to processed data for timeline
games_processed <- games_processed %>%
  mutate(
    Date_Hour_Floor = floor_date(Date, unit = "hour")  # Round down to nearest hour
  )

# Pre-aggregate data for timeline: count games per hour per league
# This creates a dataset where each row = one hour-league combination with a count
# Filter out NA leagues first and ensure Date_Hour_Floor is POSIXct
games_hourly_agg <- games_processed %>%
  filter(!is.na(League), !is.na(Date_Hour_Floor)) %>%
  count(Date_Hour_Floor, League, name = "GameCount") %>%
  mutate(
    Date_Hour_Floor = as.POSIXct(Date_Hour_Floor),  # Ensure it's POSIXct for timeline
    League = factor(League, levels = c("boulder", "cascade", "volcano", "earth", "custom"))
  ) %>%
  arrange(Date_Hour_Floor, League) %>%
  # Ensure we have complete data (fill missing hour-league combinations with 0)
  complete(Date_Hour_Floor, League, fill = list(GameCount = 0))

# Verify aggregation worked
cat("Hourly aggregation summary:\n")
cat("  Total hour-league combinations:", nrow(games_hourly_agg), "\n")
cat("  Date range:", format(range(games_hourly_agg$Date_Hour_Floor)), "\n")
cat("  Sample counts:", paste(head(games_hourly_agg$GameCount, 5), collapse = ", "), "\n")

# Create visualizations for games over time
time_vizzes <- create_viz() %>%
  # Games per hour over time - line chart showing actual hours with dates
  # Using pre-aggregated data with numeric response_var (GameCount) and group_var (League)
  # This makes timeline calculate the mean of counts per league per hour = the count itself!
  add_viz(
    type = "timeline",
    time_var = "Date_Hour_Floor",
    response_var = "GameCount",  # Numeric - actual count of games
    group_var = "League",        # Group by league
    chart_type = "line",
    title = "Games Played Over Time by League",
    subtitle = "Number of games per hour over time, grouped by league (line chart)",
    x_label = "Date & Time",
    y_label = "Number of Games",
    tabgroup = "time",
    data = "hourly_agg"  # Use pre-aggregated dataset
  ) %>%
  # Games per hour of day (aggregated across all days)
  add_viz(
    type = "bar",
    x_var = "Date_Hour",
    group_var = "League",
    title = "Games by Hour of Day",
    subtitle = "Distribution of games across hours of the day (0-23), grouped by league",
    x_label = "Hour of Day (0-23)",
    y_label = "Number of Games",
    bar_type = "count",
    horizontal = FALSE,
    tabgroup = "time"
  ) %>%
  # Games by day of week
  add_viz(
    type = "bar",
    x_var = "Date_Weekday",
    group_var = "League",
    title = "Games by Day of Week",
    subtitle = "Distribution of games across days of the week",
    x_label = "Day of Week",
    y_label = "Number of Games",
    bar_type = "count",
    horizontal = FALSE,
    tabgroup = "time"
  )

# Create league analysis page with content and visualizations
league_content <- create_content() %>%
  add_text(md_text(
    "# League Performance Statistics",
    "",
    paste0("**Last Updated**: ", last_updated, " (data fetched from Google Sheets)"),
    "",
    "The table below shows aggregated statistics for each league:",
    ""
  )) %>%
  add_gt(
    league_stats %>%
      gt::gt() %>%
      gt::tab_header(
        title = "League Statistics",
        subtitle = "Performance metrics by difficulty level"
      ) %>%
      gt::cols_label(
        League = "League",
        TotalGames = "Total Games",
        AvgScore = "Avg Score",
        AvgAccuracy = "Avg Accuracy (%)",
        AvgSpeed = "Avg Speed (ms)"
      ) %>%
      gt::fmt_number(
        columns = c(AvgScore, AvgSpeed),
        decimals = 0
      ) %>%
      gt::fmt_number(
        columns = AvgAccuracy,
        decimals = 1
      )
  ) %>%
  add_spacer(height = "1rem") %>%
  add_text(md_text(
    "## Visualizations",
    ""
  ))

league_vizzes <- create_viz() %>%
  # Games by league
  add_viz(
    type = "bar",
    x_var = "League",
    title = "Total Games by League",
    subtitle = "Overall distribution of games across leagues",
    x_label = "League",
    y_label = "Number of Games",
    bar_type = "count",
    horizontal = TRUE,
    tabgroup = "league"
  )

# Create summary statistics for value boxes
total_games <- nrow(games_processed)
total_players <- n_distinct(games_processed$Name)
avg_score <- round(mean(games_processed$Score, na.rm = TRUE), 0)
avg_accuracy <- round(mean(games_processed$Accuracy, na.rm = TRUE), 1)

# Create comprehensive JavaScript for dynamic data loading
# This will fetch fresh data and update Highcharts charts automatically
dynamic_js <- '
<script>
// Dynamic Data Loader for Pokémon or Drug Analytics Dashboard
// Fetches fresh data from Google Sheets and updates all Highcharts charts

(function() {
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQKvOHhK-Rw71DILu_X0ydZCS86KF2TeCyLrNAQx_MQsQN0mIPEteIO_V86DUerFO_JpwZmieGXLW-P/pub?gid=923170622&single=true&output=csv";
  
  // Simple CSV parser
  function parseCSV(text) {
    const lines = text.split("\\n").filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => {
        let value = values[i]?.trim() || "";
        // Try to parse numbers
        if (value && !isNaN(value) && value !== "") {
          obj[header] = parseFloat(value);
        } else {
          obj[header] = value;
        }
      });
      return obj;
    }).filter(row => row.Date && row.League);
  }
  
  // Process date
  function parseDate(dateStr) {
    const date = new Date(dateStr);
    return {
      date: date,
      dateOnly: date.toISOString().split("T")[0],
      hour: date.getHours(),
      weekday: date.toLocaleDateString("en-US", { weekday: "long" })
    };
  }
  
  // Aggregate data for timeline (games per hour by league)
  function aggregateTimelineData(data) {
    const hourly = {};
    
    // Check if data is already aggregated (has GameCount) or raw (needs counting)
    const isAggregated = data.length > 0 && data[0].hasOwnProperty("GameCount");
    
    if (isAggregated) {
      // Data is pre-aggregated: Date_Hour_Floor, League, GameCount
      data.forEach(row => {
        if (!row.Date_Hour_Floor || !row.League) return;
        
        const date = new Date(row.Date_Hour_Floor);
        if (isNaN(date.getTime())) {
          console.warn("Invalid date:", row.Date_Hour_Floor);
          return;
        }
        
        const key = date.getTime();
        const league = String(row.League).toLowerCase();
        
        if (!hourly[key]) hourly[key] = {};
        hourly[key][league] = (hourly[key][league] || 0) + (row.GameCount || 0);
      });
    } else {
      // Raw data: need to count games per hour per league
      data.forEach(row => {
        if (!row.Date || !row.League) return;
        
        const date = new Date(row.Date);
        if (isNaN(date.getTime())) {
          console.warn("Invalid date:", row.Date);
          return;
        }
        
        // Round down to nearest hour
        const hourFloor = new Date(date);
        hourFloor.setMinutes(0, 0, 0);
        hourFloor.setSeconds(0, 0);
        hourFloor.setMilliseconds(0);
        const key = hourFloor.getTime();
        
        if (!hourly[key]) hourly[key] = {};
        const league = String(row.League).toLowerCase();
        hourly[key][league] = (hourly[key][league] || 0) + 1;
      });
    }
    
    // Convert to array format for Highcharts (line chart - counts)
    const leagues = ["boulder", "cascade", "volcano", "earth", "custom"];
    const series = {};
    leagues.forEach(league => series[league] = []);
    
    // Sort timestamps and create data points
    const sortedTimestamps = Object.keys(hourly).map(Number).sort((a, b) => a - b);
    
    sortedTimestamps.forEach(timestamp => {
      leagues.forEach(league => {
        const count = hourly[timestamp][league] || 0;
        // Include all points, even zeros, for continuity
        series[league].push([timestamp, count]);
      });
    });
    
    console.log("Aggregated timeline data:", {
      isAggregated: isAggregated,
      totalHours: sortedTimestamps.length,
      seriesLengths: Object.keys(series).map(l => ({ 
        league: l, 
        points: series[l].length,
        totalCount: series[l].reduce((sum, p) => sum + p[1], 0)
      }))
    });
    
    return series;
  }
  
  // Aggregate data for bar charts (count by category and group)
  function aggregateBarData(data, xVar, groupVar) {
    const counts = {};
    data.forEach(row => {
      let xValue = row[xVar];
      if (xVar === "Date_Hour") xValue = parseDate(row.Date).hour;
      if (xVar === "Date_Weekday") xValue = parseDate(row.Date).weekday;
      
      const group = row[groupVar] || "All";
      const key = `${xValue}|${group}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    
    // Organize by group
    const groups = {};
    Object.keys(counts).forEach(key => {
      const [xValue, group] = key.split("|");
      if (!groups[group]) groups[group] = [];
      groups[group].push([xValue, counts[key]]);
    });
    
    return groups;
  }
  
  // Update timeline chart (line chart) - fix initial render and update with counts
  function updateTimelineChart(chart, data) {
    if (!chart) {
      console.error("Chart is null or undefined");
      return;
    }
    
    console.log("Updating timeline chart, chart has", chart.series.length, "series");
    
    // Get count data (not percentages)
    const seriesData = aggregateTimelineData(data);
    const leagues = ["boulder", "cascade", "volcano", "earth", "custom"];
    
    // Check if chart has existing series or if we need to recreate them
    if (chart.series.length === 0) {
      console.log("Chart has no series, creating new ones...");
      // Create new series
      leagues.forEach((league, idx) => {
        const dataPoints = seriesData[league] || [];
        if (dataPoints.length > 0) {
          chart.addSeries({
            name: league.charAt(0).toUpperCase() + league.slice(1),
            data: dataPoints,
            type: "line"
          }, false);
        }
      });
    } else {
      // Update existing series
      leagues.forEach((league, idx) => {
        const dataPoints = seriesData[league] || [];
        if (chart.series[idx]) {
          chart.series[idx].setData(dataPoints, false);
          chart.series[idx].update({ name: league.charAt(0).toUpperCase() + league.slice(1) }, false);
        } else if (dataPoints.length > 0) {
          // Add missing series
          chart.addSeries({
            name: league.charAt(0).toUpperCase() + league.slice(1),
            data: dataPoints,
            type: "line"
          }, false);
        }
      });
    }
    
    // Ensure chart type is line (not area)
    if (chart.options.chart && chart.options.chart.type !== "line") {
      chart.update({ chart: { type: "line" } }, false);
    }
    
    // Update y-axis to show counts
    if (chart.yAxis && chart.yAxis[0]) {
      chart.yAxis[0].update({ 
        title: { text: "Number of Games" },
        min: 0
      }, false);
    }
    
    chart.redraw();
    console.log("✅ Timeline chart updated with", data.length, "games,", chart.series.length, "series");
  }
  
  // Update bar chart
  function updateBarChart(chart, data, xVar, groupVar) {
    const groups = aggregateBarData(data, xVar, groupVar);
    const groupNames = Object.keys(groups).sort();
    
    groupNames.forEach((groupName, idx) => {
      if (chart.series[idx]) {
        chart.series[idx].setData(groups[groupName] || [], false);
      }
    });
    chart.redraw();
  }
  
  // Update simple bar chart (no grouping)
  function updateSimpleBarChart(chart, data, xVar) {
    const counts = {};
    data.forEach(row => {
      let value = row[xVar];
      if (xVar === "League") value = row.League;
      counts[value] = (counts[value] || 0) + 1;
    });
    
    const seriesData = Object.keys(counts).map(key => [key, counts[key]]);
    if (chart.series[0]) {
      chart.series[0].setData(seriesData, false);
      chart.redraw();
    }
  }
  
  // Update last updated timestamp display
  function updateLastUpdatedTimestamp() {
    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    });
    
    // Update all "Last Updated" elements
    document.querySelectorAll("strong").forEach(el => {
      if (el.textContent.includes("Last Updated")) {
        el.textContent = "Last Updated: " + formatted + " (data fetched from Google Sheets)";
      }
    });
    
    // Also try to find and update in parent elements
    document.querySelectorAll("p").forEach(el => {
      if (el.textContent.includes("Last Updated")) {
        el.innerHTML = "<strong>Last Updated</strong>: " + formatted + " (data fetched from Google Sheets)";
      }
    });
  }
  
  // Main function to update all charts
  async function updateAllCharts() {
    try {
      console.log("Fetching fresh data from Google Sheets...");
      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      const freshData = parseCSV(csvText);
      
      console.log(`Loaded ${freshData.length} games`);
      
      // Update last updated timestamp
      updateLastUpdatedTimestamp();
      
      // Wait for Highcharts to be ready
      if (typeof Highcharts === "undefined" || !Highcharts.charts) {
        console.log("Waiting for Highcharts to load...");
        setTimeout(updateAllCharts, 500);
        return;
      }
      
      // Update all charts
      Highcharts.charts.forEach((chart, idx) => {
        if (!chart) return;
        
        try {
          const container = chart.renderTo;
          const title = chart.options.title?.text || "";
          
          // Identify chart type and update accordingly
          if (title.includes("Over Time") || title.includes("Timeline") || title.includes("Games Played")) {
            // For timeline, we need to aggregate fresh data by hour
            updateTimelineChart(chart, freshData);
          } else if (title.includes("Hour") && !title.includes("Over Time")) {
            // Bar chart for hour of day (not timeline)
            updateBarChart(chart, freshData, "Date_Hour", "League");
          } else if (title.includes("Day of Week") || title.includes("Weekday")) {
            updateBarChart(chart, freshData, "Date_Weekday", "League");
          } else if (title.includes("Total Games by League")) {
            updateSimpleBarChart(chart, freshData, "League");
          }
        } catch (error) {
          console.warn(`Error updating chart ${idx}:`, error);
        }
      });
      
      // Update summary metrics if they exist
      updateSummaryMetrics(freshData);
      
      console.log("✅ Charts updated with fresh data!");
      console.log("   Updated", Highcharts.charts.filter(c => c).length, "charts");
      
    } catch (error) {
      console.error("❌ Error loading fresh data:", error);
    }
  }
  
  // Update summary metrics
  function updateSummaryMetrics(data) {
    const totalGames = data.length;
    const uniquePlayers = new Set(data.map(d => d.Name)).size;
    const avgScore = Math.round(data.reduce((sum, d) => sum + (d.Score || 0), 0) / totalGames);
    const avgAccuracy = (data.reduce((sum, d) => sum + (d.Accuracy || 0), 0) / totalGames).toFixed(1);
    
    // Try to update metric elements (adjust selectors based on actual structure)
    document.querySelectorAll(".metric-value, [class*=\"value\"]").forEach((el, idx) => {
      const values = [totalGames, uniquePlayers, avgScore, avgAccuracy + "%"];
      if (values[idx]) {
        el.textContent = values[idx];
      }
    });
  }
  
  // Initialize when page loads
  function initDynamicUpdates() {
    console.log("🔄 Dynamic data loader initialized");
    console.log("   Will fetch fresh data from:", CSV_URL);
    
    // Wait for Highcharts to be ready, then update
    function waitAndUpdate() {
      if (typeof Highcharts !== "undefined" && Highcharts.charts && Highcharts.charts.length > 0) {
        console.log("   Highcharts ready, updating charts...");
        updateAllCharts();
      } else {
        console.log("   Waiting for Highcharts...");
        setTimeout(waitAndUpdate, 500);
      }
    }
    
    // Start checking after a short delay
    setTimeout(waitAndUpdate, 1500);
    
    // Also update every 5 minutes
    setInterval(function() {
      console.log("⏰ Scheduled update (every 5 minutes)");
      updateAllCharts();
    }, 5 * 60 * 1000);
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDynamicUpdates);
  } else {
    initDynamicUpdates();
  }
  
})();
</script>
'

# Create the dashboard
dashboard <- create_dashboard(
  output_dir = "analytics",
  title = "Pokémon or Drug - Game Analytics",
  github = "https://github.com/favstats/pokemon-or-drug",
  twitter = "https://twitter.com/favstats",
  search = TRUE,
  author = "Pokémon or Drug Team",
  description = "Analytics dashboard for Pokémon or Drug game showing games over time and by league",
  page_footer = "© 2025 Pokémon or Drug - Built with dashboardr",
  date = format(Sys.Date(), "%Y-%m-%d"),
  tabset_theme = "modern",
  breadcrumbs = TRUE,
  page_navigation = TRUE,
  back_to_top = TRUE,
  reader_mode = TRUE,
  repo_url = "https://github.com/favstats/pokemon-or-drug",
  repo_actions = c("edit", "source", "issue"),
  navbar_style = "dark",
  navbar_brand = "🎮 Pokémon or Drug Analytics",
  navbar_toggle = "collapse",
  code_folding = "hide",
  code_tools = TRUE,
  value_boxes = TRUE,
  page_layout = "full",
  publish_dir = "."  # Output directly to analytics/ instead of analytics/docs/
) %>%
  # Landing page with dynamic data loading
  add_page(
    name = "Overview",
    icon = "ph:house",
    is_landing_page = TRUE,
    content = create_content() %>%
      add_text(md_text(
        "# Pokémon or Drug - Game Analytics",
        "",
        paste0("**Last Updated**: ", last_updated, " (data fetched from Google Sheets)"),
        "",
        "Welcome to the analytics dashboard for **Pokémon or Drug**!",
        "This dashboard provides insights into game play patterns, league preferences, and player performance.",
        "",
        "> **🔄 Live Data**: This dashboard automatically fetches fresh data from Google Sheets on page load and updates every 5 minutes.",
        ""
      )) %>%
      add_spacer(height = "1rem") %>%
      # Add metrics
      add_metric(value = as.character(total_games), title = "Total Games", icon = "ph:game-controller", color = "#2E86AB") %>%
      add_metric(value = as.character(total_players), title = "Unique Players", icon = "ph:users", color = "#F18F01") %>%
      add_metric(value = as.character(avg_score), title = "Average Score", icon = "ph:trophy", color = "#A23B72") %>%
      add_metric(value = paste0(avg_accuracy, "%"), title = "Average Accuracy", icon = "ph:target", color = "#2E8B57") %>%
      add_spacer(height = "1rem") %>%
      add_html(html = dynamic_js) %>%
      add_callout(
        md_text(
          "Explore the dashboard to see:",
          "",
          "- **Games Over Time**: Daily trends and hourly patterns",
          "- **League Analysis**: Performance metrics by difficulty level",
          "- **Player Insights**: Score distributions and accuracy trends"
        ),
        type = "tip",
        title = "What's Inside"
      )
  ) %>%
  # Games over time page - use both raw and aggregated data
  add_page(
    name = "Games Over Time",
    data = list(
      data = games_processed,      # Raw data for bar charts
      hourly_agg = games_hourly_agg # Pre-aggregated hourly data for timeline
    ),
    content = list(
      create_content() %>%
        add_text(md_text(
          paste0("**Last Updated**: ", last_updated, " (data fetched from Google Sheets)"),
          ""
        )),
      time_vizzes
    ),
    icon = "ph:chart-line"
  ) %>%
  # League analysis page
  add_page(
    name = "League Analysis",
    data = games_processed,
    content = list(league_content, league_vizzes),
    icon = "ph:trophy"
  )

# Export data as JSON for dynamic loading
cat("\n=== Exporting Data for Dynamic Loading ===\n")
jsonlite::write_json(
  list(
    games = games_processed,
    league_stats = league_stats,
    summary = list(
      total_games = total_games,
      total_players = total_players,
      avg_score = avg_score,
      avg_accuracy = avg_accuracy
    ),
    last_updated = as.character(Sys.time())
  ),
  path = "analytics/data.json",
  pretty = TRUE
)
cat("✅ Data exported to analytics/data.json\n")

# Generate the dashboard
cat("\n=== Generating Analytics Dashboard ===\n")
generate_dashboard(dashboard, render = TRUE, open = T)

# Ensure data.json is in the output directory (it's already there from write_json)

cat("\n✅ Dashboard generated successfully!\n")
cat("📁 Output directory: analytics/ (files are directly in this folder, ready for GitHub Pages)\n")
cat("🌐 Dashboard will be available at: https://favstats.github.io/pokemon-or-drug/analytics/\n")
cat("\n💡 Dynamic Data Loading:\n")
cat("   ✅ JavaScript automatically fetches fresh data from Google Sheets on page load\n")
cat("   ✅ All Highcharts charts update automatically with fresh data\n")
cat("   ✅ Data refreshes every 5 minutes automatically\n")
cat("   ✅ Works entirely within the dashboardr system - no external dependencies needed\n")
cat("\n📝 Alternative options:\n")
cat("     1. GitHub Actions: Set up automatic regeneration (already configured)\n")
cat("     2. Manual: Run analytics.R script to regenerate with fresh data\n")
cat("     3. Dynamic JS: Already enabled! Charts update automatically on page load\n")

