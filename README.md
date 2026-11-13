Delivery Horizon estimates supplier arrivals and customer deliveries and checks whether a requested delivery date is feasible. The calendar starts with 12 months and can expand to 24.

- **Supplier lead time** adds the selected number of calendar weeks to the order date, then moves the estimate forward to the next working day.
- **Gap Days** add seven calendar days to the supplier estimate before applying the working-day rules again. When the estimates fall in different months, the planner recalculates from the first available day in the delivery month to align billing.
- **Requested delivery** can be up to seven calendar days earlier than the estimate. The planner moves an accepted date to the next working day when needed and recalculates the supplier estimate. Earlier requests trigger a warning.

Open `index.html` and select **English** in the sidebar. The language updates immediately and is saved in your browser. Enter an order date, supplier lead time and an optional requested delivery date. Double-click a calendar date to use it in the plan.

The planner excludes weekends and company closures. **Skip Italian public holidays** is enabled by default. Use **Manage Company Closures** to record company breaks or local holidays. Closure names and the language preference are stored in the browser.

Keep `index.html`, `style.css` and `app.js` together. No build step is required. To publish with GitHub Pages, use the branch root containing `index.html` as the source.
