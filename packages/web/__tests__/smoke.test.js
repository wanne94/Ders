describe('Web App Smoke Test', () => {
  test('environment is set up correctly', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('basic assertion works', () => {
    expect(1 + 1).toBe(2);
  });
});
