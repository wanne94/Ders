describe('Server Configuration', () => {
  test('can load User model', () => {
    expect(() => require('../models/User')).not.toThrow();
  });

  test('can load Lecture model', () => {
    expect(() => require('../models/Lecture')).not.toThrow();
  });

  test('can load Organization model', () => {
    expect(() => require('../models/Organization')).not.toThrow();
  });
});
