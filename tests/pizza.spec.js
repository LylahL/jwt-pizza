import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});


test('View Profile Page and About Page and Log out', async ({ page }) => {
await page.goto('http://localhost:5173/'); 
await page.getByRole('link', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Email address' }).click();
await page.getByRole('link', { name: 'About' }).click();
await expect(page.getByText('The secret sauce')).toBeVisible();
await expect(page.getByRole('heading', { name: 'Our employees' })).toBeVisible();
await page.getByRole('link', { name: 'History' }).click();
await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
await expect(page.getByText('So you want a piece of the')).toBeVisible();
await page.goto('http://localhost:5173/docs');
await expect(page.getByText('JWT Pizza API')).toBeVisible();
});

test('test for expect statement', async ({ page }) => {
await page.goto('http://localhost:5173/');
await expect(page.getByText('The web\'s best pizza', { exact: true })).toBeVisible();
await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();
await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
await page.getByRole('link', { name: 'Login' }).click();
await expect(page.getByText('Welcome back')).toBeVisible();
});

test('Login as Franchisee and View Fanchise and Create a store and Close a Store', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'f@jwt.com', password: 'franchisee' };
    const loginRes = { user: { id: 3, name: 'franchisee', email: 'f@jwt.com', roles: [{ role: "diner" }, { objectId: 1, role: "franchisee" }], token: 'abcdef' }};
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/franchise/3', async (route) => {
    const loginRes = [
      {
        "id": 3,
        "name": "franchisee",
        "admins": [
          {
            "id": 3,
            "name": "franchisee",
            "email": "f@jwt.com"
          }
        ],
        "stores": [{
          "id": 3,
          "name": "franchisee",
          "totalRevenue": 0
        }]
      }
    ]
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loginRes });
  });

  //create a new franchise store
  await page.route('*/**/api/franchise/3/store', async (route) => {
    const loginReq = {"franchiseId": 3, "name":"franchisee"};
    const loginRes = {
      "id": 3,
      "franchiseId": 3,
      "name": "franchisee"
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/franchise/3/store/3', async (route) => {
    const loginRes = {
      "message": "store deleted"
    };
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: loginRes });
  });


await page.goto('http://localhost:5173/');

await page.getByRole('link', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Email address' }).click();
await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
await page.getByRole('textbox', { name: 'Password' }).click();
await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
await page.getByRole('button', { name: 'Login' }).click();
await page.getByLabel('Global').getByRole('link', { name: 'franchise' }).click();
await page.getByRole('button', { name: 'Create store' }).click();
await expect(page.getByText('Create store')).toBeVisible();
await page.getByRole('textbox', { name: 'store name' }).click();
await page.getByRole('textbox', { name: 'store name' }).fill('franchisee');
await page.getByRole('button', { name: 'Create' }).click();
await page.getByRole('row', { name: 'franchisee 0 ₿ Close' }).getByRole('button').click();
await expect(page.getByText('Sorry to see you go')).toBeVisible();
await page.getByRole('button', { name: 'Close' }).click();
await expect(page.getByText('franchisee')).toBeVisible();

});

test('Login As Admin and Create Franchise for Franchisee and Close Franchise for Franchisee', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByText('Keep the dough rolling and')).toBeVisible();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('franchise');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');
  await expect(page.getByText('Create franchise', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('row', { name: 'franchise pizza franchisee' }).getByRole('button')).toBeVisible();
  await page.getByRole('row', { name: 'franchise pizza franchisee' }).getByRole('button').click();
  await expect(page.getByRole('main').locator('div').nth(3)).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
});

test('register and see dinerDashboard and logout', async ({ page }) => {
await page.goto('http://localhost:5173/');

await page.getByRole('link', { name: 'Register' }).click();
await page.getByRole('textbox', { name: 'Full name' }).click();
await page.getByRole('textbox', { name: 'Full name' }).fill('newUser');
await page.getByRole('textbox', { name: 'Email address' }).click();
await page.getByRole('textbox', { name: 'Email address' }).fill('new@jwt.com');
await page.getByRole('textbox', { name: 'Password' }).click();
await page.getByRole('textbox', { name: 'Password' }).fill('newuser');
await expect(page.getByText('Welcome to the party')).toBeVisible();
await expect(page.getByRole('link', { name: 'register', exact: true })).toBeVisible();
await page.getByRole('button', { name: 'Register' }).click();
await page.getByRole('link', { name: 'n', exact: true }).click();
await expect(page.getByText('Your pizza kitchen')).toBeVisible();
await expect(page.getByRole('link', { name: 'diner-dashboard' })).toBeVisible();
await expect(page.getByText('How have you lived this long')).toBeVisible();
await page.getByRole('link', { name: 'Buy one' }).click();
await expect(page.getByText('Awesome is a click away')).toBeVisible();
await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
await page.getByRole('link', { name: 'Logout' }).click();
await expect(page.getByText('The web\'s best pizza', { exact: true })).toBeVisible();
await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

});