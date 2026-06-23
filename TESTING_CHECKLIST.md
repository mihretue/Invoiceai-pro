# Frontend Testing Checklist

## Authentication
- [ ] Login page loads without errors
- [ ] Valid credentials log in successfully
- [ ] Invalid credentials show error banner
- [ ] Login button shows spinner and disables while pending
- [ ] Redirects to /dashboard on success
- [ ] Signup page loads without errors
- [ ] Password validation checklist (length, uppercase, number) works
- [ ] Confirm password mismatch shows error
- [ ] Name field required (min 2 chars)
- [ ] Redirects to /dashboard on successful signup
- [ ] Logout clears token and redirects to /login
- [ ] Token stored in localStorage under `auth_token`
- [ ] Token sent as Bearer in Authorization header

## Dashboard
- [ ] / redirects to /dashboard
- [ ] Dashboard loads without errors
- [ ] Four MetricCards render with correct labels
- [ ] Skeleton loaders appear while data is fetching
- [ ] BarChart (spend by category) renders
- [ ] LineChart (monthly trend) renders
- [ ] Top vendors list renders with progress bars
- [ ] Empty states show when no data
- [ ] Charts responsive on mobile (grid collapses to 1 column)
- [ ] Recharts tooltips work on hover

## Upload & Invoices
- [ ] UploadZone renders in dashboard and invoices page
- [ ] Drag-and-drop triggers upload
- [ ] Browse Files button opens file picker
- [ ] Invalid file type shows toast error
- [ ] File >10MB shows toast error
- [ ] Upload spinner appears while pending
- [ ] Success state shows with "Upload another" button
- [ ] Invoices list loads extractions from API
- [ ] Search by vendor/invoice # filters rows
- [ ] Category dropdown filter works
- [ ] Status dropdown filter works
- [ ] Clear filters resets all
- [ ] Column sort (vendor, invoice #, date, amount) works
- [ ] Pagination prev/next and page numbers work
- [ ] Click row opens DetailModal

## Edit & Delete
- [ ] Edit button in row opens DetailModal in edit mode
- [ ] Edit button in DocumentTable opens EditModal
- [ ] EditModal pre-populates all fields from extraction
- [ ] Vendor required validation shows error
- [ ] Amount > 0 validation shows error
- [ ] Category required validation shows error
- [ ] Date required validation shows error
- [ ] Save button shows spinner while pending
- [ ] Modal closes and list refreshes on save
- [ ] Delete button shows ConfirmDialog
- [ ] Cancel closes dialog without deleting
- [ ] Confirm deletes and removes from list
- [ ] Toast success on delete
- [ ] Checkbox column selects individual rows
- [ ] Select all checkbox selects page rows
- [ ] Bulk action bar appears when rows selected
- [ ] "Delete selected" opens bulk ConfirmDialog with count
- [ ] Bulk delete removes all selected rows

## Settings
- [ ] Settings page loads all four tabs
- [ ] Account tab shows current email and member-since
- [ ] Save changes calls PUT /api/auth/me
- [ ] Security tab shows current/new/confirm password fields
- [ ] Eye/EyeOff toggles work on all three fields
- [ ] Length validation (< 8 chars) shows error
- [ ] Mismatch validation shows error
- [ ] Password form clears on success
- [ ] Export tab renders filter panel
- [ ] Category, vendor, date filters work
- [ ] Clear filters resets all
- [ ] Export CSV button triggers download named invoices-YYYY-MM-DD.csv
- [ ] Export JSON button triggers download named invoices-YYYY-MM-DD.json
- [ ] Export buttons show spinner while pending
- [ ] Preferences tab dark mode toggle works

## Navigation
- [ ] All nav links route correctly (/dashboard, /invoices, /settings)
- [ ] Active link is highlighted
- [ ] Avatar click triggers logout
- [ ] Mobile hamburger opens/closes menu
- [ ] Mobile menu links navigate and close menu
- [ ] Mobile menu "Sign out" works
- [ ] Theme toggle (sun/moon) switches dark/light

## Error Handling
- [ ] API 401 response disables query retry and redirects to /login
- [ ] Failed upload shows error toast
- [ ] Failed save shows error toast
- [ ] Failed delete shows error toast
- [ ] ErrorBoundary renders fallback on unhandled React error
- [ ] "Reload page" button in ErrorBoundary works

## Performance
- [ ] Pages load in < 3 seconds on fast connection
- [ ] No console errors on any page
- [ ] TanStack Query cache prevents redundant API calls
- [ ] Dashboard charts render smoothly (no jank)

## Mobile (375px)
- [ ] No horizontal overflow
- [ ] Dashboard metric cards stack vertically
- [ ] Charts are scrollable if needed
- [ ] Table is horizontally scrollable
- [ ] Modals fit within viewport
- [ ] Buttons are min 44px tap target
