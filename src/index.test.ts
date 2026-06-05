import { describe, expect, it } from 'vitest';

describe('sir-forms', () => {
  it('should export main functions', () => {
    const mod = require('../dist/index.js');
    expect(mod).toBeDefined();
  });

  it('should export FormProvider and useForm', () => {
    const mod = require('../dist/index.js');
    expect(mod.FormProvider).toBeDefined();
    expect(mod.useForm).toBeDefined();
  });

  it('should export useServerAction', () => {
    const mod = require('../dist/index.js');
    expect(mod.useServerAction).toBeDefined();
  });

  it('should export useFormSubmit and useField', () => {
    const mod = require('../dist/index.js');
    expect(mod.useFormSubmit).toBeDefined();
    expect(mod.useField).toBeDefined();
  });

  it('should export types', () => {
    const mod = require('../dist/index.js');
    // Types are available at compile time, just check the module loads
    expect(mod).toBeDefined();
  });
});
