import { test, expect } from '@playwright/test';

test.describe('TicketDesk End-to-End Workflow & Integration Suite', () => {
  const timestamp = Date.now();
  const testEmployeeEmail = `test.employee.${timestamp}@ticketdesk.local`;
  const testEmployeeName = `Test Employee ${timestamp}`;
  const testPassword = 'Password@12345';
  let createdTicketNumber = '';

  test('Scenario 1 & 2: Employee Registration and Immediate Login', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[placeholder="Jane Doe"]', testEmployeeName);
    await page.fill('input[placeholder="jane.doe@company.com"]', testEmployeeEmail);
    await page.fill('input[placeholder="At least 8 characters"]', testPassword);
    await page.fill('input[placeholder="Re-enter password"]', testPassword);

    await page.click('button:has-text("Complete Registration")');

    // Should redirect to Dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=EMPLOYEE')).toBeVisible();
  });

  test('Scenario 3 & 4: Employee Creates Ticket and Opens Ticket Details', async ({ page }) => {
    // Log in with created employee
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmployeeEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');

    await page.goto('/tickets/new');
    await page.fill('input[placeholder*="Brief summary"]', `VPN Tunnel Dropping - E2E ${timestamp}`);
    await page.selectOption('select:has-text("Hardware")', 'NETWORK');
    await page.selectOption('select:has-text("Low")', 'HIGH');
    await page.fill('textarea[placeholder*="Explain the technical problem"]', 'Automated test issue description for Playwright validation.');

    await page.click('button:has-text("Submit Ticket")');

    // Wait for submission confirmation
    const ticketIdElement = page.locator('strong.font-mono');
    await expect(ticketIdElement).toBeVisible();
    createdTicketNumber = (await ticketIdElement.textContent()) || '';
    expect(createdTicketNumber).toMatch(/TKT-\d+/);

    // Open ticket details
    await page.click('button:has-text("View Ticket Details")');
    await expect(page.locator(`text=${createdTicketNumber}`)).toBeVisible();
    await expect(page.locator('text=Open')).toBeVisible();
  });

  test('Scenario 5: Employee Adds Comment through .NET 8 Microservice', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmployeeEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');

    await page.goto('/tickets');
    await page.click(`text=View`);

    // Add comment
    const commentText = `Providing additional diagnostic logs from client workstation at ${timestamp}`;
    await page.fill('textarea[placeholder*="Type your comment"]', commentText);
    await page.click('button:has-text("Post Comment")');

    await expect(page.locator(`text=${commentText}`)).toBeVisible();
  });

  test('Scenario 6, 7 & 8: Support Agent Assigns Ticket and Updates Status to IN_PROGRESS', async ({ page }) => {
    // Log in as pre-seeded Support Agent
    await page.goto('/login');
    await page.click('button:has-text("Support Agent")'); // Clicks preset quick-fill
    await page.click('button:has-text("Sign In")');

    await page.goto('/tickets');
    await page.click(`text=View`);

    // Verify Agent has workflow controls
    const statusSelect = page.locator('select:has-text("OPEN")').first();
    await expect(statusSelect).toBeVisible();

    // Change status to IN_PROGRESS
    await statusSelect.selectOption('IN_PROGRESS');
    await expect(page.locator('text=In Progress').first()).toBeVisible();
  });

  test('Scenario 9 & 10: Support Agent Resolves Ticket and Verifies Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Support Agent")');
    await page.click('button:has-text("Sign In")');

    await page.goto('/tickets');
    await page.click(`text=View`);

    const statusSelect = page.locator('select:has-text("IN_PROGRESS")').first();
    await statusSelect.selectOption('RESOLVED');
    await expect(page.locator('text=Resolved').first()).toBeVisible();

    // Check dashboard KPI reflects resolution
    await page.goto('/dashboard');
    await expect(page.locator('text=Resolved').first()).toBeVisible();
  });
});
