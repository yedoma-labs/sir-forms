import { describe, expect, it } from 'vitest';
import * as mod from './index';

describe('sir-forms', () => {
  it('should export main functions', () => {
    expect(mod).toBeDefined();
  });

  it('should export FormProvider and useForm', () => {
    expect(mod.FormProvider).toBeDefined();
    expect(mod.useForm).toBeDefined();
  });

  it('should export useServerAction', () => {
    expect(mod.useServerAction).toBeDefined();
  });

  it('should export useFormSubmit and useField', () => {
    expect(mod.useFormSubmit).toBeDefined();
    expect(mod.useField).toBeDefined();
  });

  it('should export types', () => {
    // Types are available at compile time, just check the module loads
    expect(mod).toBeDefined();
  });
});
